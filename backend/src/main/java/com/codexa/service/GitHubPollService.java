package com.codexa.service;

import com.codexa.entity.ExternalCommit;
import com.codexa.repository.ExternalCommitRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GitHubPollService {
    private static final Logger logger = LoggerFactory.getLogger(GitHubPollService.class);

    private final ExternalCommitRepository externalCommitRepository;
    private final RestTemplate restTemplate;

    @Value("${GITHUB_TOKEN:}")
    private String githubToken;

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

    // run every hour
    @Scheduled(cron = "0 0 * * * *")
    public void scheduledPoll() {
        try {
            pollOnce();
        } catch (Exception e) {
            logger.error("GitHub polling failed", e);
        }
    }

    @Transactional
    public void pollOnce() {
        if (githubToken == null || githubToken.isBlank()) {
            logger.info("GITHUB_TOKEN not configured; skipping poll");
            return;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(githubToken);
        headers.set("User-Agent", "Codexa-App");
        HttpEntity<Void> req = new HttpEntity<>(headers);

        String reposUrl = "https://api.github.com/user/repos?per_page=100";
        try {
            ResponseEntity<List> reposRes = restTemplate.exchange(reposUrl, org.springframework.http.HttpMethod.GET, req, List.class);
            List<?> repos = reposRes.getBody();
            if (repos == null) return;

            OffsetDateTime since = OffsetDateTime.now(ZoneOffset.UTC).minusDays(7);
            String sinceStr = ISO.format(since);

            for (Object robj : repos) {
                if (!(robj instanceof java.util.Map)) continue;
                java.util.Map repo = (java.util.Map) robj;
                String fullName = repo.get("full_name") == null ? null : repo.get("full_name").toString();
                if (fullName == null) continue;

                String commitsUrl = String.format("https://api.github.com/repos/%s/commits?since=%s&per_page=100", fullName, sinceStr);
                try {
                    ResponseEntity<List> commitsRes = restTemplate.exchange(commitsUrl, org.springframework.http.HttpMethod.GET, req, List.class);
                    List<?> commits = commitsRes.getBody();
                    if (commits == null) continue;
                    for (Object cobj : commits) {
                        if (!(cobj instanceof java.util.Map)) continue;
                        java.util.Map cm = (java.util.Map) cobj;
                        String sha = cm.get("sha") == null ? null : cm.get("sha").toString();
                        if (sha == null) continue;
                        if (externalCommitRepository.findByExternalId(sha).isPresent()) continue;

                        String message = null;
                        String author = null;
                        OffsetDateTime committedAt = OffsetDateTime.now(ZoneOffset.UTC);
                        Object commitObj = cm.get("commit");
                        if (commitObj instanceof java.util.Map) {
                            java.util.Map commitMap = (java.util.Map) commitObj;
                            Object committer = commitMap.get("committer");
                            if (committer instanceof java.util.Map) {
                                Object date = ((java.util.Map) committer).get("date");
                                if (date != null) {
                                    try {
                                        committedAt = OffsetDateTime.parse(date.toString());
                                    } catch (Exception ex) {
                                        // ignore parse error
                                    }
                                }
                            }
                            Object msg = commitMap.get("message");
                            if (msg != null) message = msg.toString();
                        }

                        Object authorObj = cm.get("author");
                        if (authorObj instanceof java.util.Map) {
                            Object login = ((java.util.Map) authorObj).get("login");
                            if (login != null) author = login.toString();
                        }

                        ExternalCommit ec = new ExternalCommit();
                        ec.setRepoName(fullName);
                        ec.setExternalId(sha);
                        ec.setAuthor(author);
                        ec.setMessage(message);
                        ec.setCommittedAt(committedAt);
                        try {
                            externalCommitRepository.save(ec);
                        } catch (Exception ex) {
                            // unique constraint race or other DB issue: log and continue
                            logger.warn("Failed to save external commit {}: {}", sha, ex.getMessage());
                        }
                    }
                } catch (Exception e) {
                    logger.warn("Failed to fetch commits for {}: {}", fullName, e.getMessage());
                }
            }

        } catch (Exception e) {
            logger.error("Failed to list user repos", e);
        }
    }
}
