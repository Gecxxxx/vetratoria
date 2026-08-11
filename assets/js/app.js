(() => {
  const body = document.body;

  // Remove an accidental tool-output banner that was prepended to generated HTML.
  // Keeping this guard here also protects older cached pages during the rollout.
  const injectedOutputWarning = /^Warning: truncated output \(original token count: \d+\)\s*Total output lines: \d+\s*/;
  [...body.childNodes].forEach((node) => {
    if (node.nodeType !== Node.TEXT_NODE || !injectedOutputWarning.test(node.textContent || "")) return;
    node.textContent = (node.textContent || "").replace(injectedOutputWarning, "");
  });

  const nav = document.querySelector("[data-nav]");
  const menuButton = document.querySelector("[data-menu-toggle]");
  const navPanel = document.querySelector("[data-nav-panel]");
  const mobileMenu = window.matchMedia("(max-width: 1180px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarsePointer = window.matchMedia("(pointer: coarse)");

  const dropdowns = [...document.querySelectorAll("[data-dropdown]")];
  let navScrollFrame = null;
  let compactNavCloseTimer = null;

  const COMPACT_NAV_THRESHOLD = 140;
  const COMPACT_NAV_CLOSE_DELAY = 500;
  const isCompactNavEnabled = () => !mobileMenu.matches && !reducedMotion.matches;

  const clearCompactNavCloseTimer = () => {
    if (compactNavCloseTimer === null) return;
    window.clearTimeout(compactNavCloseTimer);
    compactNavCloseTimer = null;
  };

  const setCompactPreview = (open) => {
    if (!nav || !isCompactNavEnabled()) return;
    clearCompactNavCloseTimer();
    nav.classList.toggle("is-compact-preview", open && nav.classList.contains("is-compact"));
  };

  const scheduleCompactPreviewClose = () => {
    if (!nav?.classList.contains("is-compact") || !isCompactNavEnabled()) return;
    clearCompactNavCloseTimer();
    compactNavCloseTimer = window.setTimeout(() => {
      nav.classList.remove("is-compact-preview");
      compactNavCloseTimer = null;
    }, COMPACT_NAV_CLOSE_DELAY);
  };

  const syncNavScroll = () => {
    navScrollFrame = null;
    const scrollY = Math.max(0, window.scrollY);
    nav?.classList.toggle("is-scrolled", scrollY > 8);

    if (!nav || !isCompactNavEnabled()) {
      nav?.classList.remove("is-compact", "is-compact-preview");
      clearCompactNavCloseTimer();
      return;
    }

    if (scrollY <= COMPACT_NAV_THRESHOLD) {
      nav.classList.remove("is-compact", "is-compact-preview");
      clearCompactNavCloseTimer();
      return;
    }

    // Below the threshold the header stays compact in either scroll direction.
    // Scrolling also closes a hover/focus preview immediately.
    nav.classList.add("is-compact");
    nav.classList.remove("is-compact-preview");
    clearCompactNavCloseTimer();
  };

  const scheduleNavScroll = () => {
    if (navScrollFrame !== null) return;
    navScrollFrame = window.requestAnimationFrame(syncNavScroll);
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
    menuButton?.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
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
    menuButton?.setAttribute("aria-label", "Открыть меню");
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

  nav?.addEventListener("pointerenter", () => setCompactPreview(true));
  nav?.addEventListener("pointerleave", scheduleCompactPreviewClose);
  nav?.addEventListener("focusin", () => setCompactPreview(true));
  nav?.addEventListener("focusout", (event) => {
    if (event.relatedTarget instanceof Node && nav.contains(event.relatedTarget)) return;
    scheduleCompactPreviewClose();
  });

  syncMenuMode();
  syncNavScroll();

  const revealItems = [...document.querySelectorAll("[data-reveal]")];
  revealItems.forEach((item) => {
    const siblings = item.parentElement
      ? [...item.parentElement.children].filter((child) => child.hasAttribute("data-reveal"))
      : [];
    const position = siblings.indexOf(item);
    if (position > 0) item.style.setProperty("--reveal-delay", `${Math.min(position * 70, 210)}ms`);
  });
  if (revealItems.length && !reducedMotion.matches && "IntersectionObserver" in window) {
    document.documentElement.classList.add("reveal-ready");
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.12 });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const monthKeys = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const currentMonthKey = monthKeys[new Date().getMonth()];
  document.querySelectorAll(`[data-month="${currentMonthKey}"]`).forEach((month) => {
    month.classList.add("is-current");
    month.setAttribute("aria-label", `${month.getAttribute("aria-label")}; текущий месяц`);
    month.setAttribute("title", "Текущий месяц");
  });

  document.querySelectorAll("[data-exclusive-accordion]").forEach((accordion) => {
    const items = [...accordion.querySelectorAll("details")];
    if (!items.length) return;

    const syncState = (item) => {
      item.querySelector("summary")?.setAttribute("aria-expanded", String(item.open));
    };

    items.forEach((item) => {
      item.addEventListener("toggle", () => {
        if (item.open) {
          items.forEach((otherItem) => {
            if (otherItem !== item && otherItem.open) otherItem.removeAttribute("open");
          });
        }
        syncState(item);
      });
      syncState(item);
    });
  });

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
    let preloadTimer = null;

    const loadSlide = (slide) => {
      const deferredSource = slide?.dataset.src;
      if (!deferredSource) return;
      slide.src = deferredSource;
      slide.removeAttribute("data-src");
    };

    const preloadFollowingSlide = () => {
      if (preloadTimer) window.clearTimeout(preloadTimer);
      if (document.hidden || reducedMotion.matches || slides.length < 2) return;
      preloadTimer = window.setTimeout(() => {
        loadSlide(slides[(active + 1) % slides.length]);
        preloadTimer = null;
      }, 600);
    };

    const stop = () => {
      if (timer) window.clearInterval(timer);
      if (preloadTimer) window.clearTimeout(preloadTimer);
      timer = null;
      preloadTimer = null;
    };

    const start = () => {
      stop();
      if (!document.hidden && !reducedMotion.matches && slides.length > 1) {
        timer = window.setInterval(() => activate(active + 1), 4500);
      }
    };

    const activate = (index) => {
      if (!slides.length) return;
      active = (index + slides.length) % slides.length;
      loadSlide(slides[active]);

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

      preloadFollowingSlide();
    };

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        activate(index);
        start();
      });
    });

    activate(0);
    start();
    document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
    reducedMotion.addEventListener?.("change", start);
  }

  document.querySelectorAll("[data-brand-slider]").forEach((brandSlider) => {
    const slides = [...brandSlider.querySelectorAll("[data-brand-slide]")];
    const prev = brandSlider.querySelector("[data-brand-prev]");
    const next = brandSlider.querySelector("[data-brand-next]");
    let active = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));
    let timer = null;

    const activate = (index) => {
      if (!slides.length) return;
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === active;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
      });
    };

    const stop = () => {
      if (!timer) return;
      window.clearInterval(timer);
      timer = null;
    };

    const start = () => {
      stop();
      if (!document.hidden && !reducedMotion.matches && slides.length > 1) {
        timer = window.setInterval(() => activate(active + 1), 5000);
      }
    };

    prev?.addEventListener("click", () => {
      activate(active - 1);
      start();
    });
    next?.addEventListener("click", () => {
      activate(active + 1);
      start();
    });
    document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
    reducedMotion.addEventListener?.("change", start);

    activate(active);
    start();
  });

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
        behavior: reducedMotion.matches || coarsePointer.matches ? "auto" : "smooth"
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
      track.scrollBy({ left: scrollStep() * direction, behavior: reducedMotion.matches || coarsePointer.matches ? "auto" : "smooth" });
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

  document.querySelectorAll("[data-life-slider]").forEach((slider) => {
    const track = slider.querySelector("[data-life-track]");
    const prev = slider.querySelector("[data-life-prev]");
    const next = slider.querySelector("[data-life-next]");
    const featured = slider.querySelector("[data-life-featured]");
    const featuredImage = featured?.querySelector("img");
    const current = slider.querySelector("[data-life-current]");
    const thumbs = [...slider.querySelectorAll("[data-life-thumb]")];
    if (!track || !featured || !featuredImage || !thumbs.length) return;

    let activeIndex = 0;

    const activate = (index, shouldScroll = true) => {
      activeIndex = (index + thumbs.length) % thumbs.length;
      const thumb = thumbs[activeIndex];
      featuredImage.src = thumb.dataset.mediaSrc || "";
      featuredImage.alt = thumb.dataset.mediaAlt || "";
      featured.dataset.mediaPhotoIndex = String(activeIndex);
      featured.dataset.mediaSrc = thumb.dataset.mediaSrc || "";
      featured.dataset.mediaAlt = thumb.dataset.mediaAlt || "";
      featured.setAttribute("aria-label", `Открыть фотографию ${activeIndex + 1} из ${thumbs.length} на весь экран`);
      if (current) current.textContent = String(activeIndex + 1).padStart(2, "0");
      thumbs.forEach((item, itemIndex) => {
        const selected = itemIndex === activeIndex;
        item.classList.toggle("is-active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      if (shouldScroll) thumb.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "nearest", inline: "nearest" });
    };

    thumbs.forEach((thumb, index) => thumb.addEventListener("click", () => activate(index)));
    prev?.addEventListener("click", () => activate(activeIndex - 1));
    next?.addEventListener("click", () => activate(activeIndex + 1));
    track.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      activate(activeIndex + (event.key === "ArrowLeft" ? -1 : 1));
    });
    activate(0, false);
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

  document.querySelectorAll("[data-media-filter-root]").forEach((filterRoot) => {
    const cards = [...filterRoot.querySelectorAll("[data-media-filter-card]")];
    const selects = [...filterRoot.querySelectorAll("[data-media-filter]")];
    const search = filterRoot.querySelector("[data-media-filter-search]");
    const status = filterRoot.querySelector("[data-media-filter-status]");
    const empty = filterRoot.querySelector("[data-media-filter-empty]");
    if (!cards.length) return;

    const normalize = (value) =>
      String(value || "")
        .toLocaleLowerCase("ru")
        .replaceAll("ё", "е")
        .trim();

    const applyMediaFilters = () => {
      const selected = Object.fromEntries(selects.map((select) => [select.dataset.mediaFilter, select.value]));
      const query = normalize(search?.value);
      let visible = 0;

      cards.forEach((card) => {
        const matchesYear = !selected.year || selected.year === "all" || card.dataset.mediaYear === selected.year;
        const matchesSport = !selected.sport || selected.sport === "all" || card.dataset.mediaSport === selected.sport;
        const matchesEvent = !selected.event || selected.event === "all" || card.dataset.mediaEvent === selected.event;
        const matchesSearch = !query || normalize(card.dataset.mediaSearch).includes(query);
        const matches = matchesYear && matchesSport && matchesEvent && matchesSearch;
        card.hidden = !matches;
        if (matches) visible += 1;
      });

      if (status) status.textContent = `Показано альбомов: ${visible} из ${cards.length}`;
      if (empty) empty.hidden = visible > 0;
    };

    selects.forEach((select) => select.addEventListener("change", applyMediaFilters));
    search?.addEventListener("input", applyMediaFilters);
    search?.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !search.value) return;
      search.value = "";
      applyMediaFilters();
    });

    applyMediaFilters();
  });

  document.querySelectorAll("[data-media-lightbox]").forEach((dialog) => {
    const group = dialog.dataset.mediaLightbox || "";
    const photoButtons = [...document.querySelectorAll("[data-media-photo-open]")]
      .filter((button) => group ? button.dataset.mediaGroup === group : !button.dataset.mediaGroup);
    const photoSources = [...document.querySelectorAll("[data-media-photo-source]")]
      .filter((button) => group ? button.dataset.mediaGroup === group : !button.dataset.mediaGroup);
    const photos = photoSources.length ? photoSources : photoButtons;
    const image = dialog.querySelector("[data-media-lightbox-image]");
    const count = dialog.querySelector("[data-media-lightbox-count]");
    const download = dialog.querySelector("[data-media-lightbox-download]");
    const close = dialog.querySelector("[data-media-lightbox-close]");
    const prev = dialog.querySelector("[data-media-lightbox-prev]");
    const next = dialog.querySelector("[data-media-lightbox-next]");
    if (!photoButtons.length || !photos.length || !image) return;

    let activeIndex = 0;

    const showPhoto = (index) => {
      activeIndex = (index + photos.length) % photos.length;
      const button = photos[activeIndex];
      const src = button.dataset.mediaSrc;
      image.src = src;
      image.alt = button.dataset.mediaAlt || "";
      if (count) count.textContent = `${activeIndex + 1} из ${photos.length}`;
      if (download) download.href = src;
    };

    photoButtons.forEach((button, index) => {
      button.addEventListener("click", () => {
        showPhoto(Number.parseInt(button.dataset.mediaPhotoIndex || String(index), 10));
        dialog.showModal();
      });
    });

    close?.addEventListener("click", () => dialog.close());
    prev?.addEventListener("click", () => showPhoto(activeIndex - 1));
    next?.addEventListener("click", () => showPhoto(activeIndex + 1));
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") showPhoto(activeIndex - 1);
      if (event.key === "ArrowRight") showPhoto(activeIndex + 1);
    });
    dialog.addEventListener("close", () => photoButtons[0]?.focus());
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

  window.addEventListener("scroll", scheduleNavScroll, { passive: true });
  window.addEventListener("resize", scheduleNavScroll, { passive: true });
  window.addEventListener("pageshow", () => {
    setMenuOpen(false);
    document.querySelectorAll("dialog[open]").forEach((dialog) => dialog.close());
    body.classList.remove("contact-modal-open");
    lastScrollY = window.scrollY;
    scheduleNavScroll();
  });
  window.addEventListener("pagehide", () => {
    body.classList.remove("nav-open", "contact-modal-open");
  });
})();