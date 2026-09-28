package com.example.SpringShop_Backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "coupons")
public class Coupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    private String email;

    private Long userId;

    private BigDecimal discountPercent;

    @Column(nullable = false, columnDefinition = "int default 5")
    private Integer maxUsages;

    @Column(nullable = false, columnDefinition = "int default 0")
    private Integer usedCount;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean used;

    private LocalDateTime usedAt;

    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
