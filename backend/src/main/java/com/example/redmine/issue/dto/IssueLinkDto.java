package com.example.redmine.issue.dto;

import com.example.redmine.issue.Issue;

/**
 * 관련 이슈 링크 표시용. linkId 는 링크 자체의 id(삭제용),
 * 나머지는 상대편(관련) 이슈의 요약 정보.
 */
public record IssueLinkDto(
        Long linkId,
        Long issueId,
        Long projectId,
        String subject,
        String status,
        Integer progress) {

    public static IssueLinkDto of(Long linkId, Issue other) {
        return new IssueLinkDto(
                linkId,
                other.getId(),
                other.getProject().getId(),
                other.getSubject(),
                other.getStatus().name(),
                other.getProgress());
    }
}
