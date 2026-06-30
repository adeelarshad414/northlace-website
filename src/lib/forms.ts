const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const httpUrlPattern = /^https?:\/\//i;

export type FormKind = "contact" | "apply";

export interface ContactSubmission {
  name?: string;
  email?: string;
  company?: string;
  role?: string;
  inquiryType?: string;
  message?: string;
}

export interface ApplySubmission {
  roleSlug?: string;
  roleTitle?: string;
  name?: string;
  email?: string;
  resumeUrl?: string;
  coverNote?: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: Record<string, string>;
}

const required = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0;

const validHttpUrl = (value: unknown) => {
  if (
    !required(value) ||
    typeof value !== "string" ||
    !httpUrlPattern.test(value)
  ) {
    return false;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export const validateContactSubmission = (
  data: ContactSubmission,
): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!required(data.name)) errors.name = "Enter your name.";
  if (!required(data.email)) errors.email = "Enter your email address.";
  if (required(data.email) && !emailPattern.test(data.email ?? "")) {
    errors.email = "Enter a valid email address.";
  }
  if (!required(data.inquiryType))
    errors.inquiryType = "Choose what you are looking for.";
  if (!required(data.message))
    errors.message = "Tell us a little about the work.";

  return { ok: Object.keys(errors).length === 0, errors };
};

export const validateApplySubmission = (
  data: ApplySubmission,
): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!required(data.roleSlug)) errors.roleSlug = "Missing role.";
  if (!required(data.name)) errors.name = "Enter your name.";
  if (!required(data.email)) errors.email = "Enter your email address.";
  if (required(data.email) && !emailPattern.test(data.email ?? "")) {
    errors.email = "Enter a valid email address.";
  }
  if (!required(data.resumeUrl)) {
    errors.resumeUrl = "Share a resume link.";
  } else if (!validHttpUrl(data.resumeUrl)) {
    errors.resumeUrl = "Share a valid resume link.";
  }

  return { ok: Object.keys(errors).length === 0, errors };
};

export const buildEmailPayload = (
  kind: FormKind,
  data: ContactSubmission | ApplySubmission,
) => {
  const name =
    typeof data.name === "string" && data.name.trim()
      ? data.name.trim()
      : "unknown";

  return {
    replyTo: typeof data.email === "string" ? data.email.trim() : undefined,
    subject:
      kind === "contact"
        ? `Northlace website inquiry from ${name}`
        : `Northlace role application from ${name}`,
    text: Object.entries(data)
      .map(([key, value]) => `${key}: ${String(value ?? "").trim()}`)
      .join("\n"),
  };
};
