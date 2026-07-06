# Forms Delivery

Northlace forms target Cloudflare Pages Functions:

- `POST /api/contact`
- `POST /api/apply`

Both endpoints validate server-side and return structured JSON:

```json
{ "ok": false, "message": "Please fix the highlighted fields.", "errors": {} }
```

Valid submissions use the `MailDeliveryAdapter` interface. Development and
this audit run default to `LogOnlyAdapter`, which writes a structured mock
delivery event to function logs and returns success as **verified (mock)**.

Environment variables:

- `ENVIRONMENT`
- `SITE_ORIGIN`
- `MAIL_DELIVERY_MODE`
- `MAIL_FROM_EMAIL`
- `MAIL_TO_EMAIL`
- `MAIL_PROVIDER_API_KEY`
- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`

`MAIL_DELIVERY_MODE=provider` is intentionally behind a `HUMAN_DECISION_GATE`
until Northlace chooses the transactional provider. `CHANGE_ME_DEV_ONLY` values
are documented in `DUMMY-VALUES.md` and are rejected by the form functions when
`ENVIRONMENT=production`.

Both endpoints include server-side Zod validation, honeypot and time-to-submit
checks, payload size limits, origin checks, rate limiting, JSON responses for
enhanced forms, and server-rendered HTML success/error pages for no-JavaScript
form submissions. User-facing errors do not expose stack traces.
