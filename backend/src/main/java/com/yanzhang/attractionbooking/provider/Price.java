package com.yanzhang.attractionbooking.provider;

import java.math.BigDecimal;
import java.util.Currency;
import java.util.Objects;
import java.util.Optional;

public record Price(
        BigDecimal amount,
        Currency currency,
        Kind kind,
        Optional<String> productCode,
        Optional<String> optionCode,
        SourceMetadata source) {

    public Price {
        Objects.requireNonNull(amount, "Price amount must not be null");
        if (amount.signum() < 0) {
            throw new IllegalArgumentException("Price amount must not be negative");
        }
        Objects.requireNonNull(currency, "Price currency must not be null");
        Objects.requireNonNull(kind, "Price kind must not be null");
        Objects.requireNonNull(productCode, "Product code must not be null");
        Objects.requireNonNull(optionCode, "Option code must not be null");
        Objects.requireNonNull(source, "Price source must not be null");
    }

    public enum Kind {
        EXACT,
        FROM
    }
}
