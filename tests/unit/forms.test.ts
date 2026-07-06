import { afterEach, describe, expect, it, vi } from "vitest";

import {
  handleApplyRequest,
  handleContactRequest,
} from "../../functions/_shared/form-handler";
import {
  validateApplySubmission,
  validateContactSubmission,
} from "../../src/lib/forms";

const submittedAt = () => String(Date.now() - 2_000);

const validContact = () => ({
  email: "buyer@example.com",
  inquiryType: "Discovery call",
  message: "We need a cloud operations partner.",
  name: "Buyer",
  submittedAt: submittedAt(),
  website: "",
});

const validApply = () => ({
  email: "candidate@example.com",
  name: "Candidate",
  resumeUrl: "https://example.com/resume.pdf",
  roleSlug: "platform-engineer-cloud-operations",
  roleTitle: "Platform Engineer, Talent Network",
  submittedAt: submittedAt(),
  website: "",
});

const jsonRequest = (
  body: unknown,
  options: { ip?: string; origin?: string; url?: string } = {},
) =>
  new Request(options.url ?? "https://northlace.example/api/contact", {
    body: JSON.stringify(body),
    headers: {
      accept: "application/json",
      "cf-connecting-ip": options.ip ?? "203.0.113.10",
      "content-type": "application/json",
      ...(options.origin ? { origin: options.origin } : {}),
    },
    method: "POST",
  });

const formRequest = (body: Record<string, string>) => {
  const formData = new FormData();
  Object.entries(body).forEach(([key, value]) => formData.set(key, value));

  return new Request("https://northlace.example/api/contact", {
    body: formData,
    headers: { "cf-connecting-ip": "203.0.113.20" },
    method: "POST",
  });
};

const readJson = async (response: Response) =>
  (await response.json()) as {
    errors?: Record<string, string>;
    message?: string;
    ok: boolean;
    verified?: string;
  };

afterEach(() => {
  vi.restoreAllMocks();
});

describe("form validation", () => {
  it("rejects missing contact fields and malformed email", () => {
    const result = validateContactSubmission({
      email: "not-an-email",
      inquiryType: "",
      message: "",
      name: "",
      submittedAt: submittedAt(),
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toEqual({
      email: "Enter a valid email address.",
      inquiryType: "Choose what you are looking for.",
      message: "Tell us a little about the work.",
      name: "Enter your name.",
    });
  });

  it("rejects spam honeypot values and too-fast submissions", () => {
    const result = validateContactSubmission({
      ...validContact(),
      submittedAt: String(Date.now()),
      website: "https://spam.example",
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toMatchObject({
      submittedAt: "Please wait a moment before submitting.",
      website: "Leave this field blank.",
    });
  });

  it("rejects missing apply fields and invalid resume links", () => {
    const missing = validateApplySubmission({
      email: "",
      name: "",
      resumeUrl: "",
      roleSlug: "",
      submittedAt: submittedAt(),
    });
    const malformedResume = validateApplySubmission({
      email: "candidate@example.com",
      name: "Candidate",
      resumeUrl: "not-a-url",
      roleSlug: "platform-engineer-cloud-operations",
      submittedAt: submittedAt(),
    });

    expect(missing.ok).toBe(false);
    expect(missing.errors).toMatchObject({
      email: "Enter your email address.",
      name: "Enter your name.",
      resumeUrl: "Share a resume link.",
      roleSlug: "Missing role.",
    });
    expect(malformedResume.errors.resumeUrl).toBe("Share a valid resume link.");
  });

  it("returns structured errors from the contact endpoint", async () => {
    const response = await handleContactRequest({
      env: {},
      request: jsonRequest({
        email: "bad",
        inquiryType: "",
        message: "",
        name: "",
        submittedAt: submittedAt(),
      }),
    });
    const body = await readJson(response);

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.errors?.email).toBe("Enter a valid email address.");
  });

  it("delivers valid contact submissions through the log-only adapter by default", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const response = await handleContactRequest({
      env: {},
      request: jsonRequest(validContact(), { ip: "203.0.113.21" }),
    });
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.verified).toBe("mock");
    expect(log).toHaveBeenCalledWith(
      expect.stringContaining("northlace.form.delivery.mock"),
    );
  });

  it("returns a server-rendered success page for no-JavaScript form posts", async () => {
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    const response = await handleContactRequest({
      env: {},
      request: formRequest(validContact()),
    });
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(body).toContain("Submission received");
  });

  it("rejects disallowed origins", async () => {
    const response = await handleContactRequest({
      env: { SITE_ORIGIN: "https://northlace.example" },
      request: jsonRequest(validContact(), {
        ip: "203.0.113.22",
        origin: "https://evil.example",
      }),
    });
    const body = await readJson(response);

    expect(response.status).toBe(403);
    expect(body.message).toBe("Request origin is not allowed.");
  });

  it("rate-limits repeated submissions", async () => {
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    let lastResponse = new Response();

    for (let index = 0; index < 11; index += 1) {
      lastResponse = await handleContactRequest({
        env: {},
        request: jsonRequest(validContact(), { ip: "203.0.113.99" }),
      });
    }

    expect(lastResponse.status).toBe(429);
    expect((await readJson(lastResponse)).message).toBe(
      "Please wait before submitting again.",
    );
  });

  it("rejects dummy values in production mode", async () => {
    const response = await handleApplyRequest({
      env: {
        ENVIRONMENT: "production",
        MAIL_PROVIDER_API_KEY: "CHANGE_ME_DEV_ONLY",
      },
      request: jsonRequest(validApply(), {
        ip: "203.0.113.23",
        url: "https://northlace.example/api/apply",
      }),
    });
    const body = await readJson(response);

    expect(response.status).toBe(500);
    expect(body.message).toBe(
      "Production form configuration contains dummy values.",
    );
  });
});
