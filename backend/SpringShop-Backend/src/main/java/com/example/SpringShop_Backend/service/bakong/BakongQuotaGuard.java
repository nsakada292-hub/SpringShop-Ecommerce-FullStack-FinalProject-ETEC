package com.example.SpringShop_Backend.service.bakong;

import com.example.SpringShop_Backend.config.BakongProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Guards the Bakong Open API daily request allowance.
 *
 * <p>The published allowance is small (100 requests/day, resetting daily) and a new
 * token can take up to 24h to arrive, so exhausting it is expensive: payments stop
 * being detected until the next reset. A browser polling every few seconds would
 * burn the whole day's budget in minutes, so every outbound call is counted here
 * and refused once the budget runs out.
 *
 * <p>The counter is in-memory and per-instance. It is a safety rail against
 * runaway polling, not a replacement for a shared quota service.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BakongQuotaGuard {

    private final BakongProperties properties;

    private final AtomicInteger used = new AtomicInteger();
    private volatile LocalDate countedOn = LocalDate.now();

    /**
     * Reserves {@code requests} units of the daily budget.
     *
     * @return true when the call may proceed, false when the budget is spent
     */
    public synchronized boolean tryConsume(int requests) {
        rollOverIfNewDay();

        int limit = properties.getDailyRequestBudget();
        if (limit <= 0) {
            return true; // budgeting disabled
        }

        int alreadyUsed = used.get();
        if (alreadyUsed + requests > limit) {
            log.warn("Bakong daily request budget exhausted ({}/{} used, {}% - this call needs {}). "
                            + "Refusing until the budget resets: payments will not be detected until then. "
                            + "Only raise bakong.daily-request-budget if NBC has granted a higher limit.",
                    alreadyUsed, limit,
                    limit <= 0 ? 0 : (int) ((alreadyUsed * 100L) / limit), requests);
            return false;
        }

        int nowUsed = used.addAndGet(requests);
        logBudgetState(limit, nowUsed, alreadyUsed == 0, requests);
        return true;
    }

    public int getUsed() {
        rollOverIfNewDay();
        return used.get();
    }

    public int getLimit() {
        return properties.getDailyRequestBudget();
    }

    public int getRemaining() {
        rollOverIfNewDay();
        return Math.max(0, getLimit() - used.get());
    }

    /**
     * @return true when the budget is spent, so callers can report it instead of failing silently.
     */
    public boolean isExhausted() {
        return getRemaining() <= 0;
    }

    /**
     * Checks affordability without spending anything, so a caller can size a
     * batched request before committing to it. {@link #tryConsume(int)} still does
     * the actual debit - do not call both for the same request.
     */
    public synchronized boolean canAfford(int requests) {
        rollOverIfNewDay();
        int limit = getLimit();
        if (limit <= 0) {
            return true;
        }
        return used.get() + requests <= limit;
    }

    private void rollOverIfNewDay() {
        LocalDate today = LocalDate.now();
        if (!today.equals(countedOn)) {
            int previous = used.getAndSet(0);
            countedOn = today;
            if (previous > 0) {
                log.info("Bakong request budget reset for {}: {} request(s) used yesterday.", today, previous);
            }
        }
    }

    private void logBudgetState(int limit, int usedNow, boolean firstOfDay, int requestCost) {
        int remaining = Math.max(0, limit - usedNow);
        int pct = limit <= 0 ? 0 : (int) ((usedNow * 100L) / limit);

        if (firstOfDay) {
            // Worth surfacing: it confirms the integration is live and shows the
            // day has started spending, which is the moment an operator looks for.
            log.info("First Bakong API request of the day (cost {}). Budget: {}/{} used, {} left.",
                    requestCost, usedNow, limit, remaining);
        } else if (pct >= 80) {
            log.warn("Bakong daily request budget: {}/{} used ({}%), {} left.", usedNow, limit, pct, remaining);
        } else if (pct > 0 && pct % 25 == 0) {
            log.info("Bakong daily request budget: {}/{} used ({}%), {} left.", usedNow, limit, pct, remaining);
        }
    }

    /** For diagnostics only. */
    public String describe() {
        return used.get() + "/" + getLimit() + " used on " + countedOn
                + " (last checked " + LocalDateTime.now() + ")";
    }
}
