(() => {
  const body = document.body;
  const nav = document.querySelector("[data-nav]");
  const menuButton = document.querySelector("[data-menu-toggle]");
  const navPanel = document.querySelector("[data-nav-panel]");

  if (menuButton && navPanel) {
    menuButton.addEventListener("click", () => {
      const open = body.classList.toggle("nav-open");
      menuButton.setAttribute("aria-expanded", String(open));
      navPanel.setAttribute("aria-hidden", String(!open));
    });
  }

  document.querySelectorAll("[data-lang-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const wrap = button.closest("[data-lang]");
      const open = wrap?.classList.toggle("is-open") ?? false;
      button.setAttribute("aria-expanded", String(open));
    });
  });

  const currentPath = window.location.pathname.replace(/\/index\.html$/, "/");
  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    const normalized = new URL(href, window.location.origin).pathname;
    if (normalized === currentPath) link.classList.add("is-active");
  });

  const slider = document.querySelector("[data-hero-slider]");
  if (slider) {
    const slides = [...slider.querySelectorAll("[data-slide]")];
    const dots = [...document.querySelectorAll("[data-slide-dot]")];
    let active = 0;
    let timer = null;

    const activate = (index) => {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === active;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === active);
        dot.setAttribute("aria-current", dotIndex === active ? "true" : "false");
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
      if (note) note.textContent = "Заявка подготовлена. Напишите нам в мессенджер или на почту - ответим с деталями по направлению.";
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && body.classList.contains("nav-open")) {
      body.classList.remove("nav-open");
      menuButton?.setAttribute("aria-expanded", "false");
      navPanel?.setAttribute("aria-hidden", "true");
    }
  });

  window.addEventListener("scroll", () => {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 8);
  }, { passive: true });
})();
