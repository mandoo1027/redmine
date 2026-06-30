package com.example.redmine.wiki;

import com.example.redmine.common.BadRequestException;
import com.example.redmine.common.NotFoundException;
import com.example.redmine.project.Project;
import com.example.redmine.project.ProjectRepository;
import com.example.redmine.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class WikiPageService {

    private final WikiPageRepository wikiRepository;
    private final ProjectRepository projectRepository;

    public WikiPageService(WikiPageRepository wikiRepository, ProjectRepository projectRepository) {
        this.wikiRepository = wikiRepository;
        this.projectRepository = projectRepository;
    }

    @Transactional(readOnly = true)
    public List<WikiPageDto> listByProject(Long projectId) {
        return wikiRepository.findByProjectId(projectId).stream().map(WikiPageDto::from).toList();
    }

    @Transactional(readOnly = true)
    public WikiPageDto get(Long projectId, String slug) {
        return WikiPageDto.from(findPage(projectId, slug));
    }

    public WikiPageDto create(Long projectId, WikiPageRequest request, User author) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found: " + projectId));
        if (wikiRepository.existsByProjectIdAndSlug(projectId, request.slug())) {
            throw new BadRequestException("Wiki page with slug already exists: " + request.slug());
        }
        WikiPage page = new WikiPage(project, request.slug(), request.title());
        page.setContent(request.content());
        page.setUpdatedBy(author);
        return WikiPageDto.from(wikiRepository.save(page));
    }

    public WikiPageDto update(Long projectId, String slug, WikiPageRequest request, User author) {
        WikiPage page = findPage(projectId, slug);
        if (!page.getSlug().equals(request.slug())
                && wikiRepository.existsByProjectIdAndSlug(projectId, request.slug())) {
            throw new BadRequestException("Wiki page with slug already exists: " + request.slug());
        }
        page.setSlug(request.slug());
        page.setTitle(request.title());
        page.setContent(request.content());
        page.setUpdatedBy(author);
        return WikiPageDto.from(page);
    }

    public void delete(Long projectId, String slug) {
        WikiPage page = findPage(projectId, slug);
        wikiRepository.delete(page);
    }

    private WikiPage findPage(Long projectId, String slug) {
        return wikiRepository.findByProjectIdAndSlug(projectId, slug)
                .orElseThrow(() -> new NotFoundException("Wiki page not found: " + slug));
    }
}
