package com.example.redmine.comment;

import com.example.redmine.auth.CurrentUser;
import com.example.redmine.comment.dto.CommentDto;
import com.example.redmine.comment.dto.CommentRequest;
import com.example.redmine.user.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/api/issues/{issueId}/comments")
    public List<CommentDto> list(@PathVariable Long issueId) {
        return commentService.list(issueId);
    }

    @PostMapping("/api/issues/{issueId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentDto create(@PathVariable Long issueId,
                             @CurrentUser User me,
                             @Valid @RequestBody CommentRequest request) {
        return commentService.create(issueId, request.content(), me);
    }

    @DeleteMapping("/api/comments/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @CurrentUser User me) {
        commentService.delete(id, me);
    }
}
