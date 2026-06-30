package com.example.redmine.issue.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record IssueRequest(
        @NotNull Long projectId,
        @NotBlank String subject,
        String description,
        String tracker,
        String status,
        String priority,
        Long assigneeId,
        Long milestoneId,
        LocalDate startDate,
        LocalDate dueDate,
        Integer progress) {
}
