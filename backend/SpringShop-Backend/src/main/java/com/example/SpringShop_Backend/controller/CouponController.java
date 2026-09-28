package com.example.SpringShop_Backend.controller;

import com.example.SpringShop_Backend.dto.request.CouponValidateRequest;
import com.example.SpringShop_Backend.dto.response.CouponResponse;
import com.example.SpringShop_Backend.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @PostMapping("/validate")
    public ResponseEntity<CouponResponse> validate(@RequestBody @Valid CouponValidateRequest request) {

        CouponResponse response = couponService.validateForCheckout(request.getCode());

        return ResponseEntity.ok(response);
    }
}