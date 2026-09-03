# Constrained Rome booking explanations

`GET /api/v1/rome/booking-explanation` explains the existing Rome booking order for one validated stay window. It is not an open chat endpoint and it does not accept a traveller-written prompt.

## Safety contract

1. `bookingpriority` calculates the order from the checked official catalogue.
2. `aiexplanation` builds a read-only fact package from that deterministic result.
3. When model mode is enabled, the first model request must call only `get_rome_booking_facts`.
4. The server checks that the tool request is for Rome and exactly matches the selected dates.
5. The server returns only the verified fact package to the model, then asks for a short explanation.
6. The server rejects a model response containing numbers, URLs, prices, availability, inventory, or sell-out claims. It returns a rule-based template instead.

The response always identifies whether `mode` is `MODEL` or `TEMPLATE_FALLBACK`. A model failure never removes the booking order or turns missing data into a ticket conclusion.

## Configuration

Model mode is disabled by default. To enable it on the Spring Boot service only, set these Render secrets:

```text
AI_EXPLANATION_ENABLED=true
OPENAI_API_KEY=your_server_only_key
AI_EXPLANATION_MODEL=gpt-5.6
```

Do not set `OPENAI_API_KEY` in Vercel or any `VITE_*` variable. The browser calls the project backend; it never receives the model key. If the key is absent, the endpoint remains available with `TEMPLATE_FALLBACK`.

## 中文说明

`GET /api/v1/rome/booking-explanation` 会为一个已经验证的 Rome 行程日期窗口解释现有的预约顺序。它不是自由聊天接口，也不会接收用户自己输入的开放式问题。

## 安全契约

1. `bookingpriority` 只根据已经核对的官方目录计算顺序。
2. `aiexplanation` 从这个确定性结果中构建只读事实包。
3. 只有在启用模型模式时，第一次模型请求才必须调用唯一的 `get_rome_booking_facts` 工具。
4. 服务端会确认工具请求的城市是 Rome，并且日期与用户当前选择完全一致。
5. 服务端只把经过验证的事实包返回给模型，然后要求它生成简短解释。
6. 模型输出只要包含数字、网址、价格、余票、库存或售罄判断，服务端就会拒绝该输出，并返回规则化模板说明。

响应会明确标注 `mode` 是 `MODEL` 还是 `TEMPLATE_FALLBACK`。模型失败不会让预约顺序消失，也不会把缺失数据变成票务结论。

## 配置

模型模式默认关闭。如需启用，只在 Spring Boot 的 Render 服务端设置以下 secret：

```text
AI_EXPLANATION_ENABLED=true
OPENAI_API_KEY=your_server_only_key
AI_EXPLANATION_MODEL=gpt-5.6
```

不要在 Vercel 或任何 `VITE_*` 变量中设置 `OPENAI_API_KEY`。浏览器只会调用本项目后端，永远不会获得模型密钥。如果未配置该密钥，接口仍可用，但会返回 `TEMPLATE_FALLBACK`。
