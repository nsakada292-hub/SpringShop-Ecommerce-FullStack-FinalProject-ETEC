package com.example.SpringShop_Backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.WeakKeyException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

@Service
public class JwtService {

    public static final String ACCESS_TOKEN_TYPE = "access";
    public static final String REFRESH_TOKEN_TYPE = "refresh";

    private static final int MIN_SECRET_BYTES = 32;

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long expirationTime;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpirationTime;

    @Value("${jwt.issuer}")
    private String issuer;

    public String generateAccessToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", ACCESS_TOKEN_TYPE);
        claims.put("tokenId", UUID.randomUUID().toString());
        claims.put("scope", buildScope(userDetails));
        return generateToken(userDetails, claims, expirationTime);
    }

    public String generateRefreshToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", REFRESH_TOKEN_TYPE);
        claims.put("tokenId", UUID.randomUUID().toString());
        return generateToken(userDetails, claims, refreshExpirationTime);
    }

    private String generateToken(UserDetails userDetails, Map<String, Object> claims, long ttlMillis) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + ttlMillis);

        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(userDetails.getUsername())
                .issuer(issuer)
                .claims(claims)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private String buildScope(UserDetails userDetails) {
        return userDetails.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .reduce((a, b) -> a + " " + b)
                .orElse("");
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractIssuer(String token) {
        return extractClaim(token, Claims::getIssuer);
    }

    public String extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get("type", String.class));
    }

    public String extractTokenId(String token) {
        return extractClaim(token, claims -> claims.get("tokenId", String.class));
    }

    public boolean isAccessToken(String token) {
        return ACCESS_TOKEN_TYPE.equals(extractTokenType(token));
    }

    public boolean isRefreshToken(String token) {
        return REFRESH_TOKEN_TYPE.equals(extractTokenType(token));
    }

    public boolean isAccessTokenValid(String token, UserDetails userDetails) {
        String email = extractEmail(token);
        boolean emailMatches = email.equals(userDetails.getUsername());
        boolean notExpired = !isTokenExpired(token);
        boolean correctIssuer = issuer.equals(extractIssuer(token));
        boolean accessType = isAccessToken(token);

        return emailMatches && notExpired && correctIssuer && accessType && userDetails.isEnabled();
    }

    public boolean isRefreshTokenValid(String token, UserDetails userDetails) {
        String email = extractEmail(token);
        boolean emailMatches = email.equals(userDetails.getUsername());
        boolean notExpired = !isTokenExpired(token);
        boolean correctIssuer = issuer.equals(extractIssuer(token));
        boolean refreshType = isRefreshToken(token);

        return emailMatches && notExpired && correctIssuer && refreshType;
    }

    public boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    public long extractExpirationMs(String token) {
        Date expiration = extractClaim(token, Claims::getExpiration);
        return expiration.getTime() - System.currentTimeMillis();
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .requireIssuer(issuer)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(secretKey);
        } catch (Exception ex) {
            throw new IllegalArgumentException("jwt.secret must be a valid Base64 value", ex);
        }
        if (keyBytes.length < MIN_SECRET_BYTES) {
            throw new IllegalArgumentException("jwt.secret must decode to at least " + MIN_SECRET_BYTES + " bytes (256 bits) for HS256");
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
