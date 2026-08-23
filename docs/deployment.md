# 前端部署记录

最后更新：2026-08-23

## 当前部署

- 平台：Vercel
- 公开地址：<https://attraction-booking-intelligence.vercel.app/>
- 部署来源：GitHub 私有仓库的 `main` 分支
- 自动部署：`main` 分支每次推送都会触发 Vercel production 部署
- 当前更新：本次 Rome MVP 前端改动将在推送后由 Vercel 自动构建和部署

当前部署只包含静态 React 前端。Spring Boot、PostgreSQL 和 Redis 尚未部署，页面也不依赖这些服务才能加载。

## Vercel 配置

| 配置项 | 值 |
| --- | --- |
| Framework Preset | Vite |
| Root Directory | `frontend` |
| Build Command | `npm run build`（Vercel 自动识别） |
| Output Directory | `dist` |
| Install Command | `npm install`（Vercel 自动识别） |
| Environment Variables | 前端如显示 Google Map，需要单独配置受 HTTP referrer 限制的浏览器 key；不得配置服务端 secret |

`frontend/vercel.json` 将所有路径重写到 `index.html`，因此 React Router 的深层路由可以由静态托管服务处理。

## 验证状态

- [x] Vercel production 自动部署已经配置。
- [x] 已获得稳定 HTTPS 地址。
- [x] 2026-08-23 本地后端 `./mvnw verify` 通过，共 33 个测试。
- [x] 2026-08-23 前端 lint、format check、13 个单元测试、production build 和 7 个 Playwright 测试通过。
- [ ] 本次提交推送后，在 Vercel 或 GitHub 确认新的 production deployment 状态。
- [ ] 从独立网络完成线上主要页面、深层路由刷新和控制台 smoke test。

只有在 Vercel 或 GitHub 明确显示新提交部署成功，并完成线上 smoke test 后，才把本次发布记录为已验证上线。

## 更新方式

以后推送到 GitHub `main` 分支的前端改动会触发 Vercel 自动部署。部署前仍应运行：

```bash
cd frontend
npm run lint
npm run format:check
npm run test
npm run build
npm run test:e2e
```

前端环境变量中不得加入数据库密码、Provider API key 或其他服务端 secret。未来部署后端时，应使用独立的服务端 secret 配置。
