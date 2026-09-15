<!doctype html>
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
  <title>Водный старт, некоторые особенности</title>
  <meta name="description" content="Водный старт: ключевые моменты техники, которые помогают увереннее поднимать парус и выходить на доску.">

  <link rel="canonical" href="https://vetratoria.ru/blog/vodnyy-start-nekotorye-osobennosti.php">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Ветратория">
  <meta property="og:locale" content="ru_RU">
  <meta property="og:url" content="https://vetratoria.ru/blog/vodnyy-start-nekotorye-osobennosti.php">
  <meta property="og:title" content="Водный старт, некоторые особенности">
  <meta property="og:description" content="Водный старт: ключевые моменты техники, которые помогают увереннее поднимать парус и выходить на доску.">
  <meta property="og:image" content="https://vetratoria.ru/assets/img/blog/legacy/vodnyy-start-nekotorye-osobennosti-00.jpg">
  <meta property="og:image:alt" content="Водный старт, некоторые особенности">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Водный старт, некоторые особенности">
  <meta name="twitter:description" content="Водный старт: ключевые моменты техники, которые помогают увереннее поднимать парус и выходить на доску.">
  <meta name="twitter:image" content="https://vetratoria.ru/assets/img/blog/legacy/vodnyy-start-nekotorye-osobennosti-00.jpg">
  <meta name="theme-color" content="#0d0c0b">
  <link rel="icon" href="/assets/img/vetratoria-logo.png">
  <link rel="preload" href="/assets/fonts/inter-cyrillic-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/css/main.css?v=20260915-contact-vietnam">
  <script defer src="/assets/js/app.js?v=20260915-contact-vietnam"></script>
  <script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":"https://vetratoria.ru/#organization","name":"Ветратория","url":"https://vetratoria.ru/","logo":{"@type":"ImageObject","url":"https://vetratoria.ru/assets/img/vetratoria-logo.png"},"sameAs":["https://vk.ru/club2195523","https://www.instagram.com/vetratoriaofficiale/","https://www.tripadvisor.ru/Attraction_Review-g297547-d9806047-Reviews-Vetratoria_Windsurfing_SUP_Centre-Dahab_South_Sinai_Red_Sea_and_Sinai.html"]},{"@type":"BreadcrumbList","@id":"https://vetratoria.ru/blog/vodnyy-start-nekotorye-osobennosti.php#breadcrumbs","itemListElement":[{"@type":"ListItem","position":1,"name":"Ветратория","item":"https://vetratoria.ru/"},{"@type":"ListItem","position":2,"name":"Материалы со всех стран","item":"https://vetratoria.ru/blog/"},{"@type":"ListItem","position":3,"name":"Водный старт, некоторые особенности","item":"https://vetratoria.ru/blog/vodnyy-start-nekotorye-osobennosti.php"}]}]}</script>
</head>
<body class="modern-site article country-dahab">
  <a class="skip-link" href="#main">К содержанию</a>

<header class="site-header vtr-nav vtr-nav--country vtr-nav--dahab" data-nav>

  <div class="vtr-nav__top">
    <div class="vtr-nav__contacts">
      <a href="mailto:dahab@vetratoria.ru">dahab@vetratoria.ru</a>

          <a class="vtr-nav__station-phone" href="tel:+201029321772">
            <span>Номер Виндсёрфинг-станции</span>
            <b>+20 102 932 1772</b>
          </a>
          <a class="vtr-nav__station-phone" href="tel:+201151015941">
            <span>Номер Вингфойл-станции</span>
            <b>+20 115 101 5941</b>
          </a>
    </div>
    <nav class="vtr-nav__countries" aria-label="Выбор страны">
      <a class="vtr-nav__country is-active" href="/dahab/">Египет</a><a class="vtr-nav__country" href="/vietnam/">Вьетнам</a><a class="vtr-nav__country" href="/russia/">Россия</a>
    </nav>
    <div class="vtr-nav__right">

  <nav class="social-icon-links vtr-nav__socials" aria-label="Социальные сети Ветратории">

      <a href="https://vk.ru/club2195523" target="_blank" rel="noopener noreferrer" aria-label="VKontakte" title="VKontakte">
        <img src="/assets/icons/vk.svg" alt="" width="20" height="20">
      </a>
      <a href="https://www.instagram.com/vetratoriaofficiale/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram">
        <img src="/assets/icons/instagram.svg" alt="" width="20" height="20">
      </a>
      <a href="https://www.tripadvisor.ru/Attraction_Review-g297547-d9806047-Reviews-Vetratoria_Windsurfing_SUP_Centre-Dahab_South_Sinai_Red_Sea_and_Sinai.html" target="_blank" rel="noopener noreferrer" aria-label="Tripadvisor" title="Tripadvisor">
        <img src="/assets/icons/tripadvisor.svg" alt="" width="20" height="20">
      </a>
  </nav>
      <span class="vtr-nav__lang-current" aria-label="Язык сайта: русский">RU</span>
    </div>
  </div>
  <div class="vtr-nav__main">
    <a class="vtr-nav__logo" href="/" aria-label="Ветратория — главная">
      <img src="/assets/img/vetratoria-logo.png" alt="Ветратория" width="198" height="97">
    </a>
    <button class="vtr-nav__burger" type="button" aria-label="Открыть меню" aria-controls="site-navigation" aria-expanded="false" data-menu-toggle>
      <span></span><span></span><span></span>
    </button>

    <nav class="vtr-nav__panel" id="site-navigation" aria-label="Основная навигация" data-nav-panel aria-hidden="false">
      <a class="vtr-nav__link" href="/">Ветратория</a>

      <div class="vtr-nav__item vtr-nav__item--drop vtr-nav__item--directions" data-dropdown>
        <button class="vtr-nav__link" type="button" aria-expanded="false" data-dropdown-toggle>Направления <span class="vtr-nav__chevron" aria-hidden="true">⌄</span></button>
        <div class="vtr-nav__dropdown vtr-nav__dropdown--directions">

          <div class="vtr-nav__direction">
            <a class="vtr-nav__direction-link" href="/dahab/"><b>Египет · Дахаб</b><span>Вингфойл, Виндсёрфинг</span></a>
          </div>
          <div class="vtr-nav__direction">
            <a class="vtr-nav__direction-link" href="/vietnam/"><b>Вьетнам · Муйне</b><span>Виндсёрфинг, Вингфойл, Кайтсёрфинг, Сёрфинг</span></a>
          </div>
          <div class="vtr-nav__direction">
            <a class="vtr-nav__direction-link" href="/russia/"><b>Россия · Должанская</b><span>Виндсёрфинг, Вингфойл, Кайтсёрфинг</span></a>
          </div>
        </div>
      </div>
      <a class="vtr-nav__link" href="/blog/">Блог</a>
      <a class="vtr-nav__link" href="/media/">Медиа</a>
      <a class="vtr-nav__link" href="/dahab/contacts/">Контакты</a>

      <div class="vtr-mobile-menu" aria-label="Мобильная навигация">

      <section class="vtr-mobile-menu__block vtr-mobile-menu__block--accent" aria-label="Навигация Дахаб">
        <p class="vtr-mobile-menu__title">Дахаб</p>
        <a class="vtr-mobile-menu__row" href="/dahab/">Обзор</a>
        <a class="vtr-mobile-menu__row" href="/dahab/wingfoil/">Вингфойл</a><a class="vtr-mobile-menu__row" href="/dahab/windsurf/">Виндсёрфинг</a>

        <div class="vtr-mobile-menu__item vtr-mobile-menu__item--drop" data-dropdown>
          <button class="vtr-mobile-menu__row" type="button" aria-expanded="false" data-dropdown-toggle>Цены <span class="vtr-nav__chevron" aria-hidden="true">⌄</span></button>
          <div class="vtr-mobile-menu__submenu">
            <a class="vtr-mobile-menu__row" href="/dahab/wingfoil/price/">Вингфойл</a><a class="vtr-mobile-menu__row" href="/dahab/windsurf/price/">Виндсёрфинг</a>
          </div>
        </div>
        <a class="vtr-mobile-menu__row" href="/dahab/stations/">Станции</a>

        <div class="vtr-mobile-menu__item vtr-mobile-menu__item--drop" data-dropdown>
          <button class="vtr-mobile-menu__row" type="button" aria-expanded="false" data-dropdown-toggle>О школе <span class="vtr-nav__chevron" aria-hidden="true">⌄</span></button>
          <div class="vtr-mobile-menu__submenu">
            <a class="vtr-mobile-menu__row" href="/dahab/team/">Команда</a><a class="vtr-mobile-menu__row" href="/dahab/safety/">Безопасность</a><a class="vtr-mobile-menu__row" href="/dahab/how-to-get/">Как добраться</a><a class="vtr-mobile-menu__row" href="/media/dahab/">Медиа</a><a class="vtr-mobile-menu__row" href="/dahab/contacts/">Контакты</a>
          </div>
        </div>
      </section>
        <section class="vtr-mobile-menu__block" aria-label="Главное">
          <p class="vtr-mobile-menu__title">Главное</p>
          <a class="vtr-mobile-menu__row" href="/">Ветратория</a>
          <a class="vtr-mobile-menu__row" href="/blog/">Блог</a>
          <a class="vtr-mobile-menu__row" href="/media/">Медиа</a>
          <a class="vtr-mobile-menu__row" href="/dahab/contacts/">Контакты</a>
        </section>
        <section class="vtr-mobile-menu__block" aria-label="Контакты">
          <p class="vtr-mobile-menu__title">Контакты</p>
          <a class="vtr-mobile-menu__row" href="mailto:dahab@vetratoria.ru">dahab@vetratoria.ru</a>

          <a class="vtr-mobile-menu__row vtr-mobile-menu__contact-phone" href="tel:+201029321772">
            <span>Номер Виндсёрфинг-станции</span>
            <b>+20 102 932 1772</b>
          </a>
          <a class="vtr-mobile-menu__row vtr-mobile-menu__contact-phone" href="tel:+201151015941">
            <span>Номер Вингфойл-станции</span>
            <b>+20 115 101 5941</b>
          </a>
          <a class="vtr-mobile-menu__row" href="https://t.me/dahabvetratoria" target="_blank" rel="noopener noreferrer">Telegram</a>

  <nav class="social-icon-links vtr-mobile-menu__socials" aria-label="Социальные сети Ветратории">

      <a href="https://vk.ru/club2195523" target="_blank" rel="noopener noreferrer" aria-label="VKontakte" title="VKontakte">
        <img src="/assets/icons/vk.svg" alt="" width="20" height="20">
      </a>
      <a href="https://www.instagram.com/vetratoriaofficiale/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram">
        <img src="/assets/icons/instagram.svg" alt="" width="20" height="20">
      </a>
      <a href="https://www.tripadvisor.ru/Attraction_Review-g297547-d9806047-Reviews-Vetratoria_Windsurfing_SUP_Centre-Dahab_South_Sinai_Red_Sea_and_Sinai.html" target="_blank" rel="noopener noreferrer" aria-label="Tripadvisor" title="Tripadvisor">
        <img src="/assets/icons/tripadvisor.svg" alt="" width="20" height="20">
      </a>
  </nav>
        </section>
      </div>
    </nav>
  </div>

  <nav class="vtr-nav__section" aria-label="Навигация Дахаб">
    <a class="vtr-nav__section-link" href="/dahab/">Обзор</a><a class="vtr-nav__section-link" href="/dahab/wingfoil/">Вингфойл</a><a class="vtr-nav__section-link" href="/dahab/windsurf/">Виндсёрфинг</a>
    <div class="vtr-nav__section-item vtr-nav__section-item--drop" data-dropdown>
      <button class="vtr-nav__section-link" type="button" aria-expanded="false" data-dropdown-toggle>Цены <span class="vtr-nav__chevron" aria-hidden="true">⌄</span></button>
      <div class="vtr-nav__section-dropdown">
        <a href="/dahab/wingfoil/price/">Вингфойл</a><a href="/dahab/windsurf/price/">Виндсёрфинг</a>
      </div>
    </div><a class="vtr-nav__section-link" href="/dahab/stations/">Станции</a>

    <div class="vtr-nav__section-item vtr-nav__section-item--drop" data-dropdown>
      <button class="vtr-nav__section-link" type="button" aria-expanded="false" data-dropdown-toggle>О школе <span class="vtr-nav__chevron" aria-hidden="true">⌄</span></button>
      <div class="vtr-nav__section-dropdown">
        <a href="/dahab/team/">Команда</a><a href="/dahab/safety/">Безопасность</a><a href="/dahab/how-to-get/">Как добраться</a><a href="/media/dahab/">Медиа</a><a href="/dahab/contacts/">Контакты</a>
      </div>
    </div>
  </nav>
</header>
  <main id="main">
<section class="hero page-hero">
  <div class="hero-bg">
    <img src="/assets/img/blog/legacy/vodnyy-start-nekotorye-osobennosti-00.jpg" alt="" loading="eager" fetchpriority="high" decoding="async">
  </div>
  <div class="hero-shade"></div>
  <div class="hero-content">
    <p class="eyebrow">Дахаб · Виндсёрфинг</p>
    <h1>Водный старт, некоторые особенности</h1>
    <p class="hero-lead">Водный старт: ключевые моменты техники, которые помогают увереннее поднимать парус и выходить на доску.</p>
    <div class="hero-actions"><a class="button button-primary" href="#article-text">Читать статью</a><a class="button button-ghost" href="/dahab/blog/">Блог Дахаба</a></div>
  </div>
</section>
  <article class="legacy-article" id="article-text">
    <header class="legacy-article__meta">
      <a href="/blog/">Блог</a><span aria-hidden="true">/</span><a href="/dahab/blog/">Дахаб</a><span aria-hidden="true">/</span><span>Виндсёрфинг</span>
      <span class="legacy-article__author">По ключикам для водного старта провёл вас я, Серёга (a.k.a. PaparazzO)</span>
      <time datetime="2026-04-22">22.04.2026</time>
    </header>
    <div class="legacy-article__content">
      <section class="legacy-article__block legacy-article__block--lead">
        <div class="legacy-article__text"><p>Очередной отличный день в Дахабе. С утра пораньше гости Ветратории спешат кататься. Бодрящий свежий ветер уже дует и гипнотически манит на воду. Адепты, познавшие эйфорию скорости, смело выкатывают в Спиди-зону, где глубина и пространство позволяют гонять по полной. Но локация требует навыков, помимо умения выводить доску на глиссер. Умение развернуться и, в случае падения, как-то стартовать — среди них. Сегодня коснусь темы старта, водного старта, ибо на глубине нет опоры на грунт, и на доске когда дует и колбасит «за верёвочку» особо не подёргаешь. Можно сказать, что водный старт — один из базовых элементов в виндсёрфинге — это не только полезный навык, но и первоочередной для вашей безопасности на воде. Конкретно, речь пойдёт не о нём самом, а о паре его ключевых моментов, которые могут игнорироваться большинством, даже теми, кто этот навык кое-как освоил, но (моё любимое выражение) не постиг полностью его Дзен!</p></div>

      <div class="legacy-article__gallery legacy-article__gallery--1">
        <figure><img src="/assets/img/blog/legacy/vodnyy-start-nekotorye-osobennosti-01.jpg" alt="Водный старт, некоторые особенности — фотография 1.1" loading="lazy" decoding="async"></figure>
      </div>
      </section><section class="legacy-article__block">
        <div class="legacy-article__text"><p>Что ж, поехали. Водный старт — производная бич старта. Это когда райдер, стоя в воде на отмели, лихо манипулируя парусом, заскакивает на доску без использования стартшкотика. Сам ветер помогает ему в этом. Р-р-раз и полетел! Магия? Нисколечко… Мастерство и умение! Дальше человек задумывается: «Нельзя ли такой же трюк провернуть с глубины?» Ответ — да, можно, но требуется как-то поднять прилипший к воде парус. Всей техники тут представлено не будет. Как говорится, многАбукв.  А вот один ключевой секретик я раскрою. Он полезен всем, кто не умеет или умеет, но испытывает проблемы на этапе отклеивания паруса от воды. Не пробуйте это делать за гик, т. е. в центре паруса. Для этих целей используйте топ паруса (верхний кончик). Самая лёгкая его часть — верхушка. Стоит отлепить верхушку, как между ней и основанием, прикреплённым к шарниру на доске образуется мостик, под который сразу начинает поддувать ветер, помогая уже всему полотну отлипнуть от воды.</p></div>

      <div class="legacy-article__gallery legacy-article__gallery--3">
        <figure><img src="/assets/img/blog/legacy/vodnyy-start-nekotorye-osobennosti-02.jpg" alt="Водный старт, некоторые особенности — фотография 2.1" loading="lazy" decoding="async"></figure><figure><img src="/assets/img/blog/legacy/vodnyy-start-nekotorye-osobennosti-03.jpg" alt="Водный старт, некоторые особенности — фотография 2.2" loading="lazy" decoding="async"></figure><figure><img src="/assets/img/blog/legacy/vodnyy-start-nekotorye-osobennosti-04.jpg" alt="Водный старт, некоторые особенности — фотография 2.3" loading="lazy" decoding="async"></figure>
      </div>
      </section><section class="legacy-article__block">


      <div class="legacy-article__gallery legacy-article__gallery--3">
        <figure><img src="/assets/img/blog/legacy/vodnyy-start-nekotorye-osobennosti-05.jpg" alt="Водный старт, некоторые особенности — фотография 3.1" loading="lazy" decoding="async"></figure><figure><img src="/assets/img/blog/legacy/vodnyy-start-nekotorye-osobennosti-06.jpg" alt="Водный старт, некоторые особенности — фотография 3.2" loading="lazy" decoding="async"></figure><figure><img src="/assets/img/blog/legacy/vodnyy-start-nekotorye-osobennosti-07.jpg" alt="Водный старт, некоторые особенности — фотография 3.3" loading="lazy" decoding="async"></figure>
      </div>
      </section><section class="legacy-article__block">
        <div class="legacy-article__text"><p>Второй полезный совет касается момента, когда парус уже поднялся, вы перехватились за гик и повисли на ветровой тяге. Если новичку не совсем понятно о чём я — гляньте на фото. Боюсь, мало кто в этой позиции понимает всю механику процесса. Но в целом, ваша задача на данном этапе (внимание!!!) не упираться ногами в борт, а зацепить пяткой задней ноги палубу в точке на оси доски и на СЕРЕДИНКЕ МЕЖДУ ШАРНИРОМ И КОРМОЙ. Запомните: именно положить ногу, а не упереться. И только одну заднюю. Её задача в момент старта (когда вы начинаете добавлять тяги) подтягивать вашу тушку ближе к борту, а не отжимать. Особенно полезно для тех, у кого при старте доска вечно крутится носом на ветер и парус, теряя тягу, топит вас. Ну и, в общем, я лично никогда не учу выполнять водный старт с упором двумя ногами, считаю это дурным тоном и полным непрофессионализмом. Так некоторые инструктора-халтурщики облегчают себе задачу, станции берегут матчасть, но никак не помогают ученикам качественно выполнять водный старт быстро и на любом ветру. Запомните: выполнение с одной ногой — высший пилотаж. Однако, данный способ требует знания ключевых тонких моментов и идеально натренированного чувства баланса.</p></div>

      <div class="legacy-article__gallery legacy-article__gallery--3">
        <figure><img src="/assets/img/blog/legacy/vodnyy-start-nekotorye-osobennosti-08.jpg" alt="Водный старт, некоторые особенности — фотография 4.1" loading="lazy" decoding="async"></figure><figure><img src="/assets/img/blog/legacy/vodnyy-start-nekotorye-osobennosti-09.jpg" alt="Водный старт, некоторые особенности — фотография 4.2" loading="lazy" decoding="async"></figure><figure><img src="/assets/img/blog/legacy/vodnyy-start-nekotorye-osobennosti-10.jpg" alt="Водный старт, некоторые особенности — фотография 4.3" loading="lazy" decoding="async"></figure>
      </div>
      </section><section class="legacy-article__block">
        <div class="legacy-article__text"><p>Итак, две подсказки для водного старта на сегодня: отрывать парус от воды лучше начинать с топа (крайней верхней части), и не упираться ногами в борт, подтягивать задней, положив её на палубу. Надеюсь, те кто сейчас читает это, будучи уже в Дахабе, на Ветратории, тут же смогут проверить, а те, кто лишь собираются к нам — запомнят и попробуют при первом удобном случае. О других тонкостях водного старта поговорим как-нибудь ещё, хотя самые нетерпеливые могут задать вопросы лично и даже попробовать взять урок. Главное — это наличие огромного желания, и непременное стремление совершенствовать свой навык, дабы кататься долго и счастливо.</p></div>

      <div class="legacy-article__gallery legacy-article__gallery--3">
        <figure><img src="/assets/img/blog/legacy/vodnyy-start-nekotorye-osobennosti-11.jpg" alt="Водный старт, некоторые особенности — фотография 5.1" loading="lazy" decoding="async"></figure><figure><img src="/assets/img/blog/legacy/vodnyy-start-nekotorye-osobennosti-12.jpg" alt="Водный старт, некоторые особенности — фотография 5.2" loading="lazy" decoding="async"></figure><figure><img src="/assets/img/blog/legacy/vodnyy-start-nekotorye-osobennosti-13.jpg" alt="Водный старт, некоторые особенности — фотография 5.3" loading="lazy" decoding="async"></figure>
      </div>
      </section><section class="legacy-article__block">
        <div class="legacy-article__text"><p>По ключикам для водного старта провёл вас я, Серёга (a.k.a. PaparazzO)   22.04.2026</p></div>

      </section>
    </div>
    <footer class="legacy-article__footer">
      <a href="/dahab/blog/">← Блог Дахаба</a>
      <a class="button button-primary" href="/dahab/contacts/" data-contact-modal data-contact-intent="Задать вопрос" data-contact-country="dahab" data-contact-country-label="Египет · Дахаб" data-contact-sport="Виндсёрфинг" data-contact-email="dahab@vetratoria.ru" data-contact-phone="+201029321772" data-contact-telegram="https://t.me/dahabvetratoria">Задать вопрос</a>
    </footer>
  </article></main>

<footer class="site-footer site-footer--clean" data-site-footer>
  <div class="footer-inner">
    <div class="footer-brand">
      <a href="/" aria-label="Ветратория — главная"><img src="/assets/img/vetratoria-logo.png" alt="Ветратория" width="198" height="97"></a>
      <p>Школы ветра<br>с 2006 года</p>
    </div>
    <nav class="footer-nav" aria-label="Навигация в подвале">
      <div class="footer-column">
        <h2>Страны</h2>
        <div class="footer-links"><a href="/dahab/" class="is-current" aria-current="page">Египет · Дахаб</a>
          <a href="/vietnam/">Вьетнам · Муйне</a>
          <a href="/russia/">Россия · Должанская</a></div>
      </div>
      <div class="footer-column">
        <h2>Спорт</h2>
        <div class="footer-links"><a href="/dahab/wingfoil/">Вингфойл Дахаб</a>
          <a href="/dahab/windsurf/" class="is-current" aria-current="page">Виндсёрфинг Дахаб</a>
          <a href="https://windsurfkids.su/" target="_blank" rel="noopener noreferrer">Детский виндсёрфинг</a></div>
      </div>
      <div class="footer-column footer-column--contact">
        <h2>Связь</h2>
        <div class="footer-links"><a class="footer-contact" href="tel:+201029321772"><span>Номер Виндсёрфинг-станции</span><strong>+20 102 932 1772</strong></a>
          <a class="footer-contact" href="tel:+201151015941"><span>Номер Вингфойл-станции</span><strong>+20 115 101 5941</strong></a>
          <a class="footer-contact" href="mailto:dahab@vetratoria.ru"><span>Почта</span><strong>dahab@vetratoria.ru</strong></a></div>
      </div>
    </nav>
  </div>
  <div class="footer-bottom">
    <span>© 2026 Ветратория</span>
    <span>Условия, расписание, цены и доступность форматов уточняются перед поездкой.</span>
  </div>
</footer>

<dialog class="contact-modal" data-contact-dialog aria-labelledby="contact-modal-title">
  <div class="contact-modal__surface">
    <button class="contact-modal__close" type="button" data-contact-close aria-label="Закрыть форму">×</button>
    <div class="contact-modal__head">
      <p class="eyebrow">Быстрая заявка</p>
      <h2 id="contact-modal-title" data-contact-modal-title>Написать нам</h2>
      <p>Оставьте контакты — команда уточнит детали и поможет подобрать формат.</p>
      <span class="contact-modal__context" data-contact-modal-context>Египет · Дахаб · Виндсёрфинг</span>
    </div>
    <form class="contact-form contact-modal__form" data-contact-form data-contact-modal-form
      data-endpoint="/api/contact"
      data-mail-to="dahab@vetratoria.ru"
      data-direction="Египет · Дахаб · Виндсёрфинг">
      <input type="hidden" name="source" value="/blog/vodnyy-start-nekotorye-osobennosti.php">
      <input type="hidden" name="intent" value="" data-contact-intent-input>
      <input type="hidden" name="sport" value="Виндсёрфинг" data-contact-sport-input>
      <input type="hidden" name="country" value="dahab" data-contact-country-input>
      <label hidden aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>
      <label>Имя<input name="name" maxlength="100" autocomplete="name" placeholder="Ваше имя" required></label>
      <label>Способ связи<input name="contact" maxlength="200" autocomplete="tel" placeholder="Телефон, электронная почта или @имя_пользователя" required></label>
      <label><span>Комментарий <small>по желанию</small></span><textarea name="message" maxlength="1200" rows="4" placeholder="Даты, уровень, спорт или ваш вопрос"></textarea></label>
      <button class="button button-primary contact-modal__submit" type="submit">Отправить заявку</button>
      <p class="form-note" data-form-note role="status" aria-live="polite"></p>
    </form>
    <div class="contact-modal__direct">
      <span>Или свяжитесь напрямую</span>
      <div>
        <a href="https://wa.me/201029321772" data-contact-direct-phone target="_blank" rel="noopener noreferrer">
          <img src="/assets/icons/whatsapp.svg" alt="" width="20" height="20">
          <span data-contact-direct-phone-label>WhatsApp</span>
        </a>
        <a href="mailto:dahab@vetratoria.ru" data-contact-direct-email>Почта</a>
        <a href="https://t.me/dahabvetratoria" data-contact-direct-telegram target="_blank" rel="noopener noreferrer">
          <img src="/assets/icons/telegram.svg" alt="" width="20" height="20">
          <span>Telegram</span>
        </a>
      </div>
    </div>
  </div>
</dialog>
</body>
</html>
