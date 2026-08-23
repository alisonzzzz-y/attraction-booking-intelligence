# Rome MVP Attraction Catalogue

状态：Google Places 映射 v0.1
核对时间：2026-08-19T06:52:53Z
数据环境：Google Places API (New)

## 1. 文档目的

本文档记录 Rome MVP 的内部景点清单与 Google Place ID 映射。它不是票务目录，也不包含实时价格、余票、开放状态或预约结论。

Google Places Text Search 返回的候选已根据名称、城市和地址人工核对。10 个产品景点项对应 13 个 Google 地点实体，其中两个产品项是规划组合。

## 2. 产品景点清单

| 内部景点标识 | English name | 中文名称 | Google 实体数量 |
| --- | --- | --- | ---: |
| `colosseum-archaeological-park` | Colosseum, Roman Forum and Palatine Hill | 罗马斗兽场、古罗马广场和帕拉蒂尼山 | 3 |
| `vatican-museums-sistine-chapel` | Vatican Museums and Sistine Chapel | 梵蒂冈博物馆和西斯廷教堂 | 2 |
| `st-peters-basilica` | St. Peter's Basilica | 圣彼得大教堂 | 1 |
| `pantheon` | Pantheon | 万神殿 | 1 |
| `borghese-gallery` | Borghese Gallery | 博尔盖塞美术馆 | 1 |
| `castel-sant-angelo` | Castel Sant'Angelo | 圣天使堡 | 1 |
| `capitoline-museums` | Capitoline Museums | 卡比托利欧博物馆 | 1 |
| `baths-of-caracalla` | Baths of Caracalla | 卡拉卡拉浴场 | 1 |
| `domus-aurea` | Domus Aurea | 尼禄金宫 | 1 |
| `trevi-fountain` | Trevi Fountain | 特莱维喷泉（许愿池） | 1 |

## 3. Google Place ID 映射

| 内部景点标识 | 组件标识 | Google 返回名称 | Google Place ID |
| --- | --- | --- | --- |
| `colosseum-archaeological-park` | `colosseum` | Colosseum | `ChIJrRMgU7ZhLxMRxAOFkC7I8Sg` |
| `colosseum-archaeological-park` | `roman-forum` | Roman Forum | `ChIJ782pg7NhLxMR5n3swAdAkfo` |
| `colosseum-archaeological-park` | `palatine-hill` | Palatine Hill | `ChIJowJff7VhLxMRLmHQKoSniFE` |
| `vatican-museums-sistine-chapel` | `vatican-museums` | Vatican Museums | `ChIJKcGbg2NgLxMRthZkUqDs4M8` |
| `vatican-museums-sistine-chapel` | `sistine-chapel` | Sistine Chapel | `ChIJ268jxWVgLxMRIj61f4fIFqs` |
| `st-peters-basilica` | `st-peters-basilica` | Saint Peter's Basilica | `ChIJWZsUt2FgLxMRg1KHzXfwS3I` |
| `pantheon` | `pantheon` | Pantheon | `ChIJqUCGZ09gLxMRLM42IPpl0co` |
| `borghese-gallery` | `borghese-gallery` | Galleria Borghese | `ChIJq-bXVgRhLxMRv3vgOXaktBs` |
| `castel-sant-angelo` | `castel-sant-angelo` | Castel Sant'Angelo | `ChIJ0aTnEYeKJRMRiUF95xwRbDY` |
| `capitoline-museums` | `capitoline-museums` | Capitoline Museums | `ChIJ8-wGeU9gLxMR--zJtnpGod4` |
| `baths-of-caracalla` | `baths-of-caracalla` | Baths of Caracalla | `ChIJ1YU-M85hLxMR3Jhb6gZAK2o` |
| `domus-aurea` | `domus-aurea` | Domus Aurea | `ChIJp-3oaLdhLxMRS_bYIp1GB8w` |
| `trevi-fountain` | `trevi-fountain` | Trevi Fountain | `ChIJ1UCDJ1NgLxMRtrsCzOHxdvY` |

## 4. 数据边界

- Place ID 是外部映射，不是内部景点主键。
- 两个规划组合必须保留组件级映射，不能把三个或两个地点伪装成一个 Google Place。
- 地址、坐标、评分、开放时间、business status 和 Google Maps URI 在运行时使用精确 FieldMask 获取，不在本文件中长期保存。
- Google Places 数据不是票务数据，不能据此生成价格、余票或预约紧迫度。
- Place ID 需要定期重新核对；超过 12 个月时优先刷新。
- Viator 或其他票务 Provider 的产品映射单独维护，不能根据名称自动假设对应关系。

## 5. 核对方法

候选通过项目脚本 [`../scripts/fetch-rome-place-candidates.sh`](../scripts/fetch-rome-place-candidates.sh) 使用 Places API (New) Text Search 获取。脚本只请求候选核对需要的 Place ID、名称、地址和坐标，并在临时文件中记录获取时间。

本次 13 个查询的第一候选均与目标地点的名称、城市和地址一致，没有发现需要人工二选一的歧义结果。
