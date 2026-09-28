package com.example.SpringShop_Backend.entity;

import com.example.SpringShop_Backend.enumm.OrderStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDateTime orderDate;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private String couponCode;
    private Long couponId;
    private Integer couponUnitsUsed;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private String shippingAddress;

    private String recipientName;
    private String recipientEmail;
    private String recipientPhone;
    private Double latitude;
    private Double longitude;

    // Bakong KHQR payment fields
    private String currency;
    private String paymentReference;
    @Column(columnDefinition = "TEXT")
    private String paymentQr;
    private LocalDateTime paymentExpiresAt;
    private String paymentTransactionId;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
