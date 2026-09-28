package com.example.SpringShop_Backend.service;

import com.example.SpringShop_Backend.dto.response.CouponResponse;
import com.example.SpringShop_Backend.entity.Coupon;
import com.example.SpringShop_Backend.entity.User;
import com.example.SpringShop_Backend.exception.BadRequestException;
import com.example.SpringShop_Backend.exception.NotFoundException;
import com.example.SpringShop_Backend.repository.CouponRepository;
import com.example.SpringShop_Backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;
    private final UserRepository userRepository;

    private static final BigDecimal DEFAULT_DISCOUNT_PERCENT = BigDecimal.valueOf(10);
    private static final int COUPON_VALIDITY_DAYS = 30;
    private static final String COUPON_PREFIX = "SAVE10-";
    private static final SecureRandom RANDOM = new SecureRandom();

    @Value("${app.coupon.max-usages:5}")
    private int defaultMaxUsages;

    @Override
    public CouponResponse subscribe(String email) {

        String normalizedEmail = email.trim().toLowerCase();
        User currentUser = getCurrentUserIfPresent();

        // Link to an existing account by email even when the visitor is not logged in
        User matchedUser = currentUser != null
                ? currentUser
                : userRepository.findByEmail(normalizedEmail).orElse(null);

        Coupon existing = couponRepository.findByEmailOrderByCreatedAtDesc(normalizedEmail)
                .stream()
                .filter(c -> !c.isUsed())
                .filter(c -> c.getExpiresAt() == null || c.getExpiresAt().isAfter(LocalDateTime.now()))
                .filter(c -> effectiveUsedCount(c) < effectiveMaxUsages(c))
                .findFirst()
                .orElse(null);

        if (existing != null) {
            if (matchedUser != null && existing.getUserId() == null) {
                existing.setUserId(matchedUser.getId());
                couponRepository.save(existing);
            }
            return toResponse(existing);
        }

        Coupon coupon = Coupon.builder()
                .code(generateUniqueCode())
                .email(normalizedEmail)
                .userId(matchedUser != null ? matchedUser.getId() : null)
                .discountPercent(DEFAULT_DISCOUNT_PERCENT)
                .maxUsages(defaultMaxUsages)
                .usedCount(0)
                .used(false)
                .expiresAt(LocalDateTime.now().plusDays(COUPON_VALIDITY_DAYS))
                .build();

        coupon = couponRepository.save(coupon);

        return toResponse(coupon);
    }

    @Override
    public List<CouponResponse> getMyCoupons() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new BadRequestException("Authentication required");
        }

        String email = authentication.getName().toLowerCase();

        User user = userRepository.findByEmail(authentication.getName()).orElse(null);

        List<Coupon> coupons = new ArrayList<>(couponRepository.findByEmailOrderByCreatedAtDesc(email));
        if (user != null) {
            for (Coupon coupon : couponRepository.findByUserIdOrderByCreatedAtDesc(user.getId())) {
                if (coupons.stream().noneMatch(c -> c.getId().equals(coupon.getId()))) {
                    coupons.add(coupon);
                }
            }
        }

        List<CouponResponse> responses = new ArrayList<>();
        for (Coupon coupon : coupons) {
            responses.add(toResponse(coupon));
        }

        return responses;
    }

    @Override
    public CouponResponse validate(String email, String code) {

        String normalizedEmail = email.trim().toLowerCase();
        String normalizedCode = code.trim().toUpperCase();

        Coupon coupon = couponRepository.findByEmailOrderByCreatedAtDesc(normalizedEmail)
                .stream()
                .filter(c -> c.getCode().equalsIgnoreCase(normalizedCode))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Coupon not found for this email"));

        validateCouponState(coupon);

        return toResponse(coupon);
    }

    @Override
    public CouponResponse validateForCheckout(String code) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new BadRequestException("Authentication required");
        }

        String email = authentication.getName().toLowerCase();
        String normalizedCode = code.trim().toUpperCase();

        User user = userRepository.findByEmail(authentication.getName()).orElse(null);

        List<Coupon> candidates = new ArrayList<>(couponRepository.findByEmailOrderByCreatedAtDesc(email));
        if (user != null) {
            for (Coupon coupon : couponRepository.findByUserIdOrderByCreatedAtDesc(user.getId())) {
                if (candidates.stream().noneMatch(c -> c.getId().equals(coupon.getId()))) {
                    candidates.add(coupon);
                }
            }
        }

        Coupon coupon = candidates.stream()
                .filter(c -> c.getCode().equalsIgnoreCase(normalizedCode))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Coupon not found for this account"));

        validateCouponState(coupon);

        return toResponse(coupon);
    }

    @Override
    public void recordUsage(Long couponId, int usedCount) {

        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new NotFoundException("Coupon not found"));

        int remaining = effectiveMaxUsages(coupon) - effectiveUsedCount(coupon);
        int consumed = Math.min(remaining, usedCount);

        coupon.setUsedCount(effectiveUsedCount(coupon) + consumed);

        if (effectiveUsedCount(coupon) >= effectiveMaxUsages(coupon)) {
            coupon.setUsed(true);
            coupon.setUsedAt(LocalDateTime.now());
        }

        couponRepository.save(coupon);
    }

    @Override
    public void restoreUsage(Long couponId, int usedCount) {

        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new NotFoundException("Coupon not found"));

        int restored = Math.min(effectiveUsedCount(coupon), usedCount);
        coupon.setUsedCount(Math.max(0, effectiveUsedCount(coupon) - restored));

        if (effectiveUsedCount(coupon) < effectiveMaxUsages(coupon)) {
            coupon.setUsed(false);
            coupon.setUsedAt(null);
        }

        couponRepository.save(coupon);
    }

    @Override
    public void markExpiredIfNeeded(Long couponId) {

        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new NotFoundException("Coupon not found"));

        validateCouponState(coupon);
    }

    private void validateCouponState(Coupon coupon) {

        if (coupon.isUsed()) {
            throw new BadRequestException("Coupon has already been fully used");
        }

        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Coupon has expired");
        }

        if (effectiveUsedCount(coupon) >= effectiveMaxUsages(coupon)) {
            throw new BadRequestException("Coupon usage limit reached");
        }
    }

    private String generateUniqueCode() {

        String code;
        boolean exists;

        do {
            StringBuilder sb = new StringBuilder(COUPON_PREFIX);
            for (int i = 0; i < 8; i++) {
                sb.append((char) ('A' + RANDOM.nextInt(26)));
            }
            code = sb.toString();
            exists = couponRepository.existsByEmailAndCode("", code);
        } while (exists);

        return code;
    }

    private User getCurrentUserIfPresent() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null
                || authentication.getPrincipal() == null
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }

        return userRepository.findByEmail(authentication.getName()).orElse(null);
    }

    private int effectiveMaxUsages(Coupon coupon) {
        return coupon.getMaxUsages() != null ? coupon.getMaxUsages() : defaultMaxUsages;
    }

    private int effectiveUsedCount(Coupon coupon) {
        return coupon.getUsedCount() != null ? coupon.getUsedCount() : 0;
    }

    private CouponResponse toResponse(Coupon coupon) {

        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .email(coupon.getEmail())
                .userId(coupon.getUserId())
                .discountPercent(coupon.getDiscountPercent())
                .maxUsages(effectiveMaxUsages(coupon))
                .usedCount(effectiveUsedCount(coupon))
                .used(coupon.isUsed())
                .usedAt(coupon.getUsedAt())
                .expiresAt(coupon.getExpiresAt())
                .createdAt(coupon.getCreatedAt())
                .build();
    }
}