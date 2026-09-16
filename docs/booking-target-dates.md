# 预约目标日期与开售日期

更新日期：2026-09-16。规划规则版本：`rome-planning-targets-v1`。

## 本次范围变更

用户明确要求给出随行程变化的具体订票目标日期，并接受不精确的估算。因此增加独立的产品规划日期，不把估算包装为官方截止日、历史售罄预测或实时余票。此前历史观察数据的限制继续适用，不新增抓取器、模型预测、价格或库存事实。

Booking targets now provide a concrete date for planning. They are provisional estimates, separate from official release rules and the existing booking-priority labels. They do not predict sell-outs or confirm availability.

中文：预约目标现在提供具体的规划日期。这些日期是暂定估算，与官方开售规则及原有预约优先级分开，不预测售罄时间，也不确认余票。

## 已核对的开售规则

| 景点 | 规则 | 日期计算 | 来源 |
| --- | --- | --- | --- |
| 斗兽场普通官方票 | 官方说明参观前 30 天开售 | 最早可能参观日减 30 个日历日 | [官方票务页](https://colosseo.it/en/visit/orari-e-biglietti/) |
| 万神殿 | 官网说明按月安排参观，前一月中旬放票 | 用前一月 15 日作为近似提醒，明确显示 around | [官方介绍及票务页](https://direzionemuseiroma.cultura.gov.it/pantheon/) |

以上来源在本次排查中核对。万神殿页面直接访问返回 502，但搜索索引返回了上述官方原文；该证据不支持把 15 日或某个小时说成保证的开售时刻。斗兽场的特殊票种、免费日和特别开放安排可能不同，界面提示在官方页面确认。没有核实的开售日期保持未知，不以订票目标反推开售日期。

## 产品估算规则

| 景点 | 订票目标 | 含义与取舍 |
| --- | --- | --- |
| 斗兽场 | 开售当天 | 依据已核实的 30 天开售窗口安排购买动作，仍不保证能买到 |
| 梵蒂冈博物馆及西斯廷礼拜堂 | 最早参观日前 60 天 | 两个月的规划缓冲，刻意较早开始处理；不是已核实的 60 天开售规则 |
| 博尔盖塞美术馆 | 提前 30 天 | 为必需的分时预约预留一个月规划缓冲 |
| 金宫 | 提前 14 天 | 为分时参观预留两周规划缓冲 |
| 万神殿、圣天使堡 | 提前 7 天 | 一周的行程整理缓冲，不声称这两个景点的售罄规律相同 |
| 卡比托利欧博物馆 | 提前 3 天 | 行程确定后处理的较短规划缓冲 |
| 其他需票且无专门配置的景点 | 提前 14 天 | 暂定通用规划缓冲，明确标注估算 |
| 普通入场无需预订或免费、外围免费 | 不设置强制订票日期 | 保留普通参观和可选付费项目的区别 |

这些天数是本次按用户要求设定的可调整产品默认值，不是从官方票务页或历史样本统计得到的事实。没有季节、节假日或热门程度的模型。需要时在 `frontend/src/features/attractions/bookingGuidance.ts` 调整并升级规则版本。

## 日期与状态

- 未到斗兽场开售日：主行动显示预计开售日期，不要求今天购买；详情同时给出开售当天的规划目标。
- 目标已过但尚未参观：把当前可执行目标推进到罗马当天，保留原目标日期说明，提示查询官方日历并在开放后购买，不推断已售罄。
- 万神殿的中旬提醒是近似日期，不将它视为已经确认的实时状态。
- 其他未核实开售规则的景点：显示目标日期，并明确“仅在所选参观日开放后购买”。
- 行程起始日已过：要求更新日期，不给出参观结束之后的订票建议。
- 每个景点尚未选择独立参观日，所以统一使用行程开始日，即最早可能参观日。灵活日期同样使用所选范围的最早日，并在界面说明。
- 日历减法使用无时区偏移的日期计算，今天按 `Europe/Rome` 判定，覆盖跨年、闰年和夏令时。
- 该规则只影响前端规划日期，不改变后端官方优先级、置信度或受约束 AI 的事实输入，也不从 Sandbox 票务数据生成建议。

## 英文界面文案对照

| English | 中文 |
| --- | --- |
| Booking target (estimate) | 订票目标日期（估算） |
| Aim to book by 13 Jun 2027 | 建议争取在 2027 年 6 月 13 日前订好 |
| Official release window | 官方开售窗口 |
| Sales expected from 21 May 2027 | 预计从 2027 年 5 月 21 日开售 |
| Sales expected around 15 May 2027 | 预计在 2027 年 5 月 15 日前后开售 |
| Planning target | 规划目标 |
| Planning estimate | 规划估算 |
| Official guidance | 官方指引 |
| Ordinary visit | 普通参观 |
| Release policy | 开售规则 |
| Ticket required; lead time unverified | 需要门票，提前购买时间尚未核实 |
| Choose new travel dates | 请重新选择旅行日期 |
| Past travel dates | 已过去的旅行日期 |
| Booking targets are estimates based on the first day of your travel window. Official release dates are shown separately. Availability is not confirmed. | 订票目标按旅行时间范围的第一天估算。官方开售日期单独展示，余票尚未确认。 |
| ABI uses a 7-day planning buffer for this attraction. This is a provisional estimate, not a measured demand prediction. | ABI 为这个景点设置了 7 天的规划缓冲。这是暂定估算，不是根据实际需求测量得到的预测。 |
| The official standard ticket window opens 30 days before the visit. Aim to book on the opening date; the exact release time and special admission days must be checked with the operator. | 普通官方票在参观前 30 天开售。建议在开售当天预订，具体放票时刻及特殊参观日的安排需向运营方确认。 |
| The operator says tickets open in the middle of the previous month. The 15th is an approximate reminder, not a confirmed release day. | 运营方说明门票在前一个月中旬开售。15 日只是近似提醒，并非已确认的开售日。 |
| An official release date has not been verified for this ticket. | 尚未核实这种门票的官方开售日期。 |
| The published release window does not confirm current availability. | 已公布的开售窗口不能证明目前仍有余票。 |
| The original target was 13 Sept 2026; check the official calendar now and book if your date is available. This does not mean tickets are sold out. | 原目标是 2026 年 9 月 13 日。现在请查看官方日历，如果参观日期可选就预订。这不代表门票已经售罄。 |
| Based on a first possible visit on 20 Jun 2027. If you choose a later day in your stay, move the target accordingly. Dates use Rome time. | 以最早可能的参观日 2027 年 6 月 20 日计算。如果实际选择行程内更晚的日期，目标日期也相应顺延。日期按罗马时间计算。 |
| This is a planning target, not a sell-out forecast or an official deadline. Book only after your visit date is released; a missing date does not mean sold out. | 这是规划目标，不是售罄预测或官方截止日。请在参观日期开放后购买；日历中没有该日期，不代表已经售罄。 |
| The first possible visit date has passed. Update your travel dates to calculate a new booking target. | 最早可能的参观日期已过，请更新旅行日期以计算新的订票目标。 |

## 验证

自动化测试覆盖远期旅行、开售前一天、开售当天、开售后、原目标已过、参观当天、已过期行程、跨年、闰年、罗马午夜及夏令时、免费普通入场、未核实开售规则，以及卡片和详情随旅行日期变化。
