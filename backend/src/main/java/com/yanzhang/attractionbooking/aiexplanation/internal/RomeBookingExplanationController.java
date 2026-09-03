package com.yanzhang.attractionbooking.aiexplanation.internal;

import com.yanzhang.attractionbooking.aiexplanation.BookingExplanation;
import com.yanzhang.attractionbooking.aiexplanation.BookingExplanationFact;
import com.yanzhang.attractionbooking.aiexplanation.RomeBookingExplanationQuery;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/rome/booking-explanation")
class RomeBookingExplanationController {

    private final RomeBookingExplanationQuery query;

    RomeBookingExplanationController(RomeBookingExplanationQuery query) {
        this.query = query;
    }

    @GetMapping
    BookingExplanationResponse explain(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate stayStartDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate stayEndDate) {
        return BookingExplanationResponse.from(query.explain(stayStartDate, stayEndDate));
    }

    record BookingExplanationResponse(
            String city,
            LocalDate stayStartDate,
            LocalDate stayEndDate,
            String mode,
            String summary,
            List<FactView> facts,
            String boundaryNotice) {

        static BookingExplanationResponse from(BookingExplanation explanation) {
            return new BookingExplanationResponse(
                    explanation.city(),
                    explanation.stayStartDate(),
                    explanation.stayEndDate(),
                    explanation.mode().name(),
                    explanation.summary(),
                    explanation.facts().stream().map(FactView::from).toList(),
                    explanation.boundaryNotice());
        }
    }

    record FactView(
            String attractionId,
            String attractionName,
            String priority,
            String timing,
            String officialPolicy,
            String factualBasis,
            String action,
            String ruleVersion,
            LocalDate checkedOn) {

        static FactView from(BookingExplanationFact fact) {
            return new FactView(
                    fact.attractionId(),
                    fact.attractionName(),
                    fact.priority(),
                    fact.timing(),
                    fact.officialPolicy(),
                    fact.factualBasis(),
                    fact.action(),
                    fact.ruleVersion(),
                    fact.checkedOn());
        }
    }
}
