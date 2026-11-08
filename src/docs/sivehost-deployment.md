# Deploy BEST5 on Sivehost cPanel with the API on Render

Frontend: `https://best5football.co.za`. API: `https://api.best5football.co.za/api/v1`.

## 1. Publish the backend code update

Push the backend changes, including `CSRF_COOKIE_DOMAIN` support, to the branch Render deploys. Do not set that variable until the new API hostname is verified and you are ready to switch logins to the new frontend. The updated backend also supports the Vercel same-origin proxy; add the Vercel origin to CORS_ORIGINS to keep that frontend working.

## 2. Locate the domain and document root

In cPanel → Domains, find `best5football.co.za`. If absent, add it with Create a New Domain, following the hosting account's available options. Note the document root shown for this domain: this is where the built website belongs. It is often `public_html`, but use the actual value. Obtain the web-hosting server IP from Sivehost's hosting welcome email or control panel. Do not use the IP of the Render backend for the root website.

## 3. Upload the frontend

A prepared ZIP is supplied separately. To create another from the frontend repository root:

```bash
npm --prefix src ci
npm --prefix src run build:sivehost
```

Zip the contents of `src/dist`, including its hidden `.htaccess` file. The public `.env.sivehost` build profile points browser requests to the API subdomain; it contains no secrets.

In cPanel → File Manager → Settings, enable Show Hidden Files. Open the domain's document root. Back up an existing site before replacing its files. Upload the ZIP, extract it in that directory, then remove the uploaded ZIP. `index.html`, `.htaccess`, and `assets/` must be directly in the document root, without a surrounding `dist` folder. Do not upload source, node_modules, backend files, or `.env` secrets. The provided `.htaccess` supports React direct links and redirects www to the apex domain. Enable HTTPS through cPanel once the certificate is ready.

## 4. Configure the authoritative DNS zone

Use the DNS manager associated with the domain's currently active nameservers. This may be Sivehost's separate DNS manager rather than cPanel's Zone Editor. Edit one authoritative zone; duplicating changes in an inactive zone has no effect.

| Type | Name | Target |
| --- | --- | --- |
| A | @ | Actual Sivehost web-hosting IP |
| CNAME | www | best5football.co.za |
| CNAME | api | football-exhibition-backend.onrender.com |

Some DNS interfaces require the full hostname rather than `@`, `www`, or `api`. CNAME targets are hostnames, without `https://` or paths. Replace conflicting A/AAAA/CNAME records for these three names. Preserve mail/MX, SPF, DKIM, DMARC, and other unrelated records. Do not change nameservers unless you intend to move the entire DNS zone and have copied its records.

## 5. Verify API domain and HTTPS

In Render → backend service → Settings → Custom Domains, add `api.best5football.co.za`, then Verify after the CNAME resolves. Render provisions its HTTPS certificate. No hosted cPanel website is required for the API subdomain. The API still runs on Render.

In cPanel → SSL/TLS Status, run AutoSSL for `best5football.co.za` and `www.best5football.co.za`, if available. If AutoSSL is unavailable, request the included certificate from Sivehost. When it is active, enable Force HTTPS Redirect under Domains. Render manages the API certificate separately.

## 6. Set the backend environment and deploy

In Render → backend → Environment, set:

```dotenv
FRONTEND_URL=https://best5football.co.za
CORS_ORIGINS=https://best5football.co.za,https://football-exhibition-cms.vercel.app
ALLOWED_HOSTS=api.best5football.co.za,football-exhibition-backend.onrender.com
CSRF_COOKIE_DOMAIN=best5football.co.za
SECURE_COOKIES=true
EMAIL_LOGO_URL=https://best5football.co.za/assets/images/logo/smt_logo.png
```

Save and redeploy. Preserve the existing database, uploads, Brevo credentials, and admin account settings. Do not replace the whole environment with an example file.

`CSRF_COOKIE_DOMAIN` shares only the readable CSRF token with the frontend. The login session cookie remains restricted to the API host. For the production frontend, the CSRF cookie is shared with the parent domain. Vercel proxy requests receive a host-only CSRF cookie instead, allowing both frontends to work when their origins are permitted. Sign in again after switching.

## 7. Verify before retiring Vercel

Open:

- `https://best5football.co.za`
- `https://www.best5football.co.za` (redirects to the apex)
- `https://best5football.co.za/admin/login` (refresh should work)
- `https://api.best5football.co.za/api/v1/health` (JSON)

Check normal login, an admin save, logout, registration and POP upload, viewing uploaded media, and invitation/reset links. Browser requests should go to `https://api.best5football.co.za/api/v1`, not `/api` on Sivehost. DNS/certificate changes may need time to complete. Keep Vercel for reviewing frontend changes; production hosting remains on Sivehost.

For later updates, review the matching commit on Vercel, then run `npm --prefix src run release:sivehost` from the frontend repository root and upload the ZIP generated in `releases/`. Vercel's Git deployment does not update the cPanel files.
