package com.example.redmine.notification;

import com.example.redmine.common.ForbiddenException;
import com.example.redmine.common.NotFoundException;
import com.example.redmine.issue.Issue;
import com.example.redmine.notification.dto.NotificationDto;
import com.example.redmine.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // 내 글(이슈)에 댓글이 달렸을 때 등록자(reporter)에게 알림.
    public void notifyComment(User reporter, Issue issue, String authorName) {
        String message = authorName + "님이 회원님의 이슈 '" + issue.getSubject() + "'에 댓글을 남겼습니다.";
        create(reporter, NotificationType.COMMENT, issue, message);
    }

    // 담당자가 나로 지정/변경되었을 때 알림.
    public void notifyAssigned(User assignee, Issue issue, String actorName) {
        String message = actorName + "님이 회원님을 이슈 '" + issue.getSubject() + "'의 담당자로 지정했습니다.";
        create(assignee, NotificationType.ASSIGNED, issue, message);
    }

    private void create(User recipient, NotificationType type, Issue issue, String message) {
        if (recipient == null) {
            return;
        }
        Long projectId = issue.getProject() != null ? issue.getProject().getId() : null;
        Notification notification = new Notification(recipient, type, message, issue.getId(), projectId);
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> list(User me) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(me.getId())
                .stream().map(NotificationDto::from).toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount(User me) {
        return notificationRepository.countByRecipientIdAndReadFalse(me.getId());
    }

    public void markRead(Long id, User me) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("알림을 찾을 수 없습니다."));
        if (!notification.getRecipient().getId().equals(me.getId())) {
            throw new ForbiddenException("본인의 알림만 처리할 수 있습니다.");
        }
        notification.setRead(true);
    }

    public void markAllRead(User me) {
        List<Notification> unread = notificationRepository.findByRecipientIdAndReadFalse(me.getId());
        for (Notification n : unread) {
            n.setRead(true);
        }
    }
}
