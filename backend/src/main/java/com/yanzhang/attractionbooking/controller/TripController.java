package com.yanzhang.attractionbooking.controller;

import com.yanzhang.attractionbooking.entity.TripDateMode;
import com.yanzhang.attractionbooking.service.TripService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.net.URI;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/trips")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    @PostMapping
    public ResponseEntity<TripResponse> create(@Valid @RequestBody SaveTripRequest request) {
        TripResponse response = TripResponse.from(tripService.create(request.toCommand()));
        return ResponseEntity.created(URI.create("/api/v1/trips/" + response.id())).body(response);
    }

    @GetMapping("/{tripId}")
    public TripResponse find(@PathVariable String tripId) {
        return TripResponse.from(tripService.find(tripId));
    }

    @PutMapping("/{tripId}")
    public TripResponse replace(
            @PathVariable String tripId,
            @Valid @RequestBody SaveTripRequest request) {
        return TripResponse.from(tripService.replace(tripId, request.toCommand()));
    }

    record SaveTripRequest(
            @NotBlank String city,
            @NotNull LocalDate stayStartDate,
            @NotNull LocalDate stayEndDate,
            @NotNull TripDateMode dateMode,
            String travelMonth,
            Integer tripLengthDays,
            Integer lengthFlexDays,
            @NotNull @Size(max = 50) List<@NotBlank String> attractionIds) {

        TripService.SaveTripCommand toCommand() {
            return new TripService.SaveTripCommand(
                    city,
                    stayStartDate,
                    stayEndDate,
                    dateMode,
                    travelMonth,
                    tripLengthDays,
                    lengthFlexDays,
                    attractionIds);
        }
    }

    record TripResponse(
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

        static TripResponse from(TripService.TripDetails trip) {
            return new TripResponse(
                    trip.id(),
                    trip.city(),
                    trip.stayStartDate(),
                    trip.stayEndDate(),
                    trip.dateMode(),
                    trip.travelMonth(),
                    trip.tripLengthDays(),
                    trip.lengthFlexDays(),
                    trip.attractionIds(),
                    trip.createdAt(),
                    trip.updatedAt());
        }
    }
}
