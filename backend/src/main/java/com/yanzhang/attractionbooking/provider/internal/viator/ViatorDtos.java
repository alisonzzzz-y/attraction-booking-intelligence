package com.yanzhang.attractionbooking.provider.internal.viator;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

final class ViatorDtos {

    private ViatorDtos() {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Product(
            String status,
            String productCode,
            String title,
            String productUrl,
            BookingConfirmationSettings bookingConfirmationSettings) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record BookingConfirmationSettings(
            String bookingCutoffType,
            Integer bookingCutoffInMinutes,
            String confirmationType) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Schedule(
            String productCode,
            List<BookableItem> bookableItems,
            String currency,
            Summary summary) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Summary(BigDecimal fromPrice) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record BookableItem(String productOptionCode, List<Season> seasons) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Season(LocalDate startDate, LocalDate endDate, List<PricingRecord> pricingRecords) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record PricingRecord(List<String> daysOfWeek, List<TimedEntry> timedEntries) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record TimedEntry(String startTime, List<UnavailableDate> unavailableDates) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record UnavailableDate(LocalDate date, String reason) {}
}
