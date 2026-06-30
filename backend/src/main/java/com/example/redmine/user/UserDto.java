package com.example.redmine.user;

public record UserDto(Long id, String username, String displayName, Role role) {
    public static UserDto from(User user) {
        if (user == null) {
            return null;
        }
        return new UserDto(user.getId(), user.getUsername(), user.getDisplayName(), user.getRole());
    }
}
