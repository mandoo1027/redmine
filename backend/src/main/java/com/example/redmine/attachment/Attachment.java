package com.example.redmine.attachment;

import com.example.redmine.common.BaseEntity;
import com.example.redmine.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "attachments")
public class Attachment extends BaseEntity {

    @Column(name = "parent_type", nullable = false)
    private String parentType;

    @Column(name = "parent_id", nullable = false)
    private Long parentId;

    @Column(name = "stored_name", nullable = false)
    private String storedName;

    @Column(name = "original_name", nullable = false)
    private String originalName;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "file_size", nullable = false)
    private long fileSize;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by_id")
    private User uploadedBy;

    protected Attachment() {
    }

    public Attachment(String parentType, Long parentId, String storedName, String originalName,
                      String contentType, long fileSize, User uploadedBy) {
        this.parentType = parentType;
        this.parentId = parentId;
        this.storedName = storedName;
        this.originalName = originalName;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.uploadedBy = uploadedBy;
    }

    public String getParentType() {
        return parentType;
    }

    public Long getParentId() {
        return parentId;
    }

    public String getStoredName() {
        return storedName;
    }

    public String getOriginalName() {
        return originalName;
    }

    public String getContentType() {
        return contentType;
    }

    public long getFileSize() {
        return fileSize;
    }

    public User getUploadedBy() {
        return uploadedBy;
    }
}
