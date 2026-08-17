# 前端部署记录

最后更新：2026-08-18

## 当前部署

- 平台：Vercel
- 公开地址：<https://attraction-booking-intelligence.vercel.app/>
- 部署来源：GitHub 私有仓库的 `main` 分支
- Vercel 状态：部署完成，GitHub commit status 为 `success`
- 部署提交：`fc226cd chore: configure Vercel SPA deployment`

当前部署只包含静态 React 前端。Spring Boot、PostgreSQL 和 Redis 尚未部署，页面也不依赖这些服务才能加载。

## Vercel 配置

| 配置项 | 值 |
| --- | --- |
| Framework Preset | Vite |
| Root Directory | `frontend` |
| Build Command | `npm run build`（Vercel 自动识别） |
| Output Directory | `dist` |
| Install Command | `npm install`（Vercel 自动识别） |
| Environment Variables | 无 |

`frontend/vercel.json` 将所有路径重写到 `index.html`，因此 React Router 的 `/methodology` 深层路由可以由静态托管服务处理。

## 验证状态

- [x] Vercel 已完成生产部署。
- [x] GitHub 上的 Vercel commit status 为 `success`。
- [x] 已获得稳定 HTTPS 地址。
- [x] 本地 production build 和 Playwright 桌面、移动端测试在部署前通过。
- [ ] 从独立网络完成线上首页、`/methodology` 直达、刷新和控制台 smoke test。

Codex 当前运行环境在 2026-08-18 访问 `vercel.app` 时连接超时，因此没有把线上浏览器检查误写为已通过。用户可先在普通浏览器无痕窗口打开首页和 `/methodology`，并在后续网络可用时补充自动化 smoke test。

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
