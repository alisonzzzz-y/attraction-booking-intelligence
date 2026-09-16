# 结果页渐进拆分方案

状态：方案，尚未执行完整组件拆分。本轮已将共用日期校验放入 `features/trips/tripDates.ts`。

## 目标

保留当前页面布局和用户操作，用职责边界降低修改风险。四层分层只约束后端，前端采用页面、组件、状态逻辑和纯函数的组织方式。

## 建议文件与职责

| 文件 | 职责 |
| --- | --- |
| `app/ResultsPage.tsx` | 读取行程、组合查询状态、排列页面、协调地图选中项和详情弹窗 |
| `features/attractions/AttractionCard.tsx` | 显示单个景点摘要，透传查看详情、收藏和地图选中事件 |
| `features/attractions/AttractionDetailsDialog.tsx` | 弹窗生命周期、焦点恢复、关闭操作和详情布局 |
| `features/attractions/AttractionPhotoGallery.tsx` | 图片切换、缩略图、计数与图片署名 |
| `features/attractions/AttractionEvidenceDetails.tsx` | 官方规则、地图事实和 Sandbox 票务证据 |
| `features/attractions/useRomeResults.ts` | 三类独立查询、状态汇总、景点合并与排序，保留部分失败结果 |
| `features/trips/useTripSelection.ts` | 行程恢复、收藏切换、保存反馈，集中管理持久化副作用 |
| `features/attractions/resultPresentation.ts` | 价格、来源时间和状态文案等无副作用格式化函数 |

## 实施顺序与验收

1. 先提取图片轮播和卡片。这两部分边界清楚，只接收数据和回调。验证左右切换、缩略图、署名链接、收藏按钮和地图选中行为。
2. 再提取详情弹窗和证据区。验证介绍可见、官方链接、Escape 关闭、焦点恢复以及不同景点之间切换。
3. 最后提取查询和行程状态逻辑。验证任一来源失败仍能显示其他来源，非法 URL 不发请求，恢复行程读取保存快照。
4. 每一步先运行相关组件测试，再在最后执行完整构建和浏览器回归。采用可独立审查的小改动，避免与文案、样式或业务规则变更混合。

不强求文件行数，也不把每个小函数都拆成单独文件。只供一个组件使用的逻辑留在组件旁边；状态由最近的共同父组件持有，避免卡片、地图和弹窗各自复制同一份选中状态。

## 后端结构约定

保留 `controller`、`service`、`repository`、`entity` 四个主包，Service 调用 Repository；Entity 是数据模型，不是额外的请求处理步骤。Provider adapter、外部 client、配置和 DTO 保留辅助包。规模扩大后可在每层下增加业务子包，不需要现在切换架构。

Spring Boot 不强制固定包结构：[官方代码组织说明](https://docs.spring.io/spring-boot/reference/using/structuring-your-code.html)。选择四层是当前项目对可读性和规模的取舍，并不是对所有项目的统一要求。
