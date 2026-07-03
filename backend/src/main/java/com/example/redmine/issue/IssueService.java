package com.example.redmine.issue;

import com.example.redmine.attachment.AttachmentService;
import com.example.redmine.comment.CommentService;
import com.example.redmine.common.NotFoundException;
import com.example.redmine.issue.dto.IssueDto;
import com.example.redmine.issue.dto.IssueLinkDto;
import com.example.redmine.issue.dto.IssueRequest;
import com.example.redmine.milestone.Milestone;
import com.example.redmine.milestone.MilestoneRepository;
import com.example.redmine.notification.NotificationService;
import com.example.redmine.project.Project;
import com.example.redmine.project.ProjectRepository;
import com.example.redmine.user.User;
import com.example.redmine.user.UserRepository;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class IssueService {

    private final IssueRepository issueRepository;
    private final IssueLinkRepository issueLinkRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final MilestoneRepository milestoneRepository;
    private final AttachmentService attachmentService;
    private final CommentService commentService;
    private final NotificationService notificationService;

    public IssueService(IssueRepository issueRepository,
                        IssueLinkRepository issueLinkRepository,
                        ProjectRepository projectRepository,
                        UserRepository userRepository,
                        MilestoneRepository milestoneRepository,
                        AttachmentService attachmentService,
                        CommentService commentService,
                        NotificationService notificationService) {
        this.issueRepository = issueRepository;
        this.issueLinkRepository = issueLinkRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.milestoneRepository = milestoneRepository;
        this.attachmentService = attachmentService;
        this.commentService = commentService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<IssueDto> list(Long projectId, IssueStatus status, IssuePriority priority,
                               TrackerType tracker, Long assigneeId,
                               String subject, String text, String assigneeName) {
        Specification<Issue> spec = Specification
                .where(IssueSpecifications.projectId(projectId))
                .and(IssueSpecifications.status(status))
                .and(IssueSpecifications.priority(priority))
                .and(IssueSpecifications.tracker(tracker))
                .and(IssueSpecifications.assigneeId(assigneeId))
                .and(IssueSpecifications.subjectLike(subject))
                .and(IssueSpecifications.textLike(text))
                .and(IssueSpecifications.assigneeNameLike(assigneeName));
        return issueRepository.findAll(spec).stream().map(IssueDto::summary).toList();
    }

    @Transactional(readOnly = true)
    public List<IssueDto> listByProject(Long projectId) {
        return issueRepository.findByProjectId(projectId).stream().map(IssueDto::summary).toList();
    }

    @Transactional(readOnly = true)
    public IssueDto get(Long id) {
        return IssueDto.from(findIssue(id));
    }

    public IssueDto create(IssueRequest request, User reporter) {
        Project project = projectRepository.findById(request.projectId())
                .orElseThrow(() -> new NotFoundException("Project not found: " + request.projectId()));
        Issue issue = new Issue(project, request.subject());
        issue.setReporter(reporter);
        applyRequest(issue, request);
        Issue saved = issueRepository.save(issue);

        // 생성 시 담당자가 본인이 아닌 다른 사람으로 지정되면 알림.
        User assignee = saved.getAssignee();
        if (assignee != null && (reporter == null || !assignee.getId().equals(reporter.getId()))) {
            notificationService.notifyAssigned(assignee, saved, displayName(reporter));
        }
        return IssueDto.from(saved);
    }

    public IssueDto update(Long id, IssueRequest request, User me) {
        Issue issue = findIssue(id);
        Long oldAssigneeId = issue.getAssignee() != null ? issue.getAssignee().getId() : null;
        issue.setSubject(request.subject());
        applyRequest(issue, request);

        // 담당자가 신규 지정/변경되었고, 본인이 본인을 지정한 것이 아니면 알림.
        User newAssignee = issue.getAssignee();
        if (newAssignee != null
                && !newAssignee.getId().equals(oldAssigneeId)
                && (me == null || !newAssignee.getId().equals(me.getId()))) {
            notificationService.notifyAssigned(newAssignee, issue, displayName(me));
        }
        return IssueDto.from(issue);
    }

    // 목록에서 상태만 가볍게 변경 (설명·해결내용 등 다른 필드는 그대로 유지).
    public IssueDto updateStatus(Long id, IssueStatus status) {
        Issue issue = findIssue(id);
        issue.setStatus(status);
        return IssueDto.from(issue);
    }

    public void delete(Long id) {
        Issue issue = findIssue(id);
        attachmentService.deleteAllForParent("ISSUE", id);
        commentService.deleteAllForIssue(id);
        issueLinkRepository.deleteBySourceIdOrTargetId(id, id);
        issueRepository.delete(issue);
    }

    // ===== 관련 이슈(양방향 링크) =====

    @Transactional(readOnly = true)
    public List<IssueLinkDto> listLinks(Long issueId) {
        findIssue(issueId); // 존재 확인
        return issueLinkRepository.findBySourceIdOrTargetId(issueId, issueId).stream()
                .map(link -> {
                    // 나(issueId)의 상대편 이슈를 반환.
                    Issue other = link.getSource().getId().equals(issueId)
                            ? link.getTarget() : link.getSource();
                    return IssueLinkDto.of(link.getId(), other);
                })
                .toList();
    }

    public IssueLinkDto addLink(Long issueId, Long targetId) {
        if (issueId.equals(targetId)) {
            throw new IllegalArgumentException("자기 자신은 연결할 수 없습니다.");
        }
        Issue source = findIssue(issueId);
        Issue target = findIssue(targetId);
        // 이미 어느 방향으로든 연결돼 있으면 기존 링크 반환(중복 방지).
        if (issueLinkRepository.existsBySourceIdAndTargetId(issueId, targetId)
                || issueLinkRepository.existsBySourceIdAndTargetId(targetId, issueId)) {
            return listLinks(issueId).stream()
                    .filter(l -> l.issueId().equals(targetId))
                    .findFirst()
                    .orElseThrow(() -> new IllegalStateException("링크 조회 실패"));
        }
        IssueLink saved = issueLinkRepository.save(new IssueLink(source, target));
        return IssueLinkDto.of(saved.getId(), target);
    }

    public void deleteLink(Long linkId) {
        if (!issueLinkRepository.existsById(linkId)) {
            throw new NotFoundException("Issue link not found: " + linkId);
        }
        issueLinkRepository.deleteById(linkId);
    }

    private String displayName(User user) {
        if (user == null) {
            return "누군가";
        }
        return user.getDisplayName() != null ? user.getDisplayName() : user.getUsername();
    }

    private void applyRequest(Issue issue, IssueRequest request) {
        issue.setDescription(request.description());
        issue.setResolution(request.resolution());
        if (request.tracker() != null) {
            issue.setTracker(TrackerType.valueOf(request.tracker()));
        }
        if (request.status() != null) {
            issue.setStatus(IssueStatus.valueOf(request.status()));
        }
        if (request.priority() != null) {
            issue.setPriority(IssuePriority.valueOf(request.priority()));
        }
        if (request.assigneeId() != null) {
            User assignee = userRepository.findById(request.assigneeId())
                    .orElseThrow(() -> new NotFoundException("User not found: " + request.assigneeId()));
            issue.setAssignee(assignee);
        } else {
            issue.setAssignee(null);
        }
        if (request.milestoneId() != null) {
            Milestone milestone = milestoneRepository.findById(request.milestoneId())
                    .orElseThrow(() -> new NotFoundException("Milestone not found: " + request.milestoneId()));
            issue.setMilestone(milestone);
        } else {
            issue.setMilestone(null);
        }
        issue.setStartDate(request.startDate());
        issue.setDueDate(request.dueDate());
        if (request.progress() != null) {
            int progress = Math.max(0, Math.min(100, request.progress()));
            issue.setProgress(progress);
            // 진행률 변경 시 상태 자동 전환: 100% → 완료(CLOSED), 그 외 → 진행중(IN_PROGRESS).
            issue.setStatus(progress >= 100 ? IssueStatus.CLOSED : IssueStatus.IN_PROGRESS);
        }
    }

    private Issue findIssue(Long id) {
        return issueRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Issue not found: " + id));
    }
}
