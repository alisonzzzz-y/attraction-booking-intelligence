# MVP Data Truth Statement / MVP 数据真实性声明

状态：已批准用于第一版开发范围
日期：2026-08-19

## 1. 声明目的

本声明规定第一版 Rome MVP 可以展示哪些事实、必须附带哪些来源信息，以及哪些结论不得生成。它适用于后端响应、前端页面、演示、README、作品集说明和测试 fixture。

本声明批准的是开发范围，不等于批准 production 上线。任何 production 票务展示仍然需要 production key 和对应环境使用规则的最终验证。

## 2. 当前数据来源

| 来源 | 当前状态 | 可以支持 | 不能支持 |
| --- | --- | --- | --- |
| 内部 Rome catalogue | 人工核对的内部清单 | 内部景点 ID、英文名、中文名、组件关系 | 价格、余票、评分、开放状态和预约规则 |
| Google Places API (New) | 开发环境已验证 | Place ID、位置、地址，以及请求时明确选择的 Places 字段 | 票务价格、余票、购买规则、抢票难度和现场实时人流 |
| Viator Basic Access Sandbox | key 和 Rome 查询已验证 | Sandbox 产品内容、产品选项、schedule 结构、价格结构、明确 unavailable date 和 Sandbox affiliate URL | production 数据、实时库存数量和可靠的预约紧迫度 |
| Tiqets | 尚未取得权限 | 无 | 不能在当前产品中展示或声称任何 Tiqets 数据能力 |
| 景点官方网站 | 尚未建立统一接入 | 未来可用于人工核对或经过授权的公告来源 | 当前不能声称已经自动更新临时闭馆或施工通知 |
| AI | 只允许解释结构化事实 | 在明确输入事实范围内生成自然语言解释 | 生成价格、余票、开放状态、预约规则、产品映射或购买优先级 |

## 3. 每条外部事实必须携带的元数据

- `sourceProvider`
- `sourceEnvironment`
- `sourceRecordId`
- `fetchedAt`
- `freshnessStatus`
- `factStatus`

涉及价格时还必须携带币种、价格语义和适用的 product option。涉及日期时还必须携带 Provider 时区。

## 4. 标准事实状态

| 状态 | 含义 | UI 行为 |
| --- | --- | --- |
| `CONFIRMED_PRESENT` | Provider 明确返回该事实 | 显示事实、来源、环境和获取时间 |
| `CONFIRMED_UNAVAILABLE` | Provider 对指定条件明确返回不可用 | 显示不可用及其来源，不扩大到其他日期或时段 |
| `NOT_PROVIDED` | 当前权限或响应没有该字段 | 显示“当前来源未提供” |
| `REQUEST_FAILED` | 请求超时、限流或 Provider 错误 | 显示暂时无法确认，并允许安全重试 |
| `STALE` | 数据超过允许的新鲜度范围 | 显示过期提示，不作为当前结论 |
| `SANDBOX_ONLY` | 事实来自 Sandbox 或测试环境 | 仅用于开发或明确标注的演示，不作为 production 事实 |

空响应、没有匹配结果和请求失败都不能转换成 `CONFIRMED_UNAVAILABLE`。

## 5. 价格与 schedule 规则

- Sandbox price 必须标记 `SANDBOX_ONLY`，不能使用“当前价格”“真实起价”或类似措辞。
- `summary.fromPrice` 是 Provider 返回的起价摘要，不保证适用于所有日期、年龄段或 option。
- Schedule 表示销售季节、适用星期、可能的开始时间和价格结构，不等于实时库存。
- Provider 明确列出的 unavailable date 可以作为该响应中的不可用事实，但不得推导其他日期一定可用。
- 未取得实时 availability check 权限时，不显示“仅剩几张”“现在有票”或“即将售罄”。

## 6. 预约紧迫度规则

第一版允许返回以下四个值：`BOOK_NOW`、`BOOK_SOON`、`CAN_WAIT` 和 `UNKNOWN`。当前默认值为 `UNKNOWN`。

只有满足以下条件后，前三个值才可以启用：

1. 存在经过授权、含义清楚且可重复获取的证据。
2. 计算规则是确定性的，并记录规则版本。
3. 规则有自动化测试，包括缺失、过期和冲突数据。
4. 输出同时返回证据列表、计算时间和置信度。

单次 schedule、评分数量、搜索排名、季节或 AI 判断都不能单独产生购买紧迫度。

## 7. 环境与链接保护

- 前端不得直接持有 Viator 或其他需要保密的 Provider key。
- Sandbox product URL 只能在本地开发或明确标注的 Sandbox 演示中使用。
- Production UI 只能接收 production adapter 返回的 production URL。
- API 响应必须显式包含 environment，前端不能根据 URL 字符串猜测环境。
- 如果 environment 与部署环境不匹配，后端必须拒绝返回购买链接。

## 8. 失败与 partial failure

- Google Maps 失败时，票务列表仍可显示，但地点增强信息标记为不可用。
- Viator 失败时，景点目录和 Google 地点信息仍可显示，但票务区域标记为暂时无法确认。
- 一个 Provider 失败不能把其他来源的事实清空。
- 错误日志不得记录 API key、完整认证 header 或用户敏感信息。

## 9. Production 上线条件

公开页面展示 production 票务事实前，必须完成：

- 获得并验证 production key。
- 重新验证 production endpoint、rate limit 和响应字段。
- 确认缓存、attribution、图片、索引和 affiliate link 规则。
- 确认 Sandbox 与 production 数据不会混合。
- 对来源、环境、freshness、错误和 partial failure 添加自动化测试。
- 更新 README 和公开 Methodology 页面，使完成状态与实际功能一致。

## 10. Public wording / 公开说明文案

English:

> Ticket information is shown with its source, environment, and retrieval time. Sandbox data is used only for development and is never presented as live availability. When a source does not provide enough evidence, the application shows "Unknown" instead of guessing.

中文：

> 票务信息会同时显示来源、环境和获取时间。Sandbox 数据只用于开发，绝不会被描述为实时余票。当数据来源没有提供足够证据时，应用会显示“无法确认”，而不是进行猜测。

## 11. 变更规则

新增 Provider、production 权限、实时 availability 或预约紧迫度规则时，必须先更新本声明及对应 ADR，再修改公开产品文案。任何为了演示效果而降低真实性标准的改动都不能被接受。
