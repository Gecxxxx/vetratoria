(() => {
  const body = document.body;
  const nav = document.querySelector("[data-nav]");
  const menuButton = document.querySelector("[data-menu-toggle]");
  const navPanel = document.querySelector("[data-nav-panel]");
  const mobileMenu = window.matchMedia("(max-width: 1180px)");

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

  document.querySelectorAll("[data-trust-prev], [data-trust-next]").forEach((button) => {
    button.addEventListener("click", () => {
      const trackName = button.dataset.trustPrev || button.dataset.trustNext;
      const track = document.querySelector(`[data-trust-track="${trackName}"]`);
      if (!track) return;

      const card = track.querySelector(".trust-card");
      const cardGap = Number.parseFloat(window.getComputedStyle(track).columnGap || "0") || 0;
      const step = card ? card.getBoundingClientRect().width + cardGap : track.clientWidth * 0.82;
      track.scrollBy({
        left: button.dataset.trustPrev ? -step : step,
        behavior: "smooth"
      });
    });
  });

  document.querySelectorAll("[data-station-slider]").forEach((stationSlider) => {
    const slides = [...stationSlider.querySelectorAll("[data-station-slide]")];
    const prev = stationSlider.querySelector("[data-station-prev]");
    const next = stationSlider.querySelector("[data-station-next]");
    let active = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));

    const activate = (index) => {
      if (!slides.length) return;
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === active;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
      });
    };

    prev?.addEventListener("click", () => activate(active - 1));
    next?.addEventListener("click", () => activate(active + 1));
    activate(active);
  });

  document.querySelectorAll("[data-card-slider]").forEach((cardSlider) => {
    const track = cardSlider.querySelector("[data-card-slider-track]");
    const prev = cardSlider.querySelector("[data-card-slider-prev]");
    const next = cardSlider.querySelector("[data-card-slider-next]");
    if (!track) return;

    const scrollStep = () => {
      const card = track.querySelector(".team-card");
      const gap = Number.parseFloat(window.getComputedStyle(track).columnGap || "0") || 0;
      return card ? card.getBoundingClientRect().width + gap : track.clientWidth;
    };

    const updateControls = () => {
      const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= maxScroll - 2;
    };

    const move = (direction) => {
      track.scrollBy({ left: scrollStep() * direction, behavior: "smooth" });
    };

    prev?.addEventListener("click", () => move(-1));
    next?.addEventListener("click", () => move(1));
    track.addEventListener("scroll", updateControls, { passive: true });
    track.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      move(event.key === "ArrowLeft" ? -1 : 1);
    });

    if (typeof ResizeObserver === "function") {
      new ResizeObserver(updateControls).observe(track);
    }
    updateControls();
  });

  document.querySelectorAll("[data-blog-filter-root]").forEach((filterRoot) => {
    const cards = [...filterRoot.querySelectorAll("[data-blog-filter-card]")];
    const buttons = [...filterRoot.querySelectorAll("[data-blog-filter-type]")];
    const search = filterRoot.querySelector("[data-blog-filter-search]");
    const status = filterRoot.querySelector("[data-blog-filter-status]");
    const empty = filterRoot.querySelector("[data-blog-filter-empty]");
    if (!cards.length) return;

    const selected = {
      country: "all",
      topic: "all"
    };

    const normalize = (value) =>
      String(value || "")
        .toLocaleLowerCase("ru")
        .replaceAll("ё", "е")
        .trim();

    const applyFilters = () => {
      const query = normalize(search?.value);
      let visible = 0;

      cards.forEach((card) => {
        const topics = (card.dataset.blogTopics || "").split(/\s+/).filter(Boolean);
        const matchesCountry = selected.country === "all" || card.dataset.blogCountry === selected.country;
        const matchesTopic = selected.topic === "all" || topics.includes(selected.topic);
        const matchesSearch = !query || normalize(card.dataset.blogSearch).includes(query);
        const matches = matchesCountry && matchesTopic && matchesSearch;
        card.hidden = !matches;
        if (matches) visible += 1;
      });

      if (status) status.textContent = `Показано: ${visible} из ${cards.length}`;
      if (empty) empty.hidden = visible > 0;
    };

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const type = button.dataset.blogFilterType;
        if (!type || !(type in selected)) return;
        selected[type] = button.dataset.blogFilterValue || "all";
        buttons
          .filter((candidate) => candidate.dataset.blogFilterType === type)
          .forEach((candidate) => candidate.setAttribute("aria-pressed", String(candidate === button)));
        applyFilters();
      });
    });

    search?.addEventListener("input", applyFilters);
    search?.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !search.value) return;
      search.value = "";
      applyFilters();
    });

    applyFilters();
  });

  const countryOption = (form) => form.querySelector("[data-contact-country-select]")?.selectedOptions?.[0];

  const contactPayload = (form) => {
    const data = new FormData(form);
    const option = countryOption(form);
    const country = String(data.get("country") || option?.value || "").trim();
    const sport = String(data.get("sport") || "").trim();
    const intent = String(data.get("intent") || "").trim();
    const direction = form.dataset.direction || option?.textContent?.trim() || "Vetratoria";

    return {
      name: String(data.get("name") || "").trim(),
      contact: String(data.get("contact") || "").trim(),
      country,
      sport,
      intent,
      direction,
      message: String(data.get("message") || "").trim(),
      source: String(data.get("source") || window.location.pathname).trim(),
      pageUrl: window.location.href
    };
  };

  const contactRecipient = (form) => form.dataset.mailTo || countryOption(form)?.dataset.email || "";

  const submitContactForm = async (form, payload, note) => {
    const endpoint = form.dataset.endpoint;
    if (endpoint) {
      const submitButton = form.querySelector("[type='submit']");
      submitButton?.setAttribute("disabled", "");
      if (note) note.textContent = "Отправляем заявку...";

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`Contact endpoint returned ${response.status}`);
        if (note) note.textContent = "Заявка отправлена. Скоро мы свяжемся с вами.";
        form.reset();
      } catch (error) {
        if (note) note.textContent = "Не удалось отправить заявку. Напишите нам в WhatsApp или Telegram.";
      } finally {
        submitButton?.removeAttribute("disabled");
      }
      return;
    }

    const recipient = contactRecipient(form);
    if (!recipient) {
      if (note) note.textContent = "Выберите направление для заявки.";
      return;
    }

    const subject = `Заявка Vetratoria: ${payload.direction}`;
    const mailBody = [
      `Имя: ${payload.name}`,
      `Способ связи: ${payload.contact}`,
      `Направление: ${payload.direction}`,
      payload.sport ? `Спорт: ${payload.sport}` : "",
      payload.intent ? `Запрос: ${payload.intent}` : "",
      payload.message ? `Комментарий: ${payload.message}` : "Комментарий: не указан",
      `Страница: ${payload.pageUrl}`
    ].filter(Boolean).join("\n");

    if (note) note.textContent = "Заявка подготовлена. Открываем почтовое приложение.";
    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailBody)}`;
  };

  document.querySelectorAll("form[data-contact-form]").forEach((form) => {
    const note = form.querySelector("[data-form-note]");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = contactPayload(form);

      if (!payload.name || !payload.contact) {
        if (note) note.textContent = "Заполните имя и удобный способ связи.";
        return;
      }

      document.dispatchEvent(new CustomEvent("vetratoria:contact-submit", { detail: payload }));
      await submitContactForm(form, payload, note);
    });
  });

  const contactDialog = document.querySelector("[data-contact-dialog]");
  const contactModalForm = contactDialog?.querySelector("[data-contact-modal-form]");
  const contactModalTitle = contactDialog?.querySelector("[data-contact-modal-title]");
  const contactModalContext = contactDialog?.querySelector("[data-contact-modal-context]");
  const directPhone = contactDialog?.querySelector("[data-contact-direct-phone]");
  const directPhoneLabel = contactDialog?.querySelector("[data-contact-direct-phone-label]");
  const directTelegram = contactDialog?.querySelector("[data-contact-direct-telegram]");

  const updateDirectContacts = ({ country, phone, telegram }) => {
    if (directPhone && phone) {
      const digits = phone.replace(/\D/g, "");
      const isDahab = country === "dahab";
      directPhone.href = isDahab ? `https://wa.me/${digits}` : `tel:${phone}`;
      directPhoneLabel.textContent = isDahab ? "WhatsApp" : "Телефон";
      if (isDahab) {
        directPhone.target = "_blank";
        directPhone.rel = "noopener noreferrer";
      } else {
        directPhone.removeAttribute("target");
        directPhone.removeAttribute("rel");
      }
    }
    if (directTelegram && telegram) directTelegram.href = telegram;
  };

  const syncModalCountry = () => {
    if (!contactModalForm) return;
    const option = countryOption(contactModalForm);
    if (!option) return;

    const sport = contactModalForm.querySelector("[data-contact-sport-input]")?.value || "";
    contactModalForm.dataset.mailTo = option.dataset.email || "";
    contactModalForm.dataset.direction = [option.textContent.trim(), sport].filter(Boolean).join(" · ");
    if (contactModalContext) contactModalContext.textContent = contactModalForm.dataset.direction;
    updateDirectContacts({
      country: option.value,
      phone: option.dataset.phone || "",
      telegram: option.dataset.telegram || ""
    });
  };

  contactModalForm?.querySelector("[data-contact-country-select]")?.addEventListener("change", syncModalCountry);

  document.querySelectorAll("[data-contact-modal]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      if (!contactDialog || !contactModalForm || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();

      contactModalForm.reset();
      const intent = trigger.dataset.contactIntent || trigger.textContent.trim() || "Написать нам";
      const sport = trigger.dataset.contactSport || "";
      const country = trigger.dataset.contactCountry || "";
      const countryLabel = trigger.dataset.contactCountryLabel || "";
      const intentInput = contactModalForm.querySelector("[data-contact-intent-input]");
      const sportInput = contactModalForm.querySelector("[data-contact-sport-input]");
      const countryInput = contactModalForm.querySelector("[data-contact-country-input]");
      const countrySelect = contactModalForm.querySelector("[data-contact-country-select]");
      const note = contactModalForm.querySelector("[data-form-note]");

      if (intentInput) intentInput.value = intent;
      if (sportInput) sportInput.value = sport;
      if (countryInput && country) countryInput.value = country;
      if (countrySelect && country) countrySelect.value = country;
      if (note) note.textContent = "";

      const option = countryOption(contactModalForm);
      const selectedCountry = country || option?.value || "";
      const selectedCountryLabel = countryLabel || option?.textContent?.trim() || "Vetratoria";
      const direction = [selectedCountryLabel, sport].filter(Boolean).join(" · ");
      contactModalForm.dataset.direction = direction;
      contactModalForm.dataset.mailTo = trigger.dataset.contactEmail || option?.dataset.email || contactModalForm.dataset.mailTo;

      if (contactModalTitle) contactModalTitle.textContent = intent;
      if (contactModalContext) contactModalContext.textContent = direction;

      updateDirectContacts({
        country: selectedCountry,
        phone: trigger.dataset.contactPhone || option?.dataset.phone || "",
        telegram: trigger.dataset.contactTelegram || option?.dataset.telegram || ""
      });

      contactDialog.showModal();
      body.classList.add("contact-modal-open");
      window.setTimeout(() => contactModalForm.elements.name?.focus(), 0);
    });
  });

  contactDialog?.querySelectorAll("[data-contact-close]").forEach((button) => {
    button.addEventListener("click", () => contactDialog.close());
  });

  contactDialog?.addEventListener("click", (event) => {
    if (event.target === contactDialog) contactDialog.close();
  });

  contactDialog?.addEventListener("close", () => {
    body.classList.remove("contact-modal-open");
  });

  window.addEventListener("scroll", () => {
    updateNavBottom();
    nav?.classList.toggle("is-scrolled", window.scrollY > 8);
  }, { passive: true });

  window.addEventListener("resize", updateNavBottom);
})();
