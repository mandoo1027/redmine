package com.example.redmine.attachment;

import com.example.redmine.attachment.dto.AttachmentDto;
import com.example.redmine.auth.CurrentUser;
import com.example.redmine.user.User;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/attachments")
public class AttachmentController {

    private final AttachmentService attachmentService;

    public AttachmentController(AttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AttachmentDto upload(@CurrentUser User me,
                                @RequestParam("file") MultipartFile file,
                                @RequestParam("parentType") String parentType,
                                // 작성 중(부모 엔티티 미저장) 이미지 업로드는 parentId 없이 draft(0)로 저장한다.
                                @RequestParam(value = "parentId", defaultValue = "0") Long parentId) {
        return attachmentService.upload(parentType, parentId, file, me);
    }

    @GetMapping
    public List<AttachmentDto> list(@RequestParam String parentType, @RequestParam Long parentId) {
        return attachmentService.list(parentType, parentId);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id,
                                             @RequestParam(defaultValue = "false") boolean inline) {
        Attachment attachment = attachmentService.getEntity(id);
        Resource resource = attachmentService.loadResource(attachment);

        String contentType = attachment.getContentType() != null
                ? attachment.getContentType()
                : MediaType.APPLICATION_OCTET_STREAM_VALUE;

        String disposition = inline ? "inline" : "attachment";
        String filename = encodeFilename(attachment.getOriginalName());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        disposition + "; filename=\"" + filename + "\"; filename*=UTF-8''" + filename)
                .body(resource);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        attachmentService.delete(id);
    }

    private String encodeFilename(String name) {
        if (name == null) {
            return "file";
        }
        try {
            return URLEncoder.encode(name, StandardCharsets.UTF_8.name()).replace("+", "%20");
        } catch (UnsupportedEncodingException e) {
            return "file";
        }
    }
}
