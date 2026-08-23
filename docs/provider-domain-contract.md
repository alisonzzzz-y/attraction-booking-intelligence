# Provider Domain Contract / Provider 领域契约

状态：Part 8 已实现
完成日期：2026-08-19

## 1. 目的

`provider` 模块现在公开一套与具体供应商无关的 Java 契约。Viator、Tiqets 或其他 Provider 的 HTTP client、认证方式和原始 DTO 后续只能放在各自的 `provider.internal` 实现中。其他业务模块只接收这里定义的标准化结果。

当前契约不调用外部 API，也不包含真实票价、余票或预约结论。

## 2. 统一入口

`ProviderAdapter` 暴露三个最小能力：

- 返回稳定的 `ProviderId`。
- 明确当前是 `SANDBOX` 还是 `PRODUCTION`。
- 接收 `AvailabilityQuery` 并返回 `ProviderSearchResult`。

查询包含城市、开始日期、结束日期和一个或多个 `AttractionRequest`。日期范围必须有效，景点列表不能为空。

## 3. 标准化事实

| 类型 | 表达内容 | 关键边界 |
| --- | --- | --- |
| `Attraction` | 内部景点 ID、显示名称、位置、外部映射和来源 | 不包含 Google 或 Provider 原始 DTO |
| `ExternalReference` | 外部系统名称与 ID | Google Place ID 以 `google-place` 外部引用保存 |
| `Location` | 经纬度和可选格式化地址 | 不绑定 Google Places 响应结构 |
| `OpeningHours` | 已知开放时段、明确关闭、未知或请求失败 | “未知”不能显示为“关闭” |
| `BookingUrgencyEvidence` | 是否必须或建议预约、booking cutoff、销售窗口 | 只保存证据，不直接生成预约优先级 |
| `Availability` | 已有销售日程、明确不可用、未知或请求失败 | `SCHEDULED` 不代表实时有票 |
| `Price` | 金额、币种、精确价或起价、产品和 option 引用 | 价格必须保留来源，不默认为实时 |
| `SourceMetadata` | 来源类型、来源 ID、环境、获取时间、freshness 和参考 URL | Sandbox 和 production 必须保持可区分 |
| `ProviderError` | 认证、限流、超时、上游失败、无效响应等错误 | 错误可关联部分景点，不强迫丢弃其他成功结果 |

## 4. 状态语义

- `UNKNOWN`：请求成功或已有记录，但来源没有提供足够信息作出结论。
- `UNAVAILABLE`：来源明确表示目标日期或选项不可用。
- `REQUEST_FAILED`：因为超时、认证或其他请求失败，系统没有获得结论；不能显示成“无票”。
- `STALE`：数据曾经成功获取，但已经超过允许的新鲜度。它是来源属性，可以与其他事实状态同时存在。
- `SCHEDULED`：Provider 返回销售日程结构，但不表示此刻仍有实时库存。

`ProviderSearchResult` 可以同时包含成功景点和错误。`isPartialFailure()` 表示仍有可用结果，`isCompleteFailure()` 表示本 Provider 没有返回任何景点结果。后续聚合层必须保留这种区别。

## 5. 测试基础

`ProviderAdapterContract` 是后续每个 adapter 测试都可以继承的基础契约。它首先检查 adapter 的身份、环境和返回结果是否一致。当前使用一个只存在于测试代码中的 stub 验证该测试基础可以运行；stub 不代表真实 Provider，也不会出现在应用运行时。

领域测试已经覆盖：

- 无效日期范围被拒绝。
- Google Place ID 只作为外部引用存在。
- `UNKNOWN` 与 `REQUEST_FAILED` 不混淆。
- freshness 与 availability 状态相互独立。
- partial failure 不会丢弃成功结果。

## 6. 本 Part 未实现

- Viator 或其他 Provider HTTP client。
- Provider 原始 DTO 和字段映射。
- 实时库存、production 价格或购买链接。
- 聚合 service、REST endpoint、数据库表和前端结果页面。
- timeout、retry、circuit breaker 或 Redis 业务缓存。
