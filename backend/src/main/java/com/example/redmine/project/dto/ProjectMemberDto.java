package com.example.redmine.project.dto;

import com.example.redmine.project.ProjectMember;

public record ProjectMemberDto(
        Long id,
        Long userId,
        String username,
        String displayName,
        String role) {

    public static ProjectMemberDto from(ProjectMember member) {
        return new ProjectMemberDto(
                member.getId(),
                member.getUser().getId(),
                member.getUser().getUsername(),
                member.getUser().getDisplayName(),
                member.getRole());
    }
}
