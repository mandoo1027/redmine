package com.example.redmine.milestone;

import java.time.LocalDate;

public record MilestoneDto(
        Long id,
        Long projectId,
        String name,
        String description,
        LocalDate dueDate) {

    public static MilestoneDto from(Milestone milestone) {
        return new MilestoneDto(
                milestone.getId(),
                milestone.getProject().getId(),
                milestone.getName(),
                milestone.getDescription(),
                milestone.getDueDate());
    }
}
