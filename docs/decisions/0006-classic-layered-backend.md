# ADR 0006：后端改为经典四层结构

状态：已接受

## 决策

后端继续使用单一 Spring Boot 部署单元，但移除 Spring Modulith。主要应用代码按 `controller`、`service`、`repository`、`entity` 四层组织。

外部 Provider 的 client 和 adapter 仍保留在各自的基础设施 package 中。Provider 返回值和 Booking Priority 值对象不强行改为 JPA Entity，避免把外部事实误当成本项目持久化拥有的数据。

## 原因

经典四层结构更直接地展示 Spring Boot 面试中常见的请求链路，也让 Controller、业务逻辑、数据库访问和持久化实体更容易查找。项目当前规模不需要微服务，也不需要用 Spring Modulith 强制业务模块边界。

## 影响

- HTTP 请求统一进入 `controller`。
- 用例编排、校验和确定性规则统一进入 `service`。
- Spring Data JPA 接口和受控的数据目录进入 `repository`。
- MySQL 持久化对象进入 `entity`。
- 依赖方向保持为 `controller -> service -> repository -> entity`。
- 项目仍然是 modular monolith 意义上的单体应用，只是不再使用 Spring Modulith 库或按业务模块划分顶层 package。
