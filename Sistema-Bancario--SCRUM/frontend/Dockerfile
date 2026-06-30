FROM node:22-alpine AS build
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && \
    pnpm config set auto-install-peers true && \
    pnpm install --frozen-lockfile --unsafe-perm --config.ignore-scripts=false --approve-builds

COPY . .

ARG VITE_API_AUTH_URL=http://localhost:5025/api/v1
ARG VITE_API_BANKING_URL=http://localhost:3000/SistemaBancarioAdmin/v1
ENV VITE_API_AUTH_URL=$VITE_API_AUTH_URL
ENV VITE_API_BANKING_URL=$VITE_API_BANKING_URL

RUN pnpm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
