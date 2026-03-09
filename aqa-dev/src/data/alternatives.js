export const alternatives = [
  {
    id: "alt-1",
    text: "Cypress: обзор и отличия от Playwright",
    time: "2ч",
    desc: "Установка и запуск:\n`npm install cypress`\n`npx cypress open`\n\nОтличия: работает ВНУТРИ браузера (Playwright — снаружи). Только JS/TS. Safari только экспериментально (WebKit). Один таб (но есть `cy.origin()` для multi-domain). Параллелизация: платный Cloud или open-source (sorry-cypress, currents).\n\n**Playwright**: быстрее ~30%, мульти-браузер, мульти-таб, бесплатная параллелизация.\n**Cypress**: проще старт, живая перезагрузка, удобен для SPA, component testing.\n\nНа собеседовании: 'Почему Playwright?' — будь готова ответить.",
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
    desc: "OG-фреймворк (2004). Ещё широко используется в enterprise. Поддерживает Java/Python/C#/JS.\n\n**Selenium 4**: BiDi Protocol, Selenium Manager (авто-скачивание драйверов), Relative Locators.\nПочему НЕ основной: медленнее, нет auto-waiting из коробки (нужны explicit waits), сложнее настройка.\nЧто знать: **WebDriver Protocol**, **Selenium Grid**, **BiDi**, Appium (мобильное).",
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
    desc: "Долгое время стандарт unit-тестирования в JS/React. Создан Meta, сейчас OpenJS Foundation. Развитие замедлилось.\n\n`test('adds numbers', () => { expect(1 + 2).toBe(3) })`\n\nРазработчики пишут unit → AQA пишет e2e. Но знать unit-тесты полезно: иногда AQA пишет и их.\n\nФичи: snapshots, mocks, coverage из коробки.\nДля новых проектов: **Vitest** (быстрее, совместим с Jest API). Jest — встретишь в существующих проектах.",
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
    desc: "Рекомендация для новых проектов в 2026. Совместим с API Jest (легко мигрировать).\n\n`import { test, expect } from 'vitest'`\n\nПреимущества: нативный ESM и TypeScript, HMR для тестов, в 2–5x быстрее Jest в watch-режиме.\nРаботает не только с Vite — подходит как универсальный тестраннер.\n\nЗнание Jest API = знание Vitest API (одинаковый синтаксис).",
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
    desc: "Автотесты нативных мобильных приложений (iOS/Android).\n\nPlaywright = только мобильный ВЕБ (эмуляция браузера).\nAppium = нативные кнопки, жесты, push-уведомления.\n\n**Appium 2.x**: плагин-архитектура, драйверы устанавливаются отдельно:\n`appium driver install uiautomator2`\nЯзыки: Java, Python, JS.\nАльтернативы: **Maestro** (YAML, быстрый старт), **Detox** (React Native).\n\nДля Junior AQA: знать концепцию. Углубляться — если вакансия требует.",
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
    desc: "Одинаковая среда для dev/CI/prod. 'У меня работает' → невозможно.\n\nГотовый образ Playwright с браузерами:\n`docker run -it mcr.microsoft.com/playwright`\n\nОсновы: **Image** (шаблон), **Container** (запущенный экземпляр), **Dockerfile** (рецепт), **docker compose** v2 (несколько сервисов, без дефиса!).\n\nДля Junior: понимать концепцию + уметь запускать контейнеры.",
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
    desc: "Postman — GUI для отправки HTTP-запросов и тестирования API. Бесплатный план стал ограниченнее (лимиты, обязательная облачная синхронизация).\nNewman — CLI-версия для CI/CD:\n`newman run collection.json`\n\nCollections → Environments → Tests (JS assertions).\nПеременные: `{{base_url}}`, `{{token}}`.\n\nАльтернативы: **Bruno** (open-source, Git-friendly, без облака), **Insomnia**, **Hoppscotch** (веб), **Thunder Client** (VS Code).\nPlaywright тоже умеет API-тесты: `request.get()`.",
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
    desc: "**Test Management System** — хранение тест-кейсов, запуски, отчёты.\n\n**TestRail**: корпоративный стандарт, платный.\n**Qase**: бесплатный план, современный UI, интеграции с CI — лучший выбор для старта.\n**Zephyr Scale**: плагин для Jira.\n\n**AI в AQA** (must-have навык 2026):\n- **GitHub Copilot** — автокомплит тестов прямо в VS Code\n- **ChatGPT / Claude** — генерация тест-данных, тест-кейсов, дебаг\n- **Playwright Codegen** — генерация тестов из записи действий\n- Visual AI: **Applitools**, **Percy** — скриншот-сравнение\n- AI test agents: **QA.tech**, **Momentic** — автоматическое исследование приложения\n\nAI не заменит AQA — но AQA с AI заменит AQA без AI.",
    s: [
      "TestRail vs Qase сравнение TMS",
      "AI в тестировании автоматизации 2026",
      "GitHub Copilot для тестов",
    ],
  },
];
