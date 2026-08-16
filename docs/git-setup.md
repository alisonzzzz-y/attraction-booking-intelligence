# Git 初始化与首次提交步骤

## 1. 目的

本文件记录项目的 Git 初始化过程，以及创建第一次工程骨架提交前需要完成的检查。

本地仓库初始化、工程骨架基线提交和 GitHub 私有仓库连接已经完成。

## 2. 当前状态

- Git 仓库：已初始化
- 默认分支：`main`
- 首次提交：已创建工程骨架基线提交
- GitHub 远程仓库：已连接到 `origin`
- GitHub 可见性：Private
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

## 8. GitHub 私有仓库

项目已经创建并连接到以下 GitHub 私有仓库：

```text
https://github.com/alisonzzzz-y/attraction-booking-intelligence
```

创建前已确认：

- GitHub 仓库名称和所有者
- 仓库可见性
- 当前 Git 身份是否正确
- 使用 HTTPS 进行 Git 操作
- 首次提交是否已经通过测试

执行命令：

```bash
gh repo create attraction-booking-intelligence --private --source=. --remote=origin --push
```

该命令完成了以下操作：

1. 在当前 GitHub 账号下创建私有仓库。
2. 将远程地址保存为 `origin`。
3. 推送本地 `main` 分支。
4. 将本地 `main` 设置为跟踪 `origin/main`。

验证命令：

```bash
git remote -v
git status -sb
gh repo view --json nameWithOwner,visibility,url,defaultBranchRef
```

验证结果确认仓库为 Private，默认分支为 `main`，本地分支正在跟踪 `origin/main`。

## 9. GitHub Actions 验证

推送 `main` 后，GitHub Actions 自动运行 `.github/workflows/ci.yml`。

检查命令：

```bash
gh run list --workflow CI --limit 5
gh run watch <run-id> --exit-status
```

验证结果：

- Frontend job：通过
- Backend job：通过
- CI 总结论：通过

GitHub 给出了 Action 运行时版本的弃用警告，包括 `setup-java@v4`。这些警告没有导致本次 CI 失败，但应作为独立维护任务升级 Action 版本，并在升级后重新验证 CI。
