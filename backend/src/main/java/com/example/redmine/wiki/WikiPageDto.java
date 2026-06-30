package com.example.redmine.wiki;

import java.time.LocalDateTime;

public record WikiPageDto(
        Long id,
        Long projectId,
        String slug,
        String title,
        String content,
        String updatedByName,
        LocalDateTime updatedAt) {

    public static WikiPageDto from(WikiPage page) {
        String updatedByName = null;
        if (page.getUpdatedBy() != null) {
            updatedByName = page.getUpdatedBy().getDisplayName() != null
                    ? page.getUpdatedBy().getDisplayName()
                    : page.getUpdatedBy().getUsername();
        }
        return new WikiPageDto(
                page.getId(),
                page.getProject().getId(),
                page.getSlug(),
                page.getTitle(),
                page.getContent(),
                updatedByName,
                page.getUpdatedAt());
    }
}
