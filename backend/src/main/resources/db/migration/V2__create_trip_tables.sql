CREATE TABLE trips (
    id VARCHAR(36) NOT NULL,
    city VARCHAR(100) NOT NULL,
    stay_start_date DATE NOT NULL,
    stay_end_date DATE NOT NULL,
    date_mode VARCHAR(20) NOT NULL,
    travel_month VARCHAR(7),
    trip_length_days INT,
    length_flex_days INT,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE saved_attractions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    trip_id VARCHAR(36) NOT NULL,
    attraction_id VARCHAR(120) NOT NULL,
    display_order INT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_saved_attraction_trip UNIQUE (trip_id, attraction_id),
    CONSTRAINT fk_saved_attraction_trip
        FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
);

CREATE INDEX idx_saved_attraction_trip ON saved_attractions (trip_id);
