# Docker Desktop 安装与本地基础设施步骤

## 1. 目的

本文件记录 Apple Silicon Mac 上的 Docker Desktop 安装步骤，以及项目 MySQL 和 Testcontainers 的后续验证方法。

Docker Desktop 是本项目运行本地容器和后端集成测试的前提。

## 2. 当前环境

- CPU 架构：Apple Silicon (`arm64`)
- macOS：26.2
- Homebrew：已安装
- Docker CLI：29.7.2
- Docker Desktop：4.86.0（Engine 29.7.2）
- Docker Compose：5.3.1
- Colima：未安装
- Podman：未安装

## 3. 安装前检查

可以使用以下命令检查本机已有的容器运行时：

```bash
command -v docker
command -v colima
command -v podman
test -d /Applications/Docker.app && echo "Docker Desktop is installed"
```

本项目检查时没有发现可用的 Docker 兼容运行时，因此选择安装 Docker Desktop。

## 4. 安装 Docker Desktop

在 IntelliJ IDEA 的 Terminal 中运行：

```bash
brew install --cask docker
```

Homebrew 会下载适用于 Apple Silicon 的官方 Docker Desktop 安装包，并把 `Docker.app` 安装到 `/Applications`。

安装过程中，macOS 可能要求输入当前电脑的管理员密码。Terminal 输入密码时不会显示字符或星号，这是正常现象。输入完成后按 Enter。

不要把电脑密码、GitHub token 或其他凭据发送给 Codex，也不要把密码写入命令、脚本或项目文件。

## 5. 本次安装结果

2026-08-17 已通过 Homebrew 下载 Docker Desktop 4.86.0 的 Apple Silicon 安装包。

自动安装在创建系统级 CLI 链接时需要 `sudo` 密码，因此被安全停止。Homebrew 随后回滚了 `/Applications/Docker.app`，没有留下半安装应用。

随后用户已在真实 Terminal 中重新执行：

```bash
brew install --cask docker
```

安装已成功完成，Docker Desktop 也已通过首次启动和系统权限确认。

## 6. 首次启动

安装命令成功后：

1. 从 macOS Applications 打开 Docker。
2. 阅读并确认 Docker Desktop 显示的条款。
3. 按照系统提示批准必要权限。
4. 等待菜单栏中的 Docker 图标显示引擎已启动。
5. 不需要登录 Docker Hub 才能运行本项目的公开容器镜像。

首次启动可能再次要求 macOS 管理员确认。这属于 Docker Desktop 的本机权限设置，不应通过项目脚本绕过。

## 7. 安装验证

Docker Desktop 完全启动后，在 Terminal 运行：

```bash
docker version
docker compose version
docker info
```

验证标准：

- `docker version` 同时显示 Client 和 Server。
- `docker compose version` 正常显示 Compose 版本。
- `docker info` 能连接 Docker Engine，不出现 daemon connection error。

只安装 CLI 但没有启动 Docker Desktop，不算验证完成。

本机验证结果：

- Docker Client：29.7.2
- Docker Server：Docker Desktop 4.86.0，Engine 29.7.2
- Docker Compose：5.3.1
- Docker context：`desktop-linux`
- Docker 架构：Linux `aarch64`

## 8. 项目基础设施验证

Docker Engine 正常后，在项目根目录运行：

```bash
docker compose config
docker compose up -d mysql
docker compose ps
```

MySQL 显示 healthy 后，再运行：

```bash
cd backend
./mvnw --batch-mode verify
```

这一次后端结果必须显示 Testcontainers 集成测试实际执行，不能再显示3个测试因缺少 Docker 而跳过。

2026-08-17 的实际验证结果：

- `docker compose config`：通过
- MySQL 17.10：healthy
- Testcontainers：成功连接 Docker Desktop
- Flyway：成功验证并应用 v1 migration
- Infrastructure integration tests：3个通过，0个跳过
- Spring Modulith test：1个通过
- Maven 总结果：4个测试通过，0个失败，0个错误，0个跳过
- Backend package：构建成功

## 9. 停止本地容器

完成验证后，可以在项目根目录运行：

```bash
docker compose down
```

该命令停止并移除项目容器和默认网络，但保留命名数据卷。除非明确需要清空本地数据库，否则不要加入 `--volumes`。

本次验证完成后已执行 `docker compose down`。两个验证容器和项目网络已移除，以下命名数据卷仍保留：

- `attraction-booking-intelligence_mysql-data`

## 10. 当前下一项操作

Docker 本地环境和 Testcontainers 验证已经完成。下一步进入 Phase 0 Provider 调查，先确认 Viator、Tiqets 和 GetYourGuide 的正式接入资格与数据限制。
