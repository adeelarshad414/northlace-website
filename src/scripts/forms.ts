import {
  validateApplySubmission,
  validateContactSubmission,
  type ApplySubmission,
  type ContactSubmission,
} from "../lib/forms";

const getField = (form: HTMLFormElement, name: string) =>
  form.querySelector<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >(`[name="${name}"]`);

const setError = (form: HTMLFormElement, name: string, message: string) => {
  const field = getField(form, name);
  const error = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
  if (!field || !error) return;

  field.setAttribute("aria-invalid", message ? "true" : "false");
  error.textContent = message;
};

const clearErrors = (form: HTMLFormElement) => {
  form.querySelectorAll<HTMLElement>("[data-error-for]").forEach((error) => {
    error.textContent = "";
  });

  form
    .querySelectorAll<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >("[aria-invalid]")
    .forEach((field) => field.setAttribute("aria-invalid", "false"));
};

const serialize = (form: HTMLFormElement) =>
  Object.fromEntries(new FormData(form).entries()) as Record<string, string>;

const validate = (form: HTMLFormElement, payload: Record<string, string>) =>
  form.getAttribute("action") === "/api/apply"
    ? validateApplySubmission(payload as ApplySubmission)
    : validateContactSubmission(payload as ContactSubmission);

const enhanceForm = (form: HTMLFormElement) => {
  const status = form.querySelector<HTMLElement>("[data-form-status]");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    clearErrors(form);

    const payload = serialize(form);
    const validation = validate(form, payload);

    if (!validation.ok) {
      Object.entries(validation.errors).forEach(([field, message]) =>
        setError(form, field, message),
      );
      if (status) status.textContent = "Please fix the highlighted fields.";
      return;
    }

    if (status) status.textContent = "Sending...";

    try {
      const response = await fetch(form.action, {
        body: JSON.stringify(payload),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      const result = (await response.json()) as {
        errors?: Record<string, string>;
        message?: string;
        ok?: boolean;
      };

      if (!response.ok || !result.ok) {
        Object.entries(result.errors ?? {}).forEach(([field, message]) =>
          setError(form, field, message),
        );
        if (status)
          status.textContent =
            result.message ?? "Please fix the highlighted fields.";
        return;
      }

      form.reset();
      if (status)
        status.textContent =
          result.message ?? "Thanks. We will reply within 1-2 business days.";
    } catch {
      if (status) {
        status.textContent =
          "We could not submit the form. Email hello@northlace.example directly and we will follow up.";
      }
    }
  });
};

document
  .querySelectorAll<HTMLFormElement>("[data-enhanced-form]")
  .forEach((form) => enhanceForm(form));
