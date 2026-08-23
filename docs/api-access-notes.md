# Provider API 权限记录

最后核对日期：2026-08-19

## 当前结论

项目已完成 Viator Affiliate 注册并获得 Basic Access Sandbox key。2026-08-19 的重新验证已成功返回 `/destinations`、Rome 产品搜索、景点目录和 free-text 产品候选。Rome 的 `destinationId = 511`，详细覆盖结果见 [`viator-rome-coverage.md`](viator-rome-coverage.md)。这只证明 Sandbox Basic Access 可用，不代表已经取得 production 数据权限。Tiqets 在 2026-08-19 回复称申请资料不完整或不正确，尚未进入可确认的 API 授权阶段；申请人已邮件询问需要修改的具体字段。仓库和文档没有记录任何 API key。

2026-08-22 再次核对 Viator 官方技术文档后确认：Basic Access 可以读取单产品 `/availability/schedules/{product-code}`，但不能调用实时 `/availability/check`。官方文档说明排期数据可能快速过期，而且单产品接口用于用户选择产品时按需读取，不应当作为批量采集接口。当前项目因此不会用 Sandbox 排期建立历史需求模型。详细设计和实施条件见 [`decisions/0004-historical-availability-observations.md`](decisions/0004-historical-availability-observations.md)。

- **Viator Basic Access 是最容易开始验证的方案。** 官方说明 Basic Access 默认开放，不要求预审批，并可自行生成 API key。它适合验证产品内容、单产品日程和跳转链接，但不提供实时 availability check。因此，Basic Access 返回的日程和价格不能标记为实时数据。
- **Tiqets Essential API 是当前最符合 MVP 功能目标的候选。** 官方说明它向 affiliate partners 提供 Content、Availability、Pricing 和 Reporting，并允许在 Affiliate Portal 中创建 token。不过，申请人仍要先通过 affiliate qualification process。本项目尚未验证能否获批。
- **GetYourGuide Public Partner API 确实存在。** 它面向 GetYourGuide marketplace，公开规范包含 tour search、availability 和 price breakdown 等端点。但官方要求联系合作伙伴团队创建账号，而且条款说明 API credentials 由 GetYourGuide 自行决定是否提供。因此它暂时作为第二阶段候选。
- **GetYourGuide Supplier API 不适用于本项目。** Supplier API 的方向是让供应商或预订系统向 GetYourGuide 暴露库存和预订能力，不是让本项目读取 GetYourGuide marketplace 数据。

暂定执行顺序：先申请 Viator Basic Access，用于尽快验证 adapter、来源标记和非实时数据边界；同时申请 Tiqets affiliate account，若 Essential API 获批，则优先用它验证实时 availability 和 pricing；GetYourGuide 在前两项之后联系 Partner team。

## 权限矩阵

| Provider | 申请状态 | 已确认的访问方式 | Sandbox / test | 已确认的数据能力 | 缓存与频率 | Attribution / 使用限制 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Viator | Basic Access Sandbox key 已签发并验证可用（2026-08-19）；尚无 production key | Basic Access 默认开放；Full 和 Full + Booking 需要审批及认证 | 目的地、产品搜索、景点目录、free-text、单产品详情和单产品 schedule 均已返回 HTTP 200；Rome `destinationId = 511` | Basic 可读取产品内容、搜索摘要及单产品 schedule；不能访问实时 `/availability/check`；最终交易跳转至 Viator | 单产品 schedule 最多缓存 1 小时；不能用该端点批量摄取；本次详情和 schedule 响应显示 limit 150、remaining 149、reset 10，不能假设为永久额度 | Sandbox URL 只用于测试；production 跳转必须使用对应环境 URL 并保留 affiliate tracking；归因 cookie 为 30 天；部分独有内容不得被搜索引擎索引 | 作为首个开发 Provider 进入领域契约设计；production 展示保持阻塞；决策见 ADR 0003 |
| Tiqets | Affiliate 申请资料未通过完整性检查（回复日期：2026-08-19）；已邮件询问具体缺失项 | 先提交 Affiliate Form，通过 qualification 后进入 Affiliate Portal；Essential API token 可由 portal admin 自行创建 | 尚未获得测试环境或 token；官方开发文档中的能力不能视为本项目已获授权 | Essential API 的公开说明包含 Content、Availability、Pricing 和 Reporting，但本项目尚未获得这些能力 | 公开说明的默认限制和缓存指导仅作申请前参考，获批后仍需按账号条款复核 | 尚未取得可执行的展示、图片或跳转授权；不能把 Tiqets 作为当前可用 Provider | 等待 partnerships team 说明需要修改的字段；资料更正后再决定是否重新申请 |
| GetYourGuide | 未申请 | Public Partner API 通过 token 访问；需联系 GetYourGuide 创建 partner account；是否发放 API credentials 由 GetYourGuide 决定 | 未在本轮官方公开资料中确认 | 公开规范包含 tour search、tour details、availability、options、reviews 和 price breakdown；实际获批 scope 待确认 | 公开资料未确认适用于本项目的 rate limit、刷新频率和缓存期限 | 禁止抓取网站；API 和平台内容只能在合作授权范围内使用；价格比较必须准确且不得误导；API 另有单独条款 | 通过 Partner Portal 联系团队，明确询问 Public Partner API 的资格、测试环境、scope、缓存、attribution 和价格比较规则 |

## 实施边界

在真实账号和书面条款核对完成前，代码和 README 必须遵守以下边界：

1. 不把公开文档描述的能力写成“本项目已经可用”。
2. 不把 Viator Basic schedule 描述为实时 availability 或实时 price。
3. 不抓取 Provider 网站来绕过 API 权限。
4. Sandbox、fixture 和演示响应必须明确标注，不能与生产数据混合。
5. 每条展示数据必须保留 Provider、产品标识、抓取时间、数据类型和 freshness 状态。
6. 在确认缓存和展示条款前，不建立长期 Provider 内容库。
7. 第一版只做查询和跳转，不接收付款，也不调用 booking endpoints。

## 申请后必须验证的项目

取得每个账号后，应把以下结果补回本文件：

- 账号等级、批准日期和允许的环境。
- API base URL、认证方式和 token scope，但不得记录 token 本身。
- Rome 目标景点的实际覆盖情况。
- availability 和 price 的准确含义、更新时间及是否允许缓存。
- rate limit、超限响应和允许的重试方式。
- attribution、logo、deep link、图片 credit 和内容索引要求。
- 是否允许在同一页面做跨 Provider 价格比较。
- 数据删除、账号终止和条款更新后的处理方式。

## 官方来源

### Viator

- [Partner API technical documentation](https://docs.viator.com/partner-api/technical/)
- [Levels of access](https://partnerresources.viator.com/travel-commerce/levels-of-access/)
- [Basic Access Golden Path](https://partnerresources.viator.com/travel-commerce/affiliate/basic-access/golden-path/)
- [Technical guide](https://partnerresources.viator.com/travel-commerce/technical-guide/)
- [Pricing and availability](https://partnerresources.viator.com/travel-commerce/pricing/)
- [Affiliate attribution](https://partnerresources.viator.com/blog/attribution/)
- [Certification requirements](https://partnerresources.viator.com/travel-commerce/certification/)

### Tiqets

- [API solutions for affiliates](https://partners.tiqets.com/en_us/do-you-offer-api-solutions-H1pJDp3zi)
- [API token for affiliates](https://partners.tiqets.com/en_us/api-token-for-affiliates-S1KmXnaWx)
- [Affiliate account setup](https://partners.tiqets.com/en_us/how-do-i-set-up-my-affiliate-account-rJZnUphzi)
- [Distributor API documentation](https://developers.tiqets.dev/)
- [Caching guidance](https://developers.tiqets.dev/basics/caching)
- [Rate limits](https://developers.tiqets.dev/basics/rate-limits)
- [Booking API qualification](https://partners.tiqets.com/en_us/how-do-i-become-a-tiqets-distributor-api-partner-with-booking-api-access-HykGNahGj)

### GetYourGuide

- [Public Partner API landing page](https://api.getyourguide.com/)
- [Public Partner API reference](https://code.getyourguide.com/partner-api-spec/)
- [Official Partner API specification repository](https://github.com/getyourguide/partner-api-spec)
- [Partner terms and conditions](https://www.getyourguide.com/c/partner-terms-and-conditions/)
- [Supplier API overview](https://integrator.getyourguide.com/documentation/overview)

Provider 决策见 [`decisions/0003-first-mvp-providers.md`](decisions/0003-first-mvp-providers.md)，数据展示与禁止推导规则见 [`mvp-data-truth-statement.md`](mvp-data-truth-statement.md)。下一次更新应在 production 权限变化、Tiqets 回复具体修改要求或实际字段验证结果变化后进行。未知项目继续保持“待确认”，不能根据营销描述自行推断。
