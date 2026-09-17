# Trip persistence

The trip feature sends the date plan and selected attraction identifiers to the backend Trip API. The results URL carries the returned `tripId`, which lets the frontend retrieve the saved trip when the link is reopened.

Provider facts are deliberately excluded from saved trips. Reopening a trip requests current evidence instead of presenting cached ticket data as current truth.

中文说明：行程功能会把日期计划和已选择的景点 ID 发送到后端 Trip API。结果页 URL 包含后端返回的 `tripId`，重新打开链接时前端会据此读取保存的行程。

Provider 事实不会写进保存记录。重新打开行程时会重新请求证据，避免把旧票务数据描述成当前事实。
