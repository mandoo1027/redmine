package com.example.redmine.schedule;

import com.example.redmine.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.LocalDate;

/**
 * 공유 일정(스케쥴) 이벤트.
 * - 이슈와 무관한 독립 일정. 달력 페이지(/schedule)에 표시.
 * - 조회는 공개(비로그인), 생성/수정/삭제는 로그인 필요.
 */
@Entity
@Table(name = "schedule_events")
public class ScheduleEvent extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    /** 종료일(없으면 당일 일정) */
    @Column(name = "end_date")
    private LocalDate endDate;

    /** 시간 메모(자유 텍스트, 예: "오후 2시", "10:00~12:00") */
    @Column(name = "time_text")
    private String timeText;

    /** 색상(hex, 예: "#3b82f6") */
    @Column(name = "color")
    private String color;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** 작성자 표시명 */
    @Column(name = "created_by_name")
    private String createdByName;

    /** 상단 고정(하이라이트) 여부 */
    @Column(name = "pinned")
    private Boolean pinned;

    /** 첨부파일 원본명 */
    @Column(name = "attachment_name")
    private String attachmentName;

    /** 첨부파일 저장명(UUID) */
    @Column(name = "attachment_stored")
    private String attachmentStored;

    /** 첨부파일 콘텐츠 타입 */
    @Column(name = "attachment_content_type")
    private String attachmentContentType;

    protected ScheduleEvent() {
    }

    public ScheduleEvent(String title, LocalDate startDate) {
        this.title = title;
        this.startDate = startDate;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getTimeText() {
        return timeText;
    }

    public void setTimeText(String timeText) {
        this.timeText = timeText;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    public Boolean getPinned() {
        return pinned;
    }

    public void setPinned(Boolean pinned) {
        this.pinned = pinned;
    }

    public String getAttachmentName() {
        return attachmentName;
    }

    public void setAttachmentName(String attachmentName) {
        this.attachmentName = attachmentName;
    }

    public String getAttachmentStored() {
        return attachmentStored;
    }

    public void setAttachmentStored(String attachmentStored) {
        this.attachmentStored = attachmentStored;
    }

    public String getAttachmentContentType() {
        return attachmentContentType;
    }

    public void setAttachmentContentType(String attachmentContentType) {
        this.attachmentContentType = attachmentContentType;
    }
}
