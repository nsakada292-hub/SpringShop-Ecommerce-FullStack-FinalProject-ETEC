package com.example.SpringShop_Backend.config;

import com.example.SpringShop_Backend.service.bakong.BakongQuotaGuard;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Prints exactly what the Bakong integration is wired to at boot.
 *
 * <p>Most "payments are not real" problems are a single wrong property value, and
 * the failure only shows up later as a customer-facing error. This makes the
 * configuration legible in the log instead.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BakongConfigReport implements ApplicationRunner {

    private final BakongProperties properties;
    private final BakongQuotaGuard quotaGuard;

    /**
     * Real mode is only viable with usable credentials and a well-formed receiver.
     * Failing here, at boot, is deliberate: the alternative is the app starting
     * happily and then every customer checkout breaking with a Bakong SDK error.
     */
    @Override
    public void run(ApplicationArguments args) {
        if (properties.isMock()) {
            log.info("Bakong: MOCK mode - no real money moves. Set bakong.mock=false for real payments.");
            return;
        }

        boolean merchant = properties.getMerchantId() != null && !properties.getMerchantId().isBlank();
        boolean token = properties.getToken() != null && !properties.getToken().isBlank();
        boolean email = properties.getEmail() != null && !properties.getEmail().isBlank();
        String accountId = properties.getAccountId();
        boolean accountUsable = accountId != null && !accountId.isBlank();
        boolean accountWellFormed = accountUsable && accountId.matches("^[A-Za-z0-9._-]{1,32}@[A-Za-z0-9]{2,8}$");

        log.info("Bakong configuration");
        log.info("  environment      : {}", properties.getBaseUrl());
        log.info("  credentials      : {}", token ? "static token" : email ? "auto-renew via email" : "MISSING");
        log.info("  receiving account: {}", accountUsable ? accountId : "MISSING");
        log.info("  QR type          : {}", merchant
                ? "MERCHANT (tag 30) - bank-issued MID " + properties.getMerchantId()
                : "INDIVIDUAL (tag 29) - personal wallet, no bank merchant ID configured");
        log.info("  acquiring bank   : {}", properties.getAcquiringBank());
        log.info("  merchant name    : {} {}", properties.getMerchantName(), properties.getMerchantCity());
        log.info("  MCC              : {}", properties.getMerchantCategoryCode());
        log.info("  QR validity      : {} min", properties.getQrExpiryMinutes());
        log.info("  USD/KHR rate     : {}", properties.getUsdToKhrRate());
        log.info("  API budget       : {}/{} requests used today; polls cheaper than {}s are served from cache",
                quotaGuard.getUsed(), quotaGuard.getLimit(), properties.getMinStatusCheckIntervalSeconds());
        log.info("  reconciliation   : {}", properties.isReconciliationEnabled()
                ? "every " + properties.getReconciliationIntervalSeconds() + "s, up to "
                        + properties.getReconciliationBatchLimit() + " unsettled payment(s) per pass"
                : "disabled - each hash costs 1 request, so sweeping unsettled orders would drain the daily budget");
        if (!properties.isStatusBatchSupported()) {
            log.info("  batch endpoint   : disabled - production answers 403 for check_transaction_by_md5_list");
        }

        if (!accountUsable) {
            log.error("  ACTION REQUIRED: bakong.account-id is not set, so no QR can be generated.");
        } else if (!accountWellFormed) {
            log.error("  ACTION REQUIRED: bakong.account-id '{}' is not a Bakong account id.", accountId);
            log.error("  It must look like name@bank (e.g. neourm_sakada@bkrt), NOT a mobile number.");
            log.error("  A phone number works for receiving inside the Bakong app but cannot be encoded");
            log.error("  in a KHQR, so every checkout would fail. Open Bakong > Receive and copy the id");
            log.error("  shown next to your name.");
        }
        if (!token && !email) {
            log.error("  ACTION REQUIRED: set BAKONG_TOKEN or BAKONG_EMAIL, otherwise status checks will fail.");
        }
        if (!merchant) {
            log.warn("  Note: bakong.merchant-id is empty, so a solo/individual KHQR (tag 29) is issued.");
            log.warn("  Payer apps can reject these with 'receiver not verified' because the receiver is a");
            log.warn("  personal wallet rather than a registered business. To accept payment from every bank");
            log.warn("  app, register as a merchant with your bank and set BAKONG_MERCHANT_ID to the MID they");
            log.warn("  issue. Nothing in this codebase can substitute for that registration.");
        }
        if (properties.getBaseUrl() != null
                && properties.getBaseUrl().contains("sit-api")) {
            log.warn("  Note: base-url points at the NBC SIT sandbox. Payments there are not real money.");
        }

        if (!accountWellFormed || (!token && !email)) {
            throw new IllegalStateException(
                    "Bakong is configured for real payments but is not usable, so the app refuses to start "
                            + "rather than failing at checkout. Fix bakong.account-id (name@bank, not a phone "
                            + "number) and set BAKONG_TOKEN or BAKONG_EMAIL - or start with BAKONG_MOCK=true "
                            + "to run without real payments. See the ACTION REQUIRED lines above.");
        }
    }
}
