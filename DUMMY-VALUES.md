# Dummy Values

Dummy values let the site run in development without blocking production
readiness work. They must not reach production runtime configuration.

| Key                     | Value                | Reason                                                    | Production guard                                                          |
| ----------------------- | -------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------- |
| `MAIL_PROVIDER_API_KEY` | `CHANGE_ME_DEV_ONLY` | Transactional email provider is a human decision gate.    | Form functions reject `CHANGE_ME_DEV_ONLY` when `ENVIRONMENT=production`. |
| `TURNSTILE_SITE_KEY`    | `CHANGE_ME_DEV_ONLY` | Cloudflare Turnstile keys are unavailable in this run.    | Form functions reject `CHANGE_ME_DEV_ONLY` when `ENVIRONMENT=production`. |
| `TURNSTILE_SECRET_KEY`  | `CHANGE_ME_DEV_ONLY` | Cloudflare Turnstile verification is stubbed for Phase 2. | Form functions reject `CHANGE_ME_DEV_ONLY` when `ENVIRONMENT=production`. |

Current form delivery status: **verified (mock)** through `LogOnlyAdapter`.

## Pending Non-Secret Values

| Item                            | Current production copy                                                                 | Reason                                                  | Production guard                                                                                         |
| ------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Adeel Codes Cloud channel links | Copy says the YouTube, podcast, and Instagram links are pending final channel approval. | Channels are brand decisions and should not be guessed. | No placeholder anchors ship in generated output; `npm run lint:production-content` fails if they return. |
| Signal & Scale channel links    | Copy says the YouTube, podcast, and Instagram links are pending final channel approval. | Channels are brand decisions and should not be guessed. | No placeholder anchors ship in generated output; `npm run lint:production-content` fails if they return. |
| The Cloud Lounge channel links  | Copy says the YouTube, podcast, and Instagram links are pending final channel approval. | Channels are brand decisions and should not be guessed. | No placeholder anchors ship in generated output; `npm run lint:production-content` fails if they return. |
| Public site domain              | `https://northlace.example` in Astro config and metadata.                               | Final domain was not provided in the source prompts.    | Replace before production deploy; sitemap and canonical URLs centralize the value through Astro `site`.  |

## Human Decision Gates

- `HUMAN_DECISION_GATE`: choose the transactional email provider and implement
  the `ProviderMailAdapter`.
- `PHASE_2_HOOK`: wire Cloudflare Turnstile verification once real keys exist.
- Confirm the public production domain and update `astro.config.mjs`.
- Confirm social/channel URLs for the three brand launch posts.
