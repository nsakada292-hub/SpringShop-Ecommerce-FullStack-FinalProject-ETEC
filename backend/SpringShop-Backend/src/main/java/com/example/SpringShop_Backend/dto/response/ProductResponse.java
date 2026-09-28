package com.example.SpringShop_Backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String productName;
    private String description;
    private BigDecimal price;
    private BigDecimal discountPercentage;
    private BigDecimal salePrice;
    private Integer stockQuantity;
    private CategoryResponse category; // nested, since client usually wants category name too
    private String size;
    private String color;
    private String material;
    private String image;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
