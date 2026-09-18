package com.example.redmine.schedule;

import com.example.redmine.attachment.FileStorageService;
import com.example.redmine.common.NotFoundException;
import com.example.redmine.schedule.dto.ScheduleEventDto;
import com.example.redmine.schedule.dto.ScheduleEventRequest;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class ScheduleService {

    private final ScheduleEventRepository repository;
    private final FileStorageService fileStorage;

    public ScheduleService(ScheduleEventRepository repository, FileStorageService fileStorage) {
        this.repository = repository;
        this.fileStorage = fileStorage;
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
        ScheduleEvent e = find(id);
        if (e.getAttachmentStored() != null) {
            fileStorage.delete(e.getAttachmentStored());
        }
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
