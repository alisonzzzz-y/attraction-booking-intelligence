package com.yanzhang.attractionbooking.provider.internal.viator;

import com.yanzhang.attractionbooking.provider.ProviderAdapter;
import java.time.Clock;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(ViatorProperties.class)
@ConditionalOnProperty(prefix = "providers.viator", name = "enabled", havingValue = "true")
class ViatorConfiguration {

    @Bean
    ViatorHttpClient viatorHttpClient(RestClient.Builder builder, ViatorProperties properties) {
        return new ViatorHttpClient(builder, properties);
    }

    @Bean
    ProviderAdapter viatorProviderAdapter(ViatorHttpClient client) {
        return new ViatorProviderAdapter(client, Clock.systemUTC());
    }
}
