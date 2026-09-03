package com.yanzhang.attractionbooking.bookingpriority.internal;

import com.yanzhang.attractionbooking.bookingpriority.BookingPriorityAssessment;
import com.yanzhang.attractionbooking.bookingpriority.OfficialAttractionDetails;
import com.yanzhang.attractionbooking.bookingpriority.OfficialBookingEvidence;
import com.yanzhang.attractionbooking.bookingpriority.RomeBookingPriorityQuery;
import java.net.URI;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/rome/booking-priorities")
class RomeBookingPriorityController {

    private final RomeBookingPriorityQuery service;

    RomeBookingPriorityController(RomeBookingPriorityQuery service) {
        this.service = service;
    }

    @GetMapping
    RomeBookingPriorityResponse assess(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate stayStartDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate stayEndDate) {
        return new RomeBookingPriorityResponse(
                "Rome",
                stayStartDate,
                stayEndDate,
                service.assess(stayStartDate, stayEndDate).stream()
                        .map(BookingPriorityView::from)
                        .toList());
    }

    record RomeBookingPriorityResponse(
            String city,
            LocalDate stayStartDate,
            LocalDate stayEndDate,
            List<BookingPriorityView> priorities) {}

    record BookingPriorityView(
            String attractionId,
            String attractionName,
            String priority,
            String confidence,
            String timing,
            String action,
            String explanation,
            OfficialEvidenceView officialEvidence,
            String ruleVersion,
            Instant calculatedAt) {

        static BookingPriorityView from(BookingPriorityAssessment assessment) {
            return new BookingPriorityView(
                    assessment.attractionId(),
                    assessment.attractionName(),
                    assessment.priority().name(),
                    assessment.confidence().name(),
                    assessment.timing().name(),
                    assessment.action(),
                    assessment.explanation(),
                    OfficialEvidenceView.from(assessment.officialEvidence()),
                    assessment.ruleVersion(),
                    assessment.calculatedAt());
        }
    }

    record OfficialEvidenceView(
            String sourceType,
            String policy,
            String factualBasis,
            OfficialAttractionDetailsView details,
            URI sourceUrl,
            URI bookingUrl,
            LocalDate checkedOn) {

        static OfficialEvidenceView from(OfficialBookingEvidence evidence) {
            return new OfficialEvidenceView(
                    "OFFICIAL_OPERATOR",
                    evidence.policy().name(),
                    evidence.factualBasis(),
                    OfficialAttractionDetailsView.from(evidence.details()),
                    evidence.sourceUrl(),
                    evidence.bookingUrl(),
                    evidence.checkedOn());
        }
    }

    record OfficialAttractionDetailsView(
            String overview,
            String ticketName,
            List<String> includedItems,
            String recommendationLabel,
            String recommendationReason) {

        static OfficialAttractionDetailsView from(OfficialAttractionDetails details) {
            return new OfficialAttractionDetailsView(
                    details.overview(),
                    details.ticketName(),
                    details.includedItems(),
                    details.recommendationLabel(),
                    details.recommendationReason());
        }
    }
}
