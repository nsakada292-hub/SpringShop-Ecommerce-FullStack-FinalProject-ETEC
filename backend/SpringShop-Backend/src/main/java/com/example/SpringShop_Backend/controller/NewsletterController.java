package com.example.SpringShop_Backend.controller;

import com.example.SpringShop_Backend.dto.request.NewsletterSubscribeRequest;
import com.example.SpringShop_Backend.dto.response.CouponResponse;
import com.example.SpringShop_Backend.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/newsletter")
@RequiredArgsConstructor
public class NewsletterController {

    private final CouponService couponService;

    @PostMapping("/subscribe")
    public ResponseEntity<CouponResponse> subscribe(@RequestBody @Valid NewsletterSubscribeRequest request) {

        CouponResponse response = couponService.subscribe(request.getEmail());

        return ResponseEntity.ok(response);
    }
}