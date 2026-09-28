package com.example.SpringShop_Backend.service.bakong;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Short-lived cache of Bakong lookup results, keyed by KHQR md5.
 *
 * <p>This is what keeps a daily request budget viable. The browser may poll every
 * few seconds, but the md5 answer is only fetched from Bakong once per
 * {@code bakong.min-status-check-interval-seconds}; every poll in between is
 * answered from here for free. Settlement logic still runs on every poll against
 * fresh database state, so caching the lookup can never hide a real payment.
 */
@Component
@Slf4j
public class PaymentStatusCache {

    /**
     * Result of asking Bakong about one KHQR. "Not settled yet" is a real answer
     * worth caching, so it gets its own case rather than being encoded as a null
     * node or a bare boolean mixed in with parsed JSON.
     */
    public record LookupOutcome(boolean settled, JsonNode data) {

        public static LookupOutcome unpaid() {
            return new LookupOutcome(false, null);
        }

        public static LookupOutcome paid(JsonNode transactionData) {
            return new LookupOutcome(true, transactionData);
        }
    }

    private record Entry(Instant cachedAt, Object value) {
    }

    private final Map<String, Entry> entries = new ConcurrentHashMap<>();

    /** @return the cached value when younger than {@code maxAge}, otherwise null */
    public LookupOutcome getIfFresh(String key, Duration maxAge) {
        Entry entry = entries.get(key);
        if (entry == null) {
            return null;
        }
        if (Duration.between(entry.cachedAt(), Instant.now()).compareTo(maxAge) >= 0) {
            return null;
        }
        return (LookupOutcome) entry.value();
    }

    public void put(String key, LookupOutcome value) {        entries.put(key, new Entry(Instant.now(), value));
    }

    /**
     * Drops a cached entry so the next read hits Bakong. Used once a payment is
     * confirmed, and to stop a negative result being trusted after a retry.
     */
    /** Caches "asked Bakong, not settled yet" so the next poll costs nothing. */
    public void putUnpaid(String key) {
        put(key, LookupOutcome.unpaid());
    }

    /** Caches a settled transaction so the next poll can finalise without a request. */
    public void putPaid(String key, JsonNode transactionData) {
        put(key, LookupOutcome.paid(transactionData));
    }

    public void invalidate(String key) {
        entries.remove(key);
    }

    public int size() {
        return entries.size();
    }
}
