package com.codexa.controller;

import java.util.List;

import com.codexa.dto.studylog.StudyLogRequest;
import com.codexa.dto.studylog.StudyLogResponse;
import com.codexa.service.StudyLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
public class StudyLogController {

    private final StudyLogService studyLogService;

    @GetMapping
    public List<StudyLogResponse> findAll() {
        return studyLogService.findAllForCurrentUser();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StudyLogResponse create(@Valid @RequestBody StudyLogRequest request) {
        return studyLogService.create(request);
    }

    @PutMapping("/{id}")
    public StudyLogResponse update(@PathVariable Long id, @Valid @RequestBody StudyLogRequest request) {
        return studyLogService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        studyLogService.delete(id);
    }
}
