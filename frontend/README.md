# Frontend application

This Vite and React application contains the public Rome planning MVP. It supports exact or flexible travel dates, Booking Priority results, map focus, attraction favourites, saved trips through the backend API, and evidence dialogs with official and provider sources kept separate.

The frontend creates, reads, and updates saved trips through the Trip API. The `tripId` is kept in the results URL, while ticket facts are requested again when the trip is opened.

Run `npm run dev` for local development. Use `npm run lint`, `npm run format:check`, `npm run test`, and `npm run build` before committing frontend changes. The root `README.md` contains the complete setup and data-accuracy boundaries.

中文说明：这个 Vite 和 React 应用已经包含 Rome 规划 MVP。它支持确定日期或灵活日期范围、Booking Priority 结果、地图定位、景点收藏、通过后端 API 保存行程，以及严格区分官网和 Provider 信息的详情弹窗。

前端通过 Trip API 创建、读取和更新保存的行程。`tripId` 写入结果页 URL，票价、余票等事实会在重新打开行程时再次请求。
