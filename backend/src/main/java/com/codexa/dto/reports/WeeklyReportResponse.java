package com.codexa.dto.reports;

import java.util.List;

public class WeeklyReportResponse {
    public static class DayEntry {
        public String date;
        public Integer totalTime;

        public DayEntry() {}

        public DayEntry(String date, Integer totalTime) {
            this.date = date;
            this.totalTime = totalTime;
        }
    }

    public List<DayEntry> days;

    public WeeklyReportResponse() {}

    public WeeklyReportResponse(List<DayEntry> days) {
        this.days = days;
    }
}
