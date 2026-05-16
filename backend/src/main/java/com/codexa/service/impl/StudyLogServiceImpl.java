package com.codexa.service.impl;

import java.util.List;

import com.codexa.dto.studylog.StudyLogRequest;
import com.codexa.dto.studylog.StudyLogResponse;
import com.codexa.entity.StudyLog;
import com.codexa.entity.User;
import com.codexa.repository.StudyLogRepository;
import com.codexa.repository.UserRepository;
import com.codexa.service.StudyLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class StudyLogServiceImpl implements StudyLogService {

    private final StudyLogRepository studyLogRepository;
    private final UserRepository userRepository;

    @Override
    public List<StudyLogResponse> findAllForCurrentUser() {
        String email = currentUserEmail();
        return studyLogRepository.findByUserEmailOrderByCreatedAtDesc(email)
                .stream()
                .map(StudyLogResponse::from)
                .toList();
    }

    @Override
    public StudyLogResponse create(StudyLogRequest request) {
        User user = currentUser();
        StudyLog studyLog = StudyLog.builder()
                .user(user)
                .title(request.title())
                .content(request.content())
                .studyTime(request.studyTime())
                .technology(request.technology())
                .build();

        return StudyLogResponse.from(studyLogRepository.save(studyLog));
    }

    @Override
    public StudyLogResponse update(Long id, StudyLogRequest request) {
        StudyLog studyLog = studyLogRepository.findByIdAndUserEmail(id, currentUserEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "study log not found"));

        studyLog.setTitle(request.title());
        studyLog.setContent(request.content());
        studyLog.setStudyTime(request.studyTime());
        studyLog.setTechnology(request.technology());

        return StudyLogResponse.from(studyLogRepository.save(studyLog));
    }

    @Override
    public void delete(Long id) {
        StudyLog studyLog = studyLogRepository.findByIdAndUserEmail(id, currentUserEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "study log not found"));
        studyLogRepository.delete(studyLog);
    }

    private User currentUser() {
        String email = currentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "user not found"));
    }

    private String currentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "unauthenticated");
        }
        return authentication.getName().toLowerCase();
    }
}
