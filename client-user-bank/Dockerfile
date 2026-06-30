FROM node:22-alpine
WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc ./
RUN corepack enable && \
    corepack prepare pnpm@10.29.3 --activate && \
    pnpm install --frozen-lockfile

COPY . .

EXPOSE 8081
CMD ["npx", "expo", "start", "--web", "--host", "lan"]
