package com.example.SpringShop_Backend.service;

public interface EmailService {

    void sendOtpEmail(String toEmail, String otpCode);
}
