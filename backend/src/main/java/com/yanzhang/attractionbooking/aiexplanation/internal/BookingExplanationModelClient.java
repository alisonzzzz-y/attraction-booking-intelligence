package com.yanzhang.attractionbooking.aiexplanation.internal;

@FunctionalInterface
interface BookingExplanationModelClient {

    String explain(BookingExplanationFacts facts);
}
