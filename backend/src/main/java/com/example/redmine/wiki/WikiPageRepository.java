package com.example.redmine.wiki;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WikiPageRepository extends JpaRepository<WikiPage, Long> {
    List<WikiPage> findByProjectId(Long projectId);

    Optional<WikiPage> findByProjectIdAndSlug(Long projectId, String slug);

    boolean existsByProjectIdAndSlug(Long projectId, String slug);
}
