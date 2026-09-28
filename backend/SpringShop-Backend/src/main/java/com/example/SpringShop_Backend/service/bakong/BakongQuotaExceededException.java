package com.example.SpringShop_Backend.service.bakong;

/**
 * Raised when the Bakong daily request allowance is spent. Distinct from a
 * transport failure so callers can tell "we chose not to call" from "the call
 * failed", and report it honestly instead of showing a payment error.
 */
public class BakongQuotaExceededException extends RuntimeException {

    public BakongQuotaExceededException(String message) {
        super(message);
    }
}
