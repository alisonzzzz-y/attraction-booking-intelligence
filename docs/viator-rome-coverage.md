# Viator Rome Sandbox Coverage Report / Viator Rome Sandbox 覆盖报告

状态：Sandbox 覆盖核对 v0.5
核对日期：2026-08-21
Provider 环境：Viator Affiliate API Basic Access Sandbox

## 1. 文档目的

本文档记录 Rome MVP 景点在 Viator Sandbox 中的初步覆盖情况。它用于验证 Provider 接入可行性和建立候选映射，不是生产票务目录，也不能证明真实价格、实时余票或可预订状态。

本次验证使用 Rome `destinationId = 511`。API key 仅从本地环境变量读取，没有写入仓库、命令输出或本文档。

景点官方票务规则的交叉核对见 [`rome-official-vs-viator-audit.md`](rome-official-vs-viator-audit.md)。该文档用于区分 Provider 覆盖和官方事实。

## 2. 已验证的请求

| 请求 | 验证结果 | 说明 |
| --- | --- | --- |
| `GET /destinations` | HTTP 200 | Rome destination 已确认，`destinationId = 511`，lookup ID 为 `6.57.511` |
| `POST /products/search` | HTTP 200 | 以 Rome 和 EUR 查询时，响应报告 `totalCount = 8192`；这个数字是 Sandbox 搜索结果数，不是门票数 |
| `POST /attractions/search` | HTTP 200 | 分页读取到 195 个 Rome attraction directory 条目；单次 `pagination.count` 最大值实测为 30 |
| `POST /search/freetext` | HTTP 200 | 对 10 个 MVP 景点逐项检索候选产品；结果需要人工判断，不能只按关键词自动映射 |

一次产品搜索响应中的 rate-limit headers 显示 limit 为 289、remaining 为 288。该值只记录本次实测，不能假设为永久账号配额。

## 3. Attraction directory 覆盖

10 个产品景点项对应的 13 个地点组件都能在 Viator Rome attraction directory 中找到。

| 内部景点标识 | Viator attraction | Attraction ID | Sandbox `productCount` |
| --- | --- | ---: | ---: |
| `colosseum-archaeological-park` | Colosseum | 701 | 1680 |
| `colosseum-archaeological-park` | Roman Forum (Foro Romano) | 705 | 918 |
| `colosseum-archaeological-park` | Palatine Hill (Palatino) | 9921 | 591 |
| `vatican-museums-sistine-chapel` | Vatican Museums | 115 | 977 |
| `vatican-museums-sistine-chapel` | Sistine Chapel | 706 | 860 |
| `st-peters-basilica` | St. Peter's Basilica | 708 | 942 |
| `pantheon` | Pantheon | 51 | 1399 |
| `borghese-gallery` | Borghese Gallery (Galleria Borghese) | 38 | 153 |
| `castel-sant-angelo` | Castel Sant'Angelo National Museum | 700 | 216 |
| `capitoline-museums` | Capitoline Hill and Museums | 48 | 56 |
| `baths-of-caracalla` | Baths of Caracalla | 15874 | 108 |
| `domus-aurea` | Domus Aurea | 19668 | 14 |
| `trevi-fountain` | Trevi Fountain | 717 | 1435 |

`productCount` 表示与景点目录项关联的产品数量。它可能包含经过该地点的城市导览、多景点组合和周边体验，不能解释为官方门票数量，也不能用于判断票是否好买。

## 4. 候选产品核对

以下产品只是在 Sandbox free-text 搜索中出现的代表性候选。正式映射前仍需读取产品详情和单产品 schedule，并人工确认产品实际包含的地点、入场权益和跳转方式。

| 内部景点标识 | 代表性候选 | 初步分类 | 当前结论 |
| --- | --- | --- | --- |
| `colosseum-archaeological-park` | `15932P15`, Colosseum, Roman Forum & Palatine Hill Guided Tour | 三地点导览 | 有清晰的组合产品候选 |
| `vatican-museums-sistine-chapel` | `144387P2`, Vatican Museums and Sistine Chapel Tickets | 入场票候选 | 有清晰的组合票候选 |
| `st-peters-basilica` | `55341P19`, Tour of St Peter's Basilica with Dome Climb and Grottoes | 导览与登顶体验 | 不能当作普通大教堂入场票 |
| `pantheon` | `5569822P4`, Pantheon Rome Entry Ticket | 入场票候选 | 有清晰的门票候选 |
| `borghese-gallery` | `403837P1`, Borghese Gallery Entry Ticket with Audio Guide App | 入场票与语音导览 | 有清晰的门票候选 |
| `castel-sant-angelo` | `15932P79`, Castel Sant'Angelo Skip-the-Line Entry Tickets | 入场票候选 | 有清晰的门票候选 |
| `capitoline-museums` | `14982P113`, Musei Capitolini Entrance Ticket | 入场票候选 | 精确查询后找到候选；宽泛查询曾错误返回 Vatican 产品 |
| `baths-of-caracalla` | `247354P40`, Caracalla Baths Entry Ticket with Audio Guide | 入场票与语音导览 | 有清晰的门票候选 |
| `domus-aurea` | `131680P34`, Domus Aurea Skip the Line Ticket Guided Tour | 导览票 | Viator 暂未找到纯门票候选；官方存在限定时段的纯门票，因此这是 Provider 覆盖缺口 |
| `trevi-fountain` | 无内部区域普通票候选 | 步行导览、地下遗址或周边体验 | 官方存在 €2 内部围合区域门票，外围仍免费；Viator 暂未覆盖该基础票 |

## 5. 搜索可靠性结论

- Free-text 搜索适合发现候选，不适合自动建立最终映射。
- `Capitoline Museums tickets` 的宽泛查询曾返回 Vatican 产品，说明名称相似度和排序结果不足以证明景点归属。
- 组合景点必须保留组件级 attraction ID，并单独确认某个产品究竟覆盖哪些组件。
- 产品标题中出现地点名称，不代表一定包含该地点的入场权益。
- Sandbox 返回的产品、价格、评论数和排期只能标记为 Sandbox evidence，不能作为生产页面的实时事实。

## 6. 本轮结论

Viator Basic Access Sandbox 已经能够支持 Rome 目的地查询、景点目录查询和产品候选搜索。Rome MVP 的 10 项景点都有目录覆盖，其中 7 项找到较清晰的入场票或组合票候选。圣彼得大教堂候选属于导览与登顶体验，不是免费的普通入场；尼禄金宫和许愿池均存在官方基础票种，但本轮没有在 Viator Sandbox 中找到等价候选。

这证明了技术接入和初步内容覆盖，但还不足以确认 production 数据能力。

## 7. Pantheon 代表性产品验证

2026-08-19 使用候选产品 `5569822P4` 完成了第二轮窄范围验证：

| 请求 | 结果 | 本次实测 rate limit |
| --- | --- | --- |
| `GET /products/5569822P4` | HTTP 200 | limit 150、remaining 149、reset 10 |
| `GET /availability/schedules/5569822P4` | HTTP 200 | limit 150、remaining 149、reset 10 |

产品详情响应表明：

- 产品状态为 `ACTIVE`，标题为 `Pantheon Rome Entry Ticket`，主目的地为 Rome，时区为 `Europe/Rome`。
- 产品包含普通入场、特殊晚间入场和导览三个 option，不能把产品级标题当作所有 option 的完整描述。
- Sandbox 响应声明 instant confirmation，booking cutoff 以 start time 为基准且为 0 分钟。这是该 Sandbox 产品的预订规则，不代表推荐用户等到最后一刻购买。
- 响应提供移动票信息、年龄段、人数限制、集合与换票说明、取消政策、供应商和 affiliate product URL。
- 返回的 product URL 指向 Viator Sandbox/RC shop，并包含 affiliate 参数，只能用于开发核对，不能当作 production 购买链接。

Schedule 响应表明：

- 币种为 EUR，Sandbox `summary.fromPrice` 为 17.00。
- 三个 option 分别有 season、适用星期、timed entries、年龄段和价格记录。
- 某些 timed entry 包含带 `SOLD_OUT` 原因的 `unavailableDates`。
- Basic Access schedule 是销售日程和定价结构，不是实时库存检查。未出现在 `unavailableDates` 中的日期不能直接解释为仍有余票。
- 本次价格、日期、评论和产品状态都属于 2026-08-19 获取的 Sandbox evidence，不应复制为公开站点的真实票务事实。

## 8. 对 MVP 字段的影响

第一版 Provider 契约可以安全表达：

- Provider、environment、product code、product option code、source timestamp。
- 产品标题、状态、目的地、时区、票种、年龄段、人数限制和确认方式。
- season、星期、开始时间、明确列出的 unavailable date 和 schedule summary price。
- product URL，但必须同时保留 environment，并阻止 Sandbox URL 出现在 production UI。

第一版不能从 Basic Access schedule 推导：

- 某个日期当前仍有多少票。
- 某个时段此刻是否一定可以下单。
- “应该提前几天购买”或“票有多难抢”。
- official ticket、third-party ticket 和 guided tour 的自动分类结论。

Provider 选择已记录在 [`decisions/0003-first-mvp-providers.md`](decisions/0003-first-mvp-providers.md)，展示和禁止推导规则已记录在 [`mvp-data-truth-statement.md`](mvp-data-truth-statement.md)。下一步进入 Provider 无关领域契约设计；production 上线仍依赖 production key 和最终使用规则。

## 9. Colosseum 组合产品验证

2026-08-19 使用授权 Viator Basic Access Sandbox key 再次读取产品 `15932P15`：

- 产品详情与单产品 schedule 均返回 HTTP 200。
- 产品状态为 `ACTIVE`，标题为 `Colosseum, Roman Forum & Palatine Hill Guided Tour`，主目的地为 Rome (`511`)。
- 产品 options 包含 group、small group、private 和 arena guided tour 等不同导览形式。因此该映射的产品类型固定为 `GUIDED_TOUR`，不能显示成官方基础入场票。
- schedule 返回 EUR 和 `fromPrice = 49.00`，但这是 Sandbox 摘要价格，只用于验证字段映射，不能描述为 production 实时报价。
- 三个地点分别保留 Google Place component 映射，在业务层通过 `colosseum-archaeological-park` 组合 ID 与同一个 Viator 产品关联。

官方票务规则与 Sandbox 候选的逐项差异见 [`rome-official-vs-viator-audit.md`](rome-official-vs-viator-audit.md)。

## 10. Vatican Museums 与 Sistine Chapel 组合产品验证

2026-08-20 使用授权 Viator Basic Access Sandbox key 读取产品 `144387P2`：

- 产品详情与单产品 schedule 均返回 HTTP 200。
- 产品状态为 `ACTIVE`，标题为 `Vatican Museums and Sistine Chapel Tickets`，主目的地为 Vatican City (`60477`)。
- 产品只有一个 `Tickets Only` option，因此当前映射类型固定为 `TICKET_PRODUCT`，但这不代表它与官方基础票具有相同价格或服务范围。
- booking cutoff 为开始时间前 2880 分钟，响应声明 instant confirmation。这些是该 Sandbox 产品的结构化规则，不能自动转化为“应该提前多久购买”的建议。
- schedule 返回 EUR 和 `fromPrice = 69.00`。该金额只验证 Sandbox 价格字段可以被 adapter 读取，不能描述为官方价格、production 实时报价或实时库存。
- Vatican Museums 与 Sistine Chapel 分别保留独立 Google Place component，并通过 `vatican-museums-sistine-chapel` 组合 ID 与同一个 Viator 产品关联。

官方票务页说明同日门票包含 Vatican Museums 与 Sistine Chapel，且官方在线购买入口只有 Vatican Museums 官方票务门户。官方规则与第三方 Sandbox 产品仍作为不同来源展示。

## 11. Baths of Caracalla 产品验证

2026-08-21 使用授权 Viator Basic Access Sandbox key 读取产品 `247354P40`：

- 产品详情与单产品 schedule 均返回 HTTP 200。
- 产品状态为 `ACTIVE`，标题为 `Rome Baths of Caracalla Entry Ticket with Audio Guide`，唯一 option 同样明确包含 entry ticket 和 audio guide。
- inclusions 明确列出 Baths of Caracalla 入场票和数字语音导览；exclusions 明确排除现场导游和耳机。因此该映射固定为 `TICKET_WITH_AUDIO_GUIDE`，不能显示成官方基础门票。
- 响应声明 instant confirmation，booking cutoff 为闭馆前 120 分钟，取消政策为不可退款。这些仅是该 Sandbox 产品的结构化规则，不能自动转化为通用购买建议。
- schedule 返回 EUR；成人 Sandbox 摘要价格为 €15。该金额只验证 adapter 能读取价格结构，不能描述为官方价格、production 实时报价或实时库存。

意大利文化部官方页面同期显示普通参观全价 €8、18 至 25 岁优惠票 €2、预约非必需，并说明临时展览可能另收 €5。官方基础票与 Viator 语音导览组合产品必须分别展示，不能直接比价。

## 12. Capitoline Museums 产品验证

2026-08-21 使用授权 Viator Basic Access Sandbox key 读取产品 `14982P113`：

- 产品详情与单产品 schedule 均返回 HTTP 200。
- 产品状态为 `ACTIVE`，标题和唯一 option 都是 `Musei Capitolini Entrance Ticket`；inclusions 仅声明博物馆入场，因此映射为 `TICKET_PRODUCT`。
- 换票说明明确写明 Viator voucher 本身不能入场，正式票会在预订后发送。如果用户选择的时段不可用，博物馆会确认最接近的可用时段。页面不能把用户选择的时间描述为已保证。
- 取消政策为 `ALL_SALES_FINAL`。schedule 返回 EUR，成人 Sandbox 摘要价格为 €30。该金额只验证 adapter 能读取价格结构，不能描述为官方价格、production 实时报价或实时库存。

Capitoline Museums 官方页面同期列出：没有临时展览时成人基础票为 €15，线上预购另收 €1；展览期间价格会变化。居民资格、优惠类别和临时展览都会影响价格，因此系统不保存一个没有核对日期的永久官方价，也不把 €30 Sandbox 产品与官方基础票直接比较。

## 13. 官方参考

- [Viator Partner API technical documentation](https://docs.viator.com/partner-api/technical/)
- [Viator Basic Access Golden Path](https://partnerresources.viator.com/travel-commerce/affiliate/basic-access/golden-path/)
