import { z } from "zod";

export type FormKind = "contact" | "apply";

export interface ValidationResult<TData = unknown> {
  ok: boolean;
  errors: Record<string, string>;
  data?: TData;
}

const spamFieldsSchema = z.object({
  website: z.string().max(0, "Leave this field blank.").default(""),
  submittedAt: z.coerce
    .number({ invalid_type_error: "Refresh the page and try again." })
    .refine((value) => Date.now() - value >= 1_500, {
      message: "Please wait a moment before submitting.",
    }),
});

export const contactSubmissionSchema = spamFieldsSchema.extend({
  name: z.string().trim().min(1, "Enter your name."),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address."),
  company: z.string().trim().optional().default(""),
  role: z.string().trim().optional().default(""),
  inquiryType: z.string().trim().min(1, "Choose what you are looking for."),
  message: z.string().trim().min(1, "Tell us a little about the work."),
});

export const applySubmissionSchema = spamFieldsSchema.extend({
  roleSlug: z.string().trim().min(1, "Missing role."),
  roleTitle: z.string().trim().optional().default(""),
  name: z.string().trim().min(1, "Enter your name."),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address."),
  resumeUrl: z
    .string()
    .trim()
    .min(1, "Share a resume link.")
    .url("Share a valid resume link.")
    .refine(
      (value) => value.startsWith("http://") || value.startsWith("https://"),
      {
        message: "Share a valid resume link.",
      },
    ),
  coverNote: z.string().trim().optional().default(""),
});

export type ContactSubmission = Record<string, unknown>;
export type ParsedContactSubmission = z.output<typeof contactSubmissionSchema>;
export type ApplySubmission = Record<string, unknown>;
export type ParsedApplySubmission = z.output<typeof applySubmissionSchema>;
export type ParsedSubmission = ParsedContactSubmission | ParsedApplySubmission;

const validate = <Schema extends z.ZodTypeAny>(
  schema: Schema,
  data: unknown,
): ValidationResult<z.output<Schema>> => {
  const result = schema.safeParse(data);

  if (result.success) {
    return { ok: true, errors: {}, data: result.data };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }

  return { ok: false, errors };
};

export const validateContactSubmission = (
  data: unknown,
): ValidationResult<ParsedContactSubmission> =>
  validate(contactSubmissionSchema, data);

export const validateApplySubmission = (
  data: unknown,
): ValidationResult<ParsedApplySubmission> =>
  validate(applySubmissionSchema, data);

const publicEntries = (data: ParsedSubmission) =>
  Object.entries(data).filter(
    ([key]) => key !== "website" && key !== "submittedAt",
  );

export const buildEmailPayload = (kind: FormKind, data: ParsedSubmission) => {
  const name = data.name.trim() || "unknown";

  return {
    replyTo: data.email.trim(),
    subject:
      kind === "contact"
        ? `Northlace website inquiry from ${name}`
        : `Northlace role application from ${name}`,
    text: publicEntries(data)
      .map(([key, value]) => `${key}: ${String(value ?? "").trim()}`)
      .join("\n"),
  };
};
