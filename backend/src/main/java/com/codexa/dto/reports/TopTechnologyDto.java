package com.codexa.dto.reports;

public record TopTechnologyDto(
        String technology,
        Integer totalTime,
        Integer count
) {
}
