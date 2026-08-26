package com.yanzhang.attractionbooking.bookingpriority.internal;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.yanzhang.attractionbooking.bookingpriority.BookingConfidence;
import com.yanzhang.attractionbooking.bookingpriority.BookingPriority;
import com.yanzhang.attractionbooking.bookingpriority.BookingPriorityAssessment;
import com.yanzhang.attractionbooking.bookingpriority.BookingTiming;
import com.yanzhang.attractionbooking.bookingpriority.OfficialAttractionDetails;
import com.yanzhang.attractionbooking.bookingpriority.OfficialBookingEvidence;
import com.yanzhang.attractionbooking.bookingpriority.OfficialBookingPolicy;
import java.net.URI;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.Test;

class BookingPriorityCalculatorTests {

    private static final Instant CALCULATED_AT = Instant.parse("2026-08-22T02:00:00Z");

    private final BookingPriorityCalculator calculator =
            new BookingPriorityCalculator(Clock.fixed(CALCULATED_AT, ZoneOffset.UTC));

    @Test
    void booksTimedReservationsFirstWithoutInventingAnExactAdvanceWindow() {
        BookingPriorityAssessment assessment =
                calculator.assess(evidence(OfficialBookingPolicy.TIMED_RESERVATION_REQUIRED));

        assertEquals(BookingPriority.BOOK_FIRST, assessment.priority());
        assertEquals(BookingConfidence.HIGH, assessment.confidence());
        assertEquals(BookingTiming.AS_SOON_AS_VISIT_DATE_IS_FIXED, assessment.timing());
        assertEquals(BookingPriorityCalculator.RULE_VERSION, assessment.ruleVersion());
        assertEquals(CALCULATED_AT, assessment.calculatedAt());
        assertEquals(
                "The official operator requires a timed reservation. The current evidence does not support an exact number of days in advance.",
                assessment.explanation());
    }

    @Test
    void booksOfficiallyRecommendedAdvanceTicketsSoon() {
        BookingPriorityAssessment assessment =
                calculator.assess(evidence(OfficialBookingPolicy.ADVANCE_BOOKING_RECOMMENDED));

        assertEquals(BookingPriority.BOOK_SOON, assessment.priority());
        assertEquals(BookingConfidence.MEDIUM, assessment.confidence());
        assertEquals(BookingTiming.BEFORE_FINALISING_DAILY_PLAN, assessment.timing());
    }

    @Test
    void letsOrdinaryVisitsWithoutAdvanceReservationsWait() {
        BookingPriorityAssessment assessment =
                calculator.assess(evidence(OfficialBookingPolicy.NO_ADVANCE_RESERVATION_REQUIRED));

        assertEquals(BookingPriority.CAN_WAIT, assessment.priority());
        assertEquals(BookingConfidence.HIGH, assessment.confidence());
        assertEquals(BookingTiming.AFTER_HIGHER_PRIORITY_TICKETS, assessment.timing());
    }

    @Test
    void keepsTicketTimingUnknownWhenOfficialEvidenceDoesNotEstablishIt() {
        BookingPriorityAssessment assessment =
                calculator.assess(evidence(OfficialBookingPolicy.TICKET_REQUIRED_TIMING_UNKNOWN));

        assertEquals(BookingPriority.UNKNOWN, assessment.priority());
        assertEquals(BookingConfidence.LOW, assessment.confidence());
        assertEquals(BookingTiming.CHECK_OFFICIAL_SOURCE, assessment.timing());
    }

    private static OfficialBookingEvidence evidence(OfficialBookingPolicy policy) {
        return new OfficialBookingEvidence(
                "test-attraction",
                "Test attraction",
                policy,
                "Verified official basis.",
                new OfficialAttractionDetails(
                        "A test attraction.",
                        "Official test ticket",
                        List.of("Test admission"),
                        "Official test ticket",
                        "This is a test recommendation."),
                URI.create("https://example.org/official-ticket-page"),
                URI.create("https://example.org/official-booking-page"),
                LocalDate.of(2026, 8, 21));
    }
}
