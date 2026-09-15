package com.yanzhang.attractionbooking.aiexplanation.internal;

import com.yanzhang.attractionbooking.service.BookingExplanationFacts;

@FunctionalInterface
public interface BookingExplanationModelClient {

    String explain(BookingExplanationFacts facts);
}
