package com.example.redmine.schedule;

import com.example.redmine.common.NotFoundException;
import com.example.redmine.schedule.dto.ScheduleEventDto;
import com.example.redmine.schedule.dto.ScheduleEventRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class ScheduleService {

    private final ScheduleEventRepository repository;

    public ScheduleService(ScheduleEventRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<ScheduleEventDto> list(LocalDate from, LocalDate to) {
        List<ScheduleEvent> events = (from != null && to != null)
                ? repository.findOverlapping(from, to)
                : repository.findAllByOrderByStartDateAsc();
        return events.stream().map(ScheduleEventDto::from).toList();
    }

    public ScheduleEventDto create(ScheduleEventRequest request, String createdByName) {
        ScheduleEvent e = new ScheduleEvent(request.title(), request.startDate());
        apply(e, request);
        e.setCreatedByName(createdByName);
        return ScheduleEventDto.from(repository.save(e));
    }

    public ScheduleEventDto update(Long id, ScheduleEventRequest request) {
        ScheduleEvent e = find(id);
        e.setTitle(request.title());
        e.setStartDate(request.startDate());
        apply(e, request);
        return ScheduleEventDto.from(e);
    }

    public void delete(Long id) {
        repository.delete(find(id));
    }

    private void apply(ScheduleEvent e, ScheduleEventRequest request) {
        // endDate 가 startDate 보다 빠르면 무시(당일 처리)
        LocalDate end = request.endDate();
        if (end != null && end.isBefore(request.startDate())) {
            end = null;
        }
        e.setEndDate(end);
        e.setTimeText(request.timeText());
        e.setColor(request.color());
        e.setDescription(request.description());
    }

    private ScheduleEvent find(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Schedule event not found: " + id));
    }
}
