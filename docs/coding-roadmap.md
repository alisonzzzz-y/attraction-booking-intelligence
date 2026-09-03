# Coding 路线图

最后更新：2026-08-19

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

已完成 Spring Boot modular monolith、React 应用壳、MySQL、Testcontainers、Docker Compose、CI、GitHub 私有仓库和基础文档。当前前后端测试及 GitHub Actions 已通过。

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
- 暂不部署 Spring Boot 或 MySQL；公开页面不能依赖后端才能加载。

验收：匿名浏览器可以访问公开 URL，页面明确标记为开发中，GitHub 推送可以触发可追踪的部署。

### Part 6：提交 Provider 申请

状态：表单步骤已完成。Viator Basic Access Sandbox key 已于 2026-08-19 验证可用；Tiqets 于 2026-08-19 通知申请资料不完整或不正确，已邮件询问具体修改要求。

目标：使用真实公开网站完成资格申请。

范围：

- 先申请 Viator Affiliate Basic Access。
- 同时申请 Tiqets Affiliate，申请 Essential API access。
- 如有必要，再联系 GetYourGuide Public Partner API 团队。
- 将提交日期、申请类型和正式回复写入 `api-access-notes.md`。
- API key 只保存在本地环境或托管平台 secret 中，不写入文档、聊天或 Git。

验收：至少提交一份真实申请，并保存可追踪的申请状态。

### Part 7：根据真实权限冻结 MVP

状态：已完成（2026-08-19）。MVP 开发范围、首个 Provider、production 阻塞项和数据真实性规则已经冻结。

目标：将 Provider 的实际能力转换为明确的产品范围。

产品需求讨论稿见 [`product-requirements.md`](product-requirements.md)。本 Part 需要根据真实权限确认其中的等待项，不能把讨论稿中的候选状态或页面字段直接视为已经获批的功能。

范围：

- 核对 Rome 覆盖、字段、环境、rate limit、缓存、attribution 和跳转要求。
- 核对 Google Maps Platform billing、EEA 条款、key restrictions、Places 字段和约 10 个景点的 Place ID。
- 明确哪些数据可显示、不可显示或只能标为非实时。
- 决定首个 Provider、备选 Provider 和暂不接入的来源。
- 新增 Provider 选择 ADR 和 MVP 数据真实性声明。

停止条件：如果尚未获得可测试的票务 Provider 权限，本 Part 不进入“完成”，也不开始票务结果页面。Google Maps 与 Places 的账号和数据可行性验证可以独立进行。

已验证的 Google 范围：

- Maps JavaScript API 使用受 HTTP referrer 限制的浏览器 key，本地 `/map-preview` 已成功渲染固定的 Colosseum 测试坐标。
- Places API (New) 使用独立的 server key，本地 Text Search 已返回 Colosseum 的 Place ID、英文名称和格式化地址。
- 浏览器 key 与 server key 已分离；server key 不进入前端 bundle。当前测试结果只证明连接和字段可用，不代表已经建立 Rome 景点目录，也不属于票务数据。
- Rome MVP 的 10 项景点清单和 13 个 Google Place ID 已完成初次核对，并记录在 [`rome-attraction-catalogue.md`](rome-attraction-catalogue.md)。两个规划组合保留了组件级映射，没有把多个 Google 实体合并成一个 Place。

已验证的 Viator Sandbox 范围：

- Basic Access key 已成功调用 `/destinations`，Rome `destinationId = 511`。
- Rome 产品搜索、完整景点目录分页和 10 项 MVP 景点的 free-text 候选搜索均返回成功。
- 13 个地点组件都能在 Viator attraction directory 中找到；目录 `productCount` 只代表关联产品，不代表直接门票。
- 候选产品与搜索误匹配记录在 [`viator-rome-coverage.md`](viator-rome-coverage.md)，不能在产品详情核对前自动建立正式映射。
- Pantheon 候选产品 `5569822P4` 的产品详情和单产品 schedule 均返回 HTTP 200。响应证实 option、season、timed entry、价格结构、明确 unavailable date 和 Sandbox affiliate URL 可读取，但不能据此声明实时余票或预约紧迫度。
- Provider 选择记录在 [`decisions/0003-first-mvp-providers.md`](decisions/0003-first-mvp-providers.md)。
- 展示、环境隔离、事实状态和禁止推导规则记录在 [`mvp-data-truth-statement.md`](mvp-data-truth-statement.md)。

### Part 8：Provider 无关的领域契约

状态：已完成（2026-08-19）。

目标：在已知真实字段后建立稳定边界。

范围：

- 定义统一 Provider adapter 接口。
- 定义标准化 attraction、location、opening hours、booking urgency evidence、availability、price、source、freshness 和 error 类型。
- 将 Google Place ID 作为外部映射，不让 Google DTO 进入业务模块。
- 明确 unknown、unavailable、stale 和 request failed 的区别。
- 添加模块边界测试和 adapter contract test 基础。

验收：契约只表达已确认能力，不泄漏某个 Provider 的原始 DTO。

已完成：

- 新增统一 `ProviderAdapter`、最小查询输入和标准化返回结果。
- 定义 attraction、external reference、location、opening hours、booking urgency evidence、availability、price、source、freshness 和 error 类型。
- 将 `UNKNOWN`、明确 `UNAVAILABLE`、`REQUEST_FAILED` 和 `STALE` 分开表达；`SCHEDULED` 不代表实时库存。
- Google Place ID 只作为普通外部引用保存，不引入 Google DTO。
- `ProviderSearchResult` 保留 partial failure 和 complete failure 的区别。
- 新增可供未来 adapter 测试继承的 `ProviderAdapterContract`，并使用测试 stub 验证基础契约。
- 领域契约说明记录在 [`provider-domain-contract.md`](provider-domain-contract.md)。

### Part 9：首个 Provider adapter

状态：已完成（2026-08-19）。已实现默认关闭的 Viator Basic Access Sandbox adapter，并使用本地 HTTP stub 完成 contract tests。

目标：完成第一条经过授权的数据访问链路。

范围：

- 只实现一个 Provider。
- 认证配置来自环境变量。
- 原始 DTO 和 HTTP client 留在 provider internal 范围。
- 实现字段映射、错误映射、日志脱敏和 contract tests。
- Sandbox 或测试数据必须在 API 和 UI 中清楚标记。

验收：可以对一个已确认的 Rome 产品执行可重复查询，并保留来源和获取时间。

已完成：

- 环境变量提供 `enabled`、Sandbox base URL 和 API key；仓库没有保存真实 key。
- Viator 原始 DTO、HTTP client、配置和 adapter 均位于 Provider 模块的 `internal.viator` 范围。
- 已实现 `/products/{product-code}` 和 `/availability/schedules/{product-code}` 两个只读请求。
- 已映射产品状态、product code、schedule summary `fromPrice`、币种、booking cutoff、Sandbox environment、来源 URL 和获取时间。
- `SCHEDULED` 只表示 Provider 返回了销售排期，不表示实时库存。单个 option 或 timed entry 的 `unavailableDates` 不会被提升为整个产品不可用。
- 401/403、404、408/504、429、其他 HTTP 错误、不可读响应和缺少产品映射均转换为稳定的领域错误。
- HTTP client 不记录 API key、请求头或原始错误响应；contract test 验证认证错误不会暴露测试 key。
- Contract tests 使用本地 stub 和明确的 Sandbox 测试样本，不调用 production，也不把 fixture 描述为实时数据。

实现和运行边界见 [`viator-sandbox-adapter.md`](viator-sandbox-adapter.md)。

### Part 10：Rome 第一条纵向功能切片

状态：进行中。10A 至 10G 已完成五个 Rome 景点结果组，其中包含 Colosseum Archaeological Park 和 Vatican Museums and Sistine Chapel 两个组合景点模型。

目标：把真实 Provider 结果从后端送到前端。

范围：

- 支持一个城市 Rome 和少量经过来源核对的景点。
- 用户选择城市停留日期范围并查询。
- 后端返回标准化景点、位置、开放信息、票务排期、预约紧迫度证据和明确状态。
- 前端实现景点列表与 Google Map marker 联动，并在地图失败时保留列表。
- 前端展示 Provider、价格或状态、预约紧迫度、freshness、错误和允许的购买跳转。
- 不支持的字段显示 unavailable 或 unknown，不猜测内容。

验收：一条真实查询可以端到端完成，失败状态和无数据状态有自动化测试。

#### Part 10A 已完成

- 新增 `/plan`，只开放 Rome，并校验必填日期、日期顺序和最长 14 天范围。
- 查询条件写入 `/results?city=rome&stayStartDate=...&stayEndDate=...`，不包含 secret。
- 首页主入口和 build status 已更新为当前真实阶段。
- 新增公开只读 `GET /api/v1/rome/attractions` 端点，输入为 `stayStartDate` 和 `stayEndDate`。
- 端点只调用已人工核对的 Pantheon Viator Sandbox 产品 `5569822P4`，并返回 provider、environment、source time、freshness、状态、价格和错误边界。
- Provider 未配置时返回服务不可用，不回退到 fixture，也不把失败解释为无票。
- 10A 结束时前端尚未调用该端点，Sandbox purchase URL 不会显示在公开 UI。

#### Part 10B 已完成

- `/results` 通过 React Query 调用 Rome 端点，并在浏览器边界验证响应结构。
- 第一张 Pantheon 卡片展示 provider、Sandbox 环境、获取时间、freshness、排期状态、价格类型和预约证据状态。
- `SCHEDULED` 明确解释为 Provider 发布了排期，而不是实时库存保证；Sandbox `FROM` 价格明确标记为非实时报价。
- Provider 未配置、响应错误或部署端没有后端时显示独立失败状态，不解释为售罄。
- 空结果与 partial failure 都有独立界面；Sandbox purchase URL 继续不显示。
- 前端单元测试覆盖成功、Provider 失败和缺少查询条件三种状态。

#### Part 10C 已完成

- 新增服务端 Google Place Details 客户端，只请求已人工核对的 Pantheon Place ID。
- `GET /api/v1/rome/places` 返回地址、坐标、Google Maps URI、business status 和获取时间，不返回任何票务推断。
- 浏览器通过 Zod 校验地点响应，服务端 key 不进入前端 bundle。
- Pantheon 卡片把 Google Places 地点事实与 Viator Sandbox 票务事实分区展示，并分别标记来源和获取时间。
- 两个 Provider 使用独立 React Query。地点失败时保留票务证据，票务失败时保留地点证据。
- 结果页以列表为主，地图使用经过核对的坐标；缺少浏览器 key 或地图加载失败时，列表仍然完整可读。
- 自动化测试覆盖 Google 客户端 contract、未配置状态、两类独立失败、地图降级、生产构建和浏览器流程。

#### Part 10D 已完成

- 第二个景点使用已人工核对的内部 ID `borghese-gallery`、Google Place ID `ChIJq-bXVgRhLxMRv3vgOXaktBs` 和 Viator Sandbox 产品 `403837P1`。
- Rome 地点端点现在返回 Pantheon 与 Galleria Borghese 两条独立 Google Places 事实记录。
- Rome 票务端点把 Pantheon 与 Borghese Gallery 作为两个独立映射交给统一 Viator adapter，仍不把 Sandbox 排期或价格描述为 production 实时数据。
- 结果页按内部 attraction ID 合并两个来源。某个 Provider 整体失败时，另一来源的两张景点卡片仍然保留。
- 每张有地点证据的卡片都可以选择对应地图位置；选择状态有可见样式和 `aria-pressed` 语义，地图不可用时地点列表仍然完整。
- 自动化测试覆盖两个固定外部映射、双景点渲染、Provider 独立失败和地图选择交互。

#### Part 10E 已完成

- 新增组合景点内部 ID `colosseum-archaeological-park`。Colosseum、Roman Forum 和 Palatine Hill 保留各自的 `componentId` 和 Google Place ID，但共享同一个 attraction ID。
- 新增 Provider 无关的 `OfferingType`。Viator 产品 `15932P15` 明确映射为 `GUIDED_TOUR`，不能与官方 €18 基础入场票混为一谈。
- Sandbox 产品详情与 schedule 于 2026-08-19 再次返回 HTTP 200。产品状态为 `ACTIVE`，标题明确包含三个地点，schedule 摘要为 `EUR 49 FROM`；这些仍是 Sandbox 集成证据，不是 production 实时报价。
- 结果页把组合景点显示为一张卡片，卡片内列出三个分别核对的地点，并在地图选择时聚焦整个地点组。
- 自动化测试覆盖三项外部地点映射、组合关系、导览产品类型、三地点渲染和组合地图选择文案。

#### Part 10F 已完成

- 新增组合景点内部 ID `vatican-museums-sistine-chapel`，并保留 Vatican Museums 与 Sistine Chapel 两个独立 Google Place component。
- 两个固定 Place ID 于 2026-08-20 再次返回 HTTP 200，名称、地址、坐标和 `OPERATIONAL` 状态均通过校验。
- Viator Sandbox 产品 `144387P2` 的详情与 schedule 于 2026-08-20 返回 HTTP 200。产品状态为 `ACTIVE`，标题为 `Vatican Museums and Sistine Chapel Tickets`，唯一 option 为 `Tickets Only`，因此映射为 `TICKET_PRODUCT`。
- Sandbox schedule 的 `EUR 69 FROM` 只用于验证字段映射，页面继续明确标记为 Sandbox 摘要价格，不把它描述为官方价格、实时价格或 production 可用性。
- 梵蒂冈博物馆官方规则确认同日门票包含西斯廷教堂；官方来源、Google 地点事实和 Viator Sandbox 产品事实仍然分开记录。
- 结果页将两个地点显示为一个组合景点组，并保留 Provider 独立失败、地图降级和组合地点聚焦能力。
- 自动化测试覆盖第四项外部产品映射、两个地点 component、组合渲染、Sandbox 标签和浏览器流程。

#### Part 10G 已完成

- 新增 `baths-of-caracalla` 结果组，并使用此前通过 Google Places Text Search 核对的固定 Place ID `ChIJ1YU-M85hLxMR3Jhb6gZAK2o`。运行时仍通过 Place Details 校验名称、地址、坐标和状态。
- Viator Sandbox 产品 `247354P40` 的详情与 schedule 于 2026-08-21 返回 HTTP 200。产品状态为 `ACTIVE`，唯一 option 明确包含入场票和数字语音导览，schedule 摘要为 `EUR 15 FROM`。
- 新增 `TICKET_WITH_AUDIO_GUIDE` 产品类型，并同时修正 Borghese Gallery 的现有分类。前端明确说明这类产品是 affiliate bundle，不是官方基础入场票。
- 意大利文化部官方页于 2026-08-21 复核：普通参观全价 €8、18 至 25 岁优惠票 €2、预约非必需，临时展览可能另收 €5。官方快照和 Viator Sandbox 组合价继续作为不同来源处理。
- 自动化测试覆盖第五项外部产品映射、第八条地点记录、语音导览组合标签、Provider 独立失败和浏览器流程。

#### Part 10H 已完成

- 新增 `capitoline-museums` 结果组，使用固定 Google Place ID `ChIJ8-wGeU9gLxMR--zJtnpGod4`，运行时继续通过 Place Details 校验地点事实。
- Viator Sandbox 产品 `14982P113` 的详情与 schedule 于 2026-08-21 返回 HTTP 200。产品状态为 `ACTIVE`，唯一 option 和 inclusions 都只声明博物馆入场，因此映射为 `TICKET_PRODUCT`。
- Sandbox schedule 摘要为 `EUR 30 FROM`，且换票说明表示用户所选时段不可用时可能改为最近可用时段。页面不会把 €30 描述为官方价，也不会把选择的时段描述为已保证。
- Capitoline Museums 官方页同期显示，无临时展览时成人基础票 €15，线上预购另收 €1，展览期间价格会变化。官方价格快照和 Viator Sandbox 产品继续分开。
- 自动化测试覆盖第六项外部产品映射、第九条地点记录、Sandbox 标签、Provider 独立失败和浏览器流程。

#### Part 10I 已完成

- 新增独立的 `bookingpriority` 业务模块，为 10 个 Rome MVP 景点返回版本化、可解释的预约优先级。
- 第一版标签为 `Book first`、`Book soon`、`Can wait` 和 `Check official source`，全部来自人工核对的官方预约政策和确定性规则。
- 每条结果返回置信度、时间建议、官方事实依据、来源 URL、核对日期、规则版本和计算时间。
- 官方预约建议不依赖 Viator Sandbox 是否返回产品、排期或价格；Google Places 和第三方票务请求失败也不会清空官方优先级。
- 当前证据不足以支持“提前 7 天”或“提前 14 天”等精确时间，因此第一版明确不生成这类数字。
- 后端规则和服务测试、前端来源隔离测试、生产构建和 lint 均已通过。

下一步 10J：在条款允许的前提下设计历史可用性观察模型，用于以后校准提前购买时间范围。该模型不得把 Sandbox 排期描述为 production 实时余票。

### Part 11：韧性、缓存与 partial failure

目标：让外部 API 失败不会破坏整个页面。

范围：

- 根据 Provider 条款加入 timeout、有限 retry、rate limit 和 circuit breaker。
- 只在许可范围内使用 Redis 缓存。
- 返回 freshness 和 partial failure 信息。
- 测试超时、429、Provider 5xx、过期缓存和部分失败。

验收：单个 Provider 故障时仍返回可用结果或明确 unknown，绝不显示为“无票”。

#### Part 11A 已完成：Sandbox 外部调用的基础韧性

- Viator Sandbox client 使用 3 秒连接超时、8 秒响应超时，并把总重试次数限制为 1 次。
- 只有 timeout、503 等上游失败可以立即重试；403 认证失败和 429 限流不重试。
- 每个已核对产品独立请求。一个产品失败会返回带受影响景点 ID 的稳定错误，其余产品结果会保留。
- 本地 HTTP stub contract tests 覆盖 503、504、429、403、持续 503 以及部分失败。测试不调用 Viator 网络。

Part 11B remains deliberately open: a Provider-independent orchestrator, circuit-breaker policy, and any short-term cache must be designed together and checked against provider terms before implementation. No Redis cache or circuit breaker has been added.

中文说明：Part 11A 已完成 Sandbox 外部调用的基础韧性：3 秒连接超时、8 秒响应超时、最多一次重试；只对 timeout 和上游 503 等失败重试；403 与 429 不重试；一个产品失败不会清空其他产品结果。Part 11B 仍需在确认 Provider 条款后，统一设计 Provider 无关编排、circuit breaker 策略和短期缓存。目前没有加入 Redis 缓存或 circuit breaker。

### Part 12：部署后端与真实纵向切片

目标：将已经验证的全栈切片部署到公开环境。

范围：

- 在执行时评估适合 Java 21 和 MySQL 的托管方案；Redis 只在实际引入合规缓存后再评估。
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

- 行程保存和基础身份功能。
- Routes API、景点间通行时间和图形化行程安排。
- 提醒、通知和去重。
- 更完整的可观测性、性能测量和作品集证据整理。

## 4. 当前只执行的下一部分

当前优先执行 **Part 14 的 Agent evaluation、演示和作品集证据整理**。Provider 的 timeout、有限 retry、单 Provider 内部部分失败测试，以及受约束的 Rome 预约解释接口已经完成。下一步应建立一组可复现的 evaluation cases，验证模型不会编造价格、余票、预约规则或优先级，再录制简短的端到端演示。不得用模型输出或缓存掩盖数据来源、环境或 freshness。

Part 1–9 和 Part 10A 至 10J 已完成。Part 10J 只完成历史观察模型和实施闸门设计，没有创建采集器、历史业务表或精确提前购买天数。原因是当前 Viator 权限仍为 Sandbox Basic Access，不能提供合规且可验证的 production 历史余票。详细决定见 [`decisions/0004-historical-availability-observations.md`](decisions/0004-historical-availability-observations.md)。Part 10A 至 10I 已实现本地 Rome 日期查询、10 个景点的 Booking Priority、9 条 Google Places 组件记录和 6 条 Viator Sandbox 产品映射。受约束的 `aiexplanation` 接口会先经由唯一工具读取确定性预约事实；没有模型密钥或模型失败时会返回模板 fallback。官方预约建议、地点事实和第三方 Sandbox 票务证据分别存储和展示。前端部署在 Vercel，后端部署在 Render 并连接 Railway MySQL；每次推送到 `main` 后，由平台自动创建新部署。详细部署配置与验证记录见 [`deployment.md`](deployment.md)。
