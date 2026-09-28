package com.example.SpringShop_Backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentStatusResponse {

    private Long orderId;
    private String status;
    private boolean paid;
    private String currency;
    private Double amount;
    private String transactionId;

    /** True when the QR the customer is looking at has passed its expiry. */
    private boolean qrExpired;

    /**
     * Human-readable explanation shown to the customer when the order is not yet
     * paid. Null when there is nothing useful to say.
     */
    private String message;
}
