package com.example.redmine.comment.dto;

import com.example.redmine.comment.Comment;

import java.time.LocalDateTime;

public record CommentDto(
        Long id,
        Long issueId,
        Long authorId,
        String authorName,
        String content,
        LocalDateTime createdAt) {

    public static CommentDto from(Comment c) {
        Long authorId = null;
        String authorName = null;
        if (c.getAuthor() != null) {
            authorId = c.getAuthor().getId();
            authorName = c.getAuthor().getDisplayName() != null
                    ? c.getAuthor().getDisplayName()
                    : c.getAuthor().getUsername();
        }
        return new CommentDto(
                c.getId(),
                c.getIssue().getId(),
                authorId,
                authorName,
                c.getContent(),
                c.getCreatedAt());
    }
}
