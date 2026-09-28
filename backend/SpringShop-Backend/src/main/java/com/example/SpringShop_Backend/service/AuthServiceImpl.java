package com.example.SpringShop_Backend.service;

import com.example.SpringShop_Backend.config.CustomUserDetailsService;
import com.example.SpringShop_Backend.dto.request.LogoutRequest;
import com.example.SpringShop_Backend.dto.request.RefreshTokenRequest;
import com.example.SpringShop_Backend.dto.request.SendOtpRequest;
import com.example.SpringShop_Backend.dto.request.UserLoginRequest;
import com.example.SpringShop_Backend.dto.request.UserRegisterRequest;
import com.example.SpringShop_Backend.dto.request.VerifyOtpRequest;
import com.example.SpringShop_Backend.dto.response.AuthResponse;
import com.example.SpringShop_Backend.dto.response.OtpResponse;
import com.example.SpringShop_Backend.dto.response.RefreshTokenResponse;
import com.example.SpringShop_Backend.dto.response.UserResponse;
import com.example.SpringShop_Backend.entity.User;
import com.example.SpringShop_Backend.exception.BadRequestException;
import com.example.SpringShop_Backend.exception.LockedAccountException;
import com.example.SpringShop_Backend.repository.UserRepository;
import com.example.SpringShop_Backend.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final int LOCKOUT_MINUTES = 15;

    private final UserService userService;
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final OtpService otpService;
    private final RefreshTokenService refreshTokenService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    public OtpResponse register(UserRegisterRequest request) {

        User user = findByEmailSuppress(request.getEmail());

        if (user == null) {
            userService.register(request);
            user = findByEmailSuppress(request.getEmail());
            otpService.generateAndSendOtp(user);
            return OtpResponse.builder()
                    .message("Account created. A verification code has been sent to " + request.getEmail())
                    .build();
        }

        otpService.generateAndSendOtp(user);
        return OtpResponse.builder()
                .message("Account created. A verification code has been sent to " + request.getEmail())
                .build();
    }

    @Override
    public OtpResponse login(UserLoginRequest request) {

        User user = findByEmailSuppress(request.getEmail());

        if (user != null) {
            if (isLockedOut(user)) {
                throw new LockedAccountException("Account temporarily locked. Try again later.");
            }

            try {
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
                );

                user.setLoginAttempts(0);
                user.setLockoutTime(null);
                userRepository.save(user);

                otpService.generateAndSendOtp(user);
                return OtpResponse.builder()
                        .message("A verification code has been sent to " + user.getEmail() + ". Please verify to log in.")
                        .build();
            } catch (AuthenticationException ex) {
                int attempts = safeInt(user.getLoginAttempts()) + 1;
                user.setLoginAttempts(attempts);
                if (attempts >= MAX_LOGIN_ATTEMPTS) {
                    user.setLockoutTime(LocalDateTime.now().plusMinutes(LOCKOUT_MINUTES));
                    user.setLoginAttempts(0);
                }
                userRepository.save(user);
                throw new BadCredentialsException("Invalid email or password");
            }
        }

        return OtpResponse.builder()
                .message("A verification code has been sent to " + request.getEmail() + ". Please verify to log in.")
                .build();
    }

    @Override
    public OtpResponse sendOtp(SendOtpRequest request) {

        User user = findByEmailSuppress(request.getEmail());

        if (user != null && !isLockedOut(user)) {
            otpService.generateAndSendOtp(user);
        }

        return OtpResponse.builder()
                .message("A verification code has been sent to " + request.getEmail())
                .build();
    }

    @Override
    public AuthResponse verifyOtp(VerifyOtpRequest request, HttpServletRequest httpRequest) {

        otpService.verifyOtp(request);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or code"));

        if (!user.isVerified()) {
            throw new BadRequestException("Invalid email or code");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());

        String accessToken = jwtService.generateAccessToken(userDetails);
        String refreshToken = refreshTokenService.createRefreshToken(user, deviceInfo(httpRequest));

        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();

        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.extractExpirationMs(accessToken))
                .user(userResponse)
                .build();
    }

    @Override
    public RefreshTokenResponse refresh(RefreshTokenRequest request, HttpServletRequest httpRequest) {
        return refreshTokenService.refresh(request.getRefreshToken(), deviceInfo(httpRequest));
    }

    @Override
    public void logout(LogoutRequest request) {
        refreshTokenService.logout(request.getRefreshToken());
    }

    private boolean isLockedOut(User user) {
        return user.getLockoutTime() != null && user.getLockoutTime().isAfter(LocalDateTime.now());
    }

    private int safeInt(Integer value) {
        return value == null ? 0 : value;
    }

    private User findByEmailSuppress(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    private String deviceInfo(HttpServletRequest request) {
        try {
            String forwarded = request.getHeader("X-Forwarded-For");
            String ip = (forwarded != null && !forwarded.isBlank())
                    ? forwarded.split(",")[0].trim()
                    : request.getRemoteAddr();
            return "ip=" + ip + ";ua=" + request.getHeader("User-Agent");
        } catch (Exception ex) {
            return "";
        }
    }
}
