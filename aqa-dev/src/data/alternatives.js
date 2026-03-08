export const alternatives = [
  {
    id: "alt-1",
    text: "Cypress: обзор и отличия от Playwright",
    time: "2ч",
    desc: "npm install cypress → npx cypress open.\n\nОтличия: работает ВНУТРИ браузера (Playwright — снаружи). Только JS/TS. Нет Safari. Один таб. Параллелизация через платный Cloud.\n\nPlaywright: быстрее ~30%, мульти-браузер, мульти-таб, бесплатная параллелизация.\nCypress: проще старт, живая перезагрузка, удобен для SPA.\n\nНа собеседовании: 'Почему Playwright?' — будь готова ответить.",
    s: [
      "Playwright vs Cypress подробное сравнение",
      "Cypress tutorial для начинающих",
    ],
  },
  {
    id: "alt-2",
    text: "Selenium: что это и зачем знать",
    time: "1.5ч",
    desc: "OG-фреймворк (2004). Ещё #1 в enterprise (30K+ компаний). Поддерживает Java/Python/C#/JS.\n\nПочему НЕ основной: медленнее 2x, нет auto-waiting, сложная настройка.\nЧто знать: WebDriver Protocol, Selenium Grid, Appium (мобильное).",
    s: [
      "Selenium vs Playwright обзор",
      "Selenium WebDriver что это зачем",
    ],
  },
  {
    id: "alt-3",
    text: "Python: базовый синтаксис",
    time: "2ч",
    desc: "Второй язык в QA. Нужно уметь ЧИТАТЬ код.\nname = 'Anna' (без let/const)\nif age >= 18: (отступы вместо {})\nfor item in list: (как for...of)\ndef greet(name): return f'Hello, {name}'\n\nQA-инструменты: pytest, requests, Selenium, Playwright (Python-версия).",
    s: [
      "Python основы за 2 часа",
      "Python для тестировщика обзор",
    ],
  },
  {
    id: "alt-4",
    text: "Jest/Vitest, Appium, Docker (обзоры)",
    time: "3ч",
    desc: "Jest — unit-тесты JS: test('adds', () => expect(1+2).toBe(3)). Разработчики пишут unit → QA пишет e2e.\n\nAppium — мобильные нативные приложения (iOS/Android). Playwright только мобильный ВЕБ.\n\nDocker — контейнеризация. Одинаковая среда для всех. Playwright даёт готовый Docker-образ. Для Junior: знать концепцию.\n\nNewman — CLI для Postman (CI/CD интеграция). Альтернативы Postman: Insomnia, Bruno, Thunder Client.",
    s: [
      "Jest unit тесты обзор",
      "Docker для тестировщика что это",
      "Appium mobile testing overview",
    ],
  },
];
