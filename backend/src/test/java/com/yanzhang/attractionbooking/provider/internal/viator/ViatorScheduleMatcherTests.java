package com.yanzhang.attractionbooking.provider.internal.viator;

import static org.junit.jupiter.api.Assertions.assertEquals;
import com.yanzhang.attractionbooking.provider.Availability;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;

class ViatorScheduleMatcherTests {
    private static final LocalDate FRIDAY = LocalDate.of(2026, 8, 21);

    private ViatorDtos.Schedule schedule(List<String> weekdays, List<ViatorDtos.TimedEntry> entries) {
        return new ViatorDtos.Schedule("test", List.of(new ViatorDtos.BookableItem("default",
                List.of(new ViatorDtos.Season(FRIDAY.minusDays(1), FRIDAY.plusDays(1),
                        List.of(new ViatorDtos.PricingRecord(weekdays, entries)))))), "EUR", null);
    }

    @Test void excludesSeasonsOutsideTheStay() {
        assertEquals(Availability.Status.UNAVAILABLE, ViatorScheduleMatcher.status(
                schedule(List.of("FRIDAY"), List.of()), FRIDAY.plusYears(1), FRIDAY.plusYears(1), FRIDAY));
    }

    @Test void respectsWeekdays() {
        assertEquals(Availability.Status.UNAVAILABLE, ViatorScheduleMatcher.status(
                schedule(List.of("MONDAY"), List.of()), FRIDAY, FRIDAY, FRIDAY));
    }

    @Test void excludesDatesBlockedForEveryTimedEntry() {
        var blocked = new ViatorDtos.TimedEntry("09:00", List.of(new ViatorDtos.UnavailableDate(FRIDAY, "SOLD_OUT")));
        assertEquals(Availability.Status.UNAVAILABLE, ViatorScheduleMatcher.status(
                schedule(List.of("FRIDAY"), List.of(blocked)), FRIDAY, FRIDAY, FRIDAY));
    }

    @Test void preservesAnotherTimedEntryOnTheSameDate() {
        var blocked = new ViatorDtos.TimedEntry("09:00", List.of(new ViatorDtos.UnavailableDate(FRIDAY, "SOLD_OUT")));
        var open = new ViatorDtos.TimedEntry("10:00", List.of());
        assertEquals(Availability.Status.SCHEDULED, ViatorScheduleMatcher.status(
                schedule(List.of("FRIDAY"), List.of(blocked, open)), FRIDAY, FRIDAY, FRIDAY));
    }

    @Test void includesBoundaryDatesAndUntimedSchedules() {
        assertEquals(Availability.Status.SCHEDULED, ViatorScheduleMatcher.status(
                schedule(List.of("THURSDAY"), List.of()), FRIDAY.minusDays(1), FRIDAY.minusDays(1), FRIDAY));
        assertEquals(Availability.Status.SCHEDULED, ViatorScheduleMatcher.status(
                schedule(List.of("SATURDAY"), List.of()), FRIDAY.plusDays(1), FRIDAY.plusDays(1), FRIDAY));
    }

    @Test void doesNotTreatIncompleteEvidenceAsUnavailable() {
        assertEquals(Availability.Status.UNKNOWN, ViatorScheduleMatcher.status(
                schedule(null, List.of()), FRIDAY, FRIDAY, FRIDAY));
    }

    @Test void missingEndDateDoesNotExtendTheScheduleIndefinitely() {
        var schedule = new ViatorDtos.Schedule("test", List.of(new ViatorDtos.BookableItem("default",
                List.of(new ViatorDtos.Season(FRIDAY, null, List.of(new ViatorDtos.PricingRecord(
                        List.of("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"), List.of())))))), "EUR", null);
        assertEquals(Availability.Status.SCHEDULED, ViatorScheduleMatcher.status(schedule, FRIDAY.plusDays(384), FRIDAY.plusDays(384), FRIDAY));
        assertEquals(Availability.Status.UNAVAILABLE, ViatorScheduleMatcher.status(schedule, FRIDAY.plusDays(385), FRIDAY.plusDays(385), FRIDAY));
    }
}
