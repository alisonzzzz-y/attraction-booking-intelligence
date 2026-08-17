# 项目计划

## 当前阶段

工程骨架和公开产品预览页面已经完成。首页、Methodology 页面、响应式布局、基础元数据、组件测试和浏览器测试均已通过。静态前端已部署到 <https://attraction-booking-intelligence.vercel.app/>。项目当前仍处于 Phase 0 数据可行性验证阶段，下一步使用公开 URL 提交 Provider 申请，但仍不实现未经授权的票务查询功能。

## 后续阶段

1. 完成公开网站的信息结构、视觉基础、数据边界说明和发布检查。
2. 部署前端并获得稳定的公开 URL。
3. 提交 Provider 申请，确认真实 API 权限、字段、配额、缓存和 attribution 限制。
4. 冻结 MVP Provider 范围及数据真实性声明。
5. 定义统一 Provider adapter 与标准化数据模型。
6. 在真实权限范围内实现首个 Provider，并加入 timeout、partial failure 和测试。
7. 再逐步实现预约优先级、提醒、通知和 AI 解释。

每个阶段都以可验证的数据来源和自动化测试为准，不因演示需要伪造实时能力。

详细的逐 Part coding 顺序和验收条件见 [`coding-roadmap.md`](coding-roadmap.md)。Phase 0 的完成条件和交付物见 [`phase-0-plan.md`](phase-0-plan.md)。
