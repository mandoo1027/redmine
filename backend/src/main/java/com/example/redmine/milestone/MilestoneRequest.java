package com.example.redmine.milestone;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record MilestoneRequest(
        @NotBlank String name,
        String description,
        LocalDate dueDate) {
}
