package com.example.redmine.milestone;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class MilestoneController {

    private final MilestoneService milestoneService;

    public MilestoneController(MilestoneService milestoneService) {
        this.milestoneService = milestoneService;
    }

    @GetMapping("/api/projects/{projectId}/milestones")
    public List<MilestoneDto> listByProject(@PathVariable Long projectId) {
        return milestoneService.listByProject(projectId);
    }

    @PostMapping("/api/projects/{projectId}/milestones")
    @ResponseStatus(HttpStatus.CREATED)
    public MilestoneDto create(@PathVariable Long projectId, @Valid @RequestBody MilestoneRequest request) {
        return milestoneService.create(projectId, request);
    }

    @PutMapping("/api/milestones/{id}")
    public MilestoneDto update(@PathVariable Long id, @Valid @RequestBody MilestoneRequest request) {
        return milestoneService.update(id, request);
    }

    @DeleteMapping("/api/milestones/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        milestoneService.delete(id);
    }
}
