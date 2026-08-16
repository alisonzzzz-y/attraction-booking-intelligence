# 架构说明

## 当前选择

后端采用 Spring Boot modular monolith。业务能力位于根 package 下的顶层模块，模块公开类型只放在模块根 package，实现细节放入 `internal`。Spring Modulith 在测试中验证模块边界。当前不拆分微服务，也不加入 Kafka 或 Kubernetes。

前端是独立的 Vite + React 应用，通过 REST API 与后端通信。开发服务器将 `/actuator` 代理到本机后端，用于最小 health 连接验证。当前 UI 只有应用壳和范围说明。

## 计划中的 provider adapter

`provider` 模块后续定义统一 adapter 契约。各授权 provider 的 HTTP client、认证和原始 DTO 留在各自的 `internal/infrastructure` 范围内。原始 provider 响应不会直接暴露给其他模块，跨模块只传递标准化结果和明确的来源元数据。

## 计划中的数据流

1. 行程输入进入 `trip`。
2. 景点标识由 `attraction` 管理。
3. `provider` 并发查询授权来源并标准化响应。
4. `availability` 聚合结果，同时保留 partial failure 信息。
5. `bookingpriority` 只根据经过测试的结构化规则计算优先级。
6. `alert` 与 `notification` 后续负责提醒和去重。
7. `aiexplanation` 只能解释上述结构化事实。

## 尚未实现

领域实体和业务表、provider adapter 契约、生产 API 调用、Redis 业务缓存、韧性策略、完整认证、提醒通知、LLM 调用和复杂页面均未实现。
