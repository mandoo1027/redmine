package com.example.redmine.project;

import com.example.redmine.auth.CurrentUser;
import com.example.redmine.common.ForbiddenException;
import com.example.redmine.project.dto.AddMemberRequest;
import com.example.redmine.project.dto.ProjectDto;
import com.example.redmine.project.dto.ProjectMemberDto;
import com.example.redmine.project.dto.ProjectRequest;
import com.example.redmine.user.Role;
import com.example.redmine.user.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public List<ProjectDto> list() {
        return projectService.list();
    }

    @GetMapping("/{id}")
    public ProjectDto get(@PathVariable Long id) {
        return projectService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectDto create(@CurrentUser User me, @Valid @RequestBody ProjectRequest request) {
        requireAdmin(me);
        return projectService.create(request);
    }

    @PutMapping("/{id}")
    public ProjectDto update(@CurrentUser User me, @PathVariable Long id,
                             @Valid @RequestBody ProjectRequest request) {
        requireAdmin(me);
        return projectService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@CurrentUser User me, @PathVariable Long id) {
        requireAdmin(me);
        projectService.delete(id);
    }

    @GetMapping("/{id}/members")
    public List<ProjectMemberDto> listMembers(@PathVariable Long id) {
        return projectService.listMembers(id);
    }

    @PostMapping("/{id}/members")
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectMemberDto addMember(@CurrentUser User me, @PathVariable Long id,
                                      @Valid @RequestBody AddMemberRequest request) {
        requireAdmin(me);
        return projectService.addMember(id, request);
    }

    @DeleteMapping("/{id}/members/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeMember(@CurrentUser User me, @PathVariable Long id, @PathVariable Long userId) {
        requireAdmin(me);
        projectService.removeMember(id, userId);
    }

    private void requireAdmin(User me) {
        if (me.getRole() != Role.ADMIN) {
            throw new ForbiddenException("관리자 권한이 필요합니다.");
        }
    }
}
