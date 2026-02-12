FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite bakes VITE_* env vars at build time — pass via build args.
# These become the defaults; runtime-config.js can override them at startup.
ARG VITE_DOCUMENT_STORE_URL
ARG VITE_AUTH_PROVIDER
ARG VITE_AUTH_CLIENT_ID=dms-fe
ARG VITE_AUTH_REALM=dms
ARG VITE_TURNSTILE_SITE_KEY

RUN npm run build
RUN npm run docs:build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/docs/.vitepress/dist /usr/share/nginx/html/docs
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
