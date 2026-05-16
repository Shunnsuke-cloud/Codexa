package com.codexa.service;

import java.util.List;

import com.codexa.dto.studylog.StudyLogRequest;
import com.codexa.dto.studylog.StudyLogResponse;

public interface StudyLogService {

    List<StudyLogResponse> findAllForCurrentUser();

    StudyLogResponse create(StudyLogRequest request);

    StudyLogResponse update(Long id, StudyLogRequest request);

    void delete(Long id);
}
