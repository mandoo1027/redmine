package com.example.redmine.comment;

import com.example.redmine.comment.dto.CommentDto;
import com.example.redmine.common.ForbiddenException;
import com.example.redmine.common.NotFoundException;
import com.example.redmine.issue.Issue;
import com.example.redmine.issue.IssueRepository;
import com.example.redmine.notification.NotificationService;
import com.example.redmine.user.Role;
import com.example.redmine.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final IssueRepository issueRepository;
    private final NotificationService notificationService;

    public CommentService(CommentRepository commentRepository,
                          IssueRepository issueRepository,
                          NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.issueRepository = issueRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<CommentDto> list(Long issueId) {
        return commentRepository.findByIssueIdOrderByCreatedAtAsc(issueId)
                .stream().map(CommentDto::from).toList();
    }

    public CommentDto create(Long issueId, String content, User author) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new NotFoundException("Issue not found: " + issueId));
        Comment comment = commentRepository.save(new Comment(issue, author, content));

        // 내 글에 내가 댓글 단 경우가 아니면 등록자에게 알림.
        User reporter = issue.getReporter();
        if (reporter != null && !reporter.getId().equals(author.getId())) {
            notificationService.notifyComment(reporter, issue, displayName(author));
        }
        return CommentDto.from(comment);
    }

    public void delete(Long id, User me) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("댓글을 찾을 수 없습니다."));
        boolean isAuthor = comment.getAuthor() != null
                && comment.getAuthor().getId().equals(me.getId());
        boolean isAdmin = me.getRole() == Role.ADMIN;
        if (!isAuthor && !isAdmin) {
            throw new ForbiddenException("본인 또는 관리자만 댓글을 삭제할 수 있습니다.");
        }
        commentRepository.delete(comment);
    }

    public void deleteAllForIssue(Long issueId) {
        commentRepository.deleteAll(commentRepository.findByIssueIdOrderByCreatedAtAsc(issueId));
    }

    private String displayName(User user) {
        return user.getDisplayName() != null ? user.getDisplayName() : user.getUsername();
    }
}
