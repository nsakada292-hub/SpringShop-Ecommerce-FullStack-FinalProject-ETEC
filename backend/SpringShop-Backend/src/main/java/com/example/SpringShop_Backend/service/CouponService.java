package com.example.SpringShop_Backend.service;

import com.example.SpringShop_Backend.dto.response.CouponResponse;

import java.util.List;

public interface CouponService {
    CouponResponse subscribe(String email);
    List<CouponResponse> getMyCoupons();
    CouponResponse validate(String email, String code);
    CouponResponse validateForCheckout(String code);
    void recordUsage(Long couponId, int usedCount);
    void restoreUsage(Long couponId, int usedCount);
    void markExpiredIfNeeded(Long couponId);
}
