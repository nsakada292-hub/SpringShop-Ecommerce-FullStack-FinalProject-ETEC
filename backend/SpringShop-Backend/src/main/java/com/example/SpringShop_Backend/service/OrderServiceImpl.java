package com.example.SpringShop_Backend.service;

import com.example.SpringShop_Backend.dto.request.OrderRequest;
import com.example.SpringShop_Backend.dto.response.OrderItemResponse;
import com.example.SpringShop_Backend.dto.response.OrderResponse;
import com.example.SpringShop_Backend.entity.*;
import com.example.SpringShop_Backend.enumm.OrderStatus;
import com.example.SpringShop_Backend.enumm.Role;
import com.example.SpringShop_Backend.exception.BadRequestException;
import com.example.SpringShop_Backend.exception.NotFoundException;
import com.example.SpringShop_Backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CouponService couponService;
    private final InputSanitizer inputSanitizer;

    @Override
    @Transactional
    public OrderResponse placeOrder(OrderRequest orderRequest) {

        User user = getCurrentUser();

        Cart cart = cartRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new BadRequestException("Cart is empty"));

        List<CartItem> cartItems = cartItemRepository.findByCart_Id(cart.getId());

        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        // check stock before touching anything
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new BadRequestException("Not enough stock for " + product.getProductName());
            }
        }

        Order order = Order.builder()
                .user(user)
                .orderNumber(orderRepository.nextOrderNumber(user.getId()))
                .orderDate(LocalDateTime.now())
                .status(OrderStatus.PENDING)
                .currency("USD")
                .shippingAddress(inputSanitizer.sanitize(orderRequest.getShippingAddress()))
                .recipientName(inputSanitizer.sanitize(orderRequest.getRecipientName()))
                .recipientEmail(inputSanitizer.sanitize(orderRequest.getRecipientEmail()))
                .recipientPhone(inputSanitizer.sanitize(orderRequest.getRecipientPhone()))
                .latitude(orderRequest.getLatitude())
                .longitude(orderRequest.getLongitude())
                .totalAmount(BigDecimal.ZERO)
                .build();

        order = orderRepository.save(order);

        try {
            BigDecimal totalAmount = BigDecimal.ZERO;
            BigDecimal discountAmount = BigDecimal.ZERO;
            int couponUnitsUsed = 0;

            // Resolve coupon if a code was provided
            com.example.SpringShop_Backend.dto.response.CouponResponse coupon = null;
            if (orderRequest.getCouponCode() != null && !orderRequest.getCouponCode().isBlank()) {
                coupon = couponService.validateForCheckout(orderRequest.getCouponCode());
            }

            int remainingDiscountableUnits = coupon != null
                    ? coupon.getMaxUsages() - coupon.getUsedCount()
                    : 0;

            for (CartItem cartItem : cartItems) {

                Product product = cartItem.getProduct();
                BigDecimal unitPrice = product.salePrice();

                BigDecimal subtotal = unitPrice
                        .multiply(BigDecimal.valueOf(cartItem.getQuantity()));

                totalAmount = totalAmount.add(subtotal);

                // Apply discount to up to the coupon's remaining product-unit allowance
                if (coupon != null && remainingDiscountableUnits > 0 && cartItem.getQuantity() > 0) {
                    int unitsToDiscount = Math.min(cartItem.getQuantity(), remainingDiscountableUnits);
                    BigDecimal unitDiscount = unitPrice
                            .multiply(coupon.getDiscountPercent())
                            .divide(BigDecimal.valueOf(100));
                    discountAmount = discountAmount.add(unitDiscount.multiply(BigDecimal.valueOf(unitsToDiscount)));
                    couponUnitsUsed += unitsToDiscount;
                    remainingDiscountableUnits -= unitsToDiscount;
                }

                OrderItem orderItem = OrderItem.builder()
                        .order(order)
                        .product(product)
                        .quantity(cartItem.getQuantity())
                        .unitPrice(unitPrice)
                        .subtotal(subtotal)
                        .build();

                orderItemRepository.save(orderItem);

                // decrement stock
                product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
                productRepository.save(product);
            }

            BigDecimal finalAmount = totalAmount.subtract(discountAmount);
            if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
                finalAmount = BigDecimal.ZERO;
            }

            order.setDiscountAmount(discountAmount);
            if (coupon != null) {
                order.setCouponCode(coupon.getCode());
                order.setCouponId(coupon.getId());
                order.setCouponUnitsUsed(couponUnitsUsed);
                couponService.recordUsage(coupon.getId(), couponUnitsUsed);
            }

            order.setTotalAmount(finalAmount);
            order = orderRepository.save(order);

            // clear the cart now that checkout succeeded
            cartItemRepository.deleteByCart_Id(cart.getId());
        } catch (ObjectOptimisticLockingFailureException ex) {
            throw new BadRequestException("Stock was updated by another customer. Please review your cart and try again.");
        }

        return toResponse(order);
    }

    @Override
    public OrderResponse getById(Long id) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        User currentUser = getCurrentUser();

        if (currentUser.getRole() != Role.ADMIN
                && !order.getUser().getId().equals(currentUser.getId())) {
            throw new NotFoundException("Order not found");
        }

        return toResponse(order);
    }

    @Override
    public List<OrderResponse> getMyOrders() {

        User user = getCurrentUser();
        List<Order> orders = orderRepository.findByUser_Id(user.getId());
        List<OrderResponse> responses = new ArrayList<>();

        for (Order order : orders) {
            responses.add(toResponse(order));
        }

        return responses;
    }

    @Override
    public List<OrderResponse> getAll() {

        List<Order> orders = orderRepository.findAll();
        List<OrderResponse> responses = new ArrayList<>();

        for (Order order : orders) {
            responses.add(toResponse(order));
        }

        return responses;
    }

    @Override
    public OrderResponse updateStatus(Long id, String status) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + status);
        }

        order.setStatus(newStatus);
        order = orderRepository.save(order);

        return toResponse(order);
    }

    @Override
    @Transactional
    public void cancelOrder(Long id) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        User currentUser = getCurrentUser();

        if (currentUser.getRole() != Role.ADMIN
                && !order.getUser().getId().equals(currentUser.getId())) {
            throw new NotFoundException("Order not found");
        }

        if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new BadRequestException("Cannot cancel an order that has already shipped");
        }

        try {
            List<OrderItem> orderItems = orderItemRepository.findByOrder_Id(order.getId());

            // restore stock
            for (OrderItem item : orderItems) {
                Product product = item.getProduct();
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                productRepository.save(product);
            }

            // restore coupon usage allowance if a coupon was applied
            if (order.getCouponId() != null) {
                couponService.restoreUsage(order.getCouponId(),
                        order.getCouponUnitsUsed() != null ? order.getCouponUnitsUsed() : 0);
            }

            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);
        } catch (ObjectOptimisticLockingFailureException ex) {
            throw new BadRequestException("Stock was updated by another request. Please try again.");
        }
    }

    private User getCurrentUser() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private OrderResponse toResponse(Order order) {

        List<OrderItem> orderItems = orderItemRepository.findByOrder_Id(order.getId());
        List<OrderItemResponse> itemResponses = new ArrayList<>();

        for (OrderItem item : orderItems) {

            OrderItemResponse itemResponse = OrderItemResponse.builder()
                    .id(item.getId())
                    .productId(item.getProduct().getId())
                    .productName(item.getProduct().getProductName())
                    .quantity(item.getQuantity())
                    .unitPrice(item.getUnitPrice())
                    .subtotal(item.getSubtotal())
                    .build();

            itemResponses.add(itemResponse);
        }

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUser().getId())
                .orderDate(order.getOrderDate())
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .couponCode(order.getCouponCode())
                .status(order.getStatus())
                .shippingAddress(order.getShippingAddress())
                .recipientName(order.getRecipientName())
                .recipientEmail(order.getRecipientEmail())
                .recipientPhone(order.getRecipientPhone())
                .latitude(order.getLatitude())
                .longitude(order.getLongitude())
                .currency(order.getCurrency() != null ? order.getCurrency() : "USD")
                .paymentTransactionId(order.getPaymentTransactionId())
                .items(itemResponses)
                .build();
    }
}