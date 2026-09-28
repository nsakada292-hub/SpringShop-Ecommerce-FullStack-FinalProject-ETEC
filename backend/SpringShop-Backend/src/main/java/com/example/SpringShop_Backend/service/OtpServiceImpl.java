package com.example.SpringShop_Backend.service;

import com.example.SpringShop_Backend.dto.request.VerifyOtpRequest;
import com.example.SpringShop_Backend.entity.User;
import com.example.SpringShop_Backend.exception.BadRequestException;
import com.example.SpringShop_Backend.repository.UserRepository;
import com.example.SpringShop_Backend.security.TokenHasher;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private static final int MAX_OTP_ATTEMPTS = 5;

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final TokenHasher tokenHasher;

    private static final SecureRandom RANDOM = new SecureRandom();

    @Value("${app.otp.expiry-minutes:5}")
    private long otpExpiryMinutes;

    @Override
    public void generateAndSendOtp(User user) {

        if (user.getOtpExpiryTime() != null && user.getOtpExpiryTime().isAfter(LocalDateTime.now())
                && safeInt(user.getOtpAttempts()) >= MAX_OTP_ATTEMPTS) {
            throw new BadRequestException("Too many verification attempts. Please request a new code later.");
        }

        String otpCode = String.valueOf(100000 + RANDOM.nextInt(900000));

        user.setOtpCode(tokenHasher.hash(otpCode));
        user.setOtpExpiryTime(LocalDateTime.now().plusMinutes(otpExpiryMinutes));
        user.setOtpAttempts(0);

        userRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), otpCode);
    }

    @Override
    public void verifyOtp(VerifyOtpRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or code"));

        if (user.getOtpCode() == null || user.getOtpExpiryTime() == null) {
            throw new BadRequestException("Invalid email or code");
        }

        if (user.getOtpExpiryTime().isBefore(LocalDateTime.now())) {
            user.setOtpCode(null);
            user.setOtpExpiryTime(null);
            user.setOtpAttempts(0);
            userRepository.save(user);
            throw new BadRequestException("Invalid email or code");
        }

        if (safeInt(user.getOtpAttempts()) >= MAX_OTP_ATTEMPTS) {
            throw new BadRequestException("Too many verification attempts. Please request a new code later.");
        }

        if (!user.getOtpCode().equals(tokenHasher.hash(request.getOtpCode()))) {
            user.setOtpAttempts(safeInt(user.getOtpAttempts()) + 1);
            userRepository.save(user);
            throw new BadRequestException("Invalid email or code");
        }

        user.setVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiryTime(null);
        user.setOtpAttempts(0);

        userRepository.save(user);
    }

    private int safeInt(Integer value) {
        return value == null ? 0 : value;
    }
}