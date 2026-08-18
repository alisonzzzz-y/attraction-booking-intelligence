# Coding 路线图

最后更新：2026-08-18

## 1. 路线目标

项目不等待完整 API 权限才开始，也不在权限未知时提前开发依赖真实票务数据的功能。执行顺序分成两段：

1. 先把现有 React 前端做成可信、可公开访问的产品入口，并部署获得真实 URL。
2. 使用该 URL 申请 Provider 权限，根据实际获批能力冻结 MVP，然后继续开发真实查询链路。

公开网站和后续产品使用同一套前端代码，不创建用完即丢的临时网站。

## 2. 每个 Part 的执行规则

- 一次只执行一个 Part，不提前混入下一部分功能。
- 开始前确认范围，结束时运行与改动相符的测试。
- 每个 Part 都应产生可以检查的结果，并更新完成状态。
- 价格、余票、日期规则和购买入口只能来自明确授权的数据源。
- 在获得权限前，不展示模拟票价、模拟余票或看起来像真实搜索结果的 fixture。
- 部署页面必须明确说明项目仍在开发，不能暗示已经提供实时聚合服务。
- 新依赖只在当前 Part 确实需要时加入。
- 每个完成的 Part 单独提交，保持 Git 历史可解释。

## 3. 分 Part 实施计划

### Part 0：工程地基

状态：已完成。

已完成 Spring Boot modular monolith、React 应用壳、PostgreSQL、Redis、Testcontainers、Docker Compose、CI、GitHub 私有仓库和基础文档。当前前后端测试及 GitHub Actions 已通过。

### Part 1：公开网站的信息结构与真实文案

状态：已完成（2026-08-18）。

目标：把当前占位首页变成一个可以公开展示的产品介绍页，但不加入票务业务数据。

范围：

- 明确首页结构、导航和页面层级。
- 首页说明用户问题、Rome-first 范围、计划中的工作方式和当前开发状态。
- 增加清楚的数据真实性说明，区分 planned、verified 和 unavailable。
- 将当前显眼的 backend connection 卡片改成适合公开访客的开发状态信息。
- 保留简单英文文案，并提供自然中文对照稿供审阅；公开页面首版只使用英文，避免双语界面增加复杂度。

不做：景点列表、价格、余票、搜索表单、Provider logo、购买链接和登录。

验收：首次访问者能够在一分钟内理解产品解决什么问题、尚未提供什么功能，以及数据不会由 AI 编造。

### Part 2：视觉基础和响应式应用壳

状态：已完成（2026-08-18）。

目标：建立后续页面可以复用的轻量视觉系统。

范围：

- 整理颜色、字体、间距、按钮、卡片和内容宽度等 CSS tokens。
- 完成桌面、平板和手机布局。
- 建立可复用的 header、footer、section 和 status badge。
- 检查键盘导航、语义标题、颜色对比和 reduced motion。
- 继续使用 plain CSS，除非实现过程中出现明确理由，不引入大型 UI 库。

验收：主要断点没有横向滚动，键盘可操作，组件测试覆盖关键公开内容。

### Part 3：方法与数据边界页面

状态：已完成（2026-08-18）。

目标：提供 Provider 审核和项目面试都能理解的可信说明。

范围：

- 增加 `/methodology` 页面。
- 说明授权来源、freshness、unknown 状态、partial failure 和 AI 边界。
- 增加简短的开发路线与当前能力说明。
- 所有完成状态必须与仓库实际功能一致。

不做：复制 Provider 内容、展示未授权品牌素材或承诺实时数据。

验收：首页可以进入 methodology 页面，刷新深层路由正常，页面内容与 README 和 ADR 一致。

### Part 4：公开发布前质量检查

状态：已完成（2026-08-18）。

目标：让前端具备作为公开项目页面的基本质量。

范围：

- 设置准确的页面 title、description、favicon 和基础分享元数据。
- 补充首页与 methodology 页的组件测试。
- 扩展 Playwright smoke test，覆盖导航和移动端基本布局。
- 运行 lint、format、unit test、production build 和 E2E。
- 检查构建产物不含 key、token、内部路径或虚假业务数据。

验收：所有前端检查通过，生产构建可由静态服务器运行。

### Part 5：部署公开前端

状态：已完成部署（2026-08-18），独立网络 smoke test 待补。

目标：获得可提交给 Provider 的稳定 HTTPS URL。

范围：

- 在执行时根据官方当前文档确认静态托管平台和免费额度限制。
- 首选连接当前 GitHub 私有仓库的自动部署方式。
- 配置 Vite SPA 路由 fallback 和生产环境变量边界。
- 验证首页、深层路由、手机布局、HTTPS 和刷新行为。
- 暂不部署 Spring Boot、PostgreSQL 或 Redis；公开页面不能依赖后端才能加载。

验收：匿名浏览器可以访问公开 URL，页面明确标记为开发中，GitHub 推送可以触发可追踪的部署。

### Part 6：提交 Provider 申请

状态：已完成（2026-08-18）。Viator 正在等待身份验证，Tiqets 正在等待资格审核。

目标：使用真实公开网站完成资格申请。

范围：

- 先申请 Viator Affiliate Basic Access。
- 同时申请 Tiqets Affiliate，申请 Essential API access。
- 如有必要，再联系 GetYourGuide Public Partner API 团队。
- 将提交日期、申请类型和正式回复写入 `api-access-notes.md`。
- API key 只保存在本地环境或托管平台 secret 中，不写入文档、聊天或 Git。

验收：至少提交一份真实申请，并保存可追踪的申请状态。

### Part 7：根据真实权限冻结 MVP

状态：等待 Provider 正式回复，尚未开始实现。

目标：将 Provider 的实际能力转换为明确的产品范围。

范围：

- 核对 Rome 覆盖、字段、环境、rate limit、缓存、attribution 和跳转要求。
- 明确哪些数据可显示、不可显示或只能标为非实时。
- 决定首个 Provider、备选 Provider 和暂不接入的来源。
- 新增 Provider 选择 ADR 和 MVP 数据真实性声明。

停止条件：如果尚未获得可测试的正式权限，本 Part 不进入“完成”，也不开始票务结果页面。

### Part 8：Provider 无关的领域契约

目标：在已知真实字段后建立稳定边界。

范围：

- 定义统一 Provider adapter 接口。
- 定义标准化 attraction、availability、price、source、freshness 和 error 类型。
- 明确 unknown、unavailable、stale 和 request failed 的区别。
- 添加模块边界测试和 adapter contract test 基础。

验收：契约只表达已确认能力，不泄漏某个 Provider 的原始 DTO。

### Part 9：首个 Provider adapter

目标：完成第一条经过授权的数据访问链路。

范围：

- 只实现一个 Provider。
- 认证配置来自环境变量。
- 原始 DTO 和 HTTP client 留在 provider internal 范围。
- 实现字段映射、错误映射、日志脱敏和 contract tests。
- Sandbox 或测试数据必须在 API 和 UI 中清楚标记。

验收：可以对一个已确认的 Rome 产品执行可重复查询，并保留来源和获取时间。

### Part 10：Rome 第一条纵向功能切片

目标：把真实 Provider 结果从后端送到前端。

范围：

- 支持一个城市 Rome 和少量经过来源核对的景点。
- 用户选择日期并查询。
- 后端返回标准化结果和明确状态。
- 前端展示 Provider、价格或状态、freshness、错误和允许的购买跳转。
- 不支持的字段显示 unavailable 或 unknown，不猜测内容。

验收：一条真实查询可以端到端完成，失败状态和无数据状态有自动化测试。

### Part 11：韧性、缓存与 partial failure

目标：让外部 API 失败不会破坏整个页面。

范围：

- 根据 Provider 条款加入 timeout、有限 retry、rate limit 和 circuit breaker。
- 只在许可范围内使用 Redis 缓存。
- 返回 freshness 和 partial failure 信息。
- 测试超时、429、Provider 5xx、过期缓存和部分失败。

验收：单个 Provider 故障时仍返回可用结果或明确 unknown，绝不显示为“无票”。

### Part 12：部署后端与真实纵向切片

目标：将已经验证的全栈切片部署到公开环境。

范围：

- 在执行时评估适合 Java 21、PostgreSQL 和 Redis 的托管方案。
- 配置生产 secret、CORS、数据库迁移、health check 和最小日志。
- 前端连接公开后端，保留安全的失败降级页面。
- 执行部署后 smoke test，不进行真实购买。

验收：公开网站可以完成已授权查询，secret 不出现在仓库、前端 bundle 或日志中。

### Part 13：第二个 Provider 与比较能力

目标：只有在第二个 Provider 的权限和比较条款明确后，才加入跨来源聚合。

范围：第二个 adapter、并发聚合、来源独立错误、比较展示和 attribution。

验收：任何比较都使用同一日期、币种和清楚的产品映射，不把不同产品包装成同一票种。

### Part 14：后续产品能力

以下能力分别规划为独立 Part，不在首个真实查询切片稳定前开发：

- 预约优先级规则。
- 行程保存和基础身份功能。
- 提醒、通知和去重。
- AI 对结构化事实的解释与模板 fallback。
- 更完整的可观测性、性能测量和作品集证据整理。

## 4. 当前只执行的下一部分

下一次只执行 **Part 7：根据真实权限冻结 MVP**，但必须等待至少一个 Provider 返回可测试的正式权限。

Part 1–4 已完成并通过 lint、format、组件测试、production build 和 Playwright 浏览器测试。Part 5 已通过 Vercel 部署到 <https://attraction-booking-intelligence.vercel.app/>，GitHub commit status 显示部署成功。Codex 当前网络访问 `vercel.app` 超时，因此线上首页、深层路由刷新和控制台 smoke test 仍需从独立网络补充验证。详细配置与验证记录见 [`deployment.md`](deployment.md)。Part 6 已提交 Viator 和 Tiqets 申请。等待期间只整理申请回复和权限证据，不提前实现依赖 API 的业务功能。
