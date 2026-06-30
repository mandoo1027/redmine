package com.example.redmine.wiki;

import jakarta.validation.constraints.NotBlank;

public record WikiPageRequest(
        @NotBlank String slug,
        @NotBlank String title,
        String content) {
}
