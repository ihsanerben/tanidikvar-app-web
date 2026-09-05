FROM node:22-alpine AS build
WORKDIR /workspace
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL=/
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM nginx:stable-alpine
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /workspace/dist /usr/share/nginx/html
ENV API_UPSTREAM=http://api:8080
EXPOSE 80
HEALTHCHECK --interval=5s --timeout=3s --start-period=10s --retries=10 CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
