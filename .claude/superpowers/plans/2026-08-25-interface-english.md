# Interface English — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Собрать одностраничное приложение-урок на 90 минут, которое учит взрослого ученика A2+ читать незнакомые англоязычные интерфейсы — его рабочий CAD-просмотрщик, сайты производителей фурнитуры и меню игры.

**Architecture:** Один самодостаточный `index.html` без сборки и без сетевых запросов: один `<style>`, один `<script>` (ES5, `"use strict"`), состояние в `localStorage`. Десять линейных блоков-секций, наполняемых из одного массива данных общим движком упражнений. Отдельный статический документ `teacher/index.html` в стиле `lera` — конспект преподавателя.

**Tech Stack:** Vanilla HTML/CSS/ES5. `speechSynthesis` для озвучки. `localStorage` для прогресса. Только системные шрифты. Никаких библиотек, CDN и внешних шрифтов.

**Spec:** `.claude/superpowers/specs/2026-08-25-interface-english-design.md`

**Research:** `.claude/superpowers/research/00-student-brief-and-screenshots.md` (бриф и разбор скриншотов) · `01-existing-apps-patterns.md` (house style, §5.1 и §5.2 — обязательны к прочтению) · `02-chat-history-methodology.md` (§9 DO/DON'T) · `03-work-websites-vocabulary.md` (лексика camar/salice) · `04-interface-english-corpus.md` (весь учебный корпус)

## Global Constraints

- **Ноль сетевых запросов.** Никаких CDN, библиотек, Google Fonts, внешних картинок. Файл должен полностью работать из `file://`.
- **Один файл** `interface-english/index.html`: один `<style>` в `<head>`, один `<script>` перед `</script></body>`. Плюс `favicon.svg`. Плюс `interface-english/teacher/index.html`.
- **JS в ES5:** `var`, `function`, `.forEach`, без стрелок, без `let/const`, без шаблонных строк, без `class`. Первая строка скрипта — `"use strict";`.
- **Светлая тема** приложения. Тёмные и серые палитры — только внутри макетов (`.mock-*`), изолированно.
- **Русский перевод скрыт по умолчанию** и раскрывается точечно, по клику на конкретном месте. Глобального тумблера нет.
- **Уровень A2+:** объяснения по-английски, перевод в скобках; класс `.ru` — мельче и глуше основного текста.
- **Обращение к ученику — мужской род, на «ты»**, по имени, введённому на первом экране.
- **Фидбек четырьмя состояниями:** `ok` / `near` (янтарный) / `bad` / `hint`. Балл только за первую попытку. При верном ответе всегда объясняется, почему.
- **Ни таймеров, ни штрафов, ни тупиков.** Из каждого упражнения есть выход: `Hint` по кнопке, автоподсказка на 3-й попытке, ответ на 5-й — без штрафа.
- **`prefers-reduced-motion`** глушит все анимации. `:hover` только внутри `@media (hover:hover)`.
- **Десктоп-первый**, но touch-safe: `-webkit-tap-highlight-color:transparent`, `touch-action:manipulation`, шрифт `input` ≥ 17px.
- **Тайминг в заголовке каждого блока** (`12 мин`). Резервные упражнения помечены `EXTRA` и свёрнуты.
- **Git:** ветка `master` не защищена (файла `.claude/protected-branches` в репозитории нет, значит по умолчанию защищён только `dev`). Коммиты одной строкой. **Пуш не делать ни под каким видом.**

---

## File Structure

| Файл | Ответственность |
|---|---|
| `interface-english/index.html` | Приложение целиком: разметка каркаса, все стили, движок упражнений, данные всех десяти блоков. Ожидаемый размер 110–140 KB |
| `interface-english/favicon.svg` | Иконка 32×32 в палитре приложения, рукописная |
| `interface-english/teacher/index.html` | Конспект преподавателя: тайминги, ключи ответов, устные вопросы, что резать |

Внутри `index.html` порядок блоков фиксирован: `<head>` → `<style>` → каркас `<body>` → `<script>`: `STATE/STORE` → движок → `DATA` → рендер → `boot()`.

---

## Task 1: Каркас, палитра, состояние

**Files:**
- Create: `interface-english/index.html`
- Create: `interface-english/favicon.svg`

**Interfaces:**
- Produces: `S` (объект состояния), `save()`, `boot()`, `el(tag, cls, txt)`, `qs(sel)`, `setProgress()`, `toast(msg, kind)`

- [ ] **Step 1: Создать `favicon.svg`** — 32×32, курсор-стрелка поверх скруглённого прямоугольника-кнопки, палитра приложения (indigo `#4F46E5` + янтарный `#F59E0B`).

- [ ] **Step 2: Написать `<head>` и `:root`**

```css
:root{
  --bg:#F7F8FA; --card:#FFFFFF; --line:#E3E6EC;
  --ink:#16181D; --ink-soft:#4A5060; --ink-muted:#7A8194;
  --acc:#4F46E5; --acc-ink:#3730A3; --acc-tint:#EEF0FE;
  --ok:#12866F; --ok-ink:#0B5E4E; --ok-tint:#E6F6F2;
  --near:#B4690E; --near-ink:#8A5009; --near-tint:#FDF3E3;
  --bad:#C0392B; --bad-ink:#8E2A20; --bad-tint:#FBEDEB;
  --r:18px; --r-sm:12px;
  --shadow:0 1px 2px rgba(16,18,29,.06),0 8px 24px rgba(16,18,29,.06);
  --ease:cubic-bezier(.33,1,.68,1);
}
```

Шрифты — системные, три роли: `--font-display` (заголовки), `--font-ui` (русские объяснения), `--font-mono` (английский материал интерфейса: `ui-monospace, "SF Mono", Consolas, monospace`).

- [ ] **Step 3: Каркас `<body>`** — flex-колонка на `100dvh`, `overflow:hidden`. Фиксированная шапка `flex:0 0 auto` с названием, полосой прогресса, счётом и кнопкой сброса. Единственный скроллер `main` — `flex:1 1 auto; min-height:0; overscroll-behavior-y:contain`. Контейнер `max-width:860px`.

- [ ] **Step 4: Состояние и сохранение**

```js
var KEY="interface-english-v1";
var S={name:"",score:0,seen:0,ans:{},done:{},mistakes:[],revealed:{}};
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
function boot(){
  try{var raw=localStorage.getItem(KEY);if(raw)S=JSON.parse(raw);}catch(e){}
  if(!S.ans)S.ans={}; if(!S.done)S.done={}; if(!S.mistakes)S.mistakes=[];
  if(!S.revealed)S.revealed={};
  renderAll(); restoreAnswers(); setProgress();
}
```

- [ ] **Step 5: Проверка** — открыть файл в браузере: шапка на месте, полоса прогресса на нуле, страница скроллится только в `main`, консоль без ошибок. Ввести имя, перезагрузить — имя сохранилось.

- [ ] **Step 6: Commit** — `git -C C:/Repositories/charnou.github.io add interface-english && git -C C:/Repositories/charnou.github.io commit -m "feat(interface-english): app shell, palette, persisted state"`

---

## Task 2: Движок упражнений

**Files:**
- Modify: `interface-english/index.html` (секция `<script>`, после состояния)

**Interfaces:**
- Consumes: `S`, `save()`, `el()`, `setProgress()`
- Produces:
  - `settle(id, correct, opts)` — единая точка вердикта. `opts:{explain, near, right, mine, block}`
  - `mc(spec)` — множественный выбор. `spec:{id,q,ru,items:[{t,ok,why}],block}`
  - `match(spec)` — сопоставление тапами. `spec:{id,left:[],right:[],pairs:{},block}`
  - `hotspot(spec)` — «куда нажать». `spec:{id,task,mock,zones:[{sel,ok,why}],block}`
  - `stack(spec)` — декодер стеков. `spec:{id,phrase,order:[],ru,block}`
  - `gap(spec)` — пропуск в предложении. `spec:{id,before,after,chips:[],ok,why,block}`
  - `findErr(spec)` — «найди ошибку» в два хода. `spec:{id,tokens:[],badIndex,fix,block}`
  - `ruSpan(text)` — точечный reveal: `<span class="ru-hide" role="button">` открывает перевод по клику
  - `sayBtn(word)` — кнопка 🔊 через `speechSynthesis`, голос `en-GB`
  - `hintChain(id, hints)` — эскалация подсказок
  - `section(spec)` — секция-блок. `spec:{id,n,title,mins,lead,items:[]}`

- [ ] **Step 1: `settle()` — вердикт, баллы, журнал ошибок**

```js
function settle(id,correct,o){
  o=o||{}; var first=!S.ans[id];
  if(first){S.seen++; if(correct)S.score++;}
  S.ans[id]={ok:correct,at:1};
  if(!correct&&first){
    S.mistakes.push({id:id,block:o.block||"",q:o.q||"",mine:o.mine||"",right:o.right||"",why:o.explain||""});
  }
  save(); setProgress();
  return first;
}
```

- [ ] **Step 2: `ruSpan()` — точечный reveal перевода**

```js
function ruSpan(text){
  var s=el("span","ru-hide","показать перевод");
  s.setAttribute("role","button"); s.setAttribute("tabindex","0");
  function open(){s.className="ru";s.textContent=text;}
  s.addEventListener("click",open);
  s.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();open();}});
  return s;
}
```

- [ ] **Step 3: `sayBtn()` — озвучка**

```js
function sayBtn(word){
  var b=el("button","say","🔊"); b.type="button";
  b.setAttribute("aria-label","Listen: "+word);
  b.addEventListener("click",function(){
    try{
      var u=new SpeechSynthesisUtterance(word);
      u.lang="en-GB"; u.rate=.9;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    }catch(e){}
  });
  return b;
}
```

- [ ] **Step 4: `mc()`, `match()`, `gap()`, `findErr()`, `stack()`** — каждая рисует карточку с заголовком задания, вариантами и областью фидбека. Все зовут `settle()`. Неверный ответ подсвечивается `bad`, близкий — `near`, и **всегда** показывает `why`. Задание не блокируется после ошибки.

- [ ] **Step 5: `hotspot()` — главная механика**

Принимает готовый DOM-узел макета (`mock`) и список зон. Ставит обработчик на макет через делегирование по `data-zone`. Клик по зоне с `ok:true` — верно; по любой другой — показывает `why` («это бы свернуло окно, а не сохранило файл»), не блокируя повтор.

- [ ] **Step 6: `section()` и `EXTRA`** — секция с номером, названием, таймингом в заголовке, вводной строкой и списком упражнений. Упражнение с `extra:true` уходит в свёрнутый `<details>` с надписью «EXTRA — если есть время».

- [ ] **Step 7: Проверка** — временно отрендерить по одному упражнению каждого типа. Проверить: верный/неверный/близкий ответы дают разные цвета; счёт растёт только с первой попытки; после перезагрузки ответы восстановлены; 🔊 произносит; клик по «показать перевод» раскрывает только этот перевод.

- [ ] **Step 8: Commit** — `git ... commit -m "feat(interface-english): exercise engine — mc, match, hotspot, stack, gap, find-error"`

---

## Task 3: Блоки 0–1 — вход и ядро кнопок (16 мин, 10 упр.)

**Files:**
- Modify: `interface-english/index.html` (`DATA`)

**Interfaces:**
- Consumes: весь движок из Task 2

- [ ] **Step 1: Блок 0 — вход (4 мин)** — поле имени как первое задание на чтение формы (`Required field`, `*`, `Submit`). Три правила карточками: глаголы на кнопках / существительные на вкладках; любая кнопка — одно из четырёх (agree / refuse / postpone / leave); `Esc` и `X` всегда безопасны.

- [ ] **Step 2: Блок 1 — The Base (12 мин, 8 упр.)** — ~40 слов из §1 корпуса, сгруппированных по четырём семьям, у каждого 🔊 и точечный перевод. Упражнения: сортировка слов по четырём семьям (`match`), 3× `mc` на «что произойдёт», `gap` на диалоговый шаблон, `findErr`, 2× `EXTRA`.

- [ ] **Step 3: Речевой блок** — спойлер «Talk to your tutor»: «открой любую программу и назови мне по-английски четыре кнопки, которые ты видишь».

- [ ] **Step 4: Проверка** — пройти оба блока целиком, проверить счёт и тайминги, консоль чистая.

- [ ] **Step 5: Commit** — `git ... commit -m "feat(interface-english): blocks 0-1 — start screen and button core"`

---

## Task 4: Блок 2 — опасные пары (12 мин, 8 упр.)

**Files:**
- Modify: `interface-english/index.html` (`DATA`)

- [ ] **Step 1: Десять пар** из §2 корпуса, каждая с различителем в одну строку: `Cancel/Close/Dismiss`, `Delete/Remove/Clear`, `Save/Apply/OK`, `Allow/Enable`, `Deny/Block/Reject/Decline`, `Sign in/Sign up`, `Undo/Reset/Restore defaults`, `Discard/Delete`, `Hide/Close`, `Export/Download`.

- [ ] **Step 2: Упражнения** — 4× `mc` в формате «ситуация → какая кнопка», 2× `match` (пара ↔ различитель), 1× `findErr` («Remove file» вместо «Delete file»), 1× `gap`. Плюс 3 `EXTRA` на пары `Continue/Next/Proceed`, `Custom/Default`, `Log in / login`.

- [ ] **Step 3: Проверка** — неверный ответ показывает различитель, а не просто «неверно».

- [ ] **Step 4: Commit** — `git ... commit -m "feat(interface-english): block 2 — dangerous pairs"`

---

## Task 5: Блок 3 — диалоги и разрешения (12 мин, 7 упр.)

**Files:**
- Modify: `interface-english/index.html` (`DATA` + `.mock-dialog` в `<style>`)

- [ ] **Step 1: Пять живых макетов** — cookie-баннер (`Accept all / Reject all / Manage preferences`), разрешение камеры (по Firefox как эталону, вторым примером — Chrome с пометкой, что формулировки у браузеров разные), `Are you sure you want to delete…? This action cannot be undone.`, `Changes you made may not be saved`, шаг установщика (`I accept the terms…`, `Custom installation`, `Create a desktop shortcut`).

- [ ] **Step 2: Упражнения** — 4× `hotspot` («откажись от всех cookie, кроме необходимых», «выйди, ничего не удаляя»), 2× `gap` на шаблоны фраз, 1× `mc` на разницу «круг = одно, квадрат = сколько хочешь».

- [ ] **Step 3: Капля грамматики** — `will be lost` (пассив), `want to + verb`, `cannot be undone`.

- [ ] **Step 4: Проверка** — макеты выглядят узнаваемо, `hotspot` реагирует на все зоны, неверная зона объясняет последствие.

- [ ] **Step 5: Commit** — `git ... commit -m "feat(interface-english): block 3 — dialogs, cookie banners, permissions"`

---

## Task 6: Блок 4 — лента Creo View Lite (18 мин, 10 упр.)

**Files:**
- Modify: `interface-english/index.html` (`DATA` + `.mock-ribbon` в `<style>`)

- [ ] **Step 1: Макет вкладки Home** — точно по скриншоту: вкладки `File · Home · Markup · Tools · Sectioning · Animation`; группы `Views`, `Selection` (`Find`, `Select Mode ▾`), `Navigation` (`Zoom All`, `Zoom Window`, `Zoom Selected`, `Spin Center ▾`, `Orientation`), `Display` (`Hide Selected`, `Show`, `Unhide All`, `Isolate`, `Render Mode ▾`, `Filters`, `Thumbnail`), `Location` (`Transform`, `Preset Explode`, `Restore Location`, `Capture Location`); нижние вкладки `Viewables · Annotation Sets · Structure · Model`. **Серые кнопки серые** — `Hide Selected`, `Show`, `Isolate`, `Thumbnail`, `Zoom Selected`.

- [ ] **Step 2: Макет вкладки Markup** — `Annotations` (`Note`, `Leader Line`, `Shape ▾`, `Freehand`, `Gtol`, `Stamp` серый) и `Measurements` (`Summary`, `Length`, `Distance`, `Angle`, `Diameter`, `Area`, `Mass Properties`, `Envelope`).

- [ ] **Step 3: Упражнения** — 4× `hotspot` («покажи только выбранную деталь», «измерь расстояние между двумя точками», «верни всё спрятанное», «поставь подпись с выносной линией»), 1× `mc` «почему `Show` серая» (ответ: ничего не выделено — серое значит недоступно, не сломано), 2× `stack` (`Mass Properties`, `Annotation Sets`, `Spin Center`), 1× `match` (`Isolate`↔`Hide` как зеркальные операции, `Capture`↔`Restore`), 1× `mc` на приставку `un-`, 1× `mc` `Length` vs `Distance`. Плюс 4 `EXTRA`.

- [ ] **Step 4: Речевой блок** — «расскажи по-английски, что ты делаешь в Creo первым делом, когда открываешь модель».

- [ ] **Step 5: `Gtol`** — подаём как `Geometric Tolerance` / геометрический допуск, без категоричности (источник вторичный).

- [ ] **Step 6: Проверка** — обе вкладки переключаются, серые кнопки не реагируют на клик как верные, tooltip по наведению работает.

- [ ] **Step 7: Commit** — `git ... commit -m "feat(interface-english): block 4 — Creo View ribbon"`

---

## Task 7: Блок 5 — сайты производителей (14 мин, 8 упр.)

**Files:**
- Modify: `interface-english/index.html` (`DATA` + `.mock-site` в `<style>`)

- [ ] **Step 1: Макет camar.it** — `HOME · COMPANY · PRODUCTS ▾ · WARNING · CONTACTS` + флаги, и раскрытое мега-меню восемью колонками (`Levellers`, `Plinth legs`, `Hanging brackets for wall units`, `Base cabinet hanging brackets`, `Panel hanging brackets`, `Shelf support`, `Table legs`, `Systems`) с их пунктами.

- [ ] **Step 2: Макет salice.com** — служебная строка (`Technical Services · Press Area · Job Opportunities · Sustainability · Subscribe to our newsletter · International / EN`) и основная (`Company · Products · Inspire me · Magazine · Distribution · Download · Contact us · Configurators · Search`).

- [ ] **Step 3: Четыре ловушки** — `Magazine` ≠ магазин; `WARNING` = калькулятор допустимой нагрузки, и страница наполовину осталась итальянской; `CATALOGUE` → `COMING SOON`, то есть задача «скачай каталог» не выполняется и правильный ответ — фраза для письма менеджеру; `Opening angle: Great` = «большой», итальянизм от *grande*.

- [ ] **Step 4: Упражнения** — 3× `hotspot` («найди, где скачать инструкцию по монтажу», «найди дистрибьютора в своей стране», «переключи язык»), 2× `mc` на ловушки, 1× `match` (ярлык ↔ что за ним), 1× `mc` «два уровня меню: где искать про товар, где про компанию», 1× `gap` — письмо менеджеру про отсутствующий каталог. Плюс 3 `EXTRA`, включая `Whistleblowing` в подвале.

- [ ] **Step 5: Речевой блок** — «объясни мне по-английски, что ты ищешь на сайте поставщика чаще всего».

- [ ] **Step 6: Проверка** — мега-меню раскрывается, ловушки объясняются при неверном клике.

- [ ] **Step 7: Commit** — `git ... commit -m "feat(interface-english): block 5 — manufacturer websites"`

---

## Task 8: Блок 6 — лексика фурнитуры (10 мин, 6 упр.)

**Files:**
- Modify: `interface-english/index.html` (`DATA`)

- [ ] **Step 1: Пятёрка расположения** — `visible / concealed / flush / inset / jutting`, каждое с 🔊, точечным переводом и схематичным SVG-пояснением (деталь относительно панели).

- [ ] **Step 2: Стеки существительных** — `Base cabinet hanging brackets`, `Hanging brackets for wall units`, `legs with separate fixing socket`, `System for flap doors with upward or downward opening`. Правило: последнее слово главное, читать справа налево.

- [ ] **Step 3: `cabinet` ≠ кабинет** — критичный ложный друг для мебельщика. Плюс `velvet` ≠ вельвет (бархат), `fabric` ≠ фабрика (ткань).

- [ ] **Step 4: Упражнения** — 2× `stack`, 1× `match` (слово ↔ схема), 2× `mc` на ложных друзей, 1× `findErr`. Плюс 2 `EXTRA` (`soft close`, `drawer runner`, `levellers` BrE/AmE).

- [ ] **Step 5: Проверка** — SVG-схемы читаются, стеки собираются в правильном порядке.

- [ ] **Step 6: Commit** — `git ... commit -m "feat(interface-english): block 6 — furniture hardware vocabulary"`

---

## Task 9: Блок 7 — меню настроек игры (10 мин, 6 упр.)

**Files:**
- Modify: `interface-english/index.html` (`DATA` + `.mock-game` в `<style>`)

- [ ] **Step 1: Макет Witcher 3** — тёмный, по скриншоту: левое меню `AUDIO · CONTROL SETTINGS · CONTROLLER SCHEME · KEY BINDINGS · GAMEPLAY · VIDEO · LANGUAGE · CREDITS · BACK`, девять строк GAMEPLAY со своими значениями (`On`, `Off`, `Standard`, `10`).

- [ ] **Step 2: Три ловушки** — `Turn off Witcher Senses "fish-eye" effect` в положении `Off` (двойное отрицание: эффект включён); `CREDITS` ≠ кредиты; `Autosave Interval (Minutes)` — скобки задают единицу измерения.

- [ ] **Step 3: Упражнения** — 2× `hotspot` («выключи подсказки на экране», «найди, где менять назначение клавиш»), 1× `mc` на двойное отрицание, 1× `match` (`Automatic`↔`Manual` и другие пары), 1× `stack` (`Automatic camera centering`), 1× `mc` на тип контрола (toggle / выбор / число). Плюс 3 `EXTRA` из глоссария Video/Audio.

- [ ] **Step 4: Речевой блок** — «расскажи, какие настройки ты меняешь первым делом в новой игре».

- [ ] **Step 5: Проверка** — макет узнаваем, двойное отрицание объясняется явно.

- [ ] **Step 6: Commit** — `git ... commit -m "feat(interface-english): block 7 — game settings menu"`

---

## Task 10: Блок 8 — финальный челлендж (6 мин, 3 упр.)

**Files:**
- Modify: `interface-english/index.html` (`DATA`)

- [ ] **Step 1: Три незнакомых экрана, по одному заданию каждый** — установщик программы; третий сайт производителя фурнитуры (не camar и не salice); окно ошибки Windows (`Not responding`, `Access denied`, `Insufficient permissions`).

- [ ] **Step 2: Режим без подсказок** — задание формулируется как «примени алгоритм 60 секунд»: найди выход, прочитай заголовок, найди основную кнопку, проверь на отрицание. Подсказки доступны, но спрятаны глубже обычного.

- [ ] **Step 3: Проверка** — экраны действительно не встречались в блоках 0–7.

- [ ] **Step 4: Commit** — `git ... commit -m "feat(interface-english): block 8 — final challenge"`

---

## Task 11: Блок 9 — разбор ошибок и печатная шпаргалка

**Files:**
- Modify: `interface-english/index.html` (`DATA`, `<style>` — блок `@media print`)

- [ ] **Step 1: Разбор ошибок** — из `S.mistakes`: группировка по блокам, на каждую ошибку три строки (вопрос / «твой вариант» красным / «правильно» зелёным) плюс объяснение. Если ошибок нет — честная строка об этом, а не пустой экран.

- [ ] **Step 2: Шпаргалка** — одна страница: 4 семьи кнопок, 10 опасных пар одной строкой каждая, алгоритм «незнакомый экран за 60 секунд», сигналы (серое = недоступно, `…` = будет ещё окно, круг = одно, квадрат = сколько хочешь), маркеры отрицания (`off`, `don't`, `un-`, `dis-`, `no`, `never`), правило стека справа налево.

- [ ] **Step 3: `@media print`** — печатается только шпаргалка и разбор ошибок; шапка, полоса прогресса, кнопки и макеты скрыты. Проверить через предпросмотр печати, что влезает и не рвётся.

- [ ] **Step 4: Финальный экран** — обращение по имени, счёт, вердикт тремя уровнями, и явная инструкция, что делать со шпаргалкой.

- [ ] **Step 5: Commit** — `git ... commit -m "feat(interface-english): block 9 — mistake review and printable cheat sheet"`

---

## Task 12: Страница преподавателя

**Files:**
- Create: `interface-english/teacher/index.html`

- [ ] **Step 1: Документ в стиле `lera`** — статичная страница-конспект, светлая, без тренажёра.

- [ ] **Step 2: Содержание** — таблица таймингов с накопительной суммой; ключи ответов ко всем упражнениям с их `id`; устные вопросы для каждого речевого блока; «если не успеваем» — порядок урезания блоков; «если справляется быстро» — какие `EXTRA` открыть; список ловушек с объяснением, зачем каждая; раздел «проверить в живой программе» со всеми `UNSURE` из исследования (`Thumbnail` и `Summary` в Creo, формулировки разрешений в текущем Chrome, `Automatic camera centering`).

- [ ] **Step 3: Проверка** — ключи ответов совпадают с реальными `ok:true` в `DATA`. Сверить построчно, это главный риск расхождения.

- [ ] **Step 4: Commit** — `git ... commit -m "feat(interface-english): teacher notes page"`

---

## Task 13: Приёмка

**Files:**
- Modify: `interface-english/index.html` (правки по итогам)

- [ ] **Step 1: Прогон целиком** — пройти все десять блоков от начала до конца, отвечая и верно, и неверно.

- [ ] **Step 2: Чек-лист**
  - консоль без ошибок и предупреждений;
  - счёт растёт только с первой попытки, повторная не добавляет;
  - перезагрузка на середине возвращает на то же место со всеми ответами;
  - сброс просит подтверждение и действительно чистит;
  - ни одно упражнение не блокируется после ошибки;
  - каждый неверный ответ объясняет, почему;
  - перевод раскрывается точечно и только в своём месте;
  - 🔊 работает; при отсутствии голоса `en-GB` не падает;
  - `file://` — работает без сети (проверить с выключенным Wi-Fi);
  - предпросмотр печати даёт чистую шпаргалку;
  - сумма таймингов в заголовках блоков ≈ 90–105 мин;
  - число упражнений: ~50 основных плюс резерв.

- [ ] **Step 3: Ширина** — проверить на 1280px и 1920px. Макеты ленты и мега-меню не должны рвать вёрстку; при нехватке ширины скроллятся внутри своего контейнера, а не тянут страницу.

- [ ] **Step 4: Отчёт** — списком `✅`/`❌`, с реальным числом упражнений и суммой таймингов. Пуш не делать — отдать ссылку и сказать, что пуш за владельцем.

- [ ] **Step 5: Commit** — `git ... commit -m "fix(interface-english): acceptance pass"`

---

## Self-Review

**Покрытие спеки.** Все десять блоков раздела 3 спеки имеют задачу (Task 3–11). Все механики раздела 4 реализуются в Task 2. Технические решения раздела 5 распределены: house style и `localStorage` — Task 1, печать — Task 11, `favicon.svg` — Task 1, страница преподавателя — Task 12. Риск с `UNSURE` из раздела 6 закрыт в Task 12 Step 2. Открытый вопрос раздела 7 (формулировки разрешений) закрыт в Task 5 Step 1.

**Расхождение со спекой, внесённое сознательно:** блок 8 в спеке был «установщик», по решению преподавателя стал «все три экрана, по одному заданию» — отражено в Task 10.

**Типы и имена.** Движок Task 2 объявляет `settle/mc/match/hotspot/stack/gap/findErr/ruSpan/sayBtn/hintChain/section`; во всех задачах 3–11 используются только эти имена. Поля `spec` перечислены в Task 2 и не переопределяются позже.

**Заглушек нет:** каждый шаг называет конкретный материал из файлов исследования, а не «добавить упражнения».
