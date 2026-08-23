package com.yanzhang.attractionbooking.provider;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Objects;

public record OpeningHours(Status status, List<Window> windows, SourceMetadata source) {

    public OpeningHours {
        Objects.requireNonNull(status, "Opening-hours status must not be null");
        Objects.requireNonNull(windows, "Opening-hours windows must not be null");
        windows = List.copyOf(windows);
        Objects.requireNonNull(source, "Opening-hours source must not be null");
        if (status == Status.KNOWN && windows.isEmpty()) {
            throw new IllegalArgumentException("Known opening hours require at least one window");
        }
        if (status != Status.KNOWN && !windows.isEmpty()) {
            throw new IllegalArgumentException("Only known opening hours may contain windows");
        }
    }

    public enum Status {
        KNOWN,
        CLOSED,
        UNKNOWN,
        REQUEST_FAILED
    }

    public record Window(LocalDate date, LocalTime opensAt, LocalTime closesAt) {

        public Window {
            Objects.requireNonNull(date, "Opening date must not be null");
            Objects.requireNonNull(opensAt, "Opening time must not be null");
            Objects.requireNonNull(closesAt, "Closing time must not be null");
        }
    }
}
