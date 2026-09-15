package com.yanzhang.attractionbooking.repository;

import com.yanzhang.attractionbooking.entity.TripEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TripRepository extends JpaRepository<TripEntity, String> {}
