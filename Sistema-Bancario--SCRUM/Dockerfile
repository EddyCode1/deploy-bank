FROM node:22-alpine AS build
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./

RUN corepack enable && \
    corepack prepare pnpm@10.29.3 --activate && \
    pnpm install --frozen-lockfile

COPY . .

EXPOSE 3000
CMD ["node", "index.js"]
