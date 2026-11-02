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

Форма отправляет JSON на `/api/contact` и показывает успех только после серверного подтверждения. Настройка Pages Function, Preview secrets и D1: [docs/contact-setup.md](docs/contact-setup.md). Без настройки показаны недоступность прямой отправки и контакты; автоматического mailto нет.

Проверки: `npm run build`, `npm run check`, `node --test scripts/tests/contact.test.mjs` (Node 22.13+ для node:sqlite). Сам генератор по-прежнему требует Node >=20; зависимости не менялись.

Миграция Вьетнама: [docs/vietnam-migration.md](docs/vietnam-migration.md). Спорные сведения: [docs/vietnam-content-verification.md](docs/vietnam-content-verification.md). Работа только в staging, домен пока не переключается.
