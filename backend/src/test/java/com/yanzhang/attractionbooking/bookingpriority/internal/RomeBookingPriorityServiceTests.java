package com.yanzhang.attractionbooking.bookingpriority.internal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.yanzhang.attractionbooking.bookingpriority.BookingPriority;
import com.yanzhang.attractionbooking.bookingpriority.BookingPriorityAssessment;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.Test;

class RomeBookingPriorityServiceTests {

    private final RomeBookingPriorityService service = new RomeBookingPriorityService(
            new RomeOfficialBookingEvidenceCatalog(),
            new BookingPriorityCalculator(
                    Clock.fixed(Instant.parse("2026-08-22T02:00:00Z"), ZoneOffset.UTC)));

    @Test
    void returnsTenRomeAssessmentsSortedByBookingPriority() {
        List<BookingPriorityAssessment> assessments = service.assess(
                LocalDate.of(2026, 9, 10), LocalDate.of(2026, 9, 15));

        assertEquals(10, assessments.size());
        assertEquals("colosseum-archaeological-park", assessments.get(0).attractionId());
        assertEquals(BookingPriority.BOOK_FIRST, assessments.get(0).priority());
        assertEquals("borghese-gallery", assessments.get(1).attractionId());
        assertEquals("domus-aurea", assessments.get(2).attractionId());
        assertTrue(assessments.stream()
                .allMatch(assessment -> assessment.officialEvidence().sourceUrl().isAbsolute()));
        assertTrue(assessments.stream()
                .allMatch(assessment -> assessment.officialEvidence().checkedOn()
                        .equals(LocalDate.of(2026, 8, 21))));
    }

    @Test
    void rejectsAnEndDateBeforeTheStartDate() {
        assertThrows(
                IllegalArgumentException.class,
                () -> service.assess(
                        LocalDate.of(2026, 9, 15), LocalDate.of(2026, 9, 10)));
    }

    @Test
    void rejectsRomeMvpStaysLongerThanFourteenDays() {
        assertThrows(
                IllegalArgumentException.class,
                () -> service.assess(
                        LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 16)));
    }
}
