package com.example.redmine.schedule.dto;

import com.example.redmine.schedule.ScheduleEvent;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ScheduleEventDto(
        Long id,
        String title,
        LocalDate startDate,
        LocalDate endDate,
        String timeText,
        String color,
        String description,
        String createdByName,
        boolean pinned,
        String attachmentName,
        int taskTotal,
        int taskDone,
        LocalDateTime createdAt
) {
    public static ScheduleEventDto from(ScheduleEvent e) {
        return from(e, 0, 0);
    }

    public static ScheduleEventDto from(ScheduleEvent e, int taskTotal, int taskDone) {
        return new ScheduleEventDto(
                e.getId(),
                e.getTitle(),
                e.getStartDate(),
                e.getEndDate(),
                e.getTimeText(),
                e.getColor(),
                e.getDescription(),
                e.getCreatedByName(),
                Boolean.TRUE.equals(e.getPinned()),
                e.getAttachmentName(),
                taskTotal,
                taskDone,
                e.getCreatedAt()
        );
    }
}
