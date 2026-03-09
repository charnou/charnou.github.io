import { useState, useCallback, useEffect, useRef } from "react";

const SK="aqa-v5";
async function ld(){try{const r=await window.storage.get(SK);return r?JSON.parse(r.value):null}catch{return null}}
async function sv(d){try{await window.storage.set(SK,JSON.stringify(d))}catch{}}

const M=[
  {id:"m1",text:"🌟 Ты красотка! У тебя всё получится. Тысячи людей прошли этот путь — и ты сможешь!",c:"#F0883E"},
  {id:"m2",text:"💪 Если что-то не получается — это нормально. Через месяц ты будешь смеяться над тем, что казалось сложным.",c:"#8C3CE8"},
  {id:"m3",text:"🔥 Каждая строчка кода — инвестиция в себя. Не сравнивай себя с другими, сравнивай с собой вчерашней.",c:"#3CC78C"},
  {id:"m4",text:"🎯 Junior — не 'знать всё'. Это показать что умеешь учиться и не сдаваться. Именно это ты сейчас и делаешь!",c:"#3C8CE8"},
  {id:"m5",text:"⭐ Каждый сеньор когда-то не понимал что такое Promise. Старайся — и ты добьёшься своего!",c:"#F778BA"},
];

const P=[
  {month:1,title:"Фундамент: Теория QA + JavaScript",color:"#E86F3C",weeks:[
    {week:"Неделя 1–2",sub:"Теория тестирования",tasks:[
      {id:"1-1",text:"QA vs QC vs тестирование",time:"1.5ч",desc:"QA — процесс ПРЕДОТВРАЩЕНИЯ дефектов (стандарты, ревью). QC — ОБНАРУЖЕНИЕ дефектов. Тестирование — конкретная активность внутри QC.\n\nАналогия: QA = правила дорожного движения, QC = техосмотр, тестирование = проверка тормозов.\n\nЭто первый вопрос на ЛЮБОМ собеседовании QA.",s:["QA vs QC vs тестирование разница","what is quality assurance vs testing"]},
      {id:"1-2",text:"Виды тестирования: функциональное, нефункциональное, smoke, sanity, regression",time:"3ч",desc:"Функциональное — ЧТО делает система. Нефункциональное — КАК (скорость, нагрузка).\n\nSmoke — поверхностная проверка после билда (5–10 мин). Если упал — билд бракуется.\nSanity — проверка конкретного фикса.\nRegression — ВСЕ тесты после изменений. Именно regression чаще всего автоматизируют — это твоя основная работа как AQA.\nExploratory — творческий поиск багов без скрипта.",s:["виды тестирования ПО список с примерами","smoke vs sanity vs regression разница"]},
      {id:"1-3",text:"Уровни: unit, integration, e2e, acceptance",time:"2ч",desc:"Unit — отдельные функции (пишут разработчики). Integration — взаимодействие модулей. E2E — полный пользовательский путь от начала до конца — это то, что ТЫ будешь автоматизировать. Acceptance — соответствие бизнес-требованиям, часто с участием PO.",s:["уровни тестирования пирамида","unit integration e2e acceptance примеры"]},
      {id:"1-4",text:"Пирамида тестирования",time:"1.5ч",desc:"🔺 Мало E2E (медленные, дорогие)\n🔷 Среднее integration\n🟩 Много unit (быстрые, дешёвые)\n\nАнтипаттерн: 'Мороженое' — много E2E, мало unit → CI идёт часами.\n\nНа собеседовании: нарисуй, объясни каждый уровень, приведи пример из проекта.",s:["пирамида тестирования зачем нужна","test pyramid anti-patterns ice cream"]},
      {id:"1-5",text:"Техники тест-дизайна",time:"3ч",desc:"Классы эквивалентности: поле возраст 18–65 → 3 класса: <18, 18–65, >65. Из каждого берём 1 значение.\n\nГраничные значения: для 18–65 тестируем 17, 18, 19, 64, 65, 66. Баги чаще всего на границах!\n\nPairwise: 3 параметра × 3 значения = 27 комбинаций, pairwise сокращает до 9–12.\n\nТаблица решений: для логических условий (если A И B, то C).",s:["техники тест дизайна задачи примеры","граничные значения классы эквивалентности"]},
      {id:"1-6",text:"Тест-кейсы и чек-листы",time:"3ч",desc:"Тест-кейс: ID, заголовок, предусловия, шаги, ожидаемый результат.\nПример: TC-001 | Успешный логин | Пользователь зарегистрирован | 1)Открыть /login 2)Ввести email 3)Ввести пароль 4)Нажать Войти | Переход на /dashboard\n\nЧек-лист — сокращённая версия без шагов.\n\nПрактика: напиши 15 тест-кейсов на форму логина saucedemo.com (позитивные + негативные + граничные).",s:["как писать тест кейсы примеры шаблон","чек лист тестирования формы логина"]},
      {id:"1-7",text:"Баг-репорты: severity vs priority",time:"2ч",desc:"Структура: Заголовок → Окружение → Шаги → Фактический результат → Ожидаемый → Скриншот.\n\nSeverity (техническая): Critical > Major > Minor > Trivial\nPriority (бизнес): High > Medium > Low\n\nВажно: Critical баг у 0.01% юзеров = Low priority. Опечатка на главной = Minor severity но High priority.\n\nПример заголовка: '[Корзина] Товар не удаляется при нажатии кнопки Удалить'",s:["как писать баг репорт пример","severity vs priority QA таблица примеры"]},
      {id:"1-8",text:"Жизненный цикл бага",time:"1ч",desc:"New → Open → In Progress → Fixed → Verification → Closed ✅\nИЛИ → Reopened 🔄 / Won't Fix / Duplicate / Cannot Reproduce\n\nТестировщик открывает → разработчик фиксит → тестировщик верифицирует.\nНа собеседовании могут попросить нарисовать схему.",s:["жизненный цикл бага схема","bug life cycle diagram all statuses"]},
      {id:"1-9",text:"SDLC и STLC",time:"2ч",desc:"SDLC: Требования → Анализ → Дизайн → Разработка → Тестирование → Деплой → Поддержка\n\nSTLC: Анализ требований → План тестирования → Тест-кейсы → Подготовка среды → Выполнение → Closure\n\nМодели: Waterfall (устарела), V-Model (каждому этапу — свой уровень тестов), Agile (95% команд сейчас).",s:["SDLC STLC для тестировщика","модели разработки waterfall agile"]},
      {id:"1-10",text:"Agile/Scrum основы",time:"2ч",desc:"Роли: Product Owner (что), Scrum Master (как), Team (делаем)\nАртефакты: Product Backlog, Sprint Backlog, Increment\nЦеремонии: Planning, Daily Standup (15 мин), Review, Retrospective\n\nСпринт = 2 недели. User Story: 'Как [роль] я хочу [действие] чтобы [цель]'.\nStory Points — оценка сложности.\n\nТестировщик: присутствует на ВСЕХ церемониях, уточняет требования, пишет тесты параллельно с разработкой.",s:["Scrum для тестировщика подробно","agile scrum церемонии роли артефакты"]},
      {id:"1-11",text:"Jira: аккаунт, доска, баг",time:"2ч",desc:"1. atlassian.com → Start free → создай проект\n2. Разберись с Kanban-доской: To Do → In Progress → Done\n3. Типы задач: Story, Bug, Task, Epic\n4. Создай 2–3 учебных бага с полной структурой\n5. JQL: project = X AND type = Bug AND status = Open\n\nJira — стандарт индустрии (~80% вакансий). Альтернативы: YouTrack, Linear, Trello.",s:["Jira для тестировщика с нуля","как создать баг в Jira tutorial"]},
    ]},
    {week:"Неделя 3–4",sub:"JavaScript — основы",tasks:[
      {id:"1-12",text:"Установить Node.js, VS Code",time:"1.5ч",desc:"1. nodejs.org → скачай LTS (не Current!). Проверка: node -v, npm -v\n2. code.visualstudio.com → установи\n3. Расширения: ESLint, Prettier, JS code snippets, Material Icon Theme\n4. Settings: включи Format On Save\n5. Создай папку qa-learning → hello.js → console.log('Hello QA!') → node hello.js\n\nВидишь вывод? Окружение готово!",s:["установка Node.js VS Code пошагово","VS Code настройка JavaScript 2025"]},
      {id:"1-13",text:"Переменные: let, const, var",time:"1.5ч",desc:"const — нельзя переприсвоить. ИСПОЛЬЗУЙ ПО УМОЛЧАНИЮ.\nlet — можно переприсвоить. Блочная область видимости.\nvar — УСТАРЕВШИЙ, не используй! Функциональная область, hoisting.\n\nПравило: всегда const. Нужно менять → let. Никогда var.\nНейминг: camelCase (userName), UPPER_SNAKE для констант (BASE_URL).",s:["let const var JavaScript разница","learn.javascript.ru переменные"]},
      {id:"1-14",text:"Типы данных",time:"2ч",desc:"Примитивы: string 'hello', number 42, boolean true/false, null (пусто явно), undefined (не задано)\nСсылочные: object {key:'val'}, array [1,2,3] — тоже объект!\n\ntypeof 'hi' → 'string'; typeof null → 'object' (баг JS!)\nArray.isArray([1,2]) → true\n\nВажно для тестирования: проверка типов в API-ответах.",s:["типы данных JavaScript подробно","typeof JavaScript все значения"]},
      {id:"1-15",text:"Операторы",time:"1.5ч",desc:"=== строгое равенство (ВСЕГДА используй!) vs == нестрогое ('5'==5 → true)\n&& (И), || (ИЛИ), ! (НЕ)\nТернарный: const status = age >= 18 ? 'adult' : 'minor'\nOptional chaining: user?.address?.city (не упадёт если null)\n?? nullish coalescing: name ?? 'Anonymous'",s:["операторы JavaScript шпаргалка","=== vs == JavaScript разница"]},
      {id:"1-16",text:"Условия: if/else, switch",time:"1.5ч",desc:"if (condition) { } else if (other) { } else { }\nswitch(status) { case 200: break; default: }\n\nTruthy/Falsy: 0, '', null, undefined, NaN → false. ВСЁ остальное true (включая '0', [], {}).\nif (username) — проверяет что не пустой/null.",s:["условия JavaScript truthy falsy","if else switch JavaScript примеры"]},
      {id:"1-17",text:"Циклы",time:"2ч",desc:"for (let i=0; i<10; i++) {} — классический\nwhile (condition) {} — пока true\nfor (const item of array) {} — ЗНАЧЕНИЯ массива, используй чаще всего\nfor (const key in object) {} — КЛЮЧИ объекта\n\nbreak — выйти, continue — пропустить итерацию.\n⚠️ Не используй for...in для массивов!",s:["циклы JavaScript все виды","for of vs for in разница"]},
      {id:"1-18",text:"Функции",time:"2ч",desc:"function greet(name) { return `Hello, ${name}`; }\nconst greet = (name) => `Hello, ${name}`; // arrow — используй чаще\nconst process = (data) => { return data.map(x => x*2); }; // с {} нужен return\n\nПараметры по умолчанию: function greet(name = 'World') {}\n\nВ Playwright: test('name', async ({ page }) => { ... }); — arrow function повсюду.",s:["стрелочные функции JavaScript подробно","функции JavaScript learn.javascript.ru"]},
      {id:"1-19",text:"Массивы: map, filter, find, reduce",time:"3ч",desc:"const nums = [1,2,3,4,5];\nnums.map(n => n*2) → [2,4,6,8,10] // трансформация\nnums.filter(n => n%2===0) → [2,4] // фильтрация\nnums.find(n => n>3) → 4 // первый подходящий\nnums.reduce((acc,n) => acc+n, 0) → 15 // свёртка\nnums.some(n => n>4) → true // есть ли хоть один\nnums.every(n => n>0) → true // все ли\nnums.includes(3) → true\npush/pop (конец), shift/unshift (начало), slice (копия), splice (мутация)\n\nВ тестировании: обработка массивов из API-ответов.",s:["методы массивов JavaScript все с примерами","map filter reduce JavaScript подробно"]},
      {id:"1-20",text:"Объекты и деструктуризация",time:"2ч",desc:"const user = { name:'Anna', age:25, address:{ city:'Minsk' } };\nuser.name → 'Anna'; user['name'] → то же\n\nconst { name, age } = user; // деструктуризация\nconst { city } = user.address;\nconst updated = { ...user, age:26 }; // spread\n\nObject.keys(user) → ['name','age','address']\nObject.values, Object.entries\n\nВ тестировании: работа с JSON-ответами API — это объекты и массивы объектов.",s:["объекты JavaScript деструктуризация","spread operator JavaScript примеры"]},
      {id:"1-21",text:"Template literals",time:"0.5ч",desc:"Бэктики: `Hello, ${name}! Sum: ${2+3}`\nМногострочные строки. Используются повсюду в тестах.",s:["template literals JavaScript"]},
      {id:"1-22",text:"15–20 задач на Codewars",time:"6ч",desc:"codewars.com → JavaScript → начни с 8 kyu, затем 7 kyu.\n1–2 задачи в день. ОБЯЗАТЕЛЬНО смотри Solutions после своего решения!\n\nРекомендуемые: Multiply, Even or Odd, Reversed Strings, Sum of positive, Vowel Count, Highest and Lowest.\n\nРешай на протяжении ВСЕГО обучения, не только эту неделю.",s:["codewars JavaScript 8 kyu лучшие","codewars для начинающих как решать"]},
    ]},
  ]},
  {month:2,title:"Git, DevTools, API, HTML/SQL",color:"#3C8CE8",weeks:[
    {week:"Неделя 5–6",sub:"Git + HTML/CSS + DevTools + HTTP",tasks:[
      {id:"2-1",text:"HTML: теги, атрибуты, DOM",time:"3ч",desc:"Для AQA нужно понимать DOM чтобы находить элементы.\n\nКлючевые теги: div, span, input, button, a, form, table, select, ul/li\nАтрибуты-локаторы: id (уникальный!), class, name, data-testid (специально для тестов!), placeholder, type\n\nОткрой сайт → F12 → Elements → изучай структуру. Ctrl+Shift+C → наведи на элемент → увидишь HTML.",s:["HTML для тестировщика автоматизатора","data-testid атрибут зачем нужен"]},
      {id:"2-2",text:"CSS-селекторы для локаторов",time:"2ч",desc:"#myId — по id | .myClass — по классу | [name='email'] — по атрибуту | [data-testid='login'] — для тестов\ndiv > p — прямой потомок | div p — любой потомок\n:first-child, :nth-child(2), :not(.disabled)\n\nXPath (когда CSS не хватает): //div[@id='main']//button[text()='Submit']\n\nПрактика: DevTools → Console → document.querySelectorAll('.class')",s:["CSS селекторы для автоматизации","CSS selector vs XPath что лучше"]},
      {id:"2-3",text:"Git: основные команды",time:"3ч",desc:"git init → git add . → git commit -m 'feat: add tests' → git push origin main\n\nВетки: git checkout -b feature/login → работай → add → commit → push → PR → merge\n\ngit status — состояние | git log --oneline — история | git diff — изменения | git pull — получить обновления\n\nCommit convention: feat: fix: test: docs:",s:["git для начинающих пошагово","git команды шпаргалка на русском"]},
      {id:"2-4",text:"GitHub: репозиторий, PR",time:"2ч",desc:"github.com → Sign Up → New repository (public) → clone → add files → push.\nPR: ветка → изменения → push → 'Compare & Pull Request' → Merge.\n\nGitHub Profile = портфолио. Рекрутеры СМОТРЯТ. Сделай красивый профиль.",s:["GitHub для начинающих пошагово","как сделать pull request"]},
      {id:"2-5",text:".gitignore, README.md",time:"1ч",desc:".gitignore: node_modules/ .env test-results/ playwright-report/ *.log\nREADME.md: # заголовок, **жирный**, - список, ```code```",s:["gitignore шаблон Node.js","markdown шпаргалка"]},
      {id:"2-6",text:"Chrome DevTools",time:"2.5ч",desc:"F12 → Elements: DOM-дерево, Ctrl+Shift+C для выбора элемента, Copy selector/XPath\nConsole: JS-консоль, ошибки, console.log\nNetwork: ВСЕ HTTP-запросы, фильтр XHR (только API), статусы, тела ответов\nApplication: Cookies, LocalStorage",s:["Chrome DevTools для тестировщика гайд","DevTools Network XHR анализ"]},
      {id:"2-7",text:"HTTP: методы и структура",time:"2ч",desc:"GET — получить | POST — создать | PUT — обновить | PATCH — частично | DELETE — удалить\n\nЗапрос = метод + URL + заголовки + тело (для POST/PUT)\nИдемпотентность: GET/PUT/DELETE — можно вызвать 10 раз, результат один. POST — нет.",s:["HTTP методы подробно для тестировщика","GET POST PUT DELETE разница"]},
      {id:"2-8",text:"Коды ответов HTTP",time:"1ч",desc:"2xx: 200 OK, 201 Created, 204 No Content\n3xx: 301 Redirect\n4xx: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Validation, 429 Rate Limit\n5xx: 500 Server Error, 502 Bad Gateway, 503 Unavailable",s:["HTTP коды ответов таблица","401 vs 403 vs 404 разница"]},
      {id:"2-9",text:"Заголовки HTTP, JSON",time:"2ч",desc:"Content-Type: application/json — формат тела\nAuthorization: Bearer <token> — аутентификация\n\nJSON: {\"name\":\"Anna\",\"age\":25}\nJSON.parse(string) → объект | JSON.stringify(obj) → строка\n90% API используют JSON.",s:["HTTP заголовки для тестировщика","JSON формат для начинающих"]},
      {id:"2-10",text:"REST API принципы",time:"1.5ч",desc:"Ресурсы по URL: /users, /users/1\nHTTP-методы = действия | Stateless | JSON\nEndpoint = метод + URL | Swagger/OpenAPI — документация API",s:["REST API что это простыми словами","Swagger OpenAPI что это"]},
      {id:"2-11",text:"Postman: первые запросы",time:"2ч",desc:"postman.com → скачай → создай аккаунт.\nGET https://reqres.in/api/users → Send → 200 + JSON\nPOST /api/users → Body raw JSON: {\"name\":\"Anna\",\"job\":\"QA\"} → 201\nGET /api/users/23 → 404\nPOST /api/login → Body: {\"email\":\"eve.holt@reqres.in\",\"password\":\"cityslicka\"} → token",s:["Postman для начинающих пошагово","reqres.in API tutorial"]},
    ]},
    {week:"Неделя 7–8",sub:"API-тестирование + SQL",tasks:[
      {id:"2-12",text:"Postman: коллекции, переменные, тесты",time:"4ч",desc:"Коллекция — папка запросов. Переменные: {{base_url}} вместо хардкода.\nPre-request: генерация данных перед запросом.\nTests: pm.response.to.have.status(200); pm.expect(json.data).to.have.lengthOf(6);\nRunner — запуск всей коллекции.\n\nСоздай коллекцию из 10–15 запросов к reqres.in и restful-booker с тестами к каждому.",s:["Postman коллекции переменные тесты","pm.expect Postman все проверки"]},
      {id:"2-13",text:"async/await, Promises",time:"3ч",desc:"Promise — будущий результат: pending → fulfilled/rejected\nasync function getUsers() { const res = await fetch(url); const data = await res.json(); }\n\nawait приостанавливает до результата. Только внутри async.\ntry/catch для ошибок.\n\nВ Playwright ВСЁ через await: await page.goto(url); await page.click('button');",s:["async await JavaScript подробно","промисы learn.javascript.ru"]},
      {id:"2-14",text:"Модули, npm, package.json",time:"2ч",desc:"npm init -y → package.json\nnpm install axios → dependencies\nexport function sum(a,b){return a+b} → import {sum} from './math.js'\nscripts: {\"test\":\"npx playwright test\"} → npm test\nnode_modules → .gitignore!",s:["npm package.json для начинающих","import export JavaScript модули"]},
      {id:"2-15",text:"API-тесты на JavaScript",time:"3ч",desc:"npm install axios.\nconst res = await axios.get('https://reqres.in/api/users');\nconsole.assert(res.status === 200);\nconsole.assert(res.data.data.length === 6);\n\nНапиши 5–7 тестов: GET список, GET один, POST создание, PUT обновление, DELETE, 404.",s:["axios JavaScript GET POST примеры","API тесты JavaScript без фреймворка"]},
      {id:"2-16",text:"SQL: SELECT, INSERT, UPDATE, DELETE",time:"4ч",desc:"SELECT name, email FROM users WHERE age > 18 ORDER BY name LIMIT 10;\nSELECT COUNT(*) FROM users WHERE city = 'Minsk';\nINSERT INTO users (name) VALUES ('Anna');\nUPDATE users SET age = 26 WHERE id = 1; ⚠️ без WHERE обновит ВСЕ!\nDELETE FROM users WHERE id = 1; ⚠️ без WHERE удалит ВСЕ!",s:["SQL для начинающих SELECT WHERE","SQL INSERT UPDATE DELETE примеры"]},
      {id:"2-17",text:"SQL: JOIN + практика",time:"4ч",desc:"INNER JOIN — только совпадения:\nSELECT o.id, u.name FROM orders o JOIN users u ON o.user_id = u.id;\nLEFT JOIN — все из левой + совпадения из правой (NULL если нет).\n\nПрактика: sqlbolt.com (все уроки) + sql-ex.ru (10–15 задач).\nМинимум: SELECT, WHERE, ORDER, JOIN, GROUP BY, COUNT/SUM/AVG.",s:["SQL JOIN для начинающих с картинками","sqlbolt уроки sql-ex.ru задачи"]},
    ]},
  ]},
  {month:3,title:"Автоматизация: Playwright",color:"#8C3CE8",weeks:[
    {week:"Неделя 9–10",sub:"Playwright — UI",tasks:[
      {id:"3-1",text:"Установить Playwright",time:"1ч",desc:"mkdir project && cd project\nnpm init playwright@latest → JS или TS → tests → Yes → Yes\nПодожди скачивания браузеров (~500MB)\nnpx playwright test → примеры пройдут\nnpx playwright show-report → HTML-отчёт",s:["Playwright установка пошагово","npm init playwright tutorial"]},
      {id:"3-2",text:"Первый тест",time:"2ч",desc:"test('has title', async ({ page }) => {\n  await page.goto('https://playwright.dev/');\n  await expect(page).toHaveTitle(/Playwright/);\n});\n\ntest('click link', async ({ page }) => {\n  await page.goto('https://playwright.dev/');\n  await page.getByRole('link', {name:'Get started'}).click();\n  await expect(page.getByRole('heading', {name:'Installation'})).toBeVisible();\n});\n\nawait ОБЯЗАТЕЛЬНО перед каждым действием.",s:["Playwright первый тест подробно","Playwright page.goto click expect"]},
      {id:"3-3",text:"Локаторы",time:"3ч",desc:"🥇 getByRole('button', {name:'Submit'}) — лучший!\n🥈 getByText('Add to cart'), getByLabel('Email'), getByPlaceholder('Enter email')\n🥉 getByTestId('login-btn') — ищет data-testid\n⚙️ page.locator('#id'), page.locator('.class')\n\nПриоритет: Role > Text > TestId > CSS > XPath\nnpx playwright codegen url — покажет какие локаторы генерирует",s:["Playwright locators все виды","getByRole getByText best practices"]},
      {id:"3-4",text:"Assertions",time:"2ч",desc:"await expect(locator).toBeVisible() / toBeHidden()\nawait expect(locator).toHaveText('Dashboard') / toContainText('error')\nawait expect(page).toHaveURL(/dashboard/) / toHaveTitle(/App/)\nawait expect(locator).toBeEnabled() / toBeDisabled() / toBeChecked()\nawait expect(locator).toHaveValue('test@test.com')\nawait expect(locator).toHaveCount(6)\n\nВсе assertions АВТОМАТИЧЕСКИ ждут (до timeout).",s:["Playwright assertions полный список","expect toBeVisible toHaveText Playwright"]},
      {id:"3-5",text:"Формы, ожидания, скриншоты",time:"4ч",desc:"page.fill('#email', 'test@test.com'); page.click('button');\npage.selectOption('#country', 'US'); page.check('#agree');\npage.keyboard.press('Enter');\n\nAuto-waiting: Playwright сам ждёт. waitForSelector, waitForResponse — для сложных случаев.\n⚠️ waitForTimeout — АНТИПАТТЕРН!\n\nConfig: screenshot:'only-on-failure', video:'retain-on-failure', trace:'on-first-retry'\nnpx playwright codegen url — генерация тестов",s:["Playwright формы fill click select","Playwright auto-waiting trace viewer"]},
      {id:"3-6",text:"5–7 тестов на saucedemo.com",time:"5ч",desc:"1. Успешный логин (standard_user / secret_sauce)\n2. Неверный пароль → ошибка\n3. locked_out_user → ошибка\n4. Добавить товар → badge на корзине\n5. Удалить из корзины\n6. Сортировка товаров\n7. Полный checkout flow\n\nПока БЕЗ POM — чистые тесты. POM на следующей неделе.",s:["Playwright tests saucedemo example","saucedemo automation tutorial"]},
    ]},
    {week:"Неделя 11–12",sub:"POM + API-тесты",tasks:[
      {id:"3-7",text:"Page Object Model",time:"3ч",desc:"Каждая страница = класс:\nclass LoginPage {\n  constructor(page) {\n    this.page = page;\n    this.email = page.getByPlaceholder('Username');\n    this.password = page.getByPlaceholder('Password');\n    this.loginBtn = page.getByRole('button', {name:'Login'});\n  }\n  async login(user, pass) {\n    await this.email.fill(user); await this.password.fill(pass); await this.loginBtn.click();\n  }\n}\n\nТесты читаются как сценарии: await loginPage.login('user','pass');",s:["Page Object Model Playwright пример","POM паттерн зачем нужен"]},
      {id:"3-8",text:"Рефакторинг тестов в POM",time:"3ч",desc:"pages/LoginPage, ProductsPage, CartPage, CheckoutPage.\ntests/ui/login.spec, cart.spec, checkout.spec.\n\nКаждый PO: constructor(page) → локаторы → методы-действия.\nЭто КЛЮЧЕВОЙ навык для портфолио и собеседования.",s:["Playwright POM рефакторинг пошагово","POM folder structure Playwright"]},
      {id:"3-9",text:"Fixtures и конфигурация",time:"3ч",desc:"Fixtures: test.extend({ loginPage: async({page},use) => { await use(new LoginPage(page)); } });\n\nplaywright.config: baseURL, timeout:30000, retries:1, workers:4, reporter:'html'\nprojects: chromium, firefox, webkit",s:["Playwright fixtures custom example","playwright.config все параметры"]},
      {id:"3-10",text:"API-тестирование в Playwright",time:"4ч",desc:"test('GET users', async ({ request }) => {\n  const res = await request.get('/users');\n  expect(res.ok()).toBeTruthy();\n  const json = await res.json();\n  expect(json.data).toHaveLength(6);\n});\n\ntest('POST create', async ({ request }) => {\n  const res = await request.post('/users', { data: {name:'Anna'} });\n  expect(res.status()).toBe(201);\n});\n\nКомбинирование: API создаёт данные → UI проверяет.\ndescribe, beforeEach, afterEach для группировки.\nТеги: @smoke, @regression → --grep @smoke",s:["Playwright API testing tutorial","Playwright API UI hybrid test"]},
    ]},
  ]},
  {month:4,title:"Продвинутый + Портфолио",color:"#3CC78C",weeks:[
    {week:"Неделя 13–14",sub:"CI/CD, отчёты, TypeScript",tasks:[
      {id:"4-1",text:"TypeScript основы",time:"3ч",desc:"let name: string = 'Anna'; let age: number = 25;\ninterface User { id: number; name: string; email: string; age?: number; }\ntype Status = 'active' | 'inactive';\nenum Role { Admin='ADMIN', User='USER' }\nfunction greet(name: string): string { return `Hello, ${name}`; }\n\nPlaywright + TS = отличный автокомплит для всего API.",s:["TypeScript для начинающих основы","TypeScript interface enum tutorial"]},
      {id:"4-2",text:"Переписать тесты на TS + GitHub Actions CI",time:"5ч",desc:"Переименуй .js→.ts, добавь типы к PO (Page, Locator из @playwright/test).\n\nCI: .github/workflows/playwright.yml:\nname: Tests\non: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps: checkout → setup-node → npm ci → playwright install --with-deps → test → upload-artifact\n\nТеперь тесты запускаются автоматически!",s:["Playwright TypeScript migration","Playwright GitHub Actions workflow yaml"]},
      {id:"4-3",text:"Allure Report + .env + параллелизация",time:"4ч",desc:"npm install -D allure-playwright → reporter:[['allure-playwright']]\nallure.step(), allure.severity('critical'), allure.feature('Auth')\n\n.env: BASE_URL=https://... → npm install dotenv → process.env.BASE_URL\n⚠️ .env в .gitignore! Создай .env.example\n\nworkers: 4 или '50%'. fullyParallel: true.\nData-driven: for (const d of testData) { test(`login ${d.user}`, ...) }",s:["Allure Playwright setup","Playwright parallel workers .env dotenv"]},
    ]},
    {week:"Неделя 15–16",sub:"Портфолио + собеседования",tasks:[
      {id:"4-4",text:"Финальный проект на GitHub",time:"12ч",desc:"Структура: tests/ui/ + tests/api/ + pages/ + fixtures/ + .github/workflows/ + README.md\n\n15–20 UI тестов (saucedemo): логин, каталог, корзина, checkout, сортировка, ошибки.\n5–10 API тестов (reqres/restful-booker): CRUD, авторизация, негативные.\n\nPOM, fixtures, @smoke/@regression, CI/CD, Allure.\nЭто — твоё ПОРТФОЛИО.",s:["Playwright project structure best practices","QA automation portfolio GitHub example"]},
      {id:"4-5",text:"README + LinkedIn + Резюме",time:"4ч",desc:"README: описание, технологии, структура, как запустить, скриншот отчёта, CI badge.\n\nLinkedIn: 'Junior QA Automation | Playwright | JS/TS'. Skills, проект, активность.\n\nРезюме: 1 СТРАНИЦА! Summary + навыки + проекты с цифрами + образование.\n❌ Больше 1 страницы | ❌ 'Ответственная' | ✅ Конкретика и цифры",s:["README для QA проекта шаблон","резюме Junior QA Automation пример"]},
      {id:"4-6",text:"Подготовка к собеседованиям",time:"6ч",desc:"Топ-15 вопросов: QA/QC/Testing? Пирамида? Smoke/sanity/regression? Severity/priority? POM зачем? Какие локаторы? Flaky test? Playwright vs Cypress? CI/CD? async/await? Git branch/PR? SQL JOIN? Agile/Scrum? Расскажи проект.\n\nJS-вопросы: let/const/var, closure, this, Promise, event loop, === vs ==\n\nMock-интервью: с другом, YouTube записи, AI.\nВопросы ТЕБЕ: стек? размер QA-команды? менторство? продукт? CI/CD?",s:["вопросы собеседование Junior QA Automation","JavaScript вопросы собеседование junior"]},
      {id:"4-7",text:"Сопроводительное + откликаться на вакансии",time:"3ч",desc:"Cover letter (2–3 абзаца): почему эта компания + что умеешь + ссылка GitHub. АДАПТИРУЙ под каждую вакансию!\n\nПлощадки: LinkedIn, hh.ru, djinni.co, Habr Career, dev.by\n5–10 откликов/день. Даже если соответствуешь на 60–70%.\nFollow-up через неделю. Записывай результаты.\n\n⚠️ Первые 2–4 недели могут быть без ответов. НЕ СДАВАЙСЯ!",s:["сопроводительное письмо Junior QA","где искать работу QA automation 2026"]},
    ]},
  ]},
];

const AT=[
  {id:"alt-1",text:"Cypress: обзор и отличия от Playwright",time:"2ч",desc:"npm install cypress → npx cypress open.\n\nОтличия: работает ВНУТРИ браузера (Playwright — снаружи). Только JS/TS. Нет Safari. Один таб. Параллелизация через платный Cloud.\n\nPlaywright: быстрее ~30%, мульти-браузер, мульти-таб, бесплатная параллелизация.\nCypress: проще старт, живая перезагрузка, удобен для SPA.\n\nНа собеседовании: 'Почему Playwright?' — будь готова ответить.",s:["Playwright vs Cypress подробное сравнение","Cypress tutorial для начинающих"]},
  {id:"alt-2",text:"Selenium: что это и зачем знать",time:"1.5ч",desc:"OG-фреймворк (2004). Ещё #1 в enterprise (30K+ компаний). Поддерживает Java/Python/C#/JS.\n\nПочему НЕ основной: медленнее 2x, нет auto-waiting, сложная настройка.\nЧто знать: WebDriver Protocol, Selenium Grid, Appium (мобильное).",s:["Selenium vs Playwright обзор","Selenium WebDriver что это зачем"]},
  {id:"alt-3",text:"Python: базовый синтаксис",time:"2ч",desc:"Второй язык в QA. Нужно уметь ЧИТАТЬ код.\nname = 'Anna' (без let/const)\nif age >= 18: (отступы вместо {})\nfor item in list: (как for...of)\ndef greet(name): return f'Hello, {name}'\n\nQA-инструменты: pytest, requests, Selenium, Playwright (Python-версия).",s:["Python основы за 2 часа","Python для тестировщика обзор"]},
  {id:"alt-4",text:"Jest/Vitest, Appium, Docker (обзоры)",time:"3ч",desc:"Jest — unit-тесты JS: test('adds', () => expect(1+2).toBe(3)). Разработчики пишут unit → QA пишет e2e.\n\nAppium — мобильные нативные приложения (iOS/Android). Playwright только мобильный ВЕБ.\n\nDocker — контейнеризация. Одинаковая среда для всех. Playwright даёт готовый Docker-образ. Для Junior: знать концепцию.\n\nNewman — CLI для Postman (CI/CD интеграция). Альтернативы Postman: Insomnia, Bruno, Thunder Client.",s:["Jest unit тесты обзор","Docker для тестировщика что это","Appium mobile testing overview"]},
];

const SS=[
  {id:"ss-1",text:"Коммуникация с разработчиками",time:"2ч",desc:"✅ 'Обнаружен баг в авторизации' вместо 'Ты сломал логин'\n✅ Конкретика: шаги + скриншот + логи\n✅ Предлагай решения\n✅ Уважай время: гугли 15 мин перед вопросом\n\n'Баг или фича?' → проверь требования → спроси PO → заведи с пометкой 'Requires clarification'. НЕ спорь с разработчиком — эскалируй PM-у.",s:["как тестировщику общаться с разработчиками","QA developer communication skills"]},
  {id:"ss-2",text:"QA-mindset: критическое мышление",time:"1.5ч",desc:"Привычка СОМНЕВАТЬСЯ: что если пустая строка? Что если 0? Двойной клик? Медленный интернет? SQL-инъекция? 200 символов?\n\nРазвивай: тестируй приложения которыми пользуешься (ищи баги!), читай GitHub Issues, играй в 'адвоката дьявола' с требованиями.",s:["QA mindset критическое мышление","edge cases тестирование примеры"]},
  {id:"ss-3",text:"Технический английский",time:"2ч",desc:"Нужно: читать документацию, Stack Overflow, GitHub, понимать ошибки.\nКак: переключи интерфейсы на EN, читай docs на EN, смотри YouTube с субтитрами, Tandem для разговорной.\n\nНе нужен идеальный English. Нужен РАБОЧИЙ.",s:["английский для тестировщика ресурсы","technical English for QA engineers"]},
  {id:"ss-4",text:"Тайм-менеджмент",time:"1ч",desc:"Pomodoro: 25 мин работа → 5 мин перерыв. Rule of 2: не пропускай >2 дней.\nВеди дневник: что выучила сегодня (2–3 пункта).\nGitHub contributions (зелёные квадратики) — визуальная мотивация.\n\n2ч ФОКУСА > 5ч с отвлечениями.",s:["Pomodoro для обучения программирования","как организовать самообучение IT"]},
  {id:"ss-5",text:"Умение задавать вопросы",time:"1ч",desc:"Формула: Что делаю → Что ожидаю → Что получаю → Что пробовала.\n\n❌ 'Playwright не работает'\n✅ 'При page.click(\"#btn\") получаю TimeoutError. Элемент виден в DevTools. Пробовала waitForSelector.'\n\nГде: Stack Overflow, Telegram @qa_chatka @aqa_chatka, Playwright Discord.",s:["как правильно задавать вопросы IT","smart questions developers guide"]},
  {id:"ss-6",text:"Архитектура: фронт/бэк/БД",time:"2ч",desc:"Браузер (HTML/CSS/JS) → HTTP → API (Node.js/Python/Java) → SQL → БД → ответ → JSON → рендер\n\nКогда тестируешь логин: UI (кнопка работает) + API (POST /login → 200 + token) + БД (сессия создана).",s:["клиент серверная архитектура простыми словами","как работает веб приложение для тестировщика"]},
  {id:"ss-7",text:"Работа с требованиями",time:"1.5ч",desc:"User Stories, Acceptance Criteria (Given/When/Then), Figma-макеты, Swagger.\n\nЕсли неясно → спроси PO ДО тестирования → запиши ответ в Jira.\n'Сделай красиво' без конкретики = красный флаг → попроси уточнить.",s:["acceptance criteria примеры Given When Then","как работать с требованиями тестировщик"]},
  {id:"ss-8",text:"Нетворкинг и сообщество",time:"1.5ч",desc:"40–60% вакансий закрываются по рекомендации!\n\nTelegram: @qa_chatka, @aqa_chatka, @qa_sklad\nLinkedIn: подпишись на QA-лидеров, комментируй, делись прогрессом.\nOpen Source: контрибьюти (даже исправление опечатки).\nНапиши статью о своём пути обучения.",s:["QA сообщество Telegram каналы","нетворкинг для Junior IT"]},
  {id:"ss-9",text:"Навык обучения",time:"1ч",desc:"IT меняется быстро. Навык обучения > знание инструмента.\nT-shaped: широко понимаешь (manual, auto, API, perf) + глубоко в одном (Playwright+JS).\nПодкасты, конференции (Heisenbug, SQA Days), блоги.",s:["T-shaped skills developer","QA подкасты конференции 2025"]},
];

const AD=[
  {id:"adv-1",text:"Не учи всё подряд — следуй плану",time:"0.5ч",desc:"'Синдром нового курса': Python → Java → Selenium → Cypress → ничего не знаешь глубоко.\nОДИН стек (JS + Playwright) до конца. Глубина > ширина для Junior.",s:["tutorial hell как избежать","ошибки начинающих тестировщиков"]},
  {id:"adv-2",text:"Практика 80% / Теория 20%",time:"0.5ч",desc:"10 написанных тестов > 10 прочитанных статей.\n1 свой проект > 5 курсов с сертификатами.\nПонимание ПРИХОДИТ через практику, не через чтение.",s:["learning by doing программирование","как эффективно учиться IT"]},
  {id:"adv-3",text:"Ошибки — это обучение",time:"0.5ч",desc:"Красный текст → ПОДСКАЗКА, не катастрофа.\n1. Прочитай ошибку ЦЕЛИКОМ\n2. Найди номер строки\n3. Скопируй → Google\n4. Stack Overflow решит 90%\n\nЧастые: 'Cannot find module' (путь/npm install), 'TimeoutError' (локатор), 'SyntaxError' (скобка/запятая).",s:["как читать ошибки JavaScript","debugging для начинающих"]},
  {id:"adv-4",text:"Учебный распорядок",time:"0.5ч",desc:"Фиксированное время (20:00–22:00). Телефон в ДНД. Наушники + lofi.\nПеред: 5 мин повтори вчера. После: 2 мин запиши что выучила.\nНе пропускай >2 дней. Привычка > мотивация.",s:["как организовать самообучение","atomic habits программирование"]},
  {id:"adv-5",text:"Нетворкинг с ПЕРВОГО дня",time:"1ч",desc:"Не жди 'когда буду готова'. Сейчас!\nTelegram @qa_chatka, LinkedIn, пост 'Начинаю путь в QA!'\nПомогай другим новичкам. Тебя могут пригласить на собеседование.",s:["нетворкинг для Junior IT","QA communities Telegram"]},
  {id:"adv-6",text:"Синдром самозванца — нормально",time:"0.5ч",desc:"'Ничего не знаю' — даже у сеньоров с 10-летним опытом.\nВеди дневник прогресса. Через месяц перечитай — увидишь рост.\n'Я ПОКА не умею, но УЧУСЬ' — правильная формулировка.",s:["синдром самозванца IT как справиться","мотивация начинающего программиста"]},
  {id:"adv-7",text:"Первое собеседование",time:"2ч",desc:"Подготовка: изучи компанию, перечитай свой проект, подготовь 5 вопросов работодателю.\n\nНе знаешь? 'Не сталкивалась, но вот как бы подошла...'\nНЕ блефуй. Задавай уточняющие вопросы. Делай заметки.\nПосле: thank you email + запиши вопросы + подготовь ответы на незнакомые.",s:["первое собеседование QA советы","что говорить на техническом интервью"]},
  {id:"adv-8",text:"Где искать стажировки",time:"1.5ч",desc:"EPAM campus.epam.com — бесплатное обучение + стажировка\nAndersen, Itransition, ISsoft — стажировки\nhh.ru/djinni: фильтр 'стажировка'/'trainee'\nLinkedIn: 'QA intern'\n\nRed flags: неоплачиваемая >1 мес, обязанности мидла, нет ментора.\nРеферал от знакомого в компании — огромный плюс!",s:["стажировки QA Automation Беларусь 2026","EPAM internship QA программа"]},
  {id:"adv-9",text:"Tricky ситуации на собеседовании",time:"1.5ч",desc:"'Нет опыта' → 'Есть проект: 30 тестов, CI/CD, POM. Вот GitHub.'\n'Почему QA, не разработка?' → 'QA видит продукт целиком.'\nLive-coding → Думай вслух. Начни с простого.\nТестовое → Сделай ЛУЧШЕ чем ожидают (POM, README, CI).\nЗарплата → Изучи рынок (djinni, hh). Называй диапазон.\n'Недостаток?' → НЕ 'перфекционист'. ДА 'учусь приоритизировать'.",s:["tricky interview questions QA","тестовое задание QA как выполнить"]},
  {id:"adv-10",text:"Реалистичные ожидания",time:"0.5ч",desc:"⏱ 4 мес обучения + 1–3 мес поиск = нормально\n📨 Первые 2–4 недели без ответов = нормально\n❌ 10–20 отказов до оффера = нормально\n💰 Junior QA (СНГ): $500–1200\n🧠 Первые 1–3 мес на работе будет сложно\n\nНо: после 1 года рост x1.5–2, remote реальность, каждый следующий switch проще!",s:["зарплата Junior QA 2026","карьерный рост QA инженера"]},
];

const G=[
  {t:"QA",d:"Quality Assurance — обеспечение качества"},
  {t:"QC",d:"Quality Control — контроль качества"},
  {t:"AQA",d:"Automation QA — автоматизация тестирования"},
  {t:"SDET",d:"Software Development Engineer in Test"},
  {t:"E2E",d:"End-to-End — полный пользовательский сценарий"},
  {t:"API",d:"Application Programming Interface — интерфейс взаимодействия программ"},
  {t:"REST",d:"Архитектурный стиль API: ресурсы по URL + HTTP-методы"},
  {t:"JSON",d:"Текстовый формат обмена данными: {\"key\":\"value\"}"},
  {t:"HTTP/HTTPS",d:"Протокол передачи данных. S = Secure"},
  {t:"DOM",d:"Document Object Model — древовидная структура HTML-страницы"},
  {t:"CSS-селектор",d:"Выражение для поиска элемента: #id, .class, [attr=value]"},
  {t:"XPath",d:"Язык запросов для поиска элементов в HTML по пути в дереве"},
  {t:"Локатор",d:"Способ найти элемент: getByRole, getByText, CSS, XPath"},
  {t:"POM",d:"Page Object Model — страница = класс с локаторами и методами"},
  {t:"Fixture",d:"Механизм подготовки данных/состояния для тестов"},
  {t:"Assertion",d:"Проверка в тесте: expect(value).toBe(expected)"},
  {t:"Flaky test",d:"Нестабильный тест — падает случайно без изменений кода"},
  {t:"CI/CD",d:"Continuous Integration/Delivery — автосборка, тестирование, деплой"},
  {t:"Pipeline",d:"Цепочка шагов: сборка → тесты → деплой"},
  {t:"Git",d:"Система контроля версий"},
  {t:"PR/MR",d:"Pull/Merge Request — запрос на слияние ветки"},
  {t:"Branch",d:"Ветка Git — независимая линия разработки"},
  {t:"npm",d:"Node Package Manager — менеджер библиотек JS"},
  {t:"Node.js",d:"Среда выполнения JavaScript вне браузера"},
  {t:"async/await",d:"Синтаксис для асинхронного кода JS"},
  {t:"Promise",d:"Объект будущего результата: pending → fulfilled/rejected"},
  {t:"TypeScript",d:"JS + система типов. Ловит ошибки до запуска"},
  {t:"Headless",d:"Браузер без окна — быстрее, для CI"},
  {t:"Sprint",d:"Итерация Scrum (1–4 недели)"},
  {t:"Standup",d:"Ежедневная 15-мин встреча команды"},
  {t:"User Story",d:"Как [роль] я хочу [действие] чтобы [цель]"},
  {t:"Acceptance Criteria",d:"Условия приёмки: Given/When/Then"},
  {t:"Severity",d:"Техническая серьёзность бага"},
  {t:"Priority",d:"Бизнес-приоритет исправления"},
  {t:"Regression",d:"Проверка: не сломалось ли старое после изменений"},
  {t:"Smoke test",d:"Быстрая проверка основного после билда"},
  {t:"Sanity test",d:"Точечная проверка конкретного фикса"},
  {t:"Test case",d:"Шаги + ожидаемый результат для сценария"},
  {t:"Bug report",d:"Документ: шаги, факт vs ожидание, скриншот"},
  {t:"SDLC",d:"Software Development Life Cycle"},
  {t:"Agile/Scrum",d:"Гибкая методология: итерации, церемонии, роли"},
  {t:"SQL",d:"Structured Query Language — запросы к БД"},
  {t:"CRUD",d:"Create, Read, Update, Delete"},
  {t:"JOIN",d:"SQL-объединение данных из нескольких таблиц"},
  {t:"Allure",d:"Фреймворк красивых отчётов тестирования"},
  {t:"Worker",d:"Параллельный поток выполнения тестов"},
  {t:"Mock",d:"Имитация сервиса/ответа для изоляции кода"},
  {t:"Intercept",d:"Перехват сетевого запроса для проверки/модификации"},
  {t:"Endpoint",d:"Точка доступа API: метод + URL"},
  {t:"Token",d:"Строка аутентификации в API"},
  {t:"Status code",d:"Код ответа HTTP: 200, 404, 500..."},
  {t:"DevTools",d:"Инструменты разработчика в браузере (F12)"},
  {t:"Debugging",d:"Отладка — поиск и исправление ошибок"},
  {t:"Refactoring",d:"Улучшение структуры кода без изменения поведения"},
  {t:"DRY",d:"Don't Repeat Yourself — избегай дублирования"},
  {t:"Closure",d:"Замыкание — функция + лексическое окружение"},
  {t:"Event Loop",d:"Stack → Microtasks (Promise) → Macrotasks (setTimeout)"},
  {t:"Swagger",d:"Интерактивная документация API (OpenAPI)"},
  {t:"CORS",d:"Cross-Origin Resource Sharing — кросс-доменные запросы"},
  {t:"SPA",d:"Single Page Application — без перезагрузки (React, Vue, Angular)"},
  {t:"Retries",d:"Автоматический повторный запуск упавшего теста"},
  {t:"Trace",d:"Детальная запись выполнения теста в Playwright"},
  {t:"Reporter",d:"Формат вывода результатов: HTML, Allure, JSON"},
  {t:"Parallel",d:"Параллельное выполнение тестов (workers)"},
  {t:"Data-driven",d:"Тесты с разными наборами входных данных"},
  {t:"WebSocket",d:"Протокол двусторонней связи (чаты, real-time)"},
  {t:"Rate Limiting",d:"Ограничение запросов к API (429)"},
  {t:"Hoisting",d:"Подъём объявлений наверх области видимости"},
  {t:"Scope",d:"Область видимости переменных: global, function, block"},
  {t:"Callback",d:"Функция, переданная как аргумент для вызова позже"},
  {t:"Idempotent",d:"Можно вызвать N раз с одинаковым результатом"},
];

const RS=[
  {c:"Теория QA",i:["Книга Куликова — бесплатная PDF (svyatoslav.biz)","QA Bible — vladislaveremeev.gitbook.io/qa_bible","YouTube: Artsiom Rusau QA Life (175K+, Stepik Awards 2025)","roadmap.sh/qa — визуальная карта навыков"]},
  {c:"JavaScript",i:["learn.javascript.ru — лучший учебник RU","Codewars.com (начни с 8 kyu)","MDN Web Docs — справочник Mozilla"]},
  {c:"Playwright",i:["playwright.dev/docs — официальная документация","YouTube: Commit Quality, LambdaTest","GitHub: microsoft/playwright"]},
  {c:"SQL",i:["sqlbolt.com — интерактивные уроки","sql-ex.ru — задачи (RU)","w3schools.com/sql/trysql — песочница"]},
  {c:"Практика",i:["saucedemo.com — e-commerce для POM","automationexercise.com — магазин + API","uitestingplayground.com — edge cases","the-internet.herokuapp.com, demoqa.com"]},
  {c:"API",i:["reqres.in — REST API для практики","restful-booker.herokuapp.com — CRUD + auth","jsonplaceholder.typicode.com","petstore.swagger.io — Swagger пример"]},
  {c:"Фреймворки (2026)",i:["✅ Playwright — #1: 20-30M загрузок/нед, 290мс/действие","Cypress — для SPA, проще старт, слабее cross-browser","Selenium — enterprise/legacy, Java/Python"]},
  {c:"Сообщество",i:["Telegram: @qa_chatka @aqa_chatka @qa_sklad","Discord: Playwright community","LinkedIn: QA Automation группы"]},
];

function Cv({s=14,c="#484F58"}){return<svg width={s} height={s} viewBox="0 0 16 16"><path d="M4 6l4 4 4-4" stroke={c} strokeWidth={1.5} fill="none" strokeLinecap="round"/></svg>}
function SB({q}){return<a href={`https://www.google.com/search?q=${encodeURIComponent(q)}`} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11,color:"#58A6FF",fontFamily:"'JetBrains Mono',monospace",padding:"2px 7px",background:"#0D1117",borderRadius:4,border:"1px solid #21262D",cursor:"pointer",textDecoration:"none",maxWidth:"100%"}}><svg width={11} height={11} viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}><circle cx="7" cy="7" r="5" stroke="#58A6FF" strokeWidth={1.5}/><path d="M11 11l3.5 3.5" stroke="#58A6FF" strokeWidth={1.5} strokeLinecap="round"/></svg><span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q}</span><svg width={10} height={10} viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}><path d="M5 11L11 5M11 5H6M11 5V10" stroke="#58A6FF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/></svg></a>}

export default function App(){
  const[ck,sC]=useState({});const[ex,sE]=useState({});const[em,sM]=useState({1:true,2:false,3:false,4:false});
  const[tab,sT]=useState("road");const[gf,sG]=useState("");const[ok,sO]=useState(false);const sv2=useRef(null);

  useEffect(()=>{ld().then(s=>{if(s?.ck)sC(s.ck);if(s?.em)sM(s.em);sO(true)});},[]);
  useEffect(()=>{if(!ok)return;clearTimeout(sv2.current);sv2.current=setTimeout(()=>sv({ck,em}),400);},[ck,em,ok]);

  const tg=useCallback(id=>sC(p=>({...p,[id]:!p[id]})),[]);
  const te=useCallback(id=>sE(p=>({...p,[id]:!p[id]})),[]);
  const tm=useCallback(m=>sM(p=>({...p,[m]:!p[m]})),[]);

  const all=[...P.flatMap(m=>m.weeks.flatMap(w=>w.tasks)),...AT,...SS,...AD];
  const tot=all.length,dn=all.filter(t=>ck[t.id]).length,pct=tot?Math.round(dn/tot*100):0;
  const ms=m=>{const t=m.weeks.flatMap(w=>w.tasks),d=t.filter(x=>ck[x.id]).length;return{d,n:t.length,p:t.length?Math.round(d/t.length*100):0,h:t.reduce((a,x)=>a+parseFloat(x.time),0)}};
  const mn="'JetBrains Mono',monospace";

  const rT=(t,c)=>{const d=ck[t.id],o=ex[t.id];return(
    <div key={t.id} style={{borderRadius:7,background:d?c+"06":"transparent"}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:7,padding:"6px 7px",cursor:"pointer"}} onClick={()=>te(t.id)}>
        <div onClick={e=>{e.stopPropagation();tg(t.id)}} style={{width:17,height:17,borderRadius:5,flexShrink:0,marginTop:2,border:d?"none":"2px solid #30363D",background:d?c:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
          {d&&<svg width={10} height={10} viewBox="0 0 12 12" fill="none"><path d="M2.5 6.5L5 9L9.5 3.5" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </div>
        <span style={{flex:1,fontSize:13,lineHeight:"19px",color:d?"#484F58":"#C9D1D9",textDecoration:d?"line-through":"none"}}>{t.text}</span>
        <span style={{fontSize:10,fontFamily:mn,color:"#484F58",background:"#21262D",padding:"2px 5px",borderRadius:3,flexShrink:0}}>{t.time}</span>
        <div style={{transform:o?"rotate(180deg)":"none",transition:"transform .15s",flexShrink:0}}><Cv size={12}/></div>
      </div>
      {o&&<div style={{padding:"2px 7px 10px 32px"}}>
        <p style={{fontSize:12,lineHeight:"17px",color:"#8B949E",margin:"0 0 8px",whiteSpace:"pre-line"}}>{t.desc}</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{t.s.map((q,i)=><SB key={i} q={q}/>)}</div>
      </div>}
    </div>
  )};
  const rM=m=><div key={m.id} style={{background:m.c+"10",border:`1px solid ${m.c}30`,borderRadius:8,padding:"10px 14px",margin:"8px 0"}}><div style={{fontSize:13,lineHeight:"20px",color:m.c}}>{m.text}</div></div>;

  const TABS=[{id:"road",i:"🗺️",l:"Роадмап"},{id:"alt",i:"🔀",l:"Альтернативы"},{id:"soft",i:"🤝",l:"Soft Skills"},{id:"tips",i:"💡",l:"Советы"},{id:"dict",i:"📖",l:"Словарь"},{id:"res",i:"📚",l:"Ресурсы"}];

  if(!ok)return<div style={{background:"#0D1117",color:"#8B949E",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>Загрузка...</div>;

  return(
    <div style={{fontFamily:"'IBM Plex Sans','Segoe UI',system-ui,sans-serif",background:"#0D1117",color:"#E6EDF3",minHeight:"100vh",paddingBottom:20}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#161B22}::-webkit-scrollbar-thumb{background:#30363D;border-radius:3px}`}</style>
      <div style={{position:"sticky",top:0,zIndex:100,background:"#0D1117ee",backdropFilter:"blur(8px)",borderBottom:"1px solid #21262D",padding:"8px 0 0"}}>
        <div style={{maxWidth:780,margin:"0 auto",padding:"0 10px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <div><span style={{fontSize:15,fontWeight:700}}>AQA Roadmap</span><span style={{fontSize:10,color:"#484F58",fontFamily:mn,marginLeft:6}}>v5 · {dn}/{tot}</span></div>
            <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:80,height:6,background:"#21262D",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",borderRadius:3,background:pct===100?"#3CC78C":"linear-gradient(90deg,#E86F3C,#3C8CE8,#8C3CE8,#3CC78C)",backgroundSize:"400%",width:`${pct}%`,transition:"width .5s"}}/></div><span style={{fontSize:10,fontFamily:mn,color:"#8B949E"}}>{pct}%</span></div>
          </div>
          <div style={{display:"flex",gap:2,overflowX:"auto",paddingBottom:8}}>
            {TABS.map(t=><button key={t.id} onClick={()=>sT(t.id)} style={{background:tab===t.id?"#21262D":"transparent",border:"none",borderRadius:"6px 6px 0 0",padding:"6px 8px",cursor:"pointer",color:tab===t.id?"#E6EDF3":"#8B949E",fontSize:11,fontWeight:tab===t.id?600:400,whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:3,borderBottom:tab===t.id?"2px solid #58A6FF":"2px solid transparent"}}><span style={{fontSize:12}}>{t.i}</span>{t.l}</button>)}
          </div>
        </div>
      </div>
      <div style={{maxWidth:780,margin:"0 auto",padding:"14px 10px 0"}}>
      {tab==="road"&&<>{rM(M[0])}{P.map((mo,mi)=>{const st=ms(mo),isE=em[mo.month];return(<div key={mo.month} style={{marginBottom:10}}>
        <button onClick={()=>tm(mo.month)} style={{width:"100%",background:"#161B22",border:"1px solid #21262D",borderRadius:isE?"10px 10px 0 0":10,padding:"12px 14px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:8,background:mo.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:mo.color,fontFamily:mn,flexShrink:0}}>{mo.month}</div>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"#E6EDF3"}}>{mo.title}</div><div style={{fontSize:10,color:"#484F58"}}>{st.d}/{st.n} · ~{st.h}ч</div></div>
          <div style={{width:38,height:38,position:"relative",flexShrink:0}}><svg width={38} height={38} viewBox="0 0 38 38"><circle cx={19} cy={19} r={15} fill="none" stroke="#21262D" strokeWidth={2.5}/><circle cx={19} cy={19} r={15} fill="none" stroke={mo.color} strokeWidth={2.5} strokeDasharray={`${st.p*.942} 94.2`} strokeLinecap="round" transform="rotate(-90 19 19)" style={{transition:"stroke-dasharray .5s"}}/></svg><div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:600,fontFamily:mn,color:st.p===100?mo.color:"#8B949E"}}>{st.p}%</div></div>
          <div style={{transform:isE?"rotate(180deg)":"none",transition:"transform .2s"}}><Cv/></div>
        </button>
        {isE&&<div style={{background:"#161B22",border:"1px solid #21262D",borderTop:"none",borderRadius:"0 0 10px 10px",padding:"4px 14px 12px"}}>
          {mo.weeks.map((w,wi)=><div key={wi} style={{marginTop:wi>0?14:4}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
              <span style={{fontSize:10,fontWeight:600,fontFamily:mn,color:mo.color,background:mo.color+"15",padding:"2px 6px",borderRadius:3}}>{w.week}</span>
              <span style={{fontSize:11,color:"#8B949E"}}>{w.sub}</span>
            </div>
            {w.tasks.map(t=>rT(t,mo.color))}
          </div>)}
        </div>}
        {mi===0&&rM(M[1])}{mi===1&&rM(M[2])}{mi===2&&rM(M[3])}
      </div>)})}{rM(M[4])}</>}

      {tab==="alt"&&<><p style={{fontSize:13,color:"#8B949E",marginBottom:10}}>Обзорное знакомство — для кругозора и собеседований. Глубоко НЕ нужно.</p>{rM({id:"ma",text:"🧭 Твой основной стек — Playwright + JS/TS. Остальное — для общего развития!",c:"#F0883E"})}{AT.map(t=>rT(t,"#F0883E"))}</>}

      {tab==="soft"&&<><p style={{fontSize:13,color:"#8B949E",marginBottom:10}}>Технические навыки — 50% успеха. Вторые 50% — коммуникация и мышление.</p>{rM({id:"ms",text:"🌈 Soft skills развиваются с практикой. Осознанность — уже половина дела!",c:"#D2A8FF"})}{SS.map(t=>rT(t,"#D2A8FF"))}</>}

      {tab==="tips"&&<><p style={{fontSize:13,color:"#8B949E",marginBottom:10}}>Практические советы от тех кто прошёл этот путь.</p>{rM({id:"t1",text:"💖 Ты уже на правильном пути! Сам факт что ты учишься — говорит о целеустремлённости!",c:"#F778BA"})}{AD.slice(0,5).map(t=>rT(t,"#F778BA"))}{rM({id:"t2",text:"🌟 В начале НОРМАЛЬНО чувствовать себя потерянной. Через 2–3 месяца всё встанет на свои места. Обещаю!",c:"#F0883E"})}{AD.slice(5).map(t=>rT(t,"#F778BA"))}{rM({id:"t3",text:"🚀 Каждый отказ — БЕСПЛАТНАЯ тренировка. Следующее собеседование будет ЛУЧШЕ!",c:"#3CC78C"})}</>}

      {tab==="dict"&&<><input value={gf} onChange={e=>sG(e.target.value)} placeholder={`Поиск среди ${G.length} терминов...`} style={{width:"100%",background:"#161B22",border:"1px solid #21262D",borderRadius:8,padding:"10px 14px",color:"#E6EDF3",fontSize:13,fontFamily:"inherit",outline:"none",marginBottom:10}}/>
        <div style={{background:"#161B22",borderRadius:10,border:"1px solid #21262D",padding:"8px 14px",maxHeight:"calc(100vh - 150px)",overflowY:"auto"}}>
          {(gf?G.filter(g=>g.t.toLowerCase().includes(gf.toLowerCase())||g.d.toLowerCase().includes(gf.toLowerCase())):G).map((g,i,a)=><div key={i} style={{padding:"7px 0",borderBottom:i<a.length-1?"1px solid #21262D":"none"}}><span style={{fontWeight:600,color:"#58A6FF",fontSize:12,fontFamily:mn}}>{g.t}</span><span style={{color:"#484F58"}}> — </span><span style={{color:"#8B949E",fontSize:12}}>{g.d}</span></div>)}
        </div></>}

      {tab==="res"&&<>{RS.map((r,i)=><div key={i} style={{background:"#161B22",borderRadius:10,border:"1px solid #21262D",padding:"12px 14px",marginBottom:8}}>
        <div style={{fontSize:11,fontWeight:600,color:"#8B949E",marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>{r.c}</div>
        {r.i.map((x,j)=><div key={j} style={{fontSize:12,color:"#C9D1D9",padding:"3px 0 3px 10px",borderLeft:"2px solid #21262D",lineHeight:"18px"}}>{x}</div>)}
      </div>)}</>}

      <div style={{textAlign:"center",marginTop:20}}><div style={{fontSize:10,color:"#21262D",fontFamily:mn}}>прогресс сохраняется автоматически</div></div>
      </div>
    </div>
  );
}
