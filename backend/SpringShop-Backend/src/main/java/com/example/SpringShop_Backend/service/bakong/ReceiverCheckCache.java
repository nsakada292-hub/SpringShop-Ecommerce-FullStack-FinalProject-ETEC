package com.example.SpringShop_Backend.service.bakong;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Caches the advisory "is this account able to receive" lookup.
 *
 * <p>The receiving account does not change between checkouts, so re-verifying it
 * on every QR is pure quota waste. The answer is remembered for
 * {@code bakong.receiver-cache-minutes} instead.
 */
@Component
@Slf4j
public class ReceiverCheckCache {

    private record Entry(Instant checkedAt, String summary) {
    }

    private final Map<String, Entry> entries = new ConcurrentHashMap<>();

    /** @return the cached summary when still fresh, otherwise null */
    public String getIfFresh(String accountId, Duration maxAge) {
        Entry entry = entries.get(accountId);
        if (entry == null) {
            return null;
        }
        if (Duration.between(entry.checkedAt(), Instant.now()).compareTo(maxAge) >= 0) {
            return null;
        }
        return entry.summary();
    }

    public void put(String accountId, String summary) {
        entries.put(accountId, new Entry(Instant.now(), summary));
    }
}
