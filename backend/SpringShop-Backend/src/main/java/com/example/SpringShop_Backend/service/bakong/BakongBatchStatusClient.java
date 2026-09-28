package com.example.SpringShop_Backend.service.bakong;

import com.example.SpringShop_Backend.config.BakongProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Single place that asks Bakong whether KHQRs have settled.
 *
 * <p>Production exposes only {@code check_transaction_by_md5}, which answers for a
 * single hash and costs one request. The {@code check_transaction_by_md5_list}
 * endpoint appears in the SDKs but the live gateway answers 403 for it on a
 * standard account, so it is off by default and probed at most once - if it is
 * ever rejected the integration stops trying and uses the per-hash endpoint.
 *
 * <p>Either way the caller gets the same map back, and every hash costs one unit
 * of the daily budget, which {@link BakongQuotaGuard} enforces.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BakongBatchStatusClient {

    private static final String CHECK_MD5_PATH = "/v1/check_transaction_by_md5";
    private static final String CHECK_MD5_LIST_PATH = "/v1/check_transaction_by_md5_list";

    private final BakongProperties properties;
    private final BakongTokenService tokenService;
    private final BakongRestClient restClient;
    private final BakongQuotaGuard quotaGuard;

    /** Set once the list endpoint is known to be unavailable, so we stop probing it. */
    private volatile boolean listEndpointUnavailable = false;

    /**
     * Looks up a set of md5 hashes.
     *
     * @return md5 -> transaction data for hashes that have settled. Unsettled
     *         hashes are simply absent.
     * @throws BakongQuotaExceededException when the daily budget cannot cover the lookups
     */
    public Map<String, JsonNode> lookup(List<String> md5s) {
        Map<String, JsonNode> found = new HashMap<>();
        List<String> hashes = pendingHashes(md5s);
        if (hashes.isEmpty()) {
            return found;
        }

        if (useListEndpoint(hashes)) {
            return lookupViaList(hashes);
        }
        return lookupIndividually(hashes);
    }

    private boolean useListEndpoint(List<String> hashes) {
        if (listEndpointUnavailable || !properties.isStatusBatchSupported()) {
            return false;
        }
        // Only worth it if more than one hash, and only if the whole batch is affordable.
        return hashes.size() > 1 && quotaGuard.canAfford(hashes.size());
    }

    private Map<String, JsonNode> lookupViaList(List<String> hashes) {
        Map<String, JsonNode> found = new HashMap<>();
        String bearer = tokenService.getToken();

        try {
            JsonNode root = restClient.post(CHECK_MD5_LIST_PATH, bearer, Map.of("list", hashes), hashes.size());
            if (!"0".equals(root.path("responseCode").asText())) {
                log.warn("check_transaction_by_md5_list rejected (responseCode={}, errorCode={}). "
                                + "Falling back to per-hash lookups.",
                        root.path("responseCode").asText("?"), root.path("errorCode").asText("?"));
                listEndpointUnavailable = true;
                return lookupIndividually(hashes);
            }
            found.putAll(parseListResponse(root, hashes));
            return found;
        } catch (BakongQuotaExceededException e) {
            throw e;
        } catch (RuntimeException e) {
            // A 403 here means the account is not entitled to the list endpoint.
            // Trying it again every pass would burn time and log noise for nothing.
            listEndpointUnavailable = true;
            log.warn("check_transaction_by_md5_list unavailable ({}). Using per-hash lookups instead.", e.getMessage());
            return lookupIndividually(hashes);
        }
    }

    private Map<String, JsonNode> lookupIndividually(List<String> hashes) {
        Map<String, JsonNode> found = new HashMap<>();
        String bearer = tokenService.getToken();

        for (String md5 : hashes) {
            // Stop rather than start a lookup the budget cannot finish.
            if (!quotaGuard.canAfford(1)) {
                throw new BakongQuotaExceededException(
                        "Bakong daily request budget of " + quotaGuard.getLimit()
                                + " is used up; cannot verify " + hashes.size() + " pending payment(s).");
            }
            try {
                JsonNode root = restClient.post(CHECK_MD5_PATH, bearer, Map.of("md5", md5));
                if (!"0".equals(root.path("responseCode").asText())) {
                    // responseCode 1 simply means "no transaction for this hash yet".
                    continue;
                }
                JsonNode data = root.path("data");
                if (data.isMissingNode() || data.isNull()) {
                    continue;
                }
                found.put(md5, data);
            } catch (BakongQuotaExceededException e) {
                throw e;
            } catch (RuntimeException e) {
                log.warn("Bakong lookup failed for md5={}: {}", md5, e.getMessage());
            }
        }
        return found;
    }

    private Map<String, JsonNode> parseListResponse(JsonNode root, List<String> hashes) {
        Map<String, JsonNode> found = new HashMap<>();
        JsonNode list = root.path("data").path("list");
        if (!list.isArray()) {
            return found;
        }
        for (JsonNode element : list) {
            JsonNode data = element.has("data") ? element.path("data") : element;
            String hash = text(data, "hash", null);
            if (hash != null && data.has("amount")) {
                found.put(hash, data);
            }
            String ref = text(data, "externalRef", null);
            if (ref != null && hashes.contains(ref) && data.has("amount")) {
                found.put(ref, data);
            }
        }
        return found;
    }

    /** Distinct, non-blank md5 values worth checking, order preserved. */
    public static List<String> pendingHashes(List<String> candidates) {
        List<String> distinct = new ArrayList<>();
        if (candidates == null) {
            return distinct;
        }
        for (String candidate : candidates) {
            if (candidate != null && !candidate.isBlank() && !distinct.contains(candidate)) {
                distinct.add(candidate);
            }
        }
        return distinct;
    }

    private static String text(JsonNode node, String field, String fallback) {
        if (node == null) {
            return fallback;
        }
        JsonNode value = node.path(field);
        return value.isMissingNode() || value.isNull() ? fallback : value.asText();
    }
}
