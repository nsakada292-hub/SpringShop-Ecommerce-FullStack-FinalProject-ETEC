package com.example.SpringShop_Backend.controller;

import com.example.SpringShop_Backend.dto.request.PaymentInitiateRequest;
import com.example.SpringShop_Backend.dto.request.PaymentStatusRequest;
import com.example.SpringShop_Backend.dto.response.PaymentInitiateResponse;
import com.example.SpringShop_Backend.dto.response.PaymentStatusResponse;
import com.example.SpringShop_Backend.service.bakong.BakongPaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final BakongPaymentService paymentService;

    @PostMapping("/initiate")
    public ResponseEntity<PaymentInitiateResponse> initiate(
            @RequestBody @Valid PaymentInitiateRequest request) {

        return ResponseEntity.ok(paymentService.initiate(request.getOrderId(), request.getCurrency()));
    }

    @PostMapping("/status")
    public ResponseEntity<PaymentStatusResponse> status(
            @RequestBody @Valid PaymentStatusRequest request) {

        return ResponseEntity.ok(paymentService.status(request.getOrderId()));
    }
}