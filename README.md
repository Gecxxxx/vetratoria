# Vetratoria Static Site

Чистая статическая верстка сайта Vetratoria без внешних зависимостей.

## Команды

```bash
npm.cmd run build
npm.cmd run dev
```

Локально сайт открывается на `http://127.0.0.1:4175/`.

## Структура

- `src/pages.mjs` - данные страниц и навигации.
- `scripts/build.mjs` - статический генератор HTML.
- `assets/css/main.css` - точка входа модульной CSS-системы.
- `assets/js/app.js` - меню, слайдеры и единая логика контактных форм.

## Заявки

Все конверсионные CTA используют общий нативный `dialog`. Без JavaScript ссылка
ведет на страницу контактов соответствующей страны.

Пока `site.contactEndpoint` в `src/pages.mjs` пустой, форма готовит письмо через
`mailto:`. Для CRM или Telegram-бота укажите HTTPS endpoint: сайт отправит туда
JSON с полями `name`, `contact`, `country`, `sport`, `intent`, `direction`,
`message`, `source` и `pageUrl`.

Перед отправкой также возникает событие `vetratoria:contact-submit` с тем же
payload в `event.detail`. Его можно использовать для аналитики.
