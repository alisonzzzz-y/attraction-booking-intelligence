package com.yanzhang.attractionbooking.service;

import com.yanzhang.attractionbooking.entity.TripDateMode;
import com.yanzhang.attractionbooking.entity.TripEntity;
import com.yanzhang.attractionbooking.repository.TripRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TripService {

    private static final long MAXIMUM_STAY_DAYS = 31;

    private final TripRepository tripRepository;
    private final Clock clock;

    @Autowired
    public TripService(TripRepository tripRepository) {
        this(tripRepository, Clock.systemUTC());
    }

    TripService(TripRepository tripRepository, Clock clock) {
        this.tripRepository = tripRepository;
        this.clock = clock;
    }

    @Transactional
    public TripDetails create(SaveTripCommand command) {
        String id = UUID.randomUUID().toString();
        TripEntity trip = new TripEntity(id, clock.instant());
        apply(trip, command);
        return TripDetails.from(tripRepository.save(trip));
    }

    @Transactional(readOnly = true)
    public TripDetails find(String tripId) {
        return tripRepository.findById(tripId)
                .map(TripDetails::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));
    }

    @Transactional
    public TripDetails replace(String tripId, SaveTripCommand command) {
        TripEntity trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));
        apply(trip, command);
        return TripDetails.from(tripRepository.save(trip));
    }

    private void apply(TripEntity trip, SaveTripCommand command) {
        validate(command);
        List<String> attractionIds = new LinkedHashSet<>(command.attractionIds()).stream().toList();
        boolean flexible = command.dateMode() == TripDateMode.FLEXIBLE;
        trip.replacePlan(
                command.city().trim(),
                command.stayStartDate(),
                command.stayEndDate(),
                command.dateMode(),
                flexible ? normaliseTravelMonth(command.travelMonth()) : null,
                flexible ? command.tripLengthDays() : null,
                flexible ? command.lengthFlexDays() : null,
                attractionIds,
                clock.instant());
    }

    private static void validate(SaveTripCommand command) {
        if (command.city() == null || command.city().isBlank()) {
            throw new IllegalArgumentException("City is required");
        }
        if (!"rome".equals(command.city().trim().toLowerCase(Locale.ROOT))) {
            throw new IllegalArgumentException("The current MVP supports Rome trips only");
        }
        if (command.stayStartDate() == null || command.stayEndDate() == null) {
            throw new IllegalArgumentException("Both stay dates are required");
        }
        long inclusiveDays = ChronoUnit.DAYS.between(command.stayStartDate(), command.stayEndDate()) + 1;
        if (inclusiveDays <= 0 || inclusiveDays > MAXIMUM_STAY_DAYS) {
            throw new IllegalArgumentException("A trip must cover between 1 and 31 days");
        }
        if (command.dateMode() == null) {
            throw new IllegalArgumentException("Date mode is required");
        }
        if (command.attractionIds() == null) {
            throw new IllegalArgumentException("Attraction IDs are required");
        }
        if (command.attractionIds().stream().anyMatch(id -> id == null || id.isBlank())) {
            throw new IllegalArgumentException("Attraction IDs must not be blank");
        }
        if (command.dateMode() == TripDateMode.FLEXIBLE) {
            if (command.travelMonth() == null
                    || command.tripLengthDays() == null
                    || command.lengthFlexDays() == null) {
                throw new IllegalArgumentException("Flexible trips require month, length, and flexibility");
            }
            try {
                YearMonth.parse(command.travelMonth());
            } catch (DateTimeParseException exception) {
                throw new IllegalArgumentException("Travel month must use YYYY-MM format");
            }
            if (command.tripLengthDays() <= 0 || command.lengthFlexDays() < 0) {
                throw new IllegalArgumentException("Flexible trip lengths must be valid positive values");
            }
        }
    }

    private static String normaliseTravelMonth(String travelMonth) {
        return travelMonth == null || travelMonth.isBlank() ? null : travelMonth;
    }

    public record SaveTripCommand(
            String city,
            LocalDate stayStartDate,
            LocalDate stayEndDate,
            TripDateMode dateMode,
            String travelMonth,
            Integer tripLengthDays,
            Integer lengthFlexDays,
            List<String> attractionIds) {}

    public record TripDetails(
            String id,
            String city,
            LocalDate stayStartDate,
            LocalDate stayEndDate,
            TripDateMode dateMode,
            String travelMonth,
            Integer tripLengthDays,
            Integer lengthFlexDays,
            List<String> attractionIds,
            Instant createdAt,
            Instant updatedAt) {

        static TripDetails from(TripEntity trip) {
            return new TripDetails(
                    trip.getId(),
                    trip.getCity(),
                    trip.getStayStartDate(),
                    trip.getStayEndDate(),
                    trip.getDateMode(),
                    trip.getTravelMonth(),
                    trip.getTripLengthDays(),
                    trip.getLengthFlexDays(),
                    trip.getSavedAttractions().stream()
                            .map(savedAttraction -> savedAttraction.getAttractionId())
                            .toList(),
                    trip.getCreatedAt(),
                    trip.getUpdatedAt());
        }
    }
}
