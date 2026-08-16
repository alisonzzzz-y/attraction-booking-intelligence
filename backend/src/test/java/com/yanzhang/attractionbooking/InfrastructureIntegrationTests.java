package com.yanzhang.attractionbooking;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

@Testcontainers(disabledWithoutDocker = true)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class InfrastructureIntegrationTests {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer POSTGRES =
            new PostgreSQLContainer(DockerImageName.parse("postgres:17.10-alpine"));

    @Container
    @ServiceConnection(name = "redis")
    static final GenericContainer<?> REDIS =
            new GenericContainer<>(DockerImageName.parse("redis:8.8.0-alpine"))
                    .withExposedPorts(6379);

    @Autowired
    JdbcTemplate jdbcTemplate;

    @Autowired
    StringRedisTemplate redisTemplate;

    @LocalServerPort
    int port;

    @Test
    void connectsToPostgresAndAppliesFlywayMigration() {
        var migrationCount = jdbcTemplate.queryForObject(
                "select count(*) from flyway_schema_history where success = true",
                Integer.class);

        assertThat(migrationCount).isEqualTo(1);
    }

    @Test
    void connectsToRedis() {
        assertThat(redisTemplate.getConnectionFactory().getConnection().ping()).isEqualTo("PONG");
    }

    @Test
    void exposesPublicHealthEndpoint() throws Exception {
        var request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + "/actuator/health"))
                .GET()
                .build();

        var response = HttpClient.newHttpClient()
                .send(request, HttpResponse.BodyHandlers.ofString());

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).contains("\"status\":\"UP\"");
    }
}
