FROM node:22-alpine AS build
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./

RUN corepack enable && pnpm install --frozen-lockfile --unsafe-perm
    
COPY . .

EXPOSE 3000
CMD ["node", "index.js"]
