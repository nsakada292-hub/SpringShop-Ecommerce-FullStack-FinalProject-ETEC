package com.example.SpringShop_Backend.dto.request;

import jakarta.validation.constraints.Email;
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
public class OrderRequest {

    @NotBlank(message = "Shipping address is required")
    @Size(min = 5, max = 500, message = "Shipping address must be between 5 and 500 characters")
    private String shippingAddress;

    @NotBlank(message = "Recipient name is required")
    @Size(max = 100, message = "Recipient name must be at most 100 characters")
    private String recipientName;

    @NotBlank(message = "Recipient email is required")
    @Email(message = "Invalid email address")
    @Size(max = 150, message = "Recipient email must be at most 150 characters")
    private String recipientEmail;

    @NotBlank(message = "Recipient phone is required")
    @Pattern(regexp = "^[0-9+\\-\\s]{7,20}$", message = "Invalid phone number")
    private String recipientPhone;

    private Double latitude;
    private Double longitude;

    @Size(max = 500, message = "Order notes must be at most 500 characters")
    private String notes;

    @Size(max = 30, message = "Coupon code must be at most 30 characters")
    private String couponCode;
}