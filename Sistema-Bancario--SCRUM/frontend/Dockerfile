FROM node:22-alpine AS build
WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc ./
RUN corepack enable && \
    corepack prepare pnpm@10.29.3 --activate && \
    pnpm install --frozen-lockfile

COPY . .

ARG VITE_AUTH_URL=http://localhost:5025/api/v1/Auth
ARG VITE_API_BANKING_URL=http://localhost:3000/SistemaBancarioAdmin/v1
ENV VITE_AUTH_URL=$VITE_AUTH_URL
ENV VITE_API_BANKING_URL=$VITE_API_BANKING_URL

RUN pnpm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
