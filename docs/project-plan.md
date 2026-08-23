# 项目计划

## 当前阶段

工程骨架、公开产品预览、Provider 无关领域契约、首个 Viator Sandbox adapter，以及 Rome Booking Priority MVP 已经完成。历史余票观察模型和实施闸门也已经完成设计，但当前没有实现采集器或历史业务表。静态前端已部署到 <https://attraction-booking-intelligence.vercel.app/>，但当前 Booking Priority 改动只在本地。用户可以输入最长 14 天的 Rome 停留日期，并在结果页查看 10 个景点的定性预约顺序。每张卡片分别展示官方预约依据、Google Places 地点事实和 Viator Sandbox 第三方票务证据。当前优先级不声称精确提前天数，也不把 Sandbox 排期描述为 production 实时余票。线上页面需要推送并重新部署后才会更新；后端也尚未部署。

MVP 的用户需求、页面范围、状态模型和端到端流程整理在 [`product-requirements.md`](product-requirements.md)。第一版计划使用 Google Maps Platform 实现 Rome 景点地图、位置、评分和开放信息，并继续使用票务 Provider 提供经过授权的排期和跳转。该文档当前是讨论稿，Provider 相关字段和业务规则只有在正式权限验证后才会冻结。

## 后续阶段

1. 完成公开网站的信息结构、视觉基础、数据边界说明和发布检查。
2. 部署前端并获得稳定的公开 URL。
3. 提交票务 Provider 申请，并验证 Google Maps Platform，确认真实 API 权限、字段、配额、缓存和 attribution 限制。
4. 冻结 MVP Provider 范围及数据真实性声明。已完成，见 [`decisions/0003-first-mvp-providers.md`](decisions/0003-first-mvp-providers.md) 和 [`mvp-data-truth-statement.md`](mvp-data-truth-statement.md)。
5. 定义统一 Provider adapter 与标准化数据模型。
6. 在真实权限范围内实现首个 Provider，并加入 timeout、partial failure 和测试。
7. 再逐步实现 Routes 行程规划、保存、提醒、通知和 AI 解释。

每个阶段都以可验证的数据来源和自动化测试为准，不因演示需要伪造实时能力。

详细的逐 Part coding 顺序和验收条件见 [`coding-roadmap.md`](coding-roadmap.md)。Phase 0 的完成条件和交付物见 [`phase-0-plan.md`](phase-0-plan.md)。
