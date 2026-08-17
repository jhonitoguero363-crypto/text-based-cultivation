# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# 正式 H5 同域访问 /v1/*（由容器内 nginx 反代到对话网关）
ENV NODE_ENV=production
ENV TARO_APP_CHAT_API_BASE_URL=
ENV TARO_APP_CHAT_GATEWAY_TOKEN=
RUN npm run build:h5

FROM node:22-bookworm-slim AS server-deps
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

FROM node:22-bookworm-slim AS runner
RUN apt-get update \
  && apt-get install -y --no-install-recommends nginx gettext-base \
  && rm -rf /var/lib/apt/lists/* \
  && rm -f /etc/nginx/sites-enabled/default /etc/nginx/conf.d/default.conf

WORKDIR /app

COPY --from=server-deps /app/server/node_modules ./server/node_modules
COPY server/package.json ./server/package.json
COPY server/src ./server/src

COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY docker/nginx-entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

COPY --from=build /app/dist /usr/share/nginx/html

# 与 TCR_* 一样由 GitHub Actions secrets 在构建时注入（见 workflow build-args）
ARG LLM_API_KEY=
ARG LLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4
ARG LLM_MODEL=glm-4-flash
ARG GATEWAY_TOKEN=

ENV NODE_ENV=production
ENV PORT=8001
ENV CHAT_INTERNAL_PORT=8787
ENV LLM_API_KEY=$LLM_API_KEY
ENV LLM_BASE_URL=$LLM_BASE_URL
ENV LLM_MODEL=$LLM_MODEL
ENV GATEWAY_TOKEN=$GATEWAY_TOKEN
ENV DAILY_LIMIT=30
EXPOSE 8001

ENTRYPOINT ["/entrypoint.sh"]
