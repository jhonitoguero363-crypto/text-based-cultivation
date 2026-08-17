# 拜访对话网关

Express 服务，默认 `http://127.0.0.1:8787`。

## 本地

```bash
cp .env.example .env   # 填写 LLM_API_KEY
npm install
npm run dev
```

- `GET /v1/health`
- `POST /v1/chat/visit`

## 与 H5 同镜像部署

见仓库根目录 `Dockerfile` 与 `docs/LLM对话接入.md`「腾讯云 Docker 部署」。容器内由 nginx 反代 `/v1`；密钥用运行时环境变量注入。
