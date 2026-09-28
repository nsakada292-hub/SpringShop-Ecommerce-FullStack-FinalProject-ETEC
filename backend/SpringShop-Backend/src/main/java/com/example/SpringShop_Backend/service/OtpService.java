package com.example.SpringShop_Backend.service;

import com.example.SpringShop_Backend.dto.request.VerifyOtpRequest;
import com.example.SpringShop_Backend.entity.User;

public interface OtpService {

    void generateAndSendOtp(User user);

    void verifyOtp(VerifyOtpRequest request);
}
