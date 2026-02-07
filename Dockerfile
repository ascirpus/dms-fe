FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite bakes VITE_* env vars at build time — pass via build args
ARG VITE_DOCUMENT_STORE_URL
ARG VITE_AUTH_PROVIDER
ARG VITE_AUTH_CLIENT_ID=dms-fe
ARG VITE_AUTH_REALM=dms

RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
