package com.example.SpringShop_Backend.entity;

import com.example.SpringShop_Backend.enumm.PaymentAttemptStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * One KHQR issued for an order. An order can have several (a customer may let a
 * QR expire and request a new one), so every md5 we hand out gets its own row.
 *
 * This exists so that a payment is never lost: {@code check_transaction_by_md5}
 * only answers for one md5, and the Order entity stores just the latest. Keeping
 * the history lets us look up every QR the customer was ever shown.
 */
@Entity
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "payment_attempts", indexes = {
        @Index(name = "idx_payment_attempt_order", columnList = "order_id"),
        @Index(name = "idx_payment_attempt_md5", columnList = "md5", unique = true)
})
public class PaymentAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    /** The md5 Bakong uses to look the transaction up. */
    private String md5;

    @Column(columnDefinition = "TEXT")
    private String qr;

    /** Currency the QR was issued in. */
    private String currency;

    /** Amount the QR was issued for, in {@link #currency}. */
    private BigDecimal amount;

    private LocalDateTime expiresAt;

    @Enumerated(EnumType.STRING)
    private PaymentAttemptStatus status;

    private String transactionId;

    private String paidCurrency;
    private BigDecimal paidAmount;
    private String payerAccountId;
    private String payerName;
    private LocalDateTime paidAt;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
