package com.example.SpringShop_Backend.service;

import com.example.SpringShop_Backend.config.CustomUserDetailsService;
import com.example.SpringShop_Backend.dto.response.RefreshTokenResponse;
import com.example.SpringShop_Backend.entity.RefreshToken;
import com.example.SpringShop_Backend.entity.User;
import com.example.SpringShop_Backend.exception.BadRequestException;
import com.example.SpringShop_Backend.repository.RefreshTokenRepository;
import com.example.SpringShop_Backend.security.JwtService;
import com.example.SpringShop_Backend.security.TokenHasher;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final TokenHasher tokenHasher;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpirationMs;

    @Transactional
    public String createRefreshToken(User user, String deviceInfo) {
        String token = jwtService.generateRefreshToken(userDetailsService.loadUserByUsername(user.getEmail()));
        String tokenId = jwtService.extractTokenId(token);

        RefreshToken refreshToken = RefreshToken.builder()
                .tokenHash(tokenHasher.hash(token))
                .tokenId(tokenId)
                .user(user)
                .deviceInfo(truncate(deviceInfo, 255))
                .revoked(false)
                .expiresAt(LocalDateTime.now().plusSeconds(refreshExpirationMs / 1000))
                .build();

        refreshTokenRepository.deleteByUser_IdAndRevokedTrue(user.getId());
        refreshTokenRepository.save(refreshToken);

        return token;
    }

    @Transactional
    public RefreshTokenResponse refresh(String rawToken, String deviceInfo) {
        RefreshToken stored = findValidToken(rawToken);
        if (stored == null) {
            throw new BadRequestException("Invalid refresh token");
        }

        String email = jwtService.extractEmail(rawToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);

        if (!jwtService.isRefreshTokenValid(rawToken, userDetails)) {
            revokeAllUserTokens(stored.getUser().getId());
            throw new BadRequestException("Invalid refresh token");
        }

        if (!stored.getTokenId().equals(jwtService.extractTokenId(rawToken))) {
            revokeAllUserTokens(stored.getUser().getId());
            throw new BadRequestException("Invalid refresh token");
        }

        User user = stored.getUser();
        revokeAllUserTokens(user.getId());

        String newAccessToken = jwtService.generateAccessToken(userDetails);
        String newRawRefresh = createRefreshToken(user, deviceInfo);

        return RefreshTokenResponse.builder()
                .token(newAccessToken)
                .refreshToken(newRawRefresh)
                .tokenType("Bearer")
                .expiresIn(jwtService.extractExpirationMs(newAccessToken))
                .build();
    }

    @Transactional
    public void logout(String rawToken) {
        RefreshToken stored = findValidToken(rawToken);
        if (stored != null) {
            stored.setRevoked(true);
            refreshTokenRepository.save(stored);
        }
    }

    @Transactional(readOnly = true)
    private RefreshToken findValidToken(String rawToken) {
        RefreshToken refreshToken = refreshTokenRepository.findByTokenHash(tokenHasher.hash(rawToken))
                .orElse(null);

        if (refreshToken == null) {
            return null;
        }

        if (refreshToken.isRevoked()) {
            throw new BadRequestException("Refresh token has been revoked");
        }

        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Refresh token has expired");
        }

        return refreshToken;
    }

    @Transactional
    public void revokeAllUserTokens(Long userId) {
        refreshTokenRepository.findByUser_IdAndRevokedFalse(userId)
                .forEach(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                });
    }

    public String getTokenHash(String rawToken) {
        return tokenHasher.hash(rawToken);
    }

    private String truncate(String value, int maxLength) {
        if (value == null) {
            return "";
        }
        return value.length() > maxLength ? value.substring(0, maxLength) : value;
    }
}
