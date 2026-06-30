package com.example.redmine.notification;

import com.example.redmine.auth.CurrentUser;
import com.example.redmine.notification.dto.NotificationDto;
import com.example.redmine.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationDto> list(@CurrentUser User me) {
        return notificationService.list(me);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(@CurrentUser User me) {
        return Map.of("count", notificationService.unreadCount(me));
    }

    @PostMapping("/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markRead(@PathVariable Long id, @CurrentUser User me) {
        notificationService.markRead(id, me);
    }

    @PostMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAllRead(@CurrentUser User me) {
        notificationService.markAllRead(me);
    }
}
