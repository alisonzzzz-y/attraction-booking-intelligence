package com.yanzhang.attractionbooking.bookingpriority;

import java.time.LocalDate;
import java.util.List;

/**
 * Read-only access to the deterministic Rome booking-priority facts.
 *
 * <p>Other modules may use this contract to explain the booking order, but they must not alter the
 * priority result or its official evidence.
 */
public interface RomeBookingPriorityQuery {

    List<BookingPriorityAssessment> assess(LocalDate stayStartDate, LocalDate stayEndDate);
}
