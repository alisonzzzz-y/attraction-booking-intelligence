# Frontend application

This Vite and React application contains the public Rome planning MVP. It supports exact or flexible travel dates, Booking Priority results, map focus, attraction favourites, a browser-local saved trip, and evidence dialogs with official and provider sources kept separate.

Favourites and the saved trip use versioned `localStorage`. They are available only in the current browser and are not synchronised to an account. Ticket facts are not stored as saved-trip truth and are requested again when the results page is opened.

Run `npm run dev` for local development. Use `npm run lint`, `npm run format:check`, `npm run test`, and `npm run build` before committing frontend changes. The root `README.md` contains the complete setup and data-accuracy boundaries.

中文说明：这个 Vite 和 React 应用已经包含 Rome 规划 MVP。它支持确定日期或灵活日期范围、Booking Priority 结果、地图定位、景点收藏、浏览器本地保存行程，以及严格区分官网和 Provider 信息的详情弹窗。

收藏和保存行程使用版本化的 `localStorage`，只存在于当前浏览器，不会同步到账号。票价、余票等事实不会作为保存行程的一部分长期缓存，重新打开结果页时会再次请求。
