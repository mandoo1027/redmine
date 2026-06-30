package com.example.redmine.attachment.dto;

import com.example.redmine.attachment.Attachment;

import java.time.LocalDateTime;

public record AttachmentDto(
        Long id,
        String originalName,
        String contentType,
        long fileSize,
        String uploadedByName,
        String url,
        LocalDateTime createdAt) {

    public static AttachmentDto from(Attachment a) {
        String uploadedByName = null;
        if (a.getUploadedBy() != null) {
            uploadedByName = a.getUploadedBy().getDisplayName() != null
                    ? a.getUploadedBy().getDisplayName()
                    : a.getUploadedBy().getUsername();
        }
        return new AttachmentDto(
                a.getId(),
                a.getOriginalName(),
                a.getContentType(),
                a.getFileSize(),
                uploadedByName,
                "/attachments/" + a.getId() + "/download",
                a.getCreatedAt());
    }
}
