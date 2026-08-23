package com.yanzhang.attractionbooking.bookingpriority.internal;

import com.yanzhang.attractionbooking.bookingpriority.BookingConfidence;
import com.yanzhang.attractionbooking.bookingpriority.BookingPriority;
import com.yanzhang.attractionbooking.bookingpriority.BookingPriorityAssessment;
import com.yanzhang.attractionbooking.bookingpriority.BookingTiming;
import com.yanzhang.attractionbooking.bookingpriority.OfficialBookingEvidence;
import java.time.Clock;
import org.springframework.stereotype.Component;

@Component
class BookingPriorityCalculator {

    static final String RULE_VERSION = "rome-official-policy-v1";

    private final Clock clock;

    BookingPriorityCalculator() {
        this(Clock.systemUTC());
    }

    BookingPriorityCalculator(Clock clock) {
        this.clock = clock;
    }

    BookingPriorityAssessment assess(OfficialBookingEvidence evidence) {
        return switch (evidence.policy()) {
            case TIMED_RESERVATION_REQUIRED -> assessment(
                    evidence,
                    BookingPriority.BOOK_FIRST,
                    BookingConfidence.HIGH,
                    BookingTiming.AS_SOON_AS_VISIT_DATE_IS_FIXED,
                    "Secure this before planning lower-priority attractions.",
                    "The official operator requires a timed reservation. The current evidence does not support an exact number of days in advance.");
            case ADVANCE_BOOKING_RECOMMENDED -> assessment(
                    evidence,
                    BookingPriority.BOOK_SOON,
                    BookingConfidence.MEDIUM,
                    BookingTiming.BEFORE_FINALISING_DAILY_PLAN,
                    "Handle this after the book-first attractions and before finalising each day.",
                    "The official operator recommends advance booking, but does not provide evidence for a precise sell-out window.");
            case NO_ADVANCE_RESERVATION_REQUIRED, FREE_GENERAL_ENTRY, OPTIONAL_PAID_AREA -> assessment(
                    evidence,
                    BookingPriority.CAN_WAIT,
                    BookingConfidence.HIGH,
                    BookingTiming.AFTER_HIGHER_PRIORITY_TICKETS,
                    "Plan this after the timed and advance-booking attractions.",
                    "The official evidence does not require an advance reservation for the ordinary visit described here. Recheck the source before travelling.");
            case TICKET_REQUIRED_TIMING_UNKNOWN -> assessment(
                    evidence,
                    BookingPriority.UNKNOWN,
                    BookingConfidence.LOW,
                    BookingTiming.CHECK_OFFICIAL_SOURCE,
                    "Check the official ticket page before assigning this attraction to a day.",
                    "An official ticket or booking route exists, but the verified source does not establish how early a visitor should book.");
        };
    }

    private BookingPriorityAssessment assessment(
            OfficialBookingEvidence evidence,
            BookingPriority priority,
            BookingConfidence confidence,
            BookingTiming timing,
            String action,
            String explanation) {
        return new BookingPriorityAssessment(
                evidence.attractionId(),
                evidence.attractionName(),
                priority,
                confidence,
                timing,
                action,
                explanation,
                evidence,
                RULE_VERSION,
                clock.instant());
    }
}
