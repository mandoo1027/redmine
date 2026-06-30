package com.example.redmine.user.dto;

import com.example.redmine.user.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(
        @NotBlank @Size(min = 3, max = 30) String username,
        @NotBlank @Size(min = 4) String password,
        String displayName,
        Role role) {
}
