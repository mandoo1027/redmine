package com.example.redmine.schedule;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduleTaskRepository extends JpaRepository<ScheduleTask, Long> {

    List<ScheduleTask> findByEventIdOrderBySortOrderAscIdAsc(Long eventId);

    void deleteByEventId(Long eventId);
}
