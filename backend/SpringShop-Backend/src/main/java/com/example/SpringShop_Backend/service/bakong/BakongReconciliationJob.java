package com.example.SpringShop_Backend.service.bakong;

import com.example.SpringShop_Backend.config.BakongProperties;
import com.example.SpringShop_Backend.entity.PaymentAttempt;
import com.example.SpringShop_Backend.enumm.PaymentAttemptStatus;
import com.example.SpringShop_Backend.repository.PaymentAttemptRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Settles pending payments in the background using batched Bakong lookups.
 *
 * <p>With a daily allowance in the low hundreds, per-order polling from every open
 * browser tab is not affordable. This pass checks every unsettled KHQR in a single
 * batched request, so a shop with 40 pending orders costs one request per cycle
 * rather than 40, and payments still settle after the customer closes the tab.
 *
 * <p>It deliberately does nothing when mock mode is on, and refuses to start a
 * pass it cannot afford.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BakongReconciliationJob {

    private final BakongProperties properties;
    private final PaymentAttemptRepository attemptRepository;
    private final BakongBatchStatusClient batchStatusClient;
    private final BakongQuotaGuard quotaGuard;
    private final PaymentStatusCache statusCache;

    /** Skip attempts older than this: the QR is long dead and re-checking is waste. */
    private static final Duration MAX_AGE = Duration.ofDays(2);

    @Scheduled(
            fixedDelayString = "${bakong.reconciliation-interval-seconds:300}000",
            initialDelayString = "${bakong.reconciliation-initial-delay-seconds:60}000")
    public void reconcile() {
        if (!properties.isReconciliationEnabled() || properties.isMock() || properties.isDemoMerchant()) {
            return;
        }

        // Production only answers per-hash lookups, so every hash checked here
        // costs a request. Take a small, bounded slice and never start one the
        // budget cannot finish - the browser poll is the primary detector and
        // this is only a safety net for customers who closed the tab.
        int limit = Math.max(1, properties.getReconciliationBatchLimit());
        if (!quotaGuard.canAfford(1)) {
            log.warn("Skipping Bakong reconciliation: daily request budget is spent.");
            return;
        }
        int affordable = (int) Math.min(limit, quotaGuard.getRemaining());
        int before = quotaGuard.getUsed();

        List<PaymentAttempt> candidates;
        try {
            candidates = attemptRepository.findUnsettledSince(
                    LocalDateTime.now().minus(MAX_AGE), PageRequest.of(0, affordable));
        } catch (RuntimeException e) {
            log.warn("Could not load unsettled payment attempts: {}", e.getMessage());
            return;
        }

        if (candidates.isEmpty()) {
            return;
        }
        log.info("Reconciling up to {} unsettled payment attempt(s) from {} candidate(s).",
                affordable, candidates.size());

        List<String> hashes = new ArrayList<>();
        for (PaymentAttempt attempt : candidates) {
            if (attempt.getStatus() == PaymentAttemptStatus.PENDING
                    && attempt.getMd5() != null
                    && !attempt.getMd5().isBlank()
                    && attempt.getMd5().length() == 32
                    && !hashes.contains(attempt.getMd5())) {
                hashes.add(attempt.getMd5());
            }
        }
        if (hashes.isEmpty()) {
            return;
        }

        Map<String, JsonNode> settled;
        try {
            settled = batchStatusClient.lookup(hashes);
        } catch (BakongQuotaExceededException e) {
            log.warn("Stopping Bakong reconciliation early: {}", e.getMessage());
            return;
        } catch (RuntimeException e) {
            log.warn("Bakong reconciliation pass failed: {}", e.getMessage());
            return;
        }

        if (settled.isEmpty()) {
            // Cache the negative result so the customer's next poll is served
            // without spending another request. This is the single biggest saver:
            // without it, reconciler and browser each pay for the same answer.
            for (String md5 : hashes) {
                statusCache.putUnpaid(md5);
            }
            log.info("Reconciliation checked {} payment(s) using {} request(s); none settled yet.",
                    hashes.size(), quotaGuard.getUsed() - before);
            return;
        }

        // Record the outcome. Settlement itself is left to the order's own status
        // check so amount validation, underpayment handling and order transitions
        // stay in exactly one place.
        Map<PaymentAttempt, JsonNode> matched = new HashMap<>();
        for (PaymentAttempt attempt : candidates) {
            JsonNode data = settled.get(attempt.getMd5());
            if (data != null) {
                matched.put(attempt, data);
            }
        }

        for (Map.Entry<PaymentAttempt, JsonNode> entry : matched.entrySet()) {
            PaymentAttempt attempt = entry.getKey();
            JsonNode data = entry.getValue();
            if (attempt.getStatus() != PaymentAttemptStatus.PENDING) {
                continue;
            }
            attempt.setPaidCurrency(data.path("currency").asText(attempt.getCurrency()));
            if (data.path("amount") != null && !data.path("amount").isMissingNode()) {
                attempt.setPaidAmount(new java.math.BigDecimal(data.path("amount").asText()));
            }
            attemptRepository.save(attempt);
            // Prime the cache with the answer we already paid for, instead of
            // throwing it away and making the next status check buy it again.
            statusCache.putPaid(attempt.getMd5(), data);
            log.info("Reconciliation found a settled payment for order {} (md5={}). "
                            + "The customer's next status check will finalise it.",
                    attempt.getOrder().getId(), attempt.getMd5());
        }

        log.info("Reconciliation checked {} payment(s) using {} request(s); {} settled.",
                hashes.size(), quotaGuard.getUsed() - before, matched.size());
    }
}
