package com.yanzhang.attractionbooking.aiexplanation.internal;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(AiExplanationProperties.class)
class AiExplanationConfiguration {

    @Bean
    @ConditionalOnProperty(prefix = "ai-explanation", name = "enabled", havingValue = "true")
    OpenAiBookingExplanationClient openAiBookingExplanationClient(
            RestClient.Builder restClientBuilder,
            ObjectMapper objectMapper,
            AiExplanationProperties properties) {
        return new OpenAiBookingExplanationClient(restClientBuilder, objectMapper, properties);
    }
}
