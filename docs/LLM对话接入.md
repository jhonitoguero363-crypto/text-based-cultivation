# LLM 拜访对话接入

独立后端：`server/`。H5 拜访页已接线「交谈」面板，并对白可影响亲密与互动意愿。

## 目标

- 拜访「交谈」走自建网关，转发到便宜/免费的 OpenAI 兼容 API（默认智谱 `glm-4-flash`）。
- API Key 仅存服务端（`server/.env` 或容器环境变量）；超时与失败用句库兜底。
- 模型产出台词 + 结构化效果；**数值由客户端 clamp 后结算**。

## 交谈效果（客户端强制校验）

每轮成功对白（非 fallback）可带：

| 字段 | 范围 | 作用 |
|------|------|------|
| `intimacyDelta` | -3～+5 | 立即改亲密 |
| `invite` | refuse / reluctant / normal / eager | 结伴历练意愿 |
| `spar` | 同上 | 切磋意愿 |
| `gift` | 同上 | 收礼意愿 |

意愿规则：

- **refuse**：对应行动直接拒绝（不可邀请 / 切磋 / 赠礼）
- **reluctant**：可行动，亲密收益约减半（至少 1）
- **normal**：默认收益
- **eager**：该行动亲密收益 +1

意愿按人物本地持久化，并回传给模型作下一轮上下文。fallback 不改意愿、不改亲密。

## 地位与口吻

网关按人物 `group` / 头衔与玩家身份比较（宗主＞长老＞执事＞亲传＞内门＞外门＞杂役）：

- **NPC 更高**：训诫、考校、简慢；玩家失礼更易扣亲密、拒绝结伴/切磋  
- **同辈**：自然往来，可争锋可交好  
- **NPC 更低**：敬称、谦恭、请示；少对上位者无故强硬拒绝  
- **坊市 / 他宗 / 散修**：外宾或疏离口吻，不用本宗上下级乱套  

细则由 `server/src/status.js` 写入 prompt。

## 亲密度与口吻

按亲密档（陌生 / 面善 / 相识 / 熟识 / 亲近 / 莫逆）约束语气与意愿：

- **低亲密**：戒备、客套；结伴/切磋/收礼更易 reluctant～refuse  
- **高亲密**：热络、少客套；意愿更易 normal～eager  
- 与地位同时生效：亲密可软化架子，但不能颠倒基本上下级语气  

细则由 `server/src/intimacy.js` 写入 prompt。

## 敌对派系初始亲密

- **本宗**：态度种子正常（中立约 10、友善约 25 等）  
- **敌对派系**（正道 / 魔门 / 妖族互为敌对）：首次接触种子 ×0.25，且上限 3  
- 同派不同宗（如青云↔万剑）不压低  

客户端：`isHostileIntimacyTarget` / `seedIntimacyFromAttitude(..., { hostile })`（`src/constants/intimacy.ts`）。

## 本地联调

1. **重启网关**（prompt 已改为 JSON）：
   ```bash
   cd server
   npm run dev
   ```
2. 游戏拜访页交谈（`npm run dev:h5`）；面板下方可见「意愿 · 结伴/切磋/收礼」。

默认请求：`src/constants/chat-api.ts` → `http://127.0.0.1:8787`（未设置 `TARO_APP_CHAT_API_BASE_URL` 时）。

## 腾讯云 Docker 部署（与现有 TCR 流程一致）

单镜像：`nginx`（H5 静态）+ 同容器内 Node 对话网关；CI 见 `.github/workflows/docker-image.yml`。

```text
浏览器 → :8001 nginx（腾讯云容器端口）
           ├─ /        → /usr/share/nginx/html（build:h5）
           └─ /v1/*    → 127.0.0.1:8787（server/）
```

### 构建与推送

- push `main` 或手动 `workflow_dispatch` → 推送到 TCR：`text-based-cultivation:latest` / `:${GITHUB_SHA}`
- Dockerfile 构建 H5 时已设 `TARO_APP_CHAT_API_BASE_URL=`，前端请求同域 `/v1/chat/visit`

本地试跑：

```bash
docker build -t text-based-cultivation .
docker run --rm -p 8001:8001 \
  -e LLM_API_KEY=你的智谱Key \
  -e LLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4 \
  -e LLM_MODEL=glm-4-flash \
  -e GATEWAY_TOKEN= \
  -e DAILY_LIMIT=30 \
  text-based-cultivation
```

打开 `http://127.0.0.1:8001`，测拜访交谈；健康检查：`http://127.0.0.1:8001/v1/health`。

### 腾讯云容器环境变量

在容器服务 / 应用中注入（**不要**把 Key 打进镜像）：

| 变量 | 说明 |
|------|------|
| `LLM_API_KEY` | 必填 |
| `LLM_BASE_URL` | 默认智谱 paas v4 |
| `LLM_MODEL` | 如 `glm-4-flash` |
| `GATEWAY_TOKEN` | 可选；若设置，前端构建需同步 `TARO_APP_CHAT_GATEWAY_TOKEN` |
| `DAILY_LIMIT` | 每日上限，默认 30 |
| `PORT` | 对外端口，默认 **8001**（与腾讯云容器端口一致） |
| `CHAT_INTERNAL_PORT` | 网关内部端口，默认 8787 |

对外只映射 **8001**；无需再单独暴露 8787。平台侧容器端口也填 `8001`。

若启用 `GATEWAY_TOKEN`：改 Dockerfile 构建参数或 workflow `build-args` 写入 `TARO_APP_CHAT_GATEWAY_TOKEN`（会进前端包，仅防顺手刷接口，不能当机密）。

## 数据源

- 网关：`server/`（`effects.js` 清洗 JSON）
- 关系常量：`src/constants/chat-relation.ts`
- 请求：`src/services/visit-chat.ts`
- UI：`src/pages/sect/visit.vue`
- 镜像：`Dockerfile` / `nginx.conf` / `docker/nginx-entrypoint.sh`
