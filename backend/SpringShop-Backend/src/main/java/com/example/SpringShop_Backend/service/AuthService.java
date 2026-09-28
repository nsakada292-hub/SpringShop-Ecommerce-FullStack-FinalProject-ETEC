package com.example.SpringShop_Backend.service;

import com.example.SpringShop_Backend.dto.request.LogoutRequest;
import com.example.SpringShop_Backend.dto.request.RefreshTokenRequest;
import com.example.SpringShop_Backend.dto.request.SendOtpRequest;
import com.example.SpringShop_Backend.dto.request.UserLoginRequest;
import com.example.SpringShop_Backend.dto.request.UserRegisterRequest;
import com.example.SpringShop_Backend.dto.request.VerifyOtpRequest;
import com.example.SpringShop_Backend.dto.response.AuthResponse;
import com.example.SpringShop_Backend.dto.response.OtpResponse;
import com.example.SpringShop_Backend.dto.response.RefreshTokenResponse;
import jakarta.servlet.http.HttpServletRequest;

public interface AuthService {

    OtpResponse register(UserRegisterRequest request);

    OtpResponse login(UserLoginRequest request);

    OtpResponse sendOtp(SendOtpRequest request);

    AuthResponse verifyOtp(VerifyOtpRequest request, HttpServletRequest httpRequest);

    RefreshTokenResponse refresh(RefreshTokenRequest request, HttpServletRequest httpRequest);

    void logout(LogoutRequest request);
}
