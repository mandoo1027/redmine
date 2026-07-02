package com.example.redmine.issue;

import com.example.redmine.common.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * 이슈 간 관련(양방향) 링크. source ↔ target 을 연결한다.
 * 조회 시 source/target 양쪽을 모두 검색해 양방향처럼 노출한다.
 */
@Entity
@Table(name = "issue_links",
        uniqueConstraints = @UniqueConstraint(columnNames = {"source_id", "target_id"}))
public class IssueLink extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "source_id", nullable = false)
    private Issue source;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "target_id", nullable = false)
    private Issue target;

    protected IssueLink() {
    }

    public IssueLink(Issue source, Issue target) {
        this.source = source;
        this.target = target;
    }

    public Issue getSource() {
        return source;
    }

    public Issue getTarget() {
        return target;
    }
}
