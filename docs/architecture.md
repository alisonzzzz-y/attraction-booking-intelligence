# Backend architecture / 后端架构

## Layered structure

The backend uses a conventional Spring Boot four-layer structure. Dependencies flow in one direction:

```text
controller -> service -> repository -> entity
```

- `controller` owns HTTP routes, request validation, response DTOs, and exception mapping.
- `service` owns use cases, validation, orchestration, and deterministic booking rules.
- `repository` owns database access and the checked official-evidence catalogue.
- `entity` contains JPA persistence models for trips and saved attractions.
- Provider-specific packages contain external API clients and adapters. They are infrastructure, not database repositories.
- Provider and booking-priority value objects remain separate from JPA entities because external facts should not be persisted as if they were current production data.

The application remains one deployable Spring Boot service. It is not split into microservices and does not require Kafka or Kubernetes.

## 分层结构

后端采用经典的 Spring Boot 四层结构，依赖方向保持单向：

```text
controller -> service -> repository -> entity
```

- `controller` 负责 HTTP 路由、请求校验、响应 DTO 和异常映射。
- `service` 负责业务用例、参数校验、流程编排和确定性的预约规则。
- `repository` 负责数据库访问，以及经过人工核对的官方证据目录。
- `entity` 包含 Trip 和 Saved Attraction 的 JPA 持久化实体。
- 外部 API client 和 adapter 属于基础设施代码，不伪装成数据库 Repository。
- Provider 与 Booking Priority 的值对象不会直接变成 JPA Entity，避免把外部事实当作本项目拥有的实时数据库事实。

整个后端仍然是一个 Spring Boot 单体服务，不拆分微服务，也不引入 Kafka 或 Kubernetes。

## Persistent trip flow / 行程持久化流程

`TripController` accepts an anonymous trip payload. `TripService` validates the Rome scope and the 31-day limit. `TripRepository` persists `TripEntity` and its ordered `SavedAttractionEntity` children through Spring Data JPA. Flyway migration `V2__create_trip_tables.sql` creates the MySQL tables.

`TripController` 接收匿名行程数据，`TripService` 校验 Rome 范围和最长 31 天限制，`TripRepository` 通过 Spring Data JPA 保存 `TripEntity` 及其有顺序的 `SavedAttractionEntity`。MySQL 表由 Flyway 的 `V2__create_trip_tables.sql` 创建。

The API currently provides:

- `POST /api/v1/trips`
- `GET /api/v1/trips/{tripId}`
- `PUT /api/v1/trips/{tripId}`

The public frontend still keeps its browser-local fallback. Connecting that UI to the persistent API is separate from account synchronisation because authentication has not been implemented.

公开前端目前仍保留浏览器本地保存作为降级方式。由于项目尚未实现登录认证，不能把匿名 Trip API 描述成账号同步功能。

## Provider boundary / Provider 边界

Every provider enters through the common `ProviderAdapter` contract. The Viator implementation is authorised Sandbox access only. Google Places supplies location evidence only. A single provider or attraction failure is retained as a partial error and must not erase successful facts from other sources.

所有 Provider 都通过统一的 `ProviderAdapter` 契约接入。Viator 当前仅为经过授权的 Sandbox，Google Places 只提供地点证据。单个 Provider 或景点失败会保留为 partial error，不能清空其他来源已经成功返回的事实。

## AI boundary / AI 边界

The AI explanation service can only explain the structured result returned by the deterministic booking-priority service. Model output that introduces prices, live availability, URLs, or unsupported claims is rejected and replaced by a rule-based fallback.

AI 解释服务只能解释确定性 Booking Priority Service 已经返回的结构化事实。任何自行加入价格、实时余票、URL 或无来源结论的模型输出都会被拒绝，并回退到规则模板。
