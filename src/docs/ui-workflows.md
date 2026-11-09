# BEST5 connected workflows

The frontend now uses the FastAPI backend at `../../football_exhibition_backend`. From the backend repository root, start it with `./src/scripts/start.sh`; run `npm run dev` from the frontend `src` directory. Vite proxies `/api` to `http://127.0.0.1:8002`; `VITE_API_TARGET` (or legacy `BEST5_BACKEND_URL`) changes that target. Vite loads its `.env` through `loadEnv`; `FRONTEND_PORT`, `VITE_FRONTEND_BASE_URL` and `VITE_ALLOWED_HOSTS` control the dev server. The current frontend `.env` selects port 5174 and the local API at 127.0.0.1:8002. `VITE_API_URL` defaults to `/api/v1`. Keep frontend and API under the same origin in production for cookie and CSRF support.

## Public journeys

- Public pages, article URLs and browser history work after refresh. Public bootstrap returns published posts, visible vendors/gallery entries, official teams, fixtures, banking, prerequisites, settings and landing-page content.
- `/register` presents prerequisites and banking details before acknowledgement, followed by team details, 5–8 distinct squad names, review and a required PDF/JPG/PNG POP within the server-configured size/type policy. The server assigns references and review/payment status. Only the unfinished text draft remains on the current device; a file must be reselected after a reload before submission.
- `/register/vendor` saves business/contact details and returns a server-generated reference.
- `/application-status` looks up a server record with its reference and email from any device. It returns approval, payment status and organiser notes without exposing private payment documents.
- Public data refreshes every 30 seconds while visible and on returning to the tab for signed-out visitors. Admin snapshots refresh on page loads and successful mutations, preserving the version an editor started with. Registrations and settings are shared between devices.
- Contact forms still prepare a message for an email app; they do not send contact enquiries through the backend.

## Admin journeys

- Real HttpOnly cookie sessions replace the demo local-storage login. New staff must change temporary passwords before using administration. `/admin/settings/account` changes passwords; forgot/reset password pages use the backend's single-use reset-token flow.
- `/admin/settings/users` manages staff accounts, roles and deactivation for super admins only. API permissions independently enforce all role restrictions.
- `/admin/settings/registration` edits prerequisites and banking. Every banking save verifies the current password on the server; ordinary settings requests cannot change banking.
- `/admin/team-registrations` and `/admin/vendor-registrations` review server-side applications. Team reviews provide an authorised private POP download. Team approval requires verified payment, respects capacity and creates the official team in one transaction.
- Reversing approval removes the official team unless fixtures reference it. Removing an official team returns the linked application to pending.
- `/admin/fixtures` validates teams, groups, scores and scheduling conflicts; completed games feed the frontend standings calculation.
- CMS settings, landing content, articles, media, gallery, vendors and branding persist through the API. Gallery captions save on leaving the field; visibility and ordering save immediately.
- Content updates use resource revisions. Concurrent stale edits return an error and require a page reload instead of silently overwriting newer data.
- `/admin/logs` is restricted to super admins and displays filtered audit history, backend request logs and Brevo email queue/retry status.

## Email and setup

Registration receipts, review updates and password-reset emails are queued transactionally. Set `BREVO_API_KEY`, a verified `EMAIL_SENDER` and `EMAIL_ENABLED=true` in the backend `.env`, then restart to enable delivery. Disabled email remains visibly pending; no demo success message claims it was sent. See the backend README for credentials, database configuration, migrations, deployment and backups.

Backend teams and registrations start empty. Startup preserves subsequent data. The previous browser-only cleanup migration has been removed; preview browser content is not imported into the backend automatically.

## Remaining product features

These are not part of this backend integration: captain phone/WhatsApp collection, selecting a captain from the squad, team-logo submission, instalment balances/additional POPs, applicant self-service corrections, automated bracket generation, email delivery/bounce webhooks, and real email submission of contact enquiries. Prerequisites remain free text, so organisers must keep their fee/deadline wording consistent with fee settings.

## Verification

Run `npm run typecheck`, `npm run lint`, `npm run build` and `npx playwright test --project=chromium` from the frontend `src` directory. The browser suite starts an isolated temporary backend on port 8001 and frontend on 5175 and uses no development credentials or live email delivery. Run `.venv/bin/python -m pytest -q` from the backend `src` directory for authentication, security, permissions, files, database, email-provider and workflow tests.

Upload limits and enabled formats now come from the backend bootstrap response. Backend configuration also accepts the PRISM-style Brevo, storage, cookie/session, admin, logging and host aliases documented in its README. Repeated `.env` assignments use their final value; blank credentials are not restored from earlier assignments.

The initial bootstrap user is a super admin; ordinary admins retain content, tournament operations, settings and banking access. Only super admins manage staff and backend/email logs. Every login receives server-assigned permissions; a client cannot select its own role. The forced password setup card is centered and all password fields have show/hide controls.

## Staff invitation flow

Staff creation now queues a 48-hour password-setup email instead of asking the super admin to choose a password. The recipient chooses and confirms their password at `/admin/accept-invitation`, then logs in using their invited email address. Existing pending accounts have Send setup email / Resend invitation actions under Settings → Staff & Roles. Resend invalidates older setup links. The page displays email-disabled warnings and per-account queue/setup status; backend logs retain delivery errors. Email must be enabled and the backend restarted after `.env` changes.

Team registration accepts an optional team-logo image on the Team details step, with preview and removal. The API verifies the enabled image format, image contents and upload limit. Staff can preview it during review; approval copies it to the official team used by Teams and fixture displays. The file is held in memory until submission and must be selected again after a page reload.

Team and vendor registrations enqueue branded receipt emails with their reference and a Check application status button. The status link prefills only the reference; the applicant still enters their registered email. Landing Page → Sponsor logos manages uploaded artwork, names, ordering, removal and display size. The public strip loops right to left with pause, hover pause and a static reduced-motion layout. Supplied sponsor PDFs were rendered into web PNGs. Existing landing content without sponsor settings uses the supplied defaults until saved.

PWA installation is supported through the web manifest and branded icons. The public footer offers Install BEST5 app when the browser provides an installation prompt; iOS shows Add to Home Screen instructions. Installed mode uses a standalone window. A production-only service worker caches a branded offline page and icons; API responses and admin HTML are never cached. Live content, registration and saves require connectivity. Local Vite development does not register the worker. New workers use normal browser activation after existing app windows close. When changing precached offline artwork or HTML, update the CACHE version in public/sw.js. Deploy all dist files, including sw.js, manifest.webmanifest, offline.html and icons/, together.

Vendor pricing distinguishes Food & Drinks (default R1,000) from other stalls (default R350). Both rates are editable in tournament settings. The backend calculates and stores the applicable fee on each new application and includes it in the receipt; existing applications retain their recorded fee. Posts can be moved earlier/later with immediate persistence. This array order controls published News and homepage latest stories. Clear search/status/category filters before reordering.
