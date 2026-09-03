package com.yanzhang.attractionbooking.aiexplanation.internal;

import com.yanzhang.attractionbooking.aiexplanation.BookingExplanation;
import com.yanzhang.attractionbooking.aiexplanation.BookingExplanationFact;
import com.yanzhang.attractionbooking.aiexplanation.RomeBookingExplanationQuery;
import com.yanzhang.attractionbooking.bookingpriority.BookingPriorityAssessment;
import com.yanzhang.attractionbooking.bookingpriority.RomeBookingPriorityQuery;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
class RomeBookingExplanationService implements RomeBookingExplanationQuery {

    static final String BOUNDARY_NOTICE = "This explanation is anchored to checked official booking facts and deterministic priority rules. It does not claim prices, live availability, or a sell-out deadline.";

    private final RomeBookingPriorityQuery bookingPriorityQuery;
    private final TemplateBookingExplanation template;
    private final Optional<OpenAiBookingExplanationClient> modelClient;

    RomeBookingExplanationService(
            RomeBookingPriorityQuery bookingPriorityQuery,
            TemplateBookingExplanation template,
            Optional<OpenAiBookingExplanationClient> modelClient) {
        this.bookingPriorityQuery = bookingPriorityQuery;
        this.template = template;
        this.modelClient = modelClient;
    }

    @Override
    public BookingExplanation explain(LocalDate stayStartDate, LocalDate stayEndDate) {
        BookingExplanationFacts facts = new BookingExplanationFacts(
                "Rome",
                stayStartDate,
                stayEndDate,
                bookingPriorityQuery.assess(stayStartDate, stayEndDate).stream()
                        .map(RomeBookingExplanationService::factFrom)
                        .toList());

        if (modelClient.isEmpty()) {
            return response(facts, BookingExplanation.Mode.TEMPLATE_FALLBACK, template.summary(facts));
        }
        try {
            return response(facts, BookingExplanation.Mode.MODEL, modelClient.orElseThrow().explain(facts));
        } catch (AiExplanationClientException exception) {
            return response(facts, BookingExplanation.Mode.TEMPLATE_FALLBACK, template.summary(facts));
        }
    }

    private static BookingExplanation response(
            BookingExplanationFacts facts, BookingExplanation.Mode mode, String summary) {
        return new BookingExplanation(
                facts.city(),
                facts.stayStartDate(),
                facts.stayEndDate(),
                mode,
                summary,
                facts.facts(),
                BOUNDARY_NOTICE);
    }

    private static BookingExplanationFact factFrom(BookingPriorityAssessment assessment) {
        return new BookingExplanationFact(
                assessment.attractionId(),
                assessment.attractionName(),
                assessment.priority().name(),
                assessment.timing().name(),
                assessment.officialEvidence().policy().name(),
                assessment.officialEvidence().factualBasis(),
                assessment.action(),
                assessment.ruleVersion(),
                assessment.officialEvidence().checkedOn());
    }
}
