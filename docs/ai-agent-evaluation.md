# AI booking explanation evaluation

## Purpose

This evaluation checks whether the optional model layer stays inside the project's booking-fact boundary. It does not measure general travel-writing quality. Every model response in these tests comes from a local Responses API stub, so the suite uses no API key, makes no external model request, and creates no model cost.

中文说明：这组评估用于检查可选模型层是否遵守项目的票务事实边界，而不是评估一般旅游文案质量。测试中的模型响应全部来自本地 Responses API stub，因此不需要 API key，不会调用外部模型，也不会产生模型费用。

## Evaluation cases

| ID | Behaviour under test | Expected result | Result |
| --- | --- | --- | --- |
| AGENT-EVAL-01 | A valid response calls `get_rome_booking_facts` before answering. | Accept the short explanation and preserve the supplied fact package. | Pass |
| AGENT-EVAL-02 | The model skips the required fact tool. | Reject the model response before a final explanation is requested. | Pass |
| AGENT-EVAL-03 | The tool asks for dates outside the selected booking plan. | Reject the tool request. | Pass |
| AGENT-EVAL-04 | The model introduces a numeric price claim. | Reject the response. | Pass |
| AGENT-EVAL-05 | The model claims live availability. | Reject the response. | Pass |
| AGENT-EVAL-06 | The model claims that a venue is sold out. | Reject the response. | Pass |
| AGENT-EVAL-07 | The model adds an unsupported URL. | Reject the response. | Pass |
| AGENT-EVAL-08 | The model returns no usable text. | Reject the empty response. | Pass |
| AGENT-EVAL-09 | The model endpoint returns an upstream failure. | Convert it to a controlled client error. | Pass |
| AGENT-EVAL-10 | Model mode is disabled. | Return the deterministic template and official facts. | Pass |
| AGENT-EVAL-11 | The client accepts a boundary-safe model response. | Mark the response as `MODEL` and preserve official facts. | Pass |
| AGENT-EVAL-12 | The client rejects an unsafe model response. | Return `TEMPLATE_FALLBACK` without losing official facts. | Pass |
| AGENT-EVAL-13 | The booking-priority query returns no facts. | Stop instead of asking the model to guess. | Pass |

中文说明：13 个评估用例覆盖强制工具调用、城市和日期范围校验、价格与实时余票等越界内容、空响应、上游失败、无模型配置时的安全降级，以及事实为空时禁止模型猜测。所有用例均已通过。

## Recorded verification

Verification date: 8 September 2026.

验证日期：2026 年 9 月 8 日。

| Check | Recorded result |
| --- | --- |
| Agent evaluation tests | 13 passed, 0 failed |
| Complete backend verification | 55 passed, 0 failed, 0 errors, 0 skipped |
| MySQL, Flyway and health integration tests | 6 passed through Testcontainers |
| Frontend ESLint | Passed with 0 errors and 0 warnings |
| Frontend Prettier check | Passed |
| Frontend Vitest suite | 30 passed across 9 test files |
| Frontend production build | Passed |
| Playwright Chromium smoke suite | 7 passed |

中文说明：完整后端验证共通过 55 个测试，其中包括 13 个 Agent evaluation cases 和 6 个基于 Testcontainers 的 MySQL、Flyway 与 health 集成测试。前端 ESLint、Prettier 和 production build 全部通过，Vitest 通过 30 个测试，Playwright Chromium 通过 7 个端到端 smoke tests。

Commands used:

```bash
cd backend
./mvnw verify

cd ../frontend
npm run lint
npm run format:check
npm run test
npm run build
npm run test:e2e
```

中文说明：以上命令可以在本地重复运行。后端完整集成测试需要 Docker Desktop；Playwright 测试会启动一个临时 Vite 服务和 Chromium。

## Interpretation and limits

These results show that the application enforces its deterministic safety contract for the tested failure patterns. They do not prove that every possible model output is safe, and they do not validate production ticket prices or live inventory. Viator remains an authorised Sandbox integration, while model mode remains disabled unless a server-side credential is deliberately configured.

中文说明：这些结果说明应用能够针对已经测试的失败模式执行确定性的安全契约，但不能证明所有可能的模型输出都绝对安全，也不验证 production 票价或实时库存。Viator 仍然是已授权的 Sandbox 集成；只有主动在服务端配置模型凭据后，模型模式才会启用。
