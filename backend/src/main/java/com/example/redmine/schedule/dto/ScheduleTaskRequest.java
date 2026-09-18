package com.example.redmine.schedule.dto;

/**
 * 작업 항목 생성/수정 요청.
 * 수정 시 null 인 필드는 "변경 없음" 으로 처리한다(상태만 바꿀 때 status 만 담아 보내면 된다).
 */
public record ScheduleTaskRequest(
        String title,
        String section,
        String status,
        Integer sortOrder
) {
}
