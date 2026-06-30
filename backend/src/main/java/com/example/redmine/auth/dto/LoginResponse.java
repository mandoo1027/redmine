package com.example.redmine.auth.dto;

import com.example.redmine.user.UserDto;

public record LoginResponse(String token, UserDto user) {
}
