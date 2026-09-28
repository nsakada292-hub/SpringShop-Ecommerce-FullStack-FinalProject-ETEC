package com.example.SpringShop_Backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "bakong")
public class BakongProperties {

    private String baseUrl = "https://api-bakong.nbc.gov.kh";
    private String token = "";
    private String email = "";
    private String accountId;
    private String merchantId;
    private String merchantName = "SpringShop";
    private String merchantCity = "PHNOM PENH";
    private String acquiringBank = "ACLB";

    /** EMVCo Merchant Category Code. 5999 is the generic "retail" default. */
    private String merchantCategoryCode = "5999";

    private double usdToKhrRate = 4000;
    private int qrExpiryMinutes = 15;

    /**
     * Absolute slack when matching a settled payment against the order total,
     * in the requested currency's units. KHQR rounds converted amounts, so an
     * exact comparison rejects payments that are genuinely correct.
     */
    private double amountToleranceAbsolute = 0.01;

    /**
     * Relative slack as a fraction of the expected amount, on top of the
     * absolute tolerance. Covers FX drift on the KHR conversion.
     */
    private double amountToleranceRelative = 0.01;

    private boolean mock = true;
    private boolean demoMerchant = false;

    /**
     * Bakong publishes a small daily request allowance (100/day, resetting daily)
     * and a replacement token can take up to 24h to arrive, so the budget is easy
     * to burn and expensive to run out of. Every outbound API call is counted and
     * refused once this is reached. Set to 0 to disable budgeting.
     */
    private int dailyRequestBudget = 90;

    /**
     * Minimum gap between two live Bakong status lookups for the same order.
     * Repeat status requests inside this window are answered from cache and cost
     * no API quota, however hard the browser polls.
     */
    private int minStatusCheckIntervalSeconds = 60;

    /**
     * Whether {@code check_transaction_by_md5_list} may be used to check many
     * hashes in one request.
     *
     * <p>The endpoint is documented and present in the SDKs, but the production
     * gateway answers 403 for a standard Bakong account, so it is off by default.
     * Leave it off unless NBC confirms your account is entitled to it.
     */
    private boolean statusBatchSupported = false;

    /**
     * Whether the background reconciler runs at all.
     *
     * <p>Off by default on purpose. Production answers one hash per request, so a
     * reconciler pass over N unsettled payments costs N requests. Polling every
     * few minutes therefore drains a 100/day allowance in under two hours and
     * leaves nothing for customers who are actually checking out. The payment
     * page's own status check is the detector that matters; turn this on only
     * when NBC grants a limit high enough to afford it.
     */
    private boolean reconciliationEnabled = false;

    /**
     * How many unsettled payments the background reconciler may check per pass.
     * Production only answers per-hash lookups, so each one costs a request -
     * this bound keeps the safety net from spending the day's budget.
     */
    private int reconciliationBatchLimit = 5;

    /**
     * Seconds between background reconciliation passes over unsettled KHQRs.
     * Each pass spends at most one request per batch.
     */
    private int reconciliationIntervalSeconds = 300;

    /** Seconds before the first reconciliation pass, to avoid competing with startup. */
    private int reconciliationInitialDelaySeconds = 60;

    /**
     * Advisory only. Bakong does not require an account lookup before a KHQR can
     * be issued or paid, and a negative answer is frequently a false negative for
     * Bakong-native ids (name@bkrt). Never let this block checkout.
     */
    private boolean verifyReceiverOnInitiate = false;

    /**
     * How long a successful receiver lookup is trusted before it is repeated.
     * The receiving account rarely changes, so this saves a request per checkout.
     */
    private int receiverCacheMinutes = 720;
}
