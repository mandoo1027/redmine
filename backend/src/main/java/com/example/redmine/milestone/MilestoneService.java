package com.example.redmine.milestone;

import com.example.redmine.common.NotFoundException;
import com.example.redmine.project.Project;
import com.example.redmine.project.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;

    public MilestoneService(MilestoneRepository milestoneRepository, ProjectRepository projectRepository) {
        this.milestoneRepository = milestoneRepository;
        this.projectRepository = projectRepository;
    }

    @Transactional(readOnly = true)
    public List<MilestoneDto> listByProject(Long projectId) {
        return milestoneRepository.findByProjectId(projectId).stream().map(MilestoneDto::from).toList();
    }

    public MilestoneDto create(Long projectId, MilestoneRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found: " + projectId));
        Milestone milestone = new Milestone(project, request.name());
        milestone.setDescription(request.description());
        milestone.setDueDate(request.dueDate());
        return MilestoneDto.from(milestoneRepository.save(milestone));
    }

    public MilestoneDto update(Long id, MilestoneRequest request) {
        Milestone milestone = findMilestone(id);
        milestone.setName(request.name());
        milestone.setDescription(request.description());
        milestone.setDueDate(request.dueDate());
        return MilestoneDto.from(milestone);
    }

    public void delete(Long id) {
        Milestone milestone = findMilestone(id);
        milestoneRepository.delete(milestone);
    }

    private Milestone findMilestone(Long id) {
        return milestoneRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Milestone not found: " + id));
    }
}
