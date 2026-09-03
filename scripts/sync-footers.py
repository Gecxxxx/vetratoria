#!/usr/bin/env python3
"""Keep the public footer markup consistent across every static HTML page."""

from __future__ import annotations

import html
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FOOTER_RE = re.compile(r'<footer class="site-footer[^>]*>.*?</footer>', re.DOTALL)

COUNTRIES = {
    "dahab": {
        "name": "Египет · Дахаб",
        "href": "/dahab/",
        "contacts_href": "/dahab/contacts/",
        "phones": (("+20 102 932 1772", "+201029321772"), ("+20 115 101 5941", "+201151015941")),
        "email": "dahab@vetratoria.ru",
        "sports": (
            ("Вингфойл Дахаб", "/dahab/wingfoil/", "wingfoil"),
            ("Виндсёрфинг Дахаб", "/dahab/windsurf/", "windsurf"),
            ("Детский виндсёрфинг", "https://windsurfkids.su/", "kids"),
        ),
    },
    "vietnam": {
        "name": "Вьетнам · Муйне",
        "href": "/vietnam/",
        "contacts_href": "/vietnam/contacts/",
        "phones": (("+7 988 471 5355", "+79884715355"),),
        "email": "vietnam@vetratoria.ru",
        "sports": (
            ("Кайтсёрфинг Муйне", "/vietnam/kite/", "kite"),
            ("Виндсёрфинг Муйне", "/vietnam/windsurf/", "windsurf"),
            ("Вингфойл Муйне", "/vietnam/wingfoil/", "wingfoil"),
        ),
    },
    "russia": {
        "name": "Россия · Должанская",
        "href": "/russia/",
        "contacts_href": "/russia/contacts/",
        "phones": (("+7 988 471 5355", "+79884715355"),),
        "email": "russia@vetratoria.ru",
        "sports": (
            ("Кайтсёрфинг Должанская", "/russia/kite/", "kite"),
            ("Виндсёрфинг Должанская", "/russia/windsurf/", "windsurf"),
            ("Вингфойл Должанская", "/russia/wingfoil/", "wingfoil"),
        ),
    },
}


def page_context(path: Path) -> tuple[str | None, str | None]:
    relative = path.relative_to(ROOT).as_posix()
    country = next((key for key in COUNTRIES if relative.startswith(f"{key}/")), None)
    if country is None and relative.startswith("media/"):
        country = next((key for key in COUNTRIES if relative.startswith(f"media/{key}/")), None)

    sport = None
    for key in ("wingfoil", "windsurf", "kite"):
        if key in relative:
            sport = key
            break
    if "windsurf-kids" in relative:
        sport = "kids"
    return country, sport


def anchor(label: str, href: str, active: bool = False) -> str:
    current = ' class="is-current" aria-current="page"' if active else ""
    external = ' target="_blank" rel="noopener noreferrer"' if href.startswith("http") else ""
    return f'<a href="{html.escape(href)}"{current}{external}>{html.escape(label)}</a>'


def country_links(current_country: str | None) -> str:
    return "\n          ".join(
        anchor(data["name"], data["href"], key == current_country)
        for key, data in COUNTRIES.items()
    )


def global_sports() -> str:
    return "\n          ".join(
        (
            anchor("Вингфойл", "/dahab/wingfoil/"),
            anchor("Виндсёрфинг", "/dahab/windsurf/"),
            anchor("Кайтсёрфинг", "/vietnam/kite/"),
            anchor("Детский виндсёрфинг", "https://windsurfkids.su/"),
        )
    )


def sport_links(country: str | None, current_sport: str | None) -> str:
    if country is None:
        return global_sports()
    return "\n          ".join(
        anchor(label, href, sport == current_sport)
        for label, href, sport in COUNTRIES[country]["sports"]
    )


def contact_links(country: str | None) -> str:
    if country is None:
        return "\n          ".join(
            anchor(data["name"], data["contacts_href"])
            for data in COUNTRIES.values()
        )

    data = COUNTRIES[country]
    links = [anchor(label, f"tel:{number}") for label, number in data["phones"]]
    links.append(anchor(data["email"], f"mailto:{data['email']}"))
    return "\n          ".join(links)


def footer_markup(country: str | None, sport: str | None) -> str:
    return f'''<footer class="site-footer site-footer--clean" data-site-footer>
  <div class="footer-inner">
    <div class="footer-brand">
      <a href="/" aria-label="Ветратория — главная">
        <img src="/assets/img/vetratoria-logo.png" alt="Ветратория" width="198" height="97">
      </a>
      <p>Школы ветра<br>с 2006 года</p>
    </div>
    <nav class="footer-nav" aria-label="Навигация в подвале">
      <div class="footer-column">
        <h2>Страны</h2>
        <div class="footer-links">
          {country_links(country)}
        </div>
      </div>
      <div class="footer-column">
        <h2>Спорт</h2>
        <div class="footer-links">
          {sport_links(country, sport)}
        </div>
      </div>
      <div class="footer-column footer-column--contact">
        <h2>Связь</h2>
        <div class="footer-links">
          {contact_links(country)}
        </div>
      </div>
    </nav>
  </div>
  <div class="footer-bottom">
    <span>© 2026 Ветратория</span>
    <span>Условия, расписание, цены и доступность форматов уточняются перед поездкой.</span>
  </div>
</footer>'''


def main() -> None:
    changed = 0
    for path in sorted(ROOT.rglob("*.html")):
        source = path.read_text(encoding="utf-8")
        if not FOOTER_RE.search(source):
            continue
        country, sport = page_context(path)
        updated, replacements = FOOTER_RE.subn(footer_markup(country, sport), source, count=1)
        if replacements != 1:
            raise RuntimeError(f"Expected one site footer in {path}")
        if updated != source:
            path.write_text(updated, encoding="utf-8")
            changed += 1
    print(f"Synchronized {changed} footer(s)")


if __name__ == "__main__":
    main()
