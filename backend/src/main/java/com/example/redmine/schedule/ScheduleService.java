package com.example.redmine.schedule;

import com.example.redmine.attachment.FileStorageService;
import com.example.redmine.common.NotFoundException;
import com.example.redmine.schedule.dto.ScheduleEventDto;
import com.example.redmine.schedule.dto.ScheduleEventRequest;
import com.example.redmine.schedule.dto.ScheduleTaskBulkRequest;
import com.example.redmine.schedule.dto.ScheduleTaskDto;
import com.example.redmine.schedule.dto.ScheduleTaskRequest;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class ScheduleService {

    private final ScheduleEventRepository repository;
    private final ScheduleTaskRepository taskRepository;
    private final FileStorageService fileStorage;

    public ScheduleService(ScheduleEventRepository repository,
                           ScheduleTaskRepository taskRepository,
                           FileStorageService fileStorage) {
        this.repository = repository;
        this.taskRepository = taskRepository;
        this.fileStorage = fileStorage;
    }

    @Transactional(readOnly = true)
    public List<ScheduleEventDto> list(LocalDate from, LocalDate to) {
        List<ScheduleEvent> events = (from != null && to != null)
                ? repository.findOverlapping(from, to)
                : repository.findAllByOrderByStartDateAsc();

        // 작업 항목 진행률(전체/완료)을 한 번에 집계해 이벤트 DTO 에 담는다.
        Map<Long, int[]> counts = new HashMap<>();
        for (ScheduleTask t : taskRepository.findAll()) {
            int[] c = counts.computeIfAbsent(t.getEventId(), k -> new int[2]);
            c[0]++;
            if (ScheduleTask.DONE.equals(t.getStatus())) {
                c[1]++;
            }
        }
        List<ScheduleEventDto> out = new ArrayList<>();
        for (ScheduleEvent e : events) {
            int[] c = counts.getOrDefault(e.getId(), new int[2]);
            out.add(ScheduleEventDto.from(e, c[0], c[1]));
        }
        return out;
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
        ScheduleEvent e = find(id);
        if (e.getAttachmentStored() != null) {
            fileStorage.delete(e.getAttachmentStored());
        }
        taskRepository.deleteByEventId(id);
        repository.delete(e);
    }

    /** 첨부파일 업로드(기존 파일 있으면 교체) */
    public ScheduleEventDto uploadAttachment(Long id, MultipartFile file) {
        ScheduleEvent e = find(id);
        String old = e.getAttachmentStored();
        String stored = fileStorage.store(file);
        e.setAttachmentStored(stored);
        e.setAttachmentName(file.getOriginalFilename());
        e.setAttachmentContentType(file.getContentType());
        if (old != null) {
            fileStorage.delete(old);
        }
        return ScheduleEventDto.from(e);
    }

    /** 첨부파일 리소스 로드(컨트롤러가 스트리밍) */
    @Transactional(readOnly = true)
    public Resource loadAttachment(Long id) {
        ScheduleEvent e = find(id);
        if (e.getAttachmentStored() == null) {
            throw new NotFoundException("첨부파일이 없습니다.");
        }
        return fileStorage.loadAsResource(e.getAttachmentStored());
    }

    @Transactional(readOnly = true)
    public ScheduleEvent getEntity(Long id) {
        return find(id);
    }

    /* ===== 작업 항목(체크리스트) ===== */

    @Transactional(readOnly = true)
    public List<ScheduleTaskDto> listTasks(Long eventId) {
        return taskRepository.findByEventIdOrderBySortOrderAscIdAsc(eventId)
                .stream().map(ScheduleTaskDto::from).toList();
    }

    /** 일괄 등록(replace=true 이면 기존 항목 삭제 후 등록) */
    public List<ScheduleTaskDto> bulkCreateTasks(Long eventId, ScheduleTaskBulkRequest request) {
        find(eventId); // 일정 존재 확인
        if (Boolean.TRUE.equals(request.replace())) {
            taskRepository.deleteByEventId(eventId);
        }
        List<ScheduleTaskRequest> items = request.tasks() == null ? List.of() : request.tasks();
        List<ScheduleTaskDto> out = new ArrayList<>();
        int order = 0;
        for (ScheduleTaskRequest r : items) {
            if (r.title() == null || r.title().isBlank()) {
                continue;
            }
            ScheduleTask t = new ScheduleTask(eventId, r.title().trim());
            t.setSection(r.section());
            t.setStatus(ScheduleTask.normalizeStatus(r.status()));
            t.setSortOrder(r.sortOrder() != null ? r.sortOrder() : order);
            order++;
            out.add(ScheduleTaskDto.from(taskRepository.save(t)));
        }
        return out;
    }

    /** 작업 항목 수정(null 필드는 변경 없음) — 상태만 바꿀 땐 status 만 보내면 된다. */
    public ScheduleTaskDto updateTask(Long taskId, ScheduleTaskRequest request) {
        ScheduleTask t = taskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException("Schedule task not found: " + taskId));
        if (request.title() != null && !request.title().isBlank()) {
            t.setTitle(request.title().trim());
        }
        if (request.section() != null) {
            t.setSection(request.section());
        }
        if (request.status() != null) {
            t.setStatus(ScheduleTask.normalizeStatus(request.status()));
        }
        if (request.sortOrder() != null) {
            t.setSortOrder(request.sortOrder());
        }
        return ScheduleTaskDto.from(t);
    }

    public void deleteTask(Long taskId) {
        taskRepository.deleteById(taskId);
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
        e.setPinned(Boolean.TRUE.equals(request.pinned()));
    }

    private ScheduleEvent find(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Schedule event not found: " + id));
    }
}
