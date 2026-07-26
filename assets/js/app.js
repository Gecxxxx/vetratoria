(() => {
  const body = document.body;
  const nav = document.querySelector("[data-nav]");
  const menuButton = document.querySelector("[data-menu-toggle]");
  const navPanel = document.querySelector("[data-nav-panel]");
  const mobileMenu = window.matchMedia("(max-width: 900px)");

  const dropdowns = [...document.querySelectorAll("[data-dropdown]")];

  const updateNavBottom = () => {
    if (!nav) return;
    document.documentElement.style.setProperty("--nav-bottom", `${Math.max(0, Math.round(nav.getBoundingClientRect().bottom))}px`);
  };

  const closeDropdowns = (except = null) => {
    dropdowns.forEach((dropdown) => {
      if (dropdown === except) return;
      dropdown.classList.remove("is-open");
      dropdown.querySelector("[data-dropdown-toggle]")?.setAttribute("aria-expanded", "false");
    });
  };

  const setMenuOpen = (open) => {
    body.classList.toggle("nav-open", open);
    menuButton?.setAttribute("aria-expanded", String(open));
    navPanel?.setAttribute("aria-hidden", String(mobileMenu.matches ? !open : false));
    if (!open) closeDropdowns();
  };

  const syncMenuMode = () => {
    if (mobileMenu.matches) {
      navPanel?.setAttribute("aria-hidden", String(!body.classList.contains("nav-open")));
      return;
    }
    body.classList.remove("nav-open");
    menuButton?.setAttribute("aria-expanded", "false");
    navPanel?.setAttribute("aria-hidden", "false");
  };

  menuButton?.addEventListener("click", () => {
    setMenuOpen(!body.classList.contains("nav-open"));
  });

  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector("[data-dropdown-toggle]");
    if (!toggle) return;

    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const willOpen = !dropdown.classList.contains("is-open");
      updateNavBottom();
      closeDropdowns(dropdown);
      dropdown.classList.toggle("is-open", willOpen);
      toggle.setAttribute("aria-expanded", String(willOpen));
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest("[data-dropdown]")) closeDropdowns();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeDropdowns();
    if (body.classList.contains("nav-open")) setMenuOpen(false);
  });

  if (typeof mobileMenu.addEventListener === "function") {
    mobileMenu.addEventListener("change", syncMenuMode);
  } else {
    mobileMenu.addListener(syncMenuMode);
  }

  syncMenuMode();
  updateNavBottom();

  const currentPath = window.location.pathname.replace(/\/index\.html$/, "/");
  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

    const url = new URL(href, window.location.origin);
    if (url.origin === window.location.origin && url.pathname === currentPath) {
      link.classList.add("is-active");
    }
  });

  const slider = document.querySelector("[data-hero-slider]");
  if (slider) {
    const slides = [...slider.querySelectorAll("[data-slide]")];
    const dots = [...document.querySelectorAll("[data-slide-dot]")];
    let active = 0;
    let timer = null;

    const activate = (index) => {
      if (!slides.length) return;
      active = (index + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === active;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
      });

      dots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === active;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-current", String(isActive));
      });
    };

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        activate(index);
        if (timer) window.clearInterval(timer);
      });
    });

    activate(0);

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && slides.length > 1) {
      timer = window.setInterval(() => activate(active + 1), 4500);
    }
  }

  document.querySelectorAll("form[data-contact-form]").forEach((form) => {
    const note = form.querySelector("[data-form-note]");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (note) {
        note.textContent = "Заявка подготовлена. Напишите нам в мессенджер или на почту, ответим с деталями по направлению.";
      }
    });
  });

  window.addEventListener("scroll", () => {
    updateNavBottom();
    nav?.classList.toggle("is-scrolled", window.scrollY > 8);
  }, { passive: true });

  window.addEventListener("resize", updateNavBottom);
})();
