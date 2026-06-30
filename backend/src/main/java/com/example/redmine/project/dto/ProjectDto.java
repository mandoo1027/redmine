package com.example.redmine.project.dto;

import com.example.redmine.project.Project;

import java.time.LocalDateTime;

public record ProjectDto(
        Long id,
        String key,
        String name,
        String description,
        LocalDateTime createdAt) {

    public static ProjectDto from(Project project) {
        return new ProjectDto(
                project.getId(),
                project.getKey(),
                project.getName(),
                project.getDescription(),
                project.getCreatedAt());
    }
}
