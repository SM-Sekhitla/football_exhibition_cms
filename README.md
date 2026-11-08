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

Run npm commands from `src/` (or use `npm --prefix src run build` from the root). For Vercel, keep the repository root (`.`) as the project root; the root `vercel.json` installs and builds the project under `src`. Docker builds continue to use the repository root.

## Vercel deployment

Use Root Directory `.` (the repository root) and framework preset Vite. The root `vercel.json` configures:

- Install: `npm --prefix src ci --include=dev`
- Build: `npm --prefix src run typecheck && npm --prefix src run build`
- Output: `src/dist`
- `/api/*` proxy to the Render backend, before the React route fallback.

Set `VITE_API_URL=/api/v1` in Vercel. Keep backend secrets in Render. Vercel does not use the Docker Nginx configuration or `BACKEND_URL`; update the external rewrite in `vercel.json` if the backend domain changes.

In Render, set `FRONTEND_URL` and `CORS_ORIGINS` to the final Vercel/custom frontend HTTPS origin, and `SECURE_COOKIES=true`. This also makes invitation/reset emails point to the deployed frontend. Redeploy both services after changing their environment settings. Requests to the frontend `/api/v1/health` should return backend JSON, and `/admin/login` should open the React login page.

## Sivehost cPanel

Build with `npm --prefix src run build:sivehost`. Upload the contents of `src/dist` to the domain document root, including `.htaccess`. Follow [the complete Sivehost and Render migration guide](src/docs/sivehost-deployment.md) for DNS, HTTPS, API cookies, and environment configuration.

## Preview on Vercel, release to Sivehost

Push frontend changes to GitHub to build the Vercel preview. Keep Vercel Root Directory `.` and `VITE_API_URL=/api/v1`; the root `vercel.json` proxies API requests to Render. The Sivehost profile is used only for explicit production builds.

After reviewing a version on Vercel, check out the same commit locally and run:

```bash
npm --prefix src ci
npm --prefix src run release:sivehost
```

Python 3 is needed only on the local packaging computer. A timestamped ZIP is created in `releases/`, with its Git revision and a `release.json` manifest. Upload and extract it in the Sivehost document root. Keep the previous ZIP to roll back. The script marks uncommitted work as `modified`; commit changes first to promote exactly the version tested on Vercel. Git pushes do not change Sivehost files automatically.

To use both frontends with the existing Render backend, deploy the cookie-handling update and set `CORS_ORIGINS=https://best5football.co.za,https://football-exhibition-cms.vercel.app`. Keep `FRONTEND_URL=https://best5football.co.za` and `CSRF_COOKIE_DOMAIN=best5football.co.za`. Add any additional preview origin explicitly if required. The production domain uses a shared CSRF cookie; the Vercel same-origin proxy receives a host-only cookie instead.

Both frontends currently use the same backend/database: admin edits and registrations made on Vercel affect live data. Use a separate development Render service/database and update Vercel's API rewrite if you need isolated testing.
