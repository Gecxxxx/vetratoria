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

const seasonMonths = (country, { interactive = false } = {}) => `
    <div class="season-months" aria-label="Сезон: ${escapeHtml(country.seasonTitle)}">
      ${monthLabels.map(([key, label]) => {
        const inSeason = country.seasonMonths.includes(key);
        if (interactive && country.windMonths?.[key]) {
          const stats = country.windMonths[key];
          return `<button class="season-month-button${inSeason ? " is-season" : ""}" type="button" data-month="${key}" data-wind="${escapeHtml(stats.wind)}" data-windy="${escapeHtml(stats.windy)}" data-air="${escapeHtml(stats.air)}" data-water="${escapeHtml(stats.water)}" aria-pressed="false" aria-label="${label}: показать статистику">${label}</button>`;
        }
        return `<span class="${inSeason ? "is-season" : ""}" data-month="${key}" aria-label="${label}: ${inSeason ? "основной сезон" : "вне основного сезона"}">${label}</span>`;
      }).join("")}
    </div>`;

const windMonthStats = (country) => {
  if (!country.windMonths) return "";
  const initial = country.windMonths.jan;
  return `<div class="wind-month-stats" data-wind-month-stats aria-live="polite">
    <article><span>Ветер</span><strong data-wind-stat="wind">${escapeHtml(initial.wind)}</strong></article>
    <article><span>Ветреных дней</span><strong data-wind-stat="windy">${escapeHtml(initial.windy)}</strong></article>
    <article><span>Воздух</span><strong data-wind-stat="air">${escapeHtml(initial.air)}</strong></article>
    <article><span>Вода</span><strong data-wind-stat="water">${escapeHtml(initial.water)}</strong></article>
  </div>`;
};

const seasonCalendar = (country, { compact = false } = {}) => `
  <article class="season-card${compact ? " season-card--compact" : ""}" data-reveal>
    <header class="season-card__header">
      <div>
        <span>${escapeHtml(country.region)}</span>
        <h3>${escapeHtml(country.title)}</h3>
      </div>
      <strong>${escapeHtml(country.seasonTitle)}</strong>
    </header>
    ${seasonMonths(country, { interactive: compact && Boolean(country.windMonths) })}
    ${compact ? windMonthStats(country) : ""}
    <div class="season-card__wind">
      <span class="wind-indicator" aria-hidden="true"><i></i><i></i><i></i></span>
      <div><b>${escapeHtml(country.windLabel)}</b><p>${escapeHtml(country.windSummary)}</p></div>
    </div>
    <div class="season-card__stat" aria-label="Статистика ветрового сезона">
      <strong>${escapeHtml(country.windStat)}</strong><span>${escapeHtml(country.windStatLabel)}</span>
    </div>
    ${compact ? "" : `<p class="season-card__note">${escapeHtml(country.seasonNote)}</p><a href="${country.href}">Открыть направление <span aria-hidden="true">→</span></a>`}
  </article>`;

const seasonSection = (countries, { compact = false, eyebrow = "Сезоны Ветратории", title = "Куда ехать сейчас", lead = "Сравните подтверждённые сезоны направлений. Точный прогноз и доступность занятий команда проверит под ваши даты." } = {}) => `
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
  <nav class="social-icon-links${className ? ` ${className}` : ""}" aria-label="Социальные сети Ветратории">
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

const sportLabel = (sportKey) => sportKey === "windsurf-kids" ? "Детский" : site.sports[sportKey].nav;

const countrySportSummary = (country) => country.sports.map(sportLabel).join(", ");

const dahabStationPhones = (className) => site.dahabStations.map((station) => `
          <a class="${className}" href="tel:${station.phone}">
            <span>Номер ${station.key === "windsurf" ? "Виндсёрфинг" : "Вингфойл"}-станции</span>
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
        { label: "Вингфойл", href: "/dahab/wingfoil/" },
        { label: "Виндсёрфинг", href: "/dahab/windsurf/" }
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
          <a class="vtr-mobile-menu__row" href="/">Ветратория</a>
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
      <a class="vtr-nav__link" href="/">Ветратория</a>
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
    ? `<span class="vtr-nav__brand-line">Ветратория — школы ветра с 2006 года</span>`
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
  { label: "Безопасность", href: "/dahab/safety/" },
  { label: "Как добраться", href: "/dahab/how-to-get/" },
  { label: "Медиа", href: "/media/dahab/" },
  { label: "Контакты", href: "/dahab/contacts/" }
] : country.key === "russia" ? [
  { label: "О школе и станции", href: "/russia/team/" },
  { label: "Проживание", href: "/russia/accommodation/" },
  { label: "Как добраться", href: "/russia/how-to-get/" },
  { label: "Блог", href: "/russia/blog/" },
  { label: "Медиа", href: "/media/russia/" },
  { label: "Контакты", href: "/russia/contacts/" }
] : [
  { label: "О школе и команде", href: `/${country.key}/team/` },
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
        `<a class="${sectionLinkClass(page.path === "/dahab/wingfoil/")}" href="/dahab/wingfoil/">Вингфойл</a>`,
        `<a class="${sectionLinkClass(page.path === "/dahab/windsurf/")}" href="/dahab/windsurf/">Виндсёрфинг</a>`,
        sectionDropdown("Цены", countrySectionActive(page, pricePaths), [
          { label: "Вингфойл", href: "/dahab/wingfoil/price/" },
          { label: "Виндсёрфинг", href: "/dahab/windsurf/price/" }
        ]),
        `<a class="${sectionLinkClass(countrySectionActive(page, ["/dahab/stations/"]))}" href="/dahab/stations/">Станции</a>`
      ]
    : [
        `<a class="${sectionLinkClass(page.path === country.href)}" href="${country.href}">Обзор</a>`,
        `<a class="${sectionLinkClass(page.path === `/${country.key}/windsurf/`)}" href="/${country.key}/windsurf/">Виндсёрфинг</a>`,
        `<a class="${sectionLinkClass(page.path === `/${country.key}/wingfoil/`)}" href="/${country.key}/wingfoil/">Вингфойл</a>`,
        `<a class="${sectionLinkClass(page.path === `/${country.key}/kite/`)}" href="/${country.key}/kite/">Кайтсёрфинг</a>`,
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
    <a class="vtr-nav__logo" href="/" aria-label="Ветратория — главная">
      <img src="${site.logo}" alt="Ветратория" width="198" height="97">
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
  const country = currentCountry(page);
  const countryKey = country?.key;
  const sportKey = page.sport || ["wingfoil", "windsurf", "kite"].find((key) => page.path.includes(key));
  const link = (label, href, active = false) => `<a href="${href}"${active ? ' class="is-current" aria-current="page"' : ""}${href.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : ""}>${label}</a>`;
  const countryLinks = countryList.map((item) => link(`${item.region} · ${item.city}`, item.href, item.key === countryKey)).join("\n          ");
  const sportsByCountry = {
    dahab: [["Вингфойл Дахаб", "/dahab/wingfoil/", "wingfoil"], ["Виндсёрфинг Дахаб", "/dahab/windsurf/", "windsurf"], ["Детский виндсёрфинг", "https://windsurfkids.su/", "windsurf-kids"]],
    vietnam: [["Кайтсёрфинг Муйне", "/vietnam/kite/", "kite"], ["Виндсёрфинг Муйне", "/vietnam/windsurf/", "windsurf"], ["Вингфойл Муйне", "/vietnam/wingfoil/", "wingfoil"]],
    russia: [["Кайтсёрфинг Должанская", "/russia/kite/", "kite"], ["Виндсёрфинг Должанская", "/russia/windsurf/", "windsurf"], ["Вингфойл Должанская", "/russia/wingfoil/", "wingfoil"]]
  };
  const globalSports = [["Вингфойл", "/dahab/wingfoil/", "wingfoil"], ["Виндсёрфинг", "/dahab/windsurf/", "windsurf"], ["Кайтсёрфинг", "/vietnam/kite/", "kite"], ["Детский виндсёрфинг", "https://windsurfkids.su/", "windsurf-kids"]];
  const sportLinks = (sportsByCountry[countryKey] || globalSports).map(([label, href, key]) => link(label, href, key === sportKey)).join("\n          ");
  const contactLinks = countryKey === "dahab"
    ? site.dahabStations.map((station) => `<a class="footer-contact" href="tel:${station.phone}"><span>Номер ${station.key === "windsurf" ? "Виндсёрфинг" : "Вингфойл"}-станции</span><strong>${station.phoneLabel}</strong></a>`).join("\n          ") + `\n          <a class="footer-contact" href="mailto:${site.contacts.dahab.email}"><span>Почта</span><strong>${site.contacts.dahab.email}</strong></a>`
    : countryKey
      ? `<a class="footer-contact" href="tel:${site.contacts[countryKey].phone}"><span>Номер станции</span><strong>${site.contacts[countryKey].phoneLabel}</strong></a>\n          <a class="footer-contact" href="mailto:${site.contacts[countryKey].email}"><span>Почта</span><strong>${site.contacts[countryKey].email}</strong></a>`
      : countryList.map((item) => link(`${item.region} · ${item.city}`, `/${item.key}/contacts/`)).join("\n          ");
  return `
<footer class="site-footer site-footer--clean" data-site-footer>
  <div class="footer-inner">
    <div class="footer-brand">
      <a href="/" aria-label="Ветратория — главная"><img src="${site.logo}" alt="Ветратория" width="198" height="97"></a>
      <p>Школы ветра<br>с 2006 года</p>
    </div>
    <nav class="footer-nav" aria-label="Навигация в подвале">
      <div class="footer-column">
        <h2>Страны</h2>
        <div class="footer-links">${countryLinks}</div>
      </div>
      <div class="footer-column">
        <h2>Спорт</h2>
        <div class="footer-links">${sportLinks}</div>
      </div>
      <div class="footer-column footer-column--contact">
        <h2>Связь</h2>
        <div class="footer-links">${contactLinks}</div>
      </div>
    </nav>
  </div>
  <div class="footer-bottom">
    <span>© 2026 Ветратория</span>
    <span>Условия, расписание, цены и доступность форматов уточняются перед поездкой.</span>
  </div>
</footer>`;
};
const footerForPage = (page) => footer(page);

const metaTitleForPage = (page) =>
  page.path === "/dahab/" ? "Дахаб — вингфойл и виндсёрфинг на Красном море | Ветратория" : page.title || site.title;

const metaDescriptionForPage = (page) => {
  if (page.path === "/dahab/") {
    return "Ветратория в Дахабе: вингфойл, виндсёрфинг, детские программы, аренда, уроки, станции Винг-центр, Свисс Инн и Ганет Синай.";
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

const pagesByPath = new Map(allPages.map((page) => [page.path, page]));

const breadcrumbPagesFor = (page) => {
  if (page.path === "/") return [pagesByPath.get("/")];
  const paths = ["/"];
  const segments = page.path.split("/").filter(Boolean);
  let currentPath = "";

  for (const segment of segments) {
    currentPath += `/${segment}`;
    const normalizedPath = `${currentPath}/`;
    if (pagesByPath.has(normalizedPath)) paths.push(normalizedPath);
  }

  return paths.map((path) => pagesByPath.get(path)).filter(Boolean);
};

const structuredDataForPage = (page) => {
  const organizationId = `${site.baseUrl}/#organization`;
  const graph = [
    {
      "@type": "Organization",
      "@id": organizationId,
      name: site.name,
      url: absoluteUrl("/"),
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(site.logo)
      },
      sameAs: site.socials.map((social) => social.href)
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${canonicalForPage(page)}#breadcrumbs`,
      itemListElement: breadcrumbPagesFor(page).map((breadcrumbPage, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: breadcrumbPage.path === "/" ? site.name : breadcrumbPage.title,
        item: canonicalForPage(breadcrumbPage)
      }))
    }
  ];

  if (page.path === "/dahab/") {
    graph.push({
      "@type": "SportsActivityLocation",
      "@id": `${canonicalForPage(page)}#sports-location`,
      name: "Ветратория в Дахабе",
      url: canonicalForPage(page),
      description: metaDescriptionForPage(page),
      image: absoluteUrl(metaImageForPage(page)),
      email: site.contacts.dahab.email,
      telephone: site.contacts.dahab.phone,
      parentOrganization: {
        "@id": organizationId
      },
      areaServed: {
        "@type": "City",
        name: "Дахаб"
      }
    });
  }

  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": graph
  }).replace(/</g, "\\u003c");
};

const contactCountryOption = (country) => {
  const contact = site.contacts[country.key];
  return `<option value="${country.key}" data-email="${escapeHtml(contact.formEmail)}" data-phone="${escapeHtml(contact.phone)}" data-telegram="${escapeHtml(contact.telegram)}">${escapeHtml(contact.title)}</option>`;
};

const contactDialog = (page) => {
  const country = contactCountryForPage(page);
  const destination = contactDestination(page) || site.contacts[countryList[0].key];
  const direction = country ? site.contacts[country.key].title : "Ветратория";
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
      <label>Способ связи<input name="contact" autocomplete="tel" placeholder="Телефон, электронная почта или @имя_пользователя" required></label>
      <label><span>Комментарий <small>по желанию</small></span><textarea name="message" rows="4" placeholder="Даты, уровень, спорт или ваш вопрос"></textarea></label>
      <button class="button button-primary contact-modal__submit" type="submit">${site.contactEndpoint ? "Отправить заявку" : "Подготовить заявку"}</button>
      <p class="form-note" data-form-note role="status" aria-live="polite"></p>
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

const ASSET_VERSION = "20260903-staging-footer-r2";
const assetVersionForPage = () => ASSET_VERSION;
const versionedAsset = (path, version = ASSET_VERSION) => `${path}?v=${version}`;

const layout = (page, main) => `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script>
    (() => {
      document.documentElement.classList.add("vtr-nav-state-pending");
      try {
        const navigationType = performance.getEntriesByType("navigation")[0]?.type;
        const savedScrollY = Number(sessionStorage.getItem("vtr:scroll:" + location.pathname) || 0);
        if ((navigationType === "reload" || navigationType === "back_forward") && savedScrollY > 140) {
          document.documentElement.classList.add("vtr-nav-initial-compact");
        }
      } catch {}
    })();
  </script>
  <title>${escapeHtml(metaTitleForPage(page))}</title>
  <meta name="description" content="${escapeHtml(metaDescriptionForPage(page))}">
  ${page.kind === "not-found" ? `<meta name="robots" content="noindex, follow">` : ""}
  <link rel="canonical" href="${canonicalForPage(page)}">
  <meta property="og:type" content="${page.kind === "article" ? "article" : "website"}">
  <meta property="og:site_name" content="${site.name}">
  <meta property="og:locale" content="${site.locale}">
  <meta property="og:url" content="${canonicalForPage(page)}">
  <meta property="og:title" content="${escapeHtml(metaTitleForPage(page))}">
  <meta property="og:description" content="${escapeHtml(metaDescriptionForPage(page))}">
  <meta property="og:image" content="${absoluteUrl(metaImageForPage(page))}">
  <meta property="og:image:alt" content="${escapeHtml(metaTitleForPage(page))}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(metaTitleForPage(page))}">
  <meta name="twitter:description" content="${escapeHtml(metaDescriptionForPage(page))}">
  <meta name="twitter:image" content="${absoluteUrl(metaImageForPage(page))}">
  <meta name="theme-color" content="#0d0c0b">
  <link rel="icon" href="${site.logo}">
  <link rel="preload" href="/assets/fonts/inter-cyrillic-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${versionedAsset("/assets/css/main.css", assetVersionForPage(page))}">
  <script defer src="${versionedAsset("/assets/js/app.js", assetVersionForPage(page))}"></script>
  <script type="application/ld+json">${structuredDataForPage(page)}</script>
</head>
<body class="modern-site ${page.kind}${page.path === "/" ? " page-home" : ""}${page.country ? ` country-${page.country}` : ""}">
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
    <img src="${page.image}" alt="" loading="eager" fetchpriority="high" decoding="async">
  </div>
  <div class="hero-shade"></div>
  <div class="hero-content">
    <p class="eyebrow">${escapeHtml(page.eyebrow || site.name)}</p>
    <h1>${escapeHtml(page.title)}</h1>
    <p class="hero-lead">${escapeHtml(page.description)}</p>
    ${actions ? `<div class="hero-actions">${actions}</div>` : ""}
  </div>
</section>`;

const homeCountryCopy = {
  dahab: {
    lead: "Круглый год. Вингфойл, Виндсёрфинг и детские программы на Красном море: от первого занятия до самостоятельной практики под наблюдением команды.",
    action: "Смотреть Дахаб"
  },
  vietnam: {
    lead: "Сильный зимний сезон, стабильный бриз и длинная береговая линия. Виндсёрфинг, Вингфойл и Кайтсёрфинг для обучения, прогресса и самостоятельного катания.",
    action: "Смотреть Муйне"
  },
  russia: {
    lead: "Летний сезон на Должанской косе. Мелкая вода, обучение с берега и форматы для новичков, опытных райдеров и семей с детьми.",
    action: "Смотреть Должанскую"
  }
};

const brandSlides = [
  {
    src: img("vetratoria-station-team.webp"),
    alt: "Гости и команда Ветратории у станции в Дахабе",
    width: 1600,
    height: 900
  },
  {
    src: img("vetratoria-windsurf-training.webp"),
    alt: "Виндсёрферы тренируются на ровной воде в Дахабе",
    width: 800,
    height: 500
  },
  {
    src: img("vetratoria-windsurf-lagoon-lesson.webp"),
    alt: "Ученики Ветратории готовятся к занятию в лагуне Дахаба",
    width: 800,
    height: 500
  },
  {
    src: img("vetratoria-windsurf-community.webp"),
    alt: "Участники виндсёрф-программы у станции Ветратория",
    width: 1200,
    height: 800
  }
];

const home = (page) => `
<section class="hero hero-home">
  <div class="home-hero__slider" data-hero-slider aria-label="Фото Ветратории">
    ${site.slider.map((src, index) => `<img ${index === 0 ? `src="${src}" fetchpriority="high"` : `data-src="${src}"`} alt="" width="1200" height="780" data-slide ${index === 0 ? `class="is-active"` : ""} aria-hidden="${index === 0 ? "false" : "true"}" loading="${index === 0 ? "eager" : "lazy"}" decoding="async">`).join("")}
  </div>
  <div class="hero-shade"></div>
  <div class="hero-content">
    <p class="eyebrow">Ветратория · школы ветра</p>
    <h1>Виндсёрфинг, Вингфойл и Кайтсёрфинг — от первого старта до уверенного катания</h1>
    <p class="hero-lead">Обучение и прокат в Египте, Вьетнаме и России. Подберём программу и снаряжение под ваш уровень и условия на воде.</p>
    <div class="hero-advantages">
      <article class="hero-advantage">С 2006 года</article>
      <article class="hero-advantage">Обучение с нуля и прогресс</article>
      <article class="hero-advantage">Опытные инструкторы</article>
      <article class="hero-advantage">Клубная система скидок</article>
    </div>
    <div class="hero-actions">
      ${contactCta(page, "Подобрать программу")}
      <a class="button button-ghost" href="#destinations">Выбрать направление</a>
    </div>
    <div class="slider-dots" aria-label="Слайды">
      ${site.slider.map((_, index) => `<button type="button" data-slide-dot aria-label="Слайд ${index + 1}"></button>`).join("")}
    </div>
  </div>
</section>

<section class="home-section home-section--destinations" id="destinations">
  <div class="section-inner">
    ${sectionHeading("Направления и сезоны", "Выберите страну", "")}
    <div class="destination-season-grid">
      ${countryList.map((country) => `
        <a class="destination-season-card" href="${country.href}" data-reveal>
          ${cardImage(country.hero, `${country.region} · ${country.city}`)}
          <div class="destination-season-card__overlay">
            <header>
              <div><span>${country.region}</span><h2>${country.key === "russia" ? "Должанская Коса" : country.title}</h2></div>
              <strong>${escapeHtml(country.seasonTitle)}</strong>
            </header>
            ${seasonMonths(country)}
            <em>${homeCountryCopy[country.key].action} <span aria-hidden="true">→</span></em>
          </div>
        </a>`).join("")}
    </div>
  </div>
</section>

<section class="home-section home-section--brand" id="brand">
  <div class="section-inner brand-split">
    <div class="brand-copy">
      <p class="eyebrow">Опыт и подход</p>
      <h2>Наша цель — не провести урок, а сделать вас увереннее на воде</h2>
      <p>Ветратория работает с 2006 года. За это время обучение прошли более 10 000 человек — от первого знакомства с ветром до уверенного катания и новых элементов.</p>
      <ol class="home-proof-list">
        <li><b>01</b><span>Новичку даём устойчивую базу и понятную последовательность действий.</span></li>
        <li><b>02</b><span>Опытному райдеру помогаем разобрать технику и точечно улучшить результат.</span></li>
        <li><b>03</b><span>Доску, парус или крыло подбираем под уровень, вес и условия на воде.</span></li>
        <li><b>04</b><span>Перед выходом объясняем задачу, границы акватории и правила безопасности.</span></li>
      </ol>
    </div>
    <figure class="brand-media" aria-label="Команда и обучение Ветратории">
      <img class="brand-media__image" src="${brandSlides[0].src}" alt="${escapeHtml(brandSlides[0].alt)}" width="${brandSlides[0].width}" height="${brandSlides[0].height}" loading="lazy" decoding="async">
    </figure>
  </div>
</section>

<section class="home-section" id="media-blog">
  <div class="section-inner home-explore">
    <header class="home-explore__head">
      <div>${sectionHeading("До поездки", "Посмотрите, как всё устроено на воде", "")}</div>
      <a href="/media/">Все материалы <span aria-hidden="true">→</span></a>
    </header>
    <div class="home-explore__grid">
      <a class="home-explore__story" href="/blog/">
        <img src="${img("home-blog.webp")}" alt="Подготовка к выходу на воду" width="1200" height="840" loading="lazy" decoding="async">
        <div>
          <h2>Подготовиться к поездке</h2>
          <p>Как выбрать спорт, когда ехать, как проходит обучение и что важно перед первым выходом.</p>
          <strong>Открыть блог <span aria-hidden="true">→</span></strong>
        </div>
      </a>
      <a class="home-explore__story" href="/media/">
        <img src="${img("home-media.webp")}" alt="Гости и команда Ветратории на станции" width="1200" height="840" loading="lazy" decoding="async">
        <div>
          <h2>Увидеть атмосферу</h2>
          <p>Занятия, самостоятельное катание, команда и обычные дни на воде в трёх странах.</p>
          <strong>Открыть медиа <span aria-hidden="true">→</span></strong>
        </div>
      </a>
    </div>
  </div>
</section>

<section class="home-section home-section--contact" id="contact">
  <div class="section-inner home-cta">
    <div>
      <p class="eyebrow">Подбор программы</p>
      <h2>Расскажите, когда хотите на воду</h2>
      <p>Оставьте имя и телефон или напишите в WhatsApp / Telegram. Уточним даты, уровень и цель, затем предложим направление и формат без лишних созвонов.</p>
    </div>
    <div class="home-cta__actions">
      ${contactCta(page, "Оставить заявку")}
      ${countryList.map((country) => `<a class="button button-ghost" href="${country.href}">${country.nav}</a>`).join("")}
    </div>
  </div>
</section>`;

const dahabImg = (name) => `/assets/img/dahab/${name}`;
const dahabRefImg = (name) => `/assets/img/dahab-ref/${name}`;
const finalImg = (name) => `/assets/img/final/${name}`;
const wingfoilSectionImg = (name) => finalImg(`wingfoil/sections/${name}`);
const wingfoilWaterImg = (name) => finalImg(`wingfoil/water/${name}`);
const windsurfSectionImg = (name) => finalImg(`windsurf/sections/${name}`);
const windsurfWaterImg = (name) => finalImg(`windsurf/water/${name}`);
const dahabFinalImg = (name) => finalImg(`dahab/${name}`);

const dahabReviewItems = [
  ["B", "Boris Sizov", "★★★★★", "Очень удобно приезжать без своего снаряжения: есть все размеры крыльев и досок, оборудования хватает. Толик, Ира и Хассан — настоящие профессионалы."],
  ["D", "Dmitrii Polishchuk", "★★★★★", "Отличная surf-станция, классная локация для выхода в море, дружелюбная команда и сильное оборудование для вингфойл. Очень рекомендую."],
  ["O", "Ольга Краснова", "★★★★★", "Винг-центр Ветратории — магическое место. Мои первые шаги на вингфойле получились, а снаряжение подходит и новичкам, и продолжающим."],
  ["E", "Евгений Колосов", "★★★★★", "Ветратория в Египте оставила только положительные впечатления: высокий уровень инструкторов, идеальные условия и очень дружелюбная атмосфера."],
  ["Y", "Yuriy Tolchinskiy", "★★★★★", "Приезжал осваивать вингфойл. Довольно быстро получилось лететь на фойле и делать повороты. Спасибо Hassan за продуктивные тренировки."]
];

const stationLifeGallery = ({ id, eyebrow, title, lead, photos }) => `
<section class="station-life station-life--sport" id="${id}" aria-labelledby="${id}-title">
  <div class="station-life__inner">
    <div class="station-life__layout" data-life-slider>
      <header class="station-life__panel" data-reveal="line">
        <p class="eyebrow">${escapeHtml(eyebrow)}</p>
        <h2 id="${id}-title">${escapeHtml(title)}</h2>
        <p>${escapeHtml(lead)}</p>
        <a href="/media/dahab/">Смотреть все фотографии <span aria-hidden="true">→</span></a>
        <div class="station-life__panel-footer">
          <span><b data-life-current>01</b> / ${String(photos.length).padStart(2, "0")}</span>
          <div><button type="button" data-life-prev aria-label="Предыдущая фотография">‹</button><button type="button" data-life-next aria-label="Следующая фотография">›</button></div>
        </div>
      </header>
      <div class="station-life__gallery">
        <button class="station-life__featured" type="button" data-life-featured data-media-photo-open data-media-group="${id}" data-media-photo-index="0" data-media-src="${photos[0][0]}" data-media-alt="${escapeHtml(photos[0][3])}" aria-label="Открыть фотографию 1 из ${photos.length} на весь экран">
          <img src="${photos[0][0]}" alt="${escapeHtml(photos[0][3])}" width="${photos[0][4]}" height="${photos[0][5]}" decoding="async">
          <span class="station-life__expand">Открыть на весь экран ↗</span>
        </button>
      </div>
      <div class="station-life__track" data-life-track tabindex="0" aria-label="${escapeHtml(title)}">
        ${photos.map(([src, label, caption, alt, width, height], index) => `
          <button class="station-life__item${index === 0 ? " is-active" : ""}" type="button" data-life-thumb data-media-photo-source data-media-group="${id}" data-media-photo-index="${index}" data-media-src="${src}" data-media-alt="${escapeHtml(alt)}" data-life-label="${escapeHtml(label)}" data-life-caption="${escapeHtml(caption)}" aria-pressed="${index === 0 ? "true" : "false"}" aria-label="Показать фотографию ${index + 1} из ${photos.length}">
            <img src="${src}" alt="${escapeHtml(alt)}" width="${width}" height="${height}" loading="lazy" decoding="async">
          </button>`).join("")}
      </div>
    </div>
  </div>
</section>
<dialog class="media-lightbox" data-media-lightbox="${id}" aria-label="Полноэкранный просмотр: ${escapeHtml(title)}">
  <div class="media-lightbox__surface">
    <header>
      <span data-media-lightbox-count></span>
      <div>
        <button type="button" data-media-lightbox-close aria-label="Закрыть">×</button>
      </div>
    </header>
    <div class="media-lightbox__stage">
      <button type="button" data-media-lightbox-prev aria-label="Предыдущая фотография">‹</button>
      <figure>
        <img src="${photos[0][0]}" alt="${escapeHtml(photos[0][3])}" data-media-lightbox-image>
      </figure>
      <button type="button" data-media-lightbox-next aria-label="Следующая фотография">›</button>
    </div>
  </div>
</dialog>`;

const sportStationLife = (options) => stationLifeGallery(options);

const dahabWingfoilPage = (page) => {
  const heroFacts = ["Обучение с нуля", "Спасательный катер", "Связь BB Talkin", "Снаряжение RRD"];
  const reasons = [
    ["Ветер почти круглый год", "Стабильные ветровые условия позволяют планировать обучение в разные сезоны и проводить несколько занятий подряд.", dahabFinalImg("dahab-flat-water-training-zone.webp"), "Ровная вода и ветровой флаг в лагуне Дахаба", 1254, 1254],
    ["Три зоны для прогресса", "Лагуна, Спиди и открытое море позволяют постепенно переходить от первых стартов к уверенному катанию.", dahabFinalImg("dahab-lagoon-riding-zones.webp"), "Учебные зоны Вингфойл в лагуне Дахаба", 1254, 1254],
    ["Флэт для первых полётов", "Ровная вода помогает легче удерживать баланс, набирать скорость и контролировать доску при выходе на фойл.", wingfoilSectionImg("dahab-wingfoil-stable-wind.webp"), "Первый полёт на Вингфойл над ровной водой в Дахабе", 1600, 1600],
    ["4 спасательных катера", "Катера дежурят на акватории и помогают быстро вернуться на станцию, если ветер ослабнет или потребуется помощь.", dahabFinalImg("dahab-rescue-boat.webp"), "Спасательный катер школы Ветратория в Дахабе", 1600, 1600]
  ];
  const learning = [
    ["01", "Винг на SUP", "Учимся держать крыло, разворачиваться, идти нужным курсом и понимать, как работает ветер.", wingfoilSectionImg("wing-start-coaching.webp"), "Инструктор помогает ученику стартовать с крылом у берега"],
    ["02", "Фойл за лодкой", "Пробуем фойл без крыла: баланс, подъем, контроль высоты и уверенность на доске.", wingfoilSectionImg("foil-boat-training.webp"), "Фойл за лодкой в Дахабе"],
    ["03", "Вингфойл с инструктором", "Соединяем крыло и фойл. Первые старты, первые метры, контроль скорости и направления.", wingfoilSectionImg("wingfoil-duo.webp"), "Вингфойл с инструктором на воде"],
    ["04", "Практика и прогресс", "После первых успешных попыток можно кататься самостоятельно под контролем станции и брать уроки точечно.", wingfoilSectionImg("wingfoil-ride.webp"), "Уверенный райдер вингфойл в Дахабе"]
  ];
  const prices = [
    ["Урок", "Вингфойл урок", "70$", "Индивидуальное занятие с инструктором для первых стартов, исправления ошибок и прогресса.", "Записаться"],
    ["Лодка", "Фойл за лодкой", "60$", "Отдельный этап для понимания фойла: баланс, подъем и контроль высоты.", "Записаться"],
    ["Новичок", "Программа для новичка", "от 270$", "Винг на SUP, фойл за лодкой, первые попытки вингфойл и практика.", "Подобрать программу"],
    ["Прокат", "Прокат", "от 25$", "Для тех, кто уже катается самостоятельно.", "Оставить заявку"]
  ];
  const waterPhotos = [
    [wingfoilWaterImg("water-01.webp"), "Вингфойл над бирюзовой водой в Дахабе"],
    [wingfoilWaterImg("water-02.webp"), "Прыжок на вингфойл в Дахабе"],
    [wingfoilWaterImg("water-03.webp"), "Вингфойл ride на Красном море"],
    [wingfoilWaterImg("water-04.webp"), "Два райдера вингфойл в Дахабе"],
    [wingfoilWaterImg("water-05.webp"), "Вингфойл на открытой воде"]
  ];
  const stationPhotos = [
    [dahabRefImg("bg-wingfoil-station.webp"), "Винг-центр", "День начинается у воды и с подготовки комплекта", "Винг-центр Ветратории в Дахабе", 1600, 1067],
    [wingfoilSectionImg("wing-start-coaching.webp"), "Подготовка", "Разбираем крыло и первые действия до старта", "Инструктор объясняет управление крылом у берега", 1920, 1080],
    [wingfoilSectionImg("foil-boat-training.webp"), "Фойл за лодкой", "Тренируем баланс и контроль высоты отдельно", "Тренировка на фойле за лодкой в Дахабе", 1920, 1080],
    [wingfoilSectionImg("wingfoil-duo.webp"), "На воде", "Инструктор остаётся рядом во время первых полётов", "Ученик и инструктор Вингфойл на воде", 1920, 1080],
    [wingfoilSectionImg("rescue-boats.webp"), "Команда", "Готовим лодки и контролируем акваторию", "Спасательные лодки винг-центра Ветратории", 1920, 1080],
    [wingfoilWaterImg("water-01.webp"), "Катание", "Первые уверенные проходы над Красным морем", "Вингфойл над бирюзовой водой Дахаба", 1920, 1080],
    [wingfoilWaterImg("water-04.webp"), "Вместе", "Делим воду, ветер и хорошие выходы", "Два райдера Вингфойл в Дахабе", 1920, 1080],
    ["/assets/img/media/dahab/photo-day/2026-05-24-photo-day/46.jpg", "После воды", "Обсуждаем прогресс и следующий выход", "Гости общаются после катания на станции", 1080, 720]
  ];
  const reviews = dahabReviewItems;
  const faqs = [
    ["Можно ли начать с нуля?", "Да. Обычно начинаем с управления крылом на берегу и Винг + SUP, затем добавляем фойл за лодкой или Винг + фойл по готовности."],
    ["Сколько занятий нужно до первых полетов?", "Зависит от ветра, баланса и прошлого опыта. Часто первые короткие полеты появляются после нескольких последовательных выходов."],
    ["Что входит в урок?", "Инструктор, подбор комплекта, шлем, жилет, разбор зоны катания, постановка задач и обратная связь после выхода."],
    ["Нужен ли опыт виндсёрфинг или кайтсёрфинг?", "Нет, но опыт любых водных видов помогает. Для старта важнее спокойная вода, правильный комплект и понятная последовательность."],
    ["Когда лучше ехать в Дахаб?", "Дахаб работает круглый год. Конкретные окна по ветру и формату лучше уточнять перед поездкой под ваши даты."]
  ];
  const useful = [
    ["/dahab/blog/wingfoil/", "Вингфойл", "Как начать Вингфойл с нуля", wingfoilSectionImg("wing-start-coaching.webp")],
    ["/dahab/blog/wingfoil/", "Сравнение", "Вингфойл или Виндсёрфинг: что выбрать", wingfoilSectionImg("wingfoil-ride.webp")],
    ["/dahab/blog/wingfoil/", "Фойл за лодкой", "Почему фойл за лодкой помогает быстрее прогрессировать", wingfoilSectionImg("foil-boat-training.webp")]
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
      <img src="${page.image}" alt="Вингфойл в Дахабе — райдеры на фойле" width="1920" height="1080" loading="eager" decoding="async" fetchpriority="high">
    </figure>
  </div>
</section>

${seasonSection([countriesByKey.dahab], {
  compact: true,
  eyebrow: "Дахаб · условия для вингфойла",
  title: "Сезон и ветер",
  lead: countriesByKey.dahab.seasonNote
})}

<section class="dahab-sport-section dahab-sport-section--location">
  <div class="dahab-sport-inner">
    ${sectionHeading("Локация", "Почему Дахаб подходит для вингфойла", "Стабильный ветер, ровная вода, несколько зон катания и развитая система безопасности создают в Дахабе подходящие условия для обучения Вингфойл.")}
    ${sportFeatureGrid(reasons, { atlas: true, leadImage: page.image, leadAlt: "Вингфойл в Дахабе на Красном море" })}
  </div>
</section>

<section class="dahab-sport-section dahab-sport-section--soft">
  <div class="dahab-sport-inner">
    ${sectionHeading("Обучение", "Как проходит обучение вингфойлу", "В реальности это не один случайный урок, а понятная лестница: берег, крыло, доска, фойл, первые полеты и самостоятельность.")}
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
    ${sectionHeading("Цены", "Цены на вингфойл", "Можно взять разовый урок, попробовать фойл за лодкой или собрать программу на несколько дней. Если вы не уверены, с чего начать, оставьте заявку — мы подберем вариант под ваш уровень, даты и ветер.")}
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
      <a class="button button-ghost" href="/dahab/wingfoil/price/">Цены на вингфойл</a>
    </div>
  </div>
</section>

<section class="dahab-sport-section dahab-sport-section--soft">
  <div class="dahab-sport-inner dahab-sport-safety">
    <div class="dahab-sport-safety__copy">
      <p class="eyebrow">Безопасность</p>
      <h2>Безопасность на воде</h2>
      <p>Вингфойл быстро дает ощущение свободы, но первые выходы требуют контроля. Перед стартом разбираем ветер, границы зоны, сигналы, комплект и действия, если нужно вернуться к берегу.</p>
      <div class="dahab-sport-safety__list">
        <span>Инструктор рядом на старте и в воде</span>
        <span>Шлем, жилет и подходящий комплект</span>
        <span>Понятная зона катания и спасение</span>
      </div>
      <a class="button button-primary" href="/dahab/safety/">Подробнее</a>
    </div>
    <div class="dahab-sport-safety__media">
      <img src="${wingfoilSectionImg("rescue-boats.webp")}" alt="Спасательные катера на берегу станции Ветратория" width="1920" height="1080" loading="lazy" decoding="async">
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

${sportStationLife({
  id: "wingfoil-station-life",
  eyebrow: "Жизнь Винг-центр",
  title: "Вингфойл-станция между выходами на воду",
  lead: "Здесь подбирают крыло, собирают фойл, разбирают прогноз, тренируются с лодкой и делятся впечатлениями после катания.",
  photos: stationPhotos
})}

<section class="dahab-sport-section dahab-sport-section--soft dahab-sport-reviews" id="reviews">
  <div class="dahab-sport-inner">
    <div class="dahab-sport-reviews__head">
      <div>
        <p class="eyebrow">Отзывы</p>
        <h2>Что говорят гости</h2>
      </div>
      <a href="https://www.tripadvisor.com/" target="_blank" rel="noopener">144 отзыва →</a>
    </div>
    <div class="dahab-sport-review-track" aria-label="Отзывы гостей Ветратории в Дахабе">
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

<section class="dahab-sport-section dahab-sport-section--faq" id="faq">
  <div class="dahab-sport-inner">
    ${sportFaqBlock("Частые вопросы", "Частые вопросы", "", faqs)}
  </div>
</section>

<section class="dahab-sport-section">
  <div class="dahab-sport-inner">
    ${sectionHeading("Материалы", "Полезное о вингфойле", "")}
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
  <img src="${wingfoilSectionImg("wingfoil-ride.webp")}" alt="Вингфойл в Дахабе на воде" width="1920" height="1080" loading="lazy" decoding="async">
  <div class="dahab-sport-cta__inner">
    <p class="eyebrow">Заявка</p>
    <h2>Хотите попробовать вингфойл в Дахабе?</h2>
    <p>Напишите даты, уровень и цель поездки. Подберем формат: Винг + SUP, фойл за лодкой, урок Винг + фойл или самостоятельную практику.</p>
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
    ["Ветер для глиссирования", "Стабильный ветер позволяет регулярно тренироваться и быстрее переходить от водоизмещающего режима к глиссированию.", dahabFinalImg("dahab-flat-water-training-zone.webp"), "Ветровой флаг на берегу лагуны Дахаба", 1254, 1254],
    ["Лагуна для старта", "Ровная вода и удобная учебная акватория помогают безопасно освоить доску, парус и первые галсы.", windsurfSectionImg("dahab-windsurf-planing-wind.webp"), "Обучение виндсёрфингу в лагуне Дахаба", 1600, 1600],
    ["Три зоны для прогресса", "Лагуна подходит для обучения, Спиди — для скорости, а открытое море — для уверенного катания и волн.", dahabFinalImg("dahab-lagoon-riding-zones.webp"), "Три зоны катания на виндсёрфе в Дахабе", 1254, 1254],
    ["4 спасательных катера", "Система спасения помогает безопасно тренироваться и быстро вернуться на станцию при поломке или ослаблении ветра.", dahabFinalImg("dahab-rescue-boat.webp"), "Спасательный катер на акватории Дахаба", 1600, 1600]
  ];
  const learning = [
    ["01", "Управление парусом", "На берегу разбираем стойку, положение рук, направление ветра и основные способы управления парусом.", windsurfSectionImg("dahab-windsurf-sail-control.webp"), "Объяснение управления парусом перед уроком Виндсёрфинг", 1254, 1254],
    ["02", "Первые галсы", "На спокойной воде учимся вставать на доску, набирать ход и двигаться выбранным курсом.", windsurfSectionImg("dahab-windsurf-first-tacks.webp"), "Первые галсы на виндсёрфе в лагуне Дахаба", 1600, 1600],
    ["03", "Повороты и контроль", "Отрабатываем развороты, управление скоростью и возвращение к точке старта без помощи инструктора.", windsurfSectionImg("dahab-windsurf-turn-control.webp"), "Обучение поворотам на виндсёрфе", 1600, 1600],
    ["04", "Глиссирование и прогресс", "После освоения базы переходим к трапеции, петлям, глиссированию и более скоростному оборудованию.", windsurfSectionImg("dahab-windsurf-planing-progress.webp"), "Глиссирование на виндсёрфе в Дахабе", 720, 720]
  ];
  const prices = [
    ["Урок", "Урок Виндсёрфинг", "$70", "Индивидуальное занятие с инструктором для новичков и продолжающих.", "Записаться"],
    ["Детский", "Детский урок Виндсёрфинг", "от $55", "Легкий парус, спокойный темп и инструктор рядом.", "Записаться"],
    ["Программа", "Программа для новичка", "от $95", "Для тех, кто приезжает научиться кататься с понятным планом.", "Подобрать программу"],
    ["Прокат", "Прокат", "от 25$", "Для самостоятельного катания с подбором доски и паруса.", "Оставить заявку"]
  ];
  const waterPhotos = [
    [windsurfWaterImg("dahab-windsurf-planing.webp"), "Глиссирование на виндсёрфе в Дахабе", 1080, 720],
    [windsurfWaterImg("dahab-windsurf-foil-speed.webp"), "Виндсёрфинг на фойле в акватории Дахаба", 1080, 720],
    [windsurfWaterImg("dahab-windsurf-sail-control-closeup.webp"), "Контроль паруса во время катания на виндсёрфе", 1080, 720],
    [windsurfWaterImg("dahab-windsurf-speedy-session.webp"), "Два виндсёрфера в скоростной зоне Спиди", 1080, 720],
    [windsurfWaterImg("dahab-windsurf-lagoon-ride.webp"), "Катание на виндсёрфе в лагуне Дахаба", 1600, 1067]
  ];
  const stationPhotos = [
    [dahabRefImg("bg-swiss.webp"), "Свисс Инн", "Готовим доски и паруса к новому ветровому дню", "Станция виндсёрфинга Свисс Инн Ветратория", 1600, 1067],
    [dahabRefImg("bg-ganet.webp"), "Ганет Синай", "Встречаемся на станции и выбираем формат катания", "Станция виндсёрфинга Ганет Синай Ветратория", 1600, 1067],
    ["/assets/img/media/dahab/photo-day/2026-05-24-photo-day/47.jpg", "Подготовка", "Настраиваем парус под райдера и текущий ветер", "Подготовка виндсёрф-снаряжения перед занятием", 1080, 720],
    [windsurfSectionImg("dahab-windsurf-sail-control.webp"), "Обучение", "Разбираем управление парусом до выхода", "Инструктор объясняет управление виндсёрф-парусом", 1254, 1254],
    [windsurfSectionImg("dahab-windsurf-first-tacks.webp"), "Первые галсы", "Инструктор рядом, пока движения становятся уверенными", "Первые галсы ученика на Виндсёрфинг в Дахабе", 1600, 1600],
    [windsurfWaterImg("dahab-windsurf-speedy-session.webp"), "Спиди", "Выходим на скорость и тренируем технику вместе", "Два виндсёрфера в зоне Спиди", 1080, 720],
    [windsurfWaterImg("dahab-windsurf-planing.webp"), "Прогресс", "Возвращаемся за следующим парусом и новой задачей", "Глиссирование на Виндсёрфинг в Дахабе", 1080, 720],
    ["/assets/img/media/dahab/photo-day/2026-05-24-photo-day/46.jpg", "После катания", "Отдыхаем, общаемся и планируем следующий выход", "Гости станции виндсёрфинга общаются после катания", 1080, 720]
  ];
  const reviews = dahabReviewItems;
  const faqs = [
    ["Можно ли начать с нуля?", "Да. Начинаем с берега и простых упражнений на воде: стойка, парус, курс и разворот."],
    ["Что входит в урок?", "Инструктор, подбор доски и паруса, объяснение зоны катания, практика на воде и обратная связь."],
    ["Когда можно брать прокат?", "Когда вы уверенно стартуете, возвращаетесь к берегу и понимаете правила акватории. Команда подскажет подходящий комплект."],
    ["Подходит ли виндсёрфинг детям?", "Да, для детей есть отдельный формат Детский виндсёрфинг с легким снаряжением и спокойным темпом."],
    ["Где проходят занятия?", "В зависимости от ветра и уровня занятия проходят на станциях Ветратории в Дахабе, чаще Свисс Инн или Ганет Синай."]
  ];
  const useful = [
    ["/dahab/blog/windsurf/", "Виндсёрфинг", "Как начать Виндсёрфинг с нуля", dahabRefImg("windsurf-hero.webp")],
    ["/dahab/windsurf/price/", "Цены", "Уроки, прокат и программы виндсёрфинга", dahabRefImg("price-windsurf.webp")],
    ["/dahab/stations/", "Станции", "Где кататься на виндсёрфинге в Дахабе", dahabRefImg("bg-swiss.webp")]
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
      <img src="${page.image}" alt="Виндсёрфинг в Дахабе на Красном море" width="1600" height="1067" loading="eager" decoding="async" fetchpriority="high">
    </figure>
  </div>
</section>

${seasonSection([countriesByKey.dahab], {
  compact: true,
  eyebrow: "Дахаб · условия для виндсёрфинга",
  title: "Сезон и ветер",
  lead: countriesByKey.dahab.seasonNote
})}

<section class="dahab-sport-section dahab-sport-section--location">
  <div class="dahab-sport-inner">
    ${sectionHeading("Локация", "Почему Дахаб подходит для виндсёрфинга", "Учебная лагуна, стабильный ветер и несколько зон катания позволяют начать с нуля и постепенно перейти к глиссированию, скорости и открытому морю.")}
    ${sportFeatureGrid(reasons, { atlas: true, leadImage: page.image, leadAlt: "Виндсёрфинг в Дахабе на Красном море" })}
  </div>
</section>

<section class="dahab-sport-section dahab-sport-section--soft">
  <div class="dahab-sport-inner">
    ${sectionHeading("Обучение", "Как проходит обучение виндсёрфингу", "Обучение строится поэтапно: управление парусом на берегу, первые галсы в лагуне, повороты и переход к уверенному катанию.")}
    <div class="dahab-sport-process">
      ${learning.map(([number, title, text, image, alt, width, height]) => `
        <article>
          <img src="${image}" alt="${alt}" width="${width}" height="${height}" loading="lazy" decoding="async">
          <div><span>${number}</span><h3>${title}</h3><p>${text}</p></div>
        </article>`).join("")}
    </div>
  </div>
</section>

<section class="dahab-sport-section">
  <div class="dahab-sport-inner">
    ${sectionHeading("Цены", "Цены на виндсёрфинг", "Можно взять разовый урок, детское занятие, прокат или собрать программу на несколько дней под ваши даты и уровень.")}
    <div class="dahab-sport-price-grid">
      ${prices.map(([label, title, value, text, cta]) => `
        <article class="dahab-sport-price-card">
          <small>${label}</small>
          <h3>${title}</h3>
          <b>${value}</b>
          <p>${text}</p>
          ${contactCta(page, cta, "button button-primary", label === "Детский" ? "windsurf-kids" : "windsurf")}
        </article>`).join("")}
    </div>
    <div class="dahab-sport-price-actions">
      <a class="button button-ghost" href="/dahab/windsurf/price/">Цены на виндсёрфинг</a>
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
        <span>Понятная зона катания и спасение</span>
      </div>
      <a class="button button-primary" href="/dahab/safety/">Подробнее</a>
    </div>
    <div class="dahab-sport-safety__media">
      <img src="${wingfoilSectionImg("rescue-boats.webp")}" alt="Спасательные катера на берегу станции Ветратория" width="1920" height="1080" loading="lazy" decoding="async">
    </div>
  </div>
</section>

<section class="dahab-sport-section">
  <div class="dahab-sport-inner">
    ${sectionHeading("Медиа", "Виндсёрфинг на воде", "")}
    <div class="dahab-sport-water-grid">
      ${waterPhotos.map(([image, alt, width, height], index) => `
        <a${index === 0 ? ` class="is-large"` : ""} href="/media/dahab/" aria-label="Открыть медиа Дахаба">
          <img src="${image}" alt="${alt}" width="${width}" height="${height}" loading="lazy" decoding="async">
        </a>`).join("")}
    </div>
    <div class="dahab-sport-water-actions">
      <a class="button button-primary" href="/media/dahab/">Смотреть медиа</a>
    </div>
  </div>
</section>

${sportStationLife({
  id: "windsurf-station-life",
  eyebrow: "Жизнь Станций",
  title: "Свисс Инн и Ганет Синай: день вокруг ветра",
  lead: "Подбираем доску и парус, разбираем задачу, выходим в лагуну или Спиди, а после катания обсуждаем технику и следующий шаг.",
  photos: stationPhotos
})}

<section class="dahab-sport-section dahab-sport-section--soft dahab-sport-reviews" id="reviews">
  <div class="dahab-sport-inner">
    <div class="dahab-sport-reviews__head">
      <div>
        <p class="eyebrow">Отзывы</p>
        <h2>Что говорят гости</h2>
      </div>
      <a href="https://www.tripadvisor.com/" target="_blank" rel="noopener">144 отзыва →</a>
    </div>
    <div class="dahab-sport-review-track" aria-label="Отзывы гостей Ветратории в Дахабе">
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

<section class="dahab-sport-section dahab-sport-section--faq" id="faq">
  <div class="dahab-sport-inner">
    ${sportFaqBlock("Частые вопросы", "Частые вопросы", "", faqs)}
  </div>
</section>

<section class="dahab-sport-section">
  <div class="dahab-sport-inner">
    ${sectionHeading("Материалы", "Полезное о виндсёрфинге", "")}
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
  <img src="${page.image}" alt="Виндсёрфинг в Дахабе на воде" width="1600" height="1067" loading="lazy" decoding="async">
  <div class="dahab-sport-cta__inner">
    <p class="eyebrow">Заявка</p>
    <h2>Хотите попробовать виндсёрфинг в Дахабе?</h2>
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
    ["Спорт с понятного старта", "Новички знакомятся с ветром, доской и парусом в спокойном темпе, а продолжающие развивают технику.", wskImg("water-02.jpg"), "Юный спортсмен Детский виндсёрфинг на виндсёрфе"],
    ["Профессиональная команда", "С детьми работают тренеры с опытом в парусном спорте и отдельным вниманием к возрасту каждого участника.", wskImg("hero.webp"), "Тренер проводит занятие для участников Детский виндсёрфинг"],
    ["Безопасность на воде", "Акваторию контролирует команда спасателей, а оборудование подбирается под рост, вес и уровень ребёнка.", wskImg("water-01.jpg"), "Участники Детский виндсёрфинг готовят оборудование на берегу"],
    ["Лагерь, а не только уроки", "В программе есть спорт, снорклинг, прогулки по горам, игры, экскурсии и время с новыми друзьями.", wskImg("camp-03.webp"), "Поход участников Детский виндсёрфинг в Синайских горах"]
  ];
  const program = [
    ["01", "Виндсёрфинг", "Стойка, управление парусом, выбор курса и первые самостоятельные галсы.", wskImg("water-02.jpg"), "Юный спортсмен Детский виндсёрфинг катается на виндсёрфе в Дахабе"],
    ["02", "Виндфойл и вингфойл", "Знакомство с современными фойл-дисциплинами для детей, готовых двигаться дальше.", wskImg("water-03.jpg"), "Участник программы детского виндсёрфинга со снаряжением на станции в Дахабе"],
    ["03", "Спорт и приключения", "Командные игры, снорклинг на рифах, прогулки по горам и поездки по Дахабу.", wskImg("camp-03.webp"), "Поход участников Детский виндсёрфинг в горах рядом с Дахабом"],
    ["04", "Командная жизнь", "Совместные занятия помогают стать самостоятельнее, увереннее и найти новых друзей.", wskImg("camp-01.webp"), "Участники детского лагеря детского виндсёрфинга на станции Ветратория"]
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
    ["С какого возраста принимают детей?", "Детский виндсёрфинг принимает детей с 6 лет. Конкретный формат подбирается с учётом возраста, физической подготовки и опыта на воде."],
    ["Можно приехать без родителей?", "Да. Организаторы помогают согласовать сопровождение ребёнка или встречу в аэропорту. Детали необходимо заранее подтвердить с командой лагеря."],
    ["Нужно ли своё оборудование?", "Нет. Оборудование для заявленных тренировочных форматов предоставляется лагерем и подбирается под участника."],
    ["Где живут дети?", "Участники размещаются по 2–3 человека в отель «Каньон Дахаб». Вместе с ними проживают тренеры, администраторы и аниматоры лагеря."],
    ["Что нужно взять с собой?", "Понадобятся медицинская страховка, одежда и обувь для спорта и отдыха, головной убор, солнцезащитный крем и личные вещи. Полный список размещён на официальном сайте."],
    ["Где проверить актуальные цены и даты?", "Все условия, свободные места, стоимость и детали трансфера нужно уточнять напрямую у организаторов Детский виндсёрфинг."]
  ];
  const useful = [
    ["https://windsurfkids.su/team", "Команда", "Тренеры и спасатели Детский виндсёрфинг", wskImg("hero.webp")],
    ["https://windsurfkids.su/parrents", "Родителям", "Документы, сопровождение и список вещей", wskImg("camp-02.webp")],
    ["https://windsurfkids.su/price", "Форматы", "Актуальные программы и стоимость", wskImg("water-01.jpg")]
  ];
  const gallery = [
    [wskImg("water-02.jpg"), "Юный виндсёрфер Детский виндсёрфинг на Красном море"],
    [wskImg("water-01.jpg"), "Дети готовят оборудование к тренировке"],
    [wskImg("water-04.jpg"), "Инструктор и участник Детский виндсёрфинг готовятся к тренировке на закате"],
    [wskImg("camp-04.webp"), "Участница Детский виндсёрфинг готовит снаряжение на берегу"],
    [wskImg("camp-05.webp"), "Группа детского виндсёрфинга с тренерами на станции Ветратория"]
  ];

  return `
<section class="dahab-hero dahab-hero--kids">
  <img class="dahab-hero__image" src="${page.image}" alt="Тренер с участниками детского лагеря детского виндсёрфинга в Дахабе" width="1080" height="1080" loading="eager" decoding="async" fetchpriority="high">
  <div class="dahab-hero__shade"></div>
  <div class="dahab-hero__content">
    <p class="eyebrow">Дахаб · детский спортивный лагерь</p>
    <h1>Детский лагерь <span>Детский виндсёрфинг</span> в Дахабе</h1>
    <p class="hero-lead">${escapeHtml(page.description)} Летняя программа 2026 года проходит с 27 мая по 30 августа.</p>
    <div class="hero-advantages">
      ${heroFacts.map((item) => `<span class="hero-advantage">${item}</span>`).join("")}
    </div>
    <div class="hero-actions dahab-hero-actions">
      <a class="button button-primary" href="${officialSite}" target="_blank" rel="noopener noreferrer">Перейти на сайт Детский виндсёрфинг</a>
      <a class="button button-ghost" href="#program">Узнать о программе</a>
    </div>
  </div>
</section>

<section class="dahab-sport-section">
  <div class="dahab-sport-inner">
    ${sectionHeading("О лагере", "Детский виндсёрфинг — лето, которое проходит на воде", "Лагерь работает с 2009 года, а с 2012 года принимает детей в Дахабе. За это время программу прошли более 500 юных виндсёрферов.")}
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
      <img src="${wskImg("camp-01.webp")}" alt="Детская группа Детский виндсёрфинг с тренерами" width="766" height="766" loading="lazy" decoding="async">
    </div>
  </div>
</section>

<section class="dahab-sport-section dahab-sport-section--soft">
  <div class="dahab-sport-inner dahab-sport-safety">
    <div class="dahab-sport-safety__copy">
      <p class="eyebrow">Проживание</p>
      <h2>отель «Каньон Дахаб»</h2>
      <p>Дети размещаются в светлых номерах по 2–3 человека. В отеле вместе с ними живут тренеры, администраторы и аниматоры, отвечающие за повседневный распорядок.</p>
      <div class="dahab-sport-safety__list">
        <span>Трёхразовое сбалансированное питание</span>
        <span>Бассейн и спортивные площадки рядом</span>
        <span>Медицинская помощь в шаговой доступности</span>
      </div>
      <a class="button button-primary" href="https://windsurfkids.su/hotel" target="_blank" rel="noopener noreferrer">Подробнее о проживании</a>
    </div>
    <div class="dahab-sport-safety__media">
      <img src="${wskImg("hotel-01.jpg")}" alt="отель «Каньон Дахаб» — место проживания участников лагеря" width="1024" height="446" loading="lazy" decoding="async">
    </div>
  </div>
</section>

<section class="dahab-sport-section">
  <div class="dahab-sport-inner">
    ${sectionHeading("Фотографии", "Жизнь детского виндсёрфинга в Дахабе", "Тренировки, командные занятия и приключения между Красным морем и Синайскими горами. Фотографии опубликованы официальным сайтом детского виндсёрфинга.")}
    <div class="dahab-sport-water-grid">
      ${gallery.map(([image, alt], index) => `
        <a${index === 0 ? ` class="is-large"` : ""} href="https://windsurfkids.su/photos" target="_blank" rel="noopener noreferrer" aria-label="Открыть фотографии на сайте Детский виндсёрфинг">
          <img src="${image}" alt="${alt}" width="1080" height="1080" loading="lazy" decoding="async">
        </a>`).join("")}
    </div>
    <div class="dahab-sport-water-actions">
      <a class="button button-primary" href="https://windsurfkids.su/photos" target="_blank" rel="noopener noreferrer">Больше фотографий</a>
    </div>
  </div>
</section>

<section class="dahab-sport-section dahab-sport-section--faq" id="faq">
  <div class="dahab-sport-inner">
    ${sportFaqBlock("Родителям", "Частые вопросы перед поездкой", "", faqs)}
  </div>
</section>

<section class="dahab-sport-section">
  <div class="dahab-sport-inner">
    ${sectionHeading("Официальная информация", "Полезные разделы Детский виндсёрфинг", "")}
    <div class="dahab-sport-useful">
      ${useful.map(([href, label, title, image]) => `
        <a href="${href}" target="_blank" rel="noopener noreferrer">
          <img src="${image}" alt="${title}" width="1080" height="1080" loading="lazy" decoding="async">
          <span>${label}</span>
          <h3>${title}</h3>
          <em>Открыть на Детский виндсёрфинг</em>
        </a>`).join("")}
    </div>
  </div>
</section>

<section class="dahab-sport-cta">
  <img src="${wskImg("camp-03.webp")}" alt="Поход участников Детский виндсёрфинг в Синайских горах" width="1080" height="1080" loading="lazy" decoding="async">
  <div class="dahab-sport-cta__inner">
    <p class="eyebrow">Летний сезон 2026</p>
    <h2>Готовы подарить ребёнку лето на воде?</h2>
    <p>Актуальные даты, стоимость и наличие мест уточняйте напрямую у команды Детский виндсёрфинг. Лагерь является самостоятельным организатором программы.</p>
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
    ["Документы", "Возьмите распечатку электронную визу, если оформляли её онлайн, бронь проживания и страховой полис."]
  ];
  const faqs = [
    ["Какой аэропорт выбирать?", "Удобнее всего прилетать в международный аэропорт Шарм-эль-Шейха. От него до Дахаба около 100 км."],
    ["Сколько занимает трансфер?", "Обычно дорога занимает от одного до полутора часов. Время зависит от трафика, остановок и прохождения контрольных пунктов."],
    ["Можно ли заказать машину для группы?", "Да. В зависимости от количества пассажиров организуем легковой автомобиль или микроавтобус. Сообщите состав группы и объём багажа заранее."],
    ["Можно ли перевезти спортивное оборудование?", "Да, но габариты снаряжения нужно указать при заказе, чтобы мы подобрали подходящий автомобиль."],
    ["Нужна ли виза для поездки в Дахаб?", "Для короткой поездки только по курортам Южного Синая обычно доступен бесплатный штамп. Для более длительного отдыха или поездок по остальному Египту нужна туристическая виза."],
    ["Где проверять актуальные правила?", "Используйте официальный портал электронных виз Египта и требования вашей авиакомпании. Окончательное решение о въезде принимает пограничная служба Египта."]
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
      <img src="${dahabRefImg("bg-ganet.webp")}" alt="Станция Ветратория Ганет Синай в Дахабе" width="1600" height="1067" loading="lazy" decoding="async">
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
      <a class="button button-primary" href="https://www.visa2egypt.gov.eg/eVisa/Home" target="_blank" rel="noopener noreferrer">Официальный портал электронных виз Египта</a>
    </div>
  </div>
</section>

<section class="dahab-sport-section dahab-sport-section--soft">
  <div class="dahab-sport-inner">
    ${sectionHeading("Перед вылетом", "Что подготовить для спокойной встречи", "")}
    <div class="dahab-sport-feature-grid">
      ${preparation.map(([title, text], index) => `<article><span>0${index + 1}</span><h3>${title}</h3><p>${text}</p></article>`).join("")}
    </div>
  </div>
</section>

<section class="dahab-sport-section dahab-sport-section--faq" id="faq">
  <div class="dahab-sport-inner">
    ${sportFaqBlock("Частые вопросы", "Частые вопросы о дороге", "", faqs)}
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
    ["Вингфойл", "Индивидуальный урок", "70$", "Инструктор, полный комплект, спасательная поддержка и страховка снаряжения.", dahabRefImg("price-wingfoil.webp"), "/dahab/wingfoil/price/"],
    ["Подготовка к Вингфойл", "Фойл за лодкой", "60$", "Отдельно тренируем баланс и контроль высоты — без необходимости одновременно управлять крылом.", dahabRefImg("price-foil-boat.webp"), "/dahab/wingfoil/price/"],
    ["Виндсёрфинг", "Индивидуальный урок", "70$", "Инструктор, доска, парус, спасательная поддержка и страховка снаряжения.", dahabRefImg("price-windsurf.webp"), "/dahab/windsurf/price/"],
    ["Детский виндсёрфинг", "Детский урок", "от 55$", "Лёгкий парус, подходящая доска, инструктор рядом и спокойный темп.", dahabRefImg("price-kids.webp"), "https://windsurfkids.su/"]
  ];
  const stations = [
    ["Винг-центр", "Только вингфойл", dahabRefImg("bg-wingfoil-station.webp")],
    ["Свисс Инн", "Виндсёрфинг", dahabRefImg("bg-swiss.webp")],
    ["Ганет Синай", "Виндсёрфинг", dahabRefImg("bg-ganet.webp")]
  ];
  const learningSteps = [
    ["01", "Определяем вашу точку старта", "Уточняем опыт, цель и самочувствие, смотрим ветер и подбираем комплект по весу и уровню."],
    ["02", "Разбираем управление и безопасность", "На берегу объясняем стойку, работу крыла или паруса, границы зоны и действия в нештатной ситуации."],
    ["03", "Отрабатываем задачу с инструктором", "На воде инструктор даёт короткие корректировки и меняет упражнение, когда навык уже получается стабильно."],
    ["04", "Переходим к самостоятельной практике", "После первого–второго занятия многие уже отрабатывают базу самостоятельно в подходящей зоне под наблюдением спасательной команды."]
  ];
  const lessonIncludes = [
    ["Инструктор", "Персональная задача и обратная связь по ходу занятия."],
    ["Снаряжение", "Доска, парус или крыло под ваш уровень и текущий ветер."],
    ["4 спасательных катера", "Команда контролирует акваторию во время занятий и практики."],
    ["Страховка снаряжения", "Включена в урок — можно сосредоточиться на обучении."]
  ];
  const dahabFaqs = [
    ["Сколько занятий нужно до первых самостоятельных метров?", "После первого–второго занятия многие уже могут выходить на воду и отрабатывать базовые элементы самостоятельно под наблюдением спасательной команды. Точный момент зависит от ветра, выбранного спорта и уверенности ученика."],
    ["Есть ли программа на 3–5 дней?", "Да. Можно сочетать уроки и самостоятельную практику с прокатом. Наполнение программы подбираем по уровню, а актуальную стоимость смотрите на страницах цен Вингфойл и Виндсёрфинг."],
    ["Можно ли рассчитывать на первые полёты за несколько занятий?", "У многих первые контролируемые полёты на вингфойл получаются за несколько дней. Мы говорим об этом честно: скорость прогресса зависит от ветра, физической подготовки, предыдущего опыта и времени на самостоятельную практику."],
    ["Что входит в стоимость урока?", "Инструктор, подходящее снаряжение, спасательная поддержка и страховка снаряжения. Перед оплатой команда подтвердит продолжительность и состав выбранного формата."]
  ];
  const reviews = dahabReviewItems;
  const stationLifePhotos = [
    [img("vetratoria-station-team.webp"), "Люди", "Команда и гости рядом — до выхода и после катания", "Гости и команда Ветратории у станции в Дахабе", 1600, 900],
    ["/assets/img/media/dahab/photo-day/2026-05-24-photo-day/47.jpg", "Подготовка", "Настраиваем снаряжение вместе", "Подготовка виндсёрф-снаряжения перед занятием в Дахабе", 1080, 720],
    ["/assets/img/media/dahab/photo-day/2026-06-07-photo-day/01.jpg", "На берегу", "Улыбки перед новым выходом", "Гостья Ветратории улыбается перед занятием на воде", 1080, 720],
    ["/assets/img/media/dahab/photo-day/2026-06-07-photo-day/04.jpg", "Обучение", "Инструктор рядом на первых шагах", "Инструктор помогает ученику подготовиться к занятию", 1080, 720],
    ["/assets/img/media/dahab/photo-day/2026-06-07-photo-day/09.jpg", "Команда", "Возвращаемся на берег вместе", "Гости Ветратории возвращаются после занятия", 1080, 720],
    ["/assets/img/media/dahab/photo-day/2026-06-03-photo-day/02.jpg", "Снаряжение", "Собираем комплект под человека и ветер", "Подбор и настройка виндсёрф-снаряжения в Дахабе", 1080, 720],
    ["/assets/img/media/dahab/photo-day/2026-05-24-photo-day/45.jpg", "После воды", "Отдыхаем и делимся впечатлениями", "Райдер после катания у станции Ветратория", 1080, 720],
    ["/assets/img/media/dahab/photo-day/2026-05-24-photo-day/46.jpg", "Атмосфера", "Обсуждаем катание и следующий выход", "Гости общаются между выходами на воду", 1080, 720]
  ];

  return `
<section class="dahab-hero">
  <img class="dahab-hero__image" src="${dahabRefImg("ganet-sinai.webp")}" alt="Дахаб: Вингфойл и Виндсёрфинг на Красном море" width="1600" height="1067" fetchpriority="high">
  <div class="dahab-hero__shade"></div>
  <div class="dahab-hero__content">
    <p class="eyebrow">Египет · Дахаб</p>
    <h1>Вингфойл и Виндсёрфинг в Дахабе</h1>
    <p class="hero-lead">Обучение и прокат на Красном море для новичков и опытных райдеров. Подберём программу, инструктора и снаряжение под ваш уровень.</p>
    <div class="hero-advantages"><span class="hero-advantage">С 2006 года</span><span class="hero-advantage">Условия для любого уровня</span><span class="hero-advantage hero-advantage--nowrap">10&nbsp;000+&nbsp;учеников</span><span class="hero-advantage">4 спасательных катера</span></div>
    <div class="hero-actions dahab-hero-actions">
      ${contactCta(page, "Подобрать программу")}
      <a class="button button-ghost" href="#prices">Посмотреть цены</a>
    </div>
  </div>
</section>

<section class="dahab-marquee" aria-label="Ветратория в Дахабе">
  <div class="dahab-marquee__track">
    <span>ДАХАБ · ВЕТЕР КРУГЛЫЙ ГОД / УРОК ВИНГФОЙЛА — 70$ / УРОК ВИНДСЁРФИНГА — 70$ / ДЕТСКИЙ УРОК — ОТ 55$ / ПРОКАТ — ОТ 25$ / 4 СПАСАТЕЛЬНЫХ КАТЕРА / SWISS INN / GANET SINAI / WING CENTER / </span>
    <span aria-hidden="true">ДАХАБ · ВЕТЕР КРУГЛЫЙ ГОД / УРОК ВИНГФОЙЛА — 70$ / УРОК ВИНДСЁРФИНГА — 70$ / ДЕТСКИЙ УРОК — ОТ 55$ / ПРОКАТ — ОТ 25$ / 4 СПАСАТЕЛЬНЫХ КАТЕРА / SWISS INN / GANET SINAI / WING CENTER / </span>
  </div>
</section>

${seasonSection([countriesByKey.dahab], {
  compact: true,
  eyebrow: "Дахаб · сезон и ветер",
  title: "Когда ехать в Дахаб",
  lead: countriesByKey.dahab.seasonNote
})}

<section class="sport-split" id="sport">
  <div class="sport-split__inner">
    <header class="section-heading">
      <p class="eyebrow">Выберите спорт</p>
      <h2>Выберите свой спорт</h2>
    </header>
    <div class="sport-split__grid">
      <a class="sport-tile" href="/dahab/wingfoil/" aria-label="Открыть страницу вингфойла в Дахабе">
        <img src="${dahabRefImg("choose-wingfoil.webp")}" alt="Вингфойл в Дахабе" width="1600" height="1067" loading="lazy" decoding="async">
        <div class="sport-tile__content">
          <h2>Вингфойл</h2>
          <span>Подробнее</span>
        </div>
      </a>
      <a class="sport-tile" href="/dahab/windsurf/" aria-label="Открыть страницу виндсёрфинга в Дахабе">
        <img src="/assets/img/final/windsurf/hero.webp" alt="Виндсёрфинг в Дахабе" width="1920" height="1280" loading="eager" decoding="async">
        <div class="sport-tile__content">
          <h2>Виндсёрфинг</h2>
          <span>Подробнее</span>
        </div>
      </a>
    </div>
    <a class="wsk-strip" href="https://windsurfkids.su/" target="_blank" rel="noopener noreferrer">
      <span class="wsk-strip__media"><img src="${dahabRefImg("wsk-2.webp")}" alt="Детский виндсёрфинг в Дахабе" width="1090" height="600" loading="lazy" decoding="async"></span>
      <span class="wsk-strip__content"><small>Детский виндсёрфинг · Дахаб</small><b>WINDSURFKIDS</b><em>Детский спортивный лагерь Детский виндсёрфинг существует с 2009 года, а с 2012 года базируется в Дахабе. Спорт, друзья, творчество и безопасная акватория.</em></span>
      <span class="wsk-strip__button">Сайт лагеря</span>
    </a>
  </div>
</section>

<section class="dahab-learning" id="learning">
  <div class="dahab-inner">
    <div class="dahab-learning__layout">
      <div class="dahab-learning__journey">
        <header class="dahab-learning__heading">
          <p class="eyebrow">Обучение</p>
          <h2>От первого знакомства до самостоятельной практики</h2>
          <p>Мы не обещаем одинаковый результат всем. Строим занятия так, чтобы каждый следующий шаг опирался на уже контролируемый навык.</p>
        </header>
        <ol class="dahab-learning__steps">
          ${learningSteps.map(([number, title, text]) => `<li><span>${number}</span><div><h3>${title}</h3><p>${text}</p></div></li>`).join("")}
        </ol>
      </div>
      <aside class="dahab-learning__side">
        <figure class="dahab-learning__media">
          <img src="${stationLifePhotos[3][0]}" alt="${escapeHtml(stationLifePhotos[3][3])}" width="${stationLifePhotos[3][4]}" height="${stationLifePhotos[3][5]}" loading="lazy" decoding="async">
        </figure>
        <div class="dahab-learning__included">
          <header><p class="eyebrow">В урок уже входит</p><h3>Можно приехать без своего снаряжения</h3></header>
          <div>
            ${lessonIncludes.map(([title, text]) => `<article><strong>${title}</strong><p>${text}</p></article>`).join("")}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="dahab-safety-spotlight" aria-labelledby="dahab-safety-spotlight-title">
  <a class="dahab-safety-spotlight__inner" href="/dahab/safety/">
    <span class="dahab-safety-spotlight__media">
      <img src="${wingfoilSectionImg("rescue-boats.webp")}" alt="Спасательные катера Ветратории на берегу в Дахабе" width="1920" height="1080" loading="lazy" decoding="async">
    </span>
    <span class="dahab-safety-spotlight__content">
      <small>Безопасность на воде</small>
      <b id="dahab-safety-spotlight-title">4 спасательных катера</b>
      <em>Катера поддерживают три станции и помогают быстро вернуться на берег, если ветер ослабнет, сломается снаряжение или потребуется помощь.</em>
      <strong>Как устроена безопасность <span aria-hidden="true">→</span></strong>
    </span>
  </a>
</section>

<section class="water-area" id="water-area" aria-labelledby="water-area-title">
  <div class="water-area__inner">
    <header class="water-area__intro" data-reveal="line">
      <div>
        <p class="eyebrow">Акватория</p>
        <h2 id="water-area-title">От первых метров в лагуне до открытого моря</h2>
      </div>
      <div>
        <p>Акватория Дахаба разделена на три отдельные зоны. У каждой свой рельеф воды и характер катания — от закрытой учебной лагуны до волн открытого моря.</p>
        <p class="water-area__route" aria-label="Маршрут по акватории: Лагуна, затем Спиди, затем Камикадзе"><span>Лагуна</span><b aria-hidden="true">→</b><span>Спиди</span><b aria-hidden="true">→</b><span>Камикадзе</span></p>
      </div>
    </header>
    <div class="water-area__layout">
      <figure class="water-area__visual">
        <img src="${dahabRefImg("aqva-aerial.webp")}" alt="Три отдельные зоны акватории Дахаба: лагуна, Спиди и Камикадзе" width="900" height="1200" loading="lazy" decoding="async">
      </figure>
      <div class="water-area__cards">
        <article data-reveal="line"><span aria-hidden="true">01</span><div><strong>Лагуна</strong><small>Закрытая учебная зона</small><p>Лагуна защищена берегом и подходит для учеников: здесь спокойнее вода, проще отрабатывать первые старты, баланс и базовую технику.</p></div></article>
        <article data-reveal="line"><span aria-hidden="true">02</span><div><strong>Спиди</strong><small>Гладкая скоростная зона</small><p>Спиди отделена от открытого моря косой. Благодаря этому вода остаётся гладкой при разных направлениях ветра — здесь уверенные райдеры разгоняются и отрабатывают технику на скорости.</p></div></article>
        <article data-reveal="line"><span aria-hidden="true">03</span><div><strong>Камикадзе</strong><small>Открытое море и волны</small><p>Камикадзе находится уже за защищённой частью акватории. Это отдельная зона открытого моря с волной для самостоятельных опытных райдеров.</p></div></article>
      </div>
    </div>
  </div>
</section>

<section class="dahab-section compact-band" id="prices">
  <div class="dahab-inner">
    ${sectionHeading("Цены", "Сколько стоит начать", "В стоимость урока входят инструктор, подходящее снаряжение, спасательная поддержка и страховка снаряжения.")}
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
      <div><b>Хотите заниматься 3–5 дней?</b><p>Соберём программу из уроков и самостоятельной практики. Первые полёты часто получаются за несколько дней, но темп всегда индивидуален.</p></div>
      <nav>${contactCta(page, "Оставить заявку", "", null)}<a href="/dahab/wingfoil/price/">Цены на вингфойл</a><a href="/dahab/windsurf/price/">Цены на виндсёрфинг</a></nav>
    </div>
  </div>
</section>

${stationLifeGallery({
  id: "station-life",
  eyebrow: "Жизнь станции",
  title: "Место, куда приезжают кататься — и остаются за атмосферой",
  lead: "День начинается с прогноза и подбора комплекта, продолжается на воде, а заканчивается разговорами о новых элементах и следующем выходе.",
  photos: stationLifePhotos
})}

<section class="trust-block" id="team-reviews">
  <div class="trust-block__inner">
    <header class="trust-head">
      <p class="eyebrow">144 актуальных отзыва</p>
      <h2>Что говорят гости Ветратории</h2>
    </header>
    <section class="trust-slider trust-slider--reviews" aria-label="Отзывы гостей Ветратории в Дахабе">
      <div class="trust-slider__top">
        <div><span>Отзывы</span><h3>О школе и команде</h3></div>
        <a href="https://www.tripadvisor.ru/Attraction_Review-g297547-d9806047-Reviews-Vetratoria_Windsurfing_SUP_Centre-Dahab_South_Sinai_Red_Sea_and_Sinai.html" target="_blank" rel="noopener">144 отзыва →</a>
        <div class="trust-slider__controls"><button type="button" data-trust-prev="reviews" aria-label="Предыдущие отзывы">‹</button><button type="button" data-trust-next="reviews" aria-label="Следующие отзывы">›</button></div>
      </div>
      <div class="trust-track trust-track--reviews" data-trust-track="reviews">
        ${reviews.map(([initial, name, stars, text]) => `<article class="trust-card trust-card--review"><div class="trust-review__top"><span>${initial}</span><div><strong>${name}</strong><small>${stars}</small></div></div><p>«${text}»</p></article>`).join("")}
      </div>
    </section>
  </div>
</section>

<section class="station-advice" id="stations">
  <header class="station-advice__head">
    <p class="eyebrow">Станции</p>
    <h2>3 станции в Дахабе</h2>
  </header>
  <div class="station-advice__list">
    ${stations.map(([title, meta, image]) => `<a href="/dahab/stations/">
        <figure><img src="${image}" alt="${title}" width="1600" height="1067" loading="lazy" decoding="async"></figure>
        <div>
          <span>${meta}</span>
          <b>${title}</b>
        </div>
      </a>`).join("")}
  </div>
  ${contactCta(page, "Написать нам", "station-advice__cta")}
</section>

<section class="dahab-faq-section" id="faq">
  <div class="dahab-inner">
    <div class="dahab-faq-section__layout">
      <header class="dahab-faq-section__intro">
        <p class="eyebrow">Перед записью</p>
        <h2>Честные ответы о сроках и результате</h2>
        <p>Ветер и обучение нельзя подогнать под одно обещание. Ниже — ориентиры, по которым действительно можно планировать поездку.</p>
      </header>
      <div class="dahab-faq-section__accordion" data-exclusive-accordion aria-label="Частые вопросы перед записью">
        ${dahabFaqs.map(([question, answer], index) => `<details class="dahab-faq-section__item" ${index === 0 ? "open" : ""}>
          <summary aria-expanded="${index === 0 ? "true" : "false"}"><span class="dahab-faq-section__number" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span><span>${question}</span></summary>
          <p>${answer}</p>
        </details>`).join("")}
      </div>
    </div>
    <div class="price-help-cta dahab-faq-section__cta">
      <div><b>Подберём программу под ваши даты</b><p>Оставьте имя и телефон или напишите в WhatsApp / Telegram. Ответим по формату, стоимости и свободному времени.</p></div>
      <nav>${contactCta(page, "Оставить заявку", "", null)}<a href="/dahab/contacts/">Все контакты</a></nav>
    </div>
  </div>
</section>`;
};

const vietnamHomePage = (page) => {
  const vietnamImg = (name) => `/assets/img/vietnam-source/${name}`;
  const learningSteps = [
    ["01", "Определяем уровень и дисциплину", "Уточняем опыт, цели и количество дней в Муйне, затем выбираем кайт, виндсёрфинг или вингфойл."],
    ["02", "Подбираем снаряжение", "Настраиваем комплект под вес, уровень и фактический ветер перед выходом на воду."],
    ["03", "Отрабатываем технику", "Инструктор разбирает безопасность, управление и даёт короткие корректировки во время практики."],
    ["04", "Закрепляем результат", "Переходим к курсу или самостоятельному прокату, когда базовые действия уже получаются уверенно."]
  ];
  const lessonIncludes = [
    ["Инструктор", "Индивидуальная задача и обратная связь на занятии."],
    ["Снаряжение", "Комплект входит в стоимость обучения."],
    ["Три дисциплины", "Кайтсёрфинг, виндсёрфинг и вингфойл в одном направлении."],
    ["Станция рядом", "Подготовка, хранение и помощь команды на берегу."]
  ];
  const priceCards = [
    ["Виндсёрфинг", "Знакомство с ветром", "65$", "Индивидуальное занятие 1 час, оборудование и страховка включены.", vietnamImg("windsurf.jpg"), "/vietnam/windsurf/price/"],
    ["Кайтсёрфинг", "Индивидуальный урок", "65$", "Один час с инструктором и полным комплектом оборудования на споте Малибу.", vietnamImg("station.jpg"), "/vietnam/kite/price/"],
    ["Вингфойл", "Индивидуальный урок", "65$", "Один час: крыло, доска и работа инструктора входят в стоимость.", vietnamImg("community.jpg"), "/vietnam/wingfoil/price/"],
    ["Вингфойл", "Занятие в группе", "50$", "Цена с человека; группы формируются по два–три участника.", vietnamImg("action.jpg"), "/vietnam/wingfoil/price/"]
  ];
  const galleryPhotos = [
    [vietnamImg("station.jpg"), "Станция", "Ветратория на берегу Муйне", "Станция Ветратории на пляже в Муйне", 900, 600],
    [vietnamImg("community.jpg"), "Вингфойл", "Выходим на фойл у станции", "Вингфойл в Муйне", 2000, 1333],
    [vietnamImg("aerial.jpg"), "Виндсёрфинг", "Ветер и практика на воде", "Виндсёрфинг в Муйне", 800, 500],
    [vietnamImg("surf.jpg"), "Волна", "Классический серфинг в безветренный день", "Серфинг на волне во Вьетнаме", 1024, 682],
    [vietnamImg("windsurf.jpg"), "Обучение", "Инструктор рядом с первых шагов", "Обучение виндсёрфингу во Вьетнаме", 2000, 558],
    [vietnamImg("atmosphere.jpg"), "Снаряжение", "Комплекты готовы к выходу", "Снаряжение станции Ветратория Вьетнам", 900, 598],
    [vietnamImg("action.jpg"), "На воде", "Практика в тёплом море", "Катание во Вьетнаме", 650, 434],
    [vietnamImg("station.jpg"), "Атмосфера", "Станция, пальмы и море", "Пляжная станция в Муйне", 900, 600]
  ];
  const faqs = [
    ["Когда лучше приезжать в Муйне?", "Основной сезон Ветратории во Вьетнаме — с ноября по март. Перед поездкой команда поможет выбрать даты под дисциплину и ваш уровень."],
    ["Можно ли приехать без своего оборудования?", "Да. В стоимость уроков входит необходимое снаряжение, а для самостоятельного катания доступен прокат."],
    ["Где проходит обучение кайтсёрфингу?", "Занятия проходят на пляже Малибу примерно в 6 км от станции. Там просторный берег, небольшой трафик и помещение для хранения оборудования."],
    ["Подойдёт ли направление новичку?", "Да. Программа начинается с управления и безопасности на берегу, а темп занятий подбирается под человека и условия."],
    ["Есть ли длительные курсы?", "Для виндсёрфинга доступны программы на 3 и 7 дней, для кайта — курс от 5 до 10 часов. Формат можно собрать под продолжительность поездки."]
  ];

  return `
<section class="dahab-hero vietnam-hero">
  <img class="dahab-hero__image" src="${vietnamImg("station.jpg")}" alt="Кайтсёрфинг, виндсёрфинг и вингфойл в Муйне" width="900" height="600" fetchpriority="high">
  <div class="dahab-hero__shade"></div>
  <div class="dahab-hero__content">
    <p class="eyebrow">Вьетнам · Муйне</p>
    <h1>Кайт, виндсёрфинг и вингфойл в Муйне</h1>
    <p class="hero-lead">Три ветровые дисциплины, обучение и прокат на тёплом море. Подберём спорт, программу и снаряжение под ваш уровень.</p>
    <div class="hero-advantages"><span class="hero-advantage">С 2011 года</span><span class="hero-advantage">Сезон ноябрь — март</span><span class="hero-advantage">Три вида спорта</span><span class="hero-advantage">Станция на берегу</span></div>
    <div class="hero-actions dahab-hero-actions">${contactCta(page, "Подобрать программу")}<a class="button button-ghost" href="#prices">Посмотреть цены</a></div>
  </div>
</section>

<section class="dahab-marquee" aria-label="Ветратория во Вьетнаме"><div class="dahab-marquee__track"><span>МУЙНЕ · СЕЗОН НОЯБРЬ — МАРТ / КАЙТСЁРФИНГ — 65$ / ВИНДСЁРФИНГ — 65$ / ВИНГФОЙЛ — 65$ / ПРОКАТ ВИНДСЁРФИНГА — ОТ 35$ / СТАНЦИЯ НА БЕРЕГУ / СПОТ МАЛИБУ / </span><span aria-hidden="true">МУЙНЕ · СЕЗОН НОЯБРЬ — МАРТ / КАЙТСЁРФИНГ — 65$ / ВИНДСЁРФИНГ — 65$ / ВИНГФОЙЛ — 65$ / ПРОКАТ ВИНДСЁРФИНГА — ОТ 35$ / СТАНЦИЯ НА БЕРЕГУ / СПОТ МАЛИБУ / </span></div></section>

${seasonSection([countriesByKey.vietnam], { compact: true, eyebrow: "Муйне · сезон и ветер", title: "Когда ехать в Муйне", lead: "Основной сезон станции — с ноября по март: тёплое море, ветровые дни и возможность совмещать несколько дисциплин в одной поездке." })}

<section class="sport-split" id="sport"><div class="sport-split__inner"><header class="section-heading"><p class="eyebrow">Выберите спорт</p><h2>Три дисциплины в одном направлении</h2></header><div class="sport-split__grid sport-split__grid--three">
  <a class="sport-tile" href="/vietnam/kite/"><img src="${vietnamImg("station.jpg")}" alt="Пляж в Муйне для занятий кайтсёрфингом" width="900" height="600" loading="lazy" decoding="async"><div class="sport-tile__content"><h2>Кайтсёрфинг</h2><span>Подробнее</span></div></a>
  <a class="sport-tile" href="/vietnam/windsurf/"><img src="${vietnamImg("aerial.jpg")}" alt="Виндсёрфинг в Муйне" width="800" height="500" loading="lazy" decoding="async"><div class="sport-tile__content"><h2>Виндсёрфинг</h2><span>Подробнее</span></div></a>
  <a class="sport-tile" href="/vietnam/wingfoil/"><img src="${vietnamImg("community.jpg")}" alt="Вингфойл в Муйне" width="2000" height="1333" loading="lazy" decoding="async"><div class="sport-tile__content"><h2>Вингфойл</h2><span>Подробнее</span></div></a>
</div></div></section>

<section class="dahab-learning" id="learning"><div class="dahab-inner"><div class="dahab-learning__layout"><div class="dahab-learning__journey"><header class="dahab-learning__heading"><p class="eyebrow">Обучение</p><h2>От первого занятия до самостоятельной практики</h2><p>Программа строится вокруг вашего опыта, выбранного спорта и количества дней на станции.</p></header><ol class="dahab-learning__steps">${learningSteps.map(([number,title,text]) => `<li><span>${number}</span><div><h3>${title}</h3><p>${text}</p></div></li>`).join("")}</ol></div><aside class="dahab-learning__side"><figure class="dahab-learning__media"><img src="${vietnamImg("windsurf.jpg")}" alt="Обучение виндсёрфингу в Муйне" width="2000" height="558" loading="lazy" decoding="async"></figure><div class="dahab-learning__included"><header><p class="eyebrow">В урок уже входит</p><h3>Можно приехать без своего снаряжения</h3></header><div>${lessonIncludes.map(([title,text]) => `<article><strong>${title}</strong><p>${text}</p></article>`).join("")}</div></div></aside></div></div></section>

<section class="dahab-safety-spotlight"><a class="dahab-safety-spotlight__inner" href="/vietnam/kite/"><span class="dahab-safety-spotlight__media"><img src="${vietnamImg("station.jpg")}" alt="Пляж Малибу рядом с Муйне" width="900" height="600" loading="lazy" decoding="async"></span><span class="dahab-safety-spotlight__content"><small>Кайт-спот</small><b>Пляж Малибу</b><em>Просторный пляж примерно в 6 км от станции, небольшой трафик, хранение оборудования, душ и место для переодевания.</em><strong>Кайтсёрфинг в Муйне <span aria-hidden="true">→</span></strong></span></a></section>

<section class="water-area" id="water-area"><div class="water-area__inner"><header class="water-area__intro"><div><p class="eyebrow">Муйне</p><h2>Тёплое море и разные форматы катания</h2></div><div><p>В одной поездке можно учиться, брать оборудование напрокат и переключаться между дисциплинами в зависимости от ветра и состояния воды.</p><p class="water-area__route"><span>Станция</span><b aria-hidden="true">→</b><span>Море</span><b aria-hidden="true">→</b><span>Малибу</span></p></div></header><div class="water-area__layout"><figure class="water-area__visual"><img src="${vietnamImg("station.jpg")}" alt="Станция Ветратории на пляже Муйне" width="900" height="600" loading="lazy" decoding="async"></figure><div class="water-area__cards"><article><span>01</span><div><strong>Станция в Муйне</strong><small>Виндсёрфинг и вингфойл</small><p>Подготовка снаряжения, обучение, прокат и помощь команды непосредственно на берегу.</p></div></article><article><span>02</span><div><strong>Открытое море</strong><small>Ветер и волна</small><p>Условия для прогресса, самостоятельного катания и классического серфинга в подходящие дни.</p></div></article><article><span>03</span><div><strong>Пляж Малибу</strong><small>Кайтсёрфинг</small><p>Отдельный просторный спот для занятий кайтом примерно в шести километрах от основной станции.</p></div></article></div></div></div></section>

<section class="dahab-section compact-band" id="prices"><div class="dahab-inner">${sectionHeading("Цены", "Сколько стоит начать", "Стоимость обучения включает работу инструктора и необходимое снаряжение.")}<div class="price-grid">${priceCards.map(([label,title,value,text,image,href]) => `<a class="price-card" href="${href}"><figure class="price-photo"><img src="${image}" alt="${label}: ${title}" loading="lazy" decoding="async"></figure><span>${label}</span><h3>${title}</h3><b>${value}</b><p>${text}</p><em>Смотреть формат →</em></a>`).join("")}</div><div class="price-help-cta"><div><b>Хотите заниматься несколько дней?</b><p>Виндсёрфинг: курс на 3 дня — 420$, на 7 дней — 800$. Кайтсёрфинг: курс 5–10 часов по 55$ за час.</p></div><nav>${contactCta(page,"Оставить заявку","",null)}<a href="/vietnam/windsurf/price/">Все цены</a></nav></div></div></section>

${stationLifeGallery({ id: "station-life", eyebrow: "Жизнь станции", title: "Ветер, тёплое море и ветраторская атмосфера", lead: "Ветратория работает в Муйне с 2011 года. Сюда возвращаются ради катания, команды и людей, с которыми не нужно объяснять любовь к ветру.", photos: galleryPhotos })}

<section class="station-advice" id="stations"><header class="station-advice__head"><p class="eyebrow">Станция</p><h2>Ветратория Вьетнам</h2></header><div class="station-advice__list station-advice__list--single"><a href="/vietnam/contacts/"><figure><img src="${vietnamImg("station.jpg")}" alt="Ветратория Вьетнам в Муйне" width="900" height="600" loading="lazy" decoding="async"></figure><div><span>Кайт · Виндсёрфинг · Вингфойл</span><b>Sun & Sands Beach · Муйне</b></div></a></div>${contactCta(page,"Написать нам","station-advice__cta")}</section>

<section class="dahab-faq-section" id="faq"><div class="dahab-inner"><div class="dahab-faq-section__layout"><header class="dahab-faq-section__intro"><p class="eyebrow">Перед поездкой</p><h2>Ответы о сезоне и занятиях</h2><p>Главное о выборе спорта, снаряжении и организации катания в Муйне.</p></header><div class="dahab-faq-section__accordion">${faqs.map(([question,answer],index) => `<details class="dahab-faq-section__item" ${index===0?"open":""}><summary aria-expanded="${index===0?"true":"false"}"><span class="dahab-faq-section__number">${String(index+1).padStart(2,"0")}</span><span>${question}</span></summary><p>${answer}</p></details>`).join("")}</div></div><div class="price-help-cta dahab-faq-section__cta"><div><b>Подберём программу под ваши даты</b><p>Напишите дисциплину, уровень и продолжительность поездки — команда предложит подходящий формат.</p></div><nav>${contactCta(page,"Оставить заявку","",null)}<a href="/vietnam/contacts/">Все контакты</a></nav></div></div></section>`;
};

const stationImg = (name) => `/assets/img/final/stations/${name}`;
const dahabSafetyImg = (name) => `/assets/img/final/dahab/${name}`;

const stationSlider = ({ title, lead, images }) => `
  <figure class="dahab-station-slider" data-station-slider aria-label="Фото ${escapeHtml(title)}">
    <div class="dahab-station-slider__viewport">
      ${images.map((image, index) => `<img data-station-slide class="${index === 0 ? "is-active" : ""}" src="${stationImg(image.file)}" alt="${escapeHtml(image.alt)}" loading="${index === 0 ? "eager" : "lazy"}" decoding="async" aria-hidden="${index === 0 ? "false" : "true"}">`).join("")}
    </div>
    <div class="dahab-station-slider__nav">
      <button type="button" data-station-prev aria-label="Предыдущее фото">←</button>
      <button type="button" data-station-next aria-label="Следующее фото">→</button>
    </div>
  </figure>`;

const dahabStationsPage = (page) => {
  const stations = [
    {
      id: "vetratoria-ganet",
      eyebrow: "Виндсёрфинг",
      title: "Ветратория Ганет Синай",
      text: [
        "База Ветратории в Дахабе для виндсёрфинга, проката, уроков и станционной жизни рядом с водой. Здесь удобно встретиться с командой, подобрать комплект и понять, какая зона подходит под ветер и уровень.",
        "Ганет хорошо подходит для практики, прогресса и спокойного выбора формата без лишней логистики: пришли на станцию, обсудили условия, вышли на воду."
      ],
      tags: ["Виндсёрфинг", "Прокат", "Практика", "Команда рядом"],
      sliderTitle: "Ганет Синай",
      sliderLead: "Виндсёрфинг-база, прокат, уроки и выбор формата под ветер.",
      images: [
        { file: "ganet-01.webp", alt: "Ветратория Ганет Синай у воды" },
        { file: "ganet-02.webp", alt: "Снаряжение на станции Ганет Синай" },
        { file: "ganet-03.webp", alt: "Внутри станции Ганет Синай" },
        { file: "ganet-04.webp", alt: "Пляж и старт у Ганет Синай" },
        { file: "ganet-05.webp", alt: "Оборудование Ветратории Ганет" },
        { file: "ganet-06.webp", alt: "Фасад Ветратория Ганет Синай" }
      ]
    },
    {
      id: "wing-center",
      reverse: true,
      eyebrow: "Вингфойл",
      title: "Винг-центр",
      text: [
        "Главная точка для вингфойл: здесь начинаются уроки, подбор крыла и доски, фойл за лодкой и первые самостоятельные выходы. Формат подходит тем, кто хочет быстро разобраться с фойлом и крылом.",
        "На Винг-центр удобно смотреть ветер, обсуждать попытки с инструктором и возвращаться на воду снова — без сложной системы пакетов и лишних шагов."
      ],
      tags: ["Вингфойл", "Фойл за лодкой", "Уроки", "Подбор комплекта"],
      sliderTitle: "Винг-центр",
      sliderLead: "Вингфойл, фойл за лодкой, оборудование и выходы на воду.",
      images: [
        { file: "wing-center-01.webp", alt: "Винг-центр Ветратории" },
        { file: "wing-center-02.webp", alt: "Пляж у Винг-центр" },
        { file: "wing-center-03.webp", alt: "Карта акватории Винг-центр" },
        { file: "wing-center-04.webp", alt: "Зона отдыха Винг-центр" },
        { file: "wing-center-05.webp", alt: "Стартовая зона Винг-центр" },
        { file: "wing-center-06.webp", alt: "Винг-центр со стороны воды" },
        { file: "wing-center-07.webp", alt: "Оборудование Винг-центр" },
        { file: "wing-center-08.webp", alt: "Зона ожидания Винг-центр" },
        { file: "wing-center-09.webp", alt: "Фасад Винг-центр" },
        { file: "wing-center-10.webp", alt: "Терраса Винг-центр" }
      ]
    },
    {
      id: "swiss-inn",
      eyebrow: "Виндсёрфинг",
      title: "Свисс Инн",
      text: [
        "Станция рядом с отелем и понятным стартом на воду. Свисс Инн удобен для уроков виндсёрфинга, детского формата, проката и тех, кто хочет простую логистику между отдыхом и катанием.",
        "Здесь хорошо начинать спокойно: берег рядом, оборудование под рукой, инструктор видит условия и помогает выбрать парус, доску и задачу на занятие."
      ],
      tags: ["Виндсёрфинг", "Детский", "Первые уроки", "Отель рядом"],
      sliderTitle: "Свисс Инн",
      sliderLead: "Виндсёрфинг, kids, первые уроки и комфортный старт рядом с отелем.",
      images: [
        { file: "swiss-01.webp", alt: "Оборудование Свисс Инн" },
        { file: "swiss-02.webp", alt: "Паруса на Свисс Инн" },
        { file: "swiss-03.webp", alt: "Зона хранения Свисс Инн" },
        { file: "swiss-04.webp", alt: "Терраса Свисс Инн" },
        { file: "swiss-05.webp", alt: "Пляж Свисс Инн" },
        { file: "swiss-06.webp", alt: "Фасад Ветратория Свисс Инн" },
        { file: "swiss-07.webp", alt: "Снаряжение Свисс Инн" }
      ]
    }
  ];

  return `
<section class="hero page-hero dahab-stations-hero" aria-labelledby="stations-title">
  <div class="hero-bg">
    <img src="${stationImg("hero.webp")}" alt="Станции Ветратории в Дахабе" width="1920" height="1080" fetchpriority="high" decoding="async">
  </div>
  <div class="hero-shade"></div>
  <div class="hero-content">
    <p class="eyebrow">Дахаб · станции</p>
    <h1 id="stations-title">Станции Ветратории в Дахабе</h1>
    <p>Три точки у воды: Ветратория Ганет Синай, Винг-центр и Свисс Инн. На этой странице — коротко о каждой станции, фото и понятный выбор, куда ехать под ваш спорт, уровень и даты.</p>
    <div class="hero-actions">
      ${contactCta(page, "Подобрать станцию")}
      <a class="button button-ghost" href="#vetratoria-ganet">Смотреть станции</a>
    </div>
  </div>
</section>

<nav class="dahab-stations-pills-bar" aria-label="Быстрый выбор станции и спорта">
  <div class="dahab-stations-inner dahab-stations-pills">
    <a href="#vetratoria-ganet">Ганет Синай</a>
    <a href="#wing-center">Винг-центр</a>
    <a href="#swiss-inn">Свисс Инн</a>
    <a href="/dahab/windsurf/">Виндсёрфинг</a>
    <a href="/dahab/wingfoil/">Вингфойл</a>
    <a href="https://windsurfkids.su/" target="_blank" rel="noopener noreferrer">Детский</a>
  </div>
</nav>

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
        <p>Напишите даты, отель, уровень и спорт. Мы подскажем, какая станция будет удобнее именно для вашего формата: вингфойл, виндсёрфинг, детская программа, прокат или уроки.</p>
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
    ["Спасение", "4 спасательных катера", "Катера поддерживают станции и позволяют быстро реагировать, если райдеру нужна помощь на воде."],
    ["Контроль", "Контроль акватории", "Команда следит за фактическими условиями, рабочими зонами и райдерами во время выхода."],
    ["Связь", "Связь на волнах", "Для выходов на волны выдаём телефоны, чтобы райдер мог связаться со станцией."],
    ["Инструктаж", "Инструктаж до старта", "До выхода разбираем ветер, маршрут, границы зоны, сигналы и правила возвращения."]
  ];
  const briefingSteps = [
    ["01", "Условия", "Сверяем прогноз с фактическим ветром, его направлением и обстановкой на воде."],
    ["02", "Зона", "Показываем рабочую акваторию, безопасный маршрут и места, куда не следует уходить."],
    ["03", "Связь", "Объясняем, как связаться со станцией и какие сигналы использовать в сложной ситуации."],
    ["04", "Выход", "Райдер выходит на воду с понятным планом катания и заранее оговорёнными правилами возврата."]
  ];

  return `
<section class="dahab-hero">
  <img class="dahab-hero__image" src="${dahabSafetyImg("safety-boat.webp")}" alt="Спасательный катер Ветратории в Дахабе" width="1600" height="1067" fetchpriority="high">
  <div class="dahab-hero__shade"></div>
  <div class="dahab-hero__content">
    <p class="eyebrow">Дахаб · безопасность</p>
    <h1>Безопасность на воде — часть каждого выхода</h1>
    <p class="hero-lead">В Ветратории безопасность начинается до воды: объясняем акваторию, проводим инструктаж, контролируем райдеров и поддерживаем готовность спасательной команды на станциях.</p>
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
    ${sectionHeading("Главное", "Как Ветратория обеспечивает безопасность", "Райдер заранее понимает, кто контролирует воду, как устроена связь и что происходит перед первым выходом.")}
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
      <img src="${dahabSafetyImg("cover-safety.webp")}" alt="Контроль райдера спасательным катером Ветратории" width="1600" height="1067" loading="lazy" decoding="async">
    </div>
  </div>
</section>

<section class="dahab-sport-section dahab-sport-section--soft" id="briefing-steps">
  <div class="dahab-sport-inner">
    ${sectionHeading("Порядок", "Четыре шага перед выходом", "")}
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
  <img src="${dahabSafetyImg("safety-boat.webp")}" alt="Спасательный катер Ветратории в Дахабе" width="1600" height="1067" loading="lazy" decoding="async">
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

const russiaImg = (name) => `/assets/img/russia-source/${name}`;

const russiaHomePage = (page) => {
  const learningSteps = [
    ["01", "Выбираем берег", "На косе две разные акватории. Команда оценивает ветер и выбирает сторону под дисциплину и уровень."],
    ["02", "Подбираем комплект", "Снаряжение настраивается под рост, вес, опыт и фактические условия перед выходом."],
    ["03", "Учимся по шагам", "Сначала безопасность и управление, затем движение, развороты и самостоятельная практика."],
    ["04", "Закрепляем навык", "После урока можно продолжить курс или перейти к прокату, когда инструктор подтвердит уровень."]
  ];
  const priceCards = [
    ["Виндсёрфинг", "Знакомство с ветром", "5 000 ₽", "Индивидуальное занятие 1 час; оборудование и страховка включены.", russiaImg("windsurf.jpg"), "/russia/windsurf/price/"],
    ["Вингфойл", "Индивидуальный урок", "5 000 ₽", "Один час с инструктором и комплектом станции.", russiaImg("wingfoil.jpg"), "/russia/wingfoil/price/"],
    ["Кайтсёрфинг", "Индивидуальный урок", "6 000 ₽", "Инструктор, оборудование и защитная экипировка включены.", russiaImg("kite.jpg"), "/russia/kite/price/"],
    ["Кайтсёрфинг", "Курс 10 часов", "54 000 ₽", "Последовательная индивидуальная программа и скидка на последующий прокат.", russiaImg("flat.jpg"), "/russia/kite/price/"]
  ];
  const galleryPhotos = [
    [russiaImg("station.jpg"), "Коса Долгая", "Две акватории по обе стороны косы", "Коса Долгая с воздуха", 640, 320],
    [russiaImg("windsurf.jpg"), "Виндсёрфинг", "Летний ветер и практика на воде", "Виндсёрфинг на Должанской", 1944, 1296],
    [russiaImg("wingfoil.jpg"), "Вингфойл", "Первые полёты на тёплой воде", "Вингфойл на Должанской", 1500, 998],
    [russiaImg("kite.jpg"), "Кайтсёрфинг", "Пространство для учебных задач", "Кайтсёрфинг на Должанской", 1100, 733],
    [russiaImg("training.jpg"), "Станция", "Снаряжение и команда на берегу", "Станция Ветратория на Должанской", 670, 445],
    [russiaImg("flat.jpg"), "Акватория", "Спокойная вода для первых шагов", "Спокойная сторона косы Долгой", 670, 445],
    [russiaImg("life-3.jpg"), "Прогресс", "Катание в более сильных условиях", "Райдер на воде", 480, 320],
    [russiaImg("life-4.jpg"), "Серфприют", "Станционная жизнь у самого пляжа", "Берег и станция", 480, 319]
  ];
  const faqs = [
    ["Когда работает направление?", "Основной сезон Ветратории на Должанской — с мая до середины сентября. Конкретные условия и расписание команда подтверждает под даты поездки."],
    ["Подойдёт ли место новичку?", "Да. Мелкая вода и возможность выбрать сторону косы помогают подобрать учебную акваторию под ветер и дисциплину."],
    ["Нужно ли своё оборудование?", "Нет. В обучение входит необходимый комплект, а для самостоятельного катания доступен прокат после оценки уровня."],
    ["Где находится станция?", "На косе Долгой, на территории базы отдыха «Серфприют» в станице Должанской."],
    ["Можно ли жить рядом?", "Да. На «Серфприюте» есть варианты размещения рядом со станцией; доступность и стоимость лучше уточнить перед поездкой."]
  ];
  return `
<section class="dahab-hero russia-hero"><img class="dahab-hero__image" src="${russiaImg("station.jpg")}" alt="Коса Долгая и станция Ветратория" width="640" height="320" fetchpriority="high"><div class="dahab-hero__shade"></div><div class="dahab-hero__content"><p class="eyebrow">Россия · Должанская</p><h1>Виндсёрфинг, вингфойл и кайт на косе Долгой</h1><p class="hero-lead">Три ветровые дисциплины, обучение и прокат на Азовском море. Выбираем сторону косы под ветер, уровень и задачу занятия.</p><div class="hero-advantages"><span class="hero-advantage">Сезон май — середина сентября</span><span class="hero-advantage">Три вида спорта</span><span class="hero-advantage">Две акватории</span><span class="hero-advantage">Станция на берегу</span></div><div class="hero-actions dahab-hero-actions">${contactCta(page, "Подобрать программу")}<a class="button button-ghost" href="#prices">Посмотреть цены</a></div></div></section>
<section class="dahab-marquee" aria-label="Ветратория на Должанской"><div class="dahab-marquee__track"><span>ДОЛЖАНСКАЯ · МАЙ — СЕРЕДИНА СЕНТЯБРЯ / ВИНДСЁРФИНГ — ОТ 5 000 ₽ / ВИНГФОЙЛ — ОТ 5 000 ₽ / КАЙТСЁРФИНГ — ОТ 6 000 ₽ / ДВЕ СТОРОНЫ КОСЫ / СЕРФПРИЮТ / </span><span aria-hidden="true">ДОЛЖАНСКАЯ · МАЙ — СЕРЕДИНА СЕНТЯБРЯ / ВИНДСЁРФИНГ — ОТ 5 000 ₽ / ВИНГФОЙЛ — ОТ 5 000 ₽ / КАЙТСЁРФИНГ — ОТ 6 000 ₽ / ДВЕ СТОРОНЫ КОСЫ / СЕРФПРИЮТ / </span></div></section>
${seasonSection([countriesByKey.russia], { compact: true, eyebrow: "Должанская · сезон и ветер", title: "Когда ехать на косу Долгую", lead: "Основной сезон станции — с мая до середины сентября. Перед занятием команда сверяет прогноз и выбирает подходящую сторону косы." })}
<section class="sport-split" id="sport"><div class="sport-split__inner"><header class="section-heading"><p class="eyebrow">Выберите спорт</p><h2>Три дисциплины на одной станции</h2></header><div class="sport-split__grid sport-split__grid--three"><a class="sport-tile" href="/russia/windsurf/"><img src="${russiaImg("windsurf.jpg")}" alt="Виндсёрфинг на Должанской" loading="lazy" decoding="async"><div class="sport-tile__content"><h2>Виндсёрфинг</h2><span>Подробнее</span></div></a><a class="sport-tile" href="/russia/wingfoil/"><img src="${russiaImg("wingfoil.jpg")}" alt="Вингфойл на Должанской" loading="lazy" decoding="async"><div class="sport-tile__content"><h2>Вингфойл</h2><span>Подробнее</span></div></a><a class="sport-tile" href="/russia/kite/"><img src="${russiaImg("kite.jpg")}" alt="Кайтсёрфинг на Должанской" loading="lazy" decoding="async"><div class="sport-tile__content"><h2>Кайтсёрфинг</h2><span>Подробнее</span></div></a></div></div></section>
<section class="dahab-learning" id="learning"><div class="dahab-inner"><div class="dahab-learning__layout"><div class="dahab-learning__journey"><header class="dahab-learning__heading"><p class="eyebrow">Обучение</p><h2>От выбора берега до самостоятельного катания</h2><p>Программа строится вокруг опыта, выбранной дисциплины и фактического ветра.</p></header><ol class="dahab-learning__steps">${learningSteps.map(([number,title,text]) => `<li><span>${number}</span><div><h3>${title}</h3><p>${text}</p></div></li>`).join("")}</ol></div><aside class="dahab-learning__side"><figure class="dahab-learning__media"><img src="${russiaImg("training.jpg")}" alt="Обучение на станции Ветратория" loading="lazy" decoding="async"></figure><div class="dahab-learning__included"><header><p class="eyebrow">На станции</p><h3>Всё необходимое рядом с водой</h3></header><div><article><strong>Инструктор</strong><p>Последовательная задача и обратная связь.</p></article><article><strong>Снаряжение</strong><p>Комплект подбирается под уровень и условия.</p></article><article><strong>Прокат</strong><p>Самостоятельная практика после оценки навыка.</p></article><article><strong>Хранение</strong><p>Место для собственного оборудования.</p></article></div></div></aside></div></div></section>
<section class="water-area"><div class="water-area__inner"><header class="water-area__intro"><div><p class="eyebrow">Коса Долгая</p><h2>Два берега — больше вариантов под ветер</h2></div><div><p>Коса разделяет Таганрогский залив и Азовское море. В зависимости от направления ветра одна сторона может быть спокойнее, а другая — дать волну.</p><p class="water-area__route"><span>Лиман</span><b aria-hidden="true">↔</b><span>Коса</span><b aria-hidden="true">↔</b><span>Море</span></p></div></header><div class="water-area__layout"><figure class="water-area__visual"><img src="${russiaImg("station.jpg")}" alt="Коса Долгая с двумя акваториями" loading="lazy" decoding="async"></figure><div class="water-area__cards"><article><span>01</span><div><strong>Спокойная сторона</strong><small>Обучение и база</small><p>Мелкая вода и старт с берега помогают спокойно собирать первые навыки.</p></div></article><article><span>02</span><div><strong>Сторона с волной</strong><small>Прогресс</small><p>Подходит опытным райдерам, когда направление и сила ветра создают нужные условия.</p></div></article><article><span>03</span><div><strong>Решение на месте</strong><small>Прогноз и безопасность</small><p>Команда выбирает учебную зону перед выходом, исходя из текущей обстановки.</p></div></article></div></div></div></section>
<section class="dahab-section compact-band" id="prices"><div class="dahab-inner">${sectionHeading("Цены", "Сколько стоит начать", "Базовые цены сезона 2026. На страницах дисциплин — полные таблицы обучения, проката и хранения.")}<div class="price-grid">${priceCards.map(([label,title,value,text,image,href]) => `<a class="price-card" href="${href}"><figure class="price-photo"><img src="${image}" alt="${label}: ${title}" loading="lazy" decoding="async"></figure><span>${label}</span><h3>${title}</h3><b>${value}</b><p>${text}</p><em>Полный прайс →</em></a>`).join("")}</div></div></section>
${stationLifeGallery({ id: "station-life", eyebrow: "Жизнь станции", title: "Лето на косе Долгой", lead: "Станция, пляж, снаряжение и проживание собраны рядом — меньше логистики, больше времени на воду.", photos: galleryPhotos })}
<section class="dahab-safety-spotlight"><a class="dahab-safety-spotlight__inner" href="/russia/accommodation/"><span class="dahab-safety-spotlight__media"><img src="${russiaImg("life-4.jpg")}" alt="База отдыха Серфприют" loading="lazy" decoding="async"></span><span class="dahab-safety-spotlight__content"><small>Проживание</small><b>«Серфприют» рядом со станцией</b><em>Пляж, станция и хранение оборудования находятся рядом. Условия и свободные места уточняются перед поездкой.</em><strong>Посмотреть варианты <span aria-hidden="true">→</span></strong></span></a></section>
<section class="dahab-faq-section"><div class="dahab-inner"><div class="dahab-faq-section__layout"><header class="dahab-faq-section__intro"><p class="eyebrow">Перед поездкой</p><h2>Ответы о Должанской</h2><p>Сезон, обучение, снаряжение и организация поездки.</p></header><div class="dahab-faq-section__accordion" data-exclusive-accordion>${faqs.map(([q,a],index)=>`<details class="dahab-faq-section__item" ${index===0?"open":""}><summary><span class="dahab-faq-section__number">${String(index+1).padStart(2,"0")}</span><span>${q}</span></summary><p>${a}</p></details>`).join("")}</div></div></div></section>
<section class="dahab-sport-cta"><img src="${russiaImg("flat.jpg")}" alt="Акватория Должанской" loading="lazy" decoding="async"><div class="dahab-sport-cta__inner"><p class="eyebrow">Должанская</p><h2>Подберём программу под ваши даты</h2><p>Напишите опыт, дисциплину и продолжительность поездки — команда проверит условия и предложит формат.</p><div>${contactCta(page,"Оставить заявку")}<a class="button button-ghost" href="/russia/contacts/">Контакты</a></div></div></section>`;
};

const countryPage = (page) => {
  const country = countriesByKey[page.country];
  if (country.key === "dahab") return dahabHomePage(page);
  if (country.key === "vietnam") return vietnamHomePage(page);
  if (country.key === "russia") return russiaHomePage(page);
  const primaryPricePath = `/${country.key}/${country.sports[0]}/price/`;
  const actions = `<a class="button button-primary" href="${primaryPricePath}">Цены</a>${contactCta(page, "Написать нам", "button button-ghost")}`;
  const sports = country.sports.map((key) => site.sports[key]);
  return `${hero(page, actions)}
  ${seasonSection([country], {
    compact: true,
    eyebrow: `${country.region} · сезон и ветер`,
    title: `Когда ехать в ${country.city}`,
    lead: country.seasonNote
  })}
  <section class="content-section content-section--light">
    <div class="section-inner">
      ${sectionHeading("Спорт и станции", `${country.title}: выберите свой формат`, `Здесь собраны ключевые входы: спорт, цены, команда и станционная логика под ${country.tone}.`)}
      <div class="link-grid">
        ${country.sports.map((key) => {
          const sport = site.sports[key];
          return `<a class="link-card" href="/${country.key}/${key}/"><small>${sport.nav}</small><h3>${sport.subtitle}</h3><p>${sport.lead}</p><em>Открыть</em></a>`;
        }).join("")}
        <a class="link-card link-card--accent" href="${primaryPricePath}"><small>Цены</small><h3>Цены и форматы</h3><p>Уроки, курсы, прокат, хранение и подбор программы.</p><em>Смотреть цены</em></a>
        ${country.extras.map((item) => `<a class="link-card" href="${item.href}"><small>${country.nav}</small><h3>${item.title}</h3><p>Подробности направления, которые помогают спокойно выйти на воду.</p><em>Перейти</em></a>`).join("")}
      </div>
    </div>
  </section>
  <section class="destination-story" data-reveal>
    <img src="${country.hero}" alt="${escapeHtml(`${country.region} · ${country.city}, Ветратория`)}" loading="lazy" decoding="async">
    <div class="destination-story__shade"></div>
    <div class="section-inner destination-story__content">
      <p class="eyebrow">Атмосфера направления</p>
      <h2>${escapeHtml(country.city)} — место для прогресса на воде</h2>
      <p>${escapeHtml(country.tone)}.</p>
      <a class="button button-ghost" href="/media/${country.key}/">Смотреть медиа</a>
    </div>
  </section>
  <section class="content-section content-section--soft">
    <div class="section-inner">
      ${sectionHeading("Дисциплины", "Один сезон — несколько маршрутов", "Выберите дисциплину и переходите к условиям обучения, прокату и ценам без изменения привычной навигации.")}
      <div class="rail-list">
        ${sports.map((sport, index) => `<article data-reveal><b>0${index + 1}</b><h3>${sport.title}</h3><p>${sport.lead}</p><a href="/${country.key}/${country.sports[index]}/">Подробнее <span aria-hidden="true">→</span></a></article>`).join("")}
      </div>
    </div>
  </section>
  <section class="content-section content-section--light destination-contact">
    <div class="section-inner home-cta">
      <div><p class="eyebrow">Подбор поездки</p><h2>Уточним сезон под ваши даты</h2><p>Напишите уровень, дисциплину и даты. Команда подтвердит фактические условия и предложит доступный формат.</p></div>
      <div class="home-cta__actions">${contactCta(page, "Подобрать формат")}<a class="button button-ghost" href="/${country.key}/contacts/">Контакты</a></div>
    </div>
  </section>`;
};

const vietnamSportPage = (page) => {
  const vietnamImg = (name) => `/assets/img/vietnam-source/${name}`;
  const shared = {
    kite: {
      title: "Кайтсёрфинг в Муйне",
      lead: "Обучение кайтсёрфингу на просторном пляже Малибу: управление кайтом, бодидраг, старт с доской и самостоятельная практика.",
      hero: vietnamImg("station.jpg"),
      facts: ["Спот Малибу", "Инструктор и комплект", "65$ за час", "Курс 5–10 часов"],
      locationTitle: "Почему Малибу подходит для кайта",
      locationLead: "Спот находится примерно в 6 км от основной станции. Просторный пляж и небольшой трафик дают место для последовательного обучения.",
      reasons: [
        ["Просторный берег", "Достаточно места для разбора кайта, запуска и первых упражнений под контролем инструктора.", vietnamImg("station.jpg"), "Пляж Малибу для занятий кайтсёрфингом"],
        ["Небольшой трафик", "На споте проще выделить учебную зону и сосредоточиться на базовых действиях.", vietnamImg("surf.jpg"), "Открытая вода у Муйне"],
        ["Инфраструктура", "На Малибу есть хранение оборудования, душ и место, где можно переодеться.", vietnamImg("action.jpg"), "Станционная инфраструктура во Вьетнаме"]
      ],
      steps: [["01","Безопасность и ветер","Разбираем ветровое окно, устройство кайта, сигналы и правила учебной зоны."],["02","Управление кайтом","Учимся контролировать крыло на берегу и удерживать его в нужной части окна."],["03","Бодидраг","Отрабатываем движение в воде без доски и возвращение к потерянному снаряжению."],["04","Старт с доской","Соединяем контроль кайта, положение доски и первые проходы по воде."]],
      prices: [["Разовый урок","1 час","65$","Инструктор и оборудование включены."],["Курс","5–10 часов","55$/час","Последовательная программа от управления кайтом до старта с доской."]],
      faq: [["Подойдёт ли Малибу новичку?","Спот нельзя назвать самым простым, поэтому обучение строится последовательно и только в подходящих условиях."],["Где проходит занятие?","На пляже Малибу примерно в 6 км от основной станции Ветратории."],["Что входит в цену?","Работа инструктора и полный комплект оборудования."],["Можно ли взять курс?","Да, для программы длительностью 5–10 часов действует цена 55$ за час."]]
    },
    windsurf: {
      title: "Виндсёрфинг в Муйне",
      lead: "Индивидуальные уроки, курсы и прокат на станции Ветратория: от первого знакомства с парусом до уверенного самостоятельного катания.",
      hero: vietnamImg("aerial.jpg"),
      facts: ["Снаряжение включено", "Урок от 65$", "Курсы на 3 и 7 дней", "Прокат от 35$"],
      locationTitle: "Муйне для обучения и прогресса",
      locationLead: "Зимний бриз, тёплое море и станция на берегу позволяют сочетать занятия с самостоятельной практикой.",
      reasons: [["Сезонный ветер","Основной сезон с ноября по март даёт время на несколько последовательных занятий.",vietnamImg("aerial.jpg"),"Виндсёрфинг в Муйне"],["Станция на берегу","Подбор и настройка комплекта проходят рядом с местом выхода на воду.",vietnamImg("station.jpg"),"Станция Ветратории в Муйне"],["Большой выбор оборудования","На станции доступны комплекты для обучения, прогресса и самостоятельного проката.",vietnamImg("atmosphere.jpg"),"Виндсёрфинг-снаряжение Ветратории"]],
      steps: [["01","Знакомство с парусом","Разбираем ветер, положение тела и управление парусом на берегу."],["02","Первые галсы","Учимся стартовать, держать курс и возвращаться в заданную точку."],["03","Повороты и контроль","Работаем над разворотами, скоростью и устойчивым положением на доске."],["04","Самостоятельная практика","Закрепляем навык с прокатом и точечными занятиями с инструктором."]],
      prices: [["Первый урок","1 час","65$","Оборудование и страховка включены."],["Курс новичка","3 дня","420$","По 1,5 часа обучения в день и самостоятельная практика."],["Недельный курс","7 дней","800$","По одному часу с инструктором ежедневно и практика."],["Прокат","1 час","35$","Самостоятельное катание на комплекте станции."]],
      faq: [["Можно ли начать с нуля?","Да, первое занятие начинается с управления парусом и безопасных действий на берегу."],["Что входит в урок?","Инструктор, аренда оборудования и страховка материальной части."],["Есть ли детские занятия?","Да, детское часовое занятие стоит 55$."],["Можно ли кататься самостоятельно?","Да, после оценки уровня можно взять комплект напрокат от одного часа."]]
    },
    wingfoil: {
      title: "Вингфойл в Муйне",
      lead: "Обучение на современном оборудовании: управление крылом, баланс на доске, первые подъёмы на фойл и самостоятельная практика.",
      hero: vietnamImg("community.jpg"),
      facts: ["Индивидуально 65$", "Группа 50$", "Современное оборудование", "Фойл за катером"],
      locationTitle: "Муйне для первых полётов",
      locationLead: "Тёплое море, сезонный бриз и оборудование станции создают понятный маршрут от управления крылом до фойла.",
      reasons: [["Тёплая вода","Больше времени можно уделить упражнениям и повторениям на воде.",vietnamImg("community.jpg"),"Вингфойл в тёплом море Муйне"],["Оборудование RRD","На станции доступны современные доски и крылья для разных уровней.",vietnamImg("atmosphere.jpg"),"Оборудование станции Ветратория"],["Фойл за катером","Можно отдельно отработать баланс и контроль высоты без одновременного управления крылом.",vietnamImg("action.jpg"),"Подготовка к занятию в Муйне"]],
      steps: [["01","Управление крылом","На берегу учимся держать винг, менять сторону и понимать тягу."],["02","Крыло и доска","Соединяем управление вингом с балансом и движением по воде."],["03","Выход на фойл","Набираем скорость, контролируем подъём и удерживаем безопасную высоту."],["04","Практика","Закрепляем старты, проходы и возвращение к точке выхода."]],
      prices: [["Индивидуально","1 час","65$","Винг, доска и инструктор включены."],["В группе","1 час","50$","Цена с человека; группа из двух–трёх участников."],["Фойл и катер","20 минут","65$","Индивидуальная тренировка баланса на фойле."]],
      faq: [["Можно ли начать без опыта?","Да, обучение начинается с управления крылом и баланса, предыдущий опыт не обязателен."],["Что входит в урок?","Крыло, доска и работа инструктора."],["Как проходит групповое занятие?","Группа формируется из двух–трёх участников, цена — 50$ с человека."],["Зачем нужен фойл за катером?","Он позволяет отдельно почувствовать подъём и научиться контролировать высоту без крыла."]]
    }
  };
  const data = shared[page.sport];
  const imagePool = [data.hero, vietnamImg("station.jpg"), vietnamImg("community.jpg"), vietnamImg("aerial.jpg"), vietnamImg("windsurf.jpg"), vietnamImg("atmosphere.jpg")];
  return `
<section class="dahab-sport-hero dahab-sport-hero--${page.sport}"><div class="dahab-sport-hero__inner"><div class="dahab-sport-hero__copy"><p class="eyebrow">Вьетнам · Муйне</p><h1>${data.title}</h1><p>${data.lead}</p><div class="dahab-sport-hero__actions">${contactCta(page,"Записаться","button button-primary",page.sport)}<a class="button button-ghost" href="${page.path}price/">Смотреть цены</a></div><div class="hero-advantages hero-advantages--sport">${data.facts.map(item=>`<span class="hero-advantage">${item}</span>`).join("")}</div></div><figure class="dahab-sport-hero__media"><img src="${data.hero}" alt="${data.title}" loading="eager" decoding="async" fetchpriority="high"></figure></div></section>
${seasonSection([countriesByKey.vietnam],{compact:true,eyebrow:`Муйне · ${site.sports[page.sport].nav}`,title:"Сезон с ноября по март",lead:"Основной ветровой сезон станции. Фактические условия команда подбирает под дисциплину и уровень райдера."})}
<section class="dahab-sport-section dahab-sport-section--location"><div class="dahab-sport-inner">${sectionHeading("Локация",data.locationTitle,data.locationLead)}${sportFeatureGrid(data.reasons,{atlas:true,leadImage:data.hero,leadAlt:data.title})}</div></section>
<section class="dahab-sport-section dahab-sport-section--soft"><div class="dahab-sport-inner">${sectionHeading("Обучение",`Как проходит обучение: ${site.sports[page.sport].nav.toLowerCase()}`,"Каждый следующий этап опирается на уже контролируемый навык — без спешки и одинаковых обещаний для всех.")}<div class="dahab-sport-process">${data.steps.map(([number,title,text],index)=>`<article><img src="${imagePool[index%imagePool.length]}" alt="${title}" loading="lazy" decoding="async"><div><span>${number}</span><h3>${title}</h3><p>${text}</p></div></article>`).join("")}</div></div></section>
<section class="dahab-sport-section"><div class="dahab-sport-inner">${sectionHeading("Цены",`Цены на ${site.sports[page.sport].nav.toLowerCase()}`,"Выберите разовое занятие или последовательный курс под продолжительность поездки.")}<div class="dahab-sport-price-grid">${data.prices.map(([label,title,value,text])=>`<article class="dahab-sport-price-card"><small>${label}</small><h3>${title}</h3><b>${value}</b><p>${text}</p>${contactCta(page,"Записаться","button button-primary",page.sport)}</article>`).join("")}</div><div class="dahab-sport-price-actions"><a class="button button-ghost" href="${page.path}price/">Все цены</a></div></div></section>
<section class="dahab-sport-section dahab-sport-section--soft"><div class="dahab-sport-inner dahab-sport-safety"><div class="dahab-sport-safety__copy"><p class="eyebrow">Перед выходом</p><h2>Безопасность и понятный план занятия</h2><p>Перед стартом инструктор проверяет условия, подбирает комплект, объясняет учебную зону и действия на воде.</p><div class="dahab-sport-safety__list"><span>Условия проверяются перед занятием</span><span>Комплект подбирается под уровень и вес</span><span>Практика начинается с контролируемых действий</span></div>${contactCta(page,"Обсудить программу")}</div><div class="dahab-sport-safety__media"><img src="${vietnamImg("station.jpg")}" alt="Станция Ветратории в Муйне" loading="lazy" decoding="async"></div></div></section>
<section class="dahab-sport-section dahab-sport-section--faq"><div class="dahab-sport-inner">${sportFaqBlock("Частые вопросы",`Вопросы про ${site.sports[page.sport].nav.toLowerCase()} в Муйне`,"",data.faq)}</div></section>
<section class="dahab-sport-cta"><img src="${data.hero}" alt="${data.title}" loading="lazy" decoding="async"><div class="dahab-sport-cta__inner"><p class="eyebrow">Подбор программы</p><h2>Подберём формат под уровень и даты</h2><p>Напишите дисциплину, опыт и продолжительность поездки — команда предложит подходящий урок или курс.</p><div>${contactCta(page,"Оставить заявку")}<a class="button button-ghost" href="/vietnam/">Обзор Муйне</a></div></div></section>`;
};

const russiaSportPage = (page) => {
  const configs = {
    windsurf: {
      title: "Виндсёрфинг на Должанской",
      lead: "Обучение с нуля, курсы и прокат на косе Долгой: мелкая тёплая вода для первых шагов и выбор акватории под ветер.",
      hero: russiaImg("windsurf.jpg"),
      facts: ["Урок от 5 000 ₽", "Курс от 11 000 ₽", "Детские занятия", "Прокат на станции"],
      locationTitle: "Почему Должанская подходит для виндсёрфинга",
      reasons: [["Мелкая вода","На спокойной стороне косы проще осваивать равновесие, управление парусом и первые галсы.",russiaImg("flat.jpg")],["Два берега","Сторону выхода выбирают по направлению ветра и учебной задаче.",russiaImg("station.jpg")],["Снаряжение рядом","Большой парк оборудования RRD позволяет подобрать комплект под рост, вес и уровень.",russiaImg("training.jpg")]],
      steps: [["01","Парус и ветер","Разбираем положение тела, тягу и безопасное управление парусом."],["02","Первые галсы","Учимся стартовать, держать курс и возвращаться к берегу."],["03","Повороты","Соединяем контроль доски и паруса в понятную последовательность."],["04","Самостоятельная практика","Закрепляем навык на прокатном комплекте после оценки инструктора."]],
      prices: [["Первый урок","1 час","5 000 ₽","Инструктор, оборудование и страховка."],["Курс","3 часа","11 000 ₽","Два часа с инструктором и один час самостоятельно."],["Недельный курс","7 дней","50 000 ₽","Семь часов с инструктором и самостоятельная практика."],["Детский урок","1 час","4 500 ₽","Индивидуальный формат до 16 лет."]]
    },
    wingfoil: {
      title: "Вингфойл на Должанской",
      lead: "Управление крылом, баланс на доске и первые подъёмы на фойл в летней акватории косы Долгой.",
      hero: russiaImg("wingfoil.jpg"),
      facts: ["Урок от 5 000 ₽", "Курс 10 часов", "Группы 2–4", "Прокат от 3 500 ₽"],
      locationTitle: "Летняя акватория для первых полётов",
      reasons: [["Меньше ветра","Вингфойл позволяет использовать более лёгкие ветровые дни и продолжать практику.",russiaImg("wingfoil.jpg")],["Понятный старт","Сначала работа с крылом и большой доской, затем переход к фойлу.",russiaImg("flat.jpg")],["Оборудование на месте","Комплект подбирается под вес, опыт и текущие условия.",russiaImg("training.jpg")]],
      steps: [["01","Управление вингом","На берегу учимся держать крыло и контролировать тягу."],["02","Крыло и доска","Соединяем движение, баланс и возвращение к точке старта."],["03","Выход на фойл","Набираем скорость и учимся контролировать высоту."],["04","Практика","Закрепляем старты и проходы на выбранной акватории."]],
      prices: [["Индивидуально","1 час","5 000 ₽","Инструктор и оборудование."],["В группе","1 час","4 500 ₽ / человек","Группа от двух до четырёх человек."],["Курс","10 часов","45 000 ₽","Индивидуальная последовательная программа."],["Прокат","1 час","3 500 ₽","Для самостоятельных райдеров."]]
    },
    kite: {
      title: "Кайтсёрфинг на Должанской",
      lead: "Последовательное обучение на мелкой тёплой воде: контроль кайта, бодидраг, старт с доской и самостоятельное движение.",
      hero: russiaImg("kite.jpg"),
      facts: ["Урок от 6 000 ₽", "Курс 10 часов", "Экипировка включена", "Хранение на станции"],
      locationTitle: "Пространство для последовательного обучения",
      reasons: [["Мелкий лиман","На учебной стороне проще выполнять упражнения и возвращаться к инструктору.",russiaImg("kite.jpg")],["Стабильный ветер","Открытый ландшафт косы уменьшает влияние высокой застройки на поток.",russiaImg("station.jpg")],["Полный комплект","В урок входят кайт, доска, трапеция, жилет, шлем и страхование оборудования.",russiaImg("training.jpg")]],
      steps: [["01","Безопасность","Разбираем ветровое окно, систему страховки и сигналы."],["02","Управление кайтом","Ставим контроль крыла сначала на берегу, затем в воде."],["03","Бодидраг","Учимся двигаться без доски и возвращать потерянное снаряжение."],["04","Старт с доской","Соединяем тягу, положение доски и первые контролируемые проходы."]],
      prices: [["Индивидуально","1 час","6 000 ₽","Инструктор, комплект и защитная экипировка."],["Индивидуальный курс","10 часов","54 000 ₽","После курса — скидка 50% на прокат."],["В группе","1 час","5 500 ₽ / человек","Цена для одного участника группы."],["Прокат","1 час","3 500 ₽","Для самостоятельного катания."]]
    }
  };
  const data = configs[page.sport];
  const images = [data.hero, russiaImg("flat.jpg"), russiaImg("training.jpg"), russiaImg("station.jpg")];
  return `
<section class="dahab-sport-hero dahab-sport-hero--${page.sport}"><div class="dahab-sport-hero__inner"><div class="dahab-sport-hero__copy"><p class="eyebrow">Россия · Должанская</p><h1>${data.title}</h1><p>${data.lead}</p><div class="dahab-sport-hero__actions">${contactCta(page,"Записаться","button button-primary",page.sport)}<a class="button button-ghost" href="${page.path}price/">Смотреть цены</a></div><div class="hero-advantages hero-advantages--sport">${data.facts.map(item=>`<span class="hero-advantage">${item}</span>`).join("")}</div></div><figure class="dahab-sport-hero__media"><img src="${data.hero}" alt="${data.title}" loading="eager" decoding="async" fetchpriority="high"></figure></div></section>
${seasonSection([countriesByKey.russia],{compact:true,eyebrow:`Должанская · ${site.sports[page.sport].nav}`,title:"Сезон с мая до середины сентября",lead:"Перед выходом команда сверяет прогноз и выбирает подходящую сторону косы под уровень и дисциплину."})}
<section class="dahab-sport-section dahab-sport-section--location"><div class="dahab-sport-inner">${sectionHeading("Локация",data.locationTitle,"Коса Долгая даёт две акватории с разным состоянием воды — это помогает подобрать условия под конкретную задачу.")}${sportFeatureGrid(data.reasons.map(([title,text,image])=>[title,text,image,title]),{atlas:true,leadImage:russiaImg("station.jpg"),leadAlt:"Коса Долгая"})}</div></section>
<section class="dahab-sport-section dahab-sport-section--soft"><div class="dahab-sport-inner">${sectionHeading("Обучение",`Как проходит обучение: ${site.sports[page.sport].nav.toLowerCase()}`,"Каждый следующий этап начинается после того, как предыдущий навык стал контролируемым.")}<div class="dahab-sport-process">${data.steps.map(([number,title,text],index)=>`<article><img src="${images[index]}" alt="${title}" loading="lazy" decoding="async"><div><span>${number}</span><h3>${title}</h3><p>${text}</p></div></article>`).join("")}</div></div></section>
<section class="dahab-sport-section"><div class="dahab-sport-inner">${sectionHeading("Цены",`Цены на ${site.sports[page.sport].nav.toLowerCase()}`,"Базовые форматы сезона 2026; полный прайс — на отдельной странице.")}<div class="dahab-sport-price-grid">${data.prices.map(([label,title,value,text])=>`<article class="dahab-sport-price-card"><small>${label}</small><h3>${title}</h3><b>${value}</b><p>${text}</p>${contactCta(page,"Записаться","button button-primary",page.sport)}</article>`).join("")}</div><div class="dahab-sport-price-actions"><a class="button button-ghost" href="${page.path}price/">Полный прайс</a></div></div></section>
<section class="dahab-sport-section dahab-sport-section--soft"><div class="dahab-sport-inner dahab-sport-safety"><div class="dahab-sport-safety__copy"><p class="eyebrow">Перед выходом</p><h2>Прогноз, зона и оборудование</h2><p>Инструктор проверяет ветер, объясняет границы учебной зоны и подбирает комплект до начала практики.</p><div class="dahab-sport-safety__list"><span>Выбор стороны косы по условиям</span><span>Комплект под уровень и вес</span><span>Инструктаж перед занятием</span></div>${contactCta(page,"Обсудить программу")}</div><div class="dahab-sport-safety__media"><img src="${russiaImg("flat.jpg")}" alt="Учебная акватория на Должанской" loading="lazy" decoding="async"></div></div></section>
<section class="dahab-sport-cta"><img src="${data.hero}" alt="${data.title}" loading="lazy" decoding="async"><div class="dahab-sport-cta__inner"><p class="eyebrow">Подбор программы</p><h2>Соберём занятия под ваши даты</h2><p>Напишите опыт, количество дней и выбранную дисциплину — команда предложит урок, курс или прокат.</p><div>${contactCta(page,"Оставить заявку","button button-primary",page.sport)}<a class="button button-ghost" href="/russia/">Обзор Должанской</a></div></div></section>`;
};

const sportPage = (page) => {
  if (page.country === "dahab" && page.sport === "wingfoil") return dahabWingfoilPage(page);
  if (page.country === "dahab" && page.sport === "windsurf") return dahabWindsurfPage(page);
  if (page.country === "dahab" && page.sport === "windsurf-kids") return dahabWindsurfKidsPage(page);
  if (page.country === "vietnam") return vietnamSportPage(page);
  if (page.country === "russia") return russiaSportPage(page);

  const country = countriesByKey[page.country];
  const sport = site.sports[page.sport];
  return `${hero(page, `<a class="button button-primary" href="${page.path}price/">Цены</a>${contactCta(page, "Записаться", "button button-ghost")}`)}
  ${seasonSection([country], {
    compact: true,
    eyebrow: `${country.region} · условия`,
    title: `${sport.title}: сезон и ветер`,
    lead: "Показываем только подтверждённую проектом сезонность; фактические условия команда уточняет перед занятием."
  })}
  <section class="content-section content-section--light">
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
  </section>
  <section class="destination-story destination-story--sport" data-reveal>
    <img src="${page.image}" alt="${escapeHtml(`${sport.title} в ${country.city}`)}" loading="lazy" decoding="async">
    <div class="destination-story__shade"></div>
    <div class="section-inner destination-story__content">
      <p class="eyebrow">Следующий шаг</p>
      <h2>Подберём формат под уровень и ветер</h2>
      <p>Без неподтверждённых обещаний: команда сверит условия, доступность инструктора и подходящее снаряжение.</p>
      ${contactCta(page, "Обсудить поездку")}
    </div>
  </section>`;
};

const notFoundPage = (page) => `${hero(page, `<a class="button button-primary" href="/">На главную</a><a class="button button-ghost" href="#directions-404">Выбрать направление</a>`)}
  <section class="content-section content-section--light" id="directions-404">
    <div class="section-inner">
      ${sectionHeading("Направления", "Продолжите с нужной страны", "Все основные разделы сайта доступны по прежним адресам.")}
      <div class="link-grid">
        ${countryList.map((country) => `<a class="link-card" href="${country.href}"><small>${country.region}</small><h3>${country.title}</h3><p>${country.seasonTitle} · ${country.windLabel}</p><em>Открыть</em></a>`).join("")}
      </div>
    </div>
  </section>`;

const priceRows = (sportTitle = "Спорт", { showServiceDetails = true } = {}) => [
  [`${sportTitle}: вводный урок`, "60 минут", showServiceDetails ? "индивидуально или мини-группа" : "", showServiceDetails ? "по запросу" : ""],
  [`${sportTitle}: курс`, "3-5 занятий", showServiceDetails ? "план прогресса и инструктор" : "", showServiceDetails ? "по запросу" : ""],
  ["Прокат снаряжения", "1 час / день", showServiceDetails ? "подбор под ветер и уровень" : "", showServiceDetails ? "по запросу" : ""],
  ["Хранение", "день / месяц", showServiceDetails ? "станция и доступ к инфраструктуре" : "", showServiceDetails ? "по запросу" : ""]
];

const dahabWingfoilPricePage = (page) => `
<section class="dahab-hero dahab-hero--price">
  <img class="dahab-hero__image" src="/assets/img/final/wingfoil/hero.webp" alt="Цены на вингфойл в Дахабе" width="1600" height="1067" fetchpriority="high">
  <div class="dahab-hero__shade"></div>
  <div class="dahab-hero__content">
    <p class="eyebrow">Египет · Дахаб · Вингфойл</p>
    <h1>Цены на вингфойл в Дахабе</h1>
    <p>Полный прайс: аренда комплектов, уроки винга, фойл за лодкой, Винг + SUP, Винг + фойл, отдельная аренда крыла и доски, обучающие пакеты, интенсив-пакеты, страховка и хранение.</p>
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
      <p class="eyebrow">Вингфойл · аренда</p>
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

    <h3 class="wingfoil-price-subtitle">Хранение вингфойл-оборудования</h3>
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
      <p class="eyebrow">Вингфойл · уроки</p>
      <h2>Уроки и часовые форматы</h2>
      <p>Для старта можно идти через Винг + SUP и фойл за лодкой, дальше — Винг + фойл и самостоятельная практика.</p>
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
      <p class="eyebrow">Вингфойл · отдельные части</p>
      <h2>Аренда только винга или только доски</h2>
      <p>Скидки клуба Ветратории не распространяются на аренду отдельных частей комплекта вингфойла.</p>
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
      <p>Скидки клуба Ветратории не распространяются на аренду отдельных частей комплекта вингфойла. Скидки на аренду отдельных частей действуют только если оборудование было куплено в клубе.</p>
      <p>Цена и условия страховки на аренду отдельных частей соответствуют общему прайс-листу и правилам страховки.</p>
    </div>
  </div>
</section>

<section class="wingfoil-price-section" id="packages">
  <div class="wingfoil-price-inner">
    <header class="wingfoil-price-heading">
      <p class="eyebrow">Вингфойл · пакеты</p>
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
      <figure><img src="/assets/img/final/wingfoil/lesson-coaching.webp" alt="Вингфойл Ветратории в Дахабе" width="1600" height="1067" loading="lazy" decoding="async"></figure>
      <div>
        <p class="eyebrow">Заявка</p>
        <h2>Подобрать Вингфойл</h2>
        <p>Напишите даты, уровень, вес и задачу: первый раз, фойл за лодкой, прокат, пакет или хранение.</p>
        <div class="wingfoil-price-contact__actions">
          ${contactCta(page, "Оставить заявку", "button button-primary", "wingfoil")}
          <a class="button button-ghost" href="/dahab/wingfoil/">О вингфойле</a>
        </div>
      </div>
    </div>
  </div>
</section>`.replace(/^[\t ]+$/gm, "");

const dahabWindsurfPricePage = (page) => `
<section class="dahab-hero dahab-hero--price">
  <img class="dahab-hero__image" src="/assets/img/final/windsurf/hero.webp" alt="Цены на виндсёрфинг в Дахабе" width="1600" height="1067" fetchpriority="high">
  <div class="dahab-hero__shade"></div>
  <div class="dahab-hero__content">
    <p class="eyebrow">Египет · Дахаб · Виндсёрфинг</p>
    <h1>Цены на виндсёрфинг в Дахабе</h1>
    <p>Полный прайс: обучение виндсёрфингу, курсы 1–7 дней, индивидуальные занятия, прокат оборудования, страховка, скидки, аренда гидрофойла и хранение виндсёрфинг-оборудования.</p>
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
      <p class="eyebrow">Виндсёрфинг · обучение</p>
      <h2>Обучение виндсёрфингу</h2>
    </header>
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
      <p class="eyebrow">Виндсёрфинг · индивидуально</p>
      <h2>Индивидуальные занятия</h2>
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
      <p class="eyebrow">Виндсёрфинг · прокат</p>
      <h2>Прокат оборудования для виндсёрфинга</h2>
    </header>
    <p class="windsurf-price-copy"><strong>Прокат одного комплекта матчасти для виндсёрфинга</strong></p>
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
          <thead><tr><th>Прокат</th><th>МЕГА SUP</th><th>SUP</th><th>ФОЙЛ</th></tr></thead>
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
      <p class="eyebrow">Виндсёрфинг · скидки</p>
      <h2>Скидки Ветратории</h2>
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
      <p class="eyebrow">Виндсёрфинг · хранение</p>
      <h2>Гидрофойл и хранение оборудования</h2>
    </header>
    <p class="windsurf-price-copy">Аренда гидрофойла для виндсёрфинга — 30$ / час.</p>
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
      <figure><img src="/assets/img/final/windsurf/lesson-water.webp" alt="Виндсёрфинг Ветратории в Дахабе" width="1600" height="1067" loading="lazy" decoding="async"></figure>
      <div>
        <p class="eyebrow">Заявка</p>
        <h2>Подобрать Виндсёрфинг</h2>
        <p>Напишите даты, уровень, возраст, интересующий курс и нужен ли прокат или хранение.</p>
        <div class="windsurf-price-contact__actions">
          ${contactCta(page, "Оставить заявку", "button button-primary", "windsurf")}
          <a class="button button-ghost" href="/dahab/windsurf/">О виндсёрфинге</a>
        </div>
      </div>
    </div>
  </div>
</section>`.replace(/^[\t ]+$/gm, "");

const vietnamPriceTable = (headers, rows, wide = false) => `
  <div class="windsurf-table-wrap">
    <table class="windsurf-price-table${wide ? " windsurf-price-table--wide" : ""}">
      <thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
  </div>`;

const vietnamPricePage = (page) => {
  const vietnamImg = (name) => `/assets/img/vietnam-source/${name}`;
  const configs = {
    windsurf: {
      eyebrow: "Вьетнам · виндсёрфинг · цены",
      title: "Цены на виндсёрфинг в Муйне",
      lead: "Уроки, курсы, прокат и хранение оборудования на станции Ветратория во Вьетнаме.",
      hero: vietnamImg("aerial.jpg"),
      facts: ["Урок от 65$", "Курс 3 дня — 420$", "Прокат от 35$", "Хранение от 10$"],
      intro: "Можно начать с одного часа, собрать курс на несколько дней или арендовать комплект для самостоятельного катания.",
      sections: [
        {
          eyebrow: "Обучение",
          title: "Занятия и курсы",
          lead: "Во время урока инструктор подбирает оборудование под уровень и фактический ветер.",
          headers: ["Формат", "Продолжительность", "Цена", "Что входит"],
          rows: [
            ["Знакомство с ветром", "1 час", "65$", "Инструктор, оборудование и страховка"],
            ["С ветром знаком", "2 часа", "150$", "Занятие с инструктором и оборудование"],
            ["Курс для начинающих", "3 дня", "420$", "По 1,5 часа обучения в день и самостоятельная практика"],
            ["Недельный курс", "7 дней", "800$", "По 1 часу с инструктором ежедневно и самостоятельная практика"],
            ["Детское занятие", "1 час", "55$", "Лёгкое оборудование и инструктор"],
            ["Индивидуальное занятие", "1 час", "50$", "Работа инструктора; прокат оборудования оплачивается отдельно"]
          ]
        },
        {
          eyebrow: "Самостоятельное катание",
          title: "Прокат виндсёрфинга",
          lead: "Продолжительность можно выбрать от одного часа до четырёх недель.",
          headers: ["Срок проката", "Цена"],
          rows: [["1 час", "35$"], ["1 день", "70$"], ["2 дня", "140$"], ["3 дня", "200$"], ["4 дня", "260$"], ["5 дней", "310$"], ["6 дней", "360$"], ["7 дней", "405$"], ["8 дней", "450$"], ["9 дней", "490$"], ["10 дней", "530$"], ["11 дней", "565$"], ["12 дней", "600$"], ["2 недели", "660$"], ["3 недели", "840$"], ["4 недели", "1000$"]]
        },
        {
          eyebrow: "Своё оборудование",
          title: "Хранение на станции",
          lead: "Оборудование остаётся на станции рядом с точкой выхода на воду.",
          headers: ["Срок хранения", "Цена"],
          rows: [["1 день", "10$"], ["4 дня", "30$"], ["1 неделя", "50$"], ["10 дней", "75$"], ["2 недели", "100$"], ["1 месяц", "150$"]]
        }
      ]
    },
    kite: {
      eyebrow: "Вьетнам · кайтсёрфинг · цены",
      title: "Цены на кайтсёрфинг в Муйне",
      lead: "Индивидуальное обучение на просторном пляже Малибу примерно в шести километрах от станции.",
      hero: vietnamImg("station.jpg"),
      facts: ["Разовый урок — 65$", "Курс — 55$/час", "Спот Малибу", "Снаряжение включено"],
      intro: "Короткий урок подходит для знакомства, а курс на 5–10 часов последовательно ведёт от управления кайтом к старту с доской.",
      sections: [{
        eyebrow: "Обучение",
        title: "Уроки и курс",
        lead: "Все занятия проходят с инструктором и полным комплектом оборудования.",
        headers: ["Формат", "Продолжительность", "Цена", "Что входит"],
        rows: [["Индивидуальный урок", "1 час", "65$", "Инструктор и полный комплект оборудования"], ["Последовательный курс", "5–10 часов", "55$ / час", "Программа от управления кайтом до старта с доской"]]
      }]
    },
    wingfoil: {
      eyebrow: "Вьетнам · вингфойл · цены",
      title: "Цены на вингфойл в Муйне",
      lead: "Индивидуальные и групповые занятия, а также отдельная тренировка на фойле за катером.",
      hero: vietnamImg("community.jpg"),
      facts: ["Индивидуально — 65$", "В группе — 50$", "Группа 2–3 человека", "Фойл за катером — 65$"],
      intro: "Выберите индивидуальный темп, занятие небольшой группой или тренировку баланса на фойле без крыла.",
      sections: [{
        eyebrow: "Обучение",
        title: "Форматы занятий",
        lead: "Крыло, доска и необходимое оборудование входят в стоимость занятия.",
        headers: ["Формат", "Продолжительность", "Цена", "Что входит"],
        rows: [["Индивидуальное занятие", "1 час", "65$", "Инструктор, винг и доска"], ["Занятие в группе", "1 час", "50$ / человек", "Группа из двух–трёх участников"], ["Фойл за катером", "20 минут", "65$", "Индивидуальная тренировка баланса на фойле"]]
      }]
    }
  };
  const data = configs[page.sport];
  return `
<section class="dahab-sport-hero dahab-sport-hero--${page.sport}"><div class="dahab-sport-hero__inner"><div class="dahab-sport-hero__copy"><p class="eyebrow">${data.eyebrow}</p><h1>${data.title}</h1><p>${data.lead}</p><div class="dahab-sport-hero__actions">${contactCta(page, "Записаться", "button button-primary", page.sport)}<a class="button button-ghost" href="/vietnam/${page.sport}/">О спорте</a></div><div class="hero-advantages hero-advantages--sport">${data.facts.map((fact) => `<span class="hero-advantage">${fact}</span>`).join("")}</div></div><figure class="dahab-sport-hero__media"><img src="${data.hero}" alt="${data.title}" loading="eager" decoding="async" fetchpriority="high"></figure></div></section>
<section class="dahab-sport-section dahab-sport-section--location"><div class="dahab-sport-inner">${sectionHeading("Прайс", "Выберите подходящий формат", data.intro)}<div class="dahab-sport-location-atlas"><figure class="dahab-sport-location-atlas__lead"><img src="${data.hero}" alt="${data.title}" loading="lazy" decoding="async"></figure><div class="dahab-sport-location-atlas__grid vietnam-fact-grid">${[["01","Подбор под уровень","Команда уточнит опыт и предложит понятную точку старта."],["02","Снаряжение на месте","Для занятия не нужно привозить собственный комплект."],["03","Сезон ноябрь — март","Основное ветровое окно станции во Вьетнаме."],["04","Связь до поездки","Даты и доступность лучше согласовать с командой заранее."]].map(([number,title,text]) => `<article><span>${number}</span><h3>${title}</h3><p>${text}</p></article>`).join("")}</div></div></div></section>
${data.sections.map((section, index) => `<section class="windsurf-price-section${index % 2 ? " windsurf-price-section--soft" : ""}"><div class="windsurf-price-inner"><header class="windsurf-price-heading"><p class="eyebrow">${section.eyebrow}</p><h2>${section.title}</h2><p>${section.lead}</p></header>${vietnamPriceTable(section.headers, section.rows, section.headers.length > 2)}</div></section>`).join("")}
<section class="windsurf-price-section windsurf-price-section--dark"><div class="windsurf-price-inner"><div class="windsurf-price-contact"><figure><img src="${vietnamImg("station.jpg")}" alt="Станция Ветратория во Вьетнаме" width="900" height="600" loading="lazy" decoding="async"></figure><div><p class="eyebrow">Запись</p><h2>Подобрать занятие в Муйне</h2><p>Напишите даты, уровень и выбранную дисциплину. Команда проверит расписание и подберёт формат.</p><div class="windsurf-price-contact__actions">${contactCta(page, "Оставить заявку", "button button-primary", page.sport)}<a class="button button-ghost" href="/vietnam/contacts/">Контакты</a></div></div></div></div></section>`;
};

const russiaPricePage = (page) => {
  const configs = {
    windsurf: {
      title: "Цены на виндсёрфинг на Должанской",
      lead: "Обучение для взрослых и детей, прокат учебного и профессионального оборудования.",
      hero: russiaImg("windsurf.jpg"),
      facts: ["Урок — 5 000 ₽", "Курс 3 часа — 11 000 ₽", "Детский урок — 4 500 ₽", "Прокат от 2 500 ₽"],
      sections: [
        { eyebrow:"Обучение", title:"Индивидуально и в группе", lead:"В группах занимаются от двух до четырёх человек. Страхование оборудования включено в учебные программы.", headers:["Формат","Состав","Цена","Практика"], rows:[
          ["Знакомство с ветром · 1 час","Индивидуально","5 000 ₽","1 час с инструктором"],["Знакомство с ветром · 1 час","Группа","4 500 ₽ / человек","1 час с инструктором"],
          ["Курс · 3 часа","Индивидуально","11 000 ₽","2 часа с инструктором + 1 час самостоятельно"],["Курс · 3 часа","Группа","9 400 ₽ / человек","2 часа с инструктором + 1 час самостоятельно"],
          ["Курс · 7 часов","Индивидуально","27 000 ₽","5 часов с инструктором + 2 часа самостоятельно"],["Курс · 7 часов","Группа","23 000 ₽ / человек","5 часов с инструктором + 2 часа самостоятельно"],
          ["Плотный недельный курс","Индивидуально","50 000 ₽","7 часов с инструктором + самостоятельная практика"],["Плотный недельный курс","Группа","40 000 ₽ / человек","7 часов с инструктором + самостоятельная практика"]
        ]},
        { eyebrow:"Дети до 16 лет", title:"Детские занятия", lead:"Лёгкое оборудование и программа под возраст и темп ребёнка.", headers:["Формат","Индивидуально","В группе"], rows:[["Занятие · 1 час","4 500 ₽","4 000 ₽ / человек"],["Курс · 10 часов","40 000 ₽","36 000 ₽ / человек"]]},
        { eyebrow:"Своё или арендованное оборудование", title:"Работа инструктора", lead:"Стоимость только работы инструктора; оборудование оплачивается отдельно.", headers:["Формат","Индивидуально","В группе"], rows:[["1 час","4 200 ₽","3 700 ₽ / человек"],["10 часов","38 000 ₽","32 000 ₽ / человек"]]},
        { eyebrow:"Прокат", title:"Учебное и профессиональное оборудование", lead:"Страховой взнос обязателен, оплачивается отдельно и не возвращается. Он не покрывает потерю оборудования, столкновения и повреждения на берегу.", headers:["Срок","Учебный комплект","Страховка","Профессиональный комплект","Страховка"], rows:[
          ["1 час","2 500 ₽","400 ₽","3 000 ₽","600 ₽"],["1 день","5 500 ₽","1 100 ₽","8 500 ₽","1 600 ₽"],["2 дня","10 000 ₽","1 600 ₽","15 400 ₽","2 100 ₽"],["3 дня","13 500 ₽","2 300 ₽","20 700 ₽","2 600 ₽"],["4 дня","16 800 ₽","2 500 ₽","24 800 ₽","2 900 ₽"],["5 дней","20 000 ₽","2 700 ₽","28 500 ₽","3 300 ₽"],["6 дней","22 200 ₽","3 000 ₽","31 200 ₽","3 500 ₽"],["7 дней","23 800 ₽","3 300 ₽","32 900 ₽","3 700 ₽"],["8 дней","25 600 ₽","3 300 ₽","33 600 ₽","3 700 ₽"],["9 дней","26 100 ₽","3 300 ₽","34 650 ₽","3 600 ₽"],["10 дней","27 500 ₽","3 600 ₽","36 000 ₽","3 900 ₽"],["11 дней","28 600 ₽","3 600 ₽","37 950 ₽","3 900 ₽"],["12 дней","29 400 ₽","3 600 ₽","39 600 ₽","4 000 ₽"],["13 дней","29 900 ₽","3 600 ₽","40 950 ₽","4 000 ₽"],["14 дней","30 100 ₽","3 900 ₽","43 400 ₽","4 100 ₽"],["Дополнительный день","2 000 ₽","250 ₽","3 000 ₽","300 ₽"]
        ]}
      ],
      note: "Семейный прокат одного комплекта на двоих — доплата 30%."
    },
    wingfoil: {
      title:"Цены на вингфойл на Должанской", lead:"Индивидуальные и групповые занятия, курс и прокат комплекта.", hero:russiaImg("wingfoil.jpg"), facts:["Урок — 5 000 ₽","Группа — 4 500 ₽","Курс — 45 000 ₽","Прокат от 3 500 ₽"], sections:[
        {eyebrow:"Обучение",title:"Занятия и курс",lead:"Группа — от двух до четырёх человек.",headers:["Формат","Индивидуально","В группе"],rows:[["1 час","5 000 ₽","4 500 ₽ / человек"],["Курс · 10 часов","45 000 ₽","40 000 ₽ / человек"],["Каждый следующий час","4 500 ₽","4 000 ₽ / человек"]]},
        {eyebrow:"Прокат",title:"Комплект для самостоятельного катания",lead:"Страховой взнос оплачивается отдельно.",headers:["Срок","Прокат","Страховка"],rows:[["1 час","3 500 ₽","500 ₽"],["1 день","10 000 ₽","1 000 ₽"],["2 дня","18 000 ₽","1 500 ₽"],["3 дня","24 000 ₽","2 000 ₽"],["4 дня","28 000 ₽","2 500 ₽"],["5 дней","32 500 ₽","3 000 ₽"],["6 дней","36 000 ₽","3 500 ₽"],["7 дней","38 500 ₽","4 000 ₽"],["Дополнительный день","5 000 ₽","500 ₽"]]}
      ]
    },
    kite: {
      title:"Цены на кайтсёрфинг на Должанской", lead:"Обучение, прокат и хранение оборудования на станции.", hero:russiaImg("kite.jpg"), facts:["Урок — 6 000 ₽","Курс — 54 000 ₽","Прокат от 3 500 ₽","Хранение от 1 000 ₽"], sections:[
        {eyebrow:"Обучение",title:"Индивидуально и в группе",lead:"В обучение входят инструктор, кайт, доска, трапеция, жилет, шлем, страховка оборудования и сервис станции.",headers:["Формат","Продолжительность","Цена"],rows:[["Индивидуальный урок","1 час","6 000 ₽"],["Индивидуальный курс","10 часов","54 000 ₽"],["Занятие в группе","1 час","5 500 ₽ / человек"],["Выезд на остров","По программе","15 000 ₽"]]},
        {eyebrow:"Самостоятельно",title:"Прокат",lead:"После индивидуального курса 10 часов действует скидка 50% на последующий прокат.",headers:["Срок","Цена"],rows:[["1 час","3 500 ₽"],["3 часа","8 000 ₽"],["1 день","10 000 ₽"]]},
        {eyebrow:"Своё оборудование",title:"Хранение",lead:"Один комплект хранения: доска и два кайта.",headers:["Срок","Цена"],rows:[["1 день","1 000 ₽"],["1 неделя","5 000 ₽"]]}
      ]
    }
  };
  const data = configs[page.sport];
  return `
<section class="dahab-sport-hero dahab-sport-hero--${page.sport}"><div class="dahab-sport-hero__inner"><div class="dahab-sport-hero__copy"><p class="eyebrow">Россия · ${site.sports[page.sport].nav} · цены</p><h1>${data.title}</h1><p>${data.lead}</p><div class="dahab-sport-hero__actions">${contactCta(page,"Записаться","button button-primary",page.sport)}<a class="button button-ghost" href="/russia/${page.sport}/">О спорте</a></div><div class="hero-advantages hero-advantages--sport">${data.facts.map(f=>`<span class="hero-advantage">${f}</span>`).join("")}</div></div><figure class="dahab-sport-hero__media"><img src="${data.hero}" alt="${data.title}" loading="eager" decoding="async" fetchpriority="high"></figure></div></section>
<section class="dahab-sport-section dahab-sport-section--location"><div class="dahab-sport-inner">${sectionHeading("Прайс 2026", "Выберите формат", "Цены приведены в рублях. Даты, расписание и доступность оборудования команда подтверждает перед записью.")}<div class="dahab-sport-location-atlas"><figure class="dahab-sport-location-atlas__lead"><img src="${russiaImg("training.jpg")}" alt="Станция Ветратория" loading="lazy" decoding="async"></figure><div class="dahab-sport-location-atlas__grid vietnam-fact-grid">${[["01","Подбор под уровень","Команда уточнит опыт и цель."],["02","Снаряжение на месте","Учебный комплект готовит станция."],["03","Май — сентябрь","Основной сезон направления."],["04","Запись заранее","Подтвердите время и условия до поездки."]].map(([n,t,x])=>`<article><span>${n}</span><h3>${t}</h3><p>${x}</p></article>`).join("")}</div></div></div></section>
${data.sections.map((section,index)=>`<section class="windsurf-price-section${index%2?" windsurf-price-section--soft":""}"><div class="windsurf-price-inner"><header class="windsurf-price-heading"><p class="eyebrow">${section.eyebrow}</p><h2>${section.title}</h2><p>${section.lead}</p></header>${vietnamPriceTable(section.headers,section.rows,section.headers.length>3)}</div></section>`).join("")}
${data.note?`<section class="windsurf-price-section windsurf-price-section--soft"><div class="windsurf-price-inner"><div class="price-help-cta"><div><b>Семейный формат</b><p>${data.note}</p></div></div></div></section>`:""}
<section class="windsurf-price-section windsurf-price-section--dark"><div class="windsurf-price-inner"><div class="windsurf-price-contact"><figure><img src="${russiaImg("station.jpg")}" alt="Коса Долгая" loading="lazy" decoding="async"></figure><div><p class="eyebrow">Запись</p><h2>Подобрать занятие на Должанской</h2><p>Напишите даты, уровень и дисциплину. Команда проверит расписание, ветер и доступность комплекта.</p><div class="windsurf-price-contact__actions">${contactCta(page,"Оставить заявку","button button-primary",page.sport)}<a class="button button-ghost" href="/russia/contacts/">Контакты</a></div></div></div></div></section>`;
};

const pricePage = (page) => {
  if (page.country === "vietnam") return vietnamPricePage(page);
  if (page.country === "russia") return russiaPricePage(page);
  if (page.country === "dahab" && page.sport === "wingfoil") return dahabWingfoilPricePage(page);
  if (page.country === "dahab" && page.sport === "windsurf") return dahabWindsurfPricePage(page);

  const country = countriesByKey[page.country];
  const sport = page.sport ? site.sports[page.sport] : null;
  const title = sport ? sport.title : "Ветратория";
  const isDahabKidsPrice = page.country === "dahab" && page.sport === "windsurf-kids";
  return `${hero(page, `${contactCta(page, "Уточнить цену")}<a class="button button-ghost" href="/${country.key}/">К направлению</a>`)}
  <section class="content-section">
    <div class="section-inner">
      ${sectionHeading("Прайс", "Форматы и стоимость", isDahabKidsPrice ? "" : "Цены зависят от ветра, сезона, инструктора, комплекта и длительности программы. Финальную доступность лучше подтвердить перед поездкой.")}
      <div class="price-table">
        ${priceRows(title, { showServiceDetails: !isDahabKidsPrice }).map((row) => `<article><b>${row[0]}</b><span>${row[1]}</span><span>${row[2]}</span><em>${row[3]}</em></article>`).join("")}
      </div>
    </div>
  </section>`;
};

const blogFilterButton = (type, value, label, active = false) =>
  `<button class="blog-filter-button" type="button" data-blog-filter-type="${type}" data-blog-filter-value="${value}" aria-pressed="${active ? "true" : "false"}">${label}</button>`;

const blogFilterPanel = () => `
    ${sectionHeading("Фильтры", "Выберите тему", "Нажмите нужный фильтр — карточки ниже перестроятся по стране, спорту или теме. Поиск работает по заголовку и описанию.")}
    <div class="blog-filter-panel" data-blog-filter-panel>
      <div class="blog-filter-group" role="group" aria-label="Фильтр по стране">
        ${blogFilterButton("country", "all", "Все страны", true)}
        ${blogFilterButton("country", "dahab", "Египет")}
        ${blogFilterButton("country", "vietnam", "Вьетнам")}
        ${blogFilterButton("country", "russia", "Россия")}
      </div>
      <div class="blog-filter-group" role="group" aria-label="Фильтр по теме">
        ${blogFilterButton("topic", "all", "Все темы", true)}
        ${blogFilterButton("topic", "wingfoil", "Вингфойл")}
        ${blogFilterButton("topic", "windsurf", "Виндсёрфинг")}
        ${blogFilterButton("topic", "wsk", "Детский лагерь")}
        ${blogFilterButton("topic", "kite", "Кайт")}
        ${blogFilterButton("topic", "safety", "Безопасность")}
        ${blogFilterButton("topic", "trip", "Поездка")}
      </div>
      <label class="blog-filter-search">
        <span>Поиск по блогу</span>
        <input type="search" data-blog-filter-search placeholder="Поиск по блогу" autocomplete="off">
      </label>
    </div>
    <p class="blog-filter-status" data-blog-filter-status aria-live="polite"></p>`;

const vietnamBlogPage = (page) => {
  const vietnamImg = (name) => `/assets/img/vietnam-source/${name}`;
  const cards = [
    ["Виндсёрфинг", "Виндсёрфинг в Муйне: ветер, волна и сезон", "Как подготовиться к занятиям, выбрать формат и использовать сезон с ноября по март.", vietnamImg("aerial.jpg"), "/vietnam/blog/windsurf/"],
    ["Вингфойл", "Вингфойл во Вьетнаме", "Путь от управления крылом до первых полётов и отдельная тренировка на фойле за катером.", vietnamImg("community.jpg"), "/vietnam/blog/wingfoil/"],
    ["Кайтсёрфинг", "Кайт на пляже Малибу", "Что важно знать о споте, последовательности обучения и подготовке к первому уроку.", vietnamImg("station.jpg"), "/vietnam/blog/kite/"]
  ];
  return `
<section class="dahab-sport-hero"><div class="dahab-sport-hero__inner"><div class="dahab-sport-hero__copy"><p class="eyebrow">Вьетнам · полезное</p><h1>Гид по спорту в Муйне</h1><p>Сезон, обучение, споты и практические ответы для тех, кто планирует поездку в Ветраторию во Вьетнаме.</p><div class="dahab-sport-hero__actions"><a class="button button-primary" href="#guides">Читать материалы</a><a class="button button-ghost" href="/vietnam/">Обзор направления</a></div><div class="hero-advantages hero-advantages--sport"><span class="hero-advantage">Три дисциплины</span><span class="hero-advantage">Сезон ноябрь — март</span><span class="hero-advantage">Цены и форматы</span><span class="hero-advantage">Советы перед стартом</span></div></div><figure class="dahab-sport-hero__media"><img src="${vietnamImg("surf.jpg")}" alt="Спорт и обучение во Вьетнаме" loading="eager" decoding="async" fetchpriority="high"></figure></div></section>
<section class="dahab-sport-section" id="guides"><div class="dahab-sport-inner">${sectionHeading("Материалы", "Выберите свою дисциплину", "Три коротких гида помогут понять условия, порядок обучения и следующий шаг после первого занятия.")}<div class="dahab-sport-useful">${cards.map(([label,title,text,image,href]) => `<a href="${href}"><img src="${image}" alt="${title}" loading="lazy" decoding="async"><span>${label}</span><h3>${title}</h3><p>${text}</p><em>Открыть гид →</em></a>`).join("")}</div></div></section>
<section class="dahab-sport-section dahab-sport-section--soft"><div class="dahab-sport-inner dahab-sport-safety"><div class="dahab-sport-safety__copy"><p class="eyebrow">План поездки</p><h2>Сначала даты, затем спорт и формат</h2><p>Основной сезон станции длится с ноября по март. Команда уточнит фактические условия, подберёт дисциплину и поможет собрать занятия на несколько дней.</p><div class="dahab-sport-safety__list"><span>Выберите даты и продолжительность</span><span>Расскажите об опыте на воде</span><span>Уточните: урок, курс или прокат</span></div>${contactCta(page, "Обсудить поездку")}</div><div class="dahab-sport-safety__media"><img src="${vietnamImg("station.jpg")}" alt="Станция Ветратория в Муйне" loading="lazy" decoding="async"></div></div></section>`;
};

const vietnamArticlePage = (page) => {
  const vietnamImg = (name) => `/assets/img/vietnam-source/${name}`;
  const configs = {
    windsurf: {
      eyebrow: "Вьетнам · гид по виндсёрфингу",
      title: "Виндсёрфинг в Муйне: сезон, уроки и прокат",
      lead: "Как построить поездку от первого знакомства с парусом до самостоятельного катания на оборудовании станции.",
      hero: vietnamImg("aerial.jpg"),
      facts: ["Ноябрь — март", "Урок от 65$", "Прокат от 35$", "Курсы 3 и 7 дней"],
      stages: [["01","Первый час","Разбираете ветер, положение тела и управление парусом, затем выходите на воду с инструктором."],["02","Курс на несколько дней","Последовательные занятия помогают закрепить старт, курс и повороты без длинных пауз."],["03","Самостоятельная практика","После оценки уровня можно арендовать комплект на час, день или более длительный срок."]],
      prepare: ["Купальный комплект и защита от солнца", "Информация о предыдущем опыте", "Даты и количество дней на станции"],
      priceHref: "/vietnam/windsurf/price/"
    },
    wingfoil: {
      eyebrow: "Вьетнам · гид по вингфойлу",
      title: "Вингфойл в Муйне: путь к первому полёту",
      lead: "Управление крылом, баланс на доске и работа с фойлом — поэтапно и на оборудовании станции.",
      hero: vietnamImg("community.jpg"),
      facts: ["Индивидуально 65$", "В группе 50$", "Группа 2–3 человека", "Фойл за катером"],
      stages: [["01","Контроль крыла","На берегу разбираете хват, смену стороны и управление тягой."],["02","Крыло и доска","Соединяете движение с балансом и учитесь возвращаться к месту старта."],["03","Работа с фойлом","Отрабатываете подъём и высоту; тренировку баланса можно провести отдельно за катером."]],
      prepare: ["Опыт не обязателен", "Формат: индивидуально или в группе", "Готовность начать с базовых упражнений"],
      priceHref: "/vietnam/wingfoil/price/"
    },
    kite: {
      eyebrow: "Вьетнам · гид по кайтсёрфингу",
      title: "Кайтсёрфинг на пляже Малибу",
      lead: "Отдельный спот рядом с Муйне, последовательное обучение и достаточно пространства для базовых упражнений.",
      hero: vietnamImg("station.jpg"),
      facts: ["Около 6 км от станции", "Разовый урок 65$", "Курс 5–10 часов", "Комплект включён"],
      stages: [["01","Ветер и безопасность","Разбираете ветровое окно, сигналы, устройство кайта и правила учебной зоны."],["02","Управление и бодидраг","Учитесь контролировать крыло, двигаться в воде и возвращаться к доске."],["03","Старт с доской","Соединяете тягу кайта, положение доски и первые контролируемые проходы."]],
      prepare: ["Занятия проходят на Малибу", "На споте есть хранение, душ и переодевание", "Курс выгоднее при программе от пяти часов"],
      priceHref: "/vietnam/kite/price/"
    }
  };
  const data = configs[page.sport];
  return `
<section class="dahab-sport-hero dahab-sport-hero--${page.sport}"><div class="dahab-sport-hero__inner"><div class="dahab-sport-hero__copy"><p class="eyebrow">${data.eyebrow}</p><h1>${data.title}</h1><p>${data.lead}</p><div class="dahab-sport-hero__actions"><a class="button button-primary" href="${data.priceHref}">Смотреть цены</a>${contactCta(page, "Задать вопрос", "button button-ghost", page.sport)}</div><div class="hero-advantages hero-advantages--sport">${data.facts.map((fact) => `<span class="hero-advantage">${fact}</span>`).join("")}</div></div><figure class="dahab-sport-hero__media"><img src="${data.hero}" alt="${data.title}" loading="eager" decoding="async" fetchpriority="high"></figure></div></section>
${seasonSection([countriesByKey.vietnam], { compact: true, eyebrow: "Муйне · сезон", title: "Главное ветровое окно — с ноября по март", lead: "Фактические условия меняются, поэтому перед занятием команда сверяет прогноз и выбирает подходящий формат." })}
<section class="dahab-sport-section"><div class="dahab-sport-inner">${sectionHeading("Маршрут", "Как строится прогресс", "Задачи идут последовательно: сначала контроль и безопасность, затем новые элементы и самостоятельная практика.")}<div class="dahab-sport-process vietnam-process--three">${data.stages.map(([number,title,text],index) => `<article><img src="${[data.hero,vietnamImg("station.jpg"),vietnamImg("atmosphere.jpg")][index]}" alt="${title}" loading="lazy" decoding="async"><div><span>${number}</span><h3>${title}</h3><p>${text}</p></div></article>`).join("")}</div></div></section>
<section class="dahab-sport-section dahab-sport-section--soft"><div class="dahab-sport-inner dahab-sport-safety"><div class="dahab-sport-safety__copy"><p class="eyebrow">Перед занятием</p><h2>Что сообщить команде</h2><p>Так инструктор заранее предложит реалистичный формат и подготовит подходящее оборудование.</p><div class="dahab-sport-safety__list">${data.prepare.map((item) => `<span>${item}</span>`).join("")}</div><a class="button button-primary" href="${data.priceHref}">Открыть полный прайс</a></div><div class="dahab-sport-safety__media"><img src="${vietnamImg("station.jpg")}" alt="Ветратория во Вьетнаме" loading="lazy" decoding="async"></div></div></section>
<section class="dahab-sport-cta"><img src="${data.hero}" alt="${data.title}" loading="lazy" decoding="async"><div class="dahab-sport-cta__inner"><p class="eyebrow">Муйне</p><h2>Соберём программу под ваши даты</h2><p>Напишите уровень и продолжительность поездки — команда поможет выбрать занятие, курс или прокат.</p><div>${contactCta(page, "Оставить заявку", "button button-primary", page.sport)}<a class="button button-ghost" href="/vietnam/blog/">Все материалы</a></div></div></section>`;
};

const russiaBlogPage = (page) => {
  const cards = [
    ["Виндсёрфинг","Виндсёрфинг на Должанской: обучение и прокат","Почему мелкая вода помогает новичкам и как перейти от первого урока к самостоятельной практике.",russiaImg("windsurf.jpg"),"/russia/blog/windsurf/"],
    ["Вингфойл","Вингфойл на косе Долгой","Как построить путь от управления крылом до первых устойчивых полётов.",russiaImg("wingfoil.jpg"),"/russia/blog/wingfoil/"],
    ["Кайтсёрфинг","Кайт на Должанской","Учебная акватория, порядок занятия и детали, которые стоит согласовать до первого старта.",russiaImg("kite.jpg"),"/russia/blog/kite/"]
  ];
  return `<section class="dahab-sport-hero"><div class="dahab-sport-hero__inner"><div class="dahab-sport-hero__copy"><p class="eyebrow">Россия · полезное</p><h1>Гид по спорту на Должанской</h1><p>Сезон, обучение, акватория и цены для тех, кто планирует поездку на косу Долгую.</p><div class="dahab-sport-hero__actions"><a class="button button-primary" href="#guides">Читать материалы</a><a class="button button-ghost" href="/russia/">Обзор направления</a></div><div class="hero-advantages hero-advantages--sport"><span class="hero-advantage">Три дисциплины</span><span class="hero-advantage">Май — середина сентября</span><span class="hero-advantage">Две акватории</span><span class="hero-advantage">Прайс 2026</span></div></div><figure class="dahab-sport-hero__media"><img src="${russiaImg("station.jpg")}" alt="Коса Долгая" loading="eager" decoding="async" fetchpriority="high"></figure></div></section><section class="dahab-sport-section" id="guides"><div class="dahab-sport-inner">${sectionHeading("Материалы","Выберите дисциплину","Короткие гиды объясняют условия, порядок обучения и следующий шаг после первого занятия.")}<div class="dahab-sport-useful">${cards.map(([label,title,text,image,href])=>`<a href="${href}"><img src="${image}" alt="${title}" loading="lazy" decoding="async"><span>${label}</span><h3>${title}</h3><p>${text}</p><em>Открыть гид →</em></a>`).join("")}</div></div></section><section class="dahab-sport-section dahab-sport-section--soft"><div class="dahab-sport-inner dahab-sport-safety"><div class="dahab-sport-safety__copy"><p class="eyebrow">План поездки</p><h2>Даты, дисциплина, уровень</h2><p>Сообщите команде эти три вещи заранее — так проще проверить расписание и подготовить подходящий комплект.</p><div class="dahab-sport-safety__list"><span>Выберите даты поездки</span><span>Расскажите об опыте</span><span>Уточните: урок, курс или прокат</span></div>${contactCta(page,"Обсудить поездку")}</div><div class="dahab-sport-safety__media"><img src="${russiaImg("training.jpg")}" alt="Станция Ветратория" loading="lazy" decoding="async"></div></div></section>`;
};

const russiaArticlePage = (page) => {
  const configs = {
    windsurf:{title:"Виндсёрфинг на Должанской: от первого галса до проката",lead:"Мелкая вода, выбор стороны косы и последовательная программа помогают начать без лишней спешки.",hero:russiaImg("windsurf.jpg"),facts:["Урок 5 000 ₽","Курс от 11 000 ₽","Детские занятия","Учебный и профпрокат"],stages:[["01","Первое занятие","Парус, положение тела, курс и безопасное возвращение к берегу."],["02","Курс","Несколько часов с инструктором чередуются с самостоятельной практикой."],["03","Прокат","После оценки уровня можно выбрать учебный или профессиональный комплект."]],price:"/russia/windsurf/price/"},
    wingfoil:{title:"Вингфойл на Должанской: путь к первому полёту",lead:"Отдельно ставим контроль крыла, баланс на доске и управление высотой на фойле.",hero:russiaImg("wingfoil.jpg"),facts:["Урок 5 000 ₽","Группа 4 500 ₽","Курс 10 часов","Прокат от 3 500 ₽"],stages:[["01","Крыло","Учимся управлять тягой на берегу."],["02","Доска","Соединяем крыло, движение и возврат к точке старта."],["03","Фойл","Набираем скорость и контролируем плавный подъём."]],price:"/russia/wingfoil/price/"},
    kite:{title:"Кайтсёрфинг на Должанской: как начать безопасно",lead:"Сначала система безопасности и контроль кайта, затем вода, бодидраг и старт с доской.",hero:russiaImg("kite.jpg"),facts:["Урок 6 000 ₽","Курс 54 000 ₽","Защита включена","Прокат и хранение"],stages:[["01","Безопасность","Ветровое окно, страховка, сигналы и сборка комплекта."],["02","Контроль кайта","Управление крылом и движение в воде без доски."],["03","Водный старт","Соединяем тягу кайта, положение доски и первые проходы."]],price:"/russia/kite/price/"}
  };
  const data=configs[page.sport];
  return `<section class="dahab-sport-hero dahab-sport-hero--${page.sport}"><div class="dahab-sport-hero__inner"><div class="dahab-sport-hero__copy"><p class="eyebrow">Россия · гид по ${site.sports[page.sport].nav.toLowerCase()}</p><h1>${data.title}</h1><p>${data.lead}</p><div class="dahab-sport-hero__actions"><a class="button button-primary" href="${data.price}">Смотреть цены</a>${contactCta(page,"Задать вопрос","button button-ghost",page.sport)}</div><div class="hero-advantages hero-advantages--sport">${data.facts.map(x=>`<span class="hero-advantage">${x}</span>`).join("")}</div></div><figure class="dahab-sport-hero__media"><img src="${data.hero}" alt="${data.title}" loading="eager" decoding="async" fetchpriority="high"></figure></div></section>${seasonSection([countriesByKey.russia],{compact:true,eyebrow:"Должанская · сезон",title:"Основной сезон — с мая до середины сентября",lead:"Фактические условия меняются, поэтому перед занятием команда сверяет прогноз и выбирает акваторию."})}<section class="dahab-sport-section"><div class="dahab-sport-inner">${sectionHeading("Маршрут","Как строится прогресс","Сначала контроль и безопасность, затем новый элемент и самостоятельная практика.")}<div class="dahab-sport-process vietnam-process--three">${data.stages.map(([n,t,x],i)=>`<article><img src="${[data.hero,russiaImg("flat.jpg"),russiaImg("training.jpg")][i]}" alt="${t}" loading="lazy" decoding="async"><div><span>${n}</span><h3>${t}</h3><p>${x}</p></div></article>`).join("")}</div></div></section><section class="dahab-sport-section dahab-sport-section--soft"><div class="dahab-sport-inner dahab-sport-safety"><div class="dahab-sport-safety__copy"><p class="eyebrow">Перед занятием</p><h2>Что сообщить команде</h2><p>Даты, опыт и желаемый формат помогут заранее проверить расписание и подготовить комплект.</p><div class="dahab-sport-safety__list"><span>Количество дней на Должанской</span><span>Предыдущий опыт на воде</span><span>Урок, курс или прокат</span></div><a class="button button-primary" href="${data.price}">Открыть полный прайс</a></div><div class="dahab-sport-safety__media"><img src="${russiaImg("station.jpg")}" alt="Коса Долгая" loading="lazy" decoding="async"></div></div></section>`;
};

const blogIndex = (page) => {
  if (page.country === "vietnam") return vietnamBlogPage(page);
  if (page.country === "russia") return russiaBlogPage(page);
  const pageArticles = page.articles || articles;
  const hasFilters = page.path === "/blog/";
  return `
${hero(page, contactCta(page, "Задать вопрос"))}
<section class="content-section"${hasFilters ? ` data-blog-filter-root` : ""}>
  <div class="section-inner">
    ${hasFilters ? blogFilterPanel() : sectionHeading(page.eyebrow, page.title, page.description)}
    <div class="article-grid"${hasFilters ? ` data-blog-filter-list` : ""}>
      ${pageArticles.map((article) => `
        <a class="article-card" href="${article.href}"${hasFilters ? ` data-blog-filter-card data-blog-country="${article.country}" data-blog-topics="${(article.topics || [article.sport]).join(" ")}" data-blog-search="${escapeHtml(`${countriesByKey[article.country].title} ${site.sports[article.sport].nav} ${article.title} ${article.lead}`)}"` : ""}>
          ${cardImage(article.image, article.title)}
          <small>${countriesByKey[article.country].title} · ${site.sports[article.sport].nav}</small>
          <h3>${article.title}</h3>
          <p>${article.lead}</p>
        </a>`).join("")}${hasFilters ? `
      <p class="blog-filter-empty" data-blog-filter-empty hidden>По вашему запросу материалов пока нет. Измените фильтр или текст поиска.</p>` : ""}
    </div>
  </div>
</section>`;
};

const articlePage = (page) => {
  if (page.country === "vietnam") return vietnamArticlePage(page);
  if (page.country === "russia") return russiaArticlePage(page);
  const sport = site.sports[page.sport];
  const country = countriesByKey[page.country];
  const sportHref = page.country === "dahab" && page.sport === "windsurf-kids"
    ? "https://windsurfkids.su/"
    : `/${country.key}/${page.sport}/`;
  const sportLinkAttrs = sportHref.startsWith("https://") ? ` target="_blank" rel="noopener noreferrer"` : "";
  return `${hero(page, `<a class="button button-primary" href="${sportHref}"${sportLinkAttrs}>Открыть спорт</a>${contactCta(page, "Написать нам", "button button-ghost")}`)}
  <article class="content-section article-body">
    <div class="article-inner">
      <p class="eyebrow">${country.region} · ${sport.nav}</p>
      <h2>Главное перед стартом</h2>
      <p>${page.description}</p>
      ${country.key === "dahab" ? "" : "<p>Перед поездкой важно понять не только название спорта, но и реальный сценарий: где проходит занятие, какое снаряжение подходит, сколько времени заложить на первые шаги и что будет следующим уровнем после вводного урока.</p>"}
      <h2>Как строится занятие</h2>
      ${country.key === "dahab" ? "" : "<p>Инструктор объясняет ветер и акваторию, подбирает комплект, ставит короткую техническую задачу и ведет ученика по воде. После занятия остается понятный план: повторить базу, перейти на курс, взять прокат или выбрать другой формат.</p>"}
      <div class="check-list check-list--inline">
        ${sport.bullets.map((item) => `<span>${item}</span>`).join("")}
      </div>
    </div>
  </article>`;
};

const mediaSportLabels = {
  wingfoil: "Вингфойл",
  windsurf: "Виндсёрфинг",
  wsk: "Детский виндсёрфинг",
  kite: "Кайтсёрфинг"
};

const mediaEventLabels = {
  training: "Тренировка",
  camp: "Лагерь",
  "photo-day": "Фото дня",
  competition: "Соревнование",
  station: "Жизнь станции",
  trip: "Поездка"
};

const formatMediaDate = (value) =>
  new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" })
    .format(new Date(`${value}T12:00:00`));

const mediaCountLabel = (count, one, few, many) => {
  const mod100 = count % 100;
  const mod10 = count % 10;
  if (mod100 >= 11 && mod100 <= 19) return `${count} ${many}`;
  if (mod10 === 1) return `${count} ${one}`;
  if (mod10 >= 2 && mod10 <= 4) return `${count} ${few}`;
  return `${count} ${many}`;
};

const mediaCountryDescriptions = {
  dahab: "Вингфойл, Виндсёрфинг, Детский виндсёрфинг, станции и события Дахаба.",
  vietnam: "Сезон в Муйне, Виндсёрфинг, Вингфойл, Кайтсёрфинг и жизнь станции.",
  russia: "Должанская коса, летние тренировки, команда и события."
};

const mediaLandingPage = (page) => `
${hero(page, `<a class="button button-primary" href="#media-countries">Выбрать страну</a>`)}
<section class="content-section media-country-section" id="media-countries">
  <div class="section-inner">
    ${sectionHeading("Страны", "Выберите медиатеку", "Сначала выберите направление, затем альбом. Внутри можно открыть фотографию и скачать оригинальный файл.")}
    <div class="media-country-grid">
      ${countryList.map((country) => {
        const countryMedia = allPages.find((candidate) => candidate.kind === "media-country" && candidate.country === country.key);
        const count = countryMedia?.albums?.length || 0;
        return `
        <a class="media-country-card" href="/media/${country.key}/">
          <img src="${country.hero}" alt="Медиа ${escapeHtml(country.region)}" loading="lazy" decoding="async">
          <span class="media-country-card__shade"></span>
          <span class="media-country-card__content">
            <small>${escapeHtml(`${country.region} · ${country.city}`)}</small>
            <strong>Медиа ${escapeHtml(country.region)}</strong>
            <em>${escapeHtml(mediaCountryDescriptions[country.key])}</em>
            <b>${mediaCountLabel(count, "альбом", "альбома", "альбомов")} · открыть →</b>
          </span>
        </a>`;
      }).join("")}
    </div>
  </div>
</section>`;

const mediaFilterSelect = (name, label, values, labels, allLabel) => `
        <label class="media-filter-field">
          <span>${label}</span>
          <select data-media-filter="${name}">
            <option value="all">${allLabel}</option>
            ${values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(labels[value] || value)}</option>`).join("")}
          </select>
        </label>`;

const mediaAlbumCard = (country, album) => `
      <a class="media-album-card" href="/media/${country.key}/${album.slug}/"
        data-media-filter-card
        data-media-year="${album.date.slice(0, 4)}"
        data-media-sport="${album.sport}"
        data-media-event="${album.event}"
        data-media-search="${escapeHtml(`${album.title} ${album.description} ${mediaSportLabels[album.sport]} ${mediaEventLabels[album.event]}`)}">
        <span class="media-album-card__media">
          <img src="${album.cover}" alt="${escapeHtml(album.title)}" loading="lazy" decoding="async">
          <time datetime="${album.date}">${escapeHtml(formatMediaDate(album.date))}</time>
        </span>
        <span class="media-album-card__content">
          <small>${escapeHtml(mediaSportLabels[album.sport])} · ${escapeHtml(mediaEventLabels[album.event])}</small>
          <strong>${escapeHtml(album.title)}</strong>
          <em>${escapeHtml(album.description)}</em>
          <span><b>${mediaCountLabel(album.photos.length, "фотография", "фотографии", "фотографий")}</b><i>Открыть альбом →</i></span>
        </span>
      </a>`;

const mediaCountryPage = (page) => {
  const country = countriesByKey[page.country];
  const albums = page.albums || [];
  const years = [...new Set(albums.map((album) => album.date.slice(0, 4)))].sort((a, b) => b.localeCompare(a));
  const sports = [...new Set(albums.map((album) => album.sport))];
  const events = [...new Set(albums.map((album) => album.event))];

  return `
${hero(page, `<a class="button button-primary" href="#media-albums">Смотреть альбомы</a><a class="button button-ghost" href="/media/">Все страны</a>`)}
<section class="content-section" id="media-albums" data-media-filter-root>
  <div class="section-inner">
    ${sectionHeading("Альбомы", `Медиа: ${country.city}`, country.key === "dahab" ? "" : "Выберите год, вид спорта или событие. Поиск работает по названию и описанию альбома.")}
    <div class="media-filter-panel">
      ${mediaFilterSelect("year", "Год", years, {}, "Все годы")}
      ${mediaFilterSelect("sport", "Спорт", sports, mediaSportLabels, "Все виды спорта")}
      ${mediaFilterSelect("event", "Событие", events, mediaEventLabels, "Все события")}
      <label class="media-filter-field media-filter-field--search">
        <span>Поиск</span>
        <input type="search" data-media-filter-search placeholder="Название альбома" autocomplete="off">
      </label>
    </div>
    ${country.key === "dahab" ? "" : `<p class="media-filter-status" data-media-filter-status aria-live="polite"></p>`}
    <div class="media-album-grid" data-media-filter-list>
      ${albums.map((album) => mediaAlbumCard(country, album)).join("")}
      ${country.key === "dahab" ? "" : `<p class="media-filter-empty" data-media-filter-empty hidden>Альбомов с такими параметрами пока нет. Измените фильтры или поисковый запрос.</p>`}
    </div>
  </div>
</section>`;
};

const mediaAlbumPage = (page) => {
  const country = countriesByKey[page.country];
  const album = page.album;
  const photoCount = album.photos.length;

  return `
${hero(page, `<a class="button button-primary" href="#album-photos">Открыть фотографии</a><a class="button button-ghost" href="/media/${country.key}/">Все альбомы</a>`)}
<section class="content-section media-album-section" id="album-photos">
  <div class="section-inner">
    ${sectionHeading(
      `${formatMediaDate(album.date)} · ${mediaSportLabels[album.sport]}`,
      album.title,
      country.key === "dahab" ? album.description : `${album.description} Нажмите на фотографию для увеличения или скачайте отдельный файл.`
    )}
    <div class="media-photo-grid">
      ${album.photos.map((src, index) => {
        const alt = `${album.title} — фотография ${index + 1}`;
        return `
      <article class="media-photo-card">
        <button type="button" data-media-photo-open data-media-photo-index="${index}" data-media-src="${src}" data-media-alt="${escapeHtml(alt)}" aria-label="Открыть фотографию ${index + 1} из ${photoCount}">
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
        ${contactMethod({ href: `mailto:${contact.email}`, label: "Электронная почта", value: contact.email })}
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
      ${contactMethod({ href: `mailto:${station.email}`, label: "Электронная почта", value: station.email })}
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
        value: station.key === "wingfoil" ? "Винг-центр в Дахабе" : "Ветратория Виндсёрфинг",
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
      <label>Способ связи<input name="contact" autocomplete="email" placeholder="Телефон, электронная почта или @имя_пользователя" required></label>
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

const vietnamContactsPage = (page) => {
  const contact = site.contacts.vietnam;
  const address = "Sun & Sands Beach, 62 Huỳnh Thúc Kháng, Hàm Tiến, Phan Thiết, Bình Thuận, Vietnam";
  return `
<section class="dahab-sport-hero"><div class="dahab-sport-hero__inner"><div class="dahab-sport-hero__copy"><p class="eyebrow">Вьетнам · связь</p><h1>Контакты Ветратории в Муйне</h1><p>Напишите или позвоните команде станции, чтобы согласовать даты, дисциплину и подходящий формат занятий.</p><div class="dahab-sport-hero__actions"><a class="button button-primary" href="tel:${contact.phone}">Позвонить</a><a class="button button-ghost" href="mailto:${contact.email}">Написать на почту</a></div><div class="hero-advantages hero-advantages--sport"><span class="hero-advantage">${contact.phoneLabel}</span><span class="hero-advantage">${contact.email}</span><span class="hero-advantage">Муйне</span><span class="hero-advantage">Сезон ноябрь — март</span></div></div><figure class="dahab-sport-hero__media"><img src="/assets/img/vietnam-source/station.jpg" alt="Станция Ветратория в Муйне" loading="eager" decoding="async" fetchpriority="high"></figure></div></section>
<section class="content-section contacts-directory-section"><div class="section-inner">${sectionHeading("Прямая связь", "Станция во Вьетнаме", "Один номер и одна почта для вопросов об обучении, прокате и поездке.")}<div class="contacts-directory contacts-directory--stations"><article class="contact-station-card"><p class="eyebrow">Телефон и почта</p><h2>Команда станции</h2><p>Расскажите, когда приезжаете, каким спортом хотите заниматься и есть ли опыт.</p><div class="contact-station-card__methods">${contactMethod({href:`tel:${contact.phone}`,label:"Телефон",value:contact.phoneLabel})}${contactMethod({href:`mailto:${contact.email}`,label:"Электронная почта",value:contact.email})}${contactMethod({href:contact.telegram,icon:"/assets/icons/telegram.svg",label:"Telegram",value:contact.phoneLabel,external:true})}</div></article><article class="contact-station-card"><p class="eyebrow">Адрес станции</p><h2>Sun & Sands Beach</h2><p>${address}</p><div class="contact-station-card__methods">${contactMethod({href:"https://www.google.com/maps/search/?api=1&query=10.94875,108.25900",label:"Координаты",value:"10°56'55.5\"N 108°15'32.4\"E",external:true})}</div></article></div></div></section>
<section class="dahab-sport-section dahab-sport-section--location"><div class="dahab-sport-inner">${sectionHeading("Перед сообщением", "Что написать команде", "Три детали помогут сразу получить конкретный ответ по формату и расписанию.")}<div class="dahab-sport-location-atlas"><figure class="dahab-sport-location-atlas__lead"><img src="/assets/img/vietnam-source/action.jpg" alt="Ветратория Вьетнам" loading="lazy" decoding="async"></figure><div class="dahab-sport-location-atlas__grid vietnam-fact-grid">${[["01","Даты поездки","Когда приезжаете и сколько дней будете в Муйне."],["02","Вид спорта","Кайтсёрфинг, виндсёрфинг или вингфойл."],["03","Ваш уровень","Первый раз, продолжаете обучение или нужен прокат."],["04","Желаемый формат","Разовый урок, курс на несколько дней или самостоятельная практика."]].map(([number,title,text]) => `<article><span>${number}</span><h3>${title}</h3><p>${text}</p></article>`).join("")}</div></div></div></section>
<section class="content-section" id="contact-form"><div class="section-inner contact-layout"><div>${sectionHeading("Заявка", "Подготовить сообщение", "Заполните короткую форму — после нажатия откроется почтовое приложение с готовой заявкой.")}</div>${contactForm(page)}</div></section>`;
};

const russiaContactsPage = (page) => {
  const contact = site.contacts.russia;
  const address = "Краснодарский край, станица Должанская, коса Долгая, база отдыха «Серфприют»";
  return `<section class="dahab-sport-hero"><div class="dahab-sport-hero__inner"><div class="dahab-sport-hero__copy"><p class="eyebrow">Россия · связь</p><h1>Контакты Ветратории на Должанской</h1><p>Напишите или позвоните команде станции, чтобы согласовать даты, дисциплину, обучение или прокат.</p><div class="dahab-sport-hero__actions"><a class="button button-primary" href="tel:${contact.phone}">Позвонить</a><a class="button button-ghost" href="mailto:${contact.email}">Написать на почту</a></div><div class="hero-advantages hero-advantages--sport"><span class="hero-advantage">${contact.phoneLabel}</span><span class="hero-advantage">${contact.email}</span><span class="hero-advantage">Коса Долгая</span><span class="hero-advantage">Май — середина сентября</span></div></div><figure class="dahab-sport-hero__media"><img src="${russiaImg("training.jpg")}" alt="Станция Ветратория на Должанской" loading="eager" decoding="async" fetchpriority="high"></figure></div></section>
<section class="content-section contacts-directory-section"><div class="section-inner">${sectionHeading("Прямая связь","Станция в России","Один номер и одна почта для вопросов об обучении, прокате, проживании и дороге.")}<div class="contacts-directory contacts-directory--stations"><article class="contact-station-card"><p class="eyebrow">Телефон и почта</p><h2>Команда станции</h2><p>Расскажите даты, выбранный спорт, опыт и нужен ли прокат оборудования.</p><div class="contact-station-card__methods">${contactMethod({href:`tel:${contact.phone}`,label:"Телефон",value:contact.phoneLabel})}${contactMethod({href:`mailto:${contact.email}`,label:"Электронная почта",value:contact.email})}${contactMethod({href:contact.telegram,icon:"/assets/icons/telegram.svg",label:"Telegram",value:contact.phoneLabel,external:true})}</div></article><article class="contact-station-card"><p class="eyebrow">Адрес станции</p><h2>Коса Долгая · «Серфприют»</h2><p>${address}</p><div class="contact-station-card__methods">${contactMethod({href:"https://www.google.com/maps/search/?api=1&query=46.652785,37.754422",label:"Координаты",value:"46.652785, 37.754422",external:true})}</div></article></div></div></section>
<section class="dahab-sport-section dahab-sport-section--location"><div class="dahab-sport-inner">${sectionHeading("Перед сообщением","Что написать команде","Четыре детали помогут сразу получить конкретный ответ.")}<div class="dahab-sport-location-atlas"><figure class="dahab-sport-location-atlas__lead"><img src="${russiaImg("station.jpg")}" alt="Коса Долгая" loading="lazy" decoding="async"></figure><div class="dahab-sport-location-atlas__grid vietnam-fact-grid">${[["01","Даты","Когда приезжаете и на сколько дней."],["02","Дисциплина","Виндсёрфинг, вингфойл или кайт."],["03","Уровень","Первый раз, продолжаете или нужен прокат."],["04","Бытовые вопросы","Нужно ли проживание и помощь с дорогой."]].map(([n,t,x])=>`<article><span>${n}</span><h3>${t}</h3><p>${x}</p></article>`).join("")}</div></div></div></section>
<section class="content-section" id="contact-form"><div class="section-inner contact-layout"><div>${sectionHeading("Заявка","Подготовить сообщение","Заполните короткую форму — после нажатия откроется почтовое приложение с готовой заявкой.")}</div>${contactForm(page)}</div></section>`;
};

const contactsPage = (page) => {
  if (page.country === "vietnam") return vietnamContactsPage(page);
  if (page.country === "russia") return russiaContactsPage(page);
  const isGeneral = !page.country;
  const isDahab = page.country === "dahab";
  const contact = contactForPage(page);
  const heroActions = isDahab
    ? `<a class="button button-primary" href="#windsurf">Виндсёрфинг</a><a class="button button-ghost" href="#wingfoil">Вингфойл</a>`
    : `<a class="button button-primary" href="#contact-form">Написать нам</a><a class="button button-ghost" href="mailto:${contact.email}">Электронная почта</a>`;
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
      <h2>Ветратория в сети</h2>
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
    eyebrow: "Центр Вингфойл",
    title: "Команда вингфойла",
    lead: "Помогаем пройти путь от первого знакомства с крылом до уверенного полёта на фойле.",
    members: [
      {
        name: "Анатолий",
        role: "Менеджер · старший инструктор",
        text: "Более 25 лет в водных видах спорта. Подберёт комплект RRD под ваши навыки, ветер и задачу занятия.",
        meta: "Русский · английский · немецкий",
        photo: "/assets/img/team/dahab/anatoly.png",
        eager: true
      },
      {
        name: "Хасан",
        role: "Профессиональный инструктор",
        text: "Узнаваемый райдер спота с десятилетним тренерским опытом. Учит балансу, технике и уверенности на фойле.",
        meta: "Русский · английский",
        photo: "/assets/img/team/dahab/hassan.png",
        eager: true
      },
      {
        name: "Егор",
        role: "Детский спортивный инструктор",
        text: "Тренирует детей от восьми лет. Превращает сложную технику в понятную игру и закладывает безопасную базу.",
        meta: "Русский · английский",
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
        meta: "Русский · английский",
        photo: "/assets/img/team/dahab/ira.jpg"
      },
      {
        name: "Анна",
        role: "Инструктор",
        text: "Видит технические ошибки и помогает заложить прочный фундамент, чтобы прогресс был быстрее и увереннее.",
        meta: "Русский · английский",
        photo: "/assets/img/team/dahab/anna.png"
      }
    ]
  },
  {
    id: "team-windsurf",
    eyebrow: "Центр Виндсёрфинг",
    title: "Команда виндсёрфинга",
    lead: "Встречаем гостей, подбираем и настраиваем оборудование, обучаем на воде и следим за безопасностью в акватории.",
    members: [
      {
        name: "Борис",
        role: "Менеджер · инструктор",
        text: "В виндсёрфинге с 2003 года. Руководит станцией и помогает подобрать обучение, прокат и оборудование под уровень гостя.",
        meta: "Русский · английский · Română",
        photo: "/assets/img/team/dahab/boris.jpg"
      },
      {
        name: "Виктория",
        role: "Работа с гостями",
        text: "Помогает с организационными вопросами, расписанием и комфортом гостей виндсёрф-станции.",
        meta: "Русский · английский",
        photo: "/assets/img/team/dahab/victoria.jpg"
      },
      {
        name: "Мустафа",
        role: "Сервис · оборудование",
        text: "Помогает подобрать, собрать и настроить виндсёрф-комплект перед выходом на воду.",
        meta: "العربية · английский · немецкий",
        photo: "/assets/img/team/dahab/mustafa.jpg"
      },
      {
        name: "Махмуд",
        role: "Сервис · спасатель",
        text: "Профессиональный спортсмен и специалист по слалому. Следит за акваторией и приходит на помощь по сигналу.",
        meta: "العربية · английский · Русский",
        photo: "/assets/img/team/dahab/mahmoud.jpg"
      }
    ]
  },
  {
    id: "team-kids",
    eyebrow: "Детский виндсёрфинг",
    title: "Детские тренеры",
    lead: "Спортивная дисциплина, внимание к ребёнку и насыщенная командная жизнь за пределами тренировок.",
    members: [
      {
        name: "Иван Пупенок",
        role: "Организатор Детский виндсёрфинг",
        text: "Профессиональный тренер, преподаватель и действующий спортсмен в дисциплине слалом.",
        meta: "Тренер · спортсмен",
        photo: "/assets/img/team/dahab/ivan-pupenok.jpg"
      },
      {
        name: "Филипп Андреев",
        role: "Тренер Детский виндсёрфинг",
        text: "Легко находит общий язык с юными серферами и подбирает индивидуальный подход к каждому ребёнку.",
        meta: "Виндсёрфинг · детские группы",
        photo: "/assets/img/team/dahab/filipp-andreev.jpg"
      },
      {
        name: "Роман Тарасов",
        role: "Тренер Детский виндсёрфинг",
        text: "Помогает детям осваивать виндсёрфинг последовательно, безопасно и с удовольствием от каждого нового навыка.",
        meta: "Виндсёрфинг · техника",
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
        role: "Тренер Детский виндсёрфинг",
        text: "С детства занимается виндсёрфингом, участвовал в соревнованиях и выбрал педагогическое направление.",
        meta: "Виндсёрфинг · педагогика",
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
        meta: "Спасение · слалом",
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
              <img src="${member.photo}" alt="${escapeHtml(`${member.name} — ${member.role} Ветратория`)}" loading="${member.eager ? "eager" : "lazy"}" decoding="async">
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
        "Ветратория · Дахаб",
        "Одна команда — разные роли",
        ""
      )}
      ${dahabTeamGroups.map(dahabTeamSlider).join("")}
    </div>
  </section>`;

const vietnamSchoolPage = (page) => {
  const vietnamImg = (name) => `/assets/img/vietnam-source/${name}`;
  const disciplines = [
    ["Виндсёрфинг", "Уроки с нуля, курсы на 3 и 7 дней, прокат и хранение оборудования.", vietnamImg("aerial.jpg"), "/vietnam/windsurf/"],
    ["Вингфойл", "Индивидуальные и групповые занятия, первые полёты и тренировка за катером.", vietnamImg("community.jpg"), "/vietnam/wingfoil/"],
    ["Кайтсёрфинг", "Обучение на отдельном просторном споте Малибу примерно в 6 км от станции.", vietnamImg("station.jpg"), "/vietnam/kite/"]
  ];
  return `
<section class="dahab-sport-hero"><div class="dahab-sport-hero__inner"><div class="dahab-sport-hero__copy"><p class="eyebrow">Ветратория · Вьетнам</p><h1>Школа ветра в Муйне</h1><p>С 2011 года учим виндсёрфингу, вингфойлу и кайтсёрфингу, подбирая программу под человека и реальные условия на воде.</p><div class="dahab-sport-hero__actions">${contactCta(page, "Написать команде")}<a class="button button-ghost" href="#school">О школе</a></div><div class="hero-advantages hero-advantages--sport"><span class="hero-advantage">Работаем с 2011 года</span><span class="hero-advantage">Три дисциплины</span><span class="hero-advantage">Станция на берегу</span><span class="hero-advantage">Сезон ноябрь — март</span></div></div><figure class="dahab-sport-hero__media"><img src="${vietnamImg("station.jpg")}" alt="Школа Ветратория в Муйне" loading="eager" decoding="async" fetchpriority="high"></figure></div></section>
<section class="dahab-sport-section dahab-sport-section--location" id="school"><div class="dahab-sport-inner">${sectionHeading("О школе", "Одно место — три пути на воду", "На станции можно начать с нуля, продолжить обучение, взять оборудование напрокат или оставить собственный комплект на хранение.")}<div class="dahab-sport-location-atlas"><figure class="dahab-sport-location-atlas__lead"><img src="${vietnamImg("action.jpg")}" alt="Станция Ветратория во Вьетнаме" loading="lazy" decoding="async"></figure><div class="dahab-sport-location-atlas__grid vietnam-fact-grid">${[["2011","Работаем в Муйне","Станция стала частью вьетнамского направления Ветратории."],["01","Подбор формата","Учитываем опыт, цели, количество дней и выбранную дисциплину."],["02","Практика на воде","Инструктор объясняет технику и контролирует последовательность задач."],["03","Следующий шаг","После занятия понятны дальнейший курс, прокат или самостоятельная практика."]].map(([number,title,text]) => `<article><span>${number}</span><h3>${title}</h3><p>${text}</p></article>`).join("")}</div></div></div></section>
<section class="dahab-sport-section"><div class="dahab-sport-inner">${sectionHeading("Направления школы", "Выберите дисциплину", "У каждого спорта своя страница с условиями, программой и полным прайсом.")}<div class="dahab-sport-useful">${disciplines.map(([title,text,image,href]) => `<a href="${href}"><img src="${image}" alt="${title} в Муйне" loading="lazy" decoding="async"><span>Вьетнам · Муйне</span><h3>${title}</h3><p>${text}</p><em>Открыть направление →</em></a>`).join("")}</div></div></section>
<section class="dahab-sport-section dahab-sport-section--soft"><div class="dahab-sport-inner dahab-sport-safety"><div class="dahab-sport-safety__copy"><p class="eyebrow">Команда рядом</p><h2>До поездки, на берегу и после занятия</h2><p>Администратор помогает с записью и расписанием, инструктор отвечает за учебную задачу и безопасность, команда станции готовит оборудование и помогает с выходом.</p><div class="dahab-sport-safety__list"><span>Запись и подбор программы</span><span>Подготовка и настройка комплекта</span><span>Инструктаж и обратная связь</span></div>${contactCta(page, "Познакомиться со школой")}</div><div class="dahab-sport-safety__media"><img src="${vietnamImg("atmosphere.jpg")}" alt="Оборудование школы Ветратория" loading="lazy" decoding="async"></div></div></section>
<section class="dahab-sport-cta"><img src="${vietnamImg("station.jpg")}" alt="Пляжная станция Ветратория в Муйне" loading="lazy" decoding="async"><div class="dahab-sport-cta__inner"><p class="eyebrow">Станция в Муйне</p><h2>Приезжайте за ветром и прогрессом</h2><p>Напишите даты и интересующий спорт — команда предложит программу под продолжительность вашей поездки.</p><div>${contactCta(page, "Оставить заявку")}<a class="button button-ghost" href="/vietnam/contacts/">Контакты</a></div></div></section>`;
};

const russiaSchoolPage = (page) => {
  const disciplines = [
    ["Виндсёрфинг","Уроки с нуля, курсы для взрослых и детей, учебный и профессиональный прокат.",russiaImg("windsurf.jpg"),"/russia/windsurf/"],
    ["Вингфойл","Индивидуальные и групповые занятия, курс на десять часов и прокат.",russiaImg("wingfoil.jpg"),"/russia/wingfoil/"],
    ["Кайтсёрфинг","Последовательное обучение, защитная экипировка, прокат и хранение.",russiaImg("kite.jpg"),"/russia/kite/"]
  ];
  return `<section class="dahab-sport-hero"><div class="dahab-sport-hero__inner"><div class="dahab-sport-hero__copy"><p class="eyebrow">Ветратория · Россия</p><h1>Школа ветра на Должанской</h1><p>Станция на косе Долгой: три дисциплины, обучение, прокат и помощь команды рядом с местом выхода на воду.</p><div class="dahab-sport-hero__actions">${contactCta(page,"Написать команде")}<a class="button button-ghost" href="#school">О школе</a></div><div class="hero-advantages hero-advantages--sport"><span class="hero-advantage">Три дисциплины</span><span class="hero-advantage">Две акватории</span><span class="hero-advantage">Оборудование RRD</span><span class="hero-advantage">Май — середина сентября</span></div></div><figure class="dahab-sport-hero__media"><img src="${russiaImg("training.jpg")}" alt="Школа Ветратория на Должанской" loading="eager" decoding="async" fetchpriority="high"></figure></div></section>
<section class="dahab-sport-section dahab-sport-section--location" id="school"><div class="dahab-sport-inner">${sectionHeading("О школе","Станция у двух берегов","В зависимости от ветра команда выбирает сторону косы: спокойную воду для базы или более сложные условия для прогресса.")}<div class="dahab-sport-location-atlas"><figure class="dahab-sport-location-atlas__lead"><img src="${russiaImg("station.jpg")}" alt="Коса Долгая" loading="lazy" decoding="async"></figure><div class="dahab-sport-location-atlas__grid vietnam-fact-grid">${[["01","Подбор формата","Учитываем опыт, цели и количество дней."],["02","Комплект","Настраиваем оборудование под человека и ветер."],["03","Практика","Инструктор ведёт по последовательным задачам."],["04","Следующий шаг","Курс, прокат или самостоятельное катание."]].map(([n,t,x])=>`<article><span>${n}</span><h3>${t}</h3><p>${x}</p></article>`).join("")}</div></div></div></section>
<section class="dahab-sport-section"><div class="dahab-sport-inner">${sectionHeading("Направления школы","Выберите дисциплину","На каждой странице — условия, маршрут обучения и полный прайс.")}<div class="dahab-sport-useful">${disciplines.map(([title,text,image,href])=>`<a href="${href}"><img src="${image}" alt="${title} на Должанской" loading="lazy" decoding="async"><span>Россия · Должанская</span><h3>${title}</h3><p>${text}</p><em>Открыть направление →</em></a>`).join("")}</div></div></section>
<section class="dahab-sport-section dahab-sport-section--soft"><div class="dahab-sport-inner dahab-sport-safety"><div class="dahab-sport-safety__copy"><p class="eyebrow">Команда рядом</p><h2>На берегу и на воде</h2><p>Команда помогает с записью, комплектом и выходом; инструктор отвечает за учебную задачу и безопасность занятия.</p><div class="dahab-sport-safety__list"><span>Запись и подбор программы</span><span>Подготовка и настройка комплекта</span><span>Инструктаж и обратная связь</span></div>${contactCta(page,"Познакомиться со школой")}</div><div class="dahab-sport-safety__media"><img src="${russiaImg("life-4.jpg")}" alt="Станция на берегу" loading="lazy" decoding="async"></div></div></section>`;
};

const russiaAccommodationPage = (page) => `<section class="dahab-sport-hero"><div class="dahab-sport-hero__inner"><div class="dahab-sport-hero__copy"><p class="eyebrow">Должанская · проживание</p><h1>Жить рядом со станцией и водой</h1><p>Ветратория находится на территории базы отдыха «Серфприют» на косе Долгой. От размещения до пляжа, станции и хранения оборудования — короткий путь пешком.</p><div class="dahab-sport-hero__actions">${contactCta(page,"Уточнить размещение")}<a class="button button-ghost" href="/russia/how-to-get/">Как добраться</a></div><div class="hero-advantages hero-advantages--sport"><span class="hero-advantage">Коса Долгая</span><span class="hero-advantage">Оба пляжа рядом</span><span class="hero-advantage">Станция на территории</span><span class="hero-advantage">Хранение оборудования</span></div></div><figure class="dahab-sport-hero__media"><img src="${russiaImg("life-4.jpg")}" alt="Серфприют на косе Долгой" loading="eager" decoding="async" fetchpriority="high"></figure></div></section>
<section class="dahab-sport-section dahab-sport-section--location"><div class="dahab-sport-inner">${sectionHeading("Серфприют","Быт вокруг катания","На базе есть комнаты и отдельные варианты размещения. Конкретную категорию, оснащение, стоимость и свободные даты нужно подтвердить перед бронированием.")}<div class="dahab-sport-location-atlas"><figure class="dahab-sport-location-atlas__lead"><img src="${russiaImg("station.jpg")}" alt="Коса Долгая" loading="lazy" decoding="async"></figure><div class="dahab-sport-location-atlas__grid vietnam-fact-grid">${[["01","Рядом со станцией","Меньше времени на ежедневную дорогу."],["02","Два пляжа","Обе стороны косы находятся неподалёку."],["03","Снаряжение","Хранение организовано рядом с местом выхода."],["04","Питание и быт","Формат и режим работы уточняются на ваши даты."]].map(([n,t,x])=>`<article><span>${n}</span><h3>${t}</h3><p>${x}</p></article>`).join("")}</div></div></div></section>
<section class="dahab-sport-section dahab-sport-section--soft"><div class="dahab-sport-inner">${sectionHeading("Перед бронированием","Что уточнить","Так вы получите конкретный вариант, а не общий ответ.")}<div class="dahab-sport-feature-grid">${[["01","Даты и количество ночей","Укажите день приезда, отъезда и возможную гибкость."],["02","Состав гостей","Сколько взрослых и детей, нужны ли отдельные места."],["03","Спортивная программа","Какой спорт, обучение или прокат планируете."],["04","Своё оборудование","Нужно ли место хранения для вашего комплекта."]].map(([n,t,x])=>`<article><span>${n}</span><h3>${t}</h3><p>${x}</p></article>`).join("")}</div></div></section>
<section class="dahab-sport-cta"><img src="${russiaImg("life-4.jpg")}" alt="База отдыха рядом со станцией" loading="lazy" decoding="async"><div class="dahab-sport-cta__inner"><p class="eyebrow">Запрос размещения</p><h2>Проверим варианты под ваши даты</h2><p>Напишите состав гостей, даты и спортивную программу — команда уточнит доступность.</p><div>${contactCta(page,"Написать команде")}<a class="button button-ghost" href="/russia/contacts/">Контакты</a></div></div></section>`;

const russiaRoutePage = (page) => `<section class="dahab-sport-hero"><div class="dahab-sport-hero__inner"><div class="dahab-sport-hero__copy"><p class="eyebrow">Должанская · дорога</p><h1>Как добраться до станции</h1><p>Финальная точка маршрута — коса Долгая, база отдыха «Серфприют». Актуальный общественный транспорт и последний участок дороги лучше проверить перед выездом.</p><div class="dahab-sport-hero__actions"><a class="button button-primary" href="https://www.google.com/maps/search/?api=1&query=46.652785,37.754422" target="_blank" rel="noopener noreferrer">Открыть карту</a>${contactCta(page,"Уточнить маршрут","button button-ghost")}</div><div class="hero-advantages hero-advantages--sport"><span class="hero-advantage">46.652785, 37.754422</span><span class="hero-advantage">Станица Должанская</span><span class="hero-advantage">Коса Долгая</span><span class="hero-advantage">База «Серфприют»</span></div></div><figure class="dahab-sport-hero__media"><img src="${russiaImg("station.jpg")}" alt="Коса Долгая с воздуха" loading="eager" decoding="async" fetchpriority="high"></figure></div></section>
<section class="dahab-sport-section dahab-sport-section--location"><div class="dahab-sport-inner">${sectionHeading("Маршрут","Точка назначения без двусмысленности","Сохраните координаты и заранее уточните состояние последнего участка дороги, время заезда и контакт встречающего.")}<div class="dahab-sport-location-atlas"><figure class="dahab-sport-location-atlas__lead"><img src="${russiaImg("station.jpg")}" alt="Коса Долгая" loading="lazy" decoding="async"></figure><div class="dahab-sport-location-atlas__grid vietnam-fact-grid">${[["01","Навигатор","Введите координаты 46.652785, 37.754422."],["02","Ориентир","Станица Должанская, коса Долгая, «Серфприют»."],["03","Общественный транспорт","Сверьте действующее расписание у перевозчика."],["04","Последний участок","Согласуйте с командой станции до выезда."]].map(([n,t,x])=>`<article><span>${n}</span><h3>${t}</h3><p>${x}</p></article>`).join("")}</div></div></div></section>
<section class="dahab-sport-section dahab-sport-section--soft"><div class="dahab-sport-inner">${sectionHeading("Перед дорогой","Короткий чек-лист","Несколько проверок помогут приехать без лишних разворотов.")}<div class="dahab-sport-feature-grid">${[["01","Подтвердите запись","Команда должна знать дату и примерное время приезда."],["02","Проверьте карту офлайн","На последнем участке связь может быть нестабильной."],["03","Уточните расписание","Рейсы и пересадки меняются по сезону."],["04","Сохраните телефон","Номер станции: +7 988 471 5355."]].map(([n,t,x])=>`<article><span>${n}</span><h3>${t}</h3><p>${x}</p></article>`).join("")}</div></div></section>
<section class="dahab-sport-cta"><img src="${russiaImg("station.jpg")}" alt="Коса Долгая" loading="lazy" decoding="async"><div class="dahab-sport-cta__inner"><p class="eyebrow">Перед выездом</p><h2>Уточните последний участок у команды</h2><p>Напишите способ поездки и время прибытия — команда поможет сверить ориентир и контакт на месте.</p><div>${contactCta(page,"Уточнить дорогу")}<a class="button button-ghost" href="/russia/accommodation/">Проживание</a></div></div></section>`;

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
      return layout(page, page.country === "dahab" ? dahabTeamPage(page) : page.country === "vietnam" ? vietnamSchoolPage(page) : page.country === "russia" ? russiaSchoolPage(page) : featurePage(page));
    case "stations":
      return layout(page, page.country === "dahab" ? dahabStationsPage(page) : featurePage(page));
    case "safety":
      return layout(page, page.country === "dahab" ? dahabSafetyPage(page) : featurePage(page));
    case "route":
      return layout(page, page.country === "dahab" ? dahabHowToGetPage(page) : page.country === "russia" ? russiaRoutePage(page) : featurePage(page));
    case "accommodation":
      return layout(page, page.country === "russia" ? russiaAccommodationPage(page) : featurePage(page));
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
