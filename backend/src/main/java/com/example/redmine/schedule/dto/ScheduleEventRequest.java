package com.example.redmine.schedule.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ScheduleEventRequest(
        @NotBlank String title,
        @NotNull LocalDate startDate,
        LocalDate endDate,
        String timeText,
        String color,
        String description
) {
}
