# ADR 0005: Rome MVP data ownership and catalogue expansion

**Status:** Accepted

## Decision

The Rome MVP keeps its current ten verified attractions visible without a pagination control. If the catalogue grows beyond ten attractions, the results page initially shows ten and then reveals up to eight more per user action. The control disappears after every attraction is visible.

Rome MVP 当前的 10 个已核对景点会完整显示，不会出现分页按钮。如果景点目录未来超过 10 个，结果页先显示 10 个，用户每次操作后最多再显示 8 个。所有景点都显示后，按钮会消失。

## Data ownership boundaries

The application keeps five kinds of data separate:

1. **Attraction catalogue:** Curated attraction names, short introductions, coordinates and official booking links.
2. **Official ticket rules:** Verified facts such as ticket coverage, timed-entry requirements and opening rules.
3. **Provider products:** Provider-specific options, prices, links and source metadata from Viator or a future provider.
4. **User behaviour:** Favourites, outbound-click events and saved trips. The MVP stores favourites and saved trips locally in the browser.
5. **Transactions:** Future booking or conversion records. These do not exist in the MVP and must not be inferred from provider data or user clicks.

系统将以下五类数据严格分开：

1. **景点目录：** 人工整理的景点名称、简短介绍、坐标和官网购票链接。
2. **官方票务规则：** 已经核对的联票范围、预约要求和开放规则等事实。
3. **Provider 产品：** Viator 或未来 provider 提供的票型、价格、链接和来源元数据。
4. **用户行为：** 收藏、外链点击和保存行程。MVP 目前仅在浏览器本地保存收藏和行程。
5. **交易记录：** 未来真实的预订或转化记录。MVP 不存在交易记录，也不得从 provider 数据或用户点击中推断交易。

## Consequences

The UI can expand its catalogue without making current Rome data appear incomplete. Provider failures remain isolated from official evidence. Future providers must enter through the existing adapter boundary, and future transaction data requires an explicit booking or conversion integration.

这样既可以在不让现有 Rome 数据看起来不完整的前提下扩展目录，也能保持 provider 故障与官方事实互相隔离。未来 provider 必须通过现有 adapter 边界接入，未来交易数据必须来自明确的预订或转化集成。
