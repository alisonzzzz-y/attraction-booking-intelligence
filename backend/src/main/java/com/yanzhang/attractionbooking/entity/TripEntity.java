package com.yanzhang.attractionbooking.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "trips")
public class TripEntity {

    @Id
    @Column(length = 36, nullable = false, updatable = false)
    private String id;

    @Column(length = 100, nullable = false)
    private String city;

    @Column(name = "stay_start_date", nullable = false)
    private LocalDate stayStartDate;

    @Column(name = "stay_end_date", nullable = false)
    private LocalDate stayEndDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "date_mode", length = 20, nullable = false)
    private TripDateMode dateMode;

    @Column(name = "travel_month", length = 7)
    private String travelMonth;

    @Column(name = "trip_length_days")
    private Integer tripLengthDays;

    @Column(name = "length_flex_days")
    private Integer lengthFlexDays;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("displayOrder ASC")
    private List<SavedAttractionEntity> savedAttractions = new ArrayList<>();

    protected TripEntity() {}

    public TripEntity(String id, Instant now) {
        this.id = id;
        this.createdAt = now;
        this.updatedAt = now;
    }

    public void replacePlan(
            String city,
            LocalDate stayStartDate,
            LocalDate stayEndDate,
            TripDateMode dateMode,
            String travelMonth,
            Integer tripLengthDays,
            Integer lengthFlexDays,
            List<String> attractionIds,
            Instant now) {
        this.city = city;
        this.stayStartDate = stayStartDate;
        this.stayEndDate = stayEndDate;
        this.dateMode = dateMode;
        this.travelMonth = travelMonth;
        this.tripLengthDays = tripLengthDays;
        this.lengthFlexDays = lengthFlexDays;
        this.updatedAt = now;
        this.savedAttractions.clear();
        for (int index = 0; index < attractionIds.size(); index++) {
            this.savedAttractions.add(new SavedAttractionEntity(this, attractionIds.get(index), index));
        }
    }

    public String getId() {
        return id;
    }

    public String getCity() {
        return city;
    }

    public LocalDate getStayStartDate() {
        return stayStartDate;
    }

    public LocalDate getStayEndDate() {
        return stayEndDate;
    }

    public TripDateMode getDateMode() {
        return dateMode;
    }

    public String getTravelMonth() {
        return travelMonth;
    }

    public Integer getTripLengthDays() {
        return tripLengthDays;
    }

    public Integer getLengthFlexDays() {
        return lengthFlexDays;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public List<SavedAttractionEntity> getSavedAttractions() {
        return List.copyOf(savedAttractions);
    }
}
