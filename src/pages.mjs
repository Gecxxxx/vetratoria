import { mediaAlbums } from "./media.mjs";

const img = (name) => `/assets/img/home-uploaded/${name}`;
const dahabImg = (name) => `/assets/img/dahab/${name}`;

const dahabSportOverrides = {
  wingfoil: {
    title: "Вингфойл в Дахабе",
    description:
      "Научим управлять крылом, вставать на фойл и уверенно кататься. Пошаговая программа, индивидуальный инструктор и безопасная практика на воде.",
    image: "/assets/img/final/wingfoil/hero-duo.webp"
  },
  windsurf: {
    title: "Виндсёрфинг в Дахабе",
    description:
      "Научим управлять парусом, идти нужным курсом и уверенно кататься на доске. Уроки, прокат и программа под ваш уровень на Красном море.",
    image: "/assets/img/final/windsurf/hero.webp"
  },
  "windsurf-kids": {
    title: "Детский лагерь Детский виндсёрфинг в Дахабе",
    description:
      "Виндсёрфинг, виндфойл, вингфойл и насыщенная программа для детей от 6 лет на Красном море.",
    image: "/assets/img/windsurf-kids/hero.webp"
  }
};

export const site = {
  name: "Ветратория",
  baseUrl: "https://vetratoria.ru",
  locale: "ru_RU",
  title: "Ветратория — школы виндсёрфинга и вингфойла в Египте, Вьетнаме и России",
  description:
    "Ветратория — сеть школ виндсёрфинга и вингфойла. Египет, Вьетнам и Россия: выберите направление, спорт, станцию и формат обучения.",
  email: "dahab@vetratoria.ru",
  phone: "+201029321772",
  contactEndpoint: "",
  logo: "/assets/img/vetratoria-logo.png",
  socials: [
    {
      label: "VKontakte",
      href: "https://vk.ru/club2195523",
      icon: "/assets/icons/vk.svg"
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/vetratoriaofficiale/",
      icon: "/assets/icons/instagram.svg"
    },
    {
      label: "Tripadvisor",
      href: "https://www.tripadvisor.ru/Attraction_Review-g297547-d9806047-Reviews-Vetratoria_Windsurfing_SUP_Centre-Dahab_South_Sinai_Red_Sea_and_Sinai.html",
      icon: "/assets/icons/tripadvisor.svg"
    }
  ],
  contacts: {
    dahab: {
      title: "Египет · Дахаб",
      formEmail: "dahab@vetratoria.ru",
      email: "dahab@vetratoria.ru",
      phone: "+201029321772",
      phoneLabel: "+20 102 932 1772",
      telegram: "https://t.me/dahabvetratoria",
      pageTitle: "Контакты Ветратории в Дахабе",
      pageDescription:
        "Свяжитесь с виндсёрфинг-станциями или винг-центр в Дахабе: WhatsApp, Telegram, электронная почта и чаты райдеров."
    },
    vietnam: {
      title: "Вьетнам · Муйне",
      formEmail: "vietnam@vetratoria.ru",
      email: "vietnam@vetratoria.ru",
      phone: "+79884715355",
      phoneLabel: "+7 988 471 5355",
      telegram: "https://t.me/+79884715355",
      pageTitle: "Контакты Ветратории во Вьетнаме",
      pageDescription:
        "Напишите команде Ветратории в Муйне, чтобы уточнить даты, условия и подходящий формат занятий."
    },
    russia: {
      title: "Россия · Должанская",
      formEmail: "russia@vetratoria.ru",
      email: "russia@vetratoria.ru",
      phone: "+79884715355",
      phoneLabel: "+7 988 471 5355",
      telegram: "https://t.me/+79884715355",
      pageTitle: "Контакты Ветратории в России",
      pageDescription:
        "Свяжитесь с командой Ветратории на Должанской: подскажем по сезону, обучению, прокату и поездке."
    }
  },
  dahabStations: [
    {
      key: "windsurf",
      eyebrow: "Виндсёрфинг · станции",
      title: "Виндсёрфинг в Дахабе",
      description: "Ганет Синай и Свисс Инн: обучение, прокат и помощь команды на воде.",
      email: "dahab@vetratoria.ru",
      phone: "+201029321772",
      phoneLabel: "+20 102 932 1772",
      telegram: "https://t.me/dahabvetratoria"
    },
    {
      key: "wingfoil",
      eyebrow: "Вингфойл · Винг-центр",
      title: "Винг-центр",
      description: "Вингфойл, фойл за лодкой, обучение с нуля и самостоятельная практика.",
      email: "vetratoria.wingcenter@gmail.com",
      phone: "+201151015941",
      phoneLabel: "+20 115 101 5941",
      telegram: "https://t.me/talking_wingfoil_center_dahab"
    }
  ],
  countries: [
    {
      key: "dahab",
      nav: "Египет",
      region: "Египет",
      city: "Дахаб",
      title: "Дахаб",
      href: "/dahab/",
      hero: img("home-direction-dahab.webp"),
      lead:
        "Главное направление Ветратории: вингфойл, виндсёрфинг, детский виндсёрфинг, станции, цены и безопасность.",
      season: "365 дней в году",
      seasonTitle: "Круглый год",
      seasonMonths: ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"],
      seasonNote: "Школы работают круглый год; конкретное ветровое окно уточняем под даты и выбранный спорт.",
      windLabel: "Ветер почти круглый год",
      windSummary: "Стабильные ветровые условия и несколько зон позволяют подбирать формат под уровень и фактическую обстановку на воде.",
      windStat: "12/12",
      windStatLabel: "месяцев для поездки",
      windMonths: {
        jan: { wind: "11–20 узлов / 5,7–10,3 м/с", windy: "60%", air: "18–23 °C", water: "22 °C" },
        feb: { wind: "11–17 узлов / 5,7–8,7 м/с", windy: "55%", air: "18–23 °C", water: "22 °C" },
        mar: { wind: "15–24 узла / 7,7–12,3 м/с", windy: "65%", air: "20–25 °C", water: "22 °C" },
        apr: { wind: "18–28 узлов / 9,3–14,4 м/с", windy: "85%", air: "25–28 °C", water: "22 °C" },
        may: { wind: "18–28 узлов / 9,3–14,4 м/с", windy: "95%", air: "28–32 °C", water: "24 °C" },
        jun: { wind: "20–30 узлов / 10,3–15,4 м/с", windy: "93%", air: "30–35 °C", water: "25 °C" },
        jul: { wind: "20–30 узлов / 10,3–15,4 м/с", windy: "92%", air: "33–38 °C", water: "27 °C" },
        aug: { wind: "18–28 узлов / 9,3–14,4 м/с", windy: "90%", air: "33–39 °C", water: "27 °C" },
        sep: { wind: "20–29 узлов / 10,3–14,9 м/с", windy: "90%", air: "30–35 °C", water: "27 °C" },
        oct: { wind: "17–25 узлов / 8,7–12,9 м/с", windy: "70%", air: "26–31 °C", water: "26 °C" },
        nov: { wind: "13–22 узла / 6,7–11,3 м/с", windy: "60%", air: "22–27 °C", water: "25 °C" },
        dec: { wind: "11–20 узлов / 5,7–10,3 м/с", windy: "50%", air: "20–24 °C", water: "23 °C" }
      },
      tone: "лагуна, фрирайд, фойл за лодкой и сильная инструкторская команда",
      sports: ["wingfoil", "windsurf"],
      extras: [
        { title: "Станции", href: "/dahab/stations/" },
        { title: "Безопасность", href: "/dahab/safety/" },
        { title: "Команда", href: "/dahab/team/" },
        { title: "Как добраться", href: "/dahab/how-to-get/" }
      ]
    },
    {
      key: "vietnam",
      nav: "Вьетнам",
      region: "Вьетнам",
      city: "Муйне",
      title: "Муйне",
      href: "/vietnam/",
      hero: img("home-direction-vietnam.webp"),
      lead:
        "Вьетнамское направление Ветратории: сезон, виндсёрфинг, вингфойл, кайтсёрфинг, условия поездки и контакты.",
      season: "ноябрь — март",
      seasonTitle: "Ноябрь — март",
      seasonMonths: ["nov", "dec", "jan", "feb", "mar"],
      seasonNote: "Основной ветровой сезон в Муйне длится с ноября по март. Доступность занятий и прогноз команда подтверждает перед поездкой.",
      windLabel: "Стабильный бриз в сезон",
      windSummary: "Зимний бриз, волна и длинная береговая линия подходят для обучения, прогресса и самостоятельного катания.",
      windStat: "5/12",
      windStatLabel: "месяцев зимнего ветра",
      tone: "волна, стабильный бриз, длинная береговая линия и активная станционная жизнь",
      sports: ["windsurf", "wingfoil", "kite"],
      extras: [
        { title: "Цены на виндсёрфинг", href: "/vietnam/windsurf/price/" },
        { title: "Команда", href: "/vietnam/team/" },
        { title: "Блог", href: "/vietnam/blog/" }
      ]
    },
    {
      key: "russia",
      nav: "Россия",
      region: "Россия",
      city: "Должанская",
      title: "Должанская",
      href: "/russia/",
      hero: img("home-direction-russia.webp"),
      lead:
        "Российское направление Ветратории: обучение, прокат, летний сезон и станционная жизнь.",
      season: "май — первая половина сентября",
      seasonTitle: "Май — середина сентября",
      seasonMonths: ["may", "jun", "jul", "aug", "sep"],
      seasonNote: "Основной сезон на Должанской — с мая до середины сентября. Условия и расписание команда уточняет под конкретные даты.",
      windLabel: "Ветер по фактическим условиям",
      windSummary: "Мелкая вода и старт с берега помогают учиться; силу и направление ветра подтверждаем перед выходом.",
      windStat: "5/12",
      windStatLabel: "месяцев летнего ветра",
      tone: "коса, мелкая вода, обучение с берега, семейные поездки и тренировки на несколько дней",
      sports: ["windsurf", "wingfoil", "kite"],
      extras: [
        { title: "Цены на виндсёрфинг", href: "/russia/windsurf/price/" },
        { title: "Команда", href: "/russia/team/" },
        { title: "Блог", href: "/russia/blog/" }
      ]
    }
  ],
  sports: {
    wingfoil: {
      nav: "Вингфойл",
      title: "Вингфойл",
      subtitle: "Крыло и фойл",
      lead:
        "Первые полеты, фойл за лодкой, Винг + SUP, Винг + фойл и понятный прогресс от старта до самостоятельного катания.",
      hero: img("home-slider-6.webp"),
      bullets: ["старт с инструктором", "подбор крыла и доски", "контроль безопасности", "маршрут прогресса"]
    },
    windsurf: {
      nav: "Виндсёрфинг",
      title: "Виндсёрфинг",
      subtitle: "Парус и доска",
      lead:
        "Классическое обучение, прокат, курсы, фрирайд и уверенное катание на ветру под задачу и уровень.",
      hero: img("home-slider-1.webp"),
      bullets: ["первые галсы", "курсы для прогресса", "прокат снаряжения", "фрирайд и техника"]
    },
    "windsurf-kids": {
      nav: "Детский виндсёрфинг",
      title: "Детский виндсёрфинг",
      subtitle: "Детский формат",
      lead:
        "Легкие паруса, спокойный темп, безопасная акватория и программа, в которой ребенок понимает воду и ветер.",
      hero: img("home-slider-4.webp"),
      bullets: ["легкое снаряжение", "игровая подача", "короткие уроки", "постоянный контроль"]
    },
    kite: {
      nav: "Кайтсёрфинг",
      title: "Кайтсёрфинг",
      subtitle: "Кайт и ветер",
      lead:
        "Обучение кайту, управление крылом, безопасный старт, первые проходы и самостоятельная практика.",
      hero: img("home-slider-5.webp"),
      bullets: ["управление кайтом", "бодидраг", "старт с доской", "практика по ветру"]
    }
  },
  slider: [
    img("home-slider-6.webp"),
    img("home-slider-2.webp"),
    img("home-slider-3.webp"),
    img("home-slider-4.webp"),
    img("home-slider-5.webp"),
    img("home-slider-1.webp")
  ]
};

export const articles = [
  {
    href: "/dahab/blog/windsurf/",
    country: "dahab",
    sport: "windsurf",
    topics: ["windsurf"],
    title: "Как начать заниматься виндсёрфинг в Дахабе",
    lead: "Что выбрать на первом уроке, как проходит обучение и почему лагуна помогает быстрее поймать баланс.",
    image: img("home-slider-1.webp")
  },
  {
    href: "/dahab/blog/wingfoil/",
    country: "dahab",
    sport: "wingfoil",
    topics: ["wingfoil"],
    title: "Вингфойл в Дахабе: от крыла до первого полета",
    lead: "Форматы Винг + SUP, Винг + фойл, фойл за лодкой и логика перехода от контроля крыла к полету.",
    image: img("home-slider-6.webp")
  },
  {
    href: "/dahab/blog/windsurf-kids/",
    country: "dahab",
    sport: "windsurf-kids",
    topics: ["wsk", "safety"],
    title: "Детский виндсёрфинг: как ребенку выйти на воду спокойно",
    lead: "Легкие паруса, короткие уроки, инструктор рядом и безопасный темп без давления.",
    image: img("home-slider-4.webp")
  },
  {
    href: "/vietnam/blog/windsurf/",
    country: "vietnam",
    sport: "windsurf",
    topics: ["windsurf", "trip"],
    title: "Виндсёрфинг в Муйне: ветер, волна и сезон",
    lead: "Как готовиться к поездке, какие условия ждать и кому подойдет вьетнамская акватория.",
    image: img("home-direction-vietnam.webp")
  },
  {
    href: "/vietnam/blog/wingfoil/",
    country: "vietnam",
    sport: "wingfoil",
    topics: ["wingfoil", "trip"],
    title: "Вингфойл во Вьетнаме",
    lead: "Стабильный бриз, пространство для прогресса и сценарии занятий на несколько дней.",
    image: img("home-slider-6.webp")
  },
  {
    href: "/vietnam/blog/kite/",
    country: "vietnam",
    sport: "kite",
    topics: ["kite", "safety", "trip"],
    title: "Кайт в Муйне",
    lead: "Почему направление подходит для кайта, как строится обучение и что учесть перед стартом.",
    image: img("home-slider-5.webp")
  },
  {
    href: "/russia/blog/windsurf/",
    country: "russia",
    sport: "windsurf",
    topics: ["windsurf", "trip"],
    title: "Виндсёрфинг на Должанской",
    lead: "Летний формат, мелкая вода, старт с берега и удобный план для первых галсов.",
    image: img("home-direction-russia.webp")
  },
  {
    href: "/russia/blog/wingfoil/",
    country: "russia",
    sport: "wingfoil",
    topics: ["wingfoil", "trip"],
    title: "Вингфойл в России",
    lead: "Как использовать летний сезон для первых полетов и спокойного прогресса на фойле.",
    image: img("home-slider-6.webp")
  },
  {
    href: "/russia/blog/kite/",
    country: "russia",
    sport: "kite",
    topics: ["kite", "safety", "trip"],
    title: "Кайт на Должанской",
    lead: "Кому подойдет российская локация и как безопасно войти в кайт-формат.",
    image: img("home-slider-5.webp")
  }
];

const countryByKey = Object.fromEntries(site.countries.map((country) => [country.key, country]));

const pages = [
  {
    path: "/",
    kind: "home",
    title: site.title,
    description: site.description,
    image: img("home-slider-1.webp")
  },
  {
    path: "/blog/",
    kind: "blog-index",
    eyebrow: "Блог",
    title: "Материалы со всех стран",
    description: "Статьи по странам, спорту, обучению, безопасности и оборудованию.",
    image: img("home-blog.webp"),
    articles
  },
  {
    path: "/media/",
    kind: "media-index",
    eyebrow: "Медиа Ветратории",
    title: "Медиа Ветратории",
    description: "Фотографии Ветратории по странам, видам спорта, событиям и датам.",
    image: img("home-media.webp")
  },
  {
    path: "/contacts/",
    kind: "contacts",
    eyebrow: "Контакты",
    title: "Напишите нам - подберем направление",
    description: "Укажите страну, даты, уровень и спорт. Подскажем, куда лучше ехать и какой формат выбрать.",
    image: img("ABOUTVETRATORIA.jpg")
  },
  {
    path: "/404.html",
    kind: "not-found",
    eyebrow: "Ошибка 404",
    title: "Эта страница ушла по ветру",
    description: "Вернитесь на главную или выберите направление Ветратории.",
    image: img("home-slider-2.webp")
  },
];

for (const country of site.countries) {
  const countryAlbums = mediaAlbums
    .filter((album) => album.country === country.key)
    .sort((a, b) => b.date.localeCompare(a.date));

  pages.push({
    path: `/media/${country.key}/`,
    kind: "media-country",
    country: country.key,
    galleryCountry: country.key,
    eyebrow: `Медиа · ${country.region}`,
    title: `Альбомы: ${country.city}`,
    description: `Фотографии ${country.city}: спорт, события, команда и жизнь станции.`,
    image: country.hero,
    albums: countryAlbums
  });

  for (const album of countryAlbums) {
    pages.push({
      path: `/media/${country.key}/${album.slug}/`,
      kind: "media-album",
      country: country.key,
      galleryCountry: country.key,
      eyebrow: `${country.region} · ${album.date}`,
      title: album.title,
      description: album.description,
      image: album.cover,
      album
    });
  }

  pages.push({
    path: country.href,
    kind: "country",
    country: country.key,
    eyebrow: `${country.region} · ${country.city}`,
    title: country.title,
    description: country.lead,
    image: country.hero
  });

  pages.push({
    path: `/${country.key}/blog/`,
    kind: "blog-index",
    country: country.key,
    eyebrow: `${country.region} · блог`,
    title: `Блог: ${country.title}`,
    description: `Материалы про спорт, обучение, сезон и поездку в ${country.city}.`,
    image: country.hero,
    articles: articles.filter((article) => article.country === country.key)
  });

  pages.push({
    path: `/${country.key}/team/`,
    kind: "team",
    country: country.key,
    eyebrow: `${country.region} · команда`,
    title: country.key === "dahab" ? "Люди, которые держат курс" : `Команда ${country.title}`,
    description: country.key === "dahab"
      ? "Инструкторы, тренеры, администраторы и спасатели Ветратории. На берегу и на воде рядом всегда есть человек, которому можно доверять."
      : "Инструкторы, администраторы, менеджеры и поддержка на воде.",
    image: img("ABOUTVETRATORIA.jpg")
  });

  const contact = site.contacts[country.key];
  pages.push({
    path: `/${country.key}/contacts/`,
    kind: "contacts",
    country: country.key,
    eyebrow: `${country.region} · контакты`,
    title: contact.pageTitle,
    description: contact.pageDescription,
    image: country.key === "dahab" ? "/assets/img/contacts/dahab-hero.webp" : country.hero
  });

  for (const sportKey of country.sports) {
    const sport = site.sports[sportKey];
    const sportOverride = country.key === "dahab" ? dahabSportOverrides[sportKey] : null;
    const isDahabWingfoilPrice = country.key === "dahab" && sportKey === "wingfoil";
    const isDahabWindsurfPrice = country.key === "dahab" && sportKey === "windsurf";
    pages.push({
      path: `/${country.key}/${sportKey}/`,
      kind: "sport",
      country: country.key,
      sport: sportKey,
      eyebrow: `${country.title} · ${sport.title}`,
      title: sportOverride?.title || `${sport.title} в ${country.city}`,
      description: sportOverride?.description || sport.lead,
      image: sportOverride?.image || sport.hero
    });
    pages.push({
      path: `/${country.key}/${sportKey}/price/`,
      kind: "sport-price",
      country: country.key,
      sport: sportKey,
      eyebrow: `${sport.title} · цены`,
      title: isDahabWingfoilPrice
        ? "Цены на вингфойл в Дахабе"
        : isDahabWindsurfPrice
          ? "Цены на виндсёрфинг в Дахабе"
          : `${sport.title}: цены ${country.title}`,
      description: isDahabWingfoilPrice
        ? "Аренда комплектов, уроки, отдельные части оборудования и пакеты Вингфойл в Дахабе."
        : isDahabWindsurfPrice
          ? "Полный прайс Виндсёрфинг в Дахабе: обучение, индивидуальные занятия, прокат, скидки, гидрофойл и хранение."
          : `Форматы занятий, курсы и самостоятельная практика: ${sport.lead.toLowerCase()}`,
      image: isDahabWingfoilPrice
        ? "/assets/img/final/wingfoil/hero.webp"
        : isDahabWindsurfPrice
          ? "/assets/img/final/windsurf/hero.webp"
          : sport.hero
    });
  }
}

pages.push(
  {
    path: "/dahab/how-to-get/",
    kind: "route",
    country: "dahab",
    eyebrow: "Дахаб · дорога",
    title: "Как добраться до Дахаба",
    description: "Перелёт до Шарм-эль-Шейха, трансфер в Дахаб, стоимость поездки и актуальные правила въезда в Египет.",
    image: "/assets/img/contacts/dahab-hero.webp"
  },
  {
    path: "/dahab/safety/",
    kind: "safety",
    country: "dahab",
    eyebrow: "Дахаб · безопасность",
    title: "Безопасность в Дахабе — спасение, связь и инструктаж",
    description: "4 спасательных катера, контроль на воде, связь на волнах, инструктаж и объяснение акватории перед каждым выходом.",
    image: "/assets/img/final/dahab/safety-boat.webp"
  },
  {
    path: "/dahab/stations/",
    kind: "stations",
    country: "dahab",
    eyebrow: "Дахаб · станции",
    title: "Станции Ветратории в Дахабе",
    description: "Ветратория Ганет Синай, Винг-центр и Свисс Инн: где кататься на вингфойле и виндсёрфинге в Дахабе.",
    image: "/assets/img/final/stations/hero.webp"
  }
);

for (const article of articles) {
  const country = countryByKey[article.country];
  const sport = site.sports[article.sport];
  pages.push({
    path: article.href,
    kind: "article",
    country: article.country,
    sport: article.sport,
    eyebrow: `${country.title} · ${sport.nav}`,
    title: article.title,
    description: article.lead,
    image: article.image,
    article
  });
}

const byPath = new Map();
for (const page of pages) {
  byPath.set(page.path, page);
}

export const allPages = [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path));
export const countriesByKey = countryByKey;
