package com.example.redmine.user.dto;

import com.example.redmine.user.Role;

public record UpdateUserRequest(
        String displayName,
        Role role,
        String password) {
}
