package com.example.SpringShop_Backend.controller;

import com.example.SpringShop_Backend.dto.request.LogoutRequest;
import com.example.SpringShop_Backend.dto.request.RefreshTokenRequest;
import com.example.SpringShop_Backend.dto.request.SendOtpRequest;
import com.example.SpringShop_Backend.dto.request.UserLoginRequest;
import com.example.SpringShop_Backend.dto.request.UserRegisterRequest;
import com.example.SpringShop_Backend.dto.request.VerifyOtpRequest;
import com.example.SpringShop_Backend.dto.response.AuthResponse;
import com.example.SpringShop_Backend.dto.response.OtpResponse;
import com.example.SpringShop_Backend.dto.response.RefreshTokenResponse;
import com.example.SpringShop_Backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<OtpResponse> register(@Valid @RequestBody UserRegisterRequest request) {

        OtpResponse response = authService.register(request);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<OtpResponse> login(@Valid @RequestBody UserLoginRequest request) {

        OtpResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/send-otp")
    public ResponseEntity<OtpResponse> sendOtp(@Valid @RequestBody SendOtpRequest request) {

        OtpResponse response = authService.sendOtp(request);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request,
            HttpServletRequest httpRequest) {

        AuthResponse response = authService.verifyOtp(request, httpRequest);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshTokenResponse> refresh(
            @Valid @RequestBody RefreshTokenRequest request,
            HttpServletRequest httpRequest) {

        RefreshTokenResponse response = authService.refresh(request, httpRequest);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@Valid @RequestBody LogoutRequest request) {

        authService.logout(request);

        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
