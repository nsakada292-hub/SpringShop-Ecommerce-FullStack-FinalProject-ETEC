package com.example.SpringShop_Backend.service.bakong;

import com.example.SpringShop_Backend.config.BakongProperties;
import com.example.SpringShop_Backend.dto.response.PaymentInitiateResponse;
import com.example.SpringShop_Backend.dto.response.PaymentStatusResponse;
import com.example.SpringShop_Backend.entity.Order;
import com.example.SpringShop_Backend.entity.PaymentAttempt;
import com.example.SpringShop_Backend.entity.User;
import com.example.SpringShop_Backend.enumm.OrderStatus;
import com.example.SpringShop_Backend.enumm.PaymentAttemptStatus;
import com.example.SpringShop_Backend.enumm.Role;
import com.example.SpringShop_Backend.exception.BadRequestException;
import com.example.SpringShop_Backend.exception.NotFoundException;
import com.example.SpringShop_Backend.repository.OrderRepository;
import com.example.SpringShop_Backend.repository.PaymentAttemptRepository;
import com.example.SpringShop_Backend.repository.UserRepository;
import kh.gov.nbc.bakong_khqr.BakongKHQR;
import kh.gov.nbc.bakong_khqr.model.KHQRCurrency;
import kh.gov.nbc.bakong_khqr.model.KHQRData;
import kh.gov.nbc.bakong_khqr.model.KHQRResponse;
import kh.gov.nbc.bakong_khqr.model.IndividualInfo;
import kh.gov.nbc.bakong_khqr.model.MerchantInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class BakongPaymentService {

    private static final String CURRENCY_USD = "USD";
    private static final String CURRENCY_KHR = "KHR";
    private static final String QR_TYPE_MERCHANT = "MERCHANT";
    private static final String QR_TYPE_INDIVIDUAL = "INDIVIDUAL";
    private static final String CHECK_MD5_PATH = "/v1/check_transaction_by_md5";
    private static final String CHECK_ACCOUNT_PATH = "/v1/check_bakong_account";

    /**
     * A KHQR's globally unique identifier is a Bakong account id of the form
     * name@bank (for example neourm_sakada@bkrt or yourname@aclb). A bare mobile
     * number is a valid way to be *paid* inside the Bakong app, but it is not a
     * valid KHQR receiver - the SDK rejects it as "Bakong Account ID is invalid",
     * which surfaces as an opaque checkout failure.
     */
    private static final Pattern BAKONG_ACCOUNT_ID = Pattern.compile("^[A-Za-z0-9._-]{1,32}@[A-Za-z0-9]{2,8}$");

    private final BakongProperties properties;
    private final BakongTokenService tokenService;
    private final BakongRestClient bakongRestClient;
    private final BakongBatchStatusClient batchStatusClient;
    private final PaymentStatusCache statusCache;
    private final ReceiverCheckCache receiverCache;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final PaymentAttemptRepository attemptRepository;

    @Transactional
    public PaymentInitiateResponse initiate(Long orderId, String currency) {

        Order order = findOwnedOrder(orderId);

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Order is not awaiting payment");
        }

        String selected = normalizeCurrency(currency);

        boolean mock = properties.isMock();
        boolean demo = properties.isDemoMerchant();

        // Reuse the live attempt when it is still valid and in the same currency,
        // so re-visits or currency toggles do not multiply floating payments.
        // Only reuse when the stored reference matches the current mode
        // (mock / demo / real) and a real QR was actually persisted.
        PaymentAttempt reusable = findReusableAttempt(order, selected, mock, demo);
        if (reusable != null) {
            log.debug("Reusing KHQR for order {} (md5={}, expires={})",
                    orderId, reusable.getMd5(), reusable.getExpiresAt());
            return buildInitiateResponse(order, reusable, selected, demo, merchantQrConfigured());
        }

        BigDecimal amount = amountIn(order.getTotalAmount(), selected);
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(properties.getQrExpiryMinutes());
        String md5;
        String qr;

        if (demo) {
            // Merchant KHQR demo: generates a real corporate merchant QR (type 30),
            // the exact format every Cambodian bank app accepts, fully offline
            // (no Bakong API call / token needed).
            md5 = "demo-" + order.getId() + "-" + shortId();
            qr = generateDemoQr(order, amount, selected).qr();
        } else if (mock) {
            md5 = "mock-" + order.getId() + "-" + shortId();
            qr = null;
        } else {
            // Advisory only: a negative answer here must never block checkout.
            verifyReceiverAccountAdvisory();
            QrResult qrResult = generateQr(order, amount, selected, expiresAt);
            md5 = qrResult.md5;
            qr = qrResult.qr;
        }

        order.setCurrency(selected);
        order.setPaymentReference(md5);
        order.setPaymentQr(qr);
        order.setPaymentExpiresAt(expiresAt);
        orderRepository.save(order);

        PaymentAttempt attempt = attemptRepository.save(PaymentAttempt.builder()
                .order(order)
                .md5(md5)
                .qr(qr)
                .currency(selected)
                .amount(amount)
                .expiresAt(expiresAt)
                .status(PaymentAttemptStatus.PENDING)
                .build());

        return buildInitiateResponse(order, attempt, selected, demo, merchantQrConfigured());
    }

    @Transactional
    public PaymentStatusResponse status(Long orderId) {

        Order order = findOwnedOrder(orderId);

        if (order.getStatus() == OrderStatus.PAID) {
            return buildStatusResponse(order, true, order.getPaymentTransactionId());
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            return buildStatusResponse(order, false, null);
        }

        // Mock mode: a single status check simulates a successful payment.
        if (properties.isMock()) {
            PaymentAttempt mockAttempt = latestAttempt(order);
            if (mockAttempt != null && mockAttempt.getMd5().startsWith("mock-")) {
                String transactionId = "mock-txn-" + shortId();
                markPaid(mockAttempt, mockAttempt.getCurrency(), mockAttempt.getAmount(),
                        null, null, transactionId);
                settleOrder(order, mockAttempt);
                return buildStatusResponse(order, true, transactionId);
            }
            return buildStatusResponse(order, false, null);
        }

        // Merchant demo mode: a single status check simulates a successful payment.
        if (properties.isDemoMerchant()) {
            PaymentAttempt demoAttempt = latestAttempt(order);
            if (demoAttempt != null && demoAttempt.getMd5().startsWith("demo-")) {
                String transactionId = "demo-txn-" + shortId();
                markPaid(demoAttempt, demoAttempt.getCurrency(), demoAttempt.getAmount(),
                        null, null, transactionId);
                settleOrder(order, demoAttempt);
                return buildStatusResponse(order, true, transactionId);
            }
            return buildStatusResponse(order, false, null);
        }

        // Real mode. Every md5 we ever handed out is checked, not just the newest:
        // a customer can pay a QR after it expires, and that money is real.
        List<PaymentAttempt> attempts = new ArrayList<>(
                attemptRepository.findByOrder_IdOrderByIdDesc(orderId));
        if (attempts.isEmpty()) {
            // Orders created before attempts were tracked still hold a reference
            // on the order row. Adopt it so those payments are not stranded.
            PaymentAttempt adopted = adoptLegacyAttempt(order);
            if (adopted == null) {
                return buildStatusResponse(order, false, null);
            }
            attempts.add(adopted);
        }

        String bearer;
        try {
            bearer = tokenService.getToken();
        } catch (RuntimeException e) {
            // Do not surface a Bakong outage as "unpaid" to the customer while
            // their money may already be in flight.
            log.error("Cannot reach Bakong to verify order {}: {}", orderId, e.getMessage());
            return buildStatusResponse(order, false, null);
        }

        // Split the attempts into "already answered from cache" and "needs Bakong".
        // Repeat polls inside the cache window cost nothing, however fast the
        // browser polls, which is what makes a small daily budget survivable.
        Duration cacheWindow = Duration.ofSeconds(Math.max(0, properties.getMinStatusCheckIntervalSeconds()));
        Map<String, JsonNode> settled = new HashMap<>();
        List<String> needsLookup = new ArrayList<>();
        for (PaymentAttempt attempt : attempts) {
            if (attempt.getStatus() == PaymentAttemptStatus.PAID
                    || attempt.getStatus() == PaymentAttemptStatus.UNDERPAID) {
                continue;
            }
            PaymentStatusCache.LookupOutcome cached = cacheWindow.isZero()
                    ? null
                    : statusCache.getIfFresh(attempt.getMd5(), cacheWindow);
            if (cached != null) {
                if (cached.settled()) {
                    settled.put(attempt.getMd5(), cached.data());
                }
            } else {
                needsLookup.add(attempt.getMd5());
            }
        }

        if (!needsLookup.isEmpty()) {
            List<String> hashes = BakongBatchStatusClient.pendingHashes(needsLookup);
            try {
                Map<String, JsonNode> fresh = batchStatusClient.lookup(hashes);
                settled.putAll(fresh);
                // Cache the outcome either way: a "not paid yet" answer is worth
                // remembering too, otherwise every poll repeats the request.
                for (String md5 : hashes) {
                    JsonNode data = fresh.get(md5);
                    statusCache.put(md5, data == null
                            ? PaymentStatusCache.LookupOutcome.unpaid()
                            : PaymentStatusCache.LookupOutcome.paid(data));
                }
            } catch (BakongQuotaExceededException e) {
                log.error("Skipping Bakong verification for order {}: {}", orderId, e.getMessage());
                return buildStatusResponse(order, false,
                        "Payment received? Confirmation is temporarily paused "
                                + "because the Bakong daily request limit was reached. It will resume "
                                + "automatically when the limit resets.");
            } catch (RuntimeException e) {
                log.warn("Bakong lookup failed for order {}: {}", orderId, e.getMessage());
            }
        }

        for (PaymentAttempt attempt : attempts) {
            if (attempt.getStatus() == PaymentAttemptStatus.PAID) {
                settleOrder(order, attempt);
                return buildStatusResponse(order, true, attempt.getTransactionId());
            }
            if (attempt.getStatus() == PaymentAttemptStatus.UNDERPAID) {
                continue;
            }

            JsonNode data = settled.get(attempt.getMd5());
            if (data == null || data.isMissingNode() || data.isNull()) {
                continue;
            }

            String paidCurrency = text(data, "currency", attempt.getCurrency())
                    .toUpperCase(Locale.ROOT);
            BigDecimal paidAmount = parseAmount(data.path("amount"), attempt.getAmount());
            String transactionId = text(data, "hash",
                    text(data, "externalRef", attempt.getMd5()));

            markPaid(attempt, paidCurrency, paidAmount,
                    text(data, "fromAccountId", null),
                    text(data, "fromName", null),
                    transactionId);

            BigDecimal shortfall = shortfallAgainst(order, attempt, paidCurrency, paidAmount);
            if (shortfall.signum() > 0) {
                // Underpaid. Record it and keep the order pending - the money
                // arrived and must be visible to support, never discarded.
                attempt.setStatus(PaymentAttemptStatus.UNDERPAID);
                attemptRepository.save(attempt);
                log.error("UNDERPAYMENT on order {} (md5={}): expected {} {}, received {} {} (short by {})",
                        orderId, attempt.getMd5(), attempt.getAmount(), attempt.getCurrency(),
                        paidAmount, paidCurrency, shortfall);
                return buildStatusResponse(order, false, null);
            }

            log.info("Payment settled for order {}: {} {} via {} (md5={}, txn={})",
                    orderId, paidAmount, paidCurrency, attempt.getPayerAccountId(),
                    attempt.getMd5(), transactionId);
            statusCache.invalidate(attempt.getMd5());
            settleOrder(order, attempt);
            return buildStatusResponse(order, true, transactionId);
        }

        return buildStatusResponse(order, false, null);
    }

    /**
     * Looks the receiving account up for diagnostics only.
     *
     * <p>This used to throw and abort checkout, which is why customers could not
     * reach the QR at all. Bakong does not require the lookup in order to issue or
     * pay a KHQR, and {@code check_bakong_account} answers "does this account
     * exist" - it says nothing about whether a payment will settle. It also
     * returns false negatives for Bakong-native ids (name@bkrt), so a negative
     * answer is logged and the QR is issued anyway.
     */
    private void verifyReceiverAccountAdvisory() {
        if (!properties.isVerifyReceiverOnInitiate()) {
            return;
        }
        String accountId = properties.getAccountId();
        if (accountId == null || accountId.isBlank()) {
            log.warn("Advisory receiver check skipped: bakong.account-id is not set");
            return;
        }

        // The receiving account does not change between checkouts, so one lookup
        // covers many orders. Re-checking per QR is quota spent for no new
        // information, and quota is the scarce resource here.
        Duration window = Duration.ofMinutes(Math.max(0, properties.getReceiverCacheMinutes()));
        String cached = window.isZero() ? null : receiverCache.getIfFresh(accountId, window);
        if (cached != null) {
            log.debug("Advisory receiver check for '{}' served from cache: {}", accountId, cached);
            return;
        }

        try {
            String bearer = tokenService.getToken();
            JsonNode root = bakongRestClient.post(
                    CHECK_ACCOUNT_PATH, bearer, Map.of("accountId", accountId));
            if (!"0".equals(root.path("responseCode").asText())) {
                log.warn("Bakong reports account '{}' as not found (errorCode={}, message={}). "
                                + "Issuing the QR anyway - this endpoint does not gate settlement. "
                                + "If payments are rejected at the payer app, this id is the first thing to check.",
                        accountId,
                        root.path("errorCode").asText("?"),
                        root.path("responseMessage").asText("?"));
                receiverCache.put(accountId, "not found (advisory)");
            } else {
                JsonNode data = root.path("data");
                receiverCache.put(accountId, "ok: " + text(data, "accountStatus", "?")
                        + ", kyc=" + text(data, "kycStatus", "?")
                        + ", canReceive=" + data.path("canReceive").asText("?"));
            }
        } catch (BakongQuotaExceededException e) {
            log.warn("Advisory receiver check for '{}' skipped: {}", accountId, e.getMessage());
        } catch (RuntimeException e) {
            log.warn("Advisory receiver check for '{}' failed: {}", accountId, e.getMessage());
        }
    }

    /**
     * How much the payment is short of the order total, in the QR's own currency.
     * Returns zero when the payment covers the order, allowing for overpayment and
     * for the rounding/FX drift that a converted KHR payment legitimately has.
     */
    private BigDecimal shortfallAgainst(Order order, PaymentAttempt attempt,
                                        String paidCurrency, BigDecimal paidAmount) {
        String requested = attempt.getCurrency();
        BigDecimal expected = attempt.getAmount();

        if (!isKnownCurrency(paidCurrency) || !isKnownCurrency(requested)) {
            // Bakong only settles in USD and KHR. If anything else turns up we
            // cannot reason about it, but the money demonstrably arrived, so let
            // it settle and flag it rather than stranding a real payment.
            log.warn("Unrecognised currency on order {} (requested={}, paid={}); settling without amount check",
                    order.getId(), requested, paidCurrency);
            return BigDecimal.ZERO;
        }

        BigDecimal paid = normalizeTo(paidAmount, paidCurrency, requested);
        BigDecimal tolerance = expected.abs()
                .multiply(BigDecimal.valueOf(properties.getAmountToleranceRelative()))
                .add(BigDecimal.valueOf(properties.getAmountToleranceAbsolute()));

        BigDecimal difference = paid.subtract(expected);
        if (difference.abs().compareTo(tolerance) <= 0) {
            return BigDecimal.ZERO;
        }
        // Overpayment is the customer's money returning to them, not a problem.
        return difference.signum() > 0 ? BigDecimal.ZERO : difference.abs();
    }

    private boolean isKnownCurrency(String currency) {
        return CURRENCY_USD.equalsIgnoreCase(currency) || CURRENCY_KHR.equalsIgnoreCase(currency);
    }

    /**
     * Converts an amount into {@code target} so a USD-priced order can be settled
     * by a customer who paid in KHR (or the reverse) without being rejected.
     */
    private BigDecimal normalizeTo(BigDecimal amount, String from, String to) {
        if (from.equalsIgnoreCase(to)) {
            return amount;
        }
        boolean fromKhr = CURRENCY_KHR.equalsIgnoreCase(from);
        boolean toKhr = CURRENCY_KHR.equalsIgnoreCase(to);
        if (fromKhr == toKhr) {
            return amount;
        }
        if (fromKhr) {
            return amount.divide(BigDecimal.valueOf(properties.getUsdToKhrRate()), 4, RoundingMode.HALF_UP);
        }
        return amount.multiply(BigDecimal.valueOf(properties.getUsdToKhrRate()))
                .setScale(0, RoundingMode.HALF_UP);
    }

    private void markPaid(PaymentAttempt attempt, String paidCurrency, BigDecimal paidAmount,
                          String payerAccountId, String payerName, String transactionId) {
        attempt.setStatus(PaymentAttemptStatus.PAID);
        attempt.setPaidCurrency(paidCurrency);
        attempt.setPaidAmount(paidAmount);
        attempt.setPayerAccountId(payerAccountId);
        attempt.setPayerName(payerName);
        attempt.setTransactionId(transactionId);
        attempt.setPaidAt(LocalDateTime.now());
        attemptRepository.save(attempt);
    }

    private void settleOrder(Order order, PaymentAttempt attempt) {
        if (order.getStatus() == OrderStatus.PAID) {
            return;
        }
        order.setStatus(OrderStatus.PAID);
        order.setPaymentTransactionId(attempt.getTransactionId());
        if (order.getCurrency() == null) {
            order.setCurrency(attempt.getCurrency());
        }
        orderRepository.save(order);
    }

    private PaymentAttempt findReusableAttempt(Order order, String selected, boolean mock, boolean demo) {
        if (order.getPaymentReference() == null || order.getPaymentExpiresAt() == null) {
            return null;
        }
        if (!order.getPaymentExpiresAt().isAfter(LocalDateTime.now())) {
            return null;
        }
        if (!selected.equalsIgnoreCase(order.getCurrency())) {
            return null;
        }
        if (order.getPaymentReference().startsWith("mock-") != mock) {
            return null;
        }
        if (order.getPaymentReference().startsWith("demo-") != demo) {
            return null;
        }
        if (!mock && !demo && order.getPaymentQr() == null) {
            return null;
        }
        return attemptRepository.findByMd5(order.getPaymentReference()).orElse(null);
    }

    private PaymentAttempt latestAttempt(Order order) {
        return attemptRepository.findByOrder_IdOrderByIdDesc(order.getId())
                .stream().findFirst().orElse(null);
    }

    /**
     * Recreates an attempt row for a payment that was issued before attempts were
     * being recorded, using the reference already stored on the order.
     */
    private PaymentAttempt adoptLegacyAttempt(Order order) {
        if (order.getPaymentReference() == null || order.getPaymentReference().isBlank()) {
            return null;
        }
        if (order.getCurrency() == null || order.getTotalAmount() == null) {
            return null;
        }
        String currency = normalizeCurrency(order.getCurrency());
        log.info("Adopting legacy payment reference {} for order {}", order.getPaymentReference(), order.getId());
        return attemptRepository.save(PaymentAttempt.builder()
                .order(order)
                .md5(order.getPaymentReference())
                .qr(order.getPaymentQr())
                .currency(currency)
                .amount(amountIn(order.getTotalAmount(), currency))
                .expiresAt(order.getPaymentExpiresAt())
                .status(order.getPaymentReference().startsWith("mock-")
                        || order.getPaymentReference().startsWith("demo-")
                        ? PaymentAttemptStatus.PAID
                        : PaymentAttemptStatus.PENDING)
                .build());
    }

    private QrResult generateQr(Order order, BigDecimal amount, String currency, LocalDateTime expiresAt) {
        KHQRCurrency khqrCurrency = CURRENCY_KHR.equalsIgnoreCase(currency) ? KHQRCurrency.KHR : KHQRCurrency.USD;
        long expiresAtMillis = System.currentTimeMillis()
                + properties.getQrExpiryMinutes() * 60_000L;
        boolean merchantQr = properties.getMerchantId() != null && !properties.getMerchantId().isBlank();

        try {
            KHQRResponse<KHQRData> response;
            if (merchantQr) {
                MerchantInfo info = new MerchantInfo();
                info.setBakongAccountId(requireAccountId());
                info.setMerchantId(require(properties.getMerchantId(), "bakong.merchant-id"));
                info.setAcquiringBank(require(properties.getAcquiringBank(), "bakong.acquiring-bank"));
                info.setCurrency(khqrCurrency);
                info.setAmount(amount.doubleValue());
                info.setMerchantName(require(properties.getMerchantName(), "bakong.merchant-name"));
                info.setMerchantCity(properties.getMerchantCity());
                info.setBillNumber("ORD" + order.getId());
                info.setStoreLabel(properties.getMerchantName());
                info.setPurposeOfTransaction("SpringShop order #" + order.getId());
                info.setMerchantCategoryCode(properties.getMerchantCategoryCode());
                info.setExpirationTimestamp(expiresAtMillis);
                response = BakongKHQR.generateMerchant(info);
            } else {
                IndividualInfo info = new IndividualInfo();
                info.setBakongAccountId(requireAccountId());
                info.setCurrency(khqrCurrency);
                info.setAmount(amount.doubleValue());
                info.setMerchantName(require(properties.getMerchantName(), "bakong.merchant-name"));
                info.setMerchantCity(properties.getMerchantCity());
                info.setBillNumber("ORD" + order.getId());
                info.setStoreLabel(properties.getMerchantName());
                info.setPurposeOfTransaction("SpringShop order #" + order.getId());
                info.setExpirationTimestamp(expiresAtMillis);
                response = BakongKHQR.generateIndividual(info);
            }
            if (response == null || response.getKHQRStatus() == null
                    || response.getKHQRStatus().getCode() != 0 || response.getData() == null) {
                throw new BadRequestException("Could not generate KHQR: "
                        + response.getKHQRStatus().getMessage());
            }
            return new QrResult(response.getData().getMd5(), response.getData().getQr());
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Could not generate KHQR: " + e.getMessage());
        }
    }

    private QrResult generateDemoQr(Order order, BigDecimal amount, String currency) {
        KHQRCurrency khqrCurrency = CURRENCY_KHR.equalsIgnoreCase(currency) ? KHQRCurrency.KHR : KHQRCurrency.USD;
        long expiresAtMillis = System.currentTimeMillis()
                + properties.getQrExpiryMinutes() * 60_000L;

        try {
            MerchantInfo info = new MerchantInfo();
            info.setBakongAccountId(blankTo(properties.getAccountId(), "khqr@devb"));
            info.setMerchantId(blankTo(properties.getMerchantId(), "123456"));
            info.setAcquiringBank(blankTo(properties.getAcquiringBank(), "DEVB"));
            info.setCurrency(khqrCurrency);
            info.setAmount(amount.doubleValue());
            info.setMerchantName(blankTo(properties.getMerchantName(), "SpringShop"));
            info.setMerchantCity(blankTo(properties.getMerchantCity(), "PHNOM PENH"));
            info.setBillNumber("ORD" + order.getId());
            info.setStoreLabel(info.getMerchantName());
            info.setPurposeOfTransaction("SpringShop order #" + order.getId());
            info.setMerchantCategoryCode(properties.getMerchantCategoryCode());
            info.setExpirationTimestamp(expiresAtMillis);
            KHQRResponse<KHQRData> response = BakongKHQR.generateMerchant(info);
            if (response == null || response.getKHQRStatus() == null
                    || response.getKHQRStatus().getCode() != 0 || response.getData() == null) {
                throw new BadRequestException("Could not generate demo merchant KHQR: "
                        + response.getKHQRStatus().getMessage());
            }
            return new QrResult(response.getData().getMd5(), response.getData().getQr());
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Could not generate demo merchant KHQR: " + e.getMessage());
        }
    }

    private String blankTo(String value, String fallback) {
        return (value == null || value.isBlank()) ? fallback : value;
    }

    private String shortId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }

    /** Reads a string field, treating absent/null nodes as "not provided". */
    private String text(JsonNode node, String field, String fallback) {
        JsonNode value = node.path(field);
        if (value.isMissingNode() || value.isNull()) {
            return fallback;
        }
        String text = value.asText();
        return (text == null || text.isBlank()) ? fallback : text;
    }

    private BigDecimal parseAmount(JsonNode node, BigDecimal fallback) {        if (node == null || node.isMissingNode() || node.isNull()) {
            return fallback;
        }
        try {
            return node.isNumber()
                    ? node.decimalValue()
                    : new BigDecimal(node.asText("").trim());
        } catch (NumberFormatException e) {
            log.warn("Unparseable paid amount '{}', assuming {}", node.asText(), fallback);
            return fallback;
        }
    }

    private PaymentInitiateResponse buildInitiateResponse(Order order, PaymentAttempt attempt,
                                                         String currency, boolean demo, boolean merchantQr) {
        return PaymentInitiateResponse.builder()
                .orderId(order.getId())
                .qr(attempt.getQr())
                .md5(attempt.getMd5())
                .currency(currency.toUpperCase(Locale.ROOT))
                .amount(attempt.getAmount().doubleValue())
                .expiresAt(attempt.getExpiresAt())
                .mock(properties.isMock())
                .demo(demo)
                .qrType(merchantQr ? QR_TYPE_MERCHANT : QR_TYPE_INDIVIDUAL)
                .build();
    }

    /**
     * A corporate merchant KHQR (tag 30) is only produced when the bank has issued
     * a Merchant ID. Without one we fall back to a solo/individual KHQR (tag 29),
     * which some payer apps refuse because the receiver is a personal wallet.
     */
    private boolean merchantQrConfigured() {
        return properties.getMerchantId() != null && !properties.getMerchantId().isBlank();
    }

    private PaymentStatusResponse buildStatusResponse(Order order, boolean paid, String transactionId) {
        boolean hasAmount = order.getCurrency() != null;
        PaymentAttempt latest = latestAttempt(order);
        return PaymentStatusResponse.builder()
                .orderId(order.getId())
                .status(order.getStatus().name())
                .paid(paid)
                .currency(order.getCurrency())
                .amount(hasAmount
                        ? amountIn(order.getTotalAmount(), order.getCurrency()).doubleValue()
                        : null)
                .transactionId(transactionId)
                .qrExpired(latest != null
                        && latest.getExpiresAt() != null
                        && !latest.getExpiresAt().isAfter(LocalDateTime.now()))
                .message(messageFor(order, latest, paid))
                .build();
    }

    private String messageFor(Order order, PaymentAttempt latest, boolean paid) {
        if (paid) {
            return null;
        }
        if (latest == null) {
            return "No payment request has been created for this order yet.";
        }
        if (latest.getStatus() == PaymentAttemptStatus.UNDERPAID) {
            return "A payment was received but it did not cover the order total. "
                    + "Our team has been notified and will contact you.";
        }
        if (latest.getExpiresAt() != null && !latest.getExpiresAt().isAfter(LocalDateTime.now())) {
            return "This payment code has expired. Generate a new one to pay. "
                    + "If you already sent money, it is safe - we will reconcile it.";
        }
        return null;
    }

    private Order findOwnedOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        User currentUser = getCurrentUser();
        if (currentUser.getRole() != Role.ADMIN
                && !order.getUser().getId().equals(currentUser.getId())) {
            throw new NotFoundException("Order not found");
        }
        return order;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private BigDecimal amountIn(BigDecimal usdTotal, String currency) {
        if (CURRENCY_KHR.equalsIgnoreCase(currency)) {
            return usdTotal.multiply(BigDecimal.valueOf(properties.getUsdToKhrRate()))
                    .setScale(0, RoundingMode.HALF_UP);
        }
        return usdTotal.setScale(2, RoundingMode.HALF_UP);
    }

    private String normalizeCurrency(String currency) {
        String value = (currency == null || currency.isBlank())
                ? CURRENCY_USD
                : currency.toUpperCase(Locale.ROOT);
        if (!CURRENCY_USD.equals(value) && !CURRENCY_KHR.equals(value)) {
            throw new BadRequestException("Unsupported currency: " + currency);
        }
        return value;
    }

    private String require(String value, String property) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(
                    "Bakong is not configured: " + property + " is missing. Set bakong.mock=true to run in mock mode.");
        }
        return value;
    }

    /**
     * Rejects a mobile number (or any other malformed value) with an actionable
     * message, instead of letting the KHQR SDK fail with "Bakong Account ID is
     * invalid" and leaving the customer staring at a generic checkout error.
     */
    private String requireAccountId() {
        String accountId = require(properties.getAccountId(), "bakong.account-id");
        if (!BAKONG_ACCOUNT_ID.matcher(accountId).matches()) {
            throw new BadRequestException(
                    "'" + accountId + "' is not a valid Bakong account id. It must look like "
                            + "name@bank (for example neourm_sakada@bkrt), not a mobile number. "
                            + "Open the Bakong app, go to Receive, and copy the id shown next to your name.");
        }
        return accountId;
    }

    private record QrResult(String md5, String qr) {
    }
}
