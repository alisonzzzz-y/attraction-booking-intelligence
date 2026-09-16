# 项目约束

- 所有事实性票务数据必须来自明确且可追踪的数据源。
- 不得将 sandbox、fixture 或演示数据描述为真实实时数据。
- 不得在仓库中提交 API key、密码或 token。
- 优先保持 modular monolith，不主动拆分微服务。
- 后端采用四层分层结构：controller、service、repository、entity。Controller 负责 HTTP 输入输出，Service 负责业务规则与事务，Repository 负责持久化访问，Entity 负责持久化映射。按业务命名类，规模扩大后可在每层内按业务建立子包。
- provider、外部 API client、配置与 DTO 可保留独立辅助包，不为凑四层而混入 entity 或 repository；Controller 不直接访问 Repository，业务规则不放在 Controller。
- AI 只能解释结构化事实，不能生成价格、余票、预约规则或优先级事实。
- 所有新 provider 必须通过统一 adapter 接口接入。
- 单个 provider 失败不能导致整个聚合请求无结果。
- 关键业务规则必须有自动化测试。
- README 中的完成状态必须与实际功能一致。
- 英文说明使用自然、清楚的研究生写作风格，并同时提供自然的中文对照。
