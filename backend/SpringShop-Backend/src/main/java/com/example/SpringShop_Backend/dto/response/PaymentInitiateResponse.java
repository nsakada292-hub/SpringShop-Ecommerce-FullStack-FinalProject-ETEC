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
public class PaymentInitiateResponse {

    private Long orderId;
    private String qr;
    private String md5;
    private String currency;
    private Double amount;
    private LocalDateTime expiresAt;
    private boolean mock;
    private boolean demo;

    /**
     * MERCHANT (KHQR tag 30, corporate - every bank app accepts it) or
     * INDIVIDUAL (tag 29, solo wallet - some payer apps reject the receiver).
     */
    private String qrType;
}
