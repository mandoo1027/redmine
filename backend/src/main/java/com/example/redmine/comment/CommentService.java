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

import java.util.HashSet;
import java.util.List;
import java.util.Set;

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

        // 이해당사자(담당자 + 등록자)에게 댓글 알림.
        // - 본인(댓글 작성자)에게는 보내지 않음
        // - 담당자와 등록자가 같은 사람이면 한 번만 보냄
        Set<Long> notified = new HashSet<>();
        notifyStakeholder(issue.getAssignee(), issue, author, notified);
        notifyStakeholder(issue.getReporter(), issue, author, notified);
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

    // 대상이 있고, 댓글 작성자 본인이 아니며, 아직 알림을 보내지 않은 경우에만 발송.
    private void notifyStakeholder(User recipient, Issue issue, User author, Set<Long> notified) {
        if (recipient == null || recipient.getId() == null) {
            return;
        }
        if (recipient.getId().equals(author.getId())) {
            return;
        }
        if (!notified.add(recipient.getId())) {
            return;
        }
        notificationService.notifyComment(recipient, issue, displayName(author));
    }

    private String displayName(User user) {
        return user.getDisplayName() != null ? user.getDisplayName() : user.getUsername();
    }
}
