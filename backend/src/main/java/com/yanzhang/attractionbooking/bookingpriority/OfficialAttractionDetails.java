package com.yanzhang.attractionbooking.bookingpriority;

import java.util.List;

public record OfficialAttractionDetails(
        String overview,
        String ticketName,
        List<String> includedItems,
        String recommendationLabel,
        String recommendationReason) {

    public OfficialAttractionDetails {
        requireText(overview, "Attraction overview is required");
        requireText(ticketName, "Official ticket name is required");
        includedItems = List.copyOf(includedItems);
        if (includedItems.isEmpty() || includedItems.stream().anyMatch(item -> item == null || item.isBlank())) {
            throw new IllegalArgumentException("At least one official ticket inclusion is required");
        }
        requireText(recommendationLabel, "Recommendation label is required");
        requireText(recommendationReason, "Recommendation reason is required");
    }

    private static void requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
    }
}
