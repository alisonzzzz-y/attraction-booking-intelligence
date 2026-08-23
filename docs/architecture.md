# 架构说明

## 当前选择

后端采用 Spring Boot modular monolith。业务能力位于根 package 下的顶层模块，模块公开类型只放在模块根 package，实现细节放入 `internal`。Spring Modulith 在测试中验证模块边界。当前不拆分微服务，也不加入 Kafka 或 Kubernetes。

前端是独立的 Vite + React 应用，通过 REST API 与后端通信。开发服务器将 `/actuator` 代理到本机后端，用于最小 health 连接验证。当前 UI 只有应用壳和范围说明。

## Provider adapter 边界

`provider` 模块已经定义统一的 `ProviderAdapter` 契约、标准化事实、来源与环境元数据、freshness、错误和 partial failure 类型。第一版 Viator Basic Access Sandbox 实现位于 `provider.internal.viator`，其中包含认证配置、HTTP client、原始 DTO、字段映射和错误转换。原始 Provider 响应不会直接暴露给其他模块，跨模块只传递标准化结果和明确的来源元数据。详细语义见 [`provider-domain-contract.md`](provider-domain-contract.md)，第一版实现边界见 [`viator-sandbox-adapter.md`](viator-sandbox-adapter.md)。

## 计划中的数据流

1. 行程输入进入 `trip`。
2. 景点标识由 `attraction` 管理。
3. `provider` 并发查询授权来源并标准化响应。
4. `availability` 聚合结果，同时保留 partial failure 信息。
5. `bookingpriority` 只根据经过测试的结构化规则计算优先级。
6. `alert` 与 `notification` 后续负责提醒和去重。
7. `aiexplanation` 只能解释上述结构化事实。

## 尚未实现

完整领域实体和业务表、Provider 聚合服务、REST 查询入口、production API 调用、Redis 业务缓存、韧性策略、完整认证、提醒通知、LLM 调用和复杂页面均未实现。当前唯一的具体 adapter 是默认关闭的 Viator Sandbox 只读实现。
