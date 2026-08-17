# 文字修仙 · 设定文档

文字修仙小游戏（Taro 4 + Vue3 + Pinia）的设定与图鉴整理，数据来源于当前工程 `src/constants`。

> **维护约定**：凡新增或调整玩法 / 数值 / 规则，必须同步更新本目录对应文档；细则表写在文档中，不必堆在页面 UI。项目规则见 `.cursor/rules/docs-sync.mdc`。

## 文档索引

| 文档 | 内容 |
|------|------|
| [设定总览](./设定总览.md) | 世界观、技术栈、页面结构、核心循环 |
| [待完善功能](./待完善功能.md) | 已规划未落地 / 部分落地清单（排期用） |
| [境界与修炼](./境界与修炼.md) | 无修为～飞升、阶段、灵根、突破 |
| [玩法系统](./玩法系统.md) | 历练、任务、矿洞、药园、器阁、丹阁等 |
| [秘境设定](./秘境设定.md) | 秘境地点、危险度、掉落与收益 |
| [历练对战掉落](./历练对战掉落.md) | 历练战斗/探索掉落总览（妖兽材料、人物法宝丹药、探索矿药） |
| [历练妖兽掉落](./历练妖兽掉落.md) | 击杀妖兽可能掉落的材料总表 |
| [历练奇遇掉落](./历练奇遇掉落.md) | 了结奇遇可能掉落的材料（可待补充） |
| [奇遇设定](./奇遇设定.md) | 历练奇遇名录与触发规则（不进任务堂） |
| [宗门设定](./宗门设定.md) | 势力等级、派系、四宗、设施、青云人物名录 |
| [功法设定](./功法设定.md) | 功法阁 82 部；九种灵根属性、派系可见与贡献价（同时仅修习一门） |
| [法术设定](./法术设定.md) | 功法阁 52 门法术；九种灵根属性（可同时多门） |
| [宗门人物](./宗门人物.md) | 四宗人物索引与规则 |
| [宗门人物-青云宗](./宗门人物-青云宗.md) | 青云宗名录 |
| [宗门人物-天魔宗](./宗门人物-天魔宗.md) | 天魔宗名录 |
| [宗门人物-万剑宗](./宗门人物-万剑宗.md) | 万剑宗名录 |
| [宗门人物-妖族](./宗门人物-妖族.md) | 妖族名录 |
| [历练人物](./历练人物.md) | 秘境偶遇与坊市人物 |
| [任务设定](./任务设定.md) | 任务堂规则；通用 / 特色任务名录 |
| [LLM对话接入](./LLM对话接入.md) | 拜访 LLM 交谈；亲密与结伴/切磋/收礼意愿 |
| [法宝设定](./法宝设定.md) | 四类法宝、六阶品阶、器阁目录 |
| [丹药设定](./丹药设定.md) | 效果八类、丹阁目录、炼制配方 |
| [图鉴-矿石](./图鉴-矿石.md) | 矿石品阶与名录 |
| [图鉴-药材](./图鉴-药材.md) | 药材品阶与名录 |
| [图鉴-材料](./图鉴-材料.md) | 历练妖兽 / 奇遇掉落专属材料 |
| [图鉴-灵兽](./图鉴-灵兽.md) | 灵宠 ∪ 妖兽合并图鉴 |

## 数据源

- 品牌：`src/constants/brand.ts` / `src/assets/brand/logo.png`
- 境界：`src/constants/realm.ts`
- 突破成功率：`src/constants/breakthrough.ts`（含主灵根修正）
- 境界战力范围 / 同境档位 / 本体锚点 / 出战法术·灵兽战力：`src/constants/combat-power.ts`
- 秘境战斗 / 强制交手 / 属性克制 / 交手 preview / 胜负文案 / 同行折算：`src/constants/adventure-battle.ts`
- 法宝：`src/constants/treasure.ts` / `treasure-catalog.ts`
- 矿石：`src/constants/ore-catalog.ts`
- 药材：`src/constants/herb-catalog.ts`
- 历练材料：`src/constants/loot-material-catalog.ts`（妖兽 / 奇遇掉落） / `loot-icons.ts`（头像）
- 丹药：`src/constants/pill-catalog.ts` / `pill-market-rare.ts`（坊市稀有） / `pill-system.ts`（效果方向） / `herb-catalog.ts`（配方） / `market-shop.ts`（刷新） / `pill-icons.ts`（头像）
- 灵兽：`src/constants/beast-catalog.ts`（妖兽）+ `pet-catalog.ts`（兽阁灵宠）
- 宗门：`src/constants/sects.ts` / `sect-facilities.ts`（设施与特色建筑） / `sect-landmark.ts`（镇妖塔·魔窟数值与日限） / `member-catalog.ts` / `sect-stipend.ts` / `sect-rank.ts`（修为晋升） / `roots.ts`（入门身份 / 多灵根判定） / `starter-gifts.ts`（入门特色功法与法术）
- 人物：`src/constants/member-catalog.ts` / `adventure-npc-catalog.ts` / `member-female-names.ts`（默认头像性别推断）
- 亲密 / 双修：`src/constants/intimacy.ts`
- 切磋 / 受伤战力：`src/constants/spar.ts`
- 生死比斗 / 思过崖：`src/constants/sect-duel.ts`
- 功法：`src/constants/technique-catalog.ts`（`attr` 九种；`factionsAccess` 派系可见；`school` 含魔修 / 妖族） / `technique-icons.ts`（头像：通用 atlas + 特色 atlas-special）
- 法术：`src/constants/spell-catalog.ts`（`attr` 九种：金木水火土风冰雷无属性） / `spell-proficiency.ts`（熟练度六阶）
- 修炼速度：`src/constants/practice-speed.ts`（悟性 / 五行灵根亲和）
- 秘境：`src/constants/adventure-locations.ts` / `location-icons.ts`（地点头像）
- 妖兽掉落：`src/constants/beast-catalog.ts`（`drops`）
- 历练对战掉落概率：`src/constants/adventure-battle.ts`（人物法宝/丹药、探索药材/矿石）
- 奇遇掉落：`src/constants/mission-catalog.ts`（奇遇条目 `drops`，可待补充）
- 任务：`src/constants/mission-catalog.ts` / `mission-localize.ts`（按宗门替换设施称呼）
- 坊市招收弟子：`src/constants/recruit-disciple.ts`
- 拜访 LLM 对话网关：`server/`；客户端 `src/constants/chat-api.ts` / `chat-relation.ts` / `src/services/visit-chat.ts`（见 [LLM对话接入](./LLM对话接入.md)）

图鉴图标资源位于 `src/assets/{ores,herbs,beasts,pets,techniques,pills,loot,locations}/icons/`，切片脚本见 `scripts/slice-*-icons.mjs`（功法特色另见 `slice-technique-special-icons.mjs`；历练材料见 `slice-loot-icons.mjs`；历练地点见 `slice-location-icons.mjs`）。运行时经 `*-icon-src.ts` **按需懒加载**，避免首包打入全部 PNG。

重新生成图鉴 / 丹药 / 任务名录：

```bash
node scripts/export-doc-data.mjs
node scripts/gen-docs.mjs
node scripts/export-pill-docs.mjs
node scripts/export-mission-docs.mjs
node scripts/export-people-docs.mjs
node scripts/export-technique-docs.mjs
node scripts/export-spell-docs.mjs
node scripts/export-adventure-docs.mjs
node scripts/export-beast-drop-docs.mjs
node scripts/export-encounter-drop-docs.mjs
node scripts/export-loot-material-docs.mjs
```
