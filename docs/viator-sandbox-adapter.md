# Viator Sandbox Adapter

Last updated: 19 August 2026

## Scope

Part 9 adds one minimal, read-only adapter for the Viator Partner API Sandbox. It requests a verified product and its availability schedule, then maps a small set of confirmed fields into the provider-neutral domain contract.

中文说明：Part 9 新增一个最小、只读的 Viator Partner API Sandbox adapter。它会查询已核对的产品和对应排期，再把少量已确认字段映射到 Provider 无关领域契约。

The adapter is disabled by default and is not exposed through a REST endpoint or the public interface. It does not call the production API, perform bookings, check live capacity, or decide how early a traveller should buy a ticket.

中文说明：Adapter 默认关闭，目前没有通过 REST endpoint 或公开前端暴露。它不会调用 production API、执行预订、检查实时容量，也不会判断用户应该提前多久购票。

## Configuration

The backend reads the following environment variables:

```dotenv
VIATOR_API_ENABLED=true
VIATOR_API_BASE_URL=https://api.sandbox.viator.com/partner
VIATOR_API_KEY=your_local_sandbox_key
```

中文说明：后端从以上环境变量读取启用状态、Sandbox 地址和本地 key。真实 key 只能保存在未提交的本地环境文件或部署平台 secret 中。

The configuration remains disabled when `VIATOR_API_ENABLED` is absent or `false`. Enabling it without `VIATOR_API_KEY` causes startup to fail with a fixed message that does not reveal secret content.

中文说明：如果没有设置 `VIATOR_API_ENABLED`，或值为 `false`，Viator 配置不会启动。如果启用后缺少 `VIATOR_API_KEY`，后端会用固定且不含敏感内容的错误信息停止启动。

## Confirmed requests and mappings

The adapter uses the authorised Basic Access endpoints below:

- `GET /products/{product-code}`
- `GET /availability/schedules/{product-code}`

The first repeatable contract case uses the previously verified Rome product `5569822P4`, which is a Pantheon Sandbox candidate. Automated tests use a local HTTP stub with a minimal Sandbox-labelled sample. They do not make a live network request.

中文说明：首个可重复 contract case 使用之前核对过的 Rome 产品 `5569822P4`，它是 Pantheon 的 Sandbox 候选。自动化测试使用本地 HTTP stub 和明确标记的最小 Sandbox 样本，不发起实时网络请求。

The current mapping preserves:

- provider ID and `SANDBOX` environment;
- internal attraction ID and verified Viator product reference;
- product status and product-level schedule status;
- product-level `fromPrice` and currency when supplied;
- booking cutoff duration when supplied;
- source URL, retrieval timestamp, and freshness;
- stable errors and affected attraction IDs.

中文说明：当前映射保留 Provider、Sandbox 环境、内部景点 ID、已核对的 Viator product reference、产品状态、产品级排期状态、`fromPrice`、币种、booking cutoff、来源 URL、获取时间、freshness，以及稳定的错误信息和受影响景点 ID。

## Data safety boundaries

`SCHEDULED` means that a product is active and the schedule response contains bookable items. It does not mean that a place is available now or that a booking will succeed. Basic Access does not provide the `/availability/check` capability used for a live capacity decision.

中文说明：`SCHEDULED` 只表示产品处于 active 状态，而且 schedule 响应包含 bookable items。它不代表现在仍有票，也不保证能够完成预订。Basic Access 没有用于实时容量判断的 `/availability/check` 权限。

An unavailable date attached to one option or one timed entry is not promoted to product-wide unavailability. The first adapter therefore leaves product-level `explicitlyUnavailableDates` empty until option-level normalization is designed.

中文说明：属于某个 option 或 timed entry 的 unavailable date 不会被提升为整个产品不可用。因此，在 option-level normalization 完成设计前，第一版 adapter 不会填写产品级 `explicitlyUnavailableDates`。

The HTTP client sends the API key only in the required `exp-api-key` header. It does not log the key, request headers, raw response body, or upstream exception text. User-facing provider errors use fixed messages.

中文说明：HTTP client 只通过要求的 `exp-api-key` header 发送 key。它不会记录 key、请求头、原始响应内容或上游异常文本。对外 Provider 错误只使用固定信息。

## Test coverage

The contract tests verify required headers, the confirmed Pantheon field mapping, Sandbox source metadata, retrieval time, inactive products, missing mappings, partial failure, and authentication error redaction. They also prove the retry boundary: one retry after an upstream `503` or gateway-timeout `504`, no retry after `403` authentication failure or `429` rate limiting, and no third request when the upstream remains unavailable.

中文说明：Contract tests 覆盖必要请求头、Pantheon 已确认字段映射、Sandbox 来源信息、获取时间、inactive 产品、缺少映射、部分失败和认证错误脱敏。它们也验证重试边界：遇到上游 `503` 或网关超时 `504` 时只重试一次；`403` 认证失败和 `429` 限流不重试；持续上游故障时不会发出第三次请求。

Current official reference: [Viator Partner API technical documentation](https://docs.viator.com/partner-api/technical/).

中文说明：当前字段和端点以 Viator Partner API 官方技术文档为准。
