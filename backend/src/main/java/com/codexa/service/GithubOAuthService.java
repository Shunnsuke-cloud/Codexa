package com.codexa.service;

import java.net.URI;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GithubOAuthService {

    private final RestTemplate restTemplate;

    @Value("${GITHUB_CLIENT_ID:}")
    private String clientId;

    @Value("${GITHUB_CLIENT_SECRET:}")
    private String clientSecret;

    @Value("${GITHUB_OAUTH_CALLBACK:http://localhost:8080/api/github/oauth/callback}")
    private String redirectUri;

    public GithubOAuthService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String exchangeCodeForAccessToken(String code, String state) {
        String url = "https://github.com/login/oauth/access_token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(java.util.List.of(MediaType.APPLICATION_JSON));

        Map<String, String> body = Map.of(
                "client_id", clientId,
                "client_secret", clientSecret,
                "code", code,
                "redirect_uri", redirectUri,
                "state", state == null ? "" : state
        );

        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

        @SuppressWarnings("unchecked")
        Map<String, Object> resp = restTemplate.postForObject(URI.create(url), request, Map.class);
        if (resp == null) return null;
        Object token = resp.get("access_token");
        return token == null ? null : token.toString();
    }

    public String fetchGitHubLogin(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setAccept(java.util.List.of(MediaType.APPLICATION_JSON));

        HttpEntity<Void> request = new HttpEntity<>(headers);
        @SuppressWarnings("unchecked")
        Map<String, Object> resp = restTemplate.exchange(
                URI.create("https://api.github.com/user"),
                org.springframework.http.HttpMethod.GET,
                request,
                Map.class
        ).getBody();

        if (resp == null) {
            return null;
        }

        Object login = resp.get("login");
        return login == null ? null : login.toString();
    }

    public java.util.List<Map<String, Object>> fetchGitHubRepos(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setAccept(java.util.List.of(MediaType.APPLICATION_JSON));

        HttpEntity<Void> request = new HttpEntity<>(headers);
        @SuppressWarnings("unchecked")
        java.util.List<Map<String, Object>> resp = restTemplate.exchange(
                URI.create("https://api.github.com/user/repos?per_page=20&sort=updated"),
                org.springframework.http.HttpMethod.GET,
                request,
                java.util.List.class
        ).getBody();

        return resp == null ? java.util.List.of() : resp;
    }

    public java.util.List<Map<String, Object>> fetchGitHubCommits(String accessToken, String repoFullName) {
        if (repoFullName == null || repoFullName.isBlank()) {
            return java.util.List.of();
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setAccept(java.util.List.of(MediaType.APPLICATION_JSON));

        HttpEntity<Void> request = new HttpEntity<>(headers);
        String url = "https://api.github.com/repos/" + repoFullName + "/commits?per_page=10";

        @SuppressWarnings("unchecked")
        java.util.List<Map<String, Object>> resp = restTemplate.exchange(
                URI.create(url),
                org.springframework.http.HttpMethod.GET,
                request,
                java.util.List.class
        ).getBody();

        return resp == null ? java.util.List.of() : resp;
    }
}
