Warning: truncated output (original token count: 56031)
Total output lines: 3387

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
  if (path === "/404.html") return join(root, "404.html");
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

const sportFaqBlock = (eyebrow, title, lead, faqs) => `
  <div class="dahab-sport-faq-layout">
    <header class="dahab-sport-faq-layout__intro">
      <p class="eyebrow">${escapeHtml(eyebrow)}</p>
      <h2>${escapeHtml(title)}</h2>
      ${lead ? `<p>${escapeHtml(lead)}</p>` : ""}
    </header>
    <div class="dahab-sport-faq" data-exclusive-accordion aria-label="${escapeHtml(title)}">
      ${faqs.map(([question, answer], index) => `<details class="dahab-sport-faq__item" ${index === 0 ? "open" : ""}>
        <summary aria-expanded="${index === 0 ? "true" : "false"}"><span class="dahab-sport-faq__number" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span><span>${escapeHtml(question)}</span></summary>
        <p>${escapeHtml(answer)}</p>
      </details>`).join("")}
    </div>
  </div>`;

const monthLabels = [
  ["jan", "ЯНВ"], ["feb", "ФЕВ"], ["mar", "МАР"], ["apr", "АПР"],
  ["may", "МАЙ"], ["jun", "ИЮН"], ["jul", "ИЮЛ"], ["aug", "АВГ"],
  ["sep", "СЕН"], ["oct", "ОКТ"], ["nov", "НОЯ"], ["dec", "ДЕК"]
];

const seasonMonths = (country) => `
    <div class="season-months" aria-label="Сезон: ${escapeHtml(country.seasonTitle)}">
      ${monthLabels.map(([key, label]) => {
        const inSeason = country.seasonMonths.includes(key);
        return `<span class="${inSeason ? "is-season" : ""}" data-month="${key}" aria-label="${label}: ${inSeason ? "основной сезон" : "вне основного сезона"}">${label}</span>`;
      }).join("")}
    </div>`;

const seasonCalendar = (country, { compact = false } = {}) => `
  <article class="season-card${compact ? " season-card--compact" : ""}" data-reveal>
    <header class="season-card__header">
      <div>
        <span>${escapeHtml(country.region)}</span>
        <h3>${escapeHtml(country.title)}</h3>
      </div>
      <strong>${escapeHtml(country.seasonTitle)}</strong>
    </header>
    ${seasonMonths(country)}
    <div class="season-card__wind">
      <span class="wind-indicator" aria-hidden="true"><i></i><i></i><i></i></span>
      <div><b>${escapeHtml(country.windLabel)}</b><p>${escapeHtml(country.windSummary)}</p></div>
    </div>
    ${compact ? "" : `<p class="season-card__note">${escapeHtml(country.seasonNote)}</p><a href="${country.href}">Открыть направление <span aria-hidden="true">→</span></a>`}
  </article>`;

const seasonSection = (countries, { compact = false, eyebrow = "Сезоны Vetratoria", title = "Куда ехать сейчас", lead = "Сравните подтверждённые сезоны направлений. Точный прогноз и доступность занятий команда проверит под ваши даты." } = {}) => `
  <section class="season-section${compact ? " season-section--compact" : ""}">
    <div class="section-inner">
      ${sectionHeading(eyebrow, title, lead)}
      <div class="season-grid${countries.length === 1 ? " season-grid--single" : ""}">
        ${countries.map((country) => seasonCalendar(country, { compact })).join("")}
      </div>
    </div>
  </section>`;

const sportFeatureGrid = (items, { atlas = false, leadImage, leadAlt = "" } = {}) => atlas ? `
    <div class="dahab-sport-location-atlas">
      <figure class="dahab-sport-location-atlas__lead">
        <img src="${leadImage}" alt="${escapeHtml(leadAlt)}" width="1920" height="1080" loading="lazy" decoding="async">
      </figure>
      <div class="dahab-sport-location-atlas__grid">
        ${items.map(([title, text, image, alt, width = 1080, height = 1080], index) => `
          <article>
            <img src="${image}" alt="${escapeHtml(alt)}" width="${width}" height="${height}" loading="lazy" decoding="async">
            <div>
              <span>0${index + 1}</span>
              <h3>${escapeHtml(title)}</h3>
              <p>${escapeHtml(text)}</p>
            </div>
          </article>`).join("")}
      </div>
    </div>` : `
    <div class="dahab-sport-feature-grid dahab-sport-feature-grid--media">
      ${items.map(([title, text, image, alt, width = 1080, height = 1080], index) => `
        <article>
          <img src="${image}" alt="${escapeHtml(alt)}" width="${width}" height="${height}" loading="lazy" decoding="async">
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

const dahabStationPhones = (className) => site.dahabStations.map((station) => `
          <a class="${className}" href="tel:${station.phone}">
            <span>Номер ${station.key === "windsurf" ? "Windsurf" : "Wingfoil"}-станции</span>
            <b>${station.phoneLabel}</b>
          </a>`).join("");

const navButton = (label, className = "vtr-nav__link") =>
  `<button class="${className}" type="button" aria-expanded="false" data-dropdown-toggle>${label} ${arrow}</button>`;

const directionsMenu = () => `
      <div class="vtr-nav__item vtr-nav__item--drop vtr-nav__item--directions" data-dropdown>
        ${navButton("Направления")}
        <div class="vtr-nav__dropdown vtr-nav__dropdown--directions">
          ${countryList.map((country) => `
          <div class="vtr-nav__direction">
            <a class="vtr-nav__direction-link" href="${country.href}"><b>${country.nav} · ${country.city}</b><span>${countrySportSummary(country)}</span></a>
            ${country.key === "dahab" ? `<div class="vtr-nav__direction-phones">${dahabStationPhones("vtr-nav__direction-phone")}</div>` : ""}
          </div>`).join("")}
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
  const schoolPaths = schoolItems
    .map((item) => item.href)
    .filter((href) => href.startsWith(`/${country.key}/`) || href.startsWith(`/media/${country.key}/`));
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
        ${page.path === "/" ? socialIconLinks("vtr-mobile-menu__socials") : `<section class="vtr-mobile-menu__block" aria-label="Контакты">
          <p class="vtr-mobile-menu__title">Контакты</p>
          <a class="vtr-mobile-menu__row" href="mailto:${contactForPage(page).email}">${contactForPage(page).email}</a>
          ${contactForPage(page) === site.contacts.dahab
            ? dahabStationPhones("vtr-mobile-menu__row vtr-mobile-menu__contact-phone")
            : `<a class="vtr-mobile-menu__row" href="tel:${contactForPage(page).phone}">${contactForPage(page).phoneLabel}</a>`}
          <a class="vtr-mobile-menu__row" href="${contactForPage(page).telegram}" target="_blank" rel="noopener noreferrer">Telegram</a>
          ${socialIconLinks("vtr-mobile-menu__socials")}
        </section>`}
      </div>`;

const mainNavPanel = (page, country) => `
    <nav class="vtr-nav__panel" id="site-navigation" aria-label="Основная навигация" data-nav-panel aria-hidden="false">
      <a class="vtr-nav__link" href="/">Vetratoria</a>
      ${directionsMenu()}
      <a class="vtr-nav__link" href="/blog/">Блог</a>
      <a class="vtr-nav__link" href="/media/">Медиа</a>
      <a class="vtr-nav__link${page.kind === "contacts" ? " is-active" : ""}" href="${country ? `/${country.key}/contacts/` : "/contacts/"}">Контакты</a>
      ${mobileMenu(page, country)}
    </nav>`;

const topNav = (page) => {
  const contact = contactForPage(page);
  const isHome = page.path === "/";
  const topNavContacts = isHome
    ? `<span class="vtr-nav__brand-line">Vetratoria — школы ветра с 2006 года</span>`
    : `<a href="mailto:${contact.email}">${contact.email}</a>
      ${contact === site.contacts.dahab
        ? dahabStationPhones("vtr-nav__station-phone")
        : `<a href="tel:${contact.phone}">${contact.phoneLabel}</a>`}`;
  return `
  <div class="vtr-nav__top">
    <div class="vtr-nav__contacts">
      ${topNavContacts}
    </div>
    <nav class="vtr-nav__countries" aria-label="Выбор страны">
      ${countryList.map((country) => `<a class="vtr-nav__country${page.country === country.key ? " is-active" : ""}" href="${country.href}">${country.nav}</a>`).join("")}
    </nav>
    <div class="vtr-nav__right">
      ${socialIconLinks("vtr-nav__socials")}
      <span class="vtr-nav__lang-current" aria-label="Язык сайта: русский">RU</span>
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
  { label: "Медиа", href: "/media/dahab/" },
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
  const schoolPaths = schoolItems
    .map((item) => item.href)
    .filter((href) => href.startsWith(`/${country.key}/`) || href.startsWith(`/media/${country.key}/`));
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
    <button class="vtr-nav__burger" type="button" aria-label="Открыть меню" aria-controls="site-navigation" aria-expanded="false" data-menu-toggle>
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

const metaDescriptionForPage = (page) => {
  if (page.path === "/dahab/") {
    return "Vetratoria Dahab: Wingfoil, Windsurf, Kids, аренда, уроки, станции Wing Center, Swiss Inn и Ganet Sinai.";
  }

  const description = page.description || site.description;

  if (page.kind === "media-album") {
    return `${description} Альбом «${page.title}».`;
  }

  if (page.country && ["sport", "sport-price", "team"].includes(page.kind)) {
    const country = countriesByKey[page.country];
    return `${description} Направление: ${country.region} · ${country.city}.`;
  }

  return description;
};

const metaImageForPage = (page) =>
  page.path === "/dahab/" ? "/assets/img/dahab-ref/ganet-sinai.webp" : page.image || site.slider[0];

const absoluteUrl = (path) => new URL(path, site.baseUrl).href;

const canonicalForPage = (page) => absoluteUrl(page.path);

const pagesBy…44031 tokens truncated…ткрыть фотографию ${index + 1} из ${photoCount}">
          <img src="${src}" alt="${escapeHtml(alt)}" loading="${index < 4 ? "eager" : "lazy"}" decoding="async">
        </button>
        <footer>
          <span>${String(index + 1).padStart(2, "0")}</span>
          <a href="${src}" download>Скачать</a>
        </footer>
      </article>`;
      }).join("")}
    </div>
  </div>
</section>
<dialog class="media-lightbox" data-media-lightbox aria-label="Просмотр фотографий">
  <div class="media-lightbox__surface">
    <header>
      <span data-media-lightbox-count></span>
      <div>
        <a href="${album.photos[0]}" download data-media-lightbox-download>Скачать</a>
        <button type="button" data-media-lightbox-close aria-label="Закрыть">×</button>
      </div>
    </header>
    <div class="media-lightbox__stage">
      <button type="button" data-media-lightbox-prev aria-label="Предыдущая фотография">‹</button>
      <figure>
        <img src="${album.photos[0]}" alt="${escapeHtml(`${album.title} — фотография 1`)}" data-media-lightbox-image>
      </figure>
      <button type="button" data-media-lightbox-next aria-label="Следующая фотография">›</button>
    </div>
  </div>
</dialog>`;
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
          ? ""
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
          : isDahab ? "" : "Оставьте имя и удобный способ связи. Комментарий можно не заполнять."
      )}
      ${isDahab ? "" : `<p class="contact-form-hint">После нажатия откроется ваше почтовое приложение с уже подготовленной заявкой.</p>`}
    </div>
    ${contactForm(page)}
  </div>
</section>`;
};

const dahabTeamGroups = [
  {
    id: "team-wingfoil",
    eyebrow: "Центр Wingfoil",
    title: "Команда вингфойла",
    lead: "Помогаем пройти путь от первого знакомства с крылом до уверенного полёта на фойле.",
    members: [
      {
        name: "Анатолий",
        role: "Менеджер · старший инструктор",
        text: "Более 25 лет в водных видах спорта. Подберёт комплект RRD под ваши навыки, ветер и задачу занятия.",
        meta: "Русский · English · Deutsch",
        photo: "/assets/img/team/dahab/anatoly.png",
        eager: true
      },
      {
        name: "Хасан",
        role: "Профессиональный инструктор",
        text: "Узнаваемый райдер спота с десятилетним тренерским опытом. Учит балансу, технике и уверенности на фойле.",
        meta: "Русский · English",
        photo: "/assets/img/team/dahab/hassan.png",
        eager: true
      },
      {
        name: "Егор",
        role: "Детский спортивный инструктор",
        text: "Тренирует детей от восьми лет. Превращает сложную технику в понятную игру и закладывает безопасную базу.",
        meta: "Русский · English",
        photo: "/assets/img/team/dahab/egor.png"
      },
      {
        name: "Рома",
        role: "Инструктор",
        text: "Просто объясняет физику ветра, разбирает ошибки и помогает научиться самостоятельно выбирать направление для катания.",
        meta: "Русский",
        photo: "/assets/img/team/dahab/roma.png"
      },
      {
        name: "Ира",
        role: "Администратор",
        text: "Душа станции. Отвечает за расписание, комфорт гостей и хорошее настроение до и после каждой сессии.",
        meta: "Русский · English",
        photo: "/assets/img/team/dahab/ira.jpg"
      },
      {
        name: "Анна",
        role: "Инструктор",
        text: "Видит технические ошибки и помогает заложить прочный фундамент, чтобы прогресс был быстрее и увереннее.",
        meta: "Русский · English",
        photo: "/assets/img/team/dahab/anna.png"
      }
    ]
  },
  {
    id: "team-windsurf",
    eyebrow: "Центр Windsurf",
    title: "Команда виндсёрфинга",
    lead: "Встречаем гостей, подбираем и настраиваем оборудование, обучаем на воде и следим за безопасностью в акватории.",
    members: [
      {
        name: "Борис",
        role: "Менеджер · инструктор",
        text: "В виндсёрфинге с 2003 года. Руководит станцией и помогает подобрать обучение, прокат и оборудование под уровень гостя.",
        meta: "Русский · English · Română",
        photo: "/assets/img/team/dahab/boris.jpg"
      },
      {
        name: "Виктория",
        role: "Работа с гостями",
        text: "Помогает с организационными вопросами, расписанием и комфортом гостей виндсёрф-станции.",
        meta: "Русский · English",
        photo: "/assets/img/team/dahab/victoria.jpg"
      },
      {
        name: "Мустафа",
        role: "Сервис · оборудование",
        text: "Помогает подобрать, собрать и настроить виндсёрф-комплект перед выходом на воду.",
        meta: "العربية · English · Deutsch",
        photo: "/assets/img/team/dahab/mustafa.jpg"
      },
      {
        name: "Махмуд",
        role: "Сервис · спасатель",
        text: "Профессиональный спортсмен и специалист по слалому. Следит за акваторией и приходит на помощь по сигналу.",
        meta: "العربية · English · Русский",
        photo: "/assets/img/team/dahab/mahmoud.jpg"
      }
    ]
  },
  {
    id: "team-kids",
    eyebrow: "WindSurfKids",
    title: "Детские тренеры",
    lead: "Спортивная дисциплина, внимание к ребёнку и насыщенная командная жизнь за пределами тренировок.",
    members: [
      {
        name: "Иван Пупенок",
        role: "Организатор WindSurfKids",
        text: "Профессиональный тренер, преподаватель и действующий спортсмен в дисциплине слалом.",
        meta: "Тренер · спортсмен",
        photo: "/assets/img/team/dahab/ivan-pupenok.jpg"
      },
      {
        name: "Филипп Андреев",
        role: "Тренер WindSurfKids",
        text: "Легко находит общий язык с юными серферами и подбирает индивидуальный подход к каждому ребёнку.",
        meta: "Windsurf · детские группы",
        photo: "/assets/img/team/dahab/filipp-andreev.jpg"
      },
      {
        name: "Роман Тарасов",
        role: "Тренер WindSurfKids",
        text: "Помогает детям осваивать виндсерфинг последовательно, безопасно и с удовольствием от каждого нового навыка.",
        meta: "Windsurf · техника",
        photo: "/assets/img/team/dahab/roman-tarasov.jpg"
      },
      {
        name: "Кристина Тришина",
        role: "Администратор",
        text: "С командой с первых сезонов. Помогает детям и родителям решать организационные и повседневные вопросы.",
        meta: "Забота · организация",
        photo: "/assets/img/team/dahab/kristina-trishina.jpg"
      },
      {
        name: "Тихон",
        role: "Тренер WindSurfKids",
        text: "С детства занимается виндсерфингом, участвовал в соревнованиях и выбрал педагогическое направление.",
        meta: "Windsurf · педагогика",
        photo: "/assets/img/team/dahab/tikhon.jpg"
      }
    ]
  },
  {
    id: "team-safety",
    eyebrow: "Безопасность на воде",
    title: "Спасательная команда",
    lead: "Следит за акваторией, помогает со снаряжением и выходит на воду, когда нужна поддержка.",
    members: [
      {
        name: "Саид",
        role: "Главный спасатель",
        text: "Много лет следит за безопасностью акватории и уверенно управляет спасательным катером даже в сильный ветер.",
        meta: "Акватория · спасательный катер",
        photo: "/assets/img/team/dahab/said.jpg"
      },
      {
        name: "Махмуд",
        role: "Спасатель · оборудование",
        text: "Опытный спасатель и спортсмен в дисциплине слалом. Помогает подготовить снаряжение перед выходом.",
        meta: "Спасение · slalom",
        photo: "/assets/img/team/dahab/mahmoud.jpg"
      },
      {
        name: "Хасан",
        role: "Спасатель · оборудование",
        text: "Помогает собрать и настроить комплект, поддерживает детей и взрослых на берегу и во время занятий.",
        meta: "Помощь на берегу и воде",
        photo: "/assets/img/team/dahab/hassan-rescue.jpg"
      },
      {
        name: "Мустафа",
        role: "Спасатель · оборудование",
        text: "Помогает с подготовкой оборудования и поддерживает гостей станции до выхода на воду и после возвращения.",
        meta: "Сервис · безопасность",
        photo: "/assets/img/team/dahab/mustafa.jpg"
      }
    ]
  }
];

const dahabTeamCard = (member) => `
          <article class="team-card">
            <div class="team-card__media">
              <img src="${member.photo}" alt="${escapeHtml(`${member.name} — ${member.role} Vetratoria`)}" loading="${member.eager ? "eager" : "lazy"}" decoding="async">
            </div>
            <div class="team-card__content">
              <span class="team-card__role">${escapeHtml(member.role)}</span>
              <h3>${escapeHtml(member.name)}</h3>
              <p>${escapeHtml(member.text)}</p>
              <span class="team-card__meta">${escapeHtml(member.meta)}</span>
            </div>
          </article>`;

const dahabTeamSlider = (group) => `
      <section class="card-slider" id="${group.id}" data-card-slider aria-labelledby="${group.id}-title">
        <div class="card-slider__header">
          <div class="card-slider__heading">
            <p class="eyebrow">${escapeHtml(group.eyebrow)}</p>
            <h2 id="${group.id}-title">${escapeHtml(group.title)}</h2>
            <p>${escapeHtml(group.lead)}</p>
          </div>
          <div class="card-slider__controls">
            <button type="button" data-card-slider-prev aria-label="Предыдущие сотрудники">‹</button>
            <button type="button" data-card-slider-next aria-label="Следующие сотрудники">›</button>
          </div>
        </div>
        <div class="card-slider__track" data-card-slider-track tabindex="0">
          ${group.members.map(dahabTeamCard).join("")}
        </div>
      </section>`;

const dahabTeamPage = (page) => `
${hero(page, `${contactCta(page, "Написать команде")}<a class="button button-ghost" href="#team-wingfoil">Познакомиться</a>`)}
  <section class="content-section team-page">
    <div class="section-inner">
      ${sectionHeading(
        "Vetratoria · Дахаб",
        "Одна команда — разные роли",
        ""
      )}
      ${dahabTeamGroups.map(dahabTeamSlider).join("")}
    </div>
  </section>`;

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
      ["Спасение", "Важные правила и помощь на воде обсуждаются до выхода."]
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
      return layout(page, mediaLandingPage(page));
    case "media-country":
      return layout(page, mediaCountryPage(page));
    case "media-album":
      return layout(page, mediaAlbumPage(page));
    case "contacts":
      return layout(page, contactsPage(page));
    case "team":
      return layout(page, page.country === "dahab" ? dahabTeamPage(page) : featurePage(page));
    case "stations":
      return layout(page, page.country === "dahab" ? dahabStationsPage(page) : featurePage(page));
    case "safety":
      return layout(page, page.country === "dahab" ? dahabSafetyPage(page) : featurePage(page));
    case "route":
      return layout(page, page.country === "dahab" ? dahabHowToGetPage(page) : featurePage(page));
    case "not-found":
      return layout(page, notFoundPage(page));
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
${allPages.filter((page) => page.kind !== "not-found").map((page) => `  <url><loc>${canonicalForPage(page)}</loc></url>`).join("\n")}
</urlset>
`;

await writeFile(join(root, "sitemap.xml"), sitemap, "utf8");
await writeFile(join(root, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${absoluteUrl("/sitemap.xml")}\n`, "utf8");

console.log(`Built ${allPages.length} pages.`);
