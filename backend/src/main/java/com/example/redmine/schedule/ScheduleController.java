package com.example.redmine.schedule;

import com.example.redmine.auth.CurrentUser;
import com.example.redmine.schedule.dto.ScheduleEventDto;
import com.example.redmine.schedule.dto.ScheduleEventRequest;
import com.example.redmine.user.User;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

/**
 * 공유 일정(스케쥴) API.
 * - GET /api/schedule : 공개(비로그인 조회 허용, JwtAuthFilter 화이트리스트)
 * - POST/PUT/DELETE   : 로그인 필요
 */
@RestController
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping("/api/schedule")
    public List<ScheduleEventDto> list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return scheduleService.list(from, to);
    }

    @PostMapping("/api/schedule")
    @ResponseStatus(HttpStatus.CREATED)
    public ScheduleEventDto create(@CurrentUser User me, @Valid @RequestBody ScheduleEventRequest request) {
        return scheduleService.create(request, displayName(me));
    }

    @PutMapping("/api/schedule/{id}")
    public ScheduleEventDto update(@PathVariable Long id, @Valid @RequestBody ScheduleEventRequest request) {
        return scheduleService.update(id, request);
    }

    @DeleteMapping("/api/schedule/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        scheduleService.delete(id);
    }

    private String displayName(User me) {
        if (me == null) return null;
        return me.getDisplayName() != null && !me.getDisplayName().isBlank()
                ? me.getDisplayName()
                : me.getUsername();
    }
}
