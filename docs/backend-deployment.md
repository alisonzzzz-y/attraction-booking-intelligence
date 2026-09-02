# Backend deployment guide

This guide deploys the Spring Boot API to Render, MySQL to Railway, and the React frontend to Vercel. It does not publish a provider key or database password in the frontend or repository.

中文说明：本指南把 Spring Boot API 部署到 Render，MySQL 数据库部署到 Railway，React 前端继续使用 Vercel。任何 Google Places、Viator key 或数据库密码只放在平台环境变量中，不会进入前端或 Git 仓库。

## 1. What this deployment contains

- A Render Docker Web Service built from `backend/Dockerfile`.
- A Railway MySQL database for Spring Boot JDBC and Flyway startup checks.
- The existing Vercel frontend, configured with the public backend URL only.

中文说明：部署由一个 Render Docker Web Service、一个 Railway MySQL 数据库和 Vercel 前端组成。Vercel 只接收公开的后端 URL，不接收服务端 key。

## 2. Create the Render resources

Create these resources:

1. In Railway, create a MySQL database named `attraction-booking-db`.
2. In Render, create a Web Service from `alisonzzzz-y/attraction-booking-intelligence`.

For the Web Service, use:

| Render field | Value |
| --- | --- |
| Language | `Docker` |
| Root Directory | `backend` |
| Dockerfile Path | `./Dockerfile` |
| Branch | `main` |
| Health Check Path | `/actuator/health` |

Choose a service name such as `attraction-booking-api`. Render will then give it a public URL such as `https://attraction-booking-api.onrender.com`.

中文说明：先在 Railway 创建 MySQL，再在 Render 创建 Key Value 和 Web Service。Web Service 选择 Docker，根目录填写 `backend`，健康检查路径填写 `/actuator/health`。实际服务名称可自行选择。

## 3. Add backend environment variables

Open the Render Web Service, choose **Environment**, then add the following variables. Copy the public MySQL connection details from Railway and the internal Key Value URL from Render. Do not upload the local `.env` file or commit it.

| Variable | Value |
| --- | --- |
| `APP_MYSQL_JDBC_URL` | `jdbc:mysql://<Railway-host>:<port>/<database>?useSSL=true&requireSSL=true` |
| `APP_MYSQL_USER` | MySQL username from Railway |
| `APP_MYSQL_PASSWORD` | MySQL password from Railway |
| `CORS_ALLOWED_ORIGINS` | `https://attraction-booking-intelligence.vercel.app,http://localhost:5173` |
| `GOOGLE_PLACES_API_ENABLED` | `true` |
| `GOOGLE_PLACES_API_KEY` | Your server-side Places API key |
| `VIATOR_API_ENABLED` | `false` for the current public MVP |

Do not set `GOOGLE_PLACES_API_KEY` or `VIATOR_API_KEY` in Vercel. They are server secrets and belong only in Render. `VITE_GOOGLE_MAPS_API_KEY` is different: it is a restricted browser key, so it must be configured in Vercel for the deployed frontend. It is intentionally visible to the browser, but it must be restricted to the approved site domains in Google Cloud.

中文说明：在 Render Web Service 的 **Environment** 页面配置变量。`APP_MYSQL_JDBC_URL` 必须以 `jdbc:mysql://` 开头，并使用 Railway MySQL 的 Public Networking 主机、端口和数据库名。Viator 目前仍是 Sandbox，因此公开后端先保持关闭。Google Places server key 只能放 Render，绝不能填写到 Vercel。浏览器地图 key 则需要单独放到 Vercel，并限制为你的站点域名。

## 4. First backend deployment check

After the first deploy is marked live, open:

```text
https://<your-render-service>.onrender.com/actuator/health
```

It should return JSON with `"status":"UP"`. Then test:

```text
https://<your-render-service>.onrender.com/api/v1/rome/booking-priorities?stayStartDate=2026-09-10&stayEndDate=2026-09-12
```

中文说明：Render 显示 live 后，先访问 health URL，确认返回 `status: UP`。随后测试 Booking Priority 接口。此接口只使用已核对的官方规则，不依赖 Viator Sandbox。

## 5. Connect Vercel to the deployed backend

In the Vercel project for this repository, add this Production environment variable:

| Variable | Value |
| --- | --- |
| `VITE_API_BASE_URL` | `https://<your-render-service>.onrender.com` |

Also add `VITE_GOOGLE_MAPS_API_KEY` in Vercel. Use the same restricted browser Maps key that works in `frontend/.env.local`, then redeploy Vercel after saving both variables. In Google Cloud, the key must allow `https://attraction-booking-intelligence.vercel.app/*`. If you test a preview URL, add that exact preview host too.

中文说明：在 Vercel 配置公开的 `VITE_API_BASE_URL`，值为 Render 后端 URL。同时配置 `VITE_GOOGLE_MAPS_API_KEY`，它应使用本机前端已经能显示地图的同一个 browser key。不要把 Render 的 Google Places server key 填到这里。然后在 Google Cloud 为 browser key 加上生产域名 `https://attraction-booking-intelligence.vercel.app/*`，最后重新部署前端。

## 6. Final end-to-end check

1. Open the Vercel URL in an incognito window.
2. Go to **Plan Rome** and choose dates.
3. Confirm Booking Priority cards load.
4. Click a card and confirm the map focuses the attraction.
5. Open details and confirm the official booking button works.
6. Confirm browser developer tools do not contain a Google Places server key or Viator key.

中文说明：最后用无痕窗口检查完整流程。重点确认：结果卡、地图联动、详情和官网按钮都可用，同时浏览器代码和 Network 请求中没有服务端 key。
