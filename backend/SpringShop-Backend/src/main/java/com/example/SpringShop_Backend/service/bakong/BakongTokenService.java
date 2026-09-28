package com.example.SpringShop_Backend.service.bakong;

import com.example.SpringShop_Backend.config.BakongProperties;
import com.example.SpringShop_Backend.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BakongTokenService {

    private static final String RENEW_PATH = "/v1/renew_token";

    private final BakongProperties properties;
    private final BakongRestClient bakongRestClient;
    private final ObjectMapper objectMapper;

    private String cachedToken;
    private Instant tokenExpiry;

    public synchronized String getToken() {
        String configured = properties.getToken();
        if (configured != null && !configured.isBlank()) {
            return configured.trim();
        }

        if (cachedToken != null && tokenExpiry != null
                && Instant.now().isBefore(tokenExpiry.minus(Duration.ofMinutes(2)))) {
            return cachedToken;
        }

        return renewToken();
    }

    private String renewToken() {
        String email = properties.getEmail();
        if (email == null || email.isBlank()) {
            throw new BadRequestException(
                    "Bakong API is not configured. Set a static token or a registered email (bakong.token / bakong.email).");
        }

        JsonNode root = bakongRestClient.post(RENEW_PATH, null, Map.of("email", email));
        JsonNode tokenNode = root.path("data").path("token");

        if (tokenNode.isMissingNode() || tokenNode.isNull() || tokenNode.asText().isBlank()) {
            throw new BadRequestException("Bakong did not return an access token for email " + email);
        }

        cachedToken = tokenNode.asText();
        tokenExpiry = parseExpiry(cachedToken);
        return cachedToken;
    }

    private Instant parseExpiry(String jwt) {
        try {
            String[] parts = jwt.split("\\.");
            if (parts.length < 2) {
                return Instant.now().plus(Duration.ofMinutes(55));
            }
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            long exp = objectMapper.readTree(payload).path("exp").asLong();
            return exp > 0 ? Instant.ofEpochSecond(exp) : Instant.now().plus(Duration.ofMinutes(55));
        } catch (Exception e) {
            return Instant.now().plus(Duration.ofMinutes(55));
        }
    }
}