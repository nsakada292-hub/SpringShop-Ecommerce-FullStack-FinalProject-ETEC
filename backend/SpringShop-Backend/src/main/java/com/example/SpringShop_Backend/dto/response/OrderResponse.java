package com.example.SpringShop_Backend.dto.response;

import com.example.SpringShop_Backend.enumm.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private Long orderNumber;
    private Long userId;
    private LocalDateTime orderDate;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private String couponCode;
    private OrderStatus status;
    private String shippingAddress;
    private String recipientName;
    private String recipientEmail;
    private String recipientPhone;
    private Double latitude;
    private Double longitude;
    private String currency;
    private String paymentTransactionId;
    private List<OrderItemResponse> items;
}
