# ADR 0004: Historical Availability Observations

Status: Accepted as a design, implementation deferred
Date: 2026-08-22

中文状态：设计已确认，暂缓实现
中文日期：2026-08-22

## Context

Booking Priority should eventually tell a traveller how far in advance an attraction normally needs to be booked. A useful estimate requires repeated, traceable observations. One current API response, a manually chosen number, or a Sandbox schedule is not enough.

中文说明：Booking Priority 最终应该告诉旅行者某个景点通常需要提前多久预订。要产生可信的估算，系统必须积累重复且可追踪的观察记录。单次 API 响应、人工指定的数字或 Sandbox 排期都不足以支持这个结论。

The current Viator account has Basic Access in Sandbox only. Viator's official Partner API documentation states that Basic Access can use the single-product availability schedule endpoint, but cannot use the real-time `/availability/check` endpoint. It also warns that schedule data can quickly become outdated. The single-product endpoint is intended for on-demand retrieval when a customer selects a product, not for bulk ingestion. The current access therefore cannot support a historical collector that produces user-facing lead-time estimates.

中文说明：当前 Viator 账号只有 Sandbox Basic Access。Viator 官方 Partner API 文档说明，Basic Access 可以调用单产品排期接口，但不能调用实时 `/availability/check`。官方文档也提醒排期数据可能很快过期。单产品接口适合用户选择产品时按需读取，不适合批量导入。因此，当前权限不能支持一个用于生成用户可见提前预订时间的历史采集器。

Official reference: [Viator Partner API technical documentation](https://docs.viator.com/partner-api/technical/)

中文参考：以上结论来自 [Viator Partner API 官方技术文档](https://docs.viator.com/partner-api/technical/)。

## Decision

We will define the observation model now, but we will not add a database table, polling job, or exact lead-time calculation until the provider permissions and retention terms have been verified for production use.

中文决定：现在先确定观察模型，但在 production 权限和数据保留条款确认前，不创建数据库表、定时采集任务或精确提前天数算法。

An observation will contain the following fields when implementation becomes permitted:

| Field | Meaning | 中文含义 |
| --- | --- | --- |
| `observationId` | Internal immutable ID | 内部不可变 ID |
| `attractionId` | Stable internal attraction ID | 稳定的内部景点 ID |
| `providerId` | Provider that supplied the signal | 提供信号的 Provider |
| `environment` | `SANDBOX` or `PRODUCTION` | Sandbox 或 production 环境 |
| `accessTier` | Verified access tier at collection time | 采集时已确认的权限级别 |
| `productCode` | Provider product mapping | Provider 产品映射 |
| `optionCode` | Optional product option mapping | 可选的产品 option 映射 |
| `visitDate` | Date being checked | 被检查的参观日期 |
| `observedAt` | UTC retrieval time | UTC 获取时间 |
| `retrievalMode` | On-demand schedule or real-time check | 按需排期或实时检查 |
| `signal` | The narrow fact returned by the source | 来源实际返回的最小事实 |
| `sourceReference` | Traceable endpoint or source reference | 可追踪的接口或来源引用 |
| `retentionExpiresAt` | Required deletion time, when applicable | 条款要求的删除时间，如适用 |

The allowed signals will remain deliberately narrow:

| Signal | What it means | What it does not mean |
| --- | --- | --- |
| `SCHEDULE_PRESENT` | A product schedule covers the visit date | It does not prove that a ticket is available now |
| `EXPLICITLY_UNAVAILABLE` | The schedule explicitly lists the date or time as unavailable | It is not a cross-provider conclusion and may not be real-time |
| `REAL_TIME_AVAILABLE` | A permitted real-time endpoint returned available for a defined date, time, option, and traveller mix | It does not prove future availability or official-site availability |
| `REAL_TIME_UNAVAILABLE` | A permitted real-time endpoint returned unavailable for the same defined inputs | It does not prove that every ticket source is sold out |
| `REQUEST_FAILED` | No conclusion was obtained | It must never be converted into unavailable |

中文说明：信号保持最小且明确。`SCHEDULE_PRESENT` 只表示排期覆盖目标日期，不代表此刻有票。`EXPLICITLY_UNAVAILABLE` 只表示该排期明确列出不可用日期或时间，而且可能不是实时数据。`REAL_TIME_AVAILABLE` 和 `REAL_TIME_UNAVAILABLE` 只有在获准调用实时接口，并且日期、时间、option 和游客组合都明确时才能记录。`REQUEST_FAILED` 表示没有得到结论，绝不能转换成无票。

## Collection and retention gates

Implementation may start only after all of the following are true:

1. The project has production access to an endpoint that is suitable for the intended observation method.
2. Written provider terms confirm which fields may be stored, for how long, and at what polling frequency.
3. The selected products are mapped to the correct attraction and ticket type.
4. Sandbox and fixture observations are excluded from user-facing estimates.
5. Official operator rules remain a separate evidence stream.
6. Raw provider payloads, reviews, and protected unique content are not stored unless the terms explicitly allow it.

中文实施闸门：只有满足以下条件后才能开始实现。项目必须获得适合该观察方式的 production 接口权限；书面条款必须确认可保存字段、保存期限和调用频率；产品必须正确映射到景点和票种；Sandbox 与 fixture 观察必须排除在用户估算之外；官方规则继续作为独立证据流；除非条款明确允许，否则不保存原始响应、评论或受保护的独家内容。

## Lead-time calculation gate

The UI may show an exact range such as "usually book 7 to 14 days ahead" only when a versioned calculation has enough production observations across multiple visit dates and observation times. The calculation must publish its sample size, observation window, season, provider scope, and confidence. Until then, the existing qualitative labels remain the truthful product behaviour.

中文计算闸门：只有版本化算法拥有跨多个参观日期和观察时间的足量 production 记录后，UI 才能显示“通常提前 7 至 14 天预订”一类精确范围。结论必须同时公开样本量、观察周期、季节、Provider 范围和置信度。在此之前，现有定性标签仍然是最真实的产品行为。

## Consequences

Part 10J is complete as a design decision. No collector, historical business table, or precise lead-time estimate is implemented. This avoids presenting Sandbox schedules as demand history and keeps the project ready for a compliant implementation when production access becomes available.

中文结果：Part 10J 已作为设计决策完成。目前没有实现采集器、历史业务表或精确提前天数估算。这样可以避免把 Sandbox 排期包装成需求历史，同时为以后获得 production 权限后的合规实现保留清晰路径。
