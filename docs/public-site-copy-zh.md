# 公开网站英文文案中文对照

最后更新：2026-08-18

本文件用于审阅公开网站的英文文案。网站首版保持英文界面，中文不会同时显示在页面上。

## 全站导航与页脚

- `Home`：首页
- `Methodology`：数据方法
- `Skip to content`：跳到主要内容
- `An independent portfolio project, starting with Rome.`：这是一个从罗马开始的独立作品集项目。
- `Public preview`：公开预览版
- `No live prices or availability are published yet.`：目前尚未发布实时价格或余票信息。

## 首页

### 首屏

- `Rome first. Evidence first.`：先从罗马开始，也始终把证据放在第一位。
- `Plan the attractions that cannot wait.`：先规划那些不能等到最后才决定的景点。
- `A decision tool for independent travellers who need to know what to book early, what can wait, and what the available evidence actually supports.`：这是一个面向自由行旅客的决策工具，帮助用户判断哪些景点需要提前预订，哪些可以稍后决定，以及现有证据究竟能够支持什么结论。
- `See how the data works`：查看数据如何工作
- `View current build`：查看当前版本

### 计划中的决策流程

- `Planned decision flow`：计划中的决策流程
- `Trip context`：行程背景
- `Rome · selected date`：罗马 · 用户选择的日期
- `Evidence`：证据
- `Authorised provider responses`：经过授权的 Provider 响应
- `Decision support`：决策支持
- `Source, freshness, and clear unknowns`：明确显示来源、数据新鲜度和未知状态
- `Workflow preview only. No ticket data is shown.`：这里只展示计划中的流程，不包含任何票务数据。

### 决策步骤

- `A clearer booking decision`：让预订决策更清楚
- `One question, supported by visible evidence.`：围绕一个明确问题，用可见证据支持答案。
- `The product is designed around the decision a traveller needs to make, not around a wall of unexplained listings.`：产品围绕旅客真正需要做出的决定来设计，而不是堆积大量缺乏解释的产品列表。
- `Start with the trip`：先从行程出发
- `Choose a city and travel date before looking at individual ticket options.`：先选择城市和旅行日期，再查看具体票务选项。
- `Check authorised sources`：查询经过授权的数据源
- `Keep each provider response tied to its source, retrieval time, and permitted use.`：每条 Provider 响应都保留来源、获取时间和允许使用的范围。
- `Make uncertainty visible`：让不确定性清楚可见
- `Separate unavailable, stale, and failed responses instead of turning them into a false answer.`：区分不可用、过期和请求失败，不把它们转换成错误的确定答案。

### 数据与当前状态

- `Built to keep facts and guesses apart.`：从设计上把事实和猜测分开。
- `Every ticket fact keeps its provider and retrieval time.`：每条票务事实都保留 Provider 和获取时间。
- `A failed request is not treated as a sold-out attraction.`：请求失败不会被当作景点售罄。
- `AI may explain verified facts, but it cannot create them.`：AI 可以解释已经确认的事实，但不能创造事实。
- `The public product preview is in progress.`：公开产品预览版正在开发中。
- `Pre-API phase`：API 接入前阶段
- `Available now`：当前已经具备
- `A tested full-stack foundation, public product explanation, and a documented approach to provider data.`：经过测试的全栈地基、公开产品说明，以及有文档记录的 Provider 数据处理方法。
- `Not published yet`：尚未发布
- `Attraction search, prices, availability, booking links, and AI explanations remain unavailable until authorised access is tested.`：在经过授权的访问权限得到实际验证前，景点搜索、价格、余票、购买链接和 AI 解释均不会开放。

## Methodology 页面

- `A ticket fact needs evidence, context, and a clock.`：一条票务事实必须同时具备证据、上下文和时间信息。
- `This project is being designed to explain what an authorised source returned without hiding uncertainty or filling gaps with generated text.`：本项目旨在准确解释授权数据源返回的内容，不隐藏不确定性，也不使用生成文本填补数据空白。
- `What will count as a publishable fact?`：什么样的信息才可以作为事实发布？
- `Traceable source`：可追踪的数据源
- `Defined meaning`：含义经过确认
- `Permitted use`：在授权范围内使用
- `Unknown must remain different from sold out.`：未知必须始终与售罄保持区别。
- `Verified`：已确认
- `Unavailable`：数据源明确表示不可用
- `Unknown`：数据不足，无法确认
- `Stale`：数据超过允许的新鲜度范围
- `Request failed`：Provider 请求失败
- `Explanation comes after the facts.`：先有事实，再进行解释。
- `AI may later turn verified fields and deterministic booking rules into a clearer explanation. It will not generate prices, remaining tickets, cancellation rules, or booking priority facts.`：未来 AI 可以把已经确认的字段和确定性预订规则整理成更清楚的解释，但不能生成价格、剩余票量、取消规则或预订优先级事实。
- `Foundation tested. Provider access not yet connected.`：工程地基已经通过测试，Provider 权限尚未接入。
