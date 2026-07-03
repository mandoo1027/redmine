package com.example.redmine.issue;

import com.example.redmine.auth.CurrentUser;
import com.example.redmine.issue.dto.IssueDto;
import com.example.redmine.issue.dto.IssueLinkDto;
import com.example.redmine.issue.dto.IssueRequest;
import com.example.redmine.user.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class IssueController {

    private final IssueService issueService;

    public IssueController(IssueService issueService) {
        this.issueService = issueService;
    }

    @GetMapping("/api/issues")
    public List<IssueDto> list(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) IssueStatus status,
            @RequestParam(required = false) IssuePriority priority,
            @RequestParam(required = false) TrackerType tracker,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String text,
            @RequestParam(required = false) String assigneeName) {
        return issueService.list(projectId, status, priority, tracker, assigneeId,
                subject, text, assigneeName);
    }

    @GetMapping("/api/projects/{projectId}/issues")
    public List<IssueDto> listByProject(@PathVariable Long projectId) {
        return issueService.listByProject(projectId);
    }

    @GetMapping("/api/issues/{id}")
    public IssueDto get(@PathVariable Long id) {
        return issueService.get(id);
    }

    @PostMapping("/api/issues")
    @ResponseStatus(HttpStatus.CREATED)
    public IssueDto create(@CurrentUser User me, @Valid @RequestBody IssueRequest request) {
        return issueService.create(request, me);
    }

    @PutMapping("/api/issues/{id}")
    public IssueDto update(@PathVariable Long id, @CurrentUser User me, @Valid @RequestBody IssueRequest request) {
        return issueService.update(id, request, me);
    }

    // 목록에서 상태만 가볍게 변경.
    @PatchMapping("/api/issues/{id}/status")
    public IssueDto updateStatus(@PathVariable Long id, @RequestBody StatusRequest request) {
        return issueService.updateStatus(id, request.status());
    }

    @DeleteMapping("/api/issues/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        issueService.delete(id);
    }

    // ===== 관련 이슈(양방향 링크) =====

    @GetMapping("/api/issues/{id}/links")
    public List<IssueLinkDto> listLinks(@PathVariable Long id) {
        return issueService.listLinks(id);
    }

    @PostMapping("/api/issues/{id}/links")
    @ResponseStatus(HttpStatus.CREATED)
    public IssueLinkDto addLink(@PathVariable Long id, @RequestBody LinkRequest request) {
        return issueService.addLink(id, request.targetId());
    }

    @DeleteMapping("/api/issues/links/{linkId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLink(@PathVariable Long linkId) {
        issueService.deleteLink(linkId);
    }

    public record LinkRequest(Long targetId) {
    }

    public record StatusRequest(IssueStatus status) {
    }
}
