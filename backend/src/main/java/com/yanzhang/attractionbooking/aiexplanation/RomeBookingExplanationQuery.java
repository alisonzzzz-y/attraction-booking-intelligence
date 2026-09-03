package com.yanzhang.attractionbooking.aiexplanation;

import java.time.LocalDate;

/** Read-only entry point for the Rome booking-order explanation. */
public interface RomeBookingExplanationQuery {

    BookingExplanation explain(LocalDate stayStartDate, LocalDate stayEndDate);
}
