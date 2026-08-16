# Git 初始化与首次提交步骤

## 1. 目的

本文件记录项目的 Git 初始化过程，以及创建第一次工程骨架提交前需要完成的检查。

本地仓库初始化和工程骨架基线提交已经完成。GitHub 远程仓库连接将在下一步单独执行。

## 2. 当前状态

- Git 仓库：已初始化
- 默认分支：`main`
- 首次提交：已创建工程骨架基线提交
- GitHub 远程仓库：尚未连接
- Git 用户身份：本机已配置
- 初始化日期：2026-08-17

## 3. 初始化前检查

初始化前先确认当前目录不是其他 Git 仓库的一部分：

```bash
git rev-parse --is-inside-work-tree
```

如果命令返回错误或没有返回 `true`，说明当前目录还不是 Git 工作区。

然后检查 `.gitignore`。本项目至少忽略以下内容：

```text
.DS_Store
.env
.idea/
.vscode/
backend/target/
frontend/node_modules/
frontend/dist/
frontend/playwright-report/
frontend/test-results/
```

初始化前还应确认仓库中不存在以下敏感内容：

- `.env`
- API key
- Access token
- 密码
- 私钥文件
- Provider 账号凭据

`.env.example` 可以提交，但只能包含本地示例值或变量名称，不能包含真实凭据。

## 4. 初始化命令

在项目根目录运行：

```bash
git init -b main
```

该命令创建 `.git` 元数据，并直接将默认分支设置为 `main`。

本项目已执行该命令，初始化成功。

## 5. 初始化后检查

确认当前分支：

```bash
git branch --show-current
```

预期输出：

```text
main
```

查看准备纳入版本控制的文件：

```bash
git status --short
```

第一次提交前，项目文件显示为 `??` 是正常现象，表示文件尚未被 Git 跟踪。

检查忽略规则是否生效：

```bash
git status --short --ignored
```

以下目录应显示为 `!!`，表示它们已被忽略：

- `.idea/`
- `backend/target/`
- `frontend/node_modules/`
- `frontend/dist/`
- `frontend/test-results/`

## 6. Git 用户身份

创建提交前，可以检查 Git 用户身份：

```bash
git config --get user.name
git config --get user.email
```

本机已经配置 Git 用户身份。为了保护个人信息，本文件不记录具体姓名和邮箱。

如果以后需要设置，可以使用：

```bash
git config user.name "Your Name"
git config user.email "your-email@example.com"
```

不建议为了单个项目直接修改全局身份，除非确定所有本地仓库都应使用同一身份。

## 7. 工程骨架基线提交

首次提交已按以下顺序执行：

1. 再次检查 `git status --short`。
2. 确认 `.env`、密钥、token、构建产物和 IDE 文件没有进入待提交列表。
3. 运行后端和前端验证。
4. 将确认安全的项目文件加入暂存区。
5. 检查暂存区内容。
6. 创建第一次工程骨架提交。

执行命令：

```bash
git add .
git status --short
git diff --cached --stat
git diff --cached --check
git commit -m "chore: establish project foundation"
```

执行前已完成敏感信息检查，并在创建提交前检查了暂存区。提交没有包含 `.env`、IDE 文件、依赖目录、构建产物或测试报告。

## 8. 后续 GitHub 步骤

下一步是单独创建 GitHub 私有仓库并连接远程地址。建议先使用私有仓库，等 provider 条款、数据声明和公开文档稳定后，再决定是否公开。

连接远程仓库前需要确认：

- GitHub 仓库名称和所有者
- 仓库可见性
- 当前 Git 身份是否正确
- 是否使用 SSH 或 HTTPS
- 首次提交是否已经通过测试

本阶段不会自动创建 GitHub 仓库，也不会自动推送代码。
