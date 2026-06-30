package com.example.redmine.attachment;

import com.example.redmine.attachment.dto.AttachmentDto;
import com.example.redmine.common.NotFoundException;
import com.example.redmine.user.User;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@Transactional
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final FileStorageService fileStorageService;

    public AttachmentService(AttachmentRepository attachmentRepository,
                             FileStorageService fileStorageService) {
        this.attachmentRepository = attachmentRepository;
        this.fileStorageService = fileStorageService;
    }

    public AttachmentDto upload(String parentType, Long parentId, MultipartFile file, User me) {
        String storedName = fileStorageService.store(file);
        Attachment attachment = new Attachment(
                parentType,
                parentId,
                storedName,
                file.getOriginalFilename(),
                file.getContentType(),
                file.getSize(),
                me);
        return AttachmentDto.from(attachmentRepository.save(attachment));
    }

    @Transactional(readOnly = true)
    public List<AttachmentDto> list(String parentType, Long parentId) {
        return attachmentRepository.findByParentTypeAndParentId(parentType, parentId).stream()
                .map(AttachmentDto::from).toList();
    }

    @Transactional(readOnly = true)
    public Attachment getEntity(Long id) {
        return attachmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("첨부파일을 찾을 수 없습니다."));
    }

    public Resource loadResource(Attachment attachment) {
        return fileStorageService.loadAsResource(attachment.getStoredName());
    }

    public void delete(Long id) {
        Attachment attachment = getEntity(id);
        fileStorageService.delete(attachment.getStoredName());
        attachmentRepository.delete(attachment);
    }

    public void deleteAllForParent(String parentType, Long parentId) {
        List<Attachment> attachments = attachmentRepository.findByParentTypeAndParentId(parentType, parentId);
        for (Attachment a : attachments) {
            fileStorageService.delete(a.getStoredName());
        }
        attachmentRepository.deleteAll(attachments);
    }
}
