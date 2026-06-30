package com.example.redmine.project.dto;

import jakarta.validation.constraints.NotBlank;

public record ProjectRequest(
        @NotBlank String key,
        @NotBlank String name,
        String description) {
}
