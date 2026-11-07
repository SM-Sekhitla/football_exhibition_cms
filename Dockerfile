FROM node:22-alpine AS build
WORKDIR /app
COPY src/package.json src/package-lock.json ./
RUN npm ci
COPY src/ .
ENV VITE_API_URL=/api/v1
ARG VITE_GIT_VERSION=production
ENV VITE_GIT_VERSION=$VITE_GIT_VERSION
RUN npm run typecheck && npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY src/docker/default.conf.template /etc/nginx/templates/default.conf.template
COPY src/docker/19-configure.sh /docker-entrypoint.d/19-configure.sh
RUN chmod +x /docker-entrypoint.d/19-configure.sh
ENV PORT=8080
ENV BACKEND_URL=https://football-exhibition-backend.onrender.com
EXPOSE 8080
