# BEST5 frontend

React and Vite frontend for the BEST5 football exhibition.

## Docker

From this repository root:

```bash
docker compose up -d --build
```

Open http://localhost:5174. The production image builds the application with Node and serves it with Nginx. React routes, including direct links to admin pages, fall back to `index.html`. Requests to `/api/` are forwarded to the backend under the same browser origin, supporting session and CSRF cookies.

`BACKEND_URL` defaults to `https://football-exhibition-backend.onrender.com`. Override it at runtime with an HTTP(S) origin without a trailing slash or path. `FRONTEND_PORT` controls the local Compose port (default 5174). Container `PORT` defaults to 8080 and also supports a hosting provider's assigned port.

```bash
BACKEND_URL=https://your-api.example.com docker compose up -d --build
```

For Render Docker deployment, use Dockerfile `./Dockerfile`, build context `.`, and health-check path `/healthz`. Set `BACKEND_URL` to the API origin. In the backend environment, set `FRONTEND_URL` and `CORS_ORIGINS` to the deployed frontend's HTTPS origin, and enable `SECURE_COOKIES=true` for HTTPS deployment. Public custom backend domains must be in the backend's allowed hosts. The local Docker frontend uses HTTP, which requires a development backend configured for HTTP cookies.

The build uses `/api/v1` for browser requests. Local `.env` files are excluded from the image; `VITE_API_TARGET` is a Vite development setting and does not configure this production proxy. Backend credentials belong in the backend service, never in frontend build arguments.

## Local development

```bash
cd src
npm ci
npm run dev
```

See `src/.env.example` and [workflow notes](src/docs/ui-workflows.md) for local configuration.

## Repository layout

The frontend project lives in `src/`: React code in `src/src/`, assets in `src/public/`, configuration and dependencies in `src/`, and tests in `src/tests/`. The Dockerfile, Compose file and Docker exclusions stay at the repository root for deployment.

Run npm commands from `src/` (or use `npm --prefix src run build` from the root). For Vercel, select `src` as the project root. Docker builds continue to use the repository root.
