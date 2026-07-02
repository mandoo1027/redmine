package com.example.redmine.issue;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IssueLinkRepository extends JpaRepository<IssueLink, Long> {

    // 해당 이슈가 source 또는 target 인 모든 링크 (양방향 조회).
    List<IssueLink> findBySourceIdOrTargetId(Long sourceId, Long targetId);

    boolean existsBySourceIdAndTargetId(Long sourceId, Long targetId);

    void deleteBySourceIdOrTargetId(Long sourceId, Long targetId);
}
