package com.codexa.controller;

import com.codexa.dto.reports.DashboardSummaryResponse;
import com.codexa.repository.StudyLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import com.codexa.dto.reports.WeeklyReportResponse;
import org.springframework.web.bind.annotation.GetMapping;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportsController {

    private final StudyLogRepository studyLogRepository;

    @GetMapping("/summary")
    @ResponseStatus(HttpStatus.OK)
    public DashboardSummaryResponse summary() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication == null ? null : authentication.getName();
        if (email == null) {
            return new DashboardSummaryResponse(0);
        }

        Integer total = studyLogRepository.sumStudyTimeByUserEmail(email);
        if (total == null) total = 0;

        Integer days = studyLogRepository.countDistinctStudyDaysByUserEmail(email);
        if (days == null) days = 0;

        var rawTop = studyLogRepository.findTopTechnologiesByUserEmail(email);
        var topList = new java.util.ArrayList<com.codexa.dto.reports.TopTechnologyDto>();
        for (Object[] row : rawTop) {
            String tech = row[0] == null ? "" : row[0].toString();
            Integer totalTime = row[1] == null ? 0 : ((Number) row[1]).intValue();
            Integer cnt = row[2] == null ? 0 : ((Number) row[2]).intValue();
            topList.add(new com.codexa.dto.reports.TopTechnologyDto(tech, totalTime, cnt));
        }

        return new DashboardSummaryResponse(total, days, topList);
    }

    @GetMapping("/weekly")
    public WeeklyReportResponse weekly() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication == null ? null : authentication.getName();
        if (email == null) {
            return new WeeklyReportResponse(new ArrayList<>());
        }

        List<Object[]> rows = studyLogRepository.findWeeklyStudyByUserEmail(email);
        List<WeeklyReportResponse.DayEntry> days = new ArrayList<>();
        DateTimeFormatter fmt = DateTimeFormatter.ISO_LOCAL_DATE;
        // Create map of last 7 days to ensure zero entries appear
        LocalDate today = LocalDate.now();
        java.util.Map<String, Integer> map = new java.util.HashMap<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            map.put(d.format(fmt), 0);
        }

        for (Object[] r : rows) {
            String dateStr = r[0] == null ? null : r[0].toString();
            Integer total = r[1] == null ? 0 : ((Number) r[1]).intValue();
            if (dateStr != null) map.put(dateStr, total);
        }

        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            String k = d.format(fmt);
            days.add(new WeeklyReportResponse.DayEntry(k, map.getOrDefault(k, 0)));
        }

        return new WeeklyReportResponse(days);
    }
}
