# 项目计划

## 当前阶段

Phase 0 之前的工程骨架。目标是建立可运行、可测试的模块化单体后端、React 前端、本地基础设施和 CI，不实现票务业务。

## 后续阶段

1. Phase 0：确认真实 API 权限、字段、配额、缓存和 attribution 限制。
2. 冻结 MVP provider 范围及数据真实性声明。
3. 定义统一 provider adapter 与标准化数据模型。
4. 在真实权限范围内实现首个 provider，并加入 timeout、partial failure 和测试。
5. 再逐步实现预约优先级、提醒、通知和 AI 解释。

每个阶段都以可验证的数据来源和自动化测试为准，不因演示需要伪造实时能力。

Phase 0 的详细执行清单、完成条件和交付物见 [`phase-0-plan.md`](phase-0-plan.md)。
