const bindBrandPalette = () => {
  document
    .querySelectorAll<HTMLButtonElement>("[data-copy-color]")
    .forEach((button) => {
      if (button.dataset.copyBound === "true") return;
      button.dataset.copyBound = "true";
      button.addEventListener("click", async () => {
        const value = button.dataset.copyColor;
        if (!value) return;

        try {
          await navigator.clipboard.writeText(value);
          button.textContent = "Copied";
        } catch {
          button.textContent = value;
        }
      });
    });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bindBrandPalette, {
    once: true,
  });
} else {
  bindBrandPalette();
}
