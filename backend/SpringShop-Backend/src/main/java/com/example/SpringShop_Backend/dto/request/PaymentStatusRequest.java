package com.example.SpringShop_Backend.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentStatusRequest {

    @NotNull(message = "Order id is required")
    @Positive(message = "Invalid order id")
    private Long orderId;
}