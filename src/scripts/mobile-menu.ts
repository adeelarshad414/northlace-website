const focusableSelector =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const getFocusableElements = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) => !element.hasAttribute("disabled") && element.tabIndex !== -1,
  );

export const initMobileMenu = (root: HTMLElement) => {
  const toggle = root.querySelector<HTMLButtonElement>(
    "[data-mobile-menu-toggle]",
  );
  const panel = root.querySelector<HTMLElement>("[data-mobile-menu-panel]");

  if (!toggle || !panel) {
    return () => undefined;
  }

  const openMenu = () => {
    panel.hidden = false;
    root.dataset.menuState = "open";
    toggle.setAttribute("aria-expanded", "true");

    const [firstFocusable] = getFocusableElements(panel);
    firstFocusable?.focus();
  };

  const closeMenu = (returnFocus = true) => {
    panel.hidden = true;
    root.dataset.menuState = "closed";
    toggle.setAttribute("aria-expanded", "false");

    if (returnFocus) {
      toggle.focus();
    }
  };

  const isOpen = () => toggle.getAttribute("aria-expanded") === "true";

  const handleToggleClick = () => {
    if (isOpen()) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (!isOpen()) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = getFocusableElements(panel);
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (!firstFocusable || !lastFocusable) {
      event.preventDefault();
      toggle.focus();
      return;
    }

    if (event.shiftKey && document.activeElement === firstFocusable) {
      event.preventDefault();
      lastFocusable.focus();
    }

    if (!event.shiftKey && document.activeElement === lastFocusable) {
      event.preventDefault();
      firstFocusable.focus();
    }
  };

  const handleDocumentClick = (event: MouseEvent) => {
    if (
      !isOpen() ||
      !(event.target instanceof Node) ||
      root.contains(event.target)
    ) {
      return;
    }

    closeMenu(false);
  };

  const handleLinkClick = (event: Event) => {
    if (event.target instanceof HTMLAnchorElement && isOpen()) {
      closeMenu(false);
    }
  };

  root.dataset.menuState = "closed";
  toggle.addEventListener("click", handleToggleClick);
  panel.addEventListener("keydown", handleKeydown);
  panel.addEventListener("click", handleLinkClick);
  document.addEventListener("click", handleDocumentClick);

  return () => {
    toggle.removeEventListener("click", handleToggleClick);
    panel.removeEventListener("keydown", handleKeydown);
    panel.removeEventListener("click", handleLinkClick);
    document.removeEventListener("click", handleDocumentClick);
  };
};
