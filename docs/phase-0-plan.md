# Phase 0：数据可行性验证计划

## 1. 阶段目标

Phase 0 的目标是确认项目能够合法、稳定地获得哪些真实票务数据，并据此冻结第一版 MVP 的 provider 范围、数据字段和真实性声明。

本阶段不开发完整票务业务，不使用虚假实时数据，也不根据未经确认的 provider 能力设计功能。

## 2. 完成条件

Phase 0 只有在以下条件全部满足后才算完成：

- [x] 当前项目已经初始化 Git，并保存工程骨架基线提交。
- [x] 项目已经推送到 GitHub 私有仓库。
- [x] Docker 本地环境可以启动 PostgreSQL 和 Redis。
- [x] 后端 Testcontainers 集成测试已经实际运行并通过。
- [x] GitHub Actions CI 已经运行并通过。
- [x] 至少一个 provider 的接入资格和数据能力已经通过正式资料或账号权限确认。目前仅确认 Viator Basic Access 的公开资格和能力边界，尚未完成账号验证。
- [ ] 已记录 provider 的字段、配额、缓存、归因和购买跳转限制。
- [ ] 已确定 MVP 使用的 provider 范围。
- [ ] 已确定 MVP 可以展示和不能展示的数据。
- [ ] 已批准 MVP 数据真实性声明。

如果没有 provider 能提供所需的核心数据，应在本阶段调整产品范围，而不是用 fixture、sandbox 或 AI 生成内容填补缺口。

## 3. 工作流

### 3.1 基础设施收尾

- [x] 在项目根目录初始化 Git。详细步骤见 [`git-setup.md`](git-setup.md)。
- [x] 检查待提交文件，确认没有 `.env`、API key、密码或 token。
- [x] 创建项目骨架基线提交。
- [x] 创建 GitHub 私有仓库并推送代码。
- [x] 安装并启动 Docker Desktop。详细步骤见 [`docker-setup.md`](docker-setup.md)。
- [x] 使用 Docker Compose 启动 PostgreSQL 和 Redis。
- [x] 运行后端完整验证，确认数据库、Flyway、Redis 和 Actuator 测试通过。
- [x] 确认前端 lint、格式、单元测试、构建和 Playwright smoke test 通过。
- [x] 确认 GitHub Actions CI 通过。

基础设施收尾完成后，不应立即扩展业务。下一步仍然是验证真实 provider 权限。

### 3.2 Provider 调查

优先调查以下候选来源：

1. Viator
2. Tiqets
3. GetYourGuide
4. 必要时补充景点官方网站或其他经过授权的来源

每个结论必须来自可追踪的正式资料、provider 回复或实际账号权限。调查结果统一更新到 `docs/api-access-notes.md`。

需要确认的问题：

- [ ] 是否允许个人开发者、小型项目或作品集项目申请。
- [ ] 是否提供正式 API、sandbox、affiliate feed 或 deep link。
- [ ] 是否需要公司、网站、流量或商业资质。
- [ ] 是否可以按城市查询产品或景点。
- [ ] 是否可以按指定日期查询。
- [ ] 是否提供价格和币种。
- [ ] 是否提供指定日期的余票或可预订状态。
- [ ] 是否提供预约、取消和入场规则。
- [ ] 是否提供购买链接，用户最终在哪里完成交易。
- [ ] 是否允许缓存响应，允许缓存多长时间。
- [ ] 请求配额、限流和并发限制是什么。
- [ ] 是否要求显示 provider 品牌、来源链接或免责声明。
- [ ] 是否允许将多个 provider 的结果放在同一页面展示或比较。
- [ ] 测试数据与生产数据之间有哪些明确差异。

无法确认的内容必须保留为“待确认”，不能根据营销页面、旧博客或 AI 推测填写。

### 3.3 Provider 决策

使用以下标准评估 provider：

| 标准 | 说明 |
| --- | --- |
| 接入资格 | 当前项目是否有资格申请和使用 |
| 数据匹配度 | 是否提供城市、日期、价格、状态和购买链接等 MVP 所需字段 |
| 数据可信度 | 数据是否来自正式、可追踪且经过授权的接口 |
| 使用限制 | 缓存、归因、展示和比较限制是否能被产品接受 |
| 技术复杂度 | 认证、分页、配额、错误处理和维护成本是否合理 |
| 测试能力 | 是否有 sandbox、测试账号或可重复验证的测试方式 |
| 业务连续性 | 单个 provider 不可用时，产品是否仍能清楚表达部分失败 |

决策结果应明确区分：

- MVP 首选 provider
- 备选 provider
- 暂不接入的 provider
- 仅作为跳转或参考来源的 provider

## 4. MVP 范围冻结

Provider 权限有明确结果后，记录第一版 MVP 的边界。

### 4.1 建议保留的最小用户流程

1. 用户输入或选择一个欧洲城市。
2. 用户选择旅行日期。
3. 系统展示少量可识别的景点。
4. 系统查询经过授权的 provider。
5. 系统展示 provider 明确返回的标准化事实。
6. 系统显示数据来源和获取时间。
7. 如果 provider 支持，系统提供购买跳转链接。
8. 如果某个 provider 失败，系统保留其他结果并明确显示部分失败。

### 4.2 必须明确的事实状态

对于价格、余票、日期和预约规则，系统必须能够区分：

- provider 已确认存在
- provider 已确认不存在
- provider 没有提供该字段
- 请求失败，当前无法确认
- 数据可能已经超过允许的有效时间

“未知”和“查询失败”不能显示为“无票”，也不能由 AI 补全。

### 4.3 本阶段暂不开发

- 完整用户注册、JWT 和权限系统
- 支付、出票和订单管理
- 邮件、短信或推送通知
- 复杂管理后台
- AI 推荐或自由生成的票务结论
- 多 provider 同时全面接入
- 微服务、Kafka、Kubernetes 和云端基础设施
- 没有真实数据支持的复杂页面

## 5. Provider Adapter 设计入口

Phase 0 完成后，下一阶段才定义统一 provider adapter。设计至少需要表达：

- provider 标识
- provider 产品标识
- 标准化景点标识
- 查询日期
- 币种和价格
- 可用状态
- 购买链接
- 数据来源
- 数据获取时间
- provider 错误
- partial failure 信息

原始 provider DTO、认证细节和 HTTP client 必须保留在对应 provider 的 `internal/infrastructure` 范围内。其他模块只能接收标准化结果和明确的来源元数据。

## 6. 第一个纵向功能切片

Phase 0 完成后，只选择一个权限最明确的 provider，实现第一条窄而完整的链路：

```text
城市和日期
→ 景点识别
→ Provider adapter
→ 标准化结果
→ 后端 REST API
→ 前端展示
```

该切片必须同时包含：

- timeout
- 明确的错误映射
- partial failure
- 允许范围内的基础缓存
- 数据来源和获取时间
- adapter contract test
- 后端自动化测试
- 前端状态测试

在第一条链路稳定前，不开始第二个 provider、提醒、通知或 AI 解释。

## 7. 风险与停止条件

遇到以下情况时应停止对应实现并记录问题：

- 需要尚未获得的 API key、账号或商业权限。
- Provider 条款不允许当前产品的展示、缓存或比较方式。
- 无法确认某个字段是否属于实时或可缓存数据。
- 只能获得 sandbox 或 fixture，但无法获得生产数据资格。
- 设计要求 AI 生成价格、余票、预约规则或优先级事实。
- 为了演示效果，需要把未知状态伪装成确定结果。

停止不代表项目失败。应根据已确认的数据能力缩小或调整 MVP。

## 8. 需要用户准备的事项

- [x] 安装 Docker Desktop。
- [x] 确定使用 GitHub 私有仓库。
- [ ] 准备 provider 申请使用的邮箱和必要资料。
- [x] 确定第一版优先支持 Rome。
- [ ] 明确项目主要用于学习、作品集，还是未来商业化。
- [ ] 保存 provider 的正式回复、条款链接和权限截图。

## 9. Phase 0 交付物

Phase 0 结束时应交付：

1. 通过完整测试的基础工程。
2. 更新后的 `docs/api-access-notes.md`。
3. Provider 决策记录或 ADR。
4. MVP 功能和不做功能清单。
5. 标准化字段清单。
6. 缓存、归因和数据刷新规则。
7. MVP 数据真实性声明。
8. 第一个 provider 纵向功能切片的实施任务。

## 10. 当前下一项任务

提交 Viator 和 Tiqets 的 affiliate 申请，并在账号获批后验证 Sandbox 或 test environment、Rome 产品覆盖、字段含义、缓存限制和 attribution 要求。随后联系 GetYourGuide Partner team，确认 Public Partner API 的准入条件。未获得真实权限前，不开始 provider 业务实现。
