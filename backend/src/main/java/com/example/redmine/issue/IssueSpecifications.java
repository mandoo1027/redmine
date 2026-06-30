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
}
