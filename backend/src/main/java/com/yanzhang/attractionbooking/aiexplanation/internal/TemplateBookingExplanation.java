package com.yanzhang.attractionbooking.aiexplanation.internal;

import org.springframework.stereotype.Component;

@Component
class TemplateBookingExplanation {

    String summary(BookingExplanationFacts facts) {
        long timedEntryCount = facts.facts().stream()
                .filter(fact -> "TIMED_RESERVATION_REQUIRED".equals(fact.officialPolicy()))
                .count();
        if (timedEntryCount > 0) {
            return "This booking order starts with the attractions whose official guidance requires a timed reservation, then keeps the remaining visits in the published order.";
        }
        return "This booking order follows the checked official guidance for each attraction and keeps higher-priority decisions ahead of ordinary walk-in visits.";
    }
}
