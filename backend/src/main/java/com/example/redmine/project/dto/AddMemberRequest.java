package com.example.redmine.project.dto;

import jakarta.validation.constraints.NotNull;

public record AddMemberRequest(
        @NotNull Long userId,
        String role) {
}
