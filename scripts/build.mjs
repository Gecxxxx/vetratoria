import { mkdir, writeFile } from "node:fs/promises";
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

const currentCountry = (page) =>
  countryList.find((country) => page.country === country.key || page.galleryCountry === country.key || page.path.startsWith(`/${country.key}/`));

const arrow = '<span class="vtr-nav__chevron" aria-hidden="true">⌄</span>';

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

const mainNavPanel = () => `
    <nav class="vtr-nav__panel" aria-label="Основная навигация" data-nav-panel aria-hidden="false">
      <a class="vtr-nav__link" href="/">Vetratoria</a>
      ${directionsMenu()}
      <a class="vtr-nav__link" href="/blog/">Блог</a>
      <a class="vtr-nav__link" href="/media/">Медиа</a>
      <a class="vtr-nav__link" href="/contacts/">Контакты</a>
    </nav>`;

const topNav = (page) => `
  <div class="vtr-nav__top">
    <div class="vtr-nav__contacts">
      <a href="mailto:${site.email}">${site.email}</a>
      <a href="tel:${site.phone.replace(/\s/g, "")}">${site.phone}</a>
    </div>
    <nav class="vtr-nav__countries" aria-label="Выбор страны">
      ${countryList.map((country) => `<a class="vtr-nav__country${page.country === country.key ? " is-active" : ""}" href="${country.href}">${country.nav}</a>`).join("")}
    </nav>
    <div class="vtr-nav__right">
      <div class="vtr-nav__socials">
        ${site.socials.map((item) => `<a href="${item.href}" aria-label="${item.label}">${item.label}</a>`).join("")}
      </div>
      <div class="vtr-nav__lang" data-dropdown>
        <button class="vtr-nav__lang-button" type="button" aria-expanded="false" data-dropdown-toggle>RU ${arrow}</button>
        <div class="vtr-nav__lang-menu">
          <a href="#">EN</a>
          <a href="#">DE</a>
        </div>
      </div>
    </div>
  </div>`;

const countrySectionActive = (page, paths) => paths.some((path) => page.path === path || page.path.startsWith(path));

const sectionLinkClass = (active) => `vtr-nav__section-link${active ? " is-active" : ""}`;

const schoolDropdown = (country) => country.key === "dahab" ? [
  { label: "Команда", href: "/dahab/team/" },
  { label: "Безопасность", href: "/dahab/safety/" },
  { label: "Как добраться", href: "/dahab/how-to-get/" },
  { label: "Контакты", href: "/dahab/contacts/" }
] : [
  { label: "Команда", href: `/${country.key}/team/` },
  { label: "Блог", href: `/${country.key}/blog/` },
  { label: "Медиа", href: `/media/${country.key}/` },
  { label: "Контакты", href: "/contacts/" }
];

const sectionDropdown = (label, active, items) => `
    <div class="vtr-nav__section-item vtr-nav__section-item--drop${active ? " is-active" : ""}" data-dropdown>
      ${navButton(label, "vtr-nav__section-link")}
      <div class="vtr-nav__section-dropdown">
        ${items.map((item) => `<a href="${item.href}">${item.label}</a>`).join("")}
      </div>
    </div>`;

const countrySectionNav = (page, country) => {
  const pricePaths = [`/${country.key}/price/`, ...country.sports.map((sportKey) => `/${country.key}/${sportKey}/price/`)];
  const schoolItems = schoolDropdown(country);
  const schoolPaths = schoolItems.map((item) => item.href).filter((href) => href.startsWith(`/${country.key}/`));
  const baseLinks = country.key === "dahab"
    ? [
        `<a class="${sectionLinkClass(page.path === country.href)}" href="${country.href}">Обзор</a>`,
        `<a class="${sectionLinkClass(countrySectionActive(page, ["/dahab/wingfoil/"]))}" href="/dahab/wingfoil/">Wingfoil</a>`,
        `<a class="${sectionLinkClass(countrySectionActive(page, ["/dahab/windsurf/"]))}" href="/dahab/windsurf/">Windsurf</a>`,
        sectionDropdown("Цены", countrySectionActive(page, pricePaths), [
          { label: "Все цены", href: "/dahab/price/" },
          { label: "Wingfoil", href: "/dahab/wingfoil/price/" },
          { label: "Windsurf", href: "/dahab/windsurf/price/" },
          { label: "Kids", href: "/dahab/windsurf-kids/price/" }
        ]),
        `<a class="${sectionLinkClass(countrySectionActive(page, ["/dahab/stations/"]))}" href="/dahab/stations/">Станции</a>`
      ]
    : [
        `<a class="${sectionLinkClass(page.path === country.href)}" href="${country.href}">Обзор</a>`,
        `<a class="${sectionLinkClass(countrySectionActive(page, [`/${country.key}/windsurf/`]))}" href="/${country.key}/windsurf/">Windsurf</a>`,
        `<a class="${sectionLinkClass(countrySectionActive(page, [`/${country.key}/wingfoil/`]))}" href="/${country.key}/wingfoil/">Wingfoil</a>`,
        `<a class="${sectionLinkClass(countrySectionActive(page, [`/${country.key}/kite/`]))}" href="/${country.key}/kite/">Kite</a>`,
        `<a class="${sectionLinkClass(countrySectionActive(page, pricePaths))}" href="/${country.key}/price/">Цены</a>`
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
    ${mainNavPanel()}
  </div>
  ${country ? countrySectionNav(page, country) : ""}
</header>`;
};

const footer = () => `
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
        <a href="/contacts/">Контакты</a>
      </div>
      <div>
        <h3>Связь</h3>
        <a href="/contacts/">Написать нам</a>
        <a href="mailto:${site.email}">${site.email}</a>
        <a href="tel:${site.phone.replace(/\s/g, "")}">${site.phone}</a>
      </div>
    </nav>
  </div>
  <div class="footer-bottom">
    <span>© 2026 Vetratoria</span>
    <span>Условия, расписание, цены и доступность форматов уточняются перед поездкой.</span>
  </div>
</footer>`;

const dahabFooter = () => `
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
        <nav><a href="/contacts/">Оставить заявку</a><a href="/contacts/">Контакты станции</a></nav>
      </article>
      <article>
        <h2>Карта станций</h2>
        <p>Wing Center · Swiss Inn · Ganet Sinai</p>
      </article>
      <article>
        <h2>Соцсети</h2>
        <nav class="dahab-footer-pro__socials"><a href="https://vk.com/" target="_blank" rel="noopener">VK</a><a href="https://www.youtube.com/" target="_blank" rel="noopener">YouTube</a><a href="https://www.instagram.com/" target="_blank" rel="noopener">Instagram</a></nav>
        <p>Следите за новостями станции и медиа с воды.</p>
      </article>
    </div>
  </div>
  <div class="dahab-footer-pro__bottom">
    <span>© 2026 Vetratoria</span>
    <span>Условия и доступность форматов подтверждаются перед поездкой.</span>
  </div>
</footer>`;

const footerForPage = (page) => page.kind === "country" && page.country === "dahab" ? dahabFooter() : footer();

const metaTitleForPage = (page) =>
  page.path === "/dahab/" ? "Дахаб — Wingfoil и Windsurf на Красном море | Vetratoria" : page.title || site.title;

const metaDescriptionForPage = (page) =>
  page.path === "/dahab/"
    ? "Vetratoria Dahab: Wingfoil, Windsurf, Kids, аренда, уроки, станции Wing Center, Swiss Inn и Ganet Sinai."
    : page.description || site.description;

const metaImageForPage = (page) =>
  page.path === "/dahab/" ? "/assets/img/dahab-ref/ganet-sinai.webp" : page.image || site.slider[0];

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
  <link rel="stylesheet" href="/assets/css/main.css">
  <script defer src="/assets/js/app.js"></script>
</head>
<body class="modern-site ${page.kind}${page.country ? ` country-${page.country}` : ""}">
  <a class="skip-link" href="#main">К содержанию</a>
  ${header(page)}
  <main id="main">${main}</main>
  ${footerForPage(page)}
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

const home = () => `
<section class="hero hero-home">
  <div class="home-hero__slider" data-hero-slider aria-label="Фото Vetratoria">
    ${site.slider.map((src, index) => `<img src="${src}" alt="" data-slide ${index === 0 ? `class="is-active"` : ""} aria-hidden="${index === 0 ? "false" : "true"}" loading="${index === 0 ? "eager" : "lazy"}" decoding="async">`).join("")}
  </div>
  <div class="hero-shade"></div>
  <div class="hero-content">
    <p class="eyebrow">Vetratoria Wind Schools</p>
    <h1>Windsurf и Wingfoil школы в Египте, Вьетнаме и России</h1>
    <p class="hero-lead">Один бренд, несколько ветреных направлений и понятная система: страна, спорт, станция, инструктор, снаряжение и выход на воду.</p>
    <div class="home-advantages">
      <article class="home-advantage"><b>01</b><span>С 2006 года</span></article>
      <article class="home-advantage"><b>02</b><span>Клубная система скидок</span></article>
      <article class="home-advantage"><b>03</b><span>Опытные инструкторы</span></article>
      <article class="home-advantage"><b>04</b><span>365 дней в году</span></article>
    </div>
    <div class="hero-actions">
      <a class="button button-primary" href="/contacts/">Написать нам</a>
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
      <a class="button button-primary" href="/contacts/">Написать нам</a>
      ${countryList.map((country) => `<a class="button button-ghost" href="${country.href}">${country.nav}</a>`).join("")}
    </div>
  </div>
</section>`;

const dahabImg = (name) => `/assets/img/dahab/${name}`;
const dahabRefImg = (name) => `/assets/img/dahab-ref/${name}`;

const dahabWingfoilPage = (page) => {
  const heroFacts = ["Wing + SUP", "Wing + Foil", "Foil boat", "Rescue"];
  const reasons = [
    ["Ровная вода", "Спокойная зона помогает поймать баланс, понять крыло и не бороться с лишней волной."],
    ["Стабильный ветер", "В Дахабе легко планировать занятия: инструктор подбирает окно под уровень и задачу."],
    ["Foil boat", "Можно отдельно почувствовать фойл за лодкой, а потом соединить полет с крылом."],
    ["Станция рядом", "Подбор крыла, доски, шлема, жилета и обратная связь происходят прямо на берегу."]
  ];
  const learning = [
    ["01", "Берег", "Разбираем ветер, безопасность, крыло, стойку и управление тягой до выхода на воду.", dahabRefImg("wing-center.webp")],
    ["02", "Wing + SUP", "Учимся держать курс, разворачиваться, возвращаться к старту и уверенно работать крылом.", dahabRefImg("choose-wingfoil.webp")],
    ["03", "Foil boat", "Чувствуем подъем фойла без крыла: скорость, высоту, баланс и мягкие касания воды.", dahabRefImg("price-foil-boat.webp")],
    ["04", "Wing + Foil", "Соединяем крыло и фойл: первые полеты, контроль высоты и понятный следующий шаг.", dahabImg("wingfoil-lesson-coaching.webp")]
  ];
  const prices = [
    ["Wing + SUP", "Урок с инструктором", "45$", "Крыло, SUP-доска, старт с берега и базовое управление.", dahabRefImg("choose-wingfoil.webp")],
    ["Foil boat", "Фойл за лодкой", "60$", "Отдельная работа с фойлом до выхода с крылом.", dahabRefImg("price-foil-boat.webp")],
    ["Wing + Foil", "Урок wingfoil", "70$", "Инструктор, комплект, старт и задачи под уровень.", dahabRefImg("price-wingfoil.webp")],
    ["Rental", "Прокат комплекта", "по запросу", "Для райдеров, которые уже уверенно контролируют крыло и фойл.", dahabRefImg("block-wingfoil.webp")]
  ];
  const gallery = [
    ["Первые полеты", "Wingfoil lesson", dahabImg("wingfoil-hero.webp")],
    ["Работа с инструктором", "Coaching", dahabImg("wingfoil-lesson-coaching.webp")],
    ["Акватория", "Dahab water area", dahabRefImg("aqva-aerial.webp")],
    ["Wing Center", "Station", dahabRefImg("wing-center.webp")]
  ];
  const faqs = [
    ["Можно ли начать с нуля?", "Да. Обычно начинаем с управления крылом на берегу и Wing + SUP, затем добавляем foil boat или Wing + Foil по готовности."],
    ["Сколько занятий нужно до первых полетов?", "Зависит от ветра, баланса и прошлого опыта. Часто первые короткие полеты появляются после нескольких последовательных выходов."],
    ["Что входит в урок?", "Инструктор, подбор комплекта, шлем, жилет, разбор зоны катания, постановка задач и обратная связь после выхода."],
    ["Нужен ли опыт windsurf или kite?", "Нет, но опыт любых водных видов помогает. Для старта важнее спокойная вода, правильный комплект и понятная последовательность."],
    ["Когда лучше ехать в Дахаб?", "Дахаб работает круглый год. Конкретные окна по ветру и формату лучше уточнять перед поездкой под ваши даты."]
  ];
  const useful = [
    ["/dahab/blog/wingfoil/", "Статья", "Wingfoil в Дахабе: от крыла до первого полета", dahabImg("wingfoil-hero.webp")],
    ["/media/dahab/2026-06-10-wingfoil-day/", "Медиа", "Wingfoil day в Дахабе", dahabRefImg("block-wingfoil.webp")],
    ["/dahab/safety/", "Безопасность", "Правила выхода на воду и rescue", dahabRefImg("aqva-aerial.webp")]
  ];

  return `
<section class="dahab-sport-hero dahab-sport-hero--wingfoil">
  <div class="dahab-sport-hero__inner">
    <div class="dahab-sport-hero__copy">
      <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
      <h1>${escapeHtml(page.title)}</h1>
      <p>${escapeHtml(page.description)}</p>
      <div class="dahab-sport-hero__actions">
        <a class="button button-primary" href="/contacts/">Записаться</a>
        <a class="button button-ghost" href="/dahab/wingfoil/price/">Цены</a>
      </div>
      <div class="dahab-sport-hero__facts">
        ${heroFacts.map((item) => `<span>${item}</span>`).join("")}
      </div>
    </div>
    <figure class="dahab-sport-hero__media">
      <img src="${dahabImg("wingfoil-hero.webp")}" alt="Wingfoil в Дахабе" width="1200" height="820" loading="eager" decoding="async" fetchpriority="high">
    </figure>
  </div>
</section>

<section class="dahab-sport-section">
  <div class="dahab-sport-inner">
    ${sectionHeading("Локация", "Почему Дахаб подходит для Wingfoil", "Спокойная вода, стабильный ветер, разные форматы старта и станция рядом с зоной выхода помогают идти от первого управления крылом к полету без хаоса.")}
    <figure class="dahab-sport-panorama">
      <img src="${dahabRefImg("aqva-aerial.webp")}" alt="Акватория Дахаба для wingfoil" width="1600" height="980" loading="lazy" decoding="async">
    </figure>
    <div class="dahab-sport-feature-grid">
      ${reasons.map(([title, text], index) => `<article><span>0${index + 1}</span><h3>${title}</h3><p>${text}</p></article>`).join("")}
    </div>
  </div>
</section>

<section class="dahab-sport-section dahab-sport-section--soft">
  <div class="dahab-sport-inner">
    ${sectionHeading("Обучение", "Как проходит обучение Wingfoil", "В реальности это не один случайный урок, а понятная лестница: берег, крыло, доска, фойл, первые полеты и самостоятельность.")}
    <div class="dahab-sport-process">
      ${learning.map(([number, title, text, image]) => `
        <article>
          <img src="${image}" alt="${title}" width="760" height="520" loading="lazy" decoding="async">
          <div><span>${number}</span><h3>${title}</h3><p>${text}</p></div>
        </article>`).join("")}
    </div>
  </div>
</section>

<section class="dahab-sport-section">
  <div class="dahab-sport-inner">
    ${sectionHeading("Прайс", "Цены на Wingfoil", "Основные форматы вынесены отдельно. Итоговый план лучше подобрать по уровню, ветру и количеству дней на воде.")}
    <div class="dahab-sport-price-grid">
      ${prices.map(([label, title, value, text, image]) => `
        <a href="/dahab/wingfoil/price/" class="dahab-sport-price-card">
          <img src="${image}" alt="${title}" width="740" height="520" loading="lazy" decoding="async">
          <small>${label}</small>
          <h3>${title}</h3>
          <b>${value}</b>
          <p>${text}</p>
          <em>Смотреть формат</em>
        </a>`).join("")}
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
      <img src="${dahabRefImg("price-foil-boat.webp")}" alt="Безопасность и foil boat в Дахабе" width="900" height="640" loading="lazy" decoding="async">
      <img src="${dahabRefImg("wing-center.webp")}" alt="Инструктор Vetratoria" width="900" height="640" loading="lazy" decoding="async">
    </div>
  </div>
</section>

<section class="dahab-sport-section">
  <div class="dahab-sport-inner">
    ${sectionHeading("Медиа", "Как это выглядит на воде", "Крыло, доска, фойл и вода читаются лучше в кадре: здесь визуальный ритм страницы такой же, как в референсе, с крупными карточками и понятными переходами.")}
    <div class="dahab-sport-gallery">
      ${gallery.map(([title, label, image], index) => `
        <a class="${index === 0 ? "is-large" : ""}" href="/media/dahab/">
          <img src="${image}" alt="${title}" width="900" height="640" loading="lazy" decoding="async">
          <span>${label}</span>
          <b>${title}</b>
        </a>`).join("")}
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
  <img src="${dahabRefImg("choose-wingfoil.webp")}" alt="Wingfoil в Дахабе" width="1600" height="900" loading="lazy" decoding="async">
  <div class="dahab-sport-cta__inner">
    <p class="eyebrow">Заявка</p>
    <h2>Хотите попробовать Wingfoil в Дахабе?</h2>
    <p>Напишите даты, уровень и цель поездки. Подберем формат: Wing + SUP, foil boat, урок Wing + Foil или самостоятельную практику.</p>
    <div>
      <a class="button button-primary" href="/contacts/">Написать нам</a>
      <a class="button button-ghost" href="/dahab/wingfoil/price/">Цены</a>
    </div>
  </div>
</section>`.replace(/^[\t ]+$/gm, "");
};

const dahabHomePage = () => {
  const priceCards = [
    ["Wingfoil", "Урок", "70$", "Инструктор и комплект под уровень.", dahabRefImg("price-wingfoil.webp"), "/dahab/wingfoil/price/"],
    ["Foil boat", "Фойл за лодкой", "60$", "Полёт на фойле без крыла.", dahabRefImg("price-foil-boat.webp"), "/dahab/wingfoil/price/"],
    ["Windsurf", "Урок", "70$", "Парус, доска и инструктор.", dahabRefImg("price-windsurf.webp"), "/dahab/windsurf/price/"],
    ["Kids", "Детский урок", "от 55$", "Лёгкое снаряжение и мягкий темп.", dahabRefImg("price-kids.webp"), "/dahab/windsurf-kids/"]
  ];
  const stations = [
    ["Wing Center", "Wingfoil · Foil boat · Gear", "Фокус на wingfoil, фойл за лодкой и подбор комплекта.", dahabRefImg("bg-wingfoil-station.webp")],
    ["Swiss Inn", "Windsurf · Lessons · Rental", "Уроки, прокат и удобный старт для новичков.", dahabRefImg("bg-swiss.webp")],
    ["Ganet Sinai", "Windsurf · Progress · Practice", "Практика на воде и задачи для продолжающих.", dahabRefImg("bg-ganet.webp")]
  ];
  const team = [
    ["A", "Manager & Senior Instructor", "Anatoly", "25+ лет в водных видах спорта. Подберёт RRD-комплект и формат, чтобы первый выход на воду был спокойным и ярким.", "Languages: RU · EN · DE"],
    ["H", "Pro Instructor", "Hassan", "10+ лет тренерского опыта. Самый узнаваемый райдер на споте: учит балансу, фойлу и уверенности в любых условиях.", "Languages: RU · EN"],
    ["E", "Kids Instructor", "Egor", "Специализируется на обучении детей от 8 лет. Превращает сложную технику в понятную игру и безопасный прогресс.", "Languages: RU · EN"],
    ["R", "Instructor", "Roma", "Спокойно объясняет физику ветра, крыло и стойку. Помогает освоиться даже в сильный ветер и не перегружает ученика.", "Languages: RU"],
    ["I", "Administrator", "Ira", "Душа станции: отвечает за комфорт, безопасность на воде и хорошее настроение до и после каждой сессии.", "Languages: RU · EN"],
    ["A", "Instructor", "Anya", "Отлично видит технические ошибки и помогает заложить базу, на которой ученик быстрее начинает прогрессировать.", "Languages: RU · EN"]
  ];
  const reviews = [
    ["B", "Boris Sizov", "★★★★★", "Очень удобно приезжать без своего снаряжения: есть все размеры крыльев и досок, оборудования хватает. Толик, Ира и Хассан — настоящие профессионалы."],
    ["D", "Dmitrii Polishchuk", "★★★★★", "Отличная surf-станция, классная локация для выхода в море, дружелюбная команда и сильное оборудование для wingfoil. Очень рекомендую."],
    ["O", "Olga Krasnova", "★★★★★", "Wing Center Vetratoria — магическое место. Мои первые шаги на wingfoil получились, а снаряжение подходит и новичкам, и продолжающим."],
    ["E", "Evgeniy Kolosov", "★★★★★", "Vetratoria в Египте оставила только положительные впечатления: высокий уровень инструкторов, идеальные условия и очень дружелюбная атмосфера."],
    ["Y", "Yuriy Tolchinskiy", "★★★★★", "Приезжал осваивать wingfoil. Довольно быстро получилось лететь на фойле и делать повороты. Спасибо Hassan за продуктивные тренировки."]
  ];

  return `
<section class="dahab-hero">
  <img class="dahab-hero__image" src="${dahabRefImg("ganet-sinai.webp")}" alt="Дахаб: Wingfoil и Windsurf на Красном море" width="1600" height="1067" fetchpriority="high">
  <div class="dahab-hero__shade"></div>
  <div class="dahab-hero__content">
    <p class="eyebrow">Египет · Дахаб</p>
    <h1>Дахаб: Wingfoil и Windsurf на Красном море</h1>
    <p class="hero-lead">Vetratoria — водная станция в Дахабе: Wingfoil, Windsurf, Kids, аренда и уроки по фактическому времени на воде.</p>
    <div class="dahab-hero__facts"><span>С 2006 года</span><span>Идеальная акватория</span><span>10000+ учеников</span></div>
    <div class="hero-actions dahab-hero-actions">
      <a class="button button-primary" href="/contacts/">Написать нам</a>
      <a class="button button-ghost" href="/dahab/wingfoil/">Wingfoil</a>
      <a class="button button-ghost" href="/dahab/windsurf/">Windsurf</a>
      <a class="button button-ghost" href="/dahab/price/">Цены</a>
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
      <p>Два основных направления Дахаба — крупно, на фото и без шаблонных карточек.</p>
    </header>
    <div class="sport-split__grid">
      <a class="sport-tile" href="/dahab/wingfoil/" aria-label="Открыть страницу Wingfoil в Дахабе">
        <img src="${dahabRefImg("choose-wingfoil.webp")}" alt="Wingfoil в Дахабе" width="1600" height="1067" loading="lazy" decoding="async">
        <div class="sport-tile__content">
          <h2>Wingfoil</h2>
          <p>Крыло, доска и фойл. Для первого опыта, фойла за лодкой и прогресса.</p>
          <span>Подробнее</span><em>Цены</em>
        </div>
      </a>
      <a class="sport-tile" href="/dahab/windsurf/" aria-label="Открыть страницу Windsurf в Дахабе">
        <img src="${dahabRefImg("windsurf-hero.webp")}" alt="Windsurf в Дахабе" width="1600" height="1067" loading="lazy" decoding="async">
        <div class="sport-tile__content">
          <h2>Windsurf</h2>
          <p>Парус, доска, курс для новичков и прокат для самостоятельных райдеров.</p>
          <span>Подробнее</span><em>Цены</em>
        </div>
      </a>
    </div>
    <a class="wsk-strip" href="/dahab/windsurf-kids/">
      <span class="wsk-strip__media"><img src="${dahabRefImg("wsk-2.webp")}" alt="Детский windsurf в Дахабе" width="1090" height="600" loading="lazy" decoding="async"></span>
      <span class="wsk-strip__content"><small>Windsurf Kids · от 55$</small><b>Kids windsurf</b><em>Лёгкие паруса, спокойная вода и инструктор рядом. Формат для детей без лишнего давления.</em></span>
      <span class="wsk-strip__button">Смотреть Kids</span>
    </a>
  </div>
</section>

<section class="dahab-section compact-band" id="prices">
  <div class="dahab-inner">
    <header class="section-heading">
      <p class="eyebrow">Цены</p>
      <h2>Платишь только за то, что катал</h2>
      <div class="price-badges"><span>Выбор формата</span><span>Выход на воду</span><span>Расчёт по факту</span></div>
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
      <nav><a href="/contacts/">Оставить заявку</a><a href="/dahab/price/">Смотреть полный прайс</a></nav>
    </div>
  </div>
</section>

<section class="station-advice" id="stations">
  <header class="station-advice__head">
    <p class="eyebrow">Станции</p>
    <h2>Станции Vetratoria в Дахабе</h2>
    <p>Точка зависит от ветра, спорта и уровня. Выберите формат — мы подскажем, куда лучше приехать сегодня.</p>
  </header>
  <div class="station-advice__list">
    ${stations.map(([title, meta, text, image]) => `<a href="/dahab/stations/">
        <figure><img src="${image}" alt="${title}" width="1600" height="1067" loading="lazy" decoding="async"></figure>
        <div><b>${title}</b><span>${meta}</span><em>${text}</em></div>
      </a>`).join("")}
  </div>
  <p class="station-advice__note">Не нужно выбирать самому — подскажем точку под ветер, спорт и уровень.</p>
  <a class="station-advice__cta" href="/contacts/">Подобрать станцию с менеджером →</a>
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
      <a class="station-atmosphere__card" href="/dahab/price/"><img src="${dahabRefImg("block-station.webp")}" alt="Станция Vetratoria" loading="lazy" decoding="async"><span>Цены</span><strong>Форматы без пакетов</strong><em>Формат и расчёт по фактическому объёму</em></a>
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
      <div class="water-area__actions"><a href="/contacts/">Подобрать зону</a><a href="/dahab/safety/">Безопасность на воде →</a></div>
    </div>
    <figure class="water-area__visual"><img src="${dahabRefImg("aqva-aerial.webp")}" alt="Акватория Дахаба для wingfoil и windsurf" loading="lazy" decoding="async"></figure>
  </div>
</section>`;
};

const countryPage = (page) => {
  const country = countriesByKey[page.country];
  if (country.key === "dahab") return dahabHomePage(page);
  const actions = `<a class="button button-primary" href="/${country.key}/price/">Цены</a><a class="button button-ghost" href="/contacts/">Написать нам</a>`;
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
        <a class="link-card link-card--accent" href="/${country.key}/price/"><small>Price</small><h3>Цены и форматы</h3><p>Уроки, курсы, прокат, хранение и подбор программы.</p><em>Смотреть цены</em></a>
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

  const country = countriesByKey[page.country];
  const sport = site.sports[page.sport];
  return `${hero(page, `<a class="button button-primary" href="${page.path}price/">Цены</a><a class="button button-ghost" href="/contacts/">Записаться</a>`)}
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

const pricePage = (page) => {
  const country = countriesByKey[page.country];
  const sport = page.sport ? site.sports[page.sport] : null;
  const title = sport ? sport.title : "Vetratoria";
  return `${hero(page, `<a class="button button-primary" href="/contacts/">Уточнить цену</a><a class="button button-ghost" href="/${country.key}/">К направлению</a>`)}
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
${hero(page, `<a class="button button-primary" href="/contacts/">Задать вопрос</a>`)}
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
  return `${hero(page, `<a class="button button-primary" href="/${country.key}/${page.sport}/">Открыть спорт</a><a class="button button-ghost" href="/contacts/">Написать нам</a>`)}
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
  return `${hero(page, `<a class="button button-primary" href="/contacts/">Запросить поездку</a>`)}
  <section class="content-section">
    <div class="section-inner">
      ${sectionHeading(page.eyebrow || "Медиа", page.title, page.description)}
      <div class="photo-strip">
        ${images.map((src, index) => `<figure class="${index % 3 === 0 ? "is-wide" : ""}">${cardImage(src, page.title)}<figcaption>${index + 1 < 10 ? `0${index + 1}` : index + 1}</figcaption></figure>`).join("")}
      </div>
    </div>
  </section>`;
};

const contactsPage = (page) => `
${hero(page, `<a class="button button-primary" href="mailto:${site.email}">Email</a><a class="button button-ghost" href="tel:${site.phone.replace(/\s/g, "")}">Позвонить</a>`)}
<section class="content-section">
  <div class="section-inner contact-layout">
    <div>
      ${sectionHeading("Заявка", "Расскажите о поездке", "Страна, даты, спорт, уровень и количество людей - этого достаточно, чтобы команда предложила понятный формат.")}
      <div class="contact-cards">
        <a href="mailto:${site.email}"><small>Email</small><b>${site.email}</b></a>
        <a href="tel:${site.phone.replace(/\s/g, "")}"><small>Phone / WhatsApp</small><b>${site.phone}</b></a>
      </div>
    </div>
    <form class="contact-form" data-contact-form>
      <label>Имя<input name="name" autocomplete="name" placeholder="Ваше имя"></label>
      <label>Направление<select name="country"><option>Египет · Дахаб</option><option>Вьетнам · Муйне</option><option>Россия · Должанская</option></select></label>
      <label>Сообщение<textarea name="message" rows="5" placeholder="Даты, уровень, спорт, вопросы"></textarea></label>
      <button class="button button-primary" type="submit">Подготовить заявку</button>
      <p class="form-note" data-form-note></p>
    </form>
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
  return `${hero(page, `<a class="button button-primary" href="/contacts/">Написать нам</a><a class="button button-ghost" href="${country.href}">К направлению</a>`)}
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
      return layout(page, home());
    case "country":
      return layout(page, countryPage(page));
    case "sport":
      return layout(page, sportPage(page));
    case "price":
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
    default:
      return layout(page, featurePage(page));
  }
};

for (const page of allPages) {
  const file = pathToFile(page.path);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, render(page), "utf8");
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map((page) => `  <url><loc>https://vetratoria.ru${page.path}</loc></url>`).join("\n")}
</urlset>
`;

await writeFile(join(root, "sitemap.xml"), sitemap, "utf8");
await writeFile(join(root, "robots.txt"), "User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n", "utf8");

console.log(`Built ${allPages.length} pages.`);
