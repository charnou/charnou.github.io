export const alternatives = [
  {
    id: "alt-1",
    text: "Cypress: обзор и отличия от Playwright",
    time: "2ч",
    desc: "`npm install cypress` → `npx cypress open`.\n\nОтличия: работает ВНУТРИ браузера (Playwright — снаружи). Только JS/TS. Нет Safari. Один таб. Параллелизация через платный Cloud.\n\n**Playwright**: быстрее ~30%, мульти-браузер, мульти-таб, бесплатная параллелизация.\n**Cypress**: проще старт, живая перезагрузка, удобен для SPA.\n\nНа собеседовании: 'Почему Playwright?' — будь готова ответить.",
    s: [
      "Playwright vs Cypress подробное сравнение",
      "Cypress tutorial для начинающих",
      "когда выбрать Cypress вместо Playwright",
    ],
  },
  {
    id: "alt-2",
    text: "Selenium: что это и зачем знать",
    time: "1.5ч",
    desc: "OG-фреймворк (2004). Ещё #1 в enterprise (30K+ компаний). Поддерживает Java/Python/C#/JS.\n\nПочему НЕ основной: медленнее 2x, нет auto-waiting, сложная настройка.\nЧто знать: **WebDriver Protocol**, **Selenium Grid**, Appium (мобильное).",
    s: [
      "Selenium vs Playwright обзор",
      "Selenium WebDriver что это зачем",
      "Selenium Grid параллельные тесты обзор",
    ],
  },
  {
    id: "alt-3",
    text: "Python: базовый синтаксис",
    time: "2ч",
    desc: "Второй язык в QA. Нужно уметь ЧИТАТЬ код.\n`name = 'Anna'` (без let/const)\n`if age >= 18:` (отступы вместо {})\n`for item in list:` (как for...of)\n`def greet(name): return 'Hello, ' + name`\n\nQA-инструменты: **pytest**, requests, Selenium, Playwright (Python-версия).",
    s: [
      "Python основы за 2 часа",
      "Python для тестировщика обзор",
      "pytest tutorial начинающим",
    ],
  },
  {
    id: "alt-4",
    text: "Jest: unit-тесты JavaScript",
    time: "1.5ч",
    desc: "Стандарт unit-тестирования в JS/React. Meta (Facebook) поддерживает.\n\n`test('adds numbers', () => { expect(1 + 2).toBe(3) })`\n\nРазработчики пишут unit → QA пишет e2e. Но знать unit-тесты полезно: иногда AQA пишет и их.\n\nФичи: snapshots, mocks, coverage из коробки.\nАналог: **Vitest** (быстрее, для Vite-проектов).",
    s: [
      "Jest tutorial unit тесты",
      "Jest vs Vitest сравнение",
      "unit тесты JavaScript для тестировщика",
    ],
  },
  {
    id: "alt-5",
    text: "Vitest: быстрая альтернатива Jest",
    time: "1ч",
    desc: "Нативная интеграция с Vite. Совместим с API Jest (легко мигрировать).\n\n`import { test, expect } from 'vitest'`\n\nПреимущества: HMR для тестов, ESM из коробки, в 2-5x быстрее Jest на больших проектах.\nИспользуй если проект на Vite. Для остальных — Jest.",
    s: [
      "Vitest getting started",
      "Vitest vs Jest benchmark",
      "Vitest для начинающих",
    ],
  },
  {
    id: "alt-6",
    text: "Appium: мобильное тестирование",
    time: "2ч",
    desc: "Автотесты нативных мобильных приложений (iOS/Android).\n\nPlaywright = только мобильный ВЕБ (эмуляция браузера).\nAppium = нативные кнопки, жесты, push-уведомления.\n\nАрхитектура: Appium Server → WebDriver → устройство/эмулятор.\nЯзыки: Java, Python, JS.\n\nДля Junior AQA: знать концепцию. Углубляться — если вакансия требует.",
    s: [
      "Appium mobile testing overview",
      "Appium vs Playwright мобильное тестирование",
      "Appium tutorial начинающим",
    ],
  },
  {
    id: "alt-7",
    text: "Docker: контейнеризация для QA",
    time: "2ч",
    desc: "Одинаковая среда для dev/CI/prod. 'У меня работает' → невозможно.\n\n`docker run -it mcr.microsoft.com/playwright` — готовый образ с браузерами.\n\nОсновы: **Image** (шаблон), **Container** (запущенный экземпляр), **Dockerfile** (рецепт), **docker-compose** (несколько сервисов).\n\nДля Junior: понимать концепцию + уметь запускать контейнеры.",
    s: [
      "Docker для тестировщика что это",
      "Docker tutorial для начинающих",
      "Playwright Docker CI/CD",
    ],
  },
  {
    id: "alt-8",
    text: "Postman и Newman: тестирование API",
    time: "2ч",
    desc: "Postman — GUI для отправки HTTP-запросов и тестирования API.\nNewman — CLI-версия для CI/CD: `newman run collection.json`.\n\nCollections → Environments → Tests (JS assertions).\nПеременные: `{{base_url}}`, `{{token}}`.\n\nАльтернативы: **Insomnia**, **Bruno** (Git-friendly), **Thunder Client** (VS Code).\nPlaywright тоже умеет API-тесты: `request.get()`.",
    s: [
      "Postman для тестировщика tutorial",
      "Newman CI/CD интеграция",
      "Postman vs Playwright API testing",
    ],
  },
  {
    id: "alt-9",
    text: "k6 и JMeter: нагрузочное тестирование",
    time: "2ч",
    desc: "**k6** (Grafana): скрипты на JS, современный, лёгкий.\n`import http from 'k6/http'`\n`export default function() { http.get('https://api.example.com') }`\n\n**JMeter** (Apache): GUI, enterprise-стандарт, тяжелее.\n\nМетрики: RPS, latency (p50/p95/p99), error rate.\nДля Junior: знать что это + базовый k6-скрипт.",
    s: [
      "k6 load testing tutorial",
      "JMeter vs k6 сравнение",
      "нагрузочное тестирование для начинающих",
    ],
  },
  {
    id: "alt-10",
    text: "TMS: TestRail, Qase, AI в тестировании",
    time: "1.5ч",
    desc: "**Test Management System** — хранение тест-кейсов, запуски, отчёты.\n\n**TestRail**: корпоративный стандарт, платный.\n**Qase**: бесплатный план, интеграции с CI.\n**Zephyr**: плагин для Jira.\n\n**AI в QA**: Copilot для автокомплита тестов, ChatGPT для генерации тест-данных, AI-based visual testing (Applitools).\nAI не заменит AQA — но AQA с AI заменит AQA без AI.",
    s: [
      "TestRail vs Qase сравнение TMS",
      "AI в тестировании 2026",
      "test management system для QA",
    ],
  },
];
