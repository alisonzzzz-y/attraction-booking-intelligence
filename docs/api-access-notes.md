# Provider API 权限记录

最后核对日期：2026-08-18

## 当前结论

项目已使用公开网站提交 Viator Affiliate 和 Tiqets Affiliate 申请，但尚未获得可测试的正式账号权限，也没有获取或记录 API key。下面的公开资料用于界定申请后的验证范围，不能视为本项目已经取得相应数据使用权限。

- **Viator Basic Access 是最容易开始验证的方案。** 官方说明 Basic Access 默认开放，不要求预审批，并可自行生成 API key。它适合验证产品内容、单产品日程和跳转链接，但不提供实时 availability check。因此，Basic Access 返回的日程和价格不能标记为实时数据。
- **Tiqets Essential API 是当前最符合 MVP 功能目标的候选。** 官方说明它向 affiliate partners 提供 Content、Availability、Pricing 和 Reporting，并允许在 Affiliate Portal 中创建 token。不过，申请人仍要先通过 affiliate qualification process。本项目尚未验证能否获批。
- **GetYourGuide Public Partner API 确实存在。** 它面向 GetYourGuide marketplace，公开规范包含 tour search、availability 和 price breakdown 等端点。但官方要求联系合作伙伴团队创建账号，而且条款说明 API credentials 由 GetYourGuide 自行决定是否提供。因此它暂时作为第二阶段候选。
- **GetYourGuide Supplier API 不适用于本项目。** Supplier API 的方向是让供应商或预订系统向 GetYourGuide 暴露库存和预订能力，不是让本项目读取 GetYourGuide marketplace 数据。

暂定执行顺序：先申请 Viator Basic Access，用于尽快验证 adapter、来源标记和非实时数据边界；同时申请 Tiqets affiliate account，若 Essential API 获批，则优先用它验证实时 availability 和 pricing；GetYourGuide 在前两项之后联系 Partner team。

## 权限矩阵

| Provider | 申请状态 | 已确认的访问方式 | Sandbox / test | 已确认的数据能力 | 缓存与频率 | Attribution / 使用限制 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Viator | 已提交（2026-08-18），等待身份验证 | Basic Access 默认开放，可在完成邮箱验证后从账号生成 Affiliate API key；Full 和 Full + Booking 需要审批及认证 | 官方提供 Sandbox，并要求测试在 Sandbox 完成；实际账号权限尚未验证 | Basic 可读取单产品内容、搜索摘要及单产品 availability schedule；不能访问实时 `/availability/check`；最终交易跳转至 Viator | 单产品 schedule 最多缓存 1 小时；不能用该端点批量摄取；不同端点有独立 rate limit，实际额度通过响应头确认 | 跳转 URL 必须保留 affiliate tracking；归因 cookie 为 30 天；部分 Viator 独有内容不得被搜索引擎索引 | 完成身份验证；进入账号后确认 Basic Access、可用环境和 token scope；API key 不写入仓库或文档 |
| Tiqets | 已提交（2026-08-18），等待资格审核 | 先提交 Affiliate Form，通过 qualification 后进入 Affiliate Portal；Essential API token 可由 portal admin 自行创建 | 官方开发文档提及测试环境，但公开资料未充分确认其申请方式和数据性质，保持待确认 | Essential API 包含 Content、Availability、Pricing、Reporting；Reviews、Recommendations、Images 需另行申请；完整 Booking API 通常要求至少 200 orders/month 并逐案审批 | 默认 15 requests/second；产品信息建议每周刷新；图片至少每 14 天刷新；近期 availability 每日更新多次，并在订单前后重新核对 | 图片 credit 必须保持最新；完整品牌展示、跳转和生产数据存储条款仍需在账号条款中确认 | 等待 qualification 结果；获批后确认 Essential API、test environment、Rome 覆盖、实时字段含义、显示许可和 token scope |
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

下一次更新应在收到身份验证或资格审核结果后进行。未知项目继续保持“待确认”，不能根据营销描述自行推断。
