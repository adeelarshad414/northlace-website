# Forms Delivery

Northlace forms target Cloudflare Pages Functions:

- `POST /api/contact`
- `POST /api/apply`

Both endpoints validate server-side and return structured JSON:

```json
{ "ok": false, "message": "Please fix the highlighted fields.", "errors": {} }
```

Valid submissions are sent through Resend-compatible transactional email using
these environment variables:

- `RESEND_API_KEY`
- `FORMS_FROM_EMAIL`
- `FORMS_TO_EMAIL`

If delivery is not configured or the provider rejects the request, the endpoint
returns a non-2xx JSON response and tells the visitor to email
`hello@northlace.example`. Submissions are never silently discarded.
