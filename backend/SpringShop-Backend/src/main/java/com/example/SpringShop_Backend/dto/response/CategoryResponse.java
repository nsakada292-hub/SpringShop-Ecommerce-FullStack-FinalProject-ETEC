package com.example.SpringShop_Backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private Long id;
    private String categoryName;
    private Long parentCategoryId;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
