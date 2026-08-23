# ADR 0003：选择第一版 MVP 的数据来源

状态：已接受
日期：2026-08-19

## 背景

Rome MVP 需要两类外部事实：景点地点信息，以及经过授权的票务产品信息。Google Maps Platform 和 Viator Basic Access Sandbox 已完成实际连接验证。Tiqets 尚未通过 affiliate qualification，GetYourGuide 尚未申请。

Viator Sandbox 已成功返回 Rome 目的地、景点目录、产品搜索、单产品详情和单产品 schedule。Pantheon 代表性产品验证同时证明，Basic Access schedule 表达销售日程、时间段、价格结构和明确列出的 unavailable dates，但不提供实时库存检查。

## 决策

1. Google Places API (New) 作为 Rome MVP 的地点信息来源，用于 Place ID、地址、坐标、评分、开放信息和 Google Maps URI。Google 数据不作为票务事实来源。
2. Viator Affiliate API Basic Access 作为首个票务 Provider adapter。开发和自动化验证先使用 Sandbox。
3. 在获得 production key 并重新核对 production 使用规则前，公开页面不得把 Viator Sandbox 产品、价格、schedule 或链接描述为真实 production 数据。
4. Tiqets 保留为第二候选 Provider，只有在 qualification 通过并实际验证 token 后才进入设计范围。
5. GetYourGuide 暂不接入。只有当 Viator 无法支持后续目标，或项目需要经过授权的第二来源时再申请 Public Partner API。
6. 第一条纵向切片只实现一个票务 Provider，不做跨 Provider 价格比较。
7. Viator、Google 和未来 Provider 都必须通过独立 adapter 接入，原始 DTO 不进入领域模型。

## 第一版允许使用的 Viator 字段

在 Sandbox 开发环境中，可以建模和测试以下明确返回的事实：

- Provider、environment、product code、product option code 和抓取时间。
- 产品标题、状态、目的地、时区、产品选项和票种。
- 年龄段、人数限制、确认方式、集合与换票说明和取消政策。
- schedule 中的 season、星期、开始时间、价格结构和明确列出的 unavailable date。
- 对应环境返回的 affiliate product URL。

所有字段都必须保留来源和环境。Sandbox URL 必须被 production 防护拦截。

## 第一版不能声称的能力

- 实时余票数量。
- 某个日期或时段此刻一定可以购买。
- 根据单次 schedule 推导出的抢票难度。
- 没有历史观察或官方规则支持的“建议提前几天购买”。
- Sandbox 价格、评论、产品状态或链接属于真实 production 数据。
- 搜索标题自动证明某个产品包含特定景点的入场权益。

## 影响

- Part 8 可以开始定义 Provider 无关领域契约，并以 Viator Sandbox contract fixture 做自动化测试。
- 第一条公开演示必须显著显示 `Sandbox` 或使用完全受控的 fixture，不得展示成 live marketplace。
- 预约紧迫度在缺少合格证据时返回 `Unknown`。AI 不能把缺失数据补成建议。
- production 上线前需要单独完成 production key、跳转链接、缓存、attribution 和展示规则的最终验证。
- Tiqets 或其他 Provider 的等待状态不再阻塞首个 adapter 的开发，但也不能被描述为已接入。

## 证据

- [`../api-access-notes.md`](../api-access-notes.md)
- [`../rome-attraction-catalogue.md`](../rome-attraction-catalogue.md)
- [`../viator-rome-coverage.md`](../viator-rome-coverage.md)
- [Viator Partner API technical documentation](https://docs.viator.com/partner-api/technical/)
