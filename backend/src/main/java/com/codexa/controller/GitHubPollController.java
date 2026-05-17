package com.codexa.controller;

import com.codexa.service.GitHubPollService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/github")
@RequiredArgsConstructor
public class GitHubPollController {

    private final GitHubPollService pollService;

    @PostMapping("/poll")
    public ResponseEntity<?> pollNow() {
        pollService.pollOnce();
        return ResponseEntity.ok().body(java.util.Map.of("status", "started"));
    }
}
