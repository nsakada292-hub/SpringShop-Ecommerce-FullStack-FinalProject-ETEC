package com.example.SpringShop_Backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponValidateRequest {

    @NotBlank(message = "Coupon code is required")
    @Size(max = 30, message = "Coupon code must be at most 30 characters")
    @Pattern(regexp = "^[A-Za-z0-9-]+$", message = "Coupon code has invalid characters")
    private String code;
}