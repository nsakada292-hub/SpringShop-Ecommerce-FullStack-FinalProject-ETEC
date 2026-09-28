package com.example.SpringShop_Backend.service.bakong;

import com.example.SpringShop_Backend.config.BakongProperties;
import com.example.SpringShop_Backend.exception.BadRequestException;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Component
public class BakongRestClient {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final BakongQuotaGuard quotaGuard;

    public BakongRestClient(BakongProperties properties, ObjectMapper objectMapper,
                            BakongQuotaGuard quotaGuard) {
        this.restClient = RestClient.builder().baseUrl(properties.getBaseUrl()).build();
        this.objectMapper = objectMapper;
        this.quotaGuard = quotaGuard;
    }

    /**
     * Sends one request, spending a unit of the daily budget.
     *
     * @throws BakongQuotaExceededException when the daily allowance is spent
     */
    public JsonNode post(String path, String bearerToken, Object body) {
        return post(path, bearerToken, body, 1);
    }

    /**
     * Sends one request that covers {@code quotaCost} units of the daily budget.
     * A batched call covering 20 orders passes 20, so a batch is never started
     * unless the whole batch fits in what is left.
     */
    public JsonNode post(String path, String bearerToken, Object body, int quotaCost) {
        if (!quotaGuard.tryConsume(quotaCost)) {
            throw new BakongQuotaExceededException(
                    "Bakong daily request budget of " + quotaGuard.getLimit() + " is used up. "
                            + "Payments cannot be verified until the budget resets. "
                            + "Raise bakong.daily-request-budget only if NBC has granted you more.");
        }

        try {
            String responseBody = restClient.post()
                    .uri(path)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .headers(headers -> {
                        if (bearerToken != null && !bearerToken.isBlank()) {
                            headers.setBearerAuth(bearerToken);
                        }
                    })
                    .body(body)
                    .retrieve()
                    .body(String.class);

            return objectMapper.readTree(responseBody);
        } catch (Exception e) {
            throw new BadRequestException("Bakong API request failed: " + e.getMessage());
        }
    }
}