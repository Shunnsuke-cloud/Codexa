package com.codexa.dto.reports;

import java.util.List;

public record DashboardSummaryResponse(
                Integer totalStudyTime,
                Integer studyDays,
                List<TopTechnologyDto> topTechnologies
) {
        public DashboardSummaryResponse(Integer totalStudyTime) {
                this(totalStudyTime, 0, List.of());
        }
}
