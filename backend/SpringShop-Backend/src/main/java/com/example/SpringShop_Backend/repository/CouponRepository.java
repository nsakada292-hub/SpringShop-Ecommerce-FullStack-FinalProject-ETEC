package com.example.SpringShop_Backend.repository;

import com.example.SpringShop_Backend.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CouponRepository extends JpaRepository<Coupon, Long> {
    List<Coupon> findByEmailOrderByCreatedAtDesc(String email);
    List<Coupon> findByUserIdOrderByCreatedAtDesc(Long userId);
    boolean existsByEmailAndCode(String email, String code);
}
