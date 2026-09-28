package com.example.SpringShop_Backend.controller;

import com.example.SpringShop_Backend.dto.request.OrderRequest;
import com.example.SpringShop_Backend.dto.response.OrderResponse;
import com.example.SpringShop_Backend.service.OrderService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Validated
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(@RequestBody @Valid OrderRequest orderRequest) {

        OrderResponse response = orderService.placeOrder(orderRequest);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getById(@PathVariable @Positive(message = "Invalid order ID") Long id) {

        OrderResponse response = orderService.getById(id);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<List<OrderResponse>> getMyOrders() {

        List<OrderResponse> responses = orderService.getMyOrders();

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/all")
    public ResponseEntity<List<OrderResponse>> getAll() {

        List<OrderResponse> responses = orderService.getAll();

        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable @Positive(message = "Invalid order ID") Long id,
            @RequestParam @NotBlank(message = "Status is required") String status
    ) {

        OrderResponse response = orderService.updateStatus(id, status);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelOrder(@PathVariable @Positive(message = "Invalid order ID") Long id) {

        orderService.cancelOrder(id);

        return ResponseEntity.noContent().build();
    }
}