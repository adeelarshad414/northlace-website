import {
  buildEmailPayload,
  validateApplySubmission,
  validateContactSubmission,
  type ApplySubmission,
  type ContactSubmission,
  type FormKind,
} from "../../src/lib/forms";

export interface FormEnv {
  RESEND_API_KEY?: string;
  FORMS_FROM_EMAIL?: string;
  FORMS_TO_EMAIL?: string;
}

interface HandlerContext {
  env: FormEnv;
  fetcher?: typeof fetch;
  request: Request;
}

const fallbackMessage =
  "We could not send this form. Email hello@northlace.example directly and we will follow up.";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json; charset=utf-8" },
    status,
  });

const readSubmission = async (request: Request) => {
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

const configured = (env: FormEnv) =>
  Boolean(env.RESEND_API_KEY && env.FORMS_FROM_EMAIL && env.FORMS_TO_EMAIL);

const sendEmail = async (
  kind: FormKind,
  data: ContactSubmission | ApplySubmission,
  env: FormEnv,
  fetcher: typeof fetch,
) => {
  if (!configured(env)) {
    return { ok: false, status: 503, message: fallbackMessage };
  }

  const payload = buildEmailPayload(kind, data);
  const response = await fetcher("https://api.resend.com/emails", {
    body: JSON.stringify({
      from: env.FORMS_FROM_EMAIL,
      reply_to: payload.replyTo,
      subject: payload.subject,
      text: payload.text,
      to: [env.FORMS_TO_EMAIL],
    }),
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    return { ok: false, status: 502, message: fallbackMessage };
  }

  return {
    ok: true,
    status: 200,
    message: "Thanks. We will reply within 1-2 business days.",
  };
};

export const handleContactRequest = async ({
  env,
  fetcher = fetch,
  request,
}: HandlerContext) => {
  const data = await readSubmission(request);
  const validation = validateContactSubmission(data);

  if (!validation.ok) {
    return json(
      {
        ok: false,
        errors: validation.errors,
        message: "Please fix the highlighted fields.",
      },
      400,
    );
  }

  const result = await sendEmail("contact", data, env, fetcher);
  return json({ ok: result.ok, message: result.message }, result.status);
};

export const handleApplyRequest = async ({
  env,
  fetcher = fetch,
  request,
}: HandlerContext) => {
  const data = await readSubmission(request);
  const validation = validateApplySubmission(data);

  if (!validation.ok) {
    return json(
      {
        ok: false,
        errors: validation.errors,
        message: "Please fix the highlighted fields.",
      },
      400,
    );
  }

  const result = await sendEmail("apply", data, env, fetcher);
  return json({ ok: result.ok, message: result.message }, result.status);
};
