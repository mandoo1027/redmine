package com.example.redmine.issue.dto;

import com.example.redmine.issue.Issue;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record IssueDto(
        Long id,
        Long projectId,
        String projectKey,
        String subject,
        String description,
        String tracker,
        String status,
        String priority,
        Long assigneeId,
        String assigneeName,
        Long reporterId,
        String reporterName,
        Long milestoneId,
        String milestoneName,
        LocalDate startDate,
        LocalDate dueDate,
        Integer progress,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

    public static IssueDto from(Issue issue) {
        return new IssueDto(
                issue.getId(),
                issue.getProject().getId(),
                issue.getProject().getKey(),
                issue.getSubject(),
                issue.getDescription(),
                issue.getTracker().name(),
                issue.getStatus().name(),
                issue.getPriority().name(),
                issue.getAssignee() != null ? issue.getAssignee().getId() : null,
                issue.getAssignee() != null
                        ? (issue.getAssignee().getDisplayName() != null
                            ? issue.getAssignee().getDisplayName()
                            : issue.getAssignee().getUsername())
                        : null,
                issue.getReporter() != null ? issue.getReporter().getId() : null,
                issue.getReporter() != null
                        ? (issue.getReporter().getDisplayName() != null
                            ? issue.getReporter().getDisplayName()
                            : issue.getReporter().getUsername())
                        : null,
                issue.getMilestone() != null ? issue.getMilestone().getId() : null,
                issue.getMilestone() != null ? issue.getMilestone().getName() : null,
                issue.getStartDate(),
                issue.getDueDate(),
                issue.getProgress(),
                issue.getCreatedAt(),
                issue.getUpdatedAt());
    }
}
