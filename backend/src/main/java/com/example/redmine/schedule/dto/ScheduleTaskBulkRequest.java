package com.example.redmine.schedule.dto;

import java.util.List;

/**
 * 작업 항목 일괄 등록 요청.
 * replace=true 이면 기존 항목을 모두 지우고 새로 등록한다.
 */
public record ScheduleTaskBulkRequest(
        List<ScheduleTaskRequest> tasks,
        Boolean replace
) {
}
