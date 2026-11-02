// Real photographs imported from vietnam.vetratoria.ru; sources: docs/vietnam-photo-sources.md.
export const vietnamPhotos = {
  "surf-coaching": {
    "src": "/assets/img/vietnam-source/surf-coaching.webp",
    "label": "Урок на волне",
    "alt": "Инструктор помогает ученице поймать волну на сёрфе",
    "width": 800,
    "height": 533
  },
  "surf-board": {
    "src": "/assets/img/vietnam-source/surf-board.webp",
    "label": "Перед выходом",
    "alt": "Участница занятия с зелёной доской для сёрфинга",
    "width": 1600,
    "height": 1066
  },
  "surf-lineup": {
    "src": "/assets/img/vietnam-source/surf-lineup.webp",
    "label": "На воде",
    "alt": "Сёрферы сидят на досках в ожидании волн",
    "width": 1600,
    "height": 1066
  },
  "surf-wave": {
    "src": "/assets/img/vietnam-source/surf-wave.webp",
    "label": "На волне",
    "alt": "Сёрфер на доске проходит волну",
    "width": 1600,
    "height": 1066
  },
  "surf-group": {
    "src": "/assets/img/vietnam-source/surf-group.webp",
    "label": "Вместе на воде",
    "alt": "Группа сёрферов на досках у волны",
    "width": 1600,
    "height": 1066
  },
  "surf-practice": {
    "src": "/assets/img/vietnam-source/surf-practice.webp",
    "label": "Практика",
    "alt": "Участники занятия пробуют встать на доску в пене",
    "width": 1600,
    "height": 1066
  },
  "sup-paddle": {
    "src": "/assets/img/vietnam-source/sup-paddle.webp",
    "label": "SUP",
    "alt": "Райдер на доске с веслом у побережья Муйне",
    "width": 800,
    "height": 533
  },
  "station-beach": {
    "src": "/assets/img/vietnam-source/station-beach.webp",
    "label": "Берег станции",
    "alt": "Пальмы и снаряжение на песчаном берегу станции Ветратория",
    "width": 1600,
    "height": 1140
  },
  "station-seafront": {
    "src": "/assets/img/vietnam-source/station-seafront.webp",
    "label": "Станция с моря",
    "alt": "Здание у пляжа и оборудование Ветратории в Муйне",
    "width": 1600,
    "height": 1067
  },
  "station-racks": {
    "src": "/assets/img/vietnam-source/station-racks.webp",
    "label": "На станции",
    "alt": "Доски и паруса на стойках под навесом станции",
    "width": 1600,
    "height": 1162
  },
  "muine-fruit": {
    "src": "/assets/img/vietnam-source/muine-fruit.webp",
    "label": "Муйне",
    "alt": "Прилавок с тропическими фруктами в Муйне",
    "width": 650,
    "height": 460
  },
  "windsurf-launch": {
    "src": "/assets/img/vietnam-source/windsurf-launch.webp",
    "label": "Выход на воду",
    "alt": "Виндсёрфер поднимает парус у берега",
    "width": 800,
    "height": 500
  },
  "windsurf-briefing": {
    "src": "/assets/img/vietnam-source/windsurf-briefing.webp",
    "label": "Перед катанием",
    "alt": "Райдеры со снаряжением на песчаном берегу Муйне",
    "width": 800,
    "height": 500
  },
  "windsurf-shore": {
    "src": "/assets/img/vietnam-source/windsurf-shore.webp",
    "label": "На берегу",
    "alt": "Виндсёрфер с оранжевым парусом у воды",
    "width": 800,
    "height": 500
  },
  "foil-boat-preparation": {
    "src": "/assets/img/vietnam-source/foil-boat-preparation.webp",
    "label": "Подготовка",
    "alt": "Участники занятия с досками рядом с лодкой",
    "width": 1080,
    "height": 720
  },
  "foil-boat-lesson": {
    "src": "/assets/img/vietnam-source/foil-boat-lesson.webp",
    "label": "Фойл за лодкой",
    "alt": "Участница на фойле рядом с лодкой во время занятия",
    "width": 1080,
    "height": 720
  },
  "muine-bay": {
    "src": "/assets/img/vietnam-source/muine-bay.webp",
    "label": "Море и Муйне",
    "alt": "Рыбацкие лодки и райдер с вингом на фоне побережья Муйне",
    "width": 800,
    "height": 500
  }
};

vietnamPhotos["wing-riding"] = { src: "/assets/img/vietnam-source/community.jpg", label: "Вингфойл", alt: "Райдер с оранжевым вингом на фойле в Муйне", width: 2000, height: 1333 };

export const vietnamGalleryPhotos = (keys = Object.keys(vietnamPhotos).filter((key) => key !== "wing-riding")) => keys.map((key) => {
  const photo = vietnamPhotos[key];
  return [photo.src, photo.label, photo.alt, photo.alt, photo.width, photo.height];
});
