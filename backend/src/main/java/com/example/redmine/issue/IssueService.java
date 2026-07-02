package com.example.redmine.issue;

import com.example.redmine.attachment.AttachmentService;
import com.example.redmine.comment.CommentService;
import com.example.redmine.common.NotFoundException;
import com.example.redmine.issue.dto.IssueDto;
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
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final MilestoneRepository milestoneRepository;
    private final AttachmentService attachmentService;
    private final CommentService commentService;
    private final NotificationService notificationService;

    public IssueService(IssueRepository issueRepository,
                        ProjectRepository projectRepository,
                        UserRepository userRepository,
                        MilestoneRepository milestoneRepository,
                        AttachmentService attachmentService,
                        CommentService commentService,
                        NotificationService notificationService) {
        this.issueRepository = issueRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.milestoneRepository = milestoneRepository;
        this.attachmentService = attachmentService;
        this.commentService = commentService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<IssueDto> list(Long projectId, IssueStatus status, IssuePriority priority,
                               TrackerType tracker, Long assigneeId) {
        Specification<Issue> spec = Specification
                .where(IssueSpecifications.projectId(projectId))
                .and(IssueSpecifications.status(status))
                .and(IssueSpecifications.priority(priority))
                .and(IssueSpecifications.tracker(tracker))
                .and(IssueSpecifications.assigneeId(assigneeId));
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

    public void delete(Long id) {
        Issue issue = findIssue(id);
        attachmentService.deleteAllForParent("ISSUE", id);
        commentService.deleteAllForIssue(id);
        issueRepository.delete(issue);
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
            issue.setProgress(Math.max(0, Math.min(100, request.progress())));
        }
    }

    private Issue findIssue(Long id) {
        return issueRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Issue not found: " + id));
    }
}
