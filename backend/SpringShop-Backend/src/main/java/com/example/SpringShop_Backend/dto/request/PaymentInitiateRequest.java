package com.example.SpringShop_Backend.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentInitiateRequest {

    @NotNull(message = "Order id is required")
    @Positive(message = "Invalid order id")
    private Long orderId;

    @Pattern(regexp = "USD|KHR", message = "Currency must be USD or KHR")
    private String currency;
}