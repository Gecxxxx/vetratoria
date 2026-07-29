const img = (name) => `/assets/img/home-uploaded/${name}`;
const dahabImg = (name) => `/assets/img/dahab/${name}`;

const dahabSportOverrides = {
  wingfoil: {
    title: "Wingfoil в Дахабе",
    description:
      "Научим управлять крылом, вставать на фойл и уверенно кататься. Пошаговая программа, индивидуальный инструктор и безопасная практика на воде.",
    image: "/assets/img/final/wingfoil/hero-duo.webp"
  },
  windsurf: {
    title: "Windsurf в Дахабе",
    description:
      "Научим управлять парусом, идти нужным курсом и уверенно кататься на доске. Уроки, прокат и программа под ваш уровень на Красном море.",
    image: "/assets/img/final/windsurf/hero.webp"
  }
};

export const site = {
  name: "Vetratoria",
  title: "Vetratoria - windsurf и wingfoil школы в Египте, Вьетнаме и России",
  description:
    "Vetratoria - сеть windsurf и wingfoil школ. Египет, Вьетнам и Россия: выберите направление, спорт, станцию и формат обучения.",
  email: "dahab@vetratoria.ru",
  phone: "+201029321772",
  logo: "/assets/img/vetratoria-logo.png",
  socials: [
    { label: "VK", href: "/contacts/" },
    { label: "YT", href: "/media/" },
    { label: "TA", href: "/contacts/" }
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
        "Главное направление Vetratoria: Wingfoil, Windsurf, Windsurf Kids, станции, цены и безопасность.",
      season: "365 дней в году",
      tone: "лагуна, фрирайд, foil boat и сильная инструкторская команда",
      sports: ["wingfoil", "windsurf", "windsurf-kids"],
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
        "Вьетнамское направление Vetratoria: сезон, windsurf, wingfoil, kite, условия поездки и контакты.",
      season: "сильный зимний сезон",
      tone: "волна, стабильный бриз, длинная береговая линия и активная станционная жизнь",
      sports: ["windsurf", "wingfoil", "kite"],
      extras: [
        { title: "Цены Windsurf", href: "/vietnam/windsurf/price/" },
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
        "Российское направление Vetratoria: обучение, прокат, летний сезон и станционная жизнь.",
      season: "летний сезон",
      tone: "коса, мелкая вода, обучение с берега, семейные поездки и тренировки на несколько дней",
      sports: ["windsurf", "wingfoil", "kite"],
      extras: [
        { title: "Цены Windsurf", href: "/russia/windsurf/price/" },
        { title: "Команда", href: "/russia/team/" },
        { title: "Блог", href: "/russia/blog/" }
      ]
    }
  ],
  sports: {
    wingfoil: {
      nav: "Wingfoil",
      title: "Wingfoil",
      subtitle: "Крыло и фойл",
      lead:
        "Первые полеты, foil boat, Wing + SUP, Wing + Foil и понятный прогресс от старта до самостоятельного катания.",
      hero: img("home-slider-6.webp"),
      bullets: ["старт с инструктором", "подбор крыла и доски", "контроль безопасности", "маршрут прогресса"]
    },
    windsurf: {
      nav: "Windsurf",
      title: "Windsurf",
      subtitle: "Парус и доска",
      lead:
        "Классическое обучение, прокат, курсы, фрирайд и уверенное катание на ветру под задачу и уровень.",
      hero: img("home-slider-1.webp"),
      bullets: ["первые галсы", "курсы для прогресса", "прокат снаряжения", "фрирайд и техника"]
    },
    "windsurf-kids": {
      nav: "Windsurf Kids",
      title: "Windsurf Kids",
      subtitle: "Детский формат",
      lead:
        "Легкие паруса, спокойный темп, безопасная акватория и программа, в которой ребенок понимает воду и ветер.",
      hero: img("home-slider-4.webp"),
      bullets: ["легкое снаряжение", "игровая подача", "короткие уроки", "постоянный контроль"]
    },
    kite: {
      nav: "Kite",
      title: "Kite",
      subtitle: "Кайт и ветер",
      lead:
        "Обучение кайту, управление крылом, безопасный старт, первые проходы и самостоятельная практика.",
      hero: img("home-slider-5.webp"),
      bullets: ["управление кайтом", "body drag", "старт с доской", "практика по ветру"]
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
    title: "Как начать заниматься windsurf в Дахабе",
    lead: "Что выбрать на первом уроке, как проходит обучение и почему лагуна помогает быстрее поймать баланс.",
    image: img("home-slider-1.webp")
  },
  {
    href: "/dahab/blog/wingfoil/",
    country: "dahab",
    sport: "wingfoil",
    title: "Wingfoil в Дахабе: от крыла до первого полета",
    lead: "Форматы Wing + SUP, Wing + Foil, foil boat и логика перехода от контроля крыла к полету.",
    image: img("home-slider-6.webp")
  },
  {
    href: "/dahab/blog/windsurf-kids/",
    country: "dahab",
    sport: "windsurf-kids",
    title: "Windsurf Kids: как ребенку выйти на воду спокойно",
    lead: "Легкие паруса, короткие уроки, инструктор рядом и безопасный темп без давления.",
    image: img("home-slider-4.webp")
  },
  {
    href: "/vietnam/blog/windsurf/",
    country: "vietnam",
    sport: "windsurf",
    title: "Windsurf в Муйне: ветер, волна и сезон",
    lead: "Как готовиться к поездке, какие условия ждать и кому подойдет вьетнамская акватория.",
    image: img("home-direction-vietnam.webp")
  },
  {
    href: "/vietnam/blog/wingfoil/",
    country: "vietnam",
    sport: "wingfoil",
    title: "Wingfoil во Вьетнаме",
    lead: "Стабильный бриз, пространство для прогресса и сценарии занятий на несколько дней.",
    image: img("home-slider-6.webp")
  },
  {
    href: "/vietnam/blog/kite/",
    country: "vietnam",
    sport: "kite",
    title: "Кайт в Муйне",
    lead: "Почему направление подходит для кайта, как строится обучение и что учесть перед стартом.",
    image: img("home-slider-5.webp")
  },
  {
    href: "/russia/blog/windsurf/",
    country: "russia",
    sport: "windsurf",
    title: "Windsurf на Должанской",
    lead: "Летний формат, мелкая вода, старт с берега и удобный план для первых галсов.",
    image: img("home-direction-russia.webp")
  },
  {
    href: "/russia/blog/wingfoil/",
    country: "russia",
    sport: "wingfoil",
    title: "Wingfoil в России",
    lead: "Как использовать летний сезон для первых полетов и спокойного прогресса на фойле.",
    image: img("home-slider-6.webp")
  },
  {
    href: "/russia/blog/kite/",
    country: "russia",
    sport: "kite",
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
    eyebrow: "Photo / Video",
    title: "Медиа Vetratoria",
    description: "Фото и видео по Египту, Вьетнаму и России. Альбомы отдельно от статей.",
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
    path: "/media/dahab/",
    kind: "gallery",
    eyebrow: "Медиа",
    title: "Фото и видео Дахаба",
    description: "Wingfoil, windsurf, станции, команда и вода главного направления.",
    image: img("home-direction-dahab.webp"),
    galleryCountry: "dahab"
  },
  {
    path: "/media/dahab/2026-06-10-wingfoil-day/",
    kind: "story",
    eyebrow: "10 июня 2026",
    title: "Wingfoil day в Дахабе",
    description: "Живой день на воде: крылья, фойлы, первые полеты и спокойный прогресс.",
    image: img("home-slider-6.webp"),
    galleryCountry: "dahab"
  },
  {
    path: "/media/russia/",
    kind: "gallery",
    eyebrow: "Медиа",
    title: "Должанская в кадре",
    description: "Летний сезон, станционная жизнь, windsurf, wingfoil и kite на косе.",
    image: img("home-direction-russia.webp"),
    galleryCountry: "russia"
  },
  {
    path: "/media/vietnam/",
    kind: "gallery",
    eyebrow: "Медиа",
    title: "Муйне в кадре",
    description: "Ветер, волна, тренировки и поездка во Вьетнам с Vetratoria.",
    image: img("home-direction-vietnam.webp"),
    galleryCountry: "vietnam"
  }
];

for (const country of site.countries) {
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
    title: `Команда ${country.title}`,
    description: "Инструкторы, администраторы, менеджеры и поддержка на воде.",
    image: img("ABOUTVETRATORIA.jpg")
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
        ? "Цены Wingfoil в Дахабе"
        : isDahabWindsurfPrice
          ? "Цены Windsurf в Дахабе"
          : `${sport.title}: цены ${country.title}`,
      description: isDahabWingfoilPrice
        ? "Аренда комплектов, уроки, отдельные части оборудования и пакеты Wingfoil в Дахабе."
        : isDahabWindsurfPrice
          ? "Полный прайс Windsurf в Дахабе: обучение, индивидуальные занятия, прокат, скидки, гидрофойл и хранение."
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
    path: "/dahab/contacts/",
    kind: "contacts",
    country: "dahab",
    eyebrow: "Дахаб · контакты",
    title: "Связаться с Дахабом",
    description: "Напишите команде, уточните даты, ветер, уровень и формат обучения.",
    image: img("home-direction-dahab.webp")
  },
  {
    path: "/dahab/how-to-get/",
    kind: "route",
    country: "dahab",
    eyebrow: "Дахаб · дорога",
    title: "Как добраться до Дахаба",
    description: "Маршрут до станции, прилет, трансфер и что важно знать перед поездкой.",
    image: img("home-direction-dahab.webp")
  },
  {
    path: "/dahab/safety/",
    kind: "safety",
    country: "dahab",
    eyebrow: "Дахаб · безопасность",
    title: "Безопасность в Дахабе — rescue, связь и инструктаж",
    description: "4 спасательных катера, контроль на воде, связь на волнах, инструктаж и объяснение акватории перед каждым выходом.",
    image: "/assets/img/final/dahab/safety-boat.webp"
  },
  {
    path: "/dahab/stations/",
    kind: "stations",
    country: "dahab",
    eyebrow: "Дахаб · станции",
    title: "Станции Vetratoria в Дахабе",
    description: "Vetratoria Ganet Sinai, Wing Center и Swiss Inn: где кататься на wingfoil и windsurf в Дахабе.",
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
