package com.example.redmine.notification;

import com.example.redmine.common.BaseEntity;
import com.example.redmine.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "notifications")
public class Notification extends BaseEntity {

    // 알림을 받는 사용자.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    // 클릭 시 이동할 대상(이슈). 없을 수 있음.
    @Column(name = "issue_id")
    private Long issueId;

    @Column(name = "project_id")
    private Long projectId;

    // read 는 예약어 회피 위해 컬럼명 read_flag 사용.
    @Column(name = "read_flag", nullable = false)
    private boolean read = false;

    protected Notification() {
    }

    public Notification(User recipient, NotificationType type, String message, Long issueId, Long projectId) {
        this.recipient = recipient;
        this.type = type;
        this.message = message;
        this.issueId = issueId;
        this.projectId = projectId;
    }

    public User getRecipient() {
        return recipient;
    }

    public NotificationType getType() {
        return type;
    }

    public String getMessage() {
        return message;
    }

    public Long getIssueId() {
        return issueId;
    }

    public Long getProjectId() {
        return projectId;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }
}
