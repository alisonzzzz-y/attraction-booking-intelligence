package com.yanzhang.attractionbooking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "saved_attractions")
public class SavedAttractionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trip_id", nullable = false)
    private TripEntity trip;

    @Column(name = "attraction_id", length = 120, nullable = false)
    private String attractionId;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    protected SavedAttractionEntity() {}

    SavedAttractionEntity(TripEntity trip, String attractionId, int displayOrder) {
        this.trip = trip;
        this.attractionId = attractionId;
        this.displayOrder = displayOrder;
    }

    public Long getId() {
        return id;
    }

    public String getAttractionId() {
        return attractionId;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }
}
