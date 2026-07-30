import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { allPages, articles, countriesByKey, site } from "../src/pages.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const img = (name) => `/assets/img/home-uploaded/${name}`;

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const countryList = site.countries;

const pathToFile = (path) => {
  if (path === "/") return join(root, "index.html");
  return join(root, ...path.replace(/^\/|\/$/g, "").split("/"), "index.html");
};

const cardImage = (image, alt = "") =>
  `<img src="${image}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async">`;

const sectionHeading = (eyebrow, title, lead) => `
  <header class="section-heading">
    <p class="eyebrow">${escapeHtml(eyebrow)}</p>
    <h2>${escapeHtml(title)}</h2>
    ${lead ? `<p>${escapeHtml(lead)}</p>` : ""}
  </header>`;

const sportFeatureGrid = (items) => `
    <div class="dahab-sport-feature-grid dahab-sport-feature-grid--media">
      ${items.map(([title, text, image, alt], index) => `
        <article>
          <img src="${image}" alt="${escapeHtml(alt)}" width="1080" height="1080" loading="lazy" decoding="async">
          <div>
            <span>0${index + 1}</span>
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(text)}</p>
          </div>
        </article>`).join("")}
    </div>`;

const currentCountry = (page) =>
  countryList.find((country) => page.country === country.key || page.galleryCountry === country.key || page.path.startsWith(`/${country.key}/`));

const arrow = '<span class="vtr-nav__chevron" aria-hidden="true">⌄</span>';

const socialIconLinks = (className = "") => `
  <nav class="social-icon-links${className ? ` ${className}` : ""}" aria-label="Социальные сети Vetratoria">
    ${site.socials.map((item) => `
      <a href="${item.href}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(item.label)}" title="${escapeHtml(item.label)}">
        <img src="${item.icon}" alt="" width="20" height="20">
      </a>`).join("")}
  </nav>`;

const contactForPage = (page) => site.contacts[page.country] || site.contacts.dahab;

const contactCountryForPage = (page) => currentCountry(page);

const contactPagePath = (page) => {
  const country = contactCountryForPage(page);
  return country ? `/${country.key}/contacts/` : "/contacts/";
};

const contactDestination = (page, sportKey = page.sport) => {
  const country = contactCountryForPage(page);
  if (country?.key === "dahab" && sportKey === "wingfoil") {
    return site.dahabStations.find((station) => station.key === "wingfoil");
  }
  return country ? site.contacts[country.key] : null;
};

const contactCta = (page, label, className = "button button-primary", sportKey = page.sport) => {
  const country = contactCountryForPage(page);
  const destination = contactDestination(page, sportKey);
  const attributes = [
    className ? `class="${className}"` : "",
    `href="${contactPagePath(page)}"`,
    "data-contact-modal",
    `data-contact-intent="${escapeHtml(label)}"`,
    country ? `data-contact-country="${country.key}"` : "",
    country ? `data-contact-country-label="${escapeHtml(site.contacts[country.key].title)}"` : "",
    sportKey ? `data-contact-sport="${escapeHtml(sportLabel(sportKey))}"` : "",
    destination?.formEmail || destination?.email ? `data-contact-email="${escapeHtml(destination.formEmail || destination.email)}"` : "",
    destination?.phone ? `data-contact-phone="${escapeHtml(destination.phone)}"` : "",
    destination?.telegram ? `data-contact-telegram="${escapeHtml(destination.telegram)}"` : ""
  ].filter(Boolean).join(" ");
  return `<a ${attributes}>${escapeHtml(label)}</a>`;
};

const sportLabel = (sportKey) => sportKey === "windsurf-kids" ? "Kids" : site.sports[sportKey].nav;

const countrySportSummary = (country) => country.sports.map(sportLabel).join(", ");

const navButton = (label, className = "vtr-nav__link") =>
  `<button class="${className}" type="button" aria-expanded="false" data-dropdown-toggle>${label} ${arrow}</button>`;

const directionsMenu = () => `
      <div class="vtr-nav__item vtr-nav__item--drop vtr-nav__item--directions" data-dropdown>
        ${navButton("Направления")}
        <div class="vtr-nav__dropdown vtr-nav__dropdown--directions">
          ${countryList.map((country) => `<a href="${country.href}"><b>${country.nav} · ${country.city}</b><span>${countrySportSummary(country)}</span></a>`).join("")}
        </div>
      </div>`;

const mobileRowClass = (active = false) => `vtr-mobile-menu__row${active ? " is-active" : ""}`;

const mobileDropdown = (label, active, items) => `
        <div class="vtr-mobile-menu__item vtr-mobile-menu__item--drop${active ? " is-active" : ""}" data-dropdown>
          ${navButton(label, mobileRowClass(active))}
          <div class="vtr-mobile-menu__submenu">
            ${items.map((item) => `<a class="${mobileRowClass(false)}" href="${item.href}">${item.label}</a>`).join("")}
          </div>
        </div>`;

const mobileDirectionsSection = () => `
      <section class="vtr-mobile-menu__block vtr-mobile-menu__block--accent" aria-label="Направления">
        <p class="vtr-mobile-menu__title">Направления:</p>
        ${countryList.map((country) => `
        <a class="vtr-mobile-menu__row vtr-mobile-menu__row--split" href="${country.href}">
          <span>${country.region} · ${country.city}</span>
          <span>${countrySportSummary(country)}</span>
        </a>`).join("")}
      </section>`;

const mobileCountrySection = (page, country) => {
  const priceSportKeys = country.key === "dahab" ? country.sports.filter((sportKey) => sportKey !== "windsurf-kids") : country.sports;
  const priceItems = priceSportKeys.map((sportKey) => ({
    label: site.sports[sportKey].nav,
    href: `/${country.key}/${sportKey}/price/`
  }));
  const pricePaths = priceItems.map((item) => item.href);
  const schoolItems = schoolDropdown(country);
  const schoolPaths = schoolItems.map((item) => item.href).filter((href) => href.startsWith(`/${country.key}/`));
  const sportLinks = country.key === "dahab"
    ? [
        { label: "Wingfoil", href: "/dahab/wingfoil/" },
        { label: "Windsurf", href: "/dahab/windsurf/" }
      ]
    : country.sports.map((sportKey) => ({
        label: site.sports[sportKey].nav,
        href: `/${country.key}/${sportKey}/`
      }));

  return `
      <section class="vtr-mobile-menu__block vtr-mobile-menu__block--accent" aria-label="Навигация ${country.title}">
        <p class="vtr-mobile-menu__title">${country.title}</p>
        <a class="${mobileRowClass(page.path === country.href)}" href="${country.href}">Обзор</a>
        ${sportLinks.map((item) => `<a class="${mobileRowClass(page.path === item.href)}" href="${item.href}">${item.label}</a>`).join("")}
        ${mobileDropdown("Цены", countrySectionActive(page, pricePaths), priceItems)}
        ${country.key === "dahab" ? `<a class="${mobileRowClass(countrySectionActive(page, ["/dahab/stations/"]))}" href="/dahab/stations/">Станции</a>` : ""}
        ${mobileDropdown("О школе", countrySectionActive(page, schoolPaths), schoolItems)}
      </section>`;
};

const mobileMenu = (page, country) => `
      <div class="vtr-mobile-menu" aria-label="Мобильная навигация">
        ${country ? mobileCountrySection(page, country) : mobileDirectionsSection()}
        <section class="vtr-mobile-menu__block" aria-label="Главное">
          <p class="vtr-mobile-menu__title">Главное</p>
          <a class="vtr-mobile-menu__row" href="/">Vetratoria</a>
          <a class="vtr-mobile-menu__row" href="/blog/">Блог</a>
          <a class="vtr-mobile-menu__row" href="/media/">Медиа</a>
          <a class="vtr-mobile-menu__row" href="${country ? `/${country.key}/contacts/` : "/contacts/"}">Контакты</a>
        </section>
        <section class="vtr-mobile-menu__block" aria-label="Контакты">
          <p class="vtr-mobile-menu__title">Контакты</p>
          <a class="vtr-mobile-menu__row" href="mailto:${contactForPage(page).email}">${contactForPage(page).email}</a>
          <a class="vtr-mobile-menu__row" href="tel:${contactForPage(page).phone}">${contactForPage(page).phoneLabel}</a>
          <a class="vtr-mobile-menu__row" href="${contactForPage(page).telegram}" target="_blank" rel="noopener noreferrer">Telegram</a>
          ${socialIconLinks("vtr-mobile-menu__socials")}
        </section>
      </div>`;

const mainNavPanel = (page, country) => `
    <nav class="vtr-nav__panel" aria-label="Основная навигация" data-nav-panel aria-hidden="false">
      <a class="vtr-nav__link" href="/">Vetratoria</a>
      ${directionsMenu()}
      <a class="vtr-nav__link" href="/blog/">Блог</a>
      <a class="vtr-nav__link" href="/media/">Медиа</a>
      <a class="vtr-nav__link${page.kind === "contacts" ? " is-active" : ""}" href="${country ? `/${country.key}/contacts/` : "/contacts/"}">Контакты</a>
      ${mobileMenu(page, country)}
    </nav>`;

const topNav = (page) => {
  const contact = contactForPage(page);
  return `
  <div class="vtr-nav__top">
    <div class="vtr-nav__contacts">
      <a href="mailto:${contact.email}">${contact.email}</a>
      <a href="tel:${contact.phone}">${contact.phoneLabel}</a>
    </div>
    <nav class="vtr-nav__countries" aria-label="Выбор страны">
      ${countryList.map((country) => `<a class="vtr-nav__country${page.country === country.key ? " is-active" : ""}" href="${country.href}">${country.nav}</a>`).join("")}
    </nav>
    <div class="vtr-nav__right">
      ${socialIconLinks("vtr-nav__socials")}
      <div class="vtr-nav__lang" data-dropdown>
        <button class="vtr-nav__lang-button" type="button" aria-expanded="false" data-dropdown-toggle>RU ${arrow}</button>
        <div class="vtr-nav__lang-menu">
          <a href="#">EN</a>
          <a href="#">DE</a>
        </div>
      </div>
    </div>
  </div>`;
};

const countrySectionActive = (page, paths) => paths.some((path) => page.path === path || page.path.startsWith(path));

const sectionLinkClass = (active) => `vtr-nav__section-link${active ? " is-active" : ""}`;

const schoolDropdown = (country) => country.key === "dahab" ? [
  { label: "Команда", href: "/dahab/team/" },
  { label: "Windsurf Kids", href: "/dahab/windsurf-kids/" },
  { label: "Безопасность", href: "/dahab/safety/" },
  { label: "Как добраться", href: "/dahab/how-to-get/" },
  { label: "Контакты", href: "/dahab/contacts/" }
] : [
  { label: "Команда", href: `/${country.key}/team/` },
  { label: "Блог", href: `/${country.key}/blog/` },
  { label: "Медиа", href: `/media/${country.key}/` },
  { label: "Контакты", href: `/${country.key}/contacts/` }
];

const sectionDropdown = (label, active, items) => `
    <div class="vtr-nav__section-item vtr-nav__section-item--drop${active ? " is-active" : ""}" data-dropdown>
      ${navButton(label, "vtr-nav__section-link")}
      <div class="vtr-nav__section-dropdown">
        ${items.map((item) => `<a href="${item.href}">${item.label}</a>`).join("")}
      </div>
    </div>`;

const countrySectionNav = (page, country) => {
  const priceSportKeys = country.key === "dahab" ? country.sports.filter((sportKey) => sportKey !== "windsurf-kids") : country.sports;
  const pricePaths = priceSportKeys.map((sportKey) => `/${country.key}/${sportKey}/price/`);
  const schoolItems = schoolDropdown(country);
  const schoolPaths = schoolItems.map((item) => item.href).filter((href) => href.startsWith(`/${country.key}/`));
  const baseLinks = country.key === "dahab"
    ? [
        `<a class="${sectionLinkClass(page.path === country.href)}" href="${country.href}">Обзор</a>`,
        `<a class="${sectionLinkClass(page.path === "/dahab/wingfoil/")}" href="/dahab/wingfoil/">Wingfoil</a>`,
        `<a class="${sectionLinkClass(page.path === "/dahab/windsurf/")}" href="/dahab/windsurf/">Windsurf</a>`,
        sectionDropdown("Цены", countrySectionActive(page, pricePaths), [
          { label: "Wingfoil", href: "/dahab/wingfoil/price/" },
          { label: "Windsurf", href: "/dahab/windsurf/price/" }
        ]),
        `<a class="${sectionLinkClass(countrySectionActive(page, ["/dahab/stations/"]))}" href="/dahab/stations/">Станции</a>`
      ]
    : [
        `<a class="${sectionLinkClass(page.path === country.href)}" href="${country.href}">Обзор</a>`,
        `<a class="${sectionLinkClass(page.path === `/${country.key}/windsurf/`)}" href="/${country.key}/windsurf/">Windsurf</a>`,
        `<a class="${sectionLinkClass(page.path === `/${country.key}/wingfoil/`)}" href="/${country.key}/wingfoil/">Wingfoil</a>`,
        `<a class="${sectionLinkClass(page.path === `/${country.key}/kite/`)}" href="/${country.key}/kite/">Kite</a>`,
        sectionDropdown("Цены", countrySectionActive(page, pricePaths), priceSportKeys.map((sportKey) => ({
          label: site.sports[sportKey].nav,
          href: `/${country.key}/${sportKey}/price/`
        })))
      ];

  return `
  <nav class="vtr-nav__section" aria-label="Навигация ${country.title}">
    ${baseLinks.join("")}
    ${sectionDropdown("О школе", countrySectionActive(page, schoolPaths), schoolItems)}
  </nav>`;
};

const header = (page) => {
  const country = currentCountry(page);
  const headerClass = `site-header vtr-nav${country ? ` vtr-nav--country vtr-nav--${country.key}` : " vtr-nav--home"}`;
  return `
<header class="${headerClass}" data-nav>
  ${topNav(country ? { ...page, country: country.key } : page)}
  <div class="vtr-nav__main">
    <a class="vtr-nav__logo" href="/" aria-label="Vetratoria - главная">
      <img src="${site.logo}" alt="Vetratoria" width="198" height="97">
    </a>
    <button class="vtr-nav__burger" type="button" aria-label="Открыть меню" aria-expanded="false" data-menu-toggle>
      <span></span><span></span><span></span>
    </button>
    ${mainNavPanel(page, country)}
  </div>
  ${country ? countrySectionNav(page, country) : ""}
</header>`;
};

const footer = (page) => {
  const contact = contactForPage(page);
  const contactsHref = page.country ? `/${page.country}/contacts/` : "/contacts/";
  return `
<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <img src="${site.logo}" alt="Vetratoria" width="198" height="97">
      <p>Vetratoria - windsurf и wingfoil школы в Египте, Вьетнаме и России. Выберите страну, спорт и формат обучения.</p>
      <div class="footer-stats">
        <span>С 2006 года</span>
        <span>3 страны</span>
        <span>Windsurf</span>
        <span>Wingfoil</span>
      </div>
    </div>
    <nav class="footer-nav" aria-label="Навигация в подвале">
      <div>
        <h3>Страны</h3>
        ${countryList.map((country) => `<a href="${country.href}">${country.region} · ${country.city}</a>`).join("")}
      </div>
      <div>
        <h3>Спорт</h3>
        <a href="/dahab/wingfoil/">Wingfoil Дахаб</a>
        <a href="/dahab/windsurf/">Windsurf Дахаб</a>
        <a href="/dahab/windsurf-kids/">Windsurf Kids</a>
      </div>
      <div>
        <h3>Материалы</h3>
        <a href="/blog/">Блог</a>
        <a href="/media/">Медиа</a>
        <a href="${contactsHref}">Контакты</a>
      </div>
      <div>
        <h3>Связь</h3>
        ${contactCta(page, "Написать нам", "")}
        <a href="mailto:${contact.email}">${contact.email}</a>
        <a href="tel:${contact.phone}">${contact.phoneLabel}</a>
      </div>
    </nav>
  </div>
  <div class="footer-bottom">
    <span>© 2026 Vetratoria</span>
    <span>Условия, расписание, цены и доступность форматов уточняются перед поездкой.</span>
  </div>
</footer>`;
};

const dahabFooter = (page) => `
<footer class="site-footer dahab-footer-pro">
  <div class="dahab-footer-pro__inner">
    <a class="dahab-footer-pro__brand" href="/" aria-label="Vetratoria - главная">
      <img src="${site.logo}" alt="Vetratoria" width="198" height="97">
      <p>Windsurf и Wingfoil в Египте, Вьетнаме и России.</p>
    </a>
    <div class="dahab-footer-pro__cards">
      <article>
        <h2>Контакты Дахаба</h2>
        <p>Напишите даты, уровень и спорт — подберём станцию.</p>
        <nav>${contactCta(page, "Оставить заявку", "")}<a href="/dahab/contacts/">Контакты станции</a></nav>
      </article>
      <article>
        <h2>Карта станций</h2>
        <p>Wing Center · Swiss Inn · Ganet Sinai</p>
      </article>
      <article>
        <h2>Соцсети</h2>
        ${socialIconLinks("dahab-footer-pro__socials")}
        <p>Следите за новостями станции и медиа с воды.</p>
      </article>
    </div>
  </div>
  <div class="dahab-footer-pro__bottom">
    <span>© 2026 Vetratoria</span>
    <span>Условия и доступность форматов подтверждаются перед поездкой.</span>
  </div>
</footer>`;

const footerForPage = (page) => page.kind === "country" && page.country === "dahab" ? dahabFooter(page) : footer(page);

const metaTitleForPage = (page) =>
  page.path === "/dahab/" ? "Дахаб — Wingfoil и Windsurf на Красном море | Vetratoria" : page.title || site.title;

const metaDescriptionForPage = (page) =>
  page.path === "/dahab/"
    ? "Vetratoria Dahab: Wingfoil, Windsurf, Kids, аренда, уроки, станции Wing Center, Swiss Inn и Ganet Sinai."
    : page.description || site.description;

const metaImageForPage = (page) =>
  page.path === "/dahab/" ? "/assets/img/dahab-ref/ganet-sinai.webp" : page.image || site.slider[0];

const contactCountryOption = (country) => {
  const contact = site.contacts[country.key];
  return `<option value="${country.key}" data-email="${escapeHtml(contact.formEmail)}" data-phone="${escapeHtml(contact.phone)}" data-telegram="${escapeHtml(contact.telegram)}">${escapeHtml(contact.title)}</option>`;
};

const contactDialog = (page) => {
  const country = contactCountryForPage(page);
  const destination = contactDestination(page) || site.contacts[countryList[0].key];
  const direction = country ? site.contacts[country.key].title : "Vetratoria";
  const sport = page.sport ? sportLabel(page.sport) : "";
  const context = [direction, sport].filter(Boolean).join(" · ");
  const phoneHref = country?.key === "dahab"
    ? `https://wa.me/${destination.phone.replace(/\D/g, "")}`
    : `tel:${destination.phone}`;

  return `
<dialog class="contact-modal" data-contact-dialog aria-labelledby="contact-modal-title">
  <div class="contact-modal__surface">
    <button class="contact-modal__close" type="button" data-contact-close aria-label="Закрыть форму">×</button>
    <div class="contact-modal__head">
      <p class="eyebrow">Быстрая заявка</p>
      <h2 id="contact-modal-title" data-contact-modal-title>Написать нам</h2>
      <p>Оставьте контакты — команда уточнит детали и поможет подобрать формат.</p>
      <span class="contact-modal__context" data-contact-modal-context>${escapeHtml(context || "Выберите направление")}</span>
    </div>
    <form class="contact-form contact-modal__form" data-contact-form data-contact-modal-form
      data-endpoint="${escapeHtml(site.contactEndpoint || "")}"
      data-mail-to="${country ? escapeHtml(destination.formEmail || destination.email) : ""}"
      data-direction="${escapeHtml(context)}">
      <input type="hidden" name="source" value="${escapeHtml(page.path)}">
      <input type="hidden" name="intent" value="" data-contact-intent-input>
      <input type="hidden" name="sport" value="${escapeHtml(sport)}" data-contact-sport-input>
      ${country ? `<input type="hidden" name="country" value="${country.key}" data-contact-country-input>` : `
      <label>Направление
        <select name="country" data-contact-country-select required>
          ${countryList.map(contactCountryOption).join("")}
        </select>
      </label>`}
      <label>Имя<input name="name" autocomplete="name" placeholder="Ваше имя" required></label>
      <label>Способ связи<input name="contact" autocomplete="tel" placeholder="Телефон, email или @username" required></label>
      <label><span>Комментарий <small>по желанию</small></span><textarea name="message" rows="4" placeholder="Даты, уровень, спорт или ваш вопрос"></textarea></label>
      <button class="button button-primary contact-modal__submit" type="submit">${site.contactEndpoint ? "Отправить заявку" : "Подготовить заявку"}</button>
      <p class="form-note" data-form-note aria-live="polite"></p>
    </form>
    <div class="contact-modal__direct">
      <span>Или свяжитесь напрямую</span>
      <div>
        <a href="${phoneHref}" data-contact-direct-phone${country?.key === "dahab" ? ` target="_blank" rel="noopener noreferrer"` : ""}>
          <img src="/assets/icons/whatsapp.svg" alt="" width="20" height="20">
          <span data-contact-direct-phone-label>${country?.key === "dahab" ? "WhatsApp" : "Телефон"}</span>
        </a>
        <a href="${destination.telegram}" data-contact-direct-telegram target="_blank" rel="noopener noreferrer">
          <img src="/assets/icons/telegram.svg" alt="" width="20" height="20">
          <span>Telegram</span>
        </a>
      </div>
    </div>
  </div>
</dialog>`;
};

const ASSET_VERSION = "20260730-single-media";
const versionedAsset = (path) => `${path}?v=${ASSET_VERSION}`;

const layout = (page, main) => `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(metaTitleForPage(page))}</title>
  <meta name="description" content="${escapeHtml(metaDescriptionForPage(page))}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${site.name}">
  <meta property="og:title" content="${escapeHtml(metaTitleForPage(page))}">
  <meta property="og:description" content="${escapeHtml(metaDescriptionForPage(page))}">
  <meta property="og:image" content="${metaImageForPage(page)}">
  <meta name="theme-color" content="#0d0c0b">
  <link rel="icon" href="${site.logo}">
  <link rel="stylesheet" href="${versionedAsset("/assets/css/main.css")}">
  <script defer src="${versionedAsset("/assets/js/app.js")}"></script>
</head>
<body class="modern-site ${page.kind}${page.country ? ` country-${page.country}` : ""}">
  <a class="skip-link" href="#main">К содержанию</a>
  ${header(page)}
  <main id="main">${main}</main>
  ${footerForPage(page)}
  ${contactDialog(page)}
</body>
</html>
`;

const hero = (page, actions = "") => `
<section class="hero page-hero">
  <div class="hero-bg">
    <img src="${page.image}" alt="" loading="eager" decoding="async">
  </div>
  <div class="hero-shade"></div>
  <div class="hero-content">
    <p class="eyebrow">${escapeHtml(page.eyebrow || site.name)}</p>
    <h1>${escapeHtml(page.title)}</h1>
    <p class="hero-lead">${escapeHtml(page.description)}</p>
    ${actions ? `<div class="hero-actions">${actions}</div>` : ""}
  </div>
</section>`;

const home = (page) => `
<section class="hero hero-home">
  <div class="home-hero__slider" data-hero-slider aria-label="Фото Vetratoria">
    ${site.slider.map((src, index) => `<img src="${src}" alt="" data-slide ${index === 0 ? `class="is-active"` : ""} aria-hidden="${index === 0 ? "false" : "true"}" loading="${index === 0 ? "eager" : "lazy"}" decoding="async">`).join("")}
  </div>
  <div class="hero-shade"></div>
  <div class="hero-content">
    <p class="eyebrow">Vetratoria Wind Schools</p>
    <h1>Windsurf, Wingfoil и Kite — от первого старта до уверенного катания</h1>
    <p class="hero-lead">Обучение и прокат в Египте, Вьетнаме и России. Подберём программу и снаряжение под ваш уровень и условия на воде.</p>
    <div class="hero-advantages">
      <article class="hero-advantage">С 2006 года</article>
      <article class="hero-advantage">Обучение с нуля и прогресс</article>
      <article class="hero-advantage">Опытные инструкторы</article>
      <article class="hero-advantage">Клубная система скидок</article>
    </div>
    <div class="hero-actions">
      ${contactCta(page, "Написать нам")}
      ${countryList.map((country) => `<a class="button button-ghost" href="${country.href}">${country.nav}</a>`).join("")}
    </div>
    <div class="slider-dots" aria-label="Слайды">
      ${site.slider.map((_, index) => `<button type="button" data-slide-dot aria-label="Слайд ${index + 1}"></button>`).join("")}
    </div>
  </div>
</section>

<section class="home-section home-section--destinations" id="destinations">
  <div class="section-inner">
    ${sectionHeading("Направления", "Выберите страну", "Главная Vetratoria - это вход в сеть. Внутри каждой страны свои условия, станции, цены, команда, безопасность, блог и медиа.")}
    <div class="destination-grid">
      ${countryList.map((country) => `
        <a class="destination-card" href="${country.href}">
          ${cardImage(country.hero, `${country.region} · ${country.city}`)}
          <span>${country.region}</span>
          <h2>${country.key === "russia" ? "Должанская Коса" : country.title}</h2>
          <p>${country.lead}</p>
          <em>Открыть направление</em>
        </a>`).join("")}
    </div>
  </div>
</section>

<section class="home-section home-section--brand" id="brand">
  <div class="section-inner brand-split">
    <div class="brand-copy">
      <p class="eyebrow">О бренде</p>
      <h2>Vetratoria - это система вокруг ветра, воды и обучения</h2>
      <p>Мы соединяем спорт, станции, инструкторов, оборудование, безопасность и маршрут клиента в одну понятную клубную систему.</p>
      <div class="home-proof-list">
        <span>Страна, спорт, цена и заявка собраны в понятный маршрут.</span>
        <span>Станции подбираются под ветер, уровень и задачу.</span>
        <span>Инструктор, зона катания и rescue обсуждаются до выхода.</span>
        <span>Команда ведет человека от берега до прогресса.</span>
      </div>
    </div>
    <figure class="brand-media">${cardImage(img("ABOUTVETRATORIA.jpg"), "Станция Vetratoria")}</figure>
  </div>
</section>

<section class="home-section" id="media-blog">
  <div class="section-inner">
    ${sectionHeading("Блог и медиа", "Материалы, фото и истории со станций", "Блог помогает подготовиться к поездке, а медиа показывает станции, уроки, людей, снаряжение и атмосферу.")}
    <div class="destination-grid media-grid">
      ${[
        { href: "/blog/", image: img("home-blog.webp"), label: "Articles", title: "Блог", lead: "Статьи по странам, спорту, обучению, безопасности и оборудованию." },
        { href: "/media/", image: img("home-media.webp"), label: "Photo / Video", title: "Медиа", lead: "Фото и видео по Египту, Вьетнаму и России. Альбомы отдельно от статей." }
      ].map((item) => `
        <a class="destination-card" href="${item.href}">
          ${cardImage(item.image, item.title)}
          <span>${item.label}</span>
          <h2>${item.title}</h2>
          <p>${item.lead}</p>
          <em>Открыть</em>
        </a>`).join("")}
    </div>
  </div>
</section>

<section class="home-section home-section--contact" id="contact">
  <div class="section-inner home-cta">
    <div>
      <p class="eyebrow">Контакты</p>
      <h2>Напишите нам - подберем направление</h2>
      <p>Укажите страну, даты, уровень и спорт. Подскажем, куда лучше ехать: Египет, Вьетнам или Россия.</p>
    </div>
    <div class="home-cta__actions">
      ${contactCta(page, "Написать нам")}
      ${countryList.map((country) => `<a class="button button-ghost" href="${country.href}">${country.nav}</a>`).join("")}
    </div>
  </div>
</section>`;

const dahabImg = (name) => `/assets/img/dahab/${name}`;
const dahabRefImg = (name) => `/assets/img/dahab-ref/${name}`;
const finalImg = (name) => `/assets/img/final/${name}`;
const wingfoilSectionImg = (name) => finalImg(`wingfoil/sections/${name}`);
const wingfoilWaterImg = (name) => finalImg(`wingfoil/water/${name}`);

const dahabReviewItems = [
  ["B", "Boris Sizov", "★★★★★", "Очень удобно приезжать без своего снаряжения: есть все размеры крыльев и досок, оборудования хватает. Толик, Ира и Хассан — настоящие профессионалы."],
  ["D", "Dmitrii Polishchuk", "★★★★★", "Отличная surf-станция, классная локация для выхода в море, дружелюбная команда и сильное оборудование для wingfoil. Очень рекомендую."],
  ["O", "Olga Krasnova", "★★★★★", "Wing Center Vetratoria — магическое место. Мои первые шаги на wingfoil получились, а снаряжение подходит и новичкам, и продолжающим."],
  ["E", "Evgeniy Kolosov", "★★★★★", "Vetratoria в Египте оставила только положительные впечатления: высокий уровень инструкторов, идеальные условия и очень дружелюбная атмосфера."],
  ["Y", "Yuriy Tolchinskiy", "★★★★★", "Приезжал осваивать wingfoil. Довольно быстро получилось лететь на фойле и делать повороты. Спасибо Hassan за продуктивные тренировки."]
];

const dahabWingfoilPage = (page) => {
  const heroFacts = ["Обучение с нуля", "Спасательный катер", "Связь BB Talkin", "Снаряжение RRD"];
  const reasons = [
    ["Ровная вода", "Спокойная зона помогает поймать баланс, понять крыло и не бороться с лишней волной.", wingfoilWaterImg("water-01.webp"), "Wingfoil над ровной водой в Дахабе"],
    ["Стабильный ветер", "В Дахабе легко планировать занятия: инструктор подбирает окно под уровень и задачу.", wingfoilSectionImg("wing-start-coaching.webp"), "Старт занятия Wingfoil с инструктором"],
    ["Foil boat", "Можно отдельно почувствовать фойл за лодкой, а потом соединить полет с крылом.", wingfoilSectionImg("foil-boat-training.webp"), "Тренировка на фойле за лодкой в Дахабе"],
    ["Станция рядом", "Подбор крыла, доски, шлема, жилета и обратная связь происходят прямо на берегу.", dahabRefImg("bg-wingfoil-station.webp"), "Wingfoil станция Vetratoria в Дахабе"]
  ];
  const learning = [
    ["01", "Wing на SUP", "Учимся держать крыло, разворачиваться, идти нужным курсом и понимать, как работает ветер.", wingfoilSectionImg("wing-start-coaching.webp"), "Инструктор помогает ученику стартовать с крылом у берега"],
    ["02", "Foil за лодкой", "Пробуем фойл без крыла: баланс, подъем, контроль высоты и уверенность на доске.", wingfoilSectionImg("foil-boat-training.webp"), "Foil за лодкой в Дахабе"],
    ["03", "Wingfoil с инструктором", "Соединяем крыло и фойл. Первые старты, первые метры, контроль скорости и направления.", wingfoilSectionImg("wingfoil-duo.webp"), "Wingfoil с инструктором на воде"],
    ["04", "Практика и прогресс", "После первых успешных попыток можно кататься самостоятельно под контролем станции и брать уроки точечно.", wingfoilSectionImg("wingfoil-ride.webp"), "Уверенный райдер wingfoil в Дахабе"]
  ];
  const prices = [
    ["Урок", "Wingfoil урок", "70$", "Индивидуальное занятие с инструктором для первых стартов, исправления ошибок и прогресса.", "Записаться"],
    ["Лодка", "Foil за лодкой", "60$", "Отдельный этап для понимания фойла: баланс, подъем и контроль высоты.", "Записаться"],
    ["Новичок", "Программа для новичка", "от 270$", "Wing на SUP, фойл за лодкой, первые попытки wingfoil и практика.", "Подобрать программу"],
    ["Прокат", "Прокат", "от 25$", "Для тех, кто уже катается самостоятельно.", "Оставить заявку"]
  ];
  const waterPhotos = [
    [wingfoilWaterImg("water-01.webp"), "Wingfoil над бирюзовой водой в Дахабе"],
    [wingfoilWaterImg("water-02.webp"), "Прыжок на wingfoil в Дахабе"],
    [wingfoilWaterImg("water-03.webp"), "Wingfoil ride на Красном море"],
    [wingfoilWaterImg("water-04.webp"), "Два райдера wingfoil в Дахабе"],
    [wingfoilWaterImg("water-05.webp"), "Wingfoil на открытой воде"]
  ];
  const reviews = dahabReviewItems;
  const faqs = [
    ["Можно ли начать с нуля?", "Да. Обычно начинаем с управления крылом на берегу и Wing + SUP, затем добавляем foil boat или Wing + Foil по готовности."],
    ["Сколько занятий нужно до первых полетов?", "Зависит от ветра, баланса и прошлого опыта. Часто первые короткие полеты появляются после нескольких последовательных выходов."],
    ["Что входит в урок?", "Инструктор, подбор комплекта, шлем, жилет, разбор зоны катания, постановка задач и обратная связь после выхода."],
    ["Нужен ли опыт windsurf или kite?", "Нет, но опыт любых водных видов помогает. Для старта важнее спокойная вода, правильный комплект и понятная последовательность."],
    ["Когда лучше ехать в Дахаб?", "Дахаб работает круглый год. Конкретные окна по ветру и формату лучше уточнять перед поездкой под ваши даты."]
  ];
  const useful = [
    ["/dahab/blog/wingfoil/", "Wingfoil", "Как начать Wingfoil с нуля", wingfoilSectionImg("wing-start-coaching.webp")],
    ["/dahab/blog/wingfoil/", "Сравнение", "Wingfoil или Windsurf: что выбрать", wingfoilSectionImg("wingfoil-ride.webp")],
    ["/dahab/blog/wingfoil/", "Foil boat", "Почему фойл за лодкой помогает быстрее прогрессировать", wingfoilSectionImg("foil-boat-training.webp")]
  ];

  return `
<section class="dahab-sport-hero dahab-sport-hero--wingfoil">
  <div class="dahab-sport-hero__inner">
    <div class="dahab-sport-hero__copy">
      <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
      <h1>${escapeHtml(page.title)}</h1>
      <p>${escapeHtml(page.description)}</p>
      <div class="dahab-sport-hero__actions">
        ${contactCta(page, "Записаться", "button button-primary", "wingfoil")}
        <a class="button button-ghost" href="/dahab/wingfoil/price/">Смотреть цены</a>
      </div>
      <div class="hero-advantages hero-advantages--sport">
        ${heroFacts.map((item) => `<span class="hero-advantage">${item}</span>`).join("")}
      </div>
    </div>
    <figure class="dahab-sport-hero__media">
      <img src="${page.image}" alt="Wingfoil в Дахабе — райдеры на фойле" width="1920" height="1080" loading="eager" decoding="async" fetchpriority="high">
    </figure>
  </div>
</section>

<section class="dahab-sport-section">
  <div class="dahab-sport-inner">
    ${sectionHeading("Локация", "Почему Дахаб подходит для Wingfoil", "Спокойная вода, стабильный ветер, разные форматы старта и станция рядом с зоной выхода помогают идти от первого управления крылом к полету без хаоса.")}
    ${sportFeatureGrid(reasons)}
  </div>
</section>

<section class="dahab-sport-section dahab-sport-section--soft">
  <div class="dahab-sport-inner">
    ${sectionHeading("Обучение", "Как проходит обучение Wingfoil", "В реальности это не один случайный урок, а понятная лестница: берег, крыло, доска, фойл, первые полеты и самостоятельность.")}
    <div class="dahab-sport-process">
      ${learning.map(([number, title, text, image, alt]) => `
        <article>
          <img src="${image}" alt="${alt}" width="1920" height="1080" loading="lazy" decoding="async">
          <div><span>${number}</span><h3>${title}</h3><p>${text}</p></div>
        </article>`).join("")}
    </div>
  </div>
</section>

<section class="dahab-sport-section">
  <div class="dahab-sport-inner">
    ${sectionHeading("Цены", "Цены на Wingfoil", "Можно взять разовый урок, попробовать фойл за лодкой или собрать программу на несколько дней. Если вы не уверены, с чего начать, оставьте заявку — мы подберем вариант под ваш уровень, даты и ветер.")}
    <div class="dahab-sport-price-grid">
      ${prices.map(([label, title, value, text, cta]) => `
        <article class="dahab-sport-price-card">
          <small>${label}</small>
          <h3>${title}</h3>
          <b>${value}</b>
          <p>${text}</p>
          ${contactCta(page, cta, "button button-primary", "wingfoil")}
        </article>`).join("")}
    </div>
    <div class="dahab-sport-price-actions">
      <a class="button button-ghost" href="/dahab/wingfoil/price/">Цены Wingfoil</a>
    </div>
  </div>
</section>

<section class="dahab-sport-section dahab-sport-section--soft">
  <div class="dahab-sport-inner dahab-sport-safety">
    <div class="dahab-sport-safety__copy">
      <p class="eyebrow">Безопасность</p>
      <h2>Безопасность на воде</h2>
      <p>Wingfoil быстро дает ощущение свободы, но первые выходы требуют контроля. Перед стартом разбираем ветер, границы зоны, сигналы, комплект и действия, если нужно вернуться к берегу.</p>
      <div class="dahab-sport-safety__list">
        <span>Инструктор рядом на старте и в воде</span>
        <span>Шлем, жилет и подходящий комплект</span>
        <span>Понятная зона катания и rescue</span>
      </div>
      <a class="button button-primary" href="/dahab/safety/">Подробнее</a>
    </div>
    <div class="dahab-sport-safety__media">
      <img src="${wingfoilSectionImg("rescue-boats.webp")}" alt="Rescue boats на берегу станции Vetratoria" width="1920" height="1080" loading="lazy" decoding="async">
    </div>
  </div>
</section>

<section class="dahab-sport-section">
  <div class="dahab-sport-inner">
    ${sectionHeading("Медиа", "Как это выглядит на воде", "Посмотрите живые кадры с уроков, катания и станции. Так проще понять атмосферу, формат обучения и реальные условия на воде.")}
    <div class="dahab-sport-water-grid">
      ${waterPhotos.map(([image, alt], index) => `
        <a${index === 0 ? ` class="is-large"` : ""} href="/media/dahab/" aria-label="Открыть медиа Дахаба">
          <img src="${image}" alt="${alt}" width="1920" height="1080" loading="lazy" decoding="async">
        </a>`).join("")}
    </div>
    <div class="dahab-sport-water-actions">
      <a class="button button-primary" href="/media/dahab/">Смотреть медиа</a>
    </div>
  </div>
</section>

<section class="dahab-sport-section dahab-sport-section--soft dahab-sport-reviews" id="reviews">
  <div class="dahab-sport-inner">
    <div class="dahab-sport-reviews__head">
      <div>
        <p class="eyebrow">Отзывы</p>
        <h2>Что говорят гости</h2>
      </div>
      <a href="https://www.tripadvisor.com/" target="_blank" rel="noopener">144 отзыва →</a>
    </div>
    <div class="dahab-sport-review-track" aria-label="Отзывы гостей Vetratoria Dahab">
      ${reviews.map(([initial, name, stars, text]) => `
        <article class="dahab-sport-review-card">
          <div class="dahab-sport-review-card__top">
            <span>${initial}</span>
            <div><strong>${name}</strong><small>${stars}</small></div>
          </div>
          <p>«${text}»</p>
        </article>`).join("")}
    </div>
  </div>
</section>

<section class="dahab-sport-section dahab-sport-section--soft">
  <div class="dahab-sport-inner">
    ${sectionHeading("FAQ", "Частые вопросы", "Короткие ответы перед первым выходом на wingfoil в Дахабе.")}
    <div class="dahab-sport-faq">
      ${faqs.map(([question, answer], index) => `<details ${index === 0 ? "open" : ""}><summary>${question}</summary><p>${answer}</p></details>`).join("")}
    </div>
  </div>
</section>

<section class="dahab-sport-section">
  <div class="dahab-sport-inner">
    ${sectionHeading("Материалы", "Полезное о Wingfoil", "Статьи, медиа и правила, которые помогают заранее понять формат и спокойно приехать на станцию.")}
    <div class="dahab-sport-useful">
      ${useful.map(([href, label, title, image]) => `
        <a href="${href}">
          <img src="${image}" alt="${title}" width="760" height="520" loading="lazy" decoding="async">
          <span>${label}</span>
          <h3>${title}</h3>
          <em>Открыть</em>
        </a>`).join("")}
    </div>
  </div>
</section>

<section class="dahab-sport-cta">
  <img src="${wingfoilSectionImg("wingfoil-ride.webp")}" alt="Wingfoil в Дахабе на воде" width="1920" height="1080" loading="lazy" decoding="async">
  <div class="dahab-sport-cta__inner">
    <p class="eyebrow">Заявка</p>
    <h2>Хотите попробовать Wingfoil в Дахабе?</h2>
    <p>Напишите даты, уровень и цель поездки. Подберем формат: Wing + SUP, foil boat, урок Wing + Foil или самостоятельную практику.</p>
    <div>
      ${contactCta(page, "Написать нам", "button button-primary", "wingfoil")}
      <a class="button button-ghost" href="/dahab/wingfoil/price/">Цены</a>
    </div>
  </div>
</section>`.replace(/^[\t ]+$/gm, "");
};

const dahabWindsurfPage = (page) => {
  const heroFacts = ["Обучение с нуля", "Прокат снаряжения", "Подбор паруса", "Спасательный катер"];
  const reasons = [
    ["Понятный старт", "Спокойная вода и инструктор рядом помогают быстро почувствовать доску, парус и направление ветра.", dahabRefImg("windsurf-hero.webp"), "Первый выход на Windsurf в Дахабе"],
    ["Снаряжение под ветер", "Подбираем доску и парус под вес, уровень и фактические условия на воде.", dahabRefImg("price-windsurf.webp"), "Подбор доски и паруса для Windsurf"],
    ["Маршрут прогресса", "После первых галсов можно перейти к поворотам, курсам, скорости и самостоятельному прокату.", dahabRefImg("block-windsurf.webp"), "Windsurf тренировка на Красном море"],
    ["Станции рядом", "Swiss Inn и Ganet Sinai удобны для уроков, проката, хранения и спокойного выхода на воду.", dahabRefImg("bg-swiss.webp"), "Windsurf станция Swiss Inn в Дахабе"]
  ];
  const learning = [
    ["01", "Парус на берегу", "Разбираем ветер, стойку, положение паруса, развороты и правила выхода в акваторию.", dahabRefImg("windsurf-hero.webp"), "Windsurf на Красном море в Дахабе"],
    ["02", "Первые галсы", "Учимся стартовать, держать курс, разворачиваться и возвращаться к точке старта.", dahabRefImg("price-windsurf.webp"), "Первые галсы на windsurf"],
    ["03", "Повороты и курс", "Отрабатываем лавировку, повороты, контроль скорости и уверенное движение в выбранную сторону.", dahabRefImg("block-windsurf.webp"), "Windsurf обучение в Дахабе"],
    ["04", "Прокат и практика", "Когда база понятна, можно брать прокат, кататься самостоятельно и точечно добирать уроки.", dahabRefImg("swiss-inn.webp"), "Станция Swiss Inn для windsurf"]
  ];
  const prices = [
    ["Урок", "Урок Windsurf", "$70", "Индивидуальное занятие с инструктором для новичков и продолжающих.", "Записаться"],
    ["Kids", "Детский урок Windsurf", "от $55", "Легкий парус, спокойный темп и инструктор рядом.", "Записаться"],
    ["Программа", "Программа для новичка", "от $95", "Для тех, кто приезжает научиться кататься с понятным планом.", "Подобрать программу"],
    ["Прокат", "Прокат", "от 25$", "Для самостоятельного катания с подбором доски и паруса.", "Оставить заявку"]
  ];
  const waterPhotos = [
    [dahabRefImg("windsurf-hero.webp"), "Windsurf в Дахабе"],
    [dahabRefImg("price-windsurf.webp"), "Windsurf урок на воде"],
    [dahabRefImg("block-windsurf.webp"), "Windsurf катание в Дахабе"],
    [dahabRefImg("bg-swiss.webp"), "Swiss Inn windsurf station"],
    [dahabRefImg("bg-ganet.webp"), "Ganet Sinai windsurf station"]
  ];
  const reviews = dahabReviewItems;
  const faqs = [
    ["Можно ли начать с нуля?", "Да. Начинаем с берега и простых упражнений на воде: стойка, парус, курс и разворот."],
    ["Что входит в урок?", "Инструктор, подбор доски и паруса, объяснение зоны катания, практика на воде и обратная связь."],
    ["Когда можно брать прокат?", "Когда вы уверенно стартуете, возвращаетесь к берегу и понимаете правила акватории. Команда подскажет подходящий комплект."],
    ["Подходит ли windsurf детям?", "Да, для детей есть отдельный формат Windsurf Kids с легким снаряжением и спокойным темпом."],
    ["Где проходят занятия?", "В зависимости от ветра и уровня занятия проходят на станциях Vetratoria в Дахабе, чаще Swiss Inn или Ganet Sinai."]
  ];
  const useful = [
    ["/dahab/blog/windsurf/", "Windsurf", "Как начать Windsurf с нуля", dahabRefImg("windsurf-hero.webp")],
    ["/dahab/windsurf/price/", "Цены", "Уроки, прокат и программы Windsurf", dahabRefImg("price-windsurf.webp")],
    ["/dahab/stations/", "Станции", "Где кататься на windsurf в Дахабе", dahabRefImg("bg-swiss.webp")]
  ];

  return `
<section class="dahab-sport-hero dahab-sport-hero--windsurf">
  <div class="dahab-sport-hero__inner">
    <div class="dahab-sport-hero__copy">
      <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
      <h1>${escapeHtml(page.title)}</h1>
      <p>${escapeHtml(page.description)}</p>
      <div class="dahab-sport-hero__actions">
        ${contactCta(page, "Записаться", "button button-primary", "windsurf")}
        <a class="button button-ghost" href="/dahab/windsurf/price/">Смотреть цены</a>
      </div>
      <div class="hero-advantages hero-advantages--sport">
        ${heroFacts.map((item) => `<span class="hero-advantage">${item}</span>`).join("")}
      </div>
    </div>
    <figure class="dahab-sport-hero__media">
      <img src="${page.image}" alt="Windsurf в Дахабе на Красном море" width="1600" height="1067" loading="eager" decoding="async" fetchpriority="high">
    </figure>
  </div>
</section>

<section class="dahab-sport-section">
  <div class="dahab-sport-inner">
    ${sectionHeading("Локация", "Почему Дахаб подходит для Windsurf", "В Дахабе удобно начать с нуля и продолжать прогресс: понятная акватория, стабильный ветер, разные станции и подбор комплекта под условия.")}
    ${sportFeatureGrid(reasons)}
  </div>
</section>

<section class="dahab-sport-section dahab-sport-section--soft">
  <div class="dahab-sport-inner">
    ${sectionHeading("Обучение", "Как проходит обучение Windsurf", "Идем от простого управления парусом к уверенным галсам, поворотам и самостоятельной практике. Без лишней теории, но с понятной последовательностью.")}
    <div class="dahab-sport-process">
      ${learning.map(([number, title, text, image, alt]) => `
        <article>
          <img src="${image}" alt="${alt}" width="1600" height="1067" loading="lazy" decoding="async">
          <div><span>${number}</span><h3>${title}</h3><p>${text}</p></div>
        </article>`).join("")}
    </div>
  </div>
</section>

<section class="dahab-sport-section">
  <div class="dahab-sport-inner">
    ${sectionHeading("Цены", "Цены на Windsurf", "Можно взять разовый урок, детское занятие, прокат или собрать программу на несколько дней под ваши даты и уровень.")}
    <div class="dahab-sport-price-grid">
      ${prices.map(([label, title, value, text, cta]) => `
        <article class="dahab-sport-price-card">
          <small>${label}</small>
          <h3>${title}</h3>
          <b>${value}</b>
          <p>${text}</p>
          ${contactCta(page, cta, "button button-primary", label === "Kids" ? "windsurf-kids" : "windsurf")}
        </article>`).join("")}
    </div>
    <div class="dahab-sport-price-actions">
      <a class="button button-ghost" href="/dahab/windsurf/price/">Цены Windsurf</a>
    </div>
  </div>
</section>

<section class="dahab-sport-section dahab-sport-section--soft">
  <div class="dahab-sport-inner dahab-sport-safety">
    <div class="dahab-sport-safety__copy">
      <p class="eyebrow">Безопасность</p>
      <h2>Безопасность на воде</h2>
      <p>Перед выходом разбираем ветер, границы зоны, правила возврата и подходящий комплект. Инструктор следит за стартом, задачами и прогрессом на воде.</p>
      <div class="dahab-sport-safety__list">
        <span>Инструктор рядом на уроке</span>
        <span>Доска и парус под уровень</span>
        <span>Понятная зона катания и rescue</span>
      </div>
      <a class="button button-primary" href="/dahab/safety/">Подробнее</a>
    </div>
    <div class="dahab-sport-safety__media">
      <img src="${wingfoilSectionImg("rescue-boats.webp")}" alt="Rescue boats на берегу станции Vetratoria" width="1920" height="1080" loading="lazy" decoding="async">
    </div>
  </div>
</section>

<section class="dahab-sport-section">
  <div class="dahab-sport-inner">
    ${sectionHeading("Медиа", "Windsurf на воде", "Кадры с уроков, проката и станций помогают заранее понять формат, воду и атмосферу Дахаба.")}
    <div class="dahab-sport-water-grid">
      ${waterPhotos.map(([image, alt], index) => `
        <a${index === 0 ? ` class="is-large"` : ""} href="/media/dahab/" aria-label="Открыть медиа Дахаба">
          <img src="${image}" alt="${alt}" width="1600" height="1067" loading="lazy" decoding="async">
        </a>`).join("")}
    </div>
    <div class="dahab-sport-water-actions">
      <a class="button button-primary" href="/media/dahab/">Смотреть медиа</a>
    </div>
  </div>
</section>

<section class="dahab-sport-section dahab-sport-section--soft dahab-sport-reviews" id="reviews">
  <div class="dahab-sport-inner">
    <div class="dahab-sport-reviews__head">
      <div>
        <p class="eyebrow">Отзывы</p>
        <h2>Что говорят гости</h2>
      </div>
      <a href="https://www.tripadvisor.com/" target="_blank" rel="noopener">144 отзыва →</a>
    </div>
    <div class="dahab-sport-review-track" aria-label="Отзывы гостей Vetratoria Dahab">
      ${reviews.map(([initial, name, stars, text]) => `
        <article class="dahab-sport-review-card">
          <div class="dahab-sport-review-card__top">
            <span>${initial}</span>
            <div><strong>${name}</strong><small>${stars}</small></div>
          </div>
          <p>«${text}»</p>
        </article>`).join("")}
    </div>
  </div>
</section>

<section class="dahab-sport-section dahab-sport-section--soft">
  <div class="dahab-sport-inner">
    ${sectionHeading("FAQ", "Частые вопросы", "Короткие ответы перед первым уроком windsurf в Дахабе.")}
    <div class="dahab-sport-faq">
      ${faqs.map(([question, answer], index) => `<details ${index === 0 ? "open" : ""}><summary>${question}</summary><p>${answer}</p></details>`).join("")}
    </div>
  </div>
</section>

<section class="dahab-sport-section">
  <div class="dahab-sport-inner">
    ${sectionHeading("Материалы", "Полезное о Windsurf", "Страницы, которые помогают выбрать формат, станцию и понять стоимость до поездки.")}
    <div class="dahab-sport-useful">
      ${useful.map(([href, label, title, image]) => `
        <a href="${href}">
          <img src="${image}" alt="${title}" width="760" height="520" loading="lazy" decoding="async">
          <span>${label}</span>
          <h3>${title}</h3>
          <em>Открыть</em>
        </a>`).join("")}
    </div>
  </div>
</section>

<section class="dahab-sport-cta">
  <img src="${page.image}" alt="Windsurf в Дахабе на воде" width="1600" height="1067" loading="lazy" decoding="async">
  <div class="dahab-sport-cta__inner">
    <p class="eyebrow">Заявка</p>
    <h2>Хотите попробовать Windsurf в Дахабе?</h2>
    <p>Напишите даты, уровень и цель поездки. Подберем урок, прокат или программу на несколько дней.</p>
    <div>
      ${contactCta(page, "Написать нам", "button button-primary", "windsurf")}
      <a class="button button-ghost" href="/dahab/windsurf/price/">Цены</a>
    </div>
  </div>
</section>`.replace(/^[\t ]+$/gm, "");
};

const dahabWindsurfKidsPage = (page) => {
  const officialSite = "https://windsurfkids.su/";
  const wskImg = (name) => `/assets/img/windsurf-kids/${name}`;
  const heroFacts = ["С 2009 года", "Дети от 6 лет", "500+ воспитанников", "Дахаб · Красное море"];
  const reasons = [
    ["Спорт с понятного старта", "Новички знакомятся с ветром, доской и парусом в спокойном темпе, а продолжающие развивают технику.", wskImg("water-02.jpg"), "Юный спортсмен WindSurfKids на виндсёрфе"],
    ["Профессиональная команда", "С детьми работают тренеры с опытом в парусном спорте и отдельным вниманием к возрасту каждого участника.", wskImg("hero.webp"), "Тренер проводит занятие для участников WindSurfKids"],
    ["Безопасность на воде", "Акваторию контролирует команда спасателей, а оборудование подбирается под рост, вес и уровень ребёнка.", wskImg("water-01.jpg"), "Участники WindSurfKids готовят оборудование на берегу"],
    ["Лагерь, а не только уроки", "В программе есть спорт, снорклинг, прогулки по горам, игры, экскурсии и время с новыми друзьями.", wskImg("camp-03.webp"), "Поход участников WindSurfKids в Синайских горах"]
  ];
  const program = [
    ["01", "Виндсёрфинг", "Стойка, управление парусом, выбор курса и первые самостоятельные галсы.", wskImg("water-02.jpg"), "Юный спортсмен WindSurfKids катается на виндсёрфе в Дахабе"],
    ["02", "Виндфойл и вингфойл", "Знакомство с современными фойл-дисциплинами для детей, готовых двигаться дальше.", wskImg("water-03.jpg"), "Участник WindSurfKids со снаряжением на станции в Дахабе"],
    ["03", "Спорт и приключения", "Командные игры, снорклинг на рифах, прогулки по горам и поездки по Дахабу.", wskImg("camp-03.webp"), "Поход участников WindSurfKids в горах рядом с Дахабом"],
    ["04", "Командная жизнь", "Совместные занятия помогают стать самостоятельнее, увереннее и найти новых друзей.", wskImg("camp-01.webp"), "Участники детского лагеря WindSurfKids на станции Vetratoria"]
  ];
  const formats = [
    ["Короткий формат", "Половина дня", "Утренняя зарядка, теория, тренировка на воде и оборудование."],
    ["Дневная программа", "Полный день", "Тренировка, питание, игры, спорт и дополнительные активности."],
    ["Летняя смена", "2 недели", "Половина смены с проживанием и насыщенной лагерной программой."],
    ["Полная смена", "4 недели", "Большой летний цикл для уверенного прогресса и полноценного отдыха."]
  ];
  const schedule = [
    ["01", "Утро", "Подъём, завтрак чемпионов, пробежка и зарядка на берегу моря."],
    ["02", "10:00–12:30", "Подготовка снаряжения, объяснение задачи и основная тренировка на воде."],
    ["03", "День", "Обед, личное время, настольные игры, снорклинг, прогулки или экскурсии."],
    ["04", "Вечер", "Ужин, футбол, баскетбол или волейбол, общий фильм и отбой в 22:00."]
  ];
  const faqs = [
    ["С какого возраста принимают детей?", "WindSurfKids принимает детей с 6 лет. Конкретный формат подбирается с учётом возраста, физической подготовки и опыта на воде."],
    ["Можно приехать без родителей?", "Да. Организаторы помогают согласовать сопровождение ребёнка или встречу в аэропорту. Детали необходимо заранее подтвердить с командой WSK."],
    ["Нужно ли своё оборудование?", "Нет. Оборудование для заявленных тренировочных форматов предоставляется лагерем и подбирается под участника."],
    ["Где живут дети?", "Участники размещаются по 2–3 человека в Canyon Dahab Hotel. Вместе с ними проживают тренеры, администраторы и аниматоры лагеря."],
    ["Что нужно взять с собой?", "Понадобятся медицинская страховка, одежда и обувь для спорта и отдыха, головной убор, солнцезащитный крем и личные вещи. Полный список размещён на официальном сайте."],
    ["Где проверить актуальные цены и даты?", "Все условия, свободные места, стоимость и детали трансфера нужно уточнять напрямую у организаторов WindSurfKids."]
  ];
  const useful = [
    ["https://windsurfkids.su/team", "Команда", "Тренеры и спасатели WindSurfKids", wskImg("hero.webp")],
    ["https://windsurfkids.su/parrents", "Родителям", "Документы, сопровождение и список вещей", wskImg("camp-02.webp")],
    ["https://windsurfkids.su/price", "Форматы", "Актуальные программы и стоимость", wskImg("water-01.jpg")]
  ];
  const gallery = [
    [wskImg("water-02.jpg"), "Юный виндсёрфер WindSurfKids на Красном море"],
    [wskImg("water-01.jpg"), "Дети готовят оборудование к тренировке"],
    [wskImg("water-04.jpg"), "Инструктор и участник WindSurfKids готовятся к тренировке на закате"],
    [wskImg("camp-04.webp"), "Участница WindSurfKids готовит снаряжение на берегу"],
    [wskImg("camp-05.webp"), "Группа WindSurfKids с тренерами на станции Vetratoria"]
  ];

  return `
<section class="dahab-sport-hero dahab-sport-hero--kids">
  <div class="dahab-sport-hero__inner">
    <div class="dahab-sport-hero__copy">
      <p class="eyebrow">Дахаб · детский спортивный лагерь</p>
      <h1>${escapeHtml(page.title)}</h1>
      <p>${escapeHtml(page.description)} Летняя программа 2026 года проходит с 27 мая по 30 августа.</p>
      <div class="dahab-sport-hero__actions">
        <a class="button button-primary" href="${officialSite}" target="_blank" rel="noopener noreferrer">Перейти на сайт WindSurfKids</a>
        <a class="button button-ghost" href="#program">Узнать о программе</a>
      </div>
      <div class="hero-advantages hero-advantages--sport">
        ${heroFacts.map((item) => `<span class="hero-advantage">${item}</span>`).join("")}
      </div>
    </div>
    <figure class="dahab-sport-hero__media">
      <img src="${page.image}" alt="Тренер с участниками детского лагеря WindSurfKids в Дахабе" width="1080" height="1080" loading="eager" decoding="async" fetchpriority="high">
    </figure>
  </div>
</section>

<section class="dahab-sport-section">
  <div class="dahab-sport-inner">
    ${sectionHeading("О лагере", "WindSurfKids — лето, которое проходит на воде", "Лагерь работает с 2009 года, а с 2012 года принимает детей в Дахабе. За это время программу прошли более 500 юных виндсёрферов.")}
    ${sportFeatureGrid(reasons)}
  </div>
</section>

<section class="dahab-sport-section dahab-sport-section--soft" id="program">
  <div class="dahab-sport-inner">
    ${sectionHeading("Программа", "Чему учатся и чем занимаются дети", "Водная подготовка остаётся центром программы, а занятия на берегу превращают поездку в полноценный спортивный лагерь.")}
    <div class="dahab-sport-process">
      ${program.map(([number, title, text, image, alt]) => `
        <article>
          <img src="${image}" alt="${alt}" width="1080" height="1080" loading="lazy" decoding="async">
          <div><span>${number}</span><h3>${title}</h3><p>${text}</p></div>
        </article>`).join("")}
    </div>
  </div>
</section>

<section class="dahab-sport-section">
  <div class="dahab-sport-inner">
    ${sectionHeading("Форматы", "Выберите подходящую продолжительность", "Условия и стоимость меняются в зависимости от сезона. Ниже — основные варианты, а актуальные цены размещены на официальном сайте лагеря.")}
    <div class="dahab-sport-price-grid">
      ${formats.map(([label, title, text]) => `
        <article class="dahab-sport-price-card">
          <small>${label}</small>
          <h3>${title}</h3>
          <p>${text}</p>
          <a class="button button-primary" href="https://windsurfkids.su/price" target="_blank" rel="noopener noreferrer">Узнать стоимость</a>
        </article>`).join("")}
    </div>
  </div>
</section>

<section class="dahab-sport-section dahab-sport-section--soft">
  <div class="dahab-sport-inner">
    ${sectionHeading("Распорядок", "Как проходит день в лагере", "Режим объединяет тренировку, восстановление, командные активности и полноценный отдых. Пятница — выходной день.")}
    <div class="dahab-sport-feature-grid">
      ${schedule.map(([number, title, text]) => `<article><span>${number}</span><h3>${title}</h3><p>${text}</p></article>`).join("")}
    </div>
  </div>
</section>

<section class="dahab-sport-section">
  <div class="dahab-sport-inner dahab-sport-safety">
    <div class="dahab-sport-safety__copy">
      <p class="eyebrow">Безопасность</p>
      <h2>Дети под присмотром на воде и на берегу</h2>
      <p>С группой работают тренеры, администраторы и спасатели. Перед выходом дети разбирают задачу, получают подходящее оборудование и занимаются в контролируемой акватории.</p>
      <div class="dahab-sport-safety__list">
        <span>Опытные тренеры по парусному спорту</span>
        <span>Спасатели контролируют выходы на воду</span>
        <span>Индивидуальный подход к возрасту и уровню</span>
      </div>
      <a class="button button-primary" href="https://windsurfkids.su/team" target="_blank" rel="noopener noreferrer">Познакомиться с командой</a>
    </div>
    <div class="dahab-sport-safety__media">
      <img src="${wskImg("camp-01.webp")}" alt="Детская группа WindSurfKids с тренерами" width="766" height="766" loading="lazy" decoding="async">
    </div>
  </div>
</section>

<section class="dahab-sport-section dahab-sport-section--soft">
  <div class="dahab-sport-inner dahab-sport-safety">
    <div class="dahab-sport-safety__copy">
      <p class="eyebrow">Проживание</p>
      <h2>Canyon Dahab Hotel</h2>
      <p>Дети размещаются в светлых номерах по 2–3 человека. В отеле вместе с ними живут тренеры, администраторы и аниматоры, отвечающие за повседневный распорядок.</p>
      <div class="dahab-sport-safety__list">
        <span>Трёхразовое сбалансированное питание</span>
        <span>Бассейн и спортивные площадки рядом</span>
        <span>Медицинская помощь в шаговой доступности</span>
      </div>
      <a class="button button-primary" href="https://windsurfkids.su/hotel" target="_blank" rel="noopener noreferrer">Подробнее о проживании</a>
    </div>
    <div class="dahab-sport-safety__media">
      <img src="${wskImg("hotel-01.jpg")}" alt="Canyon Dahab Hotel — место проживания участников лагеря" width="1024" height="446" loading="lazy" decoding="async">
    </div>
  </div>
</section>

<section class="dahab-sport-section">
  <div class="dahab-sport-inner">
    ${sectionHeading("Фотографии", "Жизнь WindSurfKids в Дахабе", "Тренировки, командные занятия и приключения между Красным морем и Синайскими горами. Фотографии опубликованы официальным сайтом WindSurfKids.")}
    <div class="dahab-sport-water-grid">
      ${gallery.map(([image, alt], index) => `
        <a${index === 0 ? ` class="is-large"` : ""} href="https://windsurfkids.su/photos" target="_blank" rel="noopener noreferrer" aria-label="Открыть фотографии на сайте WindSurfKids">
          <img src="${image}" alt="${alt}" width="1080" height="1080" loading="lazy" decoding="async">
        </a>`).join("")}
    </div>
    <div class="dahab-sport-water-actions">
      <a class="button button-primary" href="https://windsurfkids.su/photos" target="_blank" rel="noopener noreferrer">Больше фотографий</a>
    </div>
  </div>
</section>

<section class="dahab-sport-section dahab-sport-section--soft">
  <div class="dahab-sport-inner">
    ${sectionHeading("Родителям", "Частые вопросы перед поездкой", "Коротко о возрасте, сопровождении, снаряжении и подготовке ребёнка к лагерю.")}
    <div class="dahab-sport-faq">
      ${faqs.map(([question, answer], index) => `<details ${index === 0 ? "open" : ""}><summary>${question}</summary><p>${answer}</p></details>`).join("")}
    </div>
  </div>
</section>

<section class="dahab-sport-section">
  <div class="dahab-sport-inner">
    ${sectionHeading("Официальная информация", "Полезные разделы WindSurfKids", "Переходите на сайт организатора, чтобы проверить актуальные условия и задать команде лагеря вопросы напрямую.")}
    <div class="dahab-sport-useful">
      ${useful.map(([href, label, title, image]) => `
        <a href="${href}" target="_blank" rel="noopener noreferrer">
          <img src="${image}" alt="${title}" width="1080" height="1080" loading="lazy" decoding="async">
          <span>${label}</span>
          <h3>${title}</h3>
          <em>Открыть на WindSurfKids</em>
        </a>`).join("")}
    </div>
  </div>
</section>

<section class="dahab-sport-cta">
  <img src="${wskImg("camp-03.webp")}" alt="Поход участников WindSurfKids в Синайских горах" width="1080" height="1080" loading="lazy" decoding="async">
  <div class="dahab-sport-cta__inner">
    <p class="eyebrow">Летний сезон 2026</p>
    <h2>Готовы подарить ребёнку лето на воде?</h2>
    <p>Актуальные даты, стоимость и наличие мест уточняйте напрямую у команды WindSurfKids. Лагерь является самостоятельным организатором программы.</p>
    <div>
      <a class="button button-primary" href="${officialSite}" target="_blank" rel="noopener noreferrer">Перейти на официальный сайт WSK</a>
      <a class="button button-ghost" href="https://windsurfkids.su/price" target="_blank" rel="noopener noreferrer">Программы и цены</a>
    </div>
  </div>
</section>`.replace(/^[\t ]+$/gm, "");
};

const dahabHowToGetPage = (page) => {
  const routeSteps = [
    ["01", "Выберите рейс", "Ближайший к Дахабу международный аэропорт находится в Шарм-эль-Шейхе. В зависимости от сезона доступны прямые и стыковочные маршруты."],
    ["02", "Сообщите данные", "Для заказа трансфера понадобятся дата прилёта, номер рейса, время посадки и количество пассажиров."],
    ["03", "Встреча в аэропорту", "Водитель встретит вас после получения багажа и поможет разместить вещи и спортивное снаряжение."],
    ["04", "Дорога в Дахаб", "Расстояние составляет около 100 км. Обычно поездка на автомобиле или микроавтобусе занимает 1–1,5 часа."]
  ];
  const entryRules = [
    ["Паспорт", "Срок действия заграничного паспорта должен составлять не менее 6 месяцев на дату въезда."],
    ["Южный Синай", "Для отдыха только в Шарм-эль-Шейхе, Дахабе, Нувейбе или Табе сроком менее 15 дней обычно можно получить бесплатный разрешительный штамп по прилёте."],
    ["Туристическая виза", "Если поездка длится дольше 15 дней или маршрут выходит за пределы Южного Синая, потребуется туристическая виза. Однократная электронная виза стоит $30."],
    ["Проверка перед вылетом", "Правила зависят от гражданства и могут измениться. Перед поездкой проверьте требования авиакомпании и официального визового портала Египта."]
  ];
  const preparation = [
    ["Рейс", "Сохраните номер рейса и актуальное время прибытия."],
    ["Связь", "Оставьте телефон с WhatsApp или Telegram для контакта с водителем."],
    ["Багаж", "Предупредите заранее, если везёте доску, парус, крыло или другой негабаритный багаж."],
    ["Документы", "Возьмите распечатку e-Visa, если оформляли её онлайн, бронь проживания и страховой полис."]
  ];
  const faqs = [
    ["Какой аэропорт выбирать?", "Удобнее всего прилетать в международный аэропорт Шарм-эль-Шейха. От него до Дахаба около 100 км."],
    ["Сколько занимает трансфер?", "Обычно дорога занимает от одного до полутора часов. Время зависит от трафика, остановок и прохождения контрольных пунктов."],
    ["Можно ли заказать машину для группы?", "Да. В зависимости от количества пассажиров организуем легковой автомобиль или микроавтобус. Сообщите состав группы и объём багажа заранее."],
    ["Можно ли перевезти спортивное оборудование?", "Да, но габариты снаряжения нужно указать при заказе, чтобы мы подобрали подходящий автомобиль."],
    ["Нужна ли виза для поездки в Дахаб?", "Для короткой поездки только по курортам Южного Синая обычно доступен бесплатный штамп. Для более длительного отдыха или поездок по остальному Египту нужна туристическая виза."],
    ["Где проверять актуальные правила?", "Используйте официальный портал Egypt e-Visa и требования вашей авиакомпании. Окончательное решение о въезде принимает пограничная служба Египта."]
  ];

  return `
<section class="dahab-sport-hero dahab-sport-hero--route">
  <div class="dahab-sport-hero__inner">
    <div class="dahab-sport-hero__copy">
      <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
      <h1>${escapeHtml(page.title)}</h1>
      <p>${escapeHtml(page.description)}</p>
      <div class="dahab-sport-hero__actions">
        ${contactCta(page, "Заказать трансфер")}
        <a class="button button-ghost" href="#entry-rules">Правила въезда</a>
      </div>
      <div class="hero-advantages hero-advantages--sport">
        <span class="hero-advantage">Аэропорт SSH</span>
        <span class="hero-advantage">Около 100 км</span>
        <span class="hero-advantage">1–1,5 часа в пути</span>
        <span class="hero-advantage">Трансфер $35</span>
      </div>
    </div>
    <figure class="dahab-sport-hero__media">
      <img src="${page.image}" alt="Дахаб и побережье Акабского залива" width="1848" height="487" loading="eager" decoding="async" fetchpriority="high">
    </figure>
  </div>
</section>

<section class="dahab-sport-section">
  <div class="dahab-sport-inner">
    ${sectionHeading("Маршрут", "От Шарм-эль-Шейха до Дахаба", "Дахаб расположен на берегу Акабского залива в Южном Синае. Основной маршрут начинается в международном аэропорту Шарм-эль-Шейха.")}
    <div class="dahab-sport-feature-grid">
      ${routeSteps.map(([number, title, text]) => `<article><span>${number}</span><h3>${title}</h3><p>${text}</p></article>`).join("")}
    </div>
  </div>
</section>

<section class="dahab-sport-section dahab-sport-section--soft">
  <div class="dahab-sport-inner dahab-sport-safety">
    <div class="dahab-sport-safety__copy">
      <p class="eyebrow">Встреча в аэропорту</p>
      <h2>Трансфер для гостей станции — $35</h2>
      <p>Организуем поездку из аэропорта Шарм-эль-Шейха до Дахаба. Для одного или нескольких гостей подберём легковой автомобиль либо микроавтобус.</p>
      <div class="dahab-sport-safety__list">
        <span>Встреча по номеру рейса</span>
        <span>Помощь с багажом и снаряжением</span>
        <span>Доставка до отеля или станции</span>
      </div>
      ${contactCta(page, "Заказать трансфер")}
    </div>
    <div class="dahab-sport-safety__media">
      <img src="${dahabRefImg("bg-ganet.webp")}" alt="Станция Vetratoria Ganet Sinai в Дахабе" width="1600" height="1067" loading="lazy" decoding="async">
    </div>
  </div>
</section>

<section class="dahab-sport-section" id="entry-rules">
  <div class="dahab-sport-inner">
    ${sectionHeading("Документы", "Правила въезда и виза", "Краткая памятка для поездки в Дахаб. Информация проверена 30 июля 2026 года; перед вылетом требования стоит проверить ещё раз.")}
    <div class="dahab-sport-feature-grid">
      ${entryRules.map(([title, text], index) => `<article><span>0${index + 1}</span><h3>${title}</h3><p>${text}</p></article>`).join("")}
    </div>
    <div class="dahab-sport-price-actions">
      <a class="button button-primary" href="https://www.visa2egypt.gov.eg/eVisa/Home" target="_blank" rel="noopener noreferrer">Официальный портал Egypt e-Visa</a>
    </div>
  </div>
</section>

<section class="dahab-sport-section dahab-sport-section--soft">
  <div class="dahab-sport-inner">
    ${sectionHeading("Перед вылетом", "Что подготовить для спокойной встречи", "Четыре простых шага помогут быстро найти водителя и без задержек отправиться в Дахаб.")}
    <div class="dahab-sport-feature-grid">
      ${preparation.map(([title, text], index) => `<article><span>0${index + 1}</span><h3>${title}</h3><p>${text}</p></article>`).join("")}
    </div>
  </div>
</section>

<section class="dahab-sport-section">
  <div class="dahab-sport-inner">
    ${sectionHeading("FAQ", "Частые вопросы о дороге", "Коротко о времени в пути, багаже, машине и документах.")}
    <div class="dahab-sport-faq">
      ${faqs.map(([question, answer], index) => `<details ${index === 0 ? "open" : ""}><summary>${question}</summary><p>${answer}</p></details>`).join("")}
    </div>
  </div>
</section>

<section class="dahab-sport-cta">
  <img src="${page.image}" alt="Побережье Дахаба на Красном море" width="1848" height="487" loading="lazy" decoding="async">
  <div class="dahab-sport-cta__inner">
    <p class="eyebrow">Трансфер в Дахаб</p>
    <h2>Встретим в Шарм-эль-Шейхе и доставим до станции</h2>
    <p>Пришлите дату, номер рейса, время прилёта, количество пассажиров и информацию о спортивном багаже.</p>
    <div>
      ${contactCta(page, "Заказать трансфер")}
      <a class="button button-ghost" href="/dahab/contacts/">Контакты станции</a>
    </div>
  </div>
</section>`.replace(/^[\t ]+$/gm, "");
};

const dahabHomePage = (page) => {
  const priceCards = [
    ["Wingfoil", "Урок", "70$", "Инструктор и комплект под уровень.", dahabRefImg("price-wingfoil.webp"), "/dahab/wingfoil/price/"],
    ["Foil boat", "Фойл за лодкой", "60$", "Полёт на фойле без крыла.", dahabRefImg("price-foil-boat.webp"), "/dahab/wingfoil/price/"],
    ["Windsurf", "Урок", "70$", "Парус, доска и инструктор.", dahabRefImg("price-windsurf.webp"), "/dahab/windsurf/price/"],
    ["Kids", "Детский урок", "от 55$", "Лёгкое снаряжение и мягкий темп.", dahabRefImg("price-kids.webp"), "/dahab/windsurf-kids/"]
  ];
  const stations = [
    ["Wing Center", "Wingfoil · Lessons · Rental · Storage", "Обучение, прокат и хранение снаряжения для wingfoil.", dahabRefImg("bg-wingfoil-station.webp")],
    ["Swiss Inn", "Windsurf · Lessons · Rental · Storage", "Обучение, прокат и хранение снаряжения для windsurf.", dahabRefImg("bg-swiss.webp")],
    ["Ganet Sinai", "Windsurf · Lessons · Rental · Storage", "Обучение, прокат и хранение снаряжения для windsurf.", dahabRefImg("bg-ganet.webp")]
  ];
  const team = [
    ["A", "Manager & Senior Instructor", "Anatoly", "25+ лет в водных видах спорта. Подберёт RRD-комплект и формат, чтобы первый выход на воду был спокойным и ярким.", "Languages: RU · EN · DE"],
    ["H", "Pro Instructor", "Hassan", "10+ лет тренерского опыта. Самый узнаваемый райдер на споте: учит балансу, фойлу и уверенности в любых условиях.", "Languages: RU · EN"],
    ["E", "Kids Instructor", "Egor", "Специализируется на обучении детей от 8 лет. Превращает сложную технику в понятную игру и безопасный прогресс.", "Languages: RU · EN"],
    ["R", "Instructor", "Roma", "Спокойно объясняет физику ветра, крыло и стойку. Помогает освоиться даже в сильный ветер и не перегружает ученика.", "Languages: RU"],
    ["I", "Administrator", "Ira", "Душа станции: отвечает за комфорт, безопасность на воде и хорошее настроение до и после каждой сессии.", "Languages: RU · EN"],
    ["A", "Instructor", "Anya", "Отлично видит технические ошибки и помогает заложить базу, на которой ученик быстрее начинает прогрессировать.", "Languages: RU · EN"]
  ];
  const reviews = dahabReviewItems;

  return `
<section class="dahab-hero">
  <img class="dahab-hero__image" src="${dahabRefImg("ganet-sinai.webp")}" alt="Дахаб: Wingfoil и Windsurf на Красном море" width="1600" height="1067" fetchpriority="high">
  <div class="dahab-hero__shade"></div>
  <div class="dahab-hero__content">
    <p class="eyebrow">Египет · Дахаб</p>
    <h1>Wingfoil и Windsurf в Дахабе</h1>
    <p class="hero-lead">Обучение и прокат на Красном море для новичков и опытных райдеров. Подберём программу, инструктора и снаряжение под ваш уровень.</p>
    <div class="hero-advantages"><span class="hero-advantage">С 2006 года</span><span class="hero-advantage">Условия для любого уровня</span><span class="hero-advantage">10 000+ учеников</span><span class="hero-advantage">3 спасательных катера</span></div>
    <div class="hero-actions dahab-hero-actions">
      ${contactCta(page, "Написать нам")}
      <a class="button button-ghost" href="/dahab/wingfoil/">Wingfoil</a>
      <a class="button button-ghost" href="/dahab/windsurf/">Windsurf</a>
      <a class="button button-ghost" href="/dahab/wingfoil/price/">Цены</a>
    </div>
  </div>
</section>

<section class="dahab-marquee" aria-label="Vetratoria Dahab">
  <div class="dahab-marquee__track">
    ${Array.from({ length: 4 }, () => `<span>DAHAB WIND ALL YEAR / WINGFOIL 70$ / WINDSURF 70$ / KIDS FROM 55$ / RENTAL BY FACT / RESCUE BOAT / SWISS INN / GANET SINAI / WING CENTER / </span>`).join("")}
  </div>
</section>

<section class="sport-split" id="sport">
  <div class="sport-split__inner">
    <header class="section-heading">
      <p class="eyebrow">Выберите спорт</p>
      <h2>Wingfoil или Windsurf</h2>
    </header>
    <div class="sport-split__grid">
      <a class="sport-tile" href="/dahab/wingfoil/" aria-label="Открыть страницу Wingfoil в Дахабе">
        <img src="${dahabRefImg("choose-wingfoil.webp")}" alt="Wingfoil в Дахабе" width="1600" height="1067" loading="lazy" decoding="async">
        <div class="sport-tile__content">
          <h2>Wingfoil</h2>
          <span>Подробнее</span>
        </div>
      </a>
      <a class="sport-tile" href="/dahab/windsurf/" aria-label="Открыть страницу Windsurf в Дахабе">
        <img src="/assets/img/final/windsurf/hero.webp" alt="Windsurf в Дахабе" width="1920" height="1280" loading="lazy" decoding="async">
        <div class="sport-tile__content">
          <h2>Windsurf</h2>
          <span>Подробнее</span>
        </div>
      </a>
    </div>
    <a class="wsk-strip" href="/dahab/windsurf-kids/">
      <span class="wsk-strip__media"><img src="${dahabRefImg("wsk-2.webp")}" alt="Детский windsurf в Дахабе" width="1090" height="600" loading="lazy" decoding="async"></span>
      <span class="wsk-strip__content"><small>Windsurf Kids · Дахаб</small><b>WINDSURFKIDS</b><em>Детский спортивный лагерь WindSurfKids существует с 2009 года, а с 2012 года базируется в Дахабе. Спорт, друзья, творчество и безопасная акватория.</em></span>
      <span class="wsk-strip__button">Смотреть Kids</span>
    </a>
  </div>
</section>

<section class="dahab-section compact-band" id="prices">
  <div class="dahab-inner">
    <header class="section-heading">
      <p class="eyebrow">Цены</p>
      <h2>Цены на обучение и прокат</h2>
    </header>
    <div class="price-grid">
      ${priceCards.map(([label, title, value, text, image, href]) => `
        <a class="price-card" href="${href}">
          <figure class="price-photo"><img src="${image}" alt="${label} ${title}" width="900" height="675" loading="lazy" decoding="async"></figure>
          <span>${label}</span>
          <h3>${title}</h3>
          <b>${value}</b>
          <p>${text}</p>
          <em>Смотреть формат →</em>
        </a>`).join("")}
    </div>
    <div class="price-help-cta">
      <div><b>Не знаете, с чего начать?</b><p>Напишите даты, уровень и спорт — подберём формат, станцию и снаряжение.</p></div>
      <nav>${contactCta(page, "Оставить заявку", "", null)}<a href="/dahab/wingfoil/price/">Wingfoil цены</a><a href="/dahab/windsurf/price/">Windsurf цены</a></nav>
    </div>
  </div>
</section>

<section class="station-advice" id="stations">
  <header class="station-advice__head">
    <p class="eyebrow">Станции</p>
    <h2>Станции Vetratoria в Дахабе</h2>
  </header>
  <div class="station-advice__list">
    ${stations.map(([title, meta, text, image]) => `<a href="/dahab/stations/">
        <figure><img src="${image}" alt="${title}" width="1600" height="1067" loading="lazy" decoding="async"></figure>
        <div><b>${title}</b><span>${meta}</span><em>${text}</em></div>
      </a>`).join("")}
  </div>
  ${contactCta(page, "Написать нам", "station-advice__cta")}
</section>

<section class="trust-block" id="team-reviews">
  <div class="trust-block__inner">
    <header class="trust-head">
      <p class="eyebrow">Команда и отзывы</p>
      <h2>Команда, которая выводит на воду</h2>
      <p>Мы не просто выдаём снаряжение — подбираем станцию, ветер и формат под ваш уровень. Инструктор рядом: на берегу, на старте и в воде.</p>
    </header>
    <section class="trust-slider trust-slider--team" aria-label="Команда Vetratoria Dahab">
      <div class="trust-slider__top">
        <div><span>Команда</span><h3>Инструкторы и команда станции</h3></div>
        <div class="trust-slider__controls"><button type="button" data-trust-prev="team" aria-label="Предыдущие участники команды">‹</button><button type="button" data-trust-next="team" aria-label="Следующие участники команды">›</button></div>
      </div>
      <div class="trust-track" data-trust-track="team">
        ${team.map(([initial, role, name, text, langs]) => `<article class="trust-card trust-card--person"><figure class="trust-initial" aria-label="${name}"><span>${initial}</span></figure><div><span>${role}</span><h3>${name}</h3><p>${text}</p><em>${langs}</em></div></article>`).join("")}
      </div>
    </section>
    <section class="station-atmosphere" aria-label="Атмосфера станции Vetratoria Dahab">
      <a class="station-atmosphere__card station-atmosphere__card--main" href="/dahab/wingfoil/"><img src="${dahabRefImg("block-wingfoil.webp")}" alt="Wingfoil" loading="lazy" decoding="async"><span>Wingfoil</span><strong>Полёты над водой</strong><em>Крыло, фойл и быстрый прогресс</em></a>
      <a class="station-atmosphere__card" href="/dahab/windsurf/"><img src="${dahabRefImg("block-windsurf.webp")}" alt="Windsurf" loading="lazy" decoding="async"><span>Windsurf</span><strong>Парус и ветер</strong><em>Уроки, прокат и практика</em></a>
      <a class="station-atmosphere__card" href="/dahab/wingfoil/price/"><img src="${dahabRefImg("block-station.webp")}" alt="Станция Vetratoria" loading="lazy" decoding="async"><span>Цены</span><strong>Wingfoil прайс</strong><em>Комплекты, уроки, пакеты и хранение</em></a>
      <div class="station-atmosphere__panel"><span>Атмосфера станции</span><h3>Станция живёт между выходами на воду</h3><p>Здесь выбирают комплект, смотрят ветер, обсуждают попытки и возвращаются на воду снова. Не только урок — атмосфера Дахаба и команды рядом.</p><div><small>вода</small><small>берег</small><small>прогресс</small></div><a href="/media/dahab/">Смотреть медиа Дахаба →</a></div>
    </section>
    <section class="trust-slider trust-slider--reviews" aria-label="Отзывы гостей Vetratoria Dahab">
      <div class="trust-slider__top">
        <div><span>Отзывы</span><h3>Что говорят гости</h3></div>
        <a href="https://www.tripadvisor.com/" target="_blank" rel="noopener">144 отзыва →</a>
        <div class="trust-slider__controls"><button type="button" data-trust-prev="reviews" aria-label="Предыдущие отзывы">‹</button><button type="button" data-trust-next="reviews" aria-label="Следующие отзывы">›</button></div>
      </div>
      <div class="trust-track trust-track--reviews" data-trust-track="reviews">
        ${reviews.map(([initial, name, stars, text]) => `<article class="trust-card trust-card--review"><div class="trust-review__top"><span>${initial}</span><div><strong>${name}</strong><small>${stars}</small></div></div><p>«${text}»</p></article>`).join("")}
      </div>
    </section>
  </div>
</section>

<section class="water-area" id="water-area">
  <div class="water-area__inner">
    <div class="water-area__copy">
      <p class="eyebrow">Акватория</p>
      <h2>Где катаем в Дахабе</h2>
      <p>У Дахаба есть редкая фишка: рядом находятся спокойная вода для первых стартов, длинная зона для прогресса и открытое море для уверенных райдеров.</p>
      <div class="water-area__cards">
        <article><strong>01. Лагуна</strong><p>Самый спокойный старт: ровная вода, песчаная коса и понятная зона рядом с берегом. Хорошо для первых галсов и первых полётов на фойле.</p></article>
        <article><strong>02. Скоростная зона</strong><p>Длинные галсы и стабильный ветер. Здесь удобно отрабатывать скорость, повороты, контроль крыла или паруса.</p></article>
        <article><strong>03. Волновая зона</strong><p>Открытая вода для тех, кто уже уверенно катается. Больше ветра, волна и настоящая дахабская практика.</p></article>
      </div>
  <div class="water-area__actions">${contactCta(page, "Подобрать зону")}<a href="/dahab/safety/">Безопасность на воде →</a></div>
    </div>
    <figure class="water-area__visual"><img src="${dahabRefImg("aqva-aerial.webp")}" alt="Акватория Дахаба для wingfoil и windsurf" loading="lazy" decoding="async"></figure>
  </div>
</section>`;
};

const stationImg = (name) => `/assets/img/final/stations/${name}`;
const dahabSafetyImg = (name) => `/assets/img/final/dahab/${name}`;

const stationSlider = ({ title, lead, images }) => `
  <figure class="dahab-station-slider" data-station-slider aria-label="Фото ${escapeHtml(title)}">
    <div class="dahab-station-slider__viewport">
      ${images.map((image, index) => `<img data-station-slide class="${index === 0 ? "is-active" : ""}" src="${stationImg(image.file)}" alt="${escapeHtml(image.alt)}" loading="${index === 0 ? "eager" : "lazy"}" decoding="async" aria-hidden="${index === 0 ? "false" : "true"}">`).join("")}
    </div>
    <figcaption class="dahab-station-slider__caption"><b>${escapeHtml(title)}</b><span>${escapeHtml(lead)}</span></figcaption>
    <div class="dahab-station-slider__nav">
      <button type="button" data-station-prev aria-label="Предыдущее фото">←</button>
      <button type="button" data-station-next aria-label="Следующее фото">→</button>
    </div>
  </figure>`;

const dahabStationsPage = (page) => {
  const stations = [
    {
      id: "vetratoria-ganet",
      eyebrow: "Windsurf",
      title: "Vetratoria Ganet Sinai",
      text: [
        "База Vetratoria в Дахабе для windsurf, проката, уроков и станционной жизни рядом с водой. Здесь удобно встретиться с командой, подобрать комплект и понять, какая зона подходит под ветер и уровень.",
        "Ganet хорошо подходит для практики, прогресса и спокойного выбора формата без лишней логистики: пришли на станцию, обсудили условия, вышли на воду."
      ],
      tags: ["Windsurf", "Прокат", "Практика", "Команда рядом"],
      sliderTitle: "Ganet Sinai",
      sliderLead: "Windsurf-база, прокат, уроки и выбор формата под ветер.",
      images: [
        { file: "ganet-01.webp", alt: "Vetratoria Ganet Sinai у воды" },
        { file: "ganet-02.webp", alt: "Снаряжение на станции Ganet Sinai" },
        { file: "ganet-03.webp", alt: "Внутри станции Ganet Sinai" },
        { file: "ganet-04.webp", alt: "Пляж и старт у Ganet Sinai" },
        { file: "ganet-05.webp", alt: "Оборудование Vetratoria Ganet" },
        { file: "ganet-06.webp", alt: "Фасад Vetratoria Ganet Sinai" }
      ]
    },
    {
      id: "wing-center",
      reverse: true,
      eyebrow: "Wingfoil",
      title: "Wing Center",
      text: [
        "Главная точка для wingfoil: здесь начинаются уроки, подбор крыла и доски, фойл за лодкой и первые самостоятельные выходы. Формат подходит тем, кто хочет быстро разобраться с фойлом и крылом.",
        "На Wing Center удобно смотреть ветер, обсуждать попытки с инструктором и возвращаться на воду снова — без сложной системы пакетов и лишних шагов."
      ],
      tags: ["Wingfoil", "Foil boat", "Уроки", "Подбор комплекта"],
      sliderTitle: "Wing Center",
      sliderLead: "Wingfoil, foil boat, оборудование и выходы на воду.",
      images: [
        { file: "wing-center-01.webp", alt: "Wing Center Vetratoria" },
        { file: "wing-center-02.webp", alt: "Пляж у Wing Center" },
        { file: "wing-center-03.webp", alt: "Карта акватории Wing Center" },
        { file: "wing-center-04.webp", alt: "Зона отдыха Wing Center" },
        { file: "wing-center-05.webp", alt: "Стартовая зона Wing Center" },
        { file: "wing-center-06.webp", alt: "Wing Center со стороны воды" },
        { file: "wing-center-07.webp", alt: "Оборудование Wing Center" },
        { file: "wing-center-08.webp", alt: "Зона ожидания Wing Center" },
        { file: "wing-center-09.webp", alt: "Фасад Wing Center" },
        { file: "wing-center-10.webp", alt: "Терраса Wing Center" }
      ]
    },
    {
      id: "swiss-inn",
      eyebrow: "Windsurf",
      title: "Swiss Inn",
      text: [
        "Станция рядом с отелем и понятным стартом на воду. Swiss Inn удобен для windsurf-уроков, детского формата, проката и тех, кто хочет простую логистику между отдыхом и катанием.",
        "Здесь хорошо начинать спокойно: берег рядом, оборудование под рукой, инструктор видит условия и помогает выбрать парус, доску и задачу на занятие."
      ],
      tags: ["Windsurf", "Kids", "Первые уроки", "Отель рядом"],
      sliderTitle: "Swiss Inn",
      sliderLead: "Windsurf, kids, первые уроки и комфортный старт рядом с отелем.",
      images: [
        { file: "swiss-01.webp", alt: "Оборудование Swiss Inn" },
        { file: "swiss-02.webp", alt: "Паруса на Swiss Inn" },
        { file: "swiss-03.webp", alt: "Зона хранения Swiss Inn" },
        { file: "swiss-04.webp", alt: "Терраса Swiss Inn" },
        { file: "swiss-05.webp", alt: "Пляж Swiss Inn" },
        { file: "swiss-06.webp", alt: "Фасад Vetratoria Swiss Inn" },
        { file: "swiss-07.webp", alt: "Снаряжение Swiss Inn" }
      ]
    }
  ];

  return `
<section class="dahab-stations-hero" aria-labelledby="stations-title">
  <img src="${stationImg("hero.webp")}" alt="Станции Vetratoria в Дахабе" width="1920" height="1080" fetchpriority="high">
  <div class="dahab-stations-hero__shade"></div>
  <div class="dahab-stations-hero__content">
    <p class="eyebrow">Дахаб · станции</p>
    <h1 id="stations-title">Станции Vetratoria в Дахабе</h1>
    <p>Три точки у воды: Vetratoria Ganet Sinai, Wing Center и Swiss Inn. На этой странице — коротко о каждой станции, фото и понятный выбор, куда ехать под ваш спорт, уровень и даты.</p>
    <div class="dahab-stations-pills">
      <a href="#vetratoria-ganet">Ganet Sinai</a>
      <a href="#wing-center">Wing Center</a>
      <a href="#swiss-inn">Swiss Inn</a>
      <a href="/dahab/windsurf/">Windsurf</a>
      <a href="/dahab/wingfoil/">Wingfoil</a>
      <a href="/dahab/windsurf-kids/">Kids</a>
    </div>
    <div class="dahab-stations-actions">
      ${contactCta(page, "Подобрать станцию")}
      <a class="button button-ghost" href="#vetratoria-ganet">Смотреть станции</a>
    </div>
  </div>
</section>

${stations.map((station, index) => `
<section class="dahab-stations-section${index % 2 ? " dahab-stations-section--soft" : ""}" id="${station.id}">
  <div class="dahab-stations-inner">
    <div class="dahab-station-block${station.reverse ? " dahab-station-block--reverse" : ""}">
      <div class="dahab-station-copy">
        <p class="eyebrow">${station.eyebrow}</p>
        <h2>${station.title}</h2>
        ${station.text.map((paragraph) => `<p>${paragraph}</p>`).join("")}
        <div class="dahab-station-tags">${station.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
      </div>
      ${stationSlider({ title: station.sliderTitle, lead: station.sliderLead, images: station.images })}
    </div>
  </div>
</section>`).join("")}

<section class="dahab-stations-cta" id="contact">
  <div class="dahab-stations-inner">
    <div class="dahab-stations-cta__box">
      <div>
        <p class="eyebrow">Подбор станции</p>
        <h2>Не знаете, куда лучше приехать?</h2>
        <p>Напишите даты, отель, уровень и спорт. Мы подскажем, какая станция будет удобнее именно для вашего формата: wingfoil, windsurf, kids, прокат или уроки.</p>
      </div>
      <div class="dahab-stations-actions">
        ${contactCta(page, "Подобрать станцию")}
        <a class="button button-ghost" href="/dahab/wingfoil/price/">Смотреть цены</a>
      </div>
    </div>
  </div>
</section>`.replace(/^[\t ]+$/gm, "");
};

const dahabSafetyPage = (page) => {
  const safetyFacts = [
    ["Rescue", "4 спасательных катера", "Катера поддерживают станции и позволяют быстро реагировать, если райдеру нужна помощь на воде."],
    ["Control", "Контроль акватории", "Команда следит за фактическими условиями, рабочими зонами и райдерами во время выхода."],
    ["Connection", "Связь на волнах", "Для выходов на волны выдаём телефоны, чтобы райдер мог связаться со станцией."],
    ["Briefing", "Инструктаж до старта", "До выхода разбираем ветер, маршрут, границы зоны, сигналы и правила возвращения."]
  ];
  const briefingSteps = [
    ["01", "Условия", "Сверяем прогноз с фактическим ветром, его направлением и обстановкой на воде."],
    ["02", "Зона", "Показываем рабочую акваторию, безопасный маршрут и места, куда не следует уходить."],
    ["03", "Связь", "Объясняем, как связаться со станцией и какие сигналы использовать в сложной ситуации."],
    ["04", "Выход", "Райдер выходит на воду с понятным планом катания и заранее оговорёнными правилами возврата."]
  ];

  return `
<section class="dahab-hero">
  <img class="dahab-hero__image" src="${dahabSafetyImg("safety-boat.webp")}" alt="Спасательный катер Vetratoria в Дахабе" width="1600" height="1067" fetchpriority="high">
  <div class="dahab-hero__shade"></div>
  <div class="dahab-hero__content">
    <p class="eyebrow">Дахаб · безопасность</p>
    <h1>Безопасность на воде — часть каждого выхода</h1>
    <p class="hero-lead">В Vetratoria безопасность начинается до воды: объясняем акваторию, проводим инструктаж, контролируем райдеров и поддерживаем rescue-готовность на станциях.</p>
    <div class="hero-advantages">
      <span class="hero-advantage">4 спасательных катера</span>
      <span class="hero-advantage">Контроль на воде</span>
      <span class="hero-advantage">Связь на волнах</span>
      <span class="hero-advantage">Инструктаж перед выходом</span>
    </div>
    <div class="hero-actions dahab-hero-actions">
      ${contactCta(page, "Задать вопрос")}
      <a class="button button-ghost" href="#safety-system">Как это работает</a>
    </div>
  </div>
</section>

<section class="dahab-sport-section" id="safety-system">
  <div class="dahab-sport-inner">
    ${sectionHeading("Главное", "Что Vetratoria делает для безопасности", "Райдер заранее понимает, кто контролирует воду, как устроена связь и что происходит перед первым выходом.")}
    <div class="dahab-sport-feature-grid">
      ${safetyFacts.map(([label, title, text]) => `
        <article>
          <span>${label}</span>
          <h3>${title}</h3>
          <p>${text}</p>
        </article>`).join("")}
    </div>
  </div>
</section>

<section class="dahab-sport-section dahab-sport-section--soft" id="briefing">
  <div class="dahab-sport-inner dahab-sport-safety">
    <div class="dahab-sport-safety__copy">
      <p class="eyebrow">Перед выходом</p>
      <h2>Инструктаж и объяснение акватории</h2>
      <p>Перед занятием или самостоятельной практикой разбираем старт, маршрут, границы зоны и действия при изменении ветра.</p>
      <div class="dahab-sport-safety__list">
        <span>Проверяем ветер и условия</span>
        <span>Показываем безопасную зону</span>
        <span>Объясняем сигналы и связь</span>
        <span>Согласовываем правила возврата</span>
      </div>
      <a class="button button-primary" href="#briefing-steps">Все этапы</a>
    </div>
    <div class="dahab-sport-safety__media">
      <img src="${dahabSafetyImg("safety-briefing-generated.webp")}" alt="Инструктаж перед выходом на воду в Дахабе" width="1600" height="900" loading="lazy" decoding="async">
    </div>
  </div>
</section>

<section class="dahab-sport-section" id="water-control">
  <div class="dahab-sport-inner dahab-sport-safety">
    <div class="dahab-sport-safety__copy">
      <p class="eyebrow">На воде</p>
      <h2>Контроль усиливает правила</h2>
      <p>Rescue и связь нужны для спокойной организации катания. До старта согласовываем маршрут, во время выхода следим за обстановкой и помогаем, когда райдеру нужна поддержка.</p>
      <div class="dahab-sport-safety__list">
        <span>Новичкам — понятная зона и инструктор рядом</span>
        <span>Самостоятельным — согласование условий и маршрута</span>
        <span>На волнах — телефон и связь со станцией</span>
      </div>
      ${contactCta(page, "Уточнить формат")}
    </div>
    <div class="dahab-sport-safety__media">
      <img src="${dahabSafetyImg("cover-safety.webp")}" alt="Контроль райдера спасательным катером Vetratoria" width="1600" height="1067" loading="lazy" decoding="async">
    </div>
  </div>
</section>

<section class="dahab-sport-section dahab-sport-section--soft" id="briefing-steps">
  <div class="dahab-sport-inner">
    ${sectionHeading("Порядок", "Четыре шага перед выходом", "Короткая последовательность помогает не упустить важное и спокойно начать занятие или самостоятельную практику.")}
    <div class="dahab-sport-feature-grid">
      ${briefingSteps.map(([number, title, text]) => `
        <article>
          <span>${number}</span>
          <h3>${title}</h3>
          <p>${text}</p>
        </article>`).join("")}
    </div>
  </div>
</section>

<section class="dahab-sport-cta">
  <img src="${dahabSafetyImg("safety-boat.webp")}" alt="Rescue Vetratoria в Дахабе" width="1600" height="1067" loading="lazy" decoding="async">
  <div class="dahab-sport-cta__inner">
    <p class="eyebrow">Подбор формата</p>
    <h2>Не уверены, какая зона подойдёт?</h2>
    <p>Напишите спорт, уровень, даты и хотите ли выходить на волны. Команда подскажет станцию, акваторию и безопасный формат.</p>
    <div>
      ${contactCta(page, "Написать нам")}
      <a class="button button-ghost" href="/dahab/">Обзор Дахаба</a>
    </div>
  </div>
</section>`.replace(/^[\t ]+$/gm, "");
};

const countryPage = (page) => {
  const country = countriesByKey[page.country];
  if (country.key === "dahab") return dahabHomePage(page);
  const primaryPricePath = `/${country.key}/${country.sports[0]}/price/`;
  const actions = `<a class="button button-primary" href="${primaryPricePath}">Цены</a>${contactCta(page, "Написать нам", "button button-ghost")}`;
  const sports = country.sports.map((key) => site.sports[key]);
  return `${hero(page, actions)}
  <section class="content-section">
    <div class="section-inner">
      ${sectionHeading("Спорт и станции", `${country.title}: выберите свой формат`, `Здесь собраны ключевые входы: спорт, цены, команда и станционная логика под ${country.tone}.`)}
      <div class="link-grid">
        ${country.sports.map((key) => {
          const sport = site.sports[key];
          return `<a class="link-card" href="/${country.key}/${key}/"><small>${sport.nav}</small><h3>${sport.subtitle}</h3><p>${sport.lead}</p><em>Открыть</em></a>`;
        }).join("")}
        <a class="link-card link-card--accent" href="${primaryPricePath}"><small>Price</small><h3>Цены и форматы</h3><p>Уроки, курсы, прокат, хранение и подбор программы.</p><em>Смотреть цены</em></a>
        ${country.extras.map((item) => `<a class="link-card" href="${item.href}"><small>${country.nav}</small><h3>${item.title}</h3><p>Подробности направления, которые помогают спокойно выйти на воду.</p><em>Перейти</em></a>`).join("")}
      </div>
    </div>
  </section>
  <section class="content-section content-section--soft">
    <div class="section-inner">
      <div class="rail-list">
        ${sports.map((sport, index) => `<article><b>0${index + 1}</b><h3>${sport.title}</h3><p>${sport.lead}</p></article>`).join("")}
      </div>
    </div>
  </section>`;
};

const sportPage = (page) => {
  if (page.country === "dahab" && page.sport === "wingfoil") return dahabWingfoilPage(page);
  if (page.country === "dahab" && page.sport === "windsurf") return dahabWindsurfPage(page);
  if (page.country === "dahab" && page.sport === "windsurf-kids") return dahabWindsurfKidsPage(page);

  const country = countriesByKey[page.country];
  const sport = site.sports[page.sport];
  return `${hero(page, `<a class="button button-primary" href="${page.path}price/">Цены</a>${contactCta(page, "Записаться", "button button-ghost")}`)}
  <section class="content-section">
    <div class="section-inner two-column">
      <div>
        <p class="eyebrow">Формат</p>
        <h2>${sport.subtitle}: маршрут обучения</h2>
        <p>${sport.lead}</p>
        <p>Команда подбирает формат под ветер, вес, уровень, цели поездки и количество дней на станции. Важное остается простым: инструктор рядом, снаряжение подходит, следующий шаг понятен.</p>
      </div>
      <div class="check-list">
        ${sport.bullets.map((item) => `<span>${item}</span>`).join("")}
      </div>
    </div>
  </section>
  <section class="content-section content-section--soft">
    <div class="section-inner">
      ${sectionHeading(country.title, "Что входит в занятия", "Практика строится от берега к воде: техника, безопасность, самостоятельность и удовольствие от ветра.")}
      <div class="link-grid link-grid--four">
        <article class="link-card"><small>01</small><h3>Разбор условий</h3><p>Ветер, акватория, зона занятий и правила выхода.</p></article>
        <article class="link-card"><small>02</small><h3>Снаряжение</h3><p>Подбор доски, паруса, крыла, кайта или фойла под задачу.</p></article>
        <article class="link-card"><small>03</small><h3>Вода</h3><p>Практика с инструктором и понятной обратной связью.</p></article>
        <article class="link-card"><small>04</small><h3>Прогресс</h3><p>Следующий шаг: курс, прокат, фрирайд или самостоятельное катание.</p></article>
      </div>
    </div>
  </section>`;
};

const priceRows = (sportTitle = "Спорт") => [
  [`${sportTitle}: вводный урок`, "60 минут", "индивидуально или мини-группа", "по запросу"],
  [`${sportTitle}: курс`, "3-5 занятий", "план прогресса и инструктор", "по запросу"],
  ["Прокат снаряжения", "1 час / день", "подбор под ветер и уровень", "по запросу"],
  ["Хранение", "день / месяц", "станция и доступ к инфраструктуре", "по запросу"]
];

const dahabWingfoilPricePage = (page) => `
<section class="dahab-hero dahab-hero--price">
  <img class="dahab-hero__image" src="/assets/img/final/wingfoil/hero.webp" alt="Цены Wingfoil в Дахабе" width="1600" height="1067" fetchpriority="high">
  <div class="dahab-hero__shade"></div>
  <div class="dahab-hero__content">
    <p class="eyebrow">Египет · Дахаб · Wingfoil</p>
    <h1>Цены Wingfoil в Дахабе</h1>
    <p>Полный прайс: аренда комплектов, уроки винга, фойл за лодкой, Wing + SUP, Wing + Foil, отдельная аренда крыла и доски, обучающие пакеты, интенсив-пакеты, страховка и хранение.</p>
    <div class="hero-actions dahab-hero-actions">
      <a class="button button-primary" href="#rental">Аренда</a>
      <a class="button button-primary" href="#lessons">Уроки</a>
      <a class="button button-primary" href="#parts">Отдельные части</a>
      <a class="button button-primary" href="#packages">Пакеты</a>
      <a class="button button-ghost" href="#application">Подобрать формат</a>
    </div>
  </div>
</section>

<section class="wingfoil-price-section wingfoil-price-section--soft" id="rental">
  <div class="wingfoil-price-inner">
    <header class="wingfoil-price-heading">
      <p class="eyebrow">Wingfoil · аренда</p>
      <h2>Аренда комплектов для винг-сёрфинга</h2>
      <p>Комплект и категория подбираются под уровень, вес, ветер и задачу.</p>
    </header>
    <div class="wingfoil-table-wrap">
      <table class="wingfoil-price-table">
        <thead>
          <tr><th rowspan="2">Время аренды</th><th colspan="3">Комплект для винг-сёрфинга</th><th colspan="3">Продвинутый комплект</th></tr>
          <tr><th>Винг + SUP<br>Аренда ($)</th><th>Винг + Фойл<br>Аренда ($)</th><th>Страховка* ($)</th><th>Золотой винг или карбоновая доска<br>Аренда ($)</th><th>Золотой винг + карбоновая доска<br>Аренда ($)</th><th>Страховка* ($)</th></tr>
        </thead>
        <tbody>
          <tr><td>1 час</td><td>25</td><td>45</td><td>10</td><td>55</td><td>65</td><td>20</td></tr>
          <tr class="table-section"><td colspan="7">Аренда по дням</td></tr>
          <tr><td>1 день</td><td>—</td><td>95</td><td>25</td><td>125</td><td>145</td><td>30</td></tr>
          <tr><td>2 дня</td><td>—</td><td>175</td><td>30</td><td>220</td><td>255</td><td>45</td></tr>
          <tr><td>3 дня</td><td>—</td><td>220</td><td>35</td><td>280</td><td>320</td><td>55</td></tr>
          <tr><td>4 дня</td><td>—</td><td>255</td><td>40</td><td>325</td><td>375</td><td>60</td></tr>
          <tr><td>5 дней</td><td>—</td><td>290</td><td>45</td><td>370</td><td>425</td><td>65</td></tr>
          <tr><td>6 дней</td><td>—</td><td>315</td><td>50</td><td>405</td><td>465</td><td>70</td></tr>
          <tr><td>7 дней</td><td>—</td><td>355</td><td>55</td><td>425</td><td>485</td><td>75</td></tr>
          <tr><td>Доп. день</td><td>—</td><td>50</td><td>5</td><td>60</td><td>70</td><td>10</td></tr>
          <tr><td>Смена категории / день</td><td></td><td></td><td></td><td>20</td><td>25</td><td></td></tr>
        </tbody>
      </table>
    </div>
    <p class="wingfoil-price-copy">Лодочная поддержка: $10</p>

    <h3 class="wingfoil-price-subtitle">Хранение wingfoil-оборудования</h3>
    <div class="wingfoil-table-wrap">
      <table class="wingfoil-price-table">
        <thead><tr><th>Период хранения</th><th>Цена ($)</th></tr></thead>
        <tbody>
          <tr><td>1 неделя</td><td>180</td></tr>
          <tr><td>10 дней</td><td>200</td></tr>
          <tr><td>2 недели</td><td>240</td></tr>
          <tr><td>1 месяц</td><td>300</td></tr>
          <tr><td>Следующий месяц</td><td>140</td></tr>
          <tr><td>1 год</td><td>800</td></tr>
        </tbody>
      </table>
    </div>
    <div class="wingfoil-price-notes"><p>Цена за один комплект: 1 доска + 3 винга.</p></div>

    <h3 class="wingfoil-price-subtitle">Дополнительно доступно в аренду</h3>
    <div class="wingfoil-table-wrap">
      <table class="wingfoil-price-table">
        <thead><tr><th>Оборудование</th><th>Цена ($)</th></tr></thead>
        <tbody>
          <tr><td>Аренда SUP — 1 час / 1 день</td><td>10 / 25</td></tr>
          <tr><td>Гидрокостюм — 1 день</td><td>5</td></tr>
          <tr><td>Шлем, защитный жилет* *при наличии</td><td>Входит в аренду</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</section>

<section class="wingfoil-price-section" id="lessons">
  <div class="wingfoil-price-inner">
    <header class="wingfoil-price-heading">
      <p class="eyebrow">Wingfoil · уроки</p>
      <h2>Уроки и часовые форматы</h2>
      <p>Для старта можно идти через Wing + SUP и фойл за лодкой, дальше — Wing + Foil и самостоятельная практика.</p>
    </header>

    <h3 class="wingfoil-price-subtitle">Уроки винга (винг + доска + инструктор)</h3>
    <div class="wingfoil-table-wrap">
      <table class="wingfoil-price-table">
        <thead><tr><th>Длительность урока</th><th>Цена ($)</th></tr></thead>
        <tbody><tr><td>1 час — Индивидуальный</td><td>70</td></tr><tr><td>1 час — Групповой* (за человека)</td><td>55</td></tr></tbody>
      </table>
    </div>
    <div class="wingfoil-price-notes"><p>*2–3 человека в группе</p></div>

    <h3 class="wingfoil-price-subtitle">Уроки фойла за лодкой (фойл + лодка + инструктор)</h3>
    <div class="wingfoil-table-wrap">
      <table class="wingfoil-price-table">
        <thead><tr><th>Длительность урока</th><th>Цена ($)</th></tr></thead>
        <tbody><tr><td>30 минут — Индивидуально</td><td>60</td></tr></tbody>
      </table>
    </div>

    <h3 class="wingfoil-price-subtitle">Аренда винга (винг & доска)</h3>
    <div class="wingfoil-table-wrap">
      <table class="wingfoil-price-table">
        <thead><tr><th>Время аренды</th><th>Цена ($)</th></tr></thead>
        <tbody><tr><td>1 час — Винг & SUP*</td><td>25</td></tr><tr><td>1 час — Винг & Фойл & Шлем*</td><td>45</td></tr></tbody>
      </table>
    </div>
    <div class="wingfoil-price-notes">
      <p>*лодка +$10</p>
      <p>*Страховка — разовый, необязательный и невозвратный платёж. Она покрывает возможный ремонт, но не полную потерю. Не покрывает ущерб при столкновении по вине арендатора и утрату оборудования — будьте аккуратны у берега и рифов!</p>
      <p>«Семейная аренда» — когда один комплект используют несколько гостей — стоит на 40% дороже.</p>
    </div>
  </div>
</section>

<section class="wingfoil-price-section wingfoil-price-section--soft" id="parts">
  <div class="wingfoil-price-inner">
    <header class="wingfoil-price-heading">
      <p class="eyebrow">Wingfoil · отдельные части</p>
      <h2>Аренда только винга или только доски</h2>
      <p>Скидки клуба Vetratoria не распространяются на аренду отдельных частей комплекта wingfoil.</p>
    </header>

    <h3 class="wingfoil-price-subtitle">Аренда винга (только винг)</h3>
    <div class="wingfoil-table-wrap">
      <table class="wingfoil-price-table">
        <thead><tr><th>Время аренды</th><th>Обычный</th><th>Aluula</th></tr></thead>
        <tbody>
          <tr class="table-section"><td colspan="3">Почасовая ставка (USD)</td></tr>
          <tr><td>1 час</td><td>25</td><td>30</td></tr>
          <tr><td>2 часа</td><td>40</td><td>45</td></tr>
          <tr><td>3 часа</td><td>55</td><td>60</td></tr>
          <tr class="table-section"><td colspan="3">Сутки (USD)</td></tr>
          <tr><td>1 день</td><td>65</td><td>75</td></tr>
          <tr><td>2 дня</td><td>120</td><td>130</td></tr>
          <tr><td>3 дня</td><td>150</td><td>160</td></tr>
          <tr><td>4 дня</td><td>175</td><td>185</td></tr>
          <tr><td>5 дней</td><td>200</td><td>220</td></tr>
          <tr><td>6 дней</td><td>220</td><td>240</td></tr>
          <tr><td>7 дней</td><td>240</td><td>250</td></tr>
          <tr><td>Доп. день</td><td>30</td><td>40</td></tr>
        </tbody>
      </table>
    </div>

    <h3 class="wingfoil-price-subtitle">Аренда доски (только доска)</h3>
    <div class="wingfoil-table-wrap">
      <table class="wingfoil-price-table">
        <thead><tr><th>Время аренды</th><th>Обычная</th><th>КАРБОН</th></tr></thead>
        <tbody>
          <tr class="table-section"><td colspan="3">Почасовая ставка (USD)</td></tr>
          <tr><td>1 час</td><td>25</td><td>30</td></tr>
          <tr><td>2 часа</td><td>40</td><td>45</td></tr>
          <tr><td>3 часа</td><td>55</td><td>60</td></tr>
          <tr class="table-section"><td colspan="3">Сутки (USD)</td></tr>
          <tr><td>1 день</td><td>65</td><td>80</td></tr>
          <tr><td>2 дня</td><td>120</td><td>135</td></tr>
          <tr><td>3 дня</td><td>150</td><td>165</td></tr>
          <tr><td>4 дня</td><td>175</td><td>190</td></tr>
          <tr><td>5 дней</td><td>200</td><td>225</td></tr>
          <tr><td>6 дней</td><td>220</td><td>240</td></tr>
          <tr><td>7 дней</td><td>240</td><td>260</td></tr>
          <tr><td>Доп. день</td><td>30</td><td>45</td></tr>
        </tbody>
      </table>
    </div>
    <div class="wingfoil-price-notes">
      <p>Время аренды доски заканчивается только после снятия фойла! Если фойл остаётся на доске, аренда считается как полный день даже без катания. Пожалуйста, будьте внимательны!</p>
      <p>Скидки клуба Vetratoria не распространяются на аренду отдельных частей комплекта wingfoil. Скидки на аренду отдельных частей действуют только если оборудование было куплено в клубе.</p>
      <p>Цена и условия страховки на аренду отдельных частей соответствуют общему прайс-листу и правилам страховки.</p>
    </div>
  </div>
</section>

<section class="wingfoil-price-section" id="packages">
  <div class="wingfoil-price-inner">
    <header class="wingfoil-price-heading">
      <p class="eyebrow">Wingfoil · пакеты</p>
      <h2>Обучающие и интенсив-пакеты</h2>
      <p>Пакеты рассчитаны на одного человека. Мини-группы не предусмотрены. Дополнительные скидки не действуют — пакеты уже уценены.</p>
    </header>

    <h3 class="wingfoil-price-subtitle">Обучающие пакеты — только уроки</h3>
    <div class="wingfoil-table-wrap">
      <table class="wingfoil-price-table">
        <thead><tr><th>Длительность</th><th>Цена пакета ($)</th><th>Что включено</th></tr></thead>
        <tbody>
          <tr><td>3 дня</td><td>270 (экономия ~ $30)</td><td>3 ч с инструктором • Урок за лодкой на фойле (45 мин) • Оборудование • Страховка</td></tr>
          <tr><td>4 дня</td><td>360 (экономия ~ $40)</td><td>4 ч с инструктором • Урок за лодкой на фойле (1 ч) • Оборудование • Страховка</td></tr>
          <tr><td>5 дней</td><td>420 (экономия ~ $50)</td><td>5 ч с инструктором • Урок за лодкой на фойле (1 ч) • Оборудование • Страховка</td></tr>
          <tr><td>6 дней</td><td>490 (экономия ~ $60)</td><td>6 ч с инструктором • Урок за лодкой на фойле (1 ч) • Оборудование • Страховка</td></tr>
          <tr><td>7 дней</td><td>540 (экономия ~ $80)</td><td>7 ч с инструктором • Урок за лодкой на фойле (1 ч) • Оборудование • Страховка</td></tr>
        </tbody>
      </table>
    </div>
    <div class="wingfoil-price-notes"><p>Каждый пакет рассчитан на ОДНОГО человека. Мини-группы не предусмотрены. Дополнительные скидки не действуют — пакеты уже уценены.</p></div>

    <h3 class="wingfoil-price-subtitle">Интенсив-пакеты — уроки + прокат на весь день</h3>
    <div class="wingfoil-table-wrap">
      <table class="wingfoil-price-table">
        <thead><tr><th>Длительность</th><th>Цена пакета ($)</th><th>Что включено</th></tr></thead>
        <tbody>
          <tr><td>3 дня</td><td>350 (экономия ~ $205)</td><td>3 ч с инструктором • Урок за лодкой на фойле (45 мин) • Прокат на весь день • Страховка</td></tr>
          <tr><td>4 дня</td><td>460 (экономия ~ $235)</td><td>4 ч с инструктором • Урок за лодкой на фойле (1 ч) • Прокат на весь день • Страховка</td></tr>
          <tr><td>5 дней</td><td>570 (экономия ~ $235)</td><td>5 ч с инструктором • Урок за лодкой на фойле (1 ч) • Прокат на весь день • Страховка</td></tr>
          <tr><td>6 дней</td><td>670 (экономия ~ $235)</td><td>6 ч с инструктором • Урок за лодкой на фойле (1 ч) • Прокат на весь день • Страховка</td></tr>
          <tr><td>7 дней</td><td>780 (экономия ~ $240)</td><td>7 ч с инструктором • Урок за лодкой на фойле (1 ч) • Прокат на весь день • Страховка</td></tr>
        </tbody>
      </table>
    </div>
    <div class="wingfoil-price-notes"><p>Каждый пакет рассчитан на ОДНОГО человека. Мини-группы не предусмотрены. Дополнительные скидки не действуют — пакеты уже уценены.</p></div>
  </div>
</section>

<section class="wingfoil-price-section wingfoil-price-section--dark" id="application">
  <div class="wingfoil-price-inner">
    <div class="wingfoil-price-contact">
      <figure><img src="/assets/img/final/wingfoil/lesson-coaching.webp" alt="Wingfoil Vetratoria Dahab" width="1600" height="1067" loading="lazy" decoding="async"></figure>
      <div>
        <p class="eyebrow">Заявка</p>
        <h2>Подобрать Wingfoil</h2>
        <p>Напишите даты, уровень, вес и задачу: первый раз, фойл за лодкой, прокат, пакет или хранение.</p>
        <div class="wingfoil-price-contact__actions">
          ${contactCta(page, "Оставить заявку", "button button-primary", "wingfoil")}
          <a class="button button-ghost" href="/dahab/wingfoil/">О Wingfoil</a>
        </div>
      </div>
    </div>
  </div>
</section>`.replace(/^[\t ]+$/gm, "");

const dahabWindsurfPricePage = (page) => `
<section class="dahab-hero dahab-hero--price">
  <img class="dahab-hero__image" src="/assets/img/final/windsurf/hero.webp" alt="Цены Windsurf в Дахабе" width="1600" height="1067" fetchpriority="high">
  <div class="dahab-hero__shade"></div>
  <div class="dahab-hero__content">
    <p class="eyebrow">Египет · Дахаб · Windsurf</p>
    <h1>Цены Windsurf в Дахабе</h1>
    <p>Полный прайс: обучение виндсерфингу, курсы 1–7 дней, индивидуальные занятия, прокат оборудования, страховка, скидки, аренда гидрофойла и хранение windsurf-оборудования.</p>
    <div class="hero-actions dahab-hero-actions">
      <a class="button button-primary" href="#courses">Курсы</a>
      <a class="button button-primary" href="#lessons">Уроки</a>
      <a class="button button-primary" href="#rental">Прокат</a>
      <a class="button button-primary" href="#discounts">Скидки</a>
      <a class="button button-ghost" href="#application">Подобрать курс</a>
    </div>
  </div>
</section>

<section class="windsurf-price-section" id="courses">
  <div class="windsurf-price-inner">
    <header class="windsurf-price-heading">
      <p class="eyebrow">Windsurf · обучение</p>
      <h2>Обучение виндсерфингу</h2>
      <p>Друзья! Бронируйте курсы и прокат оборудования заранее, для бронирования пишите нам на почту dahab@vetratoria.ru или +201029321772 Telegram, WhatsApp.</p>
    </header>
    <p class="windsurf-price-copy"><strong>Групповые/индивидуальные курсы обучения = прокат матчасти + инструктор.</strong></p>
    <h3 class="windsurf-price-subtitle">Групповые и индивидуальные курсы обучения</h3>
    <div class="windsurf-table-wrap">
      <table class="windsurf-price-table windsurf-price-table--wide">
        <thead>
          <tr><th>Учебный курс</th><th>Индивидуально<br>(час. / в день)</th><th>В группе<br>(час. / в день)</th><th>Катание без инструктора</th><th>Страховка оборудования</th><th>Цена, $<br>Начальный курс*</th><th>Цена, $<br>Фрирайд курс</th><th>Специальное предложение после окончания курса</th></tr>
        </thead>
        <tbody>
          <tr><td>1 день</td><td>1,5 часа</td><td>2 часа</td><td>Включено</td><td>Включена</td><td>95</td><td>165</td><td>10% скидка на прокат</td></tr>
          <tr><td>2 дня</td><td>1,5 часа</td><td>2 часа</td><td>Включено</td><td>Включена</td><td>190</td><td>320</td><td>10% скидка на прокат</td></tr>
          <tr><td>3 дня</td><td>1,5 часа</td><td>2 часа</td><td>Включено</td><td>Включена</td><td>285</td><td>430</td><td>15% скидка на прокат</td></tr>
          <tr><td>4 дня</td><td>1,5 часа</td><td>2 часа</td><td>Включено</td><td>Включена</td><td>365</td><td>530</td><td>15% скидка на прокат</td></tr>
          <tr><td>5 дней</td><td>1,5 часа</td><td>2 часа</td><td>Включено</td><td>Включена</td><td>445</td><td>625</td><td>20% скидка на прокат</td></tr>
          <tr><td>6 дней</td><td>1,5 часа</td><td>2 часа</td><td>Включено</td><td>Включена</td><td>515</td><td>715</td><td>20% скидка на прокат</td></tr>
          <tr><td>7 дней</td><td>1,5 часа</td><td>2 часа</td><td>Включено</td><td>Включена</td><td>580</td><td>790</td><td>25% скидка на прокат</td></tr>
        </tbody>
      </table>
    </div>
    <div class="windsurf-price-notes">
      <p>*При желании в начальном курсе возможна смена учебного паруса на фрирайд парус, смена категории паруса +10$ день.</p>
      <p>Учебные групповые курсы проводятся в группах по 2-4 человека в группе. Начальный курс включает прокат начального (учебного) снаряжения (доски EasyRide; паруса EasyRide, KidJoy), изучаются базовые навыки, развороты, пляжный старт, хождение в лавировку.</p>
      <p>Фрирайд курс включает прокат продвинутого либо фрирайд снаряжения (швертовые либо фрирайд доски, пленочные фрирайд паруса), прокат трапеции; изучается трапеция, глиссирование, ножные петли, водный старт, light wind фристайл. При смене учебного курса предоставляется скидка 15% на обучение.</p>
    </div>
  </div>
</section>

<section class="windsurf-price-section windsurf-price-section--soft" id="lessons">
  <div class="windsurf-price-inner">
    <header class="windsurf-price-heading">
      <p class="eyebrow">Windsurf · индивидуально</p>
      <h2>Индивидуальные занятия</h2>
      <p>1 час = 60 минут.</p>
    </header>
    <div class="windsurf-table-wrap">
      <table class="windsurf-price-table">
        <thead><tr><th>Длительность</th><th>Цена</th></tr></thead>
        <tbody>
          <tr><td>1 час</td><td>70 $</td></tr>
          <tr><td>2 часа</td><td>130 $</td></tr>
          <tr><td>3 часа</td><td>190 $</td></tr>
          <tr><td>4 часа и более</td><td>60 $ час</td></tr>
          <tr><td>Детское (до 10 лет) индивидуальное занятие с инструктором</td><td>55 $ за час</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</section>

<section class="windsurf-price-section" id="rental">
  <div class="windsurf-price-inner">
    <header class="windsurf-price-heading">
      <p class="eyebrow">Windsurf · прокат</p>
      <h2>Прокат оборудования для виндсерфинга</h2>
      <p>Бронируйте курсы и прокат оборудования заранее, для бронирования пишите нам на почту dahab@vetratoria.ru - +201029321772 (Telegram, WhatsApp.)</p>
    </header>
    <p class="windsurf-price-copy"><strong>Прокат одного комплекта матчасти для виндсерфинга</strong></p>
    <div class="windsurf-table-wrap">
      <table class="windsurf-price-table windsurf-price-table--wide">
        <thead>
          <tr><th rowspan="2">Время аренды</th><th colspan="2">Начальный: швертовая доска + учебный парус</th><th colspan="2">Продвинутый: швертовая доска + фрирайд парус</th><th colspan="2">Фрирайд: фрирайд доска + фрирайд парус</th><th colspan="2">Slalom, Freestyle, Wave, H-foil</th></tr>
          <tr><th>Прокат ($)</th><th>Страховка ($)*</th><th>Прокат ($)</th><th>Страховка* ($)</th><th>Прокат ($)</th><th>Страховка** ($)</th><th>Прокат ($)</th><th>Страховка** ($)</th></tr>
        </thead>
        <tbody>
          <tr><td>1 час</td><td>25</td><td>5</td><td>35</td><td>10</td><td>45</td><td>15</td><td>50</td><td>25</td></tr>
          <tr><td>3 часа</td><td>35</td><td>5</td><td>60</td><td>20</td><td>75</td><td>20</td><td>90</td><td>30</td></tr>
          <tr><td>1 день</td><td>65</td><td>15</td><td>85</td><td>25</td><td>110</td><td>25</td><td>125</td><td>40</td></tr>
          <tr><td>2 дня</td><td>105</td><td>15</td><td>155</td><td>30</td><td>200</td><td>35</td><td>215</td><td>50</td></tr>
          <tr><td>3 дня</td><td>140</td><td>20</td><td>200</td><td>30</td><td>270</td><td>40</td><td>290</td><td>60</td></tr>
          <tr><td>4 дня</td><td>175</td><td>25</td><td>235</td><td>40</td><td>300</td><td>40</td><td>335</td><td>65</td></tr>
          <tr><td>5 дней</td><td>200</td><td>30</td><td>270</td><td>40</td><td>345</td><td>45</td><td>375</td><td>70</td></tr>
          <tr><td>6 дней</td><td>225</td><td>35</td><td>295</td><td>45</td><td>380</td><td>50</td><td>405</td><td>75</td></tr>
          <tr><td>7 дней</td><td>245</td><td>35</td><td>325</td><td>50</td><td>410</td><td>60</td><td>430</td><td>80</td></tr>
          <tr><td>8 дней</td><td>265</td><td>45</td><td>345</td><td>55</td><td>435</td><td>60</td><td>460</td><td>80</td></tr>
          <tr><td>9 дней</td><td>290</td><td>50</td><td>375</td><td>60</td><td>465</td><td>65</td><td>495</td><td>90</td></tr>
          <tr><td>10 дней</td><td>310</td><td>55</td><td>395</td><td>60</td><td>485</td><td>65</td><td>520</td><td>90</td></tr>
          <tr><td>11 дней</td><td>330</td><td>60</td><td>420</td><td>65</td><td>510</td><td>70</td><td>545</td><td>95</td></tr>
          <tr><td>12 дней</td><td>360</td><td>60</td><td>455</td><td>65</td><td>545</td><td>70</td><td>575</td><td>100</td></tr>
          <tr><td>13 дней</td><td>375</td><td>65</td><td>485</td><td>70</td><td>580</td><td>75</td><td>600</td><td>110</td></tr>
          <tr><td>14 дней</td><td>395</td><td>65</td><td>505</td><td>70</td><td>595</td><td>75</td><td>630</td><td>120</td></tr>
          <tr><td>доп. день</td><td>27</td><td>5</td><td>33</td><td>6</td><td>39</td><td>7</td><td>44</td><td>9</td></tr>
          <tr><td>смена категории \\ день</td><td>11</td><td></td><td>22</td><td></td><td>33</td><td></td><td></td><td></td></tr>
        </tbody>
      </table>
    </div>

    <h3 class="windsurf-price-subtitle">Дополнительно доступно для аренды</h3>
    <div class="windsurf-price-mini-grid">
      <div class="windsurf-table-wrap">
        <table class="windsurf-price-table">
          <thead><tr><th>Прокат</th><th>Гидрокостюм</th><th>Трапеция</th><th>Карбоновый гик</th></tr></thead>
          <tbody><tr><td>1 день</td><td>5$</td><td>5$</td><td>10$</td></tr><tr><td>1 неделя</td><td>25$</td><td>25$</td><td>50$</td></tr></tbody>
        </table>
      </div>
      <div class="windsurf-table-wrap">
        <table class="windsurf-price-table">
          <thead><tr><th>Прокат</th><th>MEGA SUP</th><th>SUP</th><th>FOIL</th></tr></thead>
          <tbody><tr><td>1 час</td><td>35$</td><td>10$</td><td>30$</td></tr><tr><td>1 день</td><td>80$</td><td>25$</td><td>75$</td></tr></tbody>
        </table>
      </div>
    </div>
    <div class="windsurf-price-notes">
      <p>*Страховка – одноразовый добровольный и невозвращаемый взнос. Страховка покрывает возможные расходы по ремонту оборудования, но не покрывает полную его утерю. Страховка не распространяется на поломку оборудования при столкновении по вине арендатора, на поломку или утерю плавника – будьте осторожны у берега и рядом с рифами! Продление страховки после первого страхового случая 20$.</p>
      <p>Семейный прокат – использование одного комплекта несколькими гостями +30%. Стоимость проката верхушки или доски – 50% от стоимости комплекта. Доступна бронь доски при оплате проката авансом.</p>
    </div>
  </div>
</section>

<section class="windsurf-price-section windsurf-price-section--soft" id="discounts">
  <div class="windsurf-price-inner">
    <header class="windsurf-price-heading">
      <p class="eyebrow">Windsurf · скидки</p>
      <h2>Скидки Vetratoria</h2>
    </header>
    <div class="windsurf-price-notes">
      <p><strong>Скидки по возрасту (при предъявлении подтверждающего документа):</strong></p>
      <ul><li>Дети (до 12 лет) - 30%</li><li>Школьники (старше 12 лет) - 20%</li><li>Тем, кому есть 55 лет - скидка 30%</li></ul>
      <p><strong>Семейные скидки:</strong></p>
      <ul><li>Для двоих катающихся родителей - один ребенок до 16 лет катается бесплатно.</li></ul>
      <p><strong>Персональные скидки постоянным клиентам ВЕТРАТОРИИ:</strong></p>
      <ul><li>2-й приезд - 10%</li><li>3-й приезд - 20%</li><li>4-й приезд - 30%</li><li>ДЕНЬ РОЖДЕНИЯ - в день рождения прокат бесплатный для именинника.</li></ul>
      <p>Примечания. Все вышеперечисленные скидки не суммируются. Действует максимальная скидка, полагающаяся гостю станции на момент его приезда.</p>
    </div>
  </div>
</section>

<section class="windsurf-price-section" id="storage">
  <div class="windsurf-price-inner">
    <header class="windsurf-price-heading">
      <p class="eyebrow">Windsurf · хранение</p>
      <h2>Гидрофойл и хранение оборудования</h2>
      <p>Этот блок относится к windsurf-разделу и не вынесен отдельно.</p>
    </header>
    <p class="windsurf-price-copy">Аренда гидрофойла для виндсерфинга — 30$ / час.</p>
    <div class="windsurf-table-wrap">
      <table class="windsurf-price-table">
        <thead><tr><th>Хранение оборудования</th><th>Цена, $</th></tr></thead>
        <tbody>
          <tr><td>1 день</td><td>6</td></tr>
          <tr><td>3 дня</td><td>15</td></tr>
          <tr><td>4 дня</td><td>20</td></tr>
          <tr><td>1 неделя</td><td>30</td></tr>
          <tr><td>10 дней</td><td>40</td></tr>
          <tr><td>2 недели</td><td>50</td></tr>
          <tr><td>1 месяц</td><td>90</td></tr>
          <tr><td>2 месяца</td><td>155</td></tr>
          <tr><td>доп. месяц</td><td>60</td></tr>
          <tr><td>Годовое хранение</td><td>700</td></tr>
        </tbody>
      </table>
    </div>
    <div class="windsurf-price-notes"><p>Примечание: после отъезда владельца матчасть должна храниться в подписанных чехлах. Лимит на 1 комплект - 2 доски и 4 паруса.</p></div>
  </div>
</section>

<section class="windsurf-price-section windsurf-price-section--dark" id="application">
  <div class="windsurf-price-inner">
    <div class="windsurf-price-contact">
      <figure><img src="/assets/img/final/windsurf/lesson-water.webp" alt="Windsurf Vetratoria Dahab" width="1600" height="1067" loading="lazy" decoding="async"></figure>
      <div>
        <p class="eyebrow">Заявка</p>
        <h2>Подобрать Windsurf</h2>
        <p>Напишите даты, уровень, возраст, интересующий курс и нужен ли прокат или хранение.</p>
        <div class="windsurf-price-contact__actions">
          ${contactCta(page, "Оставить заявку", "button button-primary", "windsurf")}
          <a class="button button-ghost" href="/dahab/windsurf/">О Windsurf</a>
        </div>
      </div>
    </div>
  </div>
</section>`.replace(/^[\t ]+$/gm, "");

const pricePage = (page) => {
  if (page.country === "dahab" && page.sport === "wingfoil") return dahabWingfoilPricePage(page);
  if (page.country === "dahab" && page.sport === "windsurf") return dahabWindsurfPricePage(page);

  const country = countriesByKey[page.country];
  const sport = page.sport ? site.sports[page.sport] : null;
  const title = sport ? sport.title : "Vetratoria";
  return `${hero(page, `${contactCta(page, "Уточнить цену")}<a class="button button-ghost" href="/${country.key}/">К направлению</a>`)}
  <section class="content-section">
    <div class="section-inner">
      ${sectionHeading("Прайс", "Форматы и стоимость", "Цены зависят от ветра, сезона, инструктора, комплекта и длительности программы. Финальную доступность лучше подтвердить перед поездкой.")}
      <div class="price-table">
        ${priceRows(title).map((row) => `<article><b>${row[0]}</b><span>${row[1]}</span><span>${row[2]}</span><em>${row[3]}</em></article>`).join("")}
      </div>
    </div>
  </section>`;
};

const blogIndex = (page) => `
${hero(page, contactCta(page, "Задать вопрос"))}
<section class="content-section">
  <div class="section-inner">
    ${sectionHeading(page.eyebrow, page.title, page.description)}
    <div class="article-grid">
      ${(page.articles || articles).map((article) => `
        <a class="article-card" href="${article.href}">
          ${cardImage(article.image, article.title)}
          <small>${countriesByKey[article.country].title} · ${site.sports[article.sport].nav}</small>
          <h3>${article.title}</h3>
          <p>${article.lead}</p>
        </a>`).join("")}
    </div>
  </div>
</section>`;

const articlePage = (page) => {
  const sport = site.sports[page.sport];
  const country = countriesByKey[page.country];
  return `${hero(page, `<a class="button button-primary" href="/${country.key}/${page.sport}/">Открыть спорт</a>${contactCta(page, "Написать нам", "button button-ghost")}`)}
  <article class="content-section article-body">
    <div class="article-inner">
      <p class="eyebrow">${country.region} · ${sport.nav}</p>
      <h2>Главное перед стартом</h2>
      <p>${page.description}</p>
      <p>Перед поездкой важно понять не только название спорта, но и реальный сценарий: где проходит занятие, какое снаряжение подходит, сколько времени заложить на первые шаги и что будет следующим уровнем после вводного урока.</p>
      <h2>Как строится занятие</h2>
      <p>Инструктор объясняет ветер и акваторию, подбирает комплект, ставит короткую техническую задачу и ведет ученика по воде. После занятия остается понятный план: повторить базу, перейти на курс, взять прокат или выбрать другой формат.</p>
      <div class="check-list check-list--inline">
        ${sport.bullets.map((item) => `<span>${item}</span>`).join("")}
      </div>
    </div>
  </article>`;
};

const mediaPage = (page) => {
  const images = [
    page.image,
    img("home-slider-1.webp"),
    img("home-slider-2.webp"),
    img("home-slider-3.webp"),
    img("home-slider-4.webp"),
    img("home-slider-5.webp"),
    img("home-slider-6.webp"),
    img("home-media.webp")
  ];
  return `${hero(page, contactCta(page, "Запросить поездку"))}
  <section class="content-section">
    <div class="section-inner">
      ${sectionHeading(page.eyebrow || "Медиа", page.title, page.description)}
      <div class="photo-strip">
        ${images.map((src, index) => `<figure class="${index % 3 === 0 ? "is-wide" : ""}">${cardImage(src, page.title)}<figcaption>${index + 1 < 10 ? `0${index + 1}` : index + 1}</figcaption></figure>`).join("")}
      </div>
    </div>
  </section>`;
};

const contactMethod = ({ href, icon, label, value, external = false }) => `
  <a class="contact-method" href="${href}"${external ? ` target="_blank" rel="noopener noreferrer"` : ""}>
    ${icon ? `<img src="${icon}" alt="" width="22" height="22">` : ""}
    <span><small>${escapeHtml(label)}</small><b>${escapeHtml(value)}</b></span>
  </a>`;

const countryContactCard = (country, showPageLink = true) => {
  const contact = site.contacts[country.key];
  const phoneLabel = country.key === "vietnam" ? "Telegram" : "Телефон";
  return `
    <article class="contact-country-card">
      <p class="eyebrow">${escapeHtml(country.region)}</p>
      <h2>${escapeHtml(country.city)}</h2>
      <div class="contact-country-card__methods">
        ${contactMethod({ href: `mailto:${contact.email}`, label: "Email", value: contact.email })}
        ${contactMethod({
          href: country.key === "vietnam" ? contact.telegram : `tel:${contact.phone}`,
          icon: country.key === "vietnam" ? "/assets/icons/telegram.svg" : "",
          label: phoneLabel,
          value: contact.phoneLabel,
          external: country.key === "vietnam"
        })}
      </div>
      ${showPageLink ? `<a class="contact-country-card__link" href="/${country.key}/contacts/">Контакты направления →</a>` : ""}
    </article>`;
};

const dahabStationCard = (station) => `
  <article class="contact-station-card" id="${station.key}">
    <p class="eyebrow">${escapeHtml(station.eyebrow)}</p>
    <h2>${escapeHtml(station.title)}</h2>
    <p>${escapeHtml(station.description)}</p>
    <div class="contact-station-card__methods">
      ${contactMethod({ href: `mailto:${station.email}`, label: "Email", value: station.email })}
      ${contactMethod({
        href: `https://wa.me/${station.phone.replace(/\D/g, "")}`,
        icon: "/assets/icons/whatsapp.svg",
        label: "WhatsApp",
        value: station.phoneLabel,
        external: true
      })}
      ${contactMethod({
        href: station.telegram,
        icon: "/assets/icons/telegram.svg",
        label: "Telegram · чат станции",
        value: station.key === "wingfoil" ? "Wing Center Dahab" : "Vetratoria Windsurf",
        external: true
      })}
    </div>
  </article>`;

const contactForm = (page) => {
  const isGeneral = !page.country;
  const contact = contactForPage(page);
  return `
    <form class="contact-form" data-contact-form data-endpoint="${escapeHtml(site.contactEndpoint || "")}" data-mail-to="${isGeneral ? "" : contact.formEmail}" data-direction="${isGeneral ? "" : contact.title}">
      <input type="hidden" name="source" value="${escapeHtml(page.path)}">
      <input type="hidden" name="intent" value="Форма страницы контактов">
      <label>Имя<input name="name" autocomplete="name" placeholder="Ваше имя" required></label>
      <label>Способ связи<input name="contact" autocomplete="email" placeholder="Телефон, email или @username" required></label>
      ${isGeneral ? `
      <label>Страна
        <select name="country" data-contact-country-select required>
          ${countryList.map(contactCountryOption).join("")}
        </select>
      </label>` : ""}
      <label><span>Комментарий <small>по желанию</small></span><textarea name="message" rows="5" placeholder="Даты, уровень, спорт или ваш вопрос"></textarea></label>
      <button class="button button-primary" type="submit">${site.contactEndpoint ? "Отправить заявку" : "Подготовить заявку"}</button>
      <p class="form-note" data-form-note aria-live="polite"></p>
    </form>`;
};

const contactsPage = (page) => {
  const isGeneral = !page.country;
  const isDahab = page.country === "dahab";
  const contact = contactForPage(page);
  const heroActions = isDahab
    ? `<a class="button button-primary" href="#windsurf">Windsurf</a><a class="button button-ghost" href="#wingfoil">Wingfoil</a>`
    : `<a class="button button-primary" href="#contact-form">Написать нам</a><a class="button button-ghost" href="mailto:${contact.email}">Email</a>`;
  const directory = isGeneral
    ? countryList.map(countryContactCard).join("")
    : isDahab
      ? site.dahabStations.map(dahabStationCard).join("")
      : countryContactCard(countriesByKey[page.country], false);

  return `
${hero(page, heroActions)}
<section class="content-section contacts-directory-section">
  <div class="section-inner">
    ${sectionHeading(
      isGeneral ? "Три направления" : "Прямая связь",
      isGeneral ? "Выберите нужную страну" : isDahab ? "Контакты станций в Дахабе" : `Команда: ${countriesByKey[page.country].city}`,
      isGeneral
        ? "Пишите напрямую команде направления или оставьте общую заявку ниже."
        : isDahab
          ? "Для windsurf и wingfoil работают отдельные контакты. Выберите нужную станцию."
          : "Свяжитесь напрямую или заполните короткую форму ниже."
    )}
    <div class="contacts-directory${isDahab ? " contacts-directory--stations" : ""}">
      ${directory}
    </div>
  </div>
</section>
<section class="content-section content-section--soft contact-social-section">
  <div class="section-inner contact-social">
    <div>
      <p class="eyebrow">Социальные сети</p>
      <h2>Vetratoria в сети</h2>
      <p>Новости станций, свежие фото и отзывы гостей.</p>
    </div>
    ${socialIconLinks("contact-social__links")}
  </div>
</section>
<section class="content-section" id="contact-form">
  <div class="section-inner contact-layout">
    <div>
      ${sectionHeading(
        "Заявка",
        isGeneral ? "Подберём направление" : "Напишите команде",
        isGeneral
          ? "Оставьте имя, удобный способ связи, выберите страну и при желании добавьте комментарий."
          : "Оставьте имя и удобный способ связи. Комментарий можно не заполнять."
      )}
      <p class="contact-form-hint">После нажатия откроется ваше почтовое приложение с уже подготовленной заявкой.</p>
    </div>
    ${contactForm(page)}
  </div>
</section>`;
};

const featurePage = (page) => {
  const country = page.country ? countriesByKey[page.country] : countryList[0];
  const items = {
    route: [
      ["Прилет", "Уточните аэропорт и удобный маршрут до станции."],
      ["Трансфер", "Команда подскажет логистику, время в пути и контакт на месте."],
      ["Первый день", "Знакомство со станцией, ветром, зонами катания и форматом занятий."]
    ],
    safety: [
      ["Зоны", "Катание проходит в понятных зонах под уровень и спорт."],
      ["Инструктор", "На старте рядом человек, который контролирует задачу и условия."],
      ["Rescue", "Важные правила и помощь на воде обсуждаются до выхода."]
    ],
    stations: [
      ["Акватория", "Станция выбирается под ветер, спорт и уровень."],
      ["Хранение", "Снаряжение и доступ к инфраструктуре организованы на месте."],
      ["Команда", "Инструкторы и администраторы помогают каждый день."]
    ],
    team: [
      ["Инструкторы", "Обучение, техника, безопасность и прогресс."],
      ["Администраторы", "Расписание, связь, оплата и бытовые вопросы."],
      ["Менеджеры", "Подбор страны, программы и дат до поездки."]
    ]
  }[page.kind] || [
    ["Формат", "Подбор программы под задачу и уровень."],
    ["Снаряжение", "Комплект выбирается под ветер и человека."],
    ["Прогресс", "Следующий шаг понятен после первого занятия."]
  ];
  return `${hero(page, `${contactCta(page, "Написать нам")}<a class="button button-ghost" href="${country.href}">К направлению</a>`)}
  <section class="content-section">
    <div class="section-inner">
      ${sectionHeading(page.eyebrow, page.title, page.description)}
      <div class="link-grid">
        ${items.map(([title, lead], index) => `<article class="link-card"><small>0${index + 1}</small><h3>${title}</h3><p>${lead}</p></article>`).join("")}
      </div>
    </div>
  </section>`;
};

const render = (page) => {
  switch (page.kind) {
    case "home":
      return layout(page, home(page));
    case "country":
      return layout(page, countryPage(page));
    case "sport":
      return layout(page, sportPage(page));
    case "sport-price":
      return layout(page, pricePage(page));
    case "blog-index":
      return layout(page, blogIndex(page));
    case "article":
      return layout(page, articlePage(page));
    case "media-index":
    case "gallery":
    case "story":
      return layout(page, mediaPage(page));
    case "contacts":
      return layout(page, contactsPage(page));
    case "stations":
      return layout(page, page.country === "dahab" ? dahabStationsPage(page) : featurePage(page));
    case "safety":
      return layout(page, page.country === "dahab" ? dahabSafetyPage(page) : featurePage(page));
    case "route":
      return layout(page, page.country === "dahab" ? dahabHowToGetPage(page) : featurePage(page));
    default:
      return layout(page, featurePage(page));
  }
};

const obsoletePageDirs = ["dahab/price", "vietnam/price", "russia/price"];
for (const dir of obsoletePageDirs) {
  await rm(join(root, dir), { recursive: true, force: true });
}

const cleanGeneratedMarkup = (markup) => markup.replace(/[ \t]+$/gm, "");

for (const page of allPages) {
  const file = pathToFile(page.path);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, cleanGeneratedMarkup(render(page)), "utf8");
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map((page) => `  <url><loc>https://vetratoria.ru${page.path}</loc></url>`).join("\n")}
</urlset>
`;

await writeFile(join(root, "sitemap.xml"), sitemap, "utf8");
await writeFile(join(root, "robots.txt"), "User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n", "utf8");

console.log(`Built ${allPages.length} pages.`);
