# 青云修仙 · 设定文档

文字修仙小游戏（Taro 4 + Vue3 + Pinia）的设定与图鉴整理，数据来源于当前工程 `src/constants`。

## 文档索引

| 文档 | 内容 |
|------|------|
| [设定总览](./设定总览.md) | 世界观、技术栈、页面结构、核心循环 |
| [境界与修炼](./境界与修炼.md) | 十大境界、阶段、灵根、突破 |
| [玩法系统](./玩法系统.md) | 历练、任务、矿洞、药园、器阁、丹阁等 |
| [秘境设定](./秘境设定.md) | 秘境地点、危险度、掉落与收益 |
| [宗门设定](./宗门设定.md) | 四宗、设施、青云人物名录 |
| [功法设定](./功法设定.md) | 功法阁 42 部目录与贡献价（同时仅修习一门） |
| [法术设定](./法术设定.md) | 功法阁 50 门法术（可同时多门） |
| [人物设定](./人物设定.md) | 宗门人物 + 历练偶遇 NPC |
| [任务设定](./任务设定.md) | 任务堂规则、每日/悬赏/周常/奇遇 |
| [法宝设定](./法宝设定.md) | 四类法宝、六阶品阶、器阁目录 |
| [丹药设定](./丹药设定.md) | 丹阁目录、类型、炼制配方 |
| [图鉴-矿石](./图鉴-矿石.md) | 矿石品阶与名录 |
| [图鉴-药材](./图鉴-药材.md) | 药材品阶与名录 |
| [图鉴-灵兽](./图鉴-灵兽.md) | 灵宠 ∪ 妖兽合并图鉴 |

## 数据源

- 时间：`src/constants/game-time.ts`（6 小时 = 1 天元日；农历风格天元日历）
- 境界：`src/constants/realm.ts`
- 法宝：`src/constants/treasure.ts` / `treasure-catalog.ts`
- 矿石：`src/constants/ore-catalog.ts`
- 药材：`src/constants/herb-catalog.ts`
- 丹药：`src/constants/pill-catalog.ts` / `herb-catalog.ts`（配方）
- 灵兽：`src/constants/beast-catalog.ts`（妖兽）+ `pet-catalog.ts`（兽阁灵宠）
- 宗门：`src/constants/sects.ts` / `member-catalog.ts`
- 人物：`src/constants/member-catalog.ts` / `adventure-npc-catalog.ts`
- 功法：`src/constants/technique-catalog.ts`
- 法术：`src/constants/spell-catalog.ts` / `spell-proficiency.ts`（熟练度六阶）
- 修炼速度：`src/constants/practice-speed.ts`（悟性 / 根骨）
- 秘境：`src/constants/adventure-locations.ts`
- 任务：`src/constants/mission-catalog.ts`

图鉴图标资源位于 `src/assets/{ores,herbs,beasts,pets}/icons/`，切片脚本见 `scripts/slice-*-icons.mjs`。

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
```
