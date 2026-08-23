# Rome Official Ticket Audit / 罗马官方票务核对

状态：官方来源与 Viator Sandbox 候选核对 v0.4
核对日期：2026-08-21
范围：Rome MVP 首批 10 项景点

## 1. 核对目的

本文档比较景点运营方或政府机构发布的官方信息，与 Viator Basic Access Sandbox 中找到的代表性产品候选。官方来源用于确认基础入场、预约要求和官方票种；Viator Sandbox 只用于验证第三方产品覆盖与技术接入，不能证明 production 价格、实时余票或当前可预订状态。

“Viator 没有找到普通票”不等于“景点没有官方普通票”。同样，“Viator 找到了产品”也不等于该产品与官方基础门票具有相同的包含内容、价格和入场方式。

## 2. 核对结果

| 景点 | 官方信息快照 | Viator Sandbox 候选 | 判断 |
| --- | --- | --- | --- |
| Colosseum, Roman Forum and Palatine / 罗马斗兽场、古罗马广场和帕拉蒂尼山 | [官方票务页](https://colosseo.it/en/tickets/colosseum-roman-forum-palatine/)提供三地点组合基础票，成人全价 €18。斗兽场必须按预订时段进入，古罗马广场和帕拉蒂尼山可在该时段前后 24 小时内进入一次。 | `15932P15` 是三地点导览产品。 | 地点范围基本一致，但 Viator 候选是导览，不是官方基础票。UI 必须分别标记 `official admission` 和 `guided tour`。 |
| Vatican Museums and Sistine Chapel / 梵蒂冈博物馆和西斯廷教堂 | [梵蒂冈博物馆官方页](https://www.museivaticani.va/content/museivaticani/en/organizza-visita/tariffe-e-biglietti.html)说明同日门票包含博物馆与西斯廷教堂。成人基础票为 €20，官方在线预约另收 €5；官方还警告只有其票务门户是官方在线购票站。 | `144387P2` 的详情与 schedule 已验证，产品只有一个 `Tickets Only` option；Sandbox `fromPrice` 为 €69。 | 产品范围与官方组合方式相符，但第三方 Sandbox 价格和服务不能当成官方价格或实时事实。正式购买入口仍应区分官方票务门户与未来获准使用的第三方 production 链接。 |
| St. Peter's Basilica / 圣彼得大教堂 | [圣彼得大教堂官方 FAQ](https://www.basilicasanpietro.va/en/faq/is-it-possible-to-book-entrance-to-st-peter-s-basilica)明确说明普通入场免费。付费在线预约只是保证特定时段，并包含数字语音导览。 | `55341P19` 包含导览、穹顶和墓窟。 | 存在明显的产品范围差异。该 Viator 产品不能显示为普通入场票，也不能让用户误以为进入大教堂必须付费。 |
| Pantheon / 万神殿 | [罗马国家博物馆管理局官方页](https://direzionemuseiroma.cultura.gov.it/en/pantheon/)公布官方门票和预约规则，并明确写明不存在 skip-the-line entry。 | `5569822P4` 是入场票候选，Sandbox `fromPrice` 为 €17，并含多个 option。 | Viator 候选不是官方基础票的直接等价物。任何“免排队”文案都会与官方规则冲突；Sandbox 价格也不能作为公开实时价格。 |
| Borghese Gallery / 博尔盖塞美术馆 | [官方票务页](https://galleriaborghese.beniculturali.it/en/visita/info-biglietti/)要求预约时段，基础票与预约费分开计算，并采用两小时参观时段。 | `403837P1` 是入场票加语音导览 App。 | 预约要求一致，但 Viator 候选是打包产品，不应与官方基础票直接比价。 |
| Castel Sant'Angelo / 圣天使堡 | [官方页面](https://direzionemuseiroma.cultura.gov.it/en/museo-nazionale-di-castel-santangelo/)公布命名票、证件核验和官方购票规则。2026 年 7 月 1 日起成人全价为 €18。 | `15932P79` 使用 “Skip-the-Line Entry Tickets” 标题。 | 需要进一步读取 production 产品详情验证具体权益。不能仅凭 Sandbox 标题承诺独立快速通道。 |
| Capitoline Museums / 卡比托利欧博物馆 | [官方票务页](https://www.museicapitolini.org/en/biglietti-e-prenotazioni/tickets-and-videoguides)显示无展览时成人基础票 €15，线上预购另收 €1；展览和访客资格会改变价格。个人访客可同日现场购票，官网建议提前网购，但没有把个人预约写成绝对强制。 | `14982P113` 的详情与 schedule 已验证，唯一 option 为博物馆入场；成人 Sandbox 摘要价为 €30。若用户所选时段不可用，供应商说明会确认最近的可用时段。 | 可作为 `TICKET_PRODUCT` 测试证据，但 €30 不是官方价，所选时段也不能描述为保证入场时段。官方基础价、展览价和第三方 Sandbox 产品必须分开。 |
| Baths of Caracalla / 卡拉卡拉浴场 | [意大利文化部官方页](https://cultura.gov.it/luogo/terme-di-caracalla)说明普通参观全价 €8、18 至 25 岁优惠票 €2、预约非必需；临时展览可能另收 €5。 | `247354P40` 的详情与 schedule 已验证，唯一 option 包含入场票和数字语音导览；成人 Sandbox 摘要价为 €15。 | Viator 候选是不可退款的语音导览组合产品。官方信息不支持把它标成“必须提前预约”，也不支持用 €15 组合价代替官方 €8 基础票。 |
| Domus Aurea / 尼禄金宫 | [斗兽场考古公园官方页](https://colosseo.it/en/tickets/domus-aurea/)同时提供教育导览加 VR，以及限定时段的 “only ticket, no educational tour and no VR”。后者成人全价 €18。 | `131680P34` 是 skip-the-line guided tour。 | 之前“没有明显普通独立门票”的结论需要纠正。Viator 目前只找到导览候选，但官方确实存在限定时段的纯门票。 |
| Trevi Fountain / 特莱维喷泉（许愿池） | [罗马市政府公告](https://www.comune.roma.it/web/it/notizia/biglietto-dingresso-fontana-di-trevi.page)说明自 2026 年 2 月 2 日起，游客和非居民进入喷泉内部围合区域需购买 €2 门票；外围观看仍免费，开放结束后也可从外围观看。 | 没有找到与 €2 内部区域门票等价的普通票候选，结果主要是导览、地下遗址或周边体验。 | 之前“许愿池本体无需普通门票”的表述不准确。正确模型是“外围免费，内部区域收费”；Viator 的缺失属于 Provider 覆盖缺口。 |

## 3. 发现的主要差异

### 3.1 需要直接修正的事实

1. Trevi Fountain 不是简单的“免费景点”。外围仍免费，但内部围合区域从 2026 年 2 月 2 日起对游客和非居民收费 €2。
2. Domus Aurea 官方存在限定时段的纯门票。Viator Sandbox 暂时只找到导览候选，不能据此推断官方没有纯门票。
3. St. Peter's Basilica 普通入场免费。第三方导览、穹顶或付费预约必须与普通入场分开。
4. Pantheon 官方明确说明没有 skip-the-line entry。Provider 标题或营销文案不得覆盖这条官方限制。

### 3.2 不构成直接冲突，但需要规范展示

- Colosseum、Borghese Gallery 和 Baths of Caracalla 的 Viator 候选包含导览或语音导览，不能与官方基础票直接比价。
- Vatican Museums 的组合范围一致，但官方入口、官方价格和第三方产品必须清楚区分。
- Castel Sant'Angelo 的 “skip-the-line” 权益需要读取具体产品条款并在 production 环境再次验证。
- Capitoline Museums 的票价可能随展览和访客资格变化，不能保存为没有时间戳的永久事实。

## 4. 对 MVP 数据模型的影响

第一版至少需要区分：

- `sourceType`: `OFFICIAL_OPERATOR` 或 `AFFILIATE_PROVIDER`。
- `ticketType`: 基础入场、预约入场、导览、语音导览组合、免费入场、内部区域入场。
- `priceCheckedAt`: 官方价格核对日期，避免将静态快照描述为实时价格。
- `officialSourceUrl`: 支撑门票、预约或关闭信息的官方页面。
- `providerEnvironment`: `SANDBOX` 或 `PRODUCTION`，阻止 Sandbox 信息进入 production UI。
- `requiresReservation` 与 `reservationRecommended`: 分开表达“必须预约”和“建议预约”。

产品归一化时不能只按景点名称匹配。比较价格前必须确认包含地点、导览、语音导览、快速通道、预约费和其他附加权益是否相同。

## 5. 使用边界

- 本文档中的价格是 2026-08-19 至 2026-08-21 的官方页面核对快照，不是运行时实时价格。
- 临时关闭、施工和特殊开放时间仍需在用户查询或购买前重新检查官方通知。
- Viator 证据来自 Basic Access Sandbox，只能证明开发环境中的候选覆盖。
- 本轮没有声称 Viator production key、实时库存或真实 production 可预订状态已经可用。
