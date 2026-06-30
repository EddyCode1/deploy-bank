FROM node:22-alpine
WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc ./
RUN corepack enable && \
    pnpm config set auto-install-peers true && \
    pnpm install --frozen-lockfile --unsafe-perm --config.ignore-scripts=false --approve-builds

COPY . .

EXPOSE 8081
CMD ["npx", "expo", "start", "--web"]
