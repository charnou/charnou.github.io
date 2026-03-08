export const plan = [
  {
    month: 1,
    title: "Фундамент: Теория QA + JavaScript",
    color: "#E86F3C",
    weeks: [
      {
        week: "Неделя 1–2",
        sub: "Теория тестирования",
        tasks: [
          {
            id: "1-1",
            text: "QA vs QC vs тестирование",
            time: "1.5ч",
            desc: "QA — процесс ПРЕДОТВРАЩЕНИЯ дефектов (стандарты, ревью). QC — ОБНАРУЖЕНИЕ дефектов. Тестирование — конкретная активность внутри QC.\n\nАналогия: QA = правила дорожного движения, QC = техосмотр, тестирование = проверка тормозов.\n\nЭто первый вопрос на ЛЮБОМ собеседовании QA.",
            s: [
              "QA vs QC vs тестирование разница",
              "what is quality assurance vs testing",
            ],
          },
          {
            id: "1-2",
            text: "Виды тестирования: функциональное, нефункциональное, smoke, sanity, regression",
            time: "3ч",
            desc: "Функциональное — ЧТО делает система. Нефункциональное — КАК (скорость, нагрузка).\n\nSmoke — поверхностная проверка после билда (5–10 мин). Если упал — билд бракуется.\nSanity — проверка конкретного фикса.\nRegression — ВСЕ тесты после изменений. Именно regression чаще всего автоматизируют — это твоя основная работа как AQA.\nExploratory — творческий поиск багов без скрипта.",
            s: [
              "виды тестирования ПО список с примерами",
              "smoke vs sanity vs regression разница",
            ],
          },
          {
            id: "1-3",
            text: "Уровни: unit, integration, e2e, acceptance",
            time: "2ч",
            desc: "Unit — отдельные функции (пишут разработчики). Integration — взаимодействие модулей. E2E — полный пользовательский путь от начала до конца — это то, что ТЫ будешь автоматизировать. Acceptance — соответствие бизнес-требованиям, часто с участием PO.",
            s: [
              "уровни тестирования пирамида",
              "unit integration e2e acceptance примеры",
            ],
          },
          {
            id: "1-4",
            text: "Пирамида тестирования",
            time: "1.5ч",
            desc: "🔺 Мало E2E (медленные, дорогие)\n🔷 Среднее integration\n🟩 Много unit (быстрые, дешёвые)\n\nАнтипаттерн: 'Мороженое' — много E2E, мало unit → CI идёт часами.\n\nНа собеседовании: нарисуй, объясни каждый уровень, приведи пример из проекта.",
            s: [
              "пирамида тестирования зачем нужна",
              "test pyramid anti-patterns ice cream",
            ],
          },
          {
            id: "1-5",
            text: "Техники тест-дизайна",
            time: "3ч",
            desc: "Классы эквивалентности: поле возраст 18–65 → 3 класса: <18, 18–65, >65. Из каждого берём 1 значение.\n\nГраничные значения: для 18–65 тестируем 17, 18, 19, 64, 65, 66. Баги чаще всего на границах!\n\nPairwise: 3 параметра × 3 значения = 27 комбинаций, pairwise сокращает до 9–12.\n\nТаблица решений: для логических условий (если A И B, то C).",
            s: [
              "техники тест дизайна задачи примеры",
              "граничные значения классы эквивалентности",
            ],
          },
          {
            id: "1-6",
            text: "Тест-кейсы и чек-листы",
            time: "3ч",
            desc: "Тест-кейс: ID, заголовок, предусловия, шаги, ожидаемый результат.\nПример: TC-001 | Успешный логин | Пользователь зарегистрирован | 1)Открыть /login 2)Ввести email 3)Ввести пароль 4)Нажать Войти | Переход на /dashboard\n\nЧек-лист — сокращённая версия без шагов.\n\nПрактика: напиши 15 тест-кейсов на форму логина saucedemo.com (позитивные + негативные + граничные).",
            s: [
              "как писать тест кейсы примеры шаблон",
              "чек лист тестирования формы логина",
            ],
          },
          {
            id: "1-7",
            text: "Баг-репорты: severity vs priority",
            time: "2ч",
            desc: "Структура: Заголовок → Окружение → Шаги → Фактический результат → Ожидаемый → Скриншот.\n\nSeverity (техническая): Critical > Major > Minor > Trivial\nPriority (бизнес): High > Medium > Low\n\nВажно: Critical баг у 0.01% юзеров = Low priority. Опечатка на главной = Minor severity но High priority.\n\nПример заголовка: '[Корзина] Товар не удаляется при нажатии кнопки Удалить'",
            s: [
              "как писать баг репорт пример",
              "severity vs priority QA таблица примеры",
            ],
          },
          {
            id: "1-8",
            text: "Жизненный цикл бага",
            time: "1ч",
            desc: "New → Open → In Progress → Fixed → Verification → Closed ✅\nИЛИ → Reopened 🔄 / Won't Fix / Duplicate / Cannot Reproduce\n\nТестировщик открывает → разработчик фиксит → тестировщик верифицирует.\nНа собеседовании могут попросить нарисовать схему.",
            s: [
              "жизненный цикл бага схема",
              "bug life cycle diagram all statuses",
            ],
          },
          {
            id: "1-9",
            text: "SDLC и STLC",
            time: "2ч",
            desc: "SDLC: Требования → Анализ → Дизайн → Разработка → Тестирование → Деплой → Поддержка\n\nSTLC: Анализ требований → План тестирования → Тест-кейсы → Подготовка среды → Выполнение → Closure\n\nМодели: Waterfall (устарела), V-Model (каждому этапу — свой уровень тестов), Agile (95% команд сейчас).",
            s: [
              "SDLC STLC для тестировщика",
              "модели разработки waterfall agile",
            ],
          },
          {
            id: "1-10",
            text: "Agile/Scrum основы",
            time: "2ч",
            desc: "Роли: Product Owner (что), Scrum Master (как), Team (делаем)\nАртефакты: Product Backlog, Sprint Backlog, Increment\nЦеремонии: Planning, Daily Standup (15 мин), Review, Retrospective\n\nСпринт = 2 недели. User Story: 'Как [роль] я хочу [действие] чтобы [цель]'.\nStory Points — оценка сложности.\n\nТестировщик: присутствует на ВСЕХ церемониях, уточняет требования, пишет тесты параллельно с разработкой.",
            s: [
              "Scrum для тестировщика подробно",
              "agile scrum церемонии роли артефакты",
            ],
          },
          {
            id: "1-11",
            text: "Jira: аккаунт, доска, баг",
            time: "2ч",
            desc: "1. atlassian.com → Start free → создай проект\n2. Разберись с Kanban-доской: To Do → In Progress → Done\n3. Типы задач: Story, Bug, Task, Epic\n4. Создай 2–3 учебных бага с полной структурой\n5. JQL: project = X AND type = Bug AND status = Open\n\nJira — стандарт индустрии (~80% вакансий). Альтернативы: YouTrack, Linear, Trello.",
            s: [
              "Jira для тестировщика с нуля",
              "как создать баг в Jira tutorial",
            ],
          },
        ],
      },
      {
        week: "Неделя 3–4",
        sub: "JavaScript — основы",
        tasks: [
          {
            id: "1-12",
            text: "Установить Node.js, VS Code",
            time: "1.5ч",
            desc: "1. nodejs.org → скачай LTS (не Current!). Проверка: node -v, npm -v\n2. code.visualstudio.com → установи\n3. Расширения: ESLint, Prettier, JS code snippets, Material Icon Theme\n4. Settings: включи Format On Save\n5. Создай папку qa-learning → hello.js → console.log('Hello QA!') → node hello.js\n\nВидишь вывод? Окружение готово!",
            s: [
              "установка Node.js VS Code пошагово",
              "VS Code настройка JavaScript 2025",
            ],
          },
          {
            id: "1-13",
            text: "Переменные: let, const, var",
            time: "1.5ч",
            desc: "const — нельзя переприсвоить. ИСПОЛЬЗУЙ ПО УМОЛЧАНИЮ.\nlet — можно переприсвоить. Блочная область видимости.\nvar — УСТАРЕВШИЙ, не используй! Функциональная область, hoisting.\n\nПравило: всегда const. Нужно менять → let. Никогда var.\nНейминг: camelCase (userName), UPPER_SNAKE для констант (BASE_URL).",
            s: [
              "let const var JavaScript разница",
              "learn.javascript.ru переменные",
            ],
          },
          {
            id: "1-14",
            text: "Типы данных",
            time: "2ч",
            desc: "Примитивы: string 'hello', number 42, boolean true/false, null (пусто явно), undefined (не задано)\nСсылочные: object {key:'val'}, array [1,2,3] — тоже объект!\n\ntypeof 'hi' → 'string'; typeof null → 'object' (баг JS!)\nArray.isArray([1,2]) → true\n\nВажно для тестирования: проверка типов в API-ответах.",
            s: [
              "типы данных JavaScript подробно",
              "typeof JavaScript все значения",
            ],
          },
          {
            id: "1-15",
            text: "Операторы",
            time: "1.5ч",
            desc: "=== строгое равенство (ВСЕГДА используй!) vs == нестрогое ('5'==5 → true)\n&& (И), || (ИЛИ), ! (НЕ)\nТернарный: const status = age >= 18 ? 'adult' : 'minor'\nOptional chaining: user?.address?.city (не упадёт если null)\n?? nullish coalescing: name ?? 'Anonymous'",
            s: [
              "операторы JavaScript шпаргалка",
              "=== vs == JavaScript разница",
            ],
          },
          {
            id: "1-16",
            text: "Условия: if/else, switch",
            time: "1.5ч",
            desc: "if (condition) { } else if (other) { } else { }\nswitch(status) { case 200: break; default: }\n\nTruthy/Falsy: 0, '', null, undefined, NaN → false. ВСЁ остальное true (включая '0', [], {}).\nif (username) — проверяет что не пустой/null.",
            s: [
              "условия JavaScript truthy falsy",
              "if else switch JavaScript примеры",
            ],
          },
          {
            id: "1-17",
            text: "Циклы",
            time: "2ч",
            desc: "for (let i=0; i<10; i++) {} — классический\nwhile (condition) {} — пока true\nfor (const item of array) {} — ЗНАЧЕНИЯ массива, используй чаще всего\nfor (const key in object) {} — КЛЮЧИ объекта\n\nbreak — выйти, continue — пропустить итерацию.\n⚠️ Не используй for...in для массивов!",
            s: ["циклы JavaScript все виды", "for of vs for in разница"],
          },
          {
            id: "1-18",
            text: "Функции",
            time: "2ч",
            desc: "function greet(name) { return `Hello, ${name}`; }\nconst greet = (name) => `Hello, ${name}`; // arrow — используй чаще\nconst process = (data) => { return data.map(x => x*2); }; // с {} нужен return\n\nПараметры по умолчанию: function greet(name = 'World') {}\n\nВ Playwright: test('name', async ({ page }) => { ... }); — arrow function повсюду.",
            s: [
              "стрелочные функции JavaScript подробно",
              "функции JavaScript learn.javascript.ru",
            ],
          },
          {
            id: "1-19",
            text: "Массивы: map, filter, find, reduce",
            time: "3ч",
            desc: "const nums = [1,2,3,4,5];\nnums.map(n => n*2) → [2,4,6,8,10] // трансформация\nnums.filter(n => n%2===0) → [2,4] // фильтрация\nnums.find(n => n>3) → 4 // первый подходящий\nnums.reduce((acc,n) => acc+n, 0) → 15 // свёртка\nnums.some(n => n>4) → true // есть ли хоть один\nnums.every(n => n>0) → true // все ли\nnums.includes(3) → true\npush/pop (конец), shift/unshift (начало), slice (копия), splice (мутация)\n\nВ тестировании: обработка массивов из API-ответов.",
            s: [
              "методы массивов JavaScript все с примерами",
              "map filter reduce JavaScript подробно",
            ],
          },
          {
            id: "1-20",
            text: "Объекты и деструктуризация",
            time: "2ч",
            desc: "const user = { name:'Anna', age:25, address:{ city:'Minsk' } };\nuser.name → 'Anna'; user['name'] → то же\n\nconst { name, age } = user; // деструктуризация\nconst { city } = user.address;\nconst updated = { ...user, age:26 }; // spread\n\nObject.keys(user) → ['name','age','address']\nObject.values, Object.entries\n\nВ тестировании: работа с JSON-ответами API — это объекты и массивы объектов.",
            s: [
              "объекты JavaScript деструктуризация",
              "spread operator JavaScript примеры",
            ],
          },
          {
            id: "1-21",
            text: "Template literals",
            time: "0.5ч",
            desc: "Бэктики: `Hello, ${name}! Sum: ${2+3}`\nМногострочные строки. Используются повсюду в тестах.",
            s: ["template literals JavaScript"],
          },
          {
            id: "1-22",
            text: "15–20 задач на Codewars",
            time: "6ч",
            desc: "codewars.com → JavaScript → начни с 8 kyu, затем 7 kyu.\n1–2 задачи в день. ОБЯЗАТЕЛЬНО смотри Solutions после своего решения!\n\nРекомендуемые: Multiply, Even or Odd, Reversed Strings, Sum of positive, Vowel Count, Highest and Lowest.\n\nРешай на протяжении ВСЕГО обучения, не только эту неделю.",
            s: [
              "codewars JavaScript 8 kyu лучшие",
              "codewars для начинающих как решать",
            ],
          },
        ],
      },
    ],
  },
  {
    month: 2,
    title: "Git, DevTools, API, HTML/SQL",
    color: "#3C8CE8",
    weeks: [
      {
        week: "Неделя 5–6",
        sub: "Git + HTML/CSS + DevTools + HTTP",
        tasks: [
          {
            id: "2-1",
            text: "HTML: теги, атрибуты, DOM",
            time: "3ч",
            desc: "Для AQA нужно понимать DOM чтобы находить элементы.\n\nКлючевые теги: div, span, input, button, a, form, table, select, ul/li\nАтрибуты-локаторы: id (уникальный!), class, name, data-testid (специально для тестов!), placeholder, type\n\nОткрой сайт → F12 → Elements → изучай структуру. Ctrl+Shift+C → наведи на элемент → увидишь HTML.",
            s: [
              "HTML для тестировщика автоматизатора",
              "data-testid атрибут зачем нужен",
            ],
          },
          {
            id: "2-2",
            text: "CSS-селекторы для локаторов",
            time: "2ч",
            desc: "#myId — по id | .myClass — по классу | [name='email'] — по атрибуту | [data-testid='login'] — для тестов\ndiv > p — прямой потомок | div p — любой потомок\n:first-child, :nth-child(2), :not(.disabled)\n\nXPath (когда CSS не хватает): //div[@id='main']//button[text()='Submit']\n\nПрактика: DevTools → Console → document.querySelectorAll('.class')",
            s: [
              "CSS селекторы для автоматизации",
              "CSS selector vs XPath что лучше",
            ],
          },
          {
            id: "2-3",
            text: "Git: основные команды",
            time: "3ч",
            desc: "git init → git add . → git commit -m 'feat: add tests' → git push origin main\n\nВетки: git checkout -b feature/login → работай → add → commit → push → PR → merge\n\ngit status — состояние | git log --oneline — история | git diff — изменения | git pull — получить обновления\n\nCommit convention: feat: fix: test: docs:",
            s: [
              "git для начинающих пошагово",
              "git команды шпаргалка на русском",
            ],
          },
          {
            id: "2-4",
            text: "GitHub: репозиторий, PR",
            time: "2ч",
            desc: "github.com → Sign Up → New repository (public) → clone → add files → push.\nPR: ветка → изменения → push → 'Compare & Pull Request' → Merge.\n\nGitHub Profile = портфолио. Рекрутеры СМОТРЯТ. Сделай красивый профиль.",
            s: [
              "GitHub для начинающих пошагово",
              "как сделать pull request",
            ],
          },
          {
            id: "2-5",
            text: ".gitignore, README.md",
            time: "1ч",
            desc: ".gitignore: node_modules/ .env test-results/ playwright-report/ *.log\nREADME.md: # заголовок, **жирный**, - список, ```code```",
            s: ["gitignore шаблон Node.js", "markdown шпаргалка"],
          },
          {
            id: "2-6",
            text: "Chrome DevTools",
            time: "2.5ч",
            desc: "F12 → Elements: DOM-дерево, Ctrl+Shift+C для выбора элемента, Copy selector/XPath\nConsole: JS-консоль, ошибки, console.log\nNetwork: ВСЕ HTTP-запросы, фильтр XHR (только API), статусы, тела ответов\nApplication: Cookies, LocalStorage",
            s: [
              "Chrome DevTools для тестировщика гайд",
              "DevTools Network XHR анализ",
            ],
          },
          {
            id: "2-7",
            text: "HTTP: методы и структура",
            time: "2ч",
            desc: "GET — получить | POST — создать | PUT — обновить | PATCH — частично | DELETE — удалить\n\nЗапрос = метод + URL + заголовки + тело (для POST/PUT)\nИдемпотентность: GET/PUT/DELETE — можно вызвать 10 раз, результат один. POST — нет.",
            s: [
              "HTTP методы подробно для тестировщика",
              "GET POST PUT DELETE разница",
            ],
          },
          {
            id: "2-8",
            text: "Коды ответов HTTP",
            time: "1ч",
            desc: "2xx: 200 OK, 201 Created, 204 No Content\n3xx: 301 Redirect\n4xx: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Validation, 429 Rate Limit\n5xx: 500 Server Error, 502 Bad Gateway, 503 Unavailable",
            s: [
              "HTTP коды ответов таблица",
              "401 vs 403 vs 404 разница",
            ],
          },
          {
            id: "2-9",
            text: "Заголовки HTTP, JSON",
            time: "2ч",
            desc: "Content-Type: application/json — формат тела\nAuthorization: Bearer <token> — аутентификация\n\nJSON: {\"name\":\"Anna\",\"age\":25}\nJSON.parse(string) → объект | JSON.stringify(obj) → строка\n90% API используют JSON.",
            s: [
              "HTTP заголовки для тестировщика",
              "JSON формат для начинающих",
            ],
          },
          {
            id: "2-10",
            text: "REST API принципы",
            time: "1.5ч",
            desc: "Ресурсы по URL: /users, /users/1\nHTTP-методы = действия | Stateless | JSON\nEndpoint = метод + URL | Swagger/OpenAPI — документация API",
            s: [
              "REST API что это простыми словами",
              "Swagger OpenAPI что это",
            ],
          },
          {
            id: "2-11",
            text: "Postman: первые запросы",
            time: "2ч",
            desc: "postman.com → скачай → создай аккаунт.\nGET https://reqres.in/api/users → Send → 200 + JSON\nPOST /api/users → Body raw JSON: {\"name\":\"Anna\",\"job\":\"QA\"} → 201\nGET /api/users/23 → 404\nPOST /api/login → Body: {\"email\":\"eve.holt@reqres.in\",\"password\":\"cityslicka\"} → token",
            s: [
              "Postman для начинающих пошагово",
              "reqres.in API tutorial",
            ],
          },
        ],
      },
      {
        week: "Неделя 7–8",
        sub: "API-тестирование + SQL",
        tasks: [
          {
            id: "2-12",
            text: "Postman: коллекции, переменные, тесты",
            time: "4ч",
            desc: "Коллекция — папка запросов. Переменные: {{base_url}} вместо хардкода.\nPre-request: генерация данных перед запросом.\nTests: pm.response.to.have.status(200); pm.expect(json.data).to.have.lengthOf(6);\nRunner — запуск всей коллекции.\n\nСоздай коллекцию из 10–15 запросов к reqres.in и restful-booker с тестами к каждому.",
            s: [
              "Postman коллекции переменные тесты",
              "pm.expect Postman все проверки",
            ],
          },
          {
            id: "2-13",
            text: "async/await, Promises",
            time: "3ч",
            desc: "Promise — будущий результат: pending → fulfilled/rejected\nasync function getUsers() { const res = await fetch(url); const data = await res.json(); }\n\nawait приостанавливает до результата. Только внутри async.\ntry/catch для ошибок.\n\nВ Playwright ВСЁ через await: await page.goto(url); await page.click('button');",
            s: [
              "async await JavaScript подробно",
              "промисы learn.javascript.ru",
            ],
          },
          {
            id: "2-14",
            text: "Модули, npm, package.json",
            time: "2ч",
            desc: "npm init -y → package.json\nnpm install axios → dependencies\nexport function sum(a,b){return a+b} → import {sum} from './math.js'\nscripts: {\"test\":\"npx playwright test\"} → npm test\nnode_modules → .gitignore!",
            s: [
              "npm package.json для начинающих",
              "import export JavaScript модули",
            ],
          },
          {
            id: "2-15",
            text: "API-тесты на JavaScript",
            time: "3ч",
            desc: "npm install axios.\nconst res = await axios.get('https://reqres.in/api/users');\nconsole.assert(res.status === 200);\nconsole.assert(res.data.data.length === 6);\n\nНапиши 5–7 тестов: GET список, GET один, POST создание, PUT обновление, DELETE, 404.",
            s: [
              "axios JavaScript GET POST примеры",
              "API тесты JavaScript без фреймворка",
            ],
          },
          {
            id: "2-16",
            text: "SQL: SELECT, INSERT, UPDATE, DELETE",
            time: "4ч",
            desc: "SELECT name, email FROM users WHERE age > 18 ORDER BY name LIMIT 10;\nSELECT COUNT(*) FROM users WHERE city = 'Minsk';\nINSERT INTO users (name) VALUES ('Anna');\nUPDATE users SET age = 26 WHERE id = 1; ⚠️ без WHERE обновит ВСЕ!\nDELETE FROM users WHERE id = 1; ⚠️ без WHERE удалит ВСЕ!",
            s: [
              "SQL для начинающих SELECT WHERE",
              "SQL INSERT UPDATE DELETE примеры",
            ],
          },
          {
            id: "2-17",
            text: "SQL: JOIN + практика",
            time: "4ч",
            desc: "INNER JOIN — только совпадения:\nSELECT o.id, u.name FROM orders o JOIN users u ON o.user_id = u.id;\nLEFT JOIN — все из левой + совпадения из правой (NULL если нет).\n\nПрактика: sqlbolt.com (все уроки) + sql-ex.ru (10–15 задач).\nМинимум: SELECT, WHERE, ORDER, JOIN, GROUP BY, COUNT/SUM/AVG.",
            s: [
              "SQL JOIN для начинающих с картинками",
              "sqlbolt уроки sql-ex.ru задачи",
            ],
          },
        ],
      },
    ],
  },
  {
    month: 3,
    title: "Автоматизация: Playwright",
    color: "#8C3CE8",
    weeks: [
      {
        week: "Неделя 9–10",
        sub: "Playwright — UI",
        tasks: [
          {
            id: "3-1",
            text: "Установить Playwright",
            time: "1ч",
            desc: "mkdir project && cd project\nnpm init playwright@latest → JS или TS → tests → Yes → Yes\nПодожди скачивания браузеров (~500MB)\nnpx playwright test → примеры пройдут\nnpx playwright show-report → HTML-отчёт",
            s: [
              "Playwright установка пошагово",
              "npm init playwright tutorial",
            ],
          },
          {
            id: "3-2",
            text: "Первый тест",
            time: "2ч",
            desc: "test('has title', async ({ page }) => {\n  await page.goto('https://playwright.dev/');\n  await expect(page).toHaveTitle(/Playwright/);\n});\n\ntest('click link', async ({ page }) => {\n  await page.goto('https://playwright.dev/');\n  await page.getByRole('link', {name:'Get started'}).click();\n  await expect(page.getByRole('heading', {name:'Installation'})).toBeVisible();\n});\n\nawait ОБЯЗАТЕЛЬНО перед каждым действием.",
            s: [
              "Playwright первый тест подробно",
              "Playwright page.goto click expect",
            ],
          },
          {
            id: "3-3",
            text: "Локаторы",
            time: "3ч",
            desc: "🥇 getByRole('button', {name:'Submit'}) — лучший!\n🥈 getByText('Add to cart'), getByLabel('Email'), getByPlaceholder('Enter email')\n🥉 getByTestId('login-btn') — ищет data-testid\n⚙️ page.locator('#id'), page.locator('.class')\n\nПриоритет: Role > Text > TestId > CSS > XPath\nnpx playwright codegen url — покажет какие локаторы генерирует",
            s: [
              "Playwright locators все виды",
              "getByRole getByText best practices",
            ],
          },
          {
            id: "3-4",
            text: "Assertions",
            time: "2ч",
            desc: "await expect(locator).toBeVisible() / toBeHidden()\nawait expect(locator).toHaveText('Dashboard') / toContainText('error')\nawait expect(page).toHaveURL(/dashboard/) / toHaveTitle(/App/)\nawait expect(locator).toBeEnabled() / toBeDisabled() / toBeChecked()\nawait expect(locator).toHaveValue('test@test.com')\nawait expect(locator).toHaveCount(6)\n\nВсе assertions АВТОМАТИЧЕСКИ ждут (до timeout).",
            s: [
              "Playwright assertions полный список",
              "expect toBeVisible toHaveText Playwright",
            ],
          },
          {
            id: "3-5",
            text: "Формы, ожидания, скриншоты",
            time: "4ч",
            desc: "page.fill('#email', 'test@test.com'); page.click('button');\npage.selectOption('#country', 'US'); page.check('#agree');\npage.keyboard.press('Enter');\n\nAuto-waiting: Playwright сам ждёт. waitForSelector, waitForResponse — для сложных случаев.\n⚠️ waitForTimeout — АНТИПАТТЕРН!\n\nConfig: screenshot:'only-on-failure', video:'retain-on-failure', trace:'on-first-retry'\nnpx playwright codegen url — генерация тестов",
            s: [
              "Playwright формы fill click select",
              "Playwright auto-waiting trace viewer",
            ],
          },
          {
            id: "3-6",
            text: "5–7 тестов на saucedemo.com",
            time: "5ч",
            desc: "1. Успешный логин (standard_user / secret_sauce)\n2. Неверный пароль → ошибка\n3. locked_out_user → ошибка\n4. Добавить товар → badge на корзине\n5. Удалить из корзины\n6. Сортировка товаров\n7. Полный checkout flow\n\nПока БЕЗ POM — чистые тесты. POM на следующей неделе.",
            s: [
              "Playwright tests saucedemo example",
              "saucedemo automation tutorial",
            ],
          },
        ],
      },
      {
        week: "Неделя 11–12",
        sub: "POM + API-тесты",
        tasks: [
          {
            id: "3-7",
            text: "Page Object Model",
            time: "3ч",
            desc: "Каждая страница = класс:\nclass LoginPage {\n  constructor(page) {\n    this.page = page;\n    this.email = page.getByPlaceholder('Username');\n    this.password = page.getByPlaceholder('Password');\n    this.loginBtn = page.getByRole('button', {name:'Login'});\n  }\n  async login(user, pass) {\n    await this.email.fill(user); await this.password.fill(pass); await this.loginBtn.click();\n  }\n}\n\nТесты читаются как сценарии: await loginPage.login('user','pass');",
            s: [
              "Page Object Model Playwright пример",
              "POM паттерн зачем нужен",
            ],
          },
          {
            id: "3-8",
            text: "Рефакторинг тестов в POM",
            time: "3ч",
            desc: "pages/LoginPage, ProductsPage, CartPage, CheckoutPage.\ntests/ui/login.spec, cart.spec, checkout.spec.\n\nКаждый PO: constructor(page) → локаторы → методы-действия.\nЭто КЛЮЧЕВОЙ навык для портфолио и собеседования.",
            s: [
              "Playwright POM рефакторинг пошагово",
              "POM folder structure Playwright",
            ],
          },
          {
            id: "3-9",
            text: "Fixtures и конфигурация",
            time: "3ч",
            desc: "Fixtures: test.extend({ loginPage: async({page},use) => { await use(new LoginPage(page)); } });\n\nplaywright.config: baseURL, timeout:30000, retries:1, workers:4, reporter:'html'\nprojects: chromium, firefox, webkit",
            s: [
              "Playwright fixtures custom example",
              "playwright.config все параметры",
            ],
          },
          {
            id: "3-10",
            text: "API-тестирование в Playwright",
            time: "4ч",
            desc: "test('GET users', async ({ request }) => {\n  const res = await request.get('/users');\n  expect(res.ok()).toBeTruthy();\n  const json = await res.json();\n  expect(json.data).toHaveLength(6);\n});\n\ntest('POST create', async ({ request }) => {\n  const res = await request.post('/users', { data: {name:'Anna'} });\n  expect(res.status()).toBe(201);\n});\n\nКомбинирование: API создаёт данные → UI проверяет.\ndescribe, beforeEach, afterEach для группировки.\nТеги: @smoke, @regression → --grep @smoke",
            s: [
              "Playwright API testing tutorial",
              "Playwright API UI hybrid test",
            ],
          },
        ],
      },
    ],
  },
  {
    month: 4,
    title: "Продвинутый + Портфолио",
    color: "#3CC78C",
    weeks: [
      {
        week: "Неделя 13–14",
        sub: "CI/CD, отчёты, TypeScript",
        tasks: [
          {
            id: "4-1",
            text: "TypeScript основы",
            time: "3ч",
            desc: "let name: string = 'Anna'; let age: number = 25;\ninterface User { id: number; name: string; email: string; age?: number; }\ntype Status = 'active' | 'inactive';\nenum Role { Admin='ADMIN', User='USER' }\nfunction greet(name: string): string { return `Hello, ${name}`; }\n\nPlaywright + TS = отличный автокомплит для всего API.",
            s: [
              "TypeScript для начинающих основы",
              "TypeScript interface enum tutorial",
            ],
          },
          {
            id: "4-2",
            text: "Переписать тесты на TS + GitHub Actions CI",
            time: "5ч",
            desc: "Переименуй .js→.ts, добавь типы к PO (Page, Locator из @playwright/test).\n\nCI: .github/workflows/playwright.yml:\nname: Tests\non: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps: checkout → setup-node → npm ci → playwright install --with-deps → test → upload-artifact\n\nТеперь тесты запускаются автоматически!",
            s: [
              "Playwright TypeScript migration",
              "Playwright GitHub Actions workflow yaml",
            ],
          },
          {
            id: "4-3",
            text: "Allure Report + .env + параллелизация",
            time: "4ч",
            desc: "npm install -D allure-playwright → reporter:[['allure-playwright']]\nallure.step(), allure.severity('critical'), allure.feature('Auth')\n\n.env: BASE_URL=https://... → npm install dotenv → process.env.BASE_URL\n⚠️ .env в .gitignore! Создай .env.example\n\nworkers: 4 или '50%'. fullyParallel: true.\nData-driven: for (const d of testData) { test(`login ${d.user}`, ...) }",
            s: [
              "Allure Playwright setup",
              "Playwright parallel workers .env dotenv",
            ],
          },
        ],
      },
      {
        week: "Неделя 15–16",
        sub: "Портфолио + собеседования",
        tasks: [
          {
            id: "4-4",
            text: "Финальный проект на GitHub",
            time: "12ч",
            desc: "Структура: tests/ui/ + tests/api/ + pages/ + fixtures/ + .github/workflows/ + README.md\n\n15–20 UI тестов (saucedemo): логин, каталог, корзина, checkout, сортировка, ошибки.\n5–10 API тестов (reqres/restful-booker): CRUD, авторизация, негативные.\n\nPOM, fixtures, @smoke/@regression, CI/CD, Allure.\nЭто — твоё ПОРТФОЛИО.",
            s: [
              "Playwright project structure best practices",
              "QA automation portfolio GitHub example",
            ],
          },
          {
            id: "4-5",
            text: "README + LinkedIn + Резюме",
            time: "4ч",
            desc: "README: описание, технологии, структура, как запустить, скриншот отчёта, CI badge.\n\nLinkedIn: 'Junior QA Automation | Playwright | JS/TS'. Skills, проект, активность.\n\nРезюме: 1 СТРАНИЦА! Summary + навыки + проекты с цифрами + образование.\n❌ Больше 1 страницы | ❌ 'Ответственная' | ✅ Конкретика и цифры",
            s: [
              "README для QA проекта шаблон",
              "резюме Junior QA Automation пример",
            ],
          },
          {
            id: "4-6",
            text: "Подготовка к собеседованиям",
            time: "6ч",
            desc: "Топ-15 вопросов: QA/QC/Testing? Пирамида? Smoke/sanity/regression? Severity/priority? POM зачем? Какие локаторы? Flaky test? Playwright vs Cypress? CI/CD? async/await? Git branch/PR? SQL JOIN? Agile/Scrum? Расскажи проект.\n\nJS-вопросы: let/const/var, closure, this, Promise, event loop, === vs ==\n\nMock-интервью: с другом, YouTube записи, AI.\nВопросы ТЕБЕ: стек? размер QA-команды? менторство? продукт? CI/CD?",
            s: [
              "вопросы собеседование Junior QA Automation",
              "JavaScript вопросы собеседование junior",
            ],
          },
          {
            id: "4-7",
            text: "Сопроводительное + откликаться на вакансии",
            time: "3ч",
            desc: "Cover letter (2–3 абзаца): почему эта компания + что умеешь + ссылка GitHub. АДАПТИРУЙ под каждую вакансию!\n\nПлощадки: LinkedIn, hh.ru, djinni.co, Habr Career, dev.by\n5–10 откликов/день. Даже если соответствуешь на 60–70%.\nFollow-up через неделю. Записывай результаты.\n\n⚠️ Первые 2–4 недели могут быть без ответов. НЕ СДАВАЙСЯ!",
            s: [
              "сопроводительное письмо Junior QA",
              "где искать работу QA automation 2026",
            ],
          },
        ],
      },
    ],
  },
];
