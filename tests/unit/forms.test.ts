import { describe, expect, it, vi } from "vitest";

import {
  handleApplyRequest,
  handleContactRequest,
} from "../../functions/_shared/form-handler";
import {
  validateApplySubmission,
  validateContactSubmission,
} from "../../src/lib/forms";

const jsonRequest = (body: unknown) =>
  new Request("https://northlace.example/api/contact", {
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
    method: "POST",
  });

const readJson = async (response: Response) =>
  (await response.json()) as {
    errors?: Record<string, string>;
    message?: string;
    ok: boolean;
  };

describe("form validation", () => {
  it("rejects missing contact fields and malformed email", () => {
    const result = validateContactSubmission({
      email: "not-an-email",
      inquiryType: "",
      message: "",
      name: "",
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toEqual({
      email: "Enter a valid email address.",
      inquiryType: "Choose what you are looking for.",
      message: "Tell us a little about the work.",
      name: "Enter your name.",
    });
  });

  it("rejects missing apply fields and invalid resume links", () => {
    const missing = validateApplySubmission({
      email: "",
      name: "",
      resumeUrl: "",
      roleSlug: "",
    });
    const malformedResume = validateApplySubmission({
      email: "candidate@example.com",
      name: "Candidate",
      resumeUrl: "not-a-url",
      roleSlug: "platform-engineer-cloud-operations",
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
      }),
    });
    const body = await readJson(response);

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.errors?.email).toBe("Enter a valid email address.");
  });

  it("sends valid contact submissions through the configured email provider", async () => {
    const fetcher = vi.fn(
      async () => new Response("{}", { status: 202 }),
    ) as unknown as typeof fetch;
    const response = await handleContactRequest({
      env: {
        FORMS_FROM_EMAIL: "Northlace <forms@northlace.example>",
        FORMS_TO_EMAIL: "hello@northlace.example",
        RESEND_API_KEY: "test-key",
      },
      fetcher,
      request: jsonRequest({
        email: "buyer@example.com",
        inquiryType: "Discovery call",
        message: "We need a cloud operations partner.",
        name: "Buyer",
      }),
    });
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("does not silently discard valid submissions when delivery is unconfigured", async () => {
    const response = await handleApplyRequest({
      env: {},
      request: jsonRequest({
        email: "candidate@example.com",
        name: "Candidate",
        resumeUrl: "https://example.com/resume.pdf",
        roleSlug: "platform-engineer-cloud-operations",
        roleTitle: "Platform Engineer, Talent Network",
      }),
    });
    const body = await readJson(response);

    expect(response.status).toBe(503);
    expect(body.ok).toBe(false);
    expect(body.message).toContain("Email hello@northlace.example");
  });
});
