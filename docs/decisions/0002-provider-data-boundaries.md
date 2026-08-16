# ADR 0002：隔离 provider 原始数据

状态：已接受

## 决策

每个 provider 的认证、client 和原始 DTO 必须留在对应 adapter 的内部实现中。其他模块只能使用标准化模型和来源元数据。

## 原因

不同 provider 的字段、条款、可用性状态和缓存限制不同。隔离原始数据可以避免供应商细节扩散，也能让单个 provider 失败时保留其他来源的结果。

## 影响

接入 provider 前先定义统一 adapter 契约和 partial failure 表达方式。不得用 fixture 冒充真实响应，也不得由 AI 填补缺失的票务事实。
