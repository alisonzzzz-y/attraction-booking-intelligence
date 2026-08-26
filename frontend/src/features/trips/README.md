# Browser-local trip state

The MVP stores favourite attraction identifiers and one saved Rome trip in versioned `localStorage`. The saved record contains the city, exact or flexible date mode, date range, attraction identifiers, and save time.

This is not an account or cloud-sync feature. Provider facts are deliberately excluded so reopening a trip requests current evidence instead of presenting cached ticket data as current truth.

中文说明：MVP 会在版本化的 `localStorage` 中保存收藏景点 ID 和一份 Rome 行程。保存内容包括城市、确定或灵活日期模式、日期范围、景点 ID 和保存时间。

这不是账号或云同步功能。Provider 事实不会写进保存记录，重新打开行程时会重新请求证据，避免把旧票务数据描述成当前事实。
