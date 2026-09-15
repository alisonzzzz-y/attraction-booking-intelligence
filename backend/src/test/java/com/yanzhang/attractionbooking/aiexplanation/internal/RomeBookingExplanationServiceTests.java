package com.yanzhang.attractionbooking.aiexplanation.internal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.yanzhang.attractionbooking.aiexplanation.BookingExplanation;
import com.yanzhang.attractionbooking.bookingpriority.BookingConfidence;
import com.yanzhang.attractionbooking.bookingpriority.BookingPriority;
import com.yanzhang.attractionbooking.bookingpriority.BookingPriorityAssessment;
import com.yanzhang.attractionbooking.bookingpriority.BookingTiming;
import com.yanzhang.attractionbooking.bookingpriority.OfficialAttractionDetails;
import com.yanzhang.attractionbooking.bookingpriority.OfficialBookingEvidence;
import com.yanzhang.attractionbooking.bookingpriority.OfficialBookingPolicy;
import com.yanzhang.attractionbooking.bookingpriority.RomeBookingPriorityQuery;
import com.yanzhang.attractionbooking.service.RomeBookingExplanationService;
import com.yanzhang.attractionbooking.service.TemplateBookingExplanation;
import java.net.URI;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class RomeBookingExplanationServiceTests {

    @Test
    void returnsOnlyDeterministicFactsWhenNoModelIsConfigured() {
        RomeBookingPriorityQuery factsTool = (startDate, endDate) -> List.of(assessment());
        RomeBookingExplanationService service = new RomeBookingExplanationService(
                factsTool, new TemplateBookingExplanation(), Optional.empty());

        BookingExplanation explanation = service.explain(
                LocalDate.of(2026, 9, 10), LocalDate.of(2026, 9, 12));

        assertEquals(BookingExplanation.Mode.TEMPLATE_FALLBACK, explanation.mode());
        assertEquals(1, explanation.facts().size());
        assertEquals("colosseum", explanation.facts().getFirst().attractionId());
        assertEquals("TIMED_RESERVATION_REQUIRED", explanation.facts().getFirst().officialPolicy());
        assertTrue(explanation.boundaryNotice().contains("does not claim prices"));
    }

    @Test
    void returnsAModelSummaryOnlyAfterTheClientAcceptsIt() {
        RomeBookingPriorityQuery factsTool = (startDate, endDate) -> List.of(assessment());
        BookingExplanationModelClient modelClient =
                facts -> "This order follows the checked official booking facts.";
        RomeBookingExplanationService service = new RomeBookingExplanationService(
                factsTool, new TemplateBookingExplanation(), Optional.of(modelClient));

        BookingExplanation explanation = service.explain(
                LocalDate.of(2026, 9, 10), LocalDate.of(2026, 9, 12));

        assertEquals(BookingExplanation.Mode.MODEL, explanation.mode());
        assertEquals("This order follows the checked official booking facts.", explanation.summary());
        assertEquals("colosseum", explanation.facts().getFirst().attractionId());
    }

    @Test
    void fallsBackWithoutLosingFactsWhenTheModelClientRejectsAnAnswer() {
        RomeBookingPriorityQuery factsTool = (startDate, endDate) -> List.of(assessment());
        BookingExplanationModelClient modelClient = facts -> {
            throw new AiExplanationClientException("The model invented unsupported detail");
        };
        RomeBookingExplanationService service = new RomeBookingExplanationService(
                factsTool, new TemplateBookingExplanation(), Optional.of(modelClient));

        BookingExplanation explanation = service.explain(
                LocalDate.of(2026, 9, 10), LocalDate.of(2026, 9, 12));

        assertEquals(BookingExplanation.Mode.TEMPLATE_FALLBACK, explanation.mode());
        assertTrue(explanation.summary().contains("official guidance requires a timed reservation"));
        assertEquals(1, explanation.facts().size());
        assertEquals("TIMED_RESERVATION_REQUIRED", explanation.facts().getFirst().officialPolicy());
    }

    @Test
    void rejectsAnEmptyFactPackageInsteadOfAskingTheModelToGuess() {
        RomeBookingPriorityQuery emptyFactsTool = (startDate, endDate) -> List.of();
        RomeBookingExplanationService service = new RomeBookingExplanationService(
                emptyFactsTool, new TemplateBookingExplanation(), Optional.empty());

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> service.explain(LocalDate.of(2026, 9, 10), LocalDate.of(2026, 9, 12)));

        assertEquals("At least one booking fact is required", exception.getMessage());
    }

    private static BookingPriorityAssessment assessment() {
        OfficialAttractionDetails details = new OfficialAttractionDetails(
                "Ancient amphitheatre.",
                "Standard ticket",
                List.of("Timed entry"),
                "Recommended starting point",
                "Timed entry is required.");
        OfficialBookingEvidence evidence = new OfficialBookingEvidence(
                "colosseum",
                "Colosseum",
                OfficialBookingPolicy.TIMED_RESERVATION_REQUIRED,
                "The official operator requires a timed reservation.",
                details,
                URI.create("https://example.test/source"),
                URI.create("https://example.test/book"),
                LocalDate.of(2026, 8, 25));
        return new BookingPriorityAssessment(
                "colosseum",
                "Colosseum",
                BookingPriority.BOOK_FIRST,
                BookingConfidence.HIGH,
                BookingTiming.AS_SOON_AS_VISIT_DATE_IS_FIXED,
                "Secure the timed reservation first.",
                "A timed reservation is required.",
                evidence,
                "rome-v1",
                Instant.parse("2026-08-25T10:00:00Z"));
    }
}
