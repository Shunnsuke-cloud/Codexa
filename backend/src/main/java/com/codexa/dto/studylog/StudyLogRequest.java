package com.codexa.dto.studylog;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StudyLogRequest(
        @NotBlank(message = "title is required") String title,
        @NotBlank(message = "content is required") String content,
        @Min(value = 1, message = "studyTime must be at least 1") Integer studyTime,
        @NotBlank(message = "technology is required") @Size(max = 120, message = "technology must be 120 characters or less") String technology) {
}
