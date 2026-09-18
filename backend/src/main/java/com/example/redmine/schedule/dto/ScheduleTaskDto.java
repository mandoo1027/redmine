package com.example.redmine.schedule.dto;

import com.example.redmine.schedule.ScheduleTask;

import java.time.LocalDateTime;

public record ScheduleTaskDto(
        Long id,
        Long eventId,
        String section,
        String title,
        String status,
        Integer sortOrder,
        LocalDateTime updatedAt
) {
    public static ScheduleTaskDto from(ScheduleTask t) {
        return new ScheduleTaskDto(
                t.getId(),
                t.getEventId(),
                t.getSection(),
                t.getTitle(),
                t.getStatus(),
                t.getSortOrder(),
                t.getUpdatedAt()
        );
    }
}
