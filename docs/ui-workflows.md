# UI workflows before backend integration

The public website and admin workflows use the existing local repository. Data is shared between pages and tabs on the same browser origin, not between devices. Authentication remains the existing demo login.

## Public journeys

- Public pages have URLs with refresh and browser-history support. Articles use `/news/:slug`; unpublished or missing articles show an unavailable state.
- `/register` has team details, individual squad fields, a review step, and a receipt. It validates 5–8 distinct players, email, required fields and duplicate active applications. Drafts recover on the same device.
- `/register/vendor` saves business details, including the description, and returns a reference.
- `/application-status` looks up an application using its reference and email. It displays approval, payment status and the organiser's note.
- Receipt links prepare a WhatsApp message to request payment instructions. No payment is collected by the website.
- Contact forms prepare a message for the user's email app. The website does not claim to have sent it.
- Tournament standings use completed group-stage matches, with 3 points for a win and 1 for a draw. Ranking uses points, goal difference, goals scored, then name for stable display. Knockout sections display only recorded matchups.
- Public modules, event information and fees read saved settings. Homepage emphasis follows the selected tournament mode.

## Admin journeys

- `/admin/fixtures` creates and edits fixtures, scores and match status. Validation checks team selection, groups, whole-number scores and simultaneous team/pitch conflicts. Completed results feed public standings.
- `/admin/team-registrations` and `/admin/vendor-registrations` provide search, status filters, application details, approval, payment status and notes.
- Approving a team creates its official-team entry once. Reversing approval removes that entry, unless fixtures still reference it; those fixtures must be resolved first. Removing an official team returns its linked application to pending.
- Vendor application approval and public vendor profiles are separate. Use `/admin/vendors` to publish the vendor's public presentation.
- Post drafts, previews and publishing share the same content. Publishing validates title, unique slug, excerpt, content and date. The date is a displayed date, not a scheduled publication time.
- Image uploads show processing progress and contextual errors. Gallery captions, visibility, featured state and order save immediately; the initial artwork can be managed like other gallery items.
- Destructive actions use confirmation dialogs. Editors warn before discarding unsaved changes. Dialogs support keyboard focus, Escape and focus restoration.

## Backend integration still required

Replace local storage and demo authentication with authenticated APIs. Application lookups, payment verification, approvals and publishing currently reflect local demo state. Add server validation, durable storage, authorisation, real submission delivery and any required payment/notification integrations. Do not treat a local receipt or local payment status as proof of a real booking or payment.

## Verification

`npm run typecheck`, `npm run lint`, and `npm run build` validate the application.

`npx playwright test --project=chromium --workers=2` runs the public, admin and mobile workflow regressions. The Playwright configuration starts the local Vite server if needed. Tests use isolated browser contexts and do not submit real messages or payments.
