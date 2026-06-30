const initFilterGroup = (root: HTMLElement) => {
  const buttons = Array.from(
    root.querySelectorAll<HTMLButtonElement>("[data-filter-value]"),
  );
  const items = Array.from(
    document.querySelectorAll<HTMLElement>(root.dataset.filterItems ?? ""),
  );
  const emptyState = document.querySelector<HTMLElement>(
    root.dataset.emptyState ?? "",
  );

  const applyFilter = (value: string) => {
    let visibleCount = 0;

    items.forEach((item) => {
      const values = (item.dataset.filterKeys ?? "").split(" ");
      const isVisible = value === "all" || values.includes(value);
      item.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    buttons.forEach((button) => {
      const isActive = button.dataset.filterValue === value;
      button.setAttribute("aria-pressed", String(isActive));
      button.dataset.state = isActive ? "active" : "idle";
    });

    if (emptyState) {
      emptyState.hidden = visibleCount > 0;
    }
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () =>
      applyFilter(button.dataset.filterValue ?? "all"),
    );
  });

  applyFilter("all");
};

document
  .querySelectorAll<HTMLElement>("[data-filter-group]")
  .forEach((root) => initFilterGroup(root));
