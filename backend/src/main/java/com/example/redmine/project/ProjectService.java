package com.example.redmine.project;

import com.example.redmine.common.BadRequestException;
import com.example.redmine.common.NotFoundException;
import com.example.redmine.project.dto.AddMemberRequest;
import com.example.redmine.project.dto.ProjectDto;
import com.example.redmine.project.dto.ProjectMemberDto;
import com.example.redmine.project.dto.ProjectRequest;
import com.example.redmine.user.User;
import com.example.redmine.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository,
                          ProjectMemberRepository memberRepository,
                          UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ProjectDto> list() {
        return projectRepository.findAll().stream().map(ProjectDto::from).toList();
    }

    @Transactional(readOnly = true)
    public ProjectDto get(Long id) {
        return ProjectDto.from(findProject(id));
    }

    public ProjectDto create(ProjectRequest request) {
        if (projectRepository.existsByKey(request.key())) {
            throw new BadRequestException("Project key already exists: " + request.key());
        }
        Project project = new Project(request.key(), request.name(), request.description());
        return ProjectDto.from(projectRepository.save(project));
    }

    public ProjectDto update(Long id, ProjectRequest request) {
        Project project = findProject(id);
        if (!project.getKey().equals(request.key()) && projectRepository.existsByKey(request.key())) {
            throw new BadRequestException("Project key already exists: " + request.key());
        }
        project.setKey(request.key());
        project.setName(request.name());
        project.setDescription(request.description());
        return ProjectDto.from(project);
    }

    public void delete(Long id) {
        Project project = findProject(id);
        projectRepository.delete(project);
    }

    @Transactional(readOnly = true)
    public List<ProjectMemberDto> listMembers(Long projectId) {
        findProject(projectId);
        return memberRepository.findByProjectId(projectId).stream()
                .map(ProjectMemberDto::from).toList();
    }

    public ProjectMemberDto addMember(Long projectId, AddMemberRequest request) {
        Project project = findProject(projectId);
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new NotFoundException("User not found: " + request.userId()));
        if (memberRepository.existsByProjectIdAndUserId(projectId, request.userId())) {
            throw new BadRequestException("User is already a member");
        }
        ProjectMember member = new ProjectMember(project, user, request.role());
        return ProjectMemberDto.from(memberRepository.save(member));
    }

    public void removeMember(Long projectId, Long userId) {
        ProjectMember member = memberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new NotFoundException("Member not found"));
        memberRepository.delete(member);
    }

    public Project findProject(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Project not found: " + id));
    }
}
