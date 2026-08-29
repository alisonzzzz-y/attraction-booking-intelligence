# 欧洲景点预约决策平台：Codex 项目启动说明

## 给 Codex 的执行指令

请完整阅读本文件后再采取行动。

目标是在当前空项目目录中建立一个干净、可运行、可测试的全栈工程骨架，用于后续开发“欧洲景点预约决策平台”。本轮只完成项目基础设施和模块边界，不实现完整票务业务，不伪造任何真实 provider 集成，也不开发复杂页面。

执行时请遵守以下原则：

1. 先检查当前目录和已安装的 Java、Node、Docker、Maven 环境。
2. 如果目录不是空的，先识别并保留已有文件，不覆盖用户内容。
3. 使用官方生成器或最小配置创建项目，不克隆其他人的完整业务项目。
4. 使用当前稳定且彼此兼容的依赖版本，并在 README 中记录最终版本。
5. 每完成一个阶段就运行对应测试。
6. 遇到需要 API key、云账号或付费服务的步骤时停止该步骤，写入文档，不填写虚假值。
7. 完成后报告生成了什么、测试结果、已知限制和下一步。

## 1. 项目背景

这是一个面向欧洲自由行用户的全栈应用。用户输入城市和旅行日期后，系统帮助判断：

- 哪些景点需要提前预约
- 应该什么时候购买门票
- 指定日期是否存在可用票务选项
- 不同票务来源的价格、状态和购买入口

系统后续会接入 Viator、Tiqets 或 GetYourGuide 等经过授权的 provider。核心工程问题包括：

- 多 provider adapter
- 数据标准化
- 并发查询
- timeout、retry 和 circuit breaker
- Redis 缓存
- partial failure
- 定时刷新
- 预约优先级规则
- 提醒和通知去重
- AI 基于结构化事实生成解释

AI 不负责生成价格、余票、预约规则或优先级事实。

## 2. Spring Initializr 和 Spring Modulith 的区别

### Spring Initializr

Spring Initializr 是项目生成工具。它负责创建一个可以编译和启动的 Spring Boot 基础工程，包括：

- Maven 或 Gradle 构建文件
- Spring Boot 主启动类
- Java 目录结构
- 测试目录
- application 配置文件
- 用户选择的 starter dependencies
- Maven Wrapper 或 Gradle Wrapper

它解决的问题是：

> 怎样快速生成一个能运行的 Spring Boot 项目？

它不会替项目决定 attraction、trip、provider、alert 等业务模块应该怎样划分，也不会自动阻止模块循环依赖。

### Spring Modulith

Spring Modulith 是加入 Spring Boot 项目中的架构和测试支持。它不是另一个项目生成器，也不是微服务框架。

它负责：

- 根据 Java package 识别业务模块
- 检查模块之间是否存在循环依赖
- 限制其他模块访问某个模块的内部实现
- 声明允许的模块依赖
- 对单个模块进行集成测试
- 生成模块架构文档
- 支持模块之间通过应用事件降低耦合

它解决的问题是：

> 项目生成以后，怎样保持业务模块边界清楚，并防止代码逐渐混乱？

### 本项目的选择

本项目同时使用两者：

1. 使用 Spring Initializr生成 Spring Boot 基础工程。
2. 加入 Spring Modulith 依赖和验证测试。
3. 按业务能力划分 package，而不是把所有 Controller、Service 和 Repository 分别堆在全局目录中。

## 3. 技术决策

### 总体架构

- 单一仓库
- 前后端分离
- 后端采用 modular monolith
- REST API
- MySQL 持久化
- Redis 缓存
- Docker Compose 本地开发
- GitHub Actions 持续集成

第一版不使用微服务、Kafka 或 Kubernetes。

### 后端

- Java 21
- Maven
- Spring Boot，使用创建时官方生成器提供的稳定版本
- Spring Web
- Spring Validation
- Spring Security
- Spring Data JPA
- MySQL Driver
- Flyway Migration
- Spring Data Redis
- Spring Boot Actuator
- Spring Modulith
- OpenAPI / Swagger
- Testcontainers
- JUnit 5
- Mockito

Resilience4j 在开始实现 provider integration 时加入。不要为了看起来复杂而提前增加没有使用的依赖。

### 前端

- Vite
- React
- TypeScript
- React Router
- TanStack Query
- Zod
- Tailwind CSS，或者选择一个轻量 UI 方案并记录理由
- Vitest
- React Testing Library
- Playwright
- ESLint
- Prettier

使用创建时的稳定版本，并提交 lockfile。

### 本地基础设施

- MySQL
- Redis
- Docker Compose

第一轮不加入邮件、云数据库、监控平台或 LLM 服务。

## 4. 需要生成的项目结构

```text
attraction-booking-intelligence/
├── AGENTS.md
├── README.md
├── .editorconfig
├── .gitignore
├── .env.example
├── docker-compose.yml
├── docs/
│   ├── project-plan.md
│   ├── architecture.md
│   ├── api-access-notes.md
│   ├── architecture-references.md
│   └── decisions/
│       ├── 0001-modular-monolith.md
│       └── 0002-provider-data-boundaries.md
├── backend/
│   ├── pom.xml
│   ├── mvnw
│   ├── mvnw.cmd
│   └── src/
│       ├── main/
│       │   ├── java/
│       │   └── resources/
│       └── test/
│           └── java/
├── frontend/
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── src/
└── .github/
    └── workflows/
        └── ci.yml
```

如果当前项目根目录名称不同，不要强行再创建一层重复目录。

## 5. 后端模块结构

根 package 使用清晰、稳定的名称，例如：

```text
com.yanzhang.attractionbooking
```

按业务能力建立以下顶层 package：

```text
com.yanzhang.attractionbooking
├── AttractionBookingApplication.java
├── identity/
├── trip/
├── attraction/
├── provider/
├── availability/
├── bookingpriority/
├── alert/
├── notification/
├── aiexplanation/
└── configuration/
```

每个业务模块后续可以采用：

```text
provider/
├── ProviderManagement.java
├── package-info.java
└── internal/
    ├── api/
    ├── application/
    ├── domain/
    └── infrastructure/
```

规则：

- 模块根 package 中只放准备暴露给其他模块的接口或类型。
- 实现细节放在 `internal` 下。
- 不建立全局 `controller`、`service`、`repository`、`entity` 大目录。
- 不建立随意堆放代码的 `common` 或 `utils` 目录。
- `configuration` 只保存真正的跨模块技术配置，不承载业务逻辑。

第一轮只建立必要的 package、说明和验证测试，不创建大量空类。

## 6. Spring Modulith 验证

加入一个架构验证测试，等价于：

```java
class ModularityTests {

    @Test
    void verifiesModuleStructure() {
        ApplicationModules.of(AttractionBookingApplication.class).verify();
    }
}
```

测试必须能够在 CI 中运行。

如果使用 `package-info.java` 声明模块或依赖关系，请保持最小化，只声明当前确实存在的边界。

## 7. 后端基础配置

需要完成：

- 应用可以连接 Docker Compose 中的 MySQL。
- Flyway 创建初始 schema history，但第一轮不创建完整业务表。
- Redis 连接配置存在，并通过简单集成测试或启动检查验证。
- Actuator health endpoint 可用。
- 本地开发配置不包含真实密码。
- `.env.example` 只包含变量名称和安全的示例值。
- 测试使用 Testcontainers，而不是依赖开发者机器上已运行的数据库。
- 提供统一 API 错误响应的最小框架，但不提前设计所有业务错误。

Spring Security 第一轮只完成最小安全配置，不实现完整用户注册和 JWT。如果加入 Security 导致 health check 或开发启动不可用，需要明确配置允许的公共 endpoint。

## 8. 前端基础结构

需要生成：

```text
frontend/src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── providers.tsx
├── features/
│   ├── trips/
│   ├── attractions/
│   └── availability/
├── shared/
│   ├── api/
│   ├── components/
│   ├── types/
│   └── validation/
├── test/
└── main.tsx
```

只实现：

- 一个简洁的应用壳
- 首页占位内容
- 前端路由
- TanStack Query provider
- 后端 health endpoint 的开发环境连接验证
- 一个组件测试
- 一个最小 Playwright smoke test

不要在第一轮制作完整旅行 UI，也不要添加静态假票务数据来伪装功能完成。

## 9. Docker Compose

生成的 Docker Compose 至少包括：

- MySQL
- Redis
- named volumes
- health checks
- 从环境变量读取配置

第一轮可以让前后端在本机运行，不强制把前后端也容器化。如果选择容器化，必须保证本地开发体验仍然简单。

## 10. GitHub Actions

创建最小 CI workflow：

### Backend job

- 设置 Java 21
- 缓存 Maven dependencies
- 运行 backend tests
- 运行 Spring Modulith verification
- 构建 application package

### Frontend job

- 设置兼容版本 Node.js
- 使用 `npm ci`
- lint
- unit tests
- production build

Playwright 可以先在本地运行。如果 CI 中加入浏览器测试导致配置过重，可以创建后续任务并说明原因。

## 11. 文档要求

### README.md

至少包含：

- 项目解决的问题
- 当前完成范围
- 技术栈和准确版本
- 本地运行前提
- 启动 MySQL 和 Redis 的命令
- 启动后端的命令
- 启动前端的命令
- 测试命令
- 当前哪些功能尚未实现
- 数据真实性声明

### docs/architecture.md

记录：

- modular monolith 选择
- 前后端边界
- 计划中的 provider adapter 结构
- 计划中的数据流
- 目前尚未实现的组件

### docs/api-access-notes.md

建立表格，记录：

- Provider
- 申请地址
- 申请状态
- Sandbox availability
- 可访问数据
- 缓存限制
- Attribution 要求
- 下一步

未知信息写 `待确认`，不要猜测。

### docs/architecture-references.md

记录参考过的开源项目及借鉴范围。初始可列出：

- Spring Initializr：项目生成
- Spring Modulith：模块结构和验证
- JHipster：认证、监控和完整工程结构参考
- Full Stack FastAPI Template：前后端目录、Docker 和 CI 参考
- Spring PetClinic：REST API 和示例项目参考

不要直接复制完整业务代码。复制任何具体代码前，先检查许可证并记录来源。

## 12. AGENTS.md 要求

生成根目录 `AGENTS.md`，至少包含以下项目约束：

- 所有事实性票务数据必须来自明确的数据源。
- 不得将 sandbox 或 fixture 数据描述为真实实时数据。
- 不得在仓库中提交 API key、密码或 token。
- 优先保持 modular monolith，不主动拆分微服务。
- 按业务模块组织后端，而不是按技术层全局组织。
- AI 只能解释结构化事实，不能生成票务事实。
- 所有新 provider 必须通过统一 adapter 接口。
- provider 失败不能导致整个聚合请求无结果。
- 对关键业务规则增加测试。
- 修改 README 中的完成状态时必须与实际功能一致。

## 13. 本轮不做

- Viator、Tiqets 或 GetYourGuide 的生产 API 调用
- 真实 API key 配置
- 用户支付
- 直接出票
- 完整 JWT 认证流程
- 完整数据库领域模型
- 完整景点页面
- Redis 业务缓存策略
- Resilience4j 策略实现
- 邮件通知
- LLM 调用
- 微服务
- Kafka
- Kubernetes
- 云端部署

## 14. 验收标准

本轮完成时必须满足：

1. 后端可以编译并启动。
2. 后端测试通过。
3. Spring Modulith 验证通过。
4. MySQL 和 Redis 可以通过 Docker Compose 启动并通过 health check。
5. 后端可以连接 MySQL。
6. Redis 配置已得到基本验证。
7. Actuator health endpoint 可访问。
8. 前端可以安装、启动和构建。
9. 前端 lint 和 unit test 通过。
10. 前端可以在开发环境访问后端 health endpoint。
11. GitHub Actions 配置存在。
12. README 包含可复现的运行与测试命令。
13. 仓库中没有真实 secret。
14. 没有把未实现功能写成已完成。

## 15. 完成后的交付报告

完成后请用简洁中文报告：

- 生成的主要文件和模块
- 最终采用的版本
- 实际运行的测试和结果
- 未运行的测试及原因
- 需要用户安装或授权的内容
- 与本说明有差异的地方及理由
- 推荐的下一项任务

推荐下一项任务应当是：

> 完成 Phase 0 数据可行性验证，并根据真实 API 权限冻结 provider 范围和 MVP 数据声明。
