// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";

import { initMobileMenu } from "../../src/scripts/mobile-menu";

const renderMenu = () => {
  document.body.innerHTML = `
    <button id="outside">Outside</button>
    <header data-mobile-menu-root>
      <button data-mobile-menu-toggle aria-expanded="false" aria-controls="mobile-menu">
        Menu
      </button>
      <div id="mobile-menu" data-mobile-menu-panel hidden>
        <a href="/services">Services</a>
        <a href="/case-studies">Case studies</a>
        <a href="/contact">Book a discovery call</a>
      </div>
    </header>
  `;

  const root = document.querySelector<HTMLElement>("[data-mobile-menu-root]");
  if (!root) {
    throw new Error("Missing mobile menu root");
  }

  return {
    cleanup: initMobileMenu(root),
    outside: document.querySelector<HTMLButtonElement>("#outside")!,
    panel: document.querySelector<HTMLElement>("[data-mobile-menu-panel]")!,
    toggle: document.querySelector<HTMLButtonElement>(
      "[data-mobile-menu-toggle]",
    )!,
    links: Array.from(
      document.querySelectorAll<HTMLAnchorElement>("#mobile-menu a"),
    ),
  };
};

afterEach(() => {
  document.body.innerHTML = "";
});

describe("mobile menu behavior", () => {
  it("opens, traps focus, closes on Escape, and closes on outside click", () => {
    const { cleanup, links, outside, panel, toggle } = renderMenu();

    toggle.focus();
    toggle.click();

    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(panel.hidden).toBe(false);
    expect(document.activeElement).toBe(links[0]);

    links[0].dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        shiftKey: true,
        bubbles: true,
      }),
    );
    expect(document.activeElement).toBe(links[2]);

    links[2].dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
    );
    expect(document.activeElement).toBe(links[0]);

    panel.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(panel.hidden).toBe(true);
    expect(document.activeElement).toBe(toggle);

    toggle.click();
    expect(panel.hidden).toBe(false);

    outside.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(panel.hidden).toBe(true);

    cleanup();
  });
});
