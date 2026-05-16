package com.codexa.dto.studylog;

import java.time.LocalDateTime;

import com.codexa.entity.StudyLog;

public record StudyLogResponse(
        Long id,
        String title,
        String content,
        Integer studyTime,
        String technology,
        LocalDateTime createdAt) {

    public static StudyLogResponse from(StudyLog studyLog) {
        return new StudyLogResponse(
                studyLog.getId(),
                studyLog.getTitle(),
                studyLog.getContent(),
                studyLog.getStudyTime(),
                studyLog.getTechnology(),
                studyLog.getCreatedAt());
    }
}
