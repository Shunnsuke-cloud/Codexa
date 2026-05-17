package com.codexa.controller;

import java.net.URI;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.codexa.entity.GithubAccount;
import com.codexa.entity.User;
import com.codexa.repository.GithubAccountRepository;
import com.codexa.repository.UserRepository;
import com.codexa.service.GithubOAuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequiredArgsConstructor
@RequestMapping("/api/github/oauth")
public class GithubOAuthController {

    private final GithubOAuthService oauthService;
    private final GithubAccountRepository accountRepository;
    private final UserRepository userRepository;

    @GetMapping("/start")
    public ResponseEntity<Object> start(HttpServletRequest req) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "unauthenticated"));
        }

        String email = auth.getName();
        Optional<User> u = userRepository.findByEmail(email);
        if (u.isEmpty()) return ResponseEntity.status(403).body(Map.of("error", "user_not_found"));

        String state = UUID.randomUUID().toString();

        // create or update account record with pending state
        GithubAccount account = accountRepository.findByUserId(u.get().getId()).orElse(GithubAccount.builder().user(u.get()).build());
        account.setState(state);
        accountRepository.save(account);

        String clientId = System.getenv().getOrDefault("GITHUB_CLIENT_ID", "");
        String redirect = System.getenv().getOrDefault("GITHUB_OAUTH_CALLBACK", "http://localhost:8080/api/github/oauth/callback");
        String scope = "repo"; // read access to repos; adjust if needed
        String url = String.format("https://github.com/login/oauth/authorize?client_id=%s&redirect_uri=%s&scope=%s&state=%s", clientId, redirect, scope, state);

        return ResponseEntity.ok(Map.of("url", url));
    }

    @GetMapping("/callback")
    public ResponseEntity<Void> callback(@RequestParam(name = "code") String code,
                                         @RequestParam(name = "state", required = false) String state) {

        if (state == null) {
            return ResponseEntity.badRequest().build();
        }

        Optional<GithubAccount> acctOpt = accountRepository.findByState(state);
        if (acctOpt.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        String token = oauthService.exchangeCodeForAccessToken(code, state);
        if (token == null) {
            return ResponseEntity.status(500).build();
        }

        GithubAccount acct = acctOpt.get();
        acct.setAccessToken(token);
        acct.setGithubLogin(oauthService.fetchGitHubLogin(token));
        acct.setState(null);
        accountRepository.save(acct);

        // redirect back to frontend operations page
        return ResponseEntity.status(302).location(URI.create("http://localhost:3000/operations?github_connected=1")).build();
    }

    @GetMapping("/status")
    public ResponseEntity<Object> status(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("connected", false));
        }
        String email = authentication.getName();
        Optional<User> u = userRepository.findByEmail(email);
        if (u.isEmpty()) return ResponseEntity.status(404).body(Map.of("connected", false));

        Optional<GithubAccount> acctOpt = accountRepository.findByUserId(u.get().getId());
        if (acctOpt.isEmpty() || acctOpt.get().getAccessToken() == null) {
            return ResponseEntity.ok(Map.of("connected", false));
        }

        GithubAccount acct = acctOpt.get();
        return ResponseEntity.ok(Map.of(
                "connected", true,
            "githubLogin", acct.getGithubLogin() == null ? "" : acct.getGithubLogin(),
                "scope", acct.getScope() == null ? "" : acct.getScope(),
                "createdAt", acct.getCreatedAt() == null ? "" : acct.getCreatedAt().toString()
        ));
    }

    @GetMapping("/repos")
    public ResponseEntity<Object> repos(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("connected", false, "repos", java.util.List.of()));
        }

        String email = authentication.getName();
        Optional<User> u = userRepository.findByEmail(email);
        if (u.isEmpty()) return ResponseEntity.status(404).body(Map.of("connected", false, "repos", java.util.List.of()));

        Optional<GithubAccount> acctOpt = accountRepository.findByUserId(u.get().getId());
        if (acctOpt.isEmpty() || acctOpt.get().getAccessToken() == null) {
            return ResponseEntity.ok(Map.of("connected", false, "repos", java.util.List.of()));
        }

        GithubAccount acct = acctOpt.get();
        var repos = oauthService.fetchGitHubRepos(acct.getAccessToken()).stream()
                .map(repo -> Map.of(
                        "name", String.valueOf(repo.getOrDefault("name", "")),
                        "fullName", String.valueOf(repo.getOrDefault("full_name", "")),
                        "htmlUrl", String.valueOf(repo.getOrDefault("html_url", "")),
                        "description", String.valueOf(repo.getOrDefault("description", "")),
                        "pushedAt", String.valueOf(repo.getOrDefault("pushed_at", "")),
                        "private", Boolean.TRUE.equals(repo.get("private"))
                ))
                .toList();

        return ResponseEntity.ok(Map.of(
                "connected", true,
                "repos", repos
        ));
    }

    @GetMapping("/commits")
    public ResponseEntity<Object> commits(Authentication authentication,
                                          @RequestParam(name = "repo", required = false) String repoFullName) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("connected", false, "commits", java.util.List.of()));
        }

        String email = authentication.getName();
        Optional<User> u = userRepository.findByEmail(email);
        if (u.isEmpty()) return ResponseEntity.status(404).body(Map.of("connected", false, "commits", java.util.List.of()));

        Optional<GithubAccount> acctOpt = accountRepository.findByUserId(u.get().getId());
        if (acctOpt.isEmpty() || acctOpt.get().getAccessToken() == null) {
            return ResponseEntity.ok(Map.of("connected", false, "commits", java.util.List.of()));
        }

        GithubAccount acct = acctOpt.get();
        var commits = oauthService.fetchGitHubCommits(acct.getAccessToken(), repoFullName).stream()
                .map(commit -> {
                    Map<String, Object> commitData = (Map<String, Object>) commit.getOrDefault("commit", Map.of());
                    Map<String, Object> authorData = (Map<String, Object>) commitData.getOrDefault("author", Map.of());
                    String message = String.valueOf(commitData.getOrDefault("message", ""));
                    String sha = String.valueOf(commit.getOrDefault("sha", ""));
                    String htmlUrl = String.valueOf(commit.getOrDefault("html_url", ""));
                    String authorName = String.valueOf(authorData.getOrDefault("name", ""));
                    String date = String.valueOf(authorData.getOrDefault("date", ""));
                    return Map.of(
                            "sha", sha,
                            "message", message,
                            "htmlUrl", htmlUrl,
                            "authorName", authorName,
                            "date", date
                    );
                })
                .toList();

        return ResponseEntity.ok(Map.of(
                "connected", true,
                "commits", commits
        ));
    }
}
