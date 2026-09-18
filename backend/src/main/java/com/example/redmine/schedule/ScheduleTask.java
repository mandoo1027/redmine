package com.example.redmine.schedule;

import com.example.redmine.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * 일정에 속한 작업 항목(체크리스트).
 * - 예: "2차 수정안" 일정에 문서의 요청사항 목록을 항목별로 담고 상태를 관리.
 * - status: PENDING(대기) / IN_PROGRESS(수정중) / DONE(수정완료)
 */
@Entity
@Table(name = "schedule_tasks")
public class ScheduleTask extends BaseEntity {

    public static final String PENDING = "PENDING";
    public static final String IN_PROGRESS = "IN_PROGRESS";
    public static final String DONE = "DONE";

    /** 소속 일정 ID */
    @Column(name = "event_id", nullable = false)
    private Long eventId;

    /** 분류(문서의 섹션명 등) */
    @Column(name = "section")
    private String section;

    @Column(nullable = false)
    private String title;

    @Column(name = "status", nullable = false)
    private String status = PENDING;

    @Column(name = "sort_order")
    private Integer sortOrder;

    protected ScheduleTask() {
    }

    public ScheduleTask(Long eventId, String title) {
        this.eventId = eventId;
        this.title = title;
        this.status = PENDING;
    }

    /** 허용된 상태값으로 정규화(잘못된 값은 대기로) */
    public static String normalizeStatus(String s) {
        if (IN_PROGRESS.equals(s) || DONE.equals(s)) {
            return s;
        }
        return PENDING;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = normalizeStatus(status);
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}
