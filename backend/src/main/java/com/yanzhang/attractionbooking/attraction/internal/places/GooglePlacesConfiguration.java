package com.yanzhang.attractionbooking.attraction.internal.places;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(GooglePlacesProperties.class)
@ConditionalOnProperty(prefix = "providers.google-places", name = "enabled", havingValue = "true")
class GooglePlacesConfiguration {

    @Bean
    GooglePlacesClient googlePlacesClient(
            RestClient.Builder builder, GooglePlacesProperties properties) {
        return new GooglePlacesClient(builder, properties);
    }
}
