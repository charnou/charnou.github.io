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
            desc: "Функциональное — ЧТО делает система. Нефункциональное — КАК (скорость, нагрузка).\n\n**Smoke** — поверхностная проверка после билда (5–10 мин). Если упал — билд бракуется.\n**Sanity** — проверка конкретного фикса.\n**Regression** — ВСЕ тесты после изменений. Именно regression чаще всего автоматизируют — это твоя основная работа как AQA.\n**Exploratory** — творческий поиск багов без скрипта.",
            s: [
              "виды тестирования ПО список с примерами",
              "smoke vs sanity vs regression разница",
            ],
          },
          {
            id: "1-3",
            text: "Уровни: unit, integration, e2e, acceptance",
            time: "2ч",
            desc: "**Unit** — отдельные функции (пишут разработчики).\n**Integration** — взаимодействие модулей.\n**E2E** — полный пользовательский путь от начала до конца — это то, что ТЫ будешь автоматизировать.\n**Acceptance** — соответствие бизнес-требованиям, часто с участием PO.",
            s: [
              "уровни тестирования пирамида",
              "unit integration e2e acceptance примеры",
            ],
          },
          {
            id: "1-4",
            text: "Пирамида тестирования",
            time: "1.5ч",
            desc: "🔺 Мало E2E (медленные, дорогие)\n🔷 Среднее integration\n🟩 Много unit (быстрые, дешёвые)\n\nАнтипаттерн: 'Мороженое' — много E2E, мало unit → CI идёт часами.\n\nСовременные альтернативы: **Testing Trophy** (Kent C. Dodds) — упор на integration тесты. С быстрыми фреймворками (Playwright) E2E стало дешевле.\n\nНа собеседовании: нарисуй пирамиду, объясни каждый уровень, приведи пример из проекта.",
            s: [
              "пирамида тестирования зачем нужна",
              "test pyramid anti-patterns ice cream",
            ],
          },
          {
            id: "1-5",
            text: "Техники тест-дизайна",
            time: "3ч",
            desc: "Классы эквивалентности: поле возраст 18–65 → 3 класса: <18, 18–65, >65. Из каждого берём 1 значение.\n\nГраничные значения: для 18–65 тестируем 17, 18, 19, 64, 65, 66. Баги чаще всего на границах!\n\n**Pairwise**: 3 параметра × 3 значения = 27 комбинаций, pairwise сокращает до 9–12.\n\nТаблица решений: для логических условий (если A И B, то C).",
            s: [
              "техники тест дизайна задачи примеры",
              "граничные значения классы эквивалентности",
            ],
          },
          {
            id: "1-6",
            text: "Тест-кейсы и чек-листы",
            time: "3ч",
            desc: "Тест-кейс: ID, заголовок, предусловия, шаги, ожидаемый результат.\n\nПример:\nTC-001 | Успешный логин\nПредусловие: Пользователь зарегистрирован\n1) Открыть /login\n2) Ввести email\n3) Ввести пароль\n4) Нажать Войти\nОжидание: Переход на /dashboard\n\nЧек-лист — сокращённая версия без шагов.\n\nПрактика: напиши 15 тест-кейсов на форму логина saucedemo.com (позитивные + негативные + граничные).",
            s: [
              "как писать тест кейсы примеры шаблон",
              "чек лист тестирования формы логина",
            ],
          },
          {
            id: "1-7",
            text: "Баг-репорты: severity vs priority",
            time: "2ч",
            desc: "Структура: Заголовок → Окружение → Шаги → Фактический результат → Ожидаемый → Скриншот.\n\n**Severity** (техническая): Critical > Major > Minor > Trivial\n**Priority** (бизнес): High > Medium > Low\n\nВажно: Critical баг у 0.01% юзеров = Low priority. Опечатка на главной = Minor severity но High priority.\n\nПример заголовка: '[Корзина] Товар не удаляется при нажатии кнопки Удалить'",
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
            desc: "SDLC: Требования → Анализ → Дизайн → Разработка → Тестирование → Деплой → Поддержка\n\nSTLC: Анализ требований → План тестирования → Тест-кейсы → Подготовка среды → Выполнение → Closure\n\nМодели: **Waterfall** (редко в IT), V-Model (каждому этапу — свой уровень тестов), Agile (95% команд сейчас).",
            s: [
              "SDLC STLC для тестировщика",
              "модели разработки waterfall agile",
            ],
          },
          {
            id: "1-10",
            text: "Agile/Scrum основы",
            time: "2ч",
            desc: "Роли: **Product Owner** (что), **Scrum Master** (как), Team (делаем)\nАртефакты: Product Backlog, Sprint Backlog, Increment\nЦеремонии: Planning, Daily Standup (15 мин), Review, Retrospective\n\n**Спринт** = 2 недели. **User Story**: 'Как [роль] я хочу [действие] чтобы [цель]'.\nStory Points — оценка сложности.\n\nТестировщик: присутствует на ВСЕХ церемониях, уточняет требования, пишет тесты параллельно с разработкой.",
            s: [
              "Scrum для тестировщика подробно",
              "agile scrum церемонии роли артефакты",
            ],
          },
          {
            id: "1-11",
            text: "Jira: аккаунт, доска, баг",
            time: "2ч",
            desc: "1. atlassian.com → Start free → создай проект\n2. Разберись с Kanban-доской: To Do → In Progress → Done\n3. Типы задач: `Story`, `Bug`, `Task`, `Epic`\n4. Создай 2–3 учебных бага с полной структурой\n5. JQL: project = X AND type = Bug AND status = Open\n\nJira — один из самых популярных инструментов (встречается в большинстве вакансий). Альтернативы: YouTrack, Linear, Trello.",
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
            desc: "1. nodejs.org → скачай LTS (не Current!).\nПроверка:\n`node -v`\n`npm -v`\n2. code.visualstudio.com → установи\n3. Расширения: ESLint, Prettier, JS code snippets, Material Icon Theme\n4. Settings: включи Format On Save\n5. Создай папку и первый файл:\n`mkdir qa-learning && cd qa-learning`\n`node hello.js`\n\nВидишь вывод `Hello QA!`? Окружение готово!",
            s: [
              "установка Node.js VS Code пошагово",
              "VS Code настройка JavaScript 2026",
            ],
          },
          {
            id: "1-13",
            text: "Переменные: let, const, var",
            time: "1.5ч",
            desc: "const — нельзя переприсвоить. ИСПОЛЬЗУЙ ПО УМОЛЧАНИЮ.\nlet — можно переприсвоить. Блочная область видимости.\nvar — УСТАРЕВШИЙ, не используй! Функциональная область, hoisting.\n\nПравило: всегда `const`. Нужно менять → `let`. Никогда `var`.\nНейминг: `camelCase` (`userName`), `UPPER_SNAKE` для констант (`BASE_URL`).",
            s: [
              "let const var JavaScript разница",
              "learn.javascript.ru переменные",
            ],
          },
          {
            id: "1-14",
            text: "Типы данных",
            time: "2ч",
            desc: "Примитивы: `string` `'hello'`, `number` `42`, `boolean` `true/false`, `null` (пусто явно), `undefined` (не задано)\nСсылочные: `object {key:'val'}`, `array [1,2,3]` — тоже объект!\n\n`typeof 'hi'` → 'string'; `typeof null` → 'object' (баг JS!)\n`Array.isArray([1,2])` → true\n\nВажно для тестирования: проверка типов в API-ответах.",
            s: [
              "типы данных JavaScript подробно",
              "typeof JavaScript все значения",
            ],
          },
          {
            id: "1-15",
            text: "Операторы",
            time: "1.5ч",
            desc: "`===` строгое равенство (ВСЕГДА используй!) vs `==` нестрогое (`'5'==5` → true)\n`&&` (И), `||` (ИЛИ), `!` (НЕ)\nТернарный: `const status = age >= 18 ? 'adult' : 'minor'`\nOptional chaining: `user?.address?.city` (не упадёт если null)\n`??` nullish coalescing: `name ?? 'Anonymous'`",
            s: [
              "операторы JavaScript шпаргалка",
              "=== vs == JavaScript разница",
            ],
          },
          {
            id: "1-16",
            text: "Условия: if/else, switch",
            time: "1.5ч",
            desc: "`if (condition) { } else if (other) { } else { }`\n`switch(status) { case 200: break; default: }`\n\nTruthy/Falsy: `0`, `''`, `null`, `undefined`, `NaN` → false. ВСЁ остальное true (включая `'0'`, `[]`, `{}`).\n`if (username)` — проверяет что не пустой/null.",
            s: [
              "условия JavaScript truthy falsy",
              "if else switch JavaScript примеры",
            ],
          },
          {
            id: "1-17",
            text: "Циклы",
            time: "2ч",
            desc: "`for (let i=0; i<10; i++) {}` — классический\n`while (condition) {}` — пока true\n`for (const item of array) {}` — ЗНАЧЕНИЯ массива, используй чаще всего\n`for (const key in object) {}` — КЛЮЧИ объекта\n\n`break` — выйти, `continue` — пропустить итерацию.\n⚠️ Не используй `for...in` для массивов!",
            s: ["циклы JavaScript все виды", "for of vs for in разница"],
          },
          {
            id: "1-18",
            text: "Функции",
            time: "2ч",
            desc: "`function greet(name) { return 'Hello, ' + name; }`\n`const greet = (name) => 'Hello, ' + name;` // arrow — используй чаще\n`const process = (data) => { return data.map(x => x*2); };` // с {} нужен `return`\n\nПараметры по умолчанию: `function greet(name = 'World') {}`\n\nВ Playwright: `test('name', async ({ page }) => { ... });` — arrow function повсюду.",
            s: [
              "стрелочные функции JavaScript подробно",
              "функции JavaScript learn.javascript.ru",
            ],
          },
          {
            id: "1-19",
            text: "Массивы: map, filter, find, reduce",
            time: "3ч",
            desc: "`const nums = [1,2,3,4,5];`\n`nums.map(n => n*2)` → [2,4,6,8,10] // трансформация\n`nums.filter(n => n%2===0)` → [2,4] // фильтрация\n`nums.find(n => n>3)` → 4 // первый подходящий\n`nums.reduce((acc,n) => acc+n, 0)` → 15 // свёртка\n`nums.some(n => n>4)` → true // есть ли хоть один\n`nums.every(n => n>0)` → true // все ли\n`nums.includes(3)` → true\n`push`/`pop` (конец), `shift`/`unshift` (начало), `slice` (копия), `splice` (мутация)\n\nВ тестировании: обработка массивов из API-ответов.",
            s: [
              "методы массивов JavaScript все с примерами",
              "map filter reduce JavaScript подробно",
            ],
          },
          {
            id: "1-20",
            text: "Объекты и деструктуризация",
            time: "2ч",
            desc: "`const user = { name:'Anna', age:25, address:{ city:'Minsk' } };`\n`user.name` → `'Anna'`; `user['name']` → то же\n\n`const { name, age } = user;` // деструктуризация\n`const { city } = user.address;`\n`const updated = { ...user, age:26 };` // spread\n\n`Object.keys(user)` → `['name','age','address']`\n`Object.values`, `Object.entries`\n\nВ тестировании: работа с JSON-ответами API — это объекты и массивы объектов.",
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
            s: [
              "template literals JavaScript",
              "шаблонные строки JavaScript примеры",
            ],
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
            desc: "Для AQA нужно понимать DOM чтобы находить элементы.\n\nКлючевые теги: `div`, `span`, `input`, `button`, `a`, `form`, `table`, `select`, `ul`/`li`\nАтрибуты-локаторы: `id` (уникальный!), `class`, `name`, `data-testid` (специально для тестов!), `placeholder`, `type`\n\nОткрой сайт → F12 → Elements → изучай структуру. Ctrl+Shift+C → наведи на элемент → увидишь HTML.",
            s: [
              "HTML для тестировщика автоматизатора",
              "data-testid атрибут зачем нужен",
            ],
          },
          {
            id: "2-2",
            text: "CSS-селекторы для локаторов",
            time: "2ч",
            desc: "`#myId` — по id\n`.myClass` — по классу\n`[name='email']` — по атрибуту\n`[data-testid='login']` — для тестов\n`div > p` — прямой потомок\n`div p` — любой потомок\n`:first-child`, `:nth-child(2)`, `:not(.disabled)`\n\nXPath (когда CSS не хватает): `//div[@id='main']//button[text()='Submit']`\n\nПрактика: DevTools → Console → `document.querySelectorAll('.class')`",
            s: [
              "CSS селекторы для автоматизации",
              "CSS selector vs XPath что лучше",
            ],
          },
          {
            id: "2-3",
            text: "Git: основные команды",
            time: "3ч",
            desc: "`git init` → `git add .` → `git commit -m 'feat: add tests'` → `git push origin main`\n\nВетки: `git switch -c feature/login` (или `git checkout -b`) → работай → add → commit → push → PR → merge\n\n`git status` — состояние\n`git log --oneline` — история\n`git diff` — изменения\n`git pull` — получить обновления\n\nCommit convention: `feat:` `fix:` `test:` `docs:`",
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
            desc: "`.gitignore`:\n`node_modules/`\n`.env`\n`test-results/`\n`playwright-report/`\n`*.log`\n\n`README.md`: # заголовок, **жирный**, - список, ```code```",
            s: [
              "gitignore шаблон Node.js",
              "markdown шпаргалка",
              "README.md best practices GitHub",
              ".gitignore шаблон node проект",
            ],
          },
          {
            id: "2-6",
            text: "Chrome DevTools",
            time: "2.5ч",
            desc: "F12 →\n**Elements**: DOM-дерево, Ctrl+Shift+C для выбора элемента, Copy selector/XPath\n**Console**: JS-консоль, ошибки, console.log\n**Network**: ВСЕ HTTP-запросы, фильтр XHR (только API), статусы, тела ответов\n**Application**: Cookies, LocalStorage",
            s: [
              "Chrome DevTools для тестировщика гайд",
              "DevTools Network XHR анализ",
            ],
          },
          {
            id: "2-7",
            text: "HTTP: методы и структура",
            time: "2ч",
            desc: "**GET** — получить\n**POST** — создать\n**PUT** — обновить целиком\n**PATCH** — обновить частично\n**DELETE** — удалить\n\nЗапрос = метод + URL + заголовки + тело (для POST/PUT)\nИдемпотентность: GET/PUT/DELETE — можно вызвать 10 раз, результат один. POST — нет.",
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
            desc: "`Content-Type: application/json` — формат тела\n`Authorization: Bearer <token>` — аутентификация\n\nJSON: `{\"name\":\"Anna\",\"age\":25}`\n`JSON.parse(string)` → объект | `JSON.stringify(obj)` → строка\n90% API используют JSON.",
            s: [
              "HTTP заголовки для тестировщика",
              "JSON формат для начинающих",
            ],
          },
          {
            id: "2-10",
            text: "REST API принципы",
            time: "1.5ч",
            desc: "Ресурсы по URL: `/users`, `/users/1`\nHTTP-методы = действия | Stateless | JSON\nEndpoint = метод + URL | Swagger/OpenAPI — документация API",
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
            desc: "Коллекция — папка запросов. Переменные: `{{base_url}}` вместо хардкода.\nPre-request: генерация данных перед запросом.\nTests:\n`pm.response.to.have.status(200);`\n`pm.expect(json.data).to.have.lengthOf(6);`\nRunner — запуск всей коллекции.\n\nСоздай коллекцию из 10–15 запросов к reqres.in и restful-booker с тестами к каждому.",
            s: [
              "Postman коллекции переменные тесты",
              "pm.expect Postman все проверки",
            ],
          },
          {
            id: "2-13",
            text: "async/await, Promises",
            time: "3ч",
            desc: "Promise — будущий результат: pending → fulfilled/rejected\n`async function getUsers() { const res = await fetch(url); const data = await res.json(); }`\n\n`await` приостанавливает до результата. Только внутри `async`.\n`try/catch` для ошибок.\n\nВ **Playwright** ВСЁ через `await`: `await page.goto(url);` `await page.getByRole('button').click();`",
            s: [
              "async await JavaScript подробно",
              "промисы learn.javascript.ru",
            ],
          },
          {
            id: "2-14",
            text: "Модули, npm, package.json",
            time: "2ч",
            desc: "`npm init -y` → `package.json`\n`npm install playwright` → зависимость добавляется в dependencies\n\n`export function sum(a,b){return a+b}` → `import {sum} from './math.js'`\nscripts: `\"test\":\"npx playwright test\"` → `npm test`\n\n`node_modules/` → ОБЯЗАТЕЛЬНО в `.gitignore`!\n`package-lock.json` → коммитить (фиксирует версии).",
            s: [
              "npm package.json для начинающих",
              "import export JavaScript модули",
            ],
          },
          {
            id: "2-15",
            text: "API-тесты на JavaScript",
            time: "3ч",
            desc: "Используй встроенный `fetch` (Node.js 18+, без установки!):\n\n`const res = await fetch('https://reqres.in/api/users');`\n`const json = await res.json();`\n`import assert from 'node:assert/strict';`\n`assert.strictEqual(res.status, 200);`\n`assert.strictEqual(json.data.length, 6);`\n\nPOST:\n`const res = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name:'Anna'}) });`\n\nНапиши 5–7 тестов: GET список, GET один, POST создание, PUT обновление, DELETE, 404.\n\n⚠️ `fetch` не кидает ошибку на 4xx/5xx — проверяй `res.ok` или `res.status` вручную.",
            s: [
              "fetch API JavaScript примеры GET POST",
              "API тесты JavaScript без фреймворка",
              "native fetch Node.js tutorial",
            ],
          },
          {
            id: "2-16",
            text: "SQL: SELECT, INSERT, UPDATE, DELETE",
            time: "4ч",
            desc: "`SELECT name, email FROM users WHERE age > 18 ORDER BY name LIMIT 10;`\n`SELECT COUNT(*) FROM users WHERE city = 'Minsk';`\n`INSERT INTO users (name) VALUES ('Anna');`\n`UPDATE users SET age = 26 WHERE id = 1;` ⚠️ без `WHERE` обновит ВСЕ!\n`DELETE FROM users WHERE id = 1;` ⚠️ без `WHERE` удалит ВСЕ!",
            s: [
              "SQL для начинающих SELECT WHERE",
              "SQL INSERT UPDATE DELETE примеры",
            ],
          },
          {
            id: "2-17",
            text: "SQL: JOIN + практика",
            time: "4ч",
            desc: "`INNER JOIN` — только совпадения:\n`SELECT o.id, u.name FROM orders o JOIN users u ON o.user_id = u.id;`\n`LEFT JOIN` — все из левой + совпадения из правой (`NULL` если нет).\n\nПрактика: sqlbolt.com (все уроки) + sql-ex.ru (10–15 задач).\nМинимум: `SELECT`, `WHERE`, `ORDER`, `JOIN`, `GROUP BY`, `COUNT`/`SUM`/`AVG`.",
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
            desc: "`mkdir project && cd project`\n`npm init playwright@latest` → JS или TS → tests → Yes → Yes\nПодожди скачивания браузеров (~500MB)\n`npx playwright test` → примеры пройдут\n`npx playwright show-report` → HTML-отчёт\nУстанови расширение **Playwright Test for VS Code** — запуск и отладка тестов прямо из редактора.",
            s: [
              "Playwright установка пошагово",
              "npm init playwright tutorial",
              "Playwright getting started tutorial 2026",
            ],
          },
          {
            id: "3-2",
            text: "Первый тест",
            time: "2ч",
            desc: "`test('has title', async ({ page }) => {`\n  `await page.goto('https://playwright.dev/');`\n  `await expect(page).toHaveTitle(/Playwright/);`\n`});`\n\n`test('click link', async ({ page }) => {`\n  `await page.goto('https://playwright.dev/');`\n  `await page.getByRole('link', {name:'Get started'}).click();`\n  `await expect(page.getByRole('heading', {name:'Installation'})).toBeVisible();`\n`});`\n\n`await` ОБЯЗАТЕЛЬНО перед каждым действием.",
            s: [
              "Playwright первый тест подробно",
              "Playwright page.goto click expect",
              "Playwright test example tutorial",
            ],
          },
          {
            id: "3-3",
            text: "Локаторы",
            time: "3ч",
            desc: "🥇 `getByRole('button', {name:'Submit'})` — лучший! Семантический, доступный.\n🥈 `getByLabel('Email')`, `getByPlaceholder('Enter email')` — для форм\n🥉 `getByText('Add to cart')` — для нeинтерактивных элементов\n🔧 `getByTestId('login-btn')` — запасной вариант (escape hatch), когда семантические не подходят\n⚙️ `page.locator('#id')`, `page.locator('.class')` — последний выбор\n\nПриоритет: `Role` > `Label`/`Placeholder` > `Text` > `TestId` > `CSS` > `XPath`\n\n`npx playwright codegen url` — генерирует локаторы автоматически",
            s: [
              "Playwright locators все виды",
              "getByRole getByText best practices",
            ],
          },
          {
            id: "3-4",
            text: "Assertions",
            time: "2ч",
            desc: "`await expect(locator).toBeVisible()` / `toBeHidden()`\n`await expect(locator).toHaveText('Dashboard')` / `toContainText('error')`\n`await expect(page).toHaveURL(/dashboard/)` / `toHaveTitle(/App/)`\n`await expect(locator).toBeEnabled()` / `toBeDisabled()` / `toBeChecked()`\n`await expect(locator).toHaveValue('test@test.com')`\n`await expect(locator).toHaveCount(6)`\n\nВсе **assertions** АВТОМАТИЧЕСКИ ждут (до timeout).",
            s: [
              "Playwright assertions полный список",
              "expect toBeVisible toHaveText Playwright",
            ],
          },
          {
            id: "3-5",
            text: "Формы, ожидания, скриншоты",
            time: "4ч",
            desc: "`await page.getByLabel('Email').fill('test@test.com');`\n`await page.getByRole('button', {name:'Submit'}).click();`\n`await page.getByLabel('Country').selectOption('US');`\n`await page.getByLabel('I agree').check();`\n`await page.keyboard.press('Enter');`\n\nAuto-waiting: **Playwright** сам ждёт. `waitForResponse`, `waitForURL` — для сложных случаев.\n⚠️ `waitForTimeout` — АНТИПАТТЕРН!\n\nConfig: `screenshot:'only-on-failure'`, `video:'retain-on-failure'`, `trace:'on-first-retry'`\n`npx playwright codegen url` — генерация тестов\n`npx playwright test --ui` — визуальный режим для отладки",
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
              "saucedemo Playwright автотесты пример",
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
            desc: "Каждая страница = класс:\n`class LoginPage {`\n  `constructor(page) {`\n    `this.page = page;`\n    `this.email = page.getByPlaceholder('Username');`\n    `this.password = page.getByPlaceholder('Password');`\n    `this.loginBtn = page.getByRole('button', {name:'Login'});`\n  `}`\n  `async login(user, pass) {`\n    `await this.email.fill(user);`\n    `await this.password.fill(pass);`\n    `await this.loginBtn.click();`\n  `}`\n`}`\n\nТесты читаются как сценарии: `await loginPage.login('user','pass');`",
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
            desc: "**Fixtures**: `test.extend({ loginPage: async({page},use) => { await use(new LoginPage(page)); } });`\n\n`playwright.config`: `baseURL`, `timeout:30000`, `retries:1`, `workers:4`, `reporter:'html'`\n`projects`: `chromium`, `firefox`, `webkit`",
            s: [
              "Playwright fixtures custom example",
              "playwright.config все параметры",
            ],
          },
          {
            id: "3-10",
            text: "API-тестирование в Playwright",
            time: "4ч",
            desc: "Встроенный `request` — НЕ нужны axios/fetch/supertest!\nРаботает в том же контексте (куки, авторизация shared с браузером).\n\n`test('GET users', async ({ request }) => {`\n  `const res = await request.get('/users');`\n  `expect(res.ok()).toBeTruthy();`\n  `const json = await res.json();`\n  `expect(json.data).toHaveLength(6);`\n`});`\n\n`test('POST create', async ({ request }) => {`\n  `const res = await request.post('/users', { data: {name:'Anna'} });`\n  `expect(res.status()).toBe(201);`\n`});`\n\nКомбинирование: **API** создаёт данные → UI проверяет.\n`test.describe`, `test.beforeEach`, `test.afterEach` для группировки.\nТеги: `test('login', { tag: ['@smoke'] }, ...)` → `npx playwright test --grep @smoke`",
            s: [
              "Playwright API testing tutorial",
              "Playwright API UI hybrid test",
              "Playwright API testing request fixture",
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
            desc: "`let name: string = 'Anna';`\n`let age: number = 25;`\n\n`interface` — описание структуры:\n`interface User { id: number; name: string; email: string; age?: number; }`\n\n`type` — псевдоним типа:\n`type Status = 'active' | 'inactive';`\n\n`enum` — перечисление:\n`enum Role { Admin='ADMIN', User='USER' }`\n\n`function greet(name: string): string { return 'Hello, ' + name; }`\n\n**Playwright** + TS = отличный автокомплит для всего API.",
            s: [
              "TypeScript для начинающих основы",
              "TypeScript interface enum tutorial",
            ],
          },
          {
            id: "4-2",
            text: "Переписать тесты на TS + GitHub Actions CI",
            time: "5ч",
            desc: "Переименуй `.js`→`.ts`, добавь типы к PO (`Page`, `Locator` из `@playwright/test`).\n\n**CI**: создай `.github/workflows/playwright.yml`:\n`name: Tests`\n`on: [push, pull_request]`\n`jobs: test: runs-on: ubuntu-latest`\n\nШаги: `checkout` → `setup-node` → `npm ci` → `playwright install --with-deps` → `npx playwright test` → `upload-artifact`\n\nТеперь тесты запускаются автоматически при каждом push и PR!",
            s: [
              "Playwright TypeScript migration",
              "Playwright GitHub Actions workflow yaml",
              "GitHub Actions Playwright CI yaml example",
            ],
          },
          {
            id: "4-3",
            text: "Allure Report + .env + параллелизация",
            time: "4ч",
            desc: "Установка:\n`npm install -D allure-playwright`\n\nКонфиг: `reporter:[['allure-playwright']]`\nАннотации: `allure.step()`, `allure.severity('critical')`, `allure.feature('Auth')`\n\n`.env` файл: `BASE_URL=https://...` → `process.env.BASE_URL`\n`npm install dotenv`\n⚠️ `.env` в `.gitignore`! Создай `.env.example`\n\nПараллелизация: `workers: 4` или `'50%'`. `fullyParallel: true`.\nData-driven: `for (const d of testData) { test('login ' + d.user, ...) }`",
            s: [
              "Allure Playwright setup",
              "Playwright parallel workers .env dotenv",
              "Allure report Playwright настройка",
              "data driven testing Playwright",
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
            desc: "Структура: `tests/ui/` + `tests/api/` + `pages/` + `fixtures/` + `.github/workflows/` + `README.md`\n\n15–20 UI тестов (saucedemo): логин, каталог, корзина, checkout, сортировка, ошибки.\n5–10 API тестов (reqres/restful-booker): CRUD, авторизация, негативные.\n\n**POM**, fixtures, @smoke/@regression, **CI/CD**, **Allure**.\nЭто — твоё ПОРТФОЛИО.",
            s: [
              "Playwright project structure best practices",
              "QA automation portfolio GitHub example",
              "Playwright test framework architecture GitHub",
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
            desc: "Топ-15 вопросов: QA/QC/Testing? Пирамида? Smoke/sanity/regression? Severity/priority? **POM** зачем? Какие локаторы? Flaky test? **Playwright** vs Cypress? **CI/CD**? **async/await**? Git branch/PR? SQL JOIN? Agile/Scrum? Расскажи проект.\n\nJS-вопросы: `let`/`const`/`var`, closure, `this`, `Promise`, event loop, `===` vs `==`\n\nMock-интервью: с другом, YouTube записи, AI.\nВопросы ТЕБЕ: стек? размер QA-команды? менторство? продукт? CI/CD?",
            s: [
              "вопросы собеседование Junior QA Automation",
              "JavaScript вопросы собеседование junior",
              "QA automation interview questions Playwright",
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
