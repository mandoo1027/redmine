package com.example.redmine.schedule;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleEventRepository extends JpaRepository<ScheduleEvent, Long> {

    List<ScheduleEvent> findAllByOrderByStartDateAsc();

    /** [from, to] 기간과 겹치는 일정(다중일 일정 포함). endDate 가 없으면 startDate 를 종료로 간주. */
    @Query("SELECT e FROM ScheduleEvent e "
            + "WHERE e.startDate <= :to AND COALESCE(e.endDate, e.startDate) >= :from "
            + "ORDER BY e.startDate ASC")
    List<ScheduleEvent> findOverlapping(@Param("from") LocalDate from, @Param("to") LocalDate to);
}
