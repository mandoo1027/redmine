package com.example.redmine.issue;

import org.springframework.data.jpa.domain.Specification;

public final class IssueSpecifications {

    private IssueSpecifications() {
    }

    public static Specification<Issue> projectId(Long projectId) {
        return (root, query, cb) ->
                projectId == null ? null : cb.equal(root.get("project").get("id"), projectId);
    }

    public static Specification<Issue> status(IssueStatus status) {
        return (root, query, cb) ->
                status == null ? null : cb.equal(root.get("status"), status);
    }

    public static Specification<Issue> priority(IssuePriority priority) {
        return (root, query, cb) ->
                priority == null ? null : cb.equal(root.get("priority"), priority);
    }

    public static Specification<Issue> tracker(TrackerType tracker) {
        return (root, query, cb) ->
                tracker == null ? null : cb.equal(root.get("tracker"), tracker);
    }

    public static Specification<Issue> assigneeId(Long assigneeId) {
        return (root, query, cb) ->
                assigneeId == null ? null : cb.equal(root.get("assignee").get("id"), assigneeId);
    }

    public static Specification<Issue> reviewerId(Long reviewerId) {
        return (root, query, cb) ->
                reviewerId == null ? null : cb.equal(root.get("reviewer").get("id"), reviewerId);
    }

    // 검수 담당자 이름(displayName 또는 username)에 keyword 포함 (대소문자 무시)
    public static Specification<Issue> reviewerNameLike(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return null;
            }
            String p = pattern(keyword);
            var reviewer = root.join("reviewer", jakarta.persistence.criteria.JoinType.LEFT);
            return cb.or(
                    cb.like(cb.lower(reviewer.get("displayName")), p),
                    cb.like(cb.lower(reviewer.get("username")), p));
        };
    }

    // 제목(subject)에 keyword 포함 (대소문자 무시)
    public static Specification<Issue> subjectLike(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return null;
            }
            return cb.like(cb.lower(root.get("subject")), pattern(keyword));
        };
    }

    // 텍스트(제목 또는 설명)에 keyword 포함 (대소문자 무시)
    public static Specification<Issue> textLike(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return null;
            }
            String p = pattern(keyword);
            return cb.or(
                    cb.like(cb.lower(root.get("subject")), p),
                    cb.like(cb.lower(root.get("description")), p));
        };
    }

    // 담당자 이름(displayName 또는 username)에 keyword 포함 (대소문자 무시)
    public static Specification<Issue> assigneeNameLike(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return null;
            }
            String p = pattern(keyword);
            var assignee = root.join("assignee", jakarta.persistence.criteria.JoinType.LEFT);
            return cb.or(
                    cb.like(cb.lower(assignee.get("displayName")), p),
                    cb.like(cb.lower(assignee.get("username")), p));
        };
    }

    private static String pattern(String keyword) {
        return "%" + keyword.trim().toLowerCase() + "%";
    }
}
