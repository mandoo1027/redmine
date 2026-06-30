package com.example.redmine.wiki;

import com.example.redmine.auth.CurrentUser;
import com.example.redmine.user.User;
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
public class WikiPageController {

    private final WikiPageService wikiService;

    public WikiPageController(WikiPageService wikiService) {
        this.wikiService = wikiService;
    }

    @GetMapping("/api/projects/{projectId}/wiki")
    public List<WikiPageDto> list(@PathVariable Long projectId) {
        return wikiService.listByProject(projectId);
    }

    @GetMapping("/api/projects/{projectId}/wiki/{slug}")
    public WikiPageDto get(@PathVariable Long projectId, @PathVariable String slug) {
        return wikiService.get(projectId, slug);
    }

    @PostMapping("/api/projects/{projectId}/wiki")
    @ResponseStatus(HttpStatus.CREATED)
    public WikiPageDto create(@PathVariable Long projectId,
                              @Valid @RequestBody WikiPageRequest request,
                              @CurrentUser User user) {
        return wikiService.create(projectId, request, user);
    }

    @PutMapping("/api/projects/{projectId}/wiki/{slug}")
    public WikiPageDto update(@PathVariable Long projectId,
                              @PathVariable String slug,
                              @Valid @RequestBody WikiPageRequest request,
                              @CurrentUser User user) {
        return wikiService.update(projectId, slug, request, user);
    }

    @DeleteMapping("/api/projects/{projectId}/wiki/{slug}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long projectId, @PathVariable String slug) {
        wikiService.delete(projectId, slug);
    }
}
