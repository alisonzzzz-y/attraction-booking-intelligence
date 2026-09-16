# 结果页渐进拆分方案

状态：已实施。结果页现在保留页面编排与共享选中状态，卡片、轮播、详情、查询、展示转换和行程选择分别维护。

## 目标

保留当前页面布局和用户操作，用职责边界降低修改风险。四层分层只约束后端，前端采用页面、组件、状态逻辑和纯函数的组织方式。

## 建议文件与职责

| 文件                                                 | 职责                                                       |
| ---------------------------------------------------- | ---------------------------------------------------------- |
| `app/ResultsPage.tsx`                                | 读取行程、组合查询状态、排列页面、协调地图选中项和详情弹窗 |
| `features/attractions/AttractionCard.tsx`            | 显示单个景点摘要，透传查看详情、收藏和地图选中事件         |
| `features/attractions/AttractionDetailsDialog.tsx`   | 弹窗生命周期、焦点恢复、关闭操作和详情布局                 |
| `features/attractions/AttractionPhotoGallery.tsx`    | 图片切换、缩略图、计数与图片署名                           |
| `features/attractions/AttractionEvidenceDetails.tsx` | 官方规则、地图事实和 Sandbox 票务证据                      |
| `features/attractions/useRomeResults.ts`             | 三类独立查询、状态汇总、景点合并与排序，保留部分失败结果   |
| `features/trips/useTripSelection.ts`                 | 行程恢复、收藏切换、保存反馈，集中管理持久化副作用         |
| `features/attractions/resultPresentation.ts`         | 价格、来源时间和状态文案等无副作用格式化函数               |

## 已实施的顺序与验收

1. 已提取图片轮播和卡片，两者只接收数据和回调。
2. 已提取详情弹窗和证据区，并恢复关闭后的键盘焦点。
3. 已提取三类并行查询与行程选择状态；结果合并阶段使用按景点 ID 建立的 Map，页面不再为每张卡片重复扫描完整结果集。
4. 现有测试覆盖左右切换、缩略图、署名、收藏、地图选中、详情、部分失败、非法 URL 与保存行程恢复。每次进一步调整仍应运行完整构建和浏览器回归。

不强求文件行数，也不把每个小函数都拆成单独文件。只供一个组件使用的逻辑留在组件旁边；状态由最近的共同父组件持有，避免卡片、地图和弹窗各自复制同一份选中状态。

## 后端结构约定

保留 `controller`、`service`、`repository`、`entity` 四个主包，Service 调用 Repository；Entity 是数据模型，不是额外的请求处理步骤。Provider adapter、外部 client、配置和 DTO 保留辅助包。规模扩大后可在每层下增加业务子包，不需要现在切换架构。

Spring Boot 不强制固定包结构：[官方代码组织说明](https://docs.spring.io/spring-boot/reference/using/structuring-your-code.html)。选择四层是当前项目对可读性和规模的取舍，并不是对所有项目的统一要求。
