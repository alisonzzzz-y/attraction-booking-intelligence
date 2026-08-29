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
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.utility.DockerImageName;

@Testcontainers(disabledWithoutDocker = true)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class InfrastructureIntegrationTests {

    @Container
    @ServiceConnection
    static final MySQLContainer<?> MYSQL =
            new MySQLContainer<>(DockerImageName.parse("mysql:8.0"));

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
    void connectsToMySqlAndAppliesFlywayMigration() {
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
        var response = get("/actuator/health");

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).contains("\"status\":\"UP\"");
    }

    @Test
    void permitsTheConfiguredFrontendOriginToReadPublicEndpoints() throws Exception {
        var request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + "/api/v1/rome/booking-priorities"))
                .method("OPTIONS", HttpRequest.BodyPublishers.noBody())
                .header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "GET")
                .build();

        var response = HttpClient.newHttpClient()
                .send(request, HttpResponse.BodyHandlers.ofString());

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.headers().firstValue("access-control-allow-origin"))
                .contains("http://localhost:5173");
    }

    @Test
    void returnsProviderConfigurationErrorWithoutRequestingLogin() throws Exception {
        var ticketResponse = get(
                "/api/v1/rome/attractions"
                        + "?stayStartDate=2026-09-10&stayEndDate=2026-09-12");
        var locationResponse = get("/api/v1/rome/places");

        assertThat(ticketResponse.statusCode()).isEqualTo(503);
        assertThat(ticketResponse.headers().firstValue("www-authenticate")).isEmpty();
        assertThat(locationResponse.statusCode()).isEqualTo(503);
        assertThat(locationResponse.headers().firstValue("www-authenticate")).isEmpty();
    }

    @Test
    void doesNotAdvertiseBrowserLoginForAnUnknownPublicRoute() throws Exception {
        var response = get("/api/v1/rome/not-a-route");

        assertThat(response.statusCode()).isEqualTo(404);
        assertThat(response.headers().firstValue("www-authenticate")).isEmpty();
    }

    private HttpResponse<String> get(String path) throws Exception {
        var request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + path))
                .GET()
                .build();

        return HttpClient.newHttpClient()
                .send(request, HttpResponse.BodyHandlers.ofString());
    }
}
