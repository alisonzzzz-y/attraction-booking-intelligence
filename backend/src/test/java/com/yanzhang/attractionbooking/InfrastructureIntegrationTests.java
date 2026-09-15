package com.yanzhang.attractionbooking;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;
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

    @Autowired
    JdbcTemplate jdbcTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @LocalServerPort
    int port;

    @Test
    void connectsToMySqlAndAppliesFlywayMigration() {
        var migrationCount = jdbcTemplate.queryForObject(
                "select count(*) from flyway_schema_history where success = true",
                Integer.class);

        assertThat(migrationCount).isEqualTo(2);
        assertThat(tableExists("trips")).isEqualTo(1);
        assertThat(tableExists("saved_attractions")).isEqualTo(1);
    }

    @Test
    void persistsAndReadsATripThroughTheFourLayerStack() throws Exception {
        String requestBody = """
                {
                  "city": "Rome",
                  "stayStartDate": "2026-09-10",
                  "stayEndDate": "2026-09-12",
                  "dateMode": "EXACT",
                  "attractionIds": ["pantheon", "borghese-gallery"]
                }
                """;

        var createResponse = sendJson("POST", "/api/v1/trips", requestBody);

        assertThat(createResponse.statusCode()).isEqualTo(201);
        String tripId = objectMapper.readTree(createResponse.body()).required("id").asText();
        assertThat(createResponse.headers().firstValue("location"))
                .contains("/api/v1/trips/" + tripId);

        var readResponse = get("/api/v1/trips/" + tripId);

        assertThat(readResponse.statusCode()).isEqualTo(200);
        assertThat(readResponse.body()).contains("\"attractionIds\":[\"pantheon\",\"borghese-gallery\"]");
        assertThat(jdbcTemplate.queryForObject("select count(*) from trips", Integer.class)).isEqualTo(1);
        assertThat(jdbcTemplate.queryForObject("select count(*) from saved_attractions", Integer.class))
                .isEqualTo(2);
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
                        + "?stayStartDate=2026-10-10&stayEndDate=2026-10-12");
        var locationResponse = get("/api/v1/rome/places");

        assertThat(ticketResponse.statusCode()).isEqualTo(503);
        assertThat(ticketResponse.headers().firstValue("www-authenticate")).isEmpty();
        assertThat(locationResponse.statusCode()).isEqualTo(503);
        assertThat(locationResponse.headers().firstValue("www-authenticate")).isEmpty();
    }

    @Test
    void returnsASafeTemplateBookingExplanationWithoutAModelCredential() throws Exception {
        var response = get(
                "/api/v1/rome/booking-explanation"
                        + "?stayStartDate=2026-09-10&stayEndDate=2026-09-12");

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).contains("\"city\":\"Rome\"");
        assertThat(response.body()).contains("\"mode\":\"TEMPLATE_FALLBACK\"");
        assertThat(response.body()).doesNotContain("\"price\"");
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

    private HttpResponse<String> sendJson(String method, String path, String body) throws Exception {
        var request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + path))
                .header("Content-Type", "application/json")
                .method(method, HttpRequest.BodyPublishers.ofString(body))
                .build();

        return HttpClient.newHttpClient()
                .send(request, HttpResponse.BodyHandlers.ofString());
    }

    private Integer tableExists(String tableName) {
        return jdbcTemplate.queryForObject(
                "select count(*) from information_schema.tables where table_schema = database() and table_name = ?",
                Integer.class,
                tableName);
    }
}
