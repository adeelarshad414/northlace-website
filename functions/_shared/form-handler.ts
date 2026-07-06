import {
  buildEmailPayload,
  validateApplySubmission,
  validateContactSubmission,
  type ParsedSubmission,
  type FormKind,
} from "../../src/lib/forms";

export interface FormEnv {
  ENVIRONMENT?: string;
  MAIL_DELIVERY_MODE?: "log" | "provider";
  MAIL_FROM_EMAIL?: string;
  MAIL_PROVIDER_API_KEY?: string;
  MAIL_TO_EMAIL?: string;
  SITE_ORIGIN?: string;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_SITE_KEY?: string;
}

interface HandlerContext {
  env: FormEnv;
  request: Request;
}

interface DeliveryResult {
  message: string;
  ok: boolean;
  status: number;
  verified: "mock" | "provider";
}

export interface MailDeliveryAdapter {
  send(kind: FormKind, data: ParsedSubmission): Promise<DeliveryResult>;
}

const DUMMY_VALUE = "CHANGE_ME_DEV_ONLY";
const MAX_PAYLOAD_BYTES = 20_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const successMessage = "Thanks. We will reply within 1-2 business days.";
const failureMessage =
  "We could not send this form. Email hello@northlace.example directly and we will follow up.";

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export class LogOnlyAdapter implements MailDeliveryAdapter {
  async send(kind: FormKind, data: ParsedSubmission): Promise<DeliveryResult> {
    const payload = buildEmailPayload(kind, data);
    console.log(
      JSON.stringify({
        event: "northlace.form.delivery.mock",
        fieldNames: payload.text
          .split("\n")
          .map((line) => line.split(":")[0])
          .filter(Boolean),
        kind,
        subjectTemplate:
          kind === "contact"
            ? "Northlace website inquiry"
            : "Northlace role application",
        verified: "mock",
      }),
    );

    return {
      message: `${successMessage} Delivery is currently verified (mock).`,
      ok: true,
      status: 200,
      verified: "mock",
    };
  }
}

export class ProviderMailAdapter implements MailDeliveryAdapter {
  constructor(private readonly env: FormEnv) {}

  async send(): Promise<DeliveryResult> {
    // HUMAN_DECISION_GATE: choose a transactional email provider and implement this adapter.
    if (
      !this.env.MAIL_PROVIDER_API_KEY ||
      this.env.MAIL_PROVIDER_API_KEY === DUMMY_VALUE
    ) {
      return {
        message: failureMessage,
        ok: false,
        status: 503,
        verified: "provider",
      };
    }

    return {
      message: "Provider delivery adapter is not implemented yet.",
      ok: false,
      status: 501,
      verified: "provider",
    };
  }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "x-content-type-options": "nosniff",
    },
    status,
  });

const html = (title: string, message: string, status = 200) =>
  new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | Northlace</title></head><body><main><h1>${title}</h1><p>${message}</p><p><a href="/contact">Return to contact</a></p></main></body></html>`,
    {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "x-content-type-options": "nosniff",
      },
      status,
    },
  );

const wantsJson = (request: Request) =>
  request.headers.get("accept")?.includes("application/json") ||
  request.headers.get("content-type")?.includes("application/json");

const respond = (
  request: Request,
  body: {
    errors?: Record<string, string>;
    message: string;
    ok: boolean;
    verified?: string;
  },
  status: number,
) => {
  if (wantsJson(request)) {
    return json(body, status);
  }

  return html(
    body.ok ? "Submission received" : "Submission problem",
    body.message,
    status,
  );
};

const readSubmission = async (request: Request) => {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_PAYLOAD_BYTES) {
    throw new Response("Payload too large", { status: 413 });
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    return typeof body === "object" && body !== null
      ? (body as Record<string, string>)
      : {};
  }

  const formData = await request.formData();
  return Object.fromEntries(formData.entries()) as Record<string, string>;
};

const rejectBadOrigin = (request: Request, env: FormEnv) => {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  const allowedOrigin = env.SITE_ORIGIN ?? new URL(request.url).origin;
  return origin !== allowedOrigin;
};

const rejectProductionDummies = (env: FormEnv) =>
  env.ENVIRONMENT === "production" &&
  Object.values(env).some((value) => value === DUMMY_VALUE);

const rateLimitKey = (request: Request, kind: FormKind) =>
  `${kind}:${request.headers.get("cf-connecting-ip") ?? "unknown"}:${new URL(request.url).pathname}`;

const isRateLimited = (request: Request, kind: FormKind) => {
  const now = Date.now();
  const key = rateLimitKey(request, kind);
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT_MAX;
};

const selectAdapter = (env: FormEnv): MailDeliveryAdapter =>
  env.MAIL_DELIVERY_MODE === "provider"
    ? new ProviderMailAdapter(env)
    : new LogOnlyAdapter();

const handleRequest = async (
  kind: FormKind,
  { env, request }: HandlerContext,
) => {
  if (rejectProductionDummies(env)) {
    return respond(
      request,
      {
        message: "Production form configuration contains dummy values.",
        ok: false,
      },
      500,
    );
  }

  if (rejectBadOrigin(request, env)) {
    return respond(
      request,
      { message: "Request origin is not allowed.", ok: false },
      403,
    );
  }

  if (isRateLimited(request, kind)) {
    return respond(
      request,
      { message: "Please wait before submitting again.", ok: false },
      429,
    );
  }

  let data: Record<string, string>;
  try {
    data = await readSubmission(request);
  } catch (error) {
    if (error instanceof Response) return error;
    return respond(
      request,
      { message: "Invalid form payload.", ok: false },
      400,
    );
  }

  // PHASE_2_HOOK: verify Cloudflare Turnstile here when real keys are available.
  const validation =
    kind === "contact"
      ? validateContactSubmission(data)
      : validateApplySubmission(data);

  if (!validation.ok || !validation.data) {
    return respond(
      request,
      {
        errors: validation.errors,
        message: "Please fix the highlighted fields.",
        ok: false,
      },
      400,
    );
  }

  const result = await selectAdapter(env).send(kind, validation.data);
  return respond(
    request,
    {
      message: result.message,
      ok: result.ok,
      verified: result.verified,
    },
    result.status,
  );
};

export const handleContactRequest = (context: HandlerContext) =>
  handleRequest("contact", context);

export const handleApplyRequest = (context: HandlerContext) =>
  handleRequest("apply", context);
