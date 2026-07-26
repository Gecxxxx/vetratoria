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
const sportList = Object.entries(site.sports).map(([key, value]) => {
  const country = site.countries.find((item) => item.sports.includes(key)) || site.countries[0];
  return { key, href: `/${country.key}/${key}/`, ...value };
});

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

const uniqueLinks = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  });
};

const countryMenuLinks = (country) => uniqueLinks([
  { label: "Главная", href: country.href, note: country.city },
  ...country.sports.map((sportKey) => ({
    label: site.sports[sportKey].nav,
    href: `/${country.key}/${sportKey}/`,
    note: site.sports[sportKey].subtitle
  })),
  { label: "Цены", href: `/${country.key}/price/`, note: "Форматы и уроки" },
  ...country.extras.map((item) => ({ label: item.title, href: item.href, note: "Раздел направления" })),
  { label: "Блог", href: `/${country.key}/blog/`, note: "Материалы" },
  { label: "Медиа", href: `/media/${country.key}/`, note: "Фото и видео" }
]);

const directionsMenu = () => `
      <div class="vtr-nav__item vtr-nav__item--drop vtr-nav__item--directions">
        <a href="/#destinations">Направления <span aria-hidden="true">⌄</span></a>
        <div class="vtr-nav__dropdown vtr-nav__dropdown--directions">
          ${countryList.map((country) => `
            <div class="vtr-nav__country-menu">
              <a class="vtr-nav__country-trigger" href="${country.href}">
                <b>${country.nav}</b>
                <span>${country.city}</span>
                <i aria-hidden="true">›</i>
              </a>
              <div class="vtr-nav__submenu">
                ${countryMenuLinks(country).map((link) => `<a href="${link.href}"><b>${link.label}</b><span>${link.note}</span></a>`).join("")}
              </div>
            </div>`).join("")}
        </div>
      </div>`;

const sportMenu = () => `
      <div class="vtr-nav__item vtr-nav__item--drop">
        <a href="/dahab/#sport">Спорт <span aria-hidden="true">⌄</span></a>
        <div class="vtr-nav__dropdown">
          ${sportList.map((sport) => `<a href="${sport.href}"><b>${sport.nav}</b><span>${sport.subtitle}</span></a>`).join("")}
        </div>
      </div>`;

const homeNavPanel = () => `
    <nav class="vtr-nav__panel vtr-nav__panel--flat" aria-label="Основная навигация" data-nav-panel aria-hidden="false">
      <a href="/#destinations">Направления</a>
      ${countryList.map((country) => `<a href="${country.href}">${country.nav}</a>`).join("")}
      <a href="/dahab/windsurf/">Windsurf</a>
      <a href="/dahab/wingfoil/">Wingfoil</a>
      <a href="/dahab/windsurf-kids/">Kids</a>
      <a href="/blog/">Блог</a>
      <a href="/media/">Медиа</a>
      <a href="/contacts/">Контакты</a>
    </nav>`;

const sectionNavPanel = () => `
    <nav class="vtr-nav__panel vtr-nav__panel--nested" aria-label="Основная навигация" data-nav-panel aria-hidden="false">
      ${directionsMenu()}
      ${sportMenu()}
      <a href="/blog/">Блог</a>
      <a href="/media/">Медиа</a>
      <a href="/contacts/">Контакты</a>
    </nav>`;

const header = (page) => `
<header class="site-header vtr-nav" data-nav>
  <div class="vtr-nav__top">
    <div class="vtr-nav__contacts">
      <a href="mailto:${site.email}">${site.email}</a>
      <a href="tel:${site.phone.replace(/\s/g, "")}">${site.phone}</a>
    </div>
    <nav class="vtr-nav__countries" aria-label="Выбор страны">
      <div class="vtr-nav__countries-inner">
        ${countryList.map((country) => `<a class="vtr-nav__country" href="${country.href}">${country.nav}</a>`).join("")}
      </div>
    </nav>
    <div class="vtr-nav__right">
      <div class="vtr-nav__socials">
        ${site.socials.map((item) => `<a href="${item.href}" aria-label="${item.label}">${item.label}</a>`).join("")}
      </div>
      <div class="vtr-nav__lang-drop" data-lang>
        <button type="button" aria-expanded="false" data-lang-toggle>RU <span aria-hidden="true">⌄</span></button>
        <div class="vtr-nav__lang-menu">
          <a href="#">EN</a>
          <a href="#">DE</a>
        </div>
      </div>
    </div>
  </div>
  <div class="vtr-nav__main">
    <a class="vtr-nav__logo" href="/" aria-label="Vetratoria - главная">
      <img src="${site.logo}" alt="Vetratoria" width="198" height="97">
    </a>
    <button class="vtr-nav__burger" type="button" aria-label="Открыть меню" aria-expanded="false" data-menu-toggle>
      <span></span><span></span><span></span>
    </button>
    ${page.kind === "home" ? homeNavPanel() : sectionNavPanel()}
  </div>
</header>`;

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

const layout = (page, main) => `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(page.title || site.title)}</title>
  <meta name="description" content="${escapeHtml(page.description || site.description)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${site.name}">
  <meta property="og:title" content="${escapeHtml(page.title || site.title)}">
  <meta property="og:description" content="${escapeHtml(page.description || site.description)}">
  <meta property="og:image" content="${page.image || site.slider[0]}">
  <meta name="theme-color" content="#0d0c0b">
  <link rel="icon" href="${site.logo}">
  <link rel="stylesheet" href="/assets/css/styles.css">
  <script defer src="/assets/js/app.js"></script>
</head>
<body class="modern-site ${page.kind}${page.country ? ` country-${page.country}` : ""}">
  <a class="skip-link" href="#main">К содержанию</a>
  ${header(page)}
  <main id="main">${main}</main>
  ${footer()}
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

const dahabHomePage = (page) => {
  const prices = [
    ["Wingfoil", "Урок", "70$", "Инструктор и комплект под уровень.", dahabImg("wingfoil-lesson-coaching.webp"), "/dahab/wingfoil/price/"],
    ["Foil boat", "Фойл за лодкой", "60$", "Полёт на фойле без крыла.", dahabImg("wingfoil-hero.webp"), "/dahab/wingfoil/price/"],
    ["Windsurf", "Урок", "70$", "Парус, доска и инструктор.", dahabImg("windsurf-lesson-water.webp"), "/dahab/windsurf/price/"],
    ["Kids", "Детский урок", "от 55$", "Лёгкое снаряжение и мягкий темп.", dahabImg("windsurf-kids-03.webp"), "/dahab/windsurf-kids/"]
  ];
  const stations = [
    ["Wing Center", "Wingfoil · уроки · практика", "Крылья, фойлы, уроки, практика и foil boat.", dahabImg("wingfoil-lesson-coaching.webp")],
    ["Swiss Inn", "Windsurf · lessons · rental", "Учебная вода, уроки, практика и прокат.", dahabImg("windsurf-lesson-water.webp")],
    ["Ganet Sinai", "Windsurf · progress · practice", "Уроки, скорость и прогресс на воде.", dahabImg("dahab.webp")]
  ];

  return `
<section class="dahab-hero">
  <img class="dahab-hero__image" src="${dahabImg("dahab.webp")}" alt="Дахаб: Wingfoil и Windsurf на Красном море" width="1600" height="1067" fetchpriority="high">
  <div class="dahab-hero__shade"></div>
  <div class="dahab-hero__content">
    <p class="eyebrow">Египет · Дахаб</p>
    <h1>Дахаб: Wingfoil и Windsurf на Красном море</h1>
    <p>Уроки и прокат Wingfoil/Windsurf. Станции: Wing Center, Swiss Inn, Ganet Sinai. Формат подбираем по спорту, уровню и ветру.</p>
    <div class="dahab-hero__facts"><span>С 2006 года</span><span>Идеальная акватория</span><span>10000+ учеников</span></div>
    <div class="hero-actions">
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

<section class="dahab-section dahab-sports" id="sport">
  <div class="dahab-inner">
    <header class="dahab-heading">
      <p class="eyebrow">Выберите спорт</p>
      <h2>Wingfoil или Windsurf</h2>
      <p>Два основных направления Дахаба - крупно, на фото и без шаблонных карточек.</p>
    </header>
    <div class="dahab-sport-grid">
      <a class="dahab-sport-tile" href="/dahab/wingfoil/">
        <img src="${dahabImg("wingfoil-hero.webp")}" alt="Wingfoil в Дахабе" loading="lazy" decoding="async">
        <div><h2>Wingfoil</h2><p>Крыло, доска и фойл. Для первого опыта, фойла за лодкой и прогресса.</p><span>Подробнее</span><em>Цены</em></div>
      </a>
      <a class="dahab-sport-tile" href="/dahab/windsurf/">
        <img src="${dahabImg("windsurf-hero.webp")}" alt="Windsurf в Дахабе" loading="lazy" decoding="async">
        <div><h2>Windsurf</h2><p>Парус, доска, курс для новичков и прокат для самостоятельных райдеров.</p><span>Подробнее</span><em>Цены</em></div>
      </a>
    </div>
    <a class="dahab-kids-strip" href="/dahab/windsurf-kids/">
      <img src="${dahabImg("windsurf-kids-03.webp")}" alt="Детский windsurf в Дахабе" loading="lazy" decoding="async">
      <div><small>Windsurf Kids · от 55$</small><h2>Kids windsurf</h2><p>Лёгкие паруса, спокойная вода и инструктор рядом.</p></div>
      <span>Смотреть Kids</span>
    </a>
  </div>
</section>

<section class="dahab-section dahab-prices" id="prices">
  <div class="dahab-inner">
    <header class="dahab-heading dahab-heading--split">
      <p class="eyebrow">Цены</p>
      <h2>Цены по формату и времени на воде</h2>
    </header>
    <div class="dahab-price-grid">
      ${prices.map(([label, title, value, text, image, href]) => `
        <a class="dahab-price-card" href="${href}">
          <img src="${image}" alt="${label} ${title}" loading="lazy" decoding="async">
          <small>${label}</small>
          <h3>${title}</h3>
          <b>${value}</b>
          <p>${text}</p>
          <span>Смотреть формат →</span>
        </a>`).join("")}
    </div>
    <div class="dahab-price-help">
      <div><b>Не знаете, с чего начать?</b><p>Напишите даты, уровень и спорт - подберём формат, станцию и снаряжение.</p></div>
      <nav><a href="/contacts/">Оставить заявку</a><a href="/dahab/price/">Смотреть полный прайс</a></nav>
    </div>
  </div>
</section>

<section class="dahab-section dahab-water" id="water-area">
  <div class="dahab-inner dahab-water__grid">
    <div class="dahab-water__copy">
      <p class="eyebrow">Акватория</p>
      <h2>Где катаем в Дахабе</h2>
      <p>У Дахаба есть редкая фишка: рядом находятся спокойная вода для первых стартов, длинная зона для прогресса и открытое море для уверенных райдеров.</p>
      <article><b>01. Лагуна</b><span>Ровная вода и старт рядом с берегом.</span></article>
      <article><b>02. Скоростная зона</b><span>Длинные галсы, скорость и повороты.</span></article>
      <article><b>03. Волновая зона</b><span>Открытая вода для уверенной практики.</span></article>
      <div class="hero-actions"><a class="button button-primary" href="/contacts/">Подобрать зону</a><a class="button button-ghost" href="/dahab/safety/">Безопасность</a></div>
    </div>
    <figure class="dahab-map-card" aria-label="Акватория Дахаба">
      <img src="${dahabImg("dahab.webp")}" alt="Акватория Дахаба для wingfoil и windsurf" loading="lazy" decoding="async">
      <figcaption><span>Lagoon</span><span>Speed zone</span><span>Open sea</span></figcaption>
    </figure>
  </div>
</section>

<section class="dahab-section dahab-media-row">
  <div class="dahab-inner">
    <div class="dahab-mini-grid">
      <a class="dahab-mini-card dahab-mini-card--wide" href="/dahab/wingfoil/"><img src="${dahabImg("wingfoil-hero.webp")}" alt="Wingfoil" loading="lazy" decoding="async"><span>Wingfoil</span><b>Полёты над водой</b></a>
      <a class="dahab-mini-card" href="/dahab/windsurf/"><img src="${dahabImg("windsurf-lesson-water.webp")}" alt="Windsurf" loading="lazy" decoding="async"><span>Windsurf</span><b>Парус и ветер</b></a>
      <a class="dahab-mini-panel" href="/media/dahab/"><span>Фото с воды</span><b>Медиа</b><em>Смотреть</em></a>
    </div>
  </div>
</section>

<section class="dahab-section dahab-benefits">
  <div class="dahab-inner dahab-benefit-grid">
    ${[
      ["Оплата по факту", "Катаетесь и платите только за использованное время."],
      ["Подбор станции", "Подскажем точку под ветер, спорт и уровень."],
      ["Снаряжение RRD", "Крылья, паруса, доски и фойлы под разные задачи."],
      ["Rescue рядом", "Правила выхода и помощь на воде обсуждаются заранее."]
    ].map(([title, text]) => `<article><b>${title}</b><p>${text}</p></article>`).join("")}
  </div>
</section>

<section class="dahab-section dahab-stations" id="stations">
  <div class="dahab-inner">
    <header class="dahab-heading">
      <p class="eyebrow">Станции</p>
      <h2>Три станции в Дахабе</h2>
    </header>
    <div class="dahab-station-grid">
      ${stations.map(([title, meta, text, image]) => `
        <a class="dahab-station-card" href="/dahab/stations/">
          <img src="${image}" alt="${title}" loading="lazy" decoding="async">
          <span>${meta}</span>
          <h3>${title}</h3>
          <p>${text}</p>
        </a>`).join("")}
    </div>
    <div class="dahab-center-action"><a class="button button-primary" href="/contacts/">Написать нам</a></div>
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
