(() => {
  const header = document.querySelector("#topnav");
  const toggle = header?.querySelector(".mobile-menu-toggle");
  const navigation = header?.querySelector("#primary-navigation");

  if (!header || !toggle || !navigation) return;

  const mobileQuery = window.matchMedia("(max-width: 900px)");

  const setOpen = (open, returnFocus = false) => {
    const isOpen = mobileQuery.matches && open;

    header.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu",
    );

    if (returnFocus) toggle.focus();
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false, true);
    }
  });

  const closeOnBreakpointChange = () => setOpen(false);
  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener("change", closeOnBreakpointChange);
  } else {
    mobileQuery.addListener(closeOnBreakpointChange);
  }
})();
