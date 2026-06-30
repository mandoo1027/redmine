package com.example.redmine.notification.dto;

import com.example.redmine.notification.Notification;

import java.time.LocalDateTime;

public record NotificationDto(
        Long id,
        String type,
        String message,
        Long issueId,
        Long projectId,
        boolean read,
        LocalDateTime createdAt) {

    public static NotificationDto from(Notification n) {
        return new NotificationDto(
                n.getId(),
                n.getType().name(),
                n.getMessage(),
                n.getIssueId(),
                n.getProjectId(),
                n.isRead(),
                n.getCreatedAt());
    }
}
