# Interface English: рабочие сайты студента (camar.it / salice.com)

Исследование от 2026-08-25. Источник — живая выгрузка HTML и WebFetch двух сайтов
итальянских производителей мебельной фурнитуры, плюс 4 веб-поиска по обобщённому
«вебовому чрому» B2B-сайтов.

Цель материала: студент (взрослый, русскоязычный, работает в отрасли мебельной
фурнитуры — петли, подъёмники, опоры, навесы) должен перестать бояться англоязычного
интерфейса рабочих сайтов. Всё, что ниже, — **подлинные строки с этих сайтов**,
скопированные дословно, не выдуманные примеры из учебника.

Ключевая находка методического характера: два сайта дают **два разных типа
трудности**, и это идеальная пара для урока.

- **camar.it** — маленький, старый, плоский сайт. Меню целиком видно сразу.
  Трудность здесь — **лексическая и грамматическая**: чудовищные именные цепочки
  («base cabinet hanging brackets»), пункт меню-загадка «WARNING», страницы,
  которые ведут не туда, куда обещает ярлык.
- **salice.com** — большой современный корпоративный сайт. Все слова по отдельности
  простые. Трудность здесь — **навигационная и «чромовая»**: мега-меню на три уровня,
  выбор рынка/языка, cookie-баннер, формы с обязательными полями, императивы-кнопки
  («Inspire me», «Discover More», «Change market»).

---

## Часть 1. CAMAR S.p.A. — www.camar.it

Сайт двуязычный (IT/EN), переключение — через `?lang=it` / `?lang=en`, в шапке два
флажка **без текстовых подписей**. Это первая ловушка: студент ищет слово «English»
и не находит его — надо кликнуть флаг.

### 1.1 Полная навигация, дословно

**Верхний уровень (пять пунктов, ВСЁ КАПСОМ):**

```
HOME    COMPANY    PRODUCTS    WARNING    CONTACTS
```

**Меню товаров (левая колонка, присутствует на каждой странице).**
Восемь групп; вложенность до трёх уровней. Дословно:

| Группа (уровень 1) | Подпункты (уровень 2) | Уровень 3 |
|---|---|---|
| **Levellers** | fixed to the side panel · fixed to the base panel · concealed in the side panel · concealed in the base panel | — |
| **Plinth legs** | **classic** · **NEXT GENERATION** | classic → decorative legs · one-piece legs · legs with separate fixing socket<br>NEXT GENERATION → Ercolino System · Smile System |
| **Hanging brackets for wall units** | visible · concealed · in the side panel | — |
| **Base cabinet hanging brackets** | concealed hanging brackets · inset hanging brackets · hanging brackets mounted on the side panel | — |
| **Panel hanging brackets** | flush wall panel · jutting wall panel | — |
| **Shelf support** | — | — |
| **Table legs** | round legs · square legs · design legs · folding legs · legs for glass tables · "Bistrot" legs | — |
| **Systems** | — | — |

**Скрытый бонус.** В HTML-коде (JS-массив меню `P7_TMMmark`) лежат ярлыки категорий,
которые в видимом меню сейчас не показываются, но всплывают на внутренних страницах.
Отличная дополнительная лексика:

```
steel · plastic · conical insert · cylindrical insert
cylindrical 22mm insert · cylindrical 27mm insert
one-side adjustment · two-side adjustment
```

### 1.2 «Site furniture» на camar.it

| Строка (дословно) | Где |
|---|---|
| `READ MORE` | шесть раз на главной, под новостными плитками |
| `CATALOGUE` | вертикальная плашка на страницах товаров |
| `COMING SOON` | **вся страница каталога** (`/catalogo/index.php`) — то есть каталога фактически нет |
| `Sale conditions` | подвал |
| `Video Surveillance Privacy Policy` | подвал |
| `Suppliers information` | подвал |
| `Customer information` | подвал |
| `Privacy & Cookies policies` | подвал |
| `Whistleblowing` | подвал |
| `The company reserves the right to modify the technical characteristics of the products without notice.` | подвал каждой страницы |
| Cookie-баннер (Iubenda) | внизу; в конфиге включены кнопки **accept**, **reject**, **customize**, переключатели целей (`showPurposesToggles`) |
| Флаг IT / флаг EN | шапка, без текста |

Меню-«гамбургер» на мобильном обозначен символом `≡` (в коде — `&equiv;`), тоже без
подписи.

### 1.3 Ловушки camar.it (главное методическое золото)

1. **`WARNING` — не предупреждение об опасности и не «внимание».**
   Пункт ведёт на страницу-калькулятор **максимально допустимой нагрузки**.
   Заголовок страницы — `WARNING` плюс *итальянская* строка `CARICO MASSIMO AMMESSO`
   («максимально допустимая нагрузка»). Внутри — выпадающий список
   `Seleziona prodotto` («выберите изделие»), поле `Ricerca per codice`
   («поиск по коду») и подсказка `Digita il codice completo del prodotto`
   («введите полный код изделия»). **Английская версия страницы наполовину не
   переведена.** Для студента это важнейший урок: ярлык на английском ≠ содержимое
   на английском, и «WARNING» здесь означает «технические ограничения по нагрузке»,
   а не «осторожно».

2. **`CONTACTS` — никакой формы обратной связи.** Только адрес, телефон, факс и
   `info@camar.it`. Ожидание «сейчас заполню форму» не оправдывается. Слово
   `CONTACTS` во множественном числе — итальянская калька; нормативный английский
   ярлык — `Contact us` или `Contact`.

3. **`CATALOGUE` ведёт на `COMING SOON`.** Скачать PDF-каталог с сайта нельзя.
   Практический вывод для работы: каталог надо просить у менеджера по почте.

4. **`Systems` — пункт-пустышка по смыслу.** Слово ничего не сообщает о товаре;
   надо кликнуть, чтобы понять.

5. **Именные цепочки без предлогов.** `base cabinet hanging brackets` = четыре
   существительных подряд. Читать надо **справа налево**: brackets → hanging
   brackets → для base cabinet. Ср. соседний пункт, где предлог есть:
   `Hanging brackets **for** wall units`. Один и тот же смысл оформлен двумя разными
   способами в соседних строках меню — идеальный контраст для объяснения.

6. **Причастия-прилагательные как ярлыки.** `fixed to the side panel`,
   `concealed in the base panel`, `mounted on the side panel` — это не команды и не
   описание действия пользователя, а описание **изделия** («тот, который крепится к…»).
   Русский студент читает «fixed» как глагол в прошедшем времени и теряется.

7. **`one-piece` / `NEXT GENERATION` / `"Bistrot"`** — маркетинговые ярлыки внутри
   технического меню, регистр скачет (`NEXT GENERATION` капсом, `classic` строчными).

8. **Ложный друг:** `Sale conditions` — «условия продажи», а не «условия распродажи».

---

## Часть 2. Arturo Salice S.p.A. — www.salice.com/ww/en

URL сам по себе — учебный материал: `/ww/en` = **ww**orldwide + **en**glish.
Есть отдельный рынок `/us/en` и `/us/es`.

### 2.1 Полная навигация, дословно

**Верхний уровень (девять элементов):**

```
Company   Products   Inspire me   Magazine   Distribution   Download
Contact us   Configurators   Search
```

**Company →**
```
About us · Fairs · Technical Services · Job Opportunities
```
(в URL «Job Opportunities» лежит по адресу `/company/work-with-us` — ярлык и адрес
не совпадают)

**Products → (семь групп)**
```
Hinges
Runners and drawers
Lift systems and systems for fall flaps
Modular system of vertical profiles
Internal equipment for wardrobes
Sliding systems
Dampers and release devices
```

**Products → Hinges →**
```
Integrated soft-close mechanism
Push opening for handle-less doors
Sprung closing
Outdoor
Special applications
```

**Products → Runners and drawers →**
```
Metal drawer · Concealed runners · Pull-out shelf
```

**Products → Lift systems and systems for fall flaps →**
```
Lift systems · Flap door systems
```

**Products → Modular system of vertical profiles →** `Luxer modular system`

**Products → Internal equipment for wardrobes →** (в каталоге) `Excessories` · `Pin`
и подкатегории `Excessories – Pull-out`, `Excessories – Shelves`,
`Wardrobe accessories – Excessories Contain / Hang / Protect / Store`

**Products → Sliding systems →**
```
Coplanar systems
System for overlapping doors
Pocket door systems
Systems for concertina doors
```

**Products → Dampers and release devices →**
```
Dampers - external and to be recessed
Mechanical and magnetic release devices
```

**Magazine →**
```
Events · News · Svago · Design · Awards
```
(`Svago` — итальянское слово «досуг», оставленное непереведённым в английском меню:
ещё один пример «английский сайт, но не совсем»)

**Download →**
```
Catalogues · Assembly instructions
```

**Contact us →** `Subscribe to our newsletter`

### 2.2 Переключатель рынка и языка

Это отдельный, очень характерный кусок интерфейса. Кнопка в шапке подписана:

```
International / EN
```

По клику открывается панель:

```
Select market / language
Select the market        →  International  |  USA / Canada
Select a language        →  Italiano · English · Deutsch · Español · Française · Português · 中文
Change market
Confirm
```

Заметьте: языки перечислены **на своих языках** (`Italiano`, `Deutsch`), кроме
`English`. Плюс отдельные домены `salicechina.com`, `/ww/jp`.

### 2.3 «Site furniture» на salice.com

**Кнопки и призывы к действию (дословно, все встречены на страницах):**
```
See all · More · Read all · Find out more · Discover More
Subscribe to our newsletter · Send your request
Change market · Confirm · Close · Clear all · Search
Download · Contact us
```

**Подвал:**
```
Technical Services · Press Area · Job Opportunities · Contact us
Sustainability · Whistleblowing · Privacy Policy · Social Media Policy
General Conditions of Use · Cookies
```

**Соцсети** (иконками, без подписи): Facebook, Instagram, LinkedIn, Pinterest,
Vimeo, YouTube.

**Cookie-баннер:** движок **Cookiebot** (`consent.cookiebot.com`), обработчики
`CookiebotOnAccept` / `CookiebotOnDecline` — то есть стандартная пара кнопок
«принять / отклонить» плюс уровни `necessary / preferences / statistics / marketing`.

**Форма (страницы Contact us и Technical Services) — дословные подписи полей:**
```
Business  |  Private buyer                    ← тип пользователя (User Type)
Job *          → Architect / Designer · Craftsman / Carpenter ·
                 Hardware store / Distributor · Industry / Furniture Dealer · Other
Company / Business name *
Role *         → Purchasing & Supply Chain · Interior Design/Architecture ·
                 Executive/ Owner/ Shareholder · Marketing & Communication ·
                 Technical Support · Sales · Other
First name *
Last name *
Email address *
Phone
Select a country *
State (USA)
Select a language
☐ I have read the information about privacy policy
☐ I would like to subscribe to the newsletter and stay updated on all the latest
   product developments and news.
[ Send your request ]   /   [ Subscribe ]
```

Звёздочка `*` = обязательное поле. Это надо проговорить отдельно: студент должен
уметь прочитать `Company / Business name *` и понять, что без этого поля форма не
уйдёт.

**Страница Distribution** (поиск дилера):
```
Distribution   |   Agents
"To find the nearest distributor/retailer, please select the area of your interest."
Фильтр: All · Branch · Exclusive agent · Distributor · Agent · Hardware store
"No results found for this query"
```

**Страница Download → Assembly instructions** — ярлыки типов документов:
```
video · pdf · Assembly and adjustment manual · Assembly and adjustments ·
Assembly instructions
```

**Страница товара** (пример: `TILT — Tilt Up`) — названия вкладок и секций:
```
Technical features · Catalogue · Product versions · Documentation and video
Versions · Components · Finishes
Technical information · Assembly instructions and adjustments ·
Spring strengths · Finishes · Packing
Assembly solutions · Assembly instructions · Adjustments
```

**Фильтры на странице категории «Hinges»** — самый плотный кусок отраслевого
английского на всём сайте:
```
Type of opening/closing:  Soft-close mechanism · Push opening for handle-less doors ·
                          Sprung closing
Door material:            Wood · Aluminium · Glass · Special materials
Type of application:      With covers · Standard · Crampon hinge · Negative angled ·
                          Positive angled · Long crampon hinges · Fridge doors ·
                          Concealed · Corner cabinets · Small operating profile ·
                          Moulded edge profiles · Half-inlay doors
Opening angle:            Standard · Great
Type of mounting:         Snap-on · By screws with traditional hinges ·
                          Screw fixing with mounting plates Series 300 ·
                          Snap-on fixing traditional mounting plates
[ Clear all ]
```

### 2.4 Ловушки salice.com

1. **`Inspire me` — императив от первого лица.** Не «вдохнови меня» как просьба к
   человеку, а раздел «идеи применения по типам комнат»
   (`Bathroom · Kitchen · LIVING ROOM · BEDROOM`). Русскому это читается как
   странная команда. Подзаголовок раздела:
   `A wide range of products complementing all kinds of room settings, furniture and applications`.

2. **`Magazine`** — не «магазин»! Классический ложный друг: это **журнал / блог**
   компании. Магазин был бы `Shop` / `Store`. Это, вероятно, самая ценная одна
   ловушка на всём сайте для русскоязычного.

3. **`Configurators`** (множественное число, отдельный домен
   `configurator.salice.com`) — сайт-приложение на движке **RuleDesigner**,
   статически не читается: там пусто до загрузки JS. То есть **скопировать оттуда
   текст интерфейса нельзя**, и урок можно строить только на самом слове
   `Configurator` (конфигуратор — подбор изделия по параметрам).

4. **`Distribution`** — не «дистрибуция» как процесс, а «где купить / найти дилера».
   Синонимы на других сайтах: `Where to buy`, `Find a dealer`, `Dealer locator`.

5. **`Download`** как **существительное-раздел меню**, не глагол. Рядом на странице
   товара то же слово — уже кнопка-глагол. Один и тот же токен в двух ролях.

6. **`Fairs`** — выставки (мебельные), не «ярмарки» в бытовом смысле и не `fair`
   «честный».

7. **`Press Area`** — раздел для журналистов. Часто на других сайтах — `Reserved area`
   / `Media kit`.

8. **`Whistleblowing`** — канал сообщения о нарушениях (комплаенс). Слово
   обязательно по европейской директиве, встречается **на обоих сайтах**, и его
   почти никто не знает.

9. **`Great`** как значение фильтра «Opening angle: Standard / Great».
   Здесь `great` = «большой», а не «отличный». Итальянская калька с `grande`.

10. **`Packing`** в секции документации = «упаковка / данные по упаковке»,
    а не «набивка/уплотнение».

11. **`Svago`** оставлено по-итальянски прямо в английском меню Magazine.

12. **`to be recessed`** в ярлыке `Dampers - external and to be recessed` —
    инфинитив пассивного залога как классификатор изделия («врезные»). Крайне
    непривычная конструкция для ярлыка.

---

## Часть 3. Универсальный «чром» B2B-сайта производителя

Собрано веб-поиском, чтобы список не был привязан только к этим двум сайтам.
Это канон, который студент встретит на **любом** сайте поставщика.

**Cookie-баннер.** Стандарт (и юридическое требование ЕС — «отклонить» должно быть
так же доступно, как «принять», на первом же экране):
```
We use cookies · This site uses cookies
Accept all · Reject all · Decline · Manage preferences · Customise · Preferences
Strictly necessary · Necessary · Functional · Analytics · Statistics ·
Marketing · Performance
Save preferences · Show details · Cookie Policy
```

**Призывы к действию B2B (вместо `Buy now`, которого на B2B-сайте не бывает):**
```
Request a quote · Get a quote · Request a sample · Order a sample
Download spec sheet · Download the catalogue · Download datasheet
Contact sales · Book a consultation · Schedule a call · Talk to an expert
```

**Разделы, которых нет у Camar/Salice, но которые студент встретит рядом:**
```
Where to buy · Find a dealer · Dealer locator · Product finder ·
Spare parts · Technical data sheet · Solutions · Applications · Resources ·
Case studies · Support · FAQ · Reserved area · My account · Log in · Sign in ·
Register · Sign up · Log out
```

**Подвал — канонический набор:**
```
Terms and Conditions · Terms of Use · General Conditions of Use ·
Privacy Policy · Cookie Policy · Legal notice · Imprint ·
Sitemap · Accessibility · Copyright © 2026 · All rights reserved ·
Follow us · Back to top · Newsletter · Subscribe
```

**Навигационная механика:**
```
Breadcrumb (breadcrumb navigation) · Mega menu · Dropdown · Hamburger menu ·
Sticky header · Filter · Sort by · Clear all · Load more · Show more ·
Results · No results found · Search · Reset
```

---

## Часть 4. Мастер-таблица словаря

Пометка **UNSURE** означает: значение понятно, но канонический русский отраслевой
термин я не подтвердил — уточнить у студента, он в отрасли работает и знает лучше.

### 4.1 Навигация и «чром» сайта

| English | Russian | Where you see it | Note / trap |
|---|---|---|---|
| Home | Главная | camar (HOME) | — |
| Company / About us | О компании | оба сайта | Camar пишет `COMPANY`, Salice — `Company → About us` |
| Products | Продукция | оба | — |
| Contacts / Contact us | Контакты / Связаться с нами | camar `CONTACTS`, salice `Contact us` | `Contacts` — итальянская калька; норма — `Contact us` |
| Warning | Предупреждение | camar, пункт меню | **ЛОВУШКА**: ведёт на калькулятор допустимой нагрузки, а не на предупреждение |
| Magazine | Журнал, блог компании | salice | **ЛОЖНЫЙ ДРУГ**: не «магазин» |
| Inspire me | Идеи применения («вдохнови меня») | salice | Императив как ярлык раздела |
| Distribution | Где купить / дилеры | salice | Не «дистрибуция» как процесс |
| Agents | Представители, агенты | salice /distribution | — |
| Branch | Филиал | salice, легенда карты | Не «ветка» и не «отрасль» |
| Exclusive agent | Эксклюзивный представитель | salice | — |
| Distributor | Дистрибьютор | salice | — |
| Hardware store | Магазин фурнитуры / скобяной магазин | salice | `hardware` тут = фурнитура, не «железо» ПК |
| Download | 1) раздел «Скачать» 2) кнопка «скачать» | salice | Одно слово в двух ролях: существительное и глагол |
| Catalogues | Каталоги | salice | — |
| Catalogue | Каталог | camar (плашка) | Ведёт на `COMING SOON` |
| Assembly instructions | Инструкции по монтажу | salice | — |
| Configurators | Конфигураторы | salice | Отдельный домен, JS-приложение |
| Search | Поиск | salice | — |
| Fairs | Выставки | salice | Не «ярмарка» в бытовом смысле |
| Technical Services | Техническая поддержка | salice | — |
| Job Opportunities / Work with us | Вакансии | salice | URL и ярлык не совпадают |
| Press Area | Пресс-центр | salice | — |
| Sustainability | Устойчивое развитие / экология | salice | — |
| Whistleblowing | Канал сообщения о нарушениях | **оба сайта** | Никто не знает это слово; обязательно по директиве ЕС |
| News · Events · Awards · Design | Новости · Мероприятия · Награды · Дизайн | salice → Magazine | — |
| Svago | (ит.) досуг | salice → Magazine | Не переведено на английский |
| Read more | Подробнее | camar, ×6 на главной | — |
| Read all / See all / More | Показать все / Ещё | salice | Три разных ярлыка для одного действия |
| Find out more / Discover More | Узнать больше | salice | `Discover` как императив-кнопка |
| Subscribe to our newsletter | Подписаться на рассылку | salice | — |
| Send your request | Отправить запрос | salice, форма | — |
| Change market | Сменить рынок | salice | — |
| Select market / language | Выбрать рынок / язык | salice | — |
| Select the market | Выберите рынок | salice | `International` / `USA / Canada` |
| Select a language | Выберите язык | salice | — |
| International / EN | Международный / английский | salice, кнопка в шапке | Так подписан переключатель языка |
| Confirm | Подтвердить | salice | — |
| Close | Закрыть | salice, подменю | — |
| Clear all | Сбросить всё (фильтры) | salice, фильтры | — |
| No results found for this query | По этому запросу ничего не найдено | salice /distribution | — |
| Coming soon | Скоро / в разработке | camar /catalogo | Целая страница вместо каталога |
| Sale conditions | Условия продажи | camar, подвал | **ЛОЖНЫЙ ДРУГ**: не «условия распродажи» |
| General Conditions of Use | Общие условия использования | salice, подвал | Итальянский вариант `Terms of Use` |
| Privacy Policy | Политика конфиденциальности | оба | — |
| Privacy & Cookies policies | Политика конфиденциальности и cookie | camar | — |
| Cookies / Cookie Policy | Политика cookie | оба | — |
| Social Media Policy | Политика соцсетей | salice | — |
| Video Surveillance Privacy Policy | Политика видеонаблюдения | camar | — |
| Suppliers information | Информация для поставщиков | camar | — |
| Customer information | Информация для клиентов | camar | — |
| Accept all / Reject all / Manage preferences | Принять все / Отклонить все / Настройки | cookie-баннеры обоих | Canonical trio |
| Strictly necessary cookies | Строго необходимые cookie | канон | — |
| Terms and Conditions | Условия и положения | канон | — |
| Sitemap | Карта сайта | канон | — |
| Follow us | Мы в соцсетях | канон | — |
| Back to top | Наверх | канон | — |
| Reserved area / Log in / Sign in | Личный кабинет / Вход | канон | `Reserved area` — типично для итальянских сайтов |
| Request a quote | Запросить коммерческое предложение | канон B2B | Ключевая рабочая фраза |
| Where to buy / Find a dealer | Где купить | канон B2B | — |
| Technical data sheet / Spec sheet | Технический паспорт изделия | канон B2B | — |
| Spare parts | Запчасти | канон B2B | — |
| Breadcrumb | «Хлебные крошки» (путь) | канон | `Table legs > legs for glass tables` на camar |
| Required field (`*`) | Обязательное поле | salice, формы | Звёздочка = обязательно |

### 4.2 Отраслевая лексика — Camar (опоры, ножки, навесы)

| English | Russian | Where you see it | Note / trap |
|---|---|---|---|
| Leveller (levellers) | Регулируемая опора (по высоте) | camar, группа 1 | Пишется по-британски с двумя `l`; амер. `leveler` |
| fixed to the side panel | крепится к боковой стенке | camar | `fixed` = причастие-прилагательное, НЕ глагол в прошедшем |
| fixed to the base panel | крепится к дну | camar | `base panel` = дно корпуса |
| concealed in the side panel | скрытый в боковой стенке | camar | `concealed` — ключевое слово всей отрасли |
| concealed in the base panel | скрытый в дне | camar | — |
| Plinth legs | Цокольные опоры (ножки цоколя) | camar, группа 2 | `plinth` = цоколь кухни |
| classic | классические | camar | строчными, рядом с `NEXT GENERATION` капсом |
| decorative legs | декоративные ножки | camar | — |
| one-piece legs | цельные (неразборные) ножки | camar | `one-piece` = из одной детали |
| legs with separate fixing socket | ножки с отдельным гнездом крепления | camar | `fixing socket` — UNSURE по канону: «гнездо / чашка / патрон крепления» |
| Ercolino System / Smile System | (торговые названия) | camar | Не переводить |
| Hanging brackets for wall units | Навесы для навесных шкафов | camar, группа 3 | Единственный пункт с предлогом `for` |
| wall unit | навесной (верхний) шкаф | camar | — |
| visible | видимый | camar | антоним `concealed` |
| in the side panel | в боковой стенке | camar | ярлык без существительного |
| Base cabinet hanging brackets | Навесы для напольных шкафов | camar, группа 4 | **4 существительных подряд**, читать справа налево |
| base cabinet | напольный (нижний) шкаф, тумба | camar | — |
| inset hanging brackets | врезные навесы | camar | `inset` = врезной, утопленный |
| hanging brackets mounted on the side panel | навесы, монтируемые на боковую стенку | camar | `mounted` — снова причастие |
| Panel hanging brackets | Навесы для панелей | camar, группа 5 | — |
| flush wall panel | панель заподлицо со стеной | camar | `flush` = вровень, заподлицо — ключевое отраслевое слово |
| jutting wall panel | выступающая панель | camar | `jutting` — редкое слово, «выступающий» |
| Shelf support | Полкодержатель | camar, группа 6 | Ед. число как название группы |
| Table legs | Ножки для столов | camar, группа 7 | — |
| round / square legs | круглые / квадратные ножки | camar | — |
| design legs | дизайнерские ножки | camar | `design` как прилагательное — итальянизм |
| folding legs | складные ножки | camar | герундий-прилагательное |
| legs for glass tables | ножки для стеклянных столов | camar | Товары: `610/615/620/649 CRISTAL` |
| "Bistrot" legs | ножки «бистро» | camar | В кавычках, франц. написание с `t` |
| Systems | Системы | camar, группа 8 | Ярлык ничего не сообщает |
| steel / plastic | сталь / пластик | camar, скрытые категории | — |
| conical insert | конический вкладыш | camar, скрытые категории | UNSURE по канону |
| cylindrical insert (22mm / 27mm) | цилиндрический вкладыш (22/27 мм) | camar | UNSURE по канону |
| one-side adjustment | регулировка с одной стороны | camar | — |
| two-side adjustment | регулировка с двух сторон | camar | — |
| Maximum permitted load (`CARICO MASSIMO AMMESSO`) | Максимально допустимая нагрузка | camar /warning | Заголовок оставлен по-итальянски |
| technical fittings for the furniture industry | техническая фурнитура для мебельной промышленности | camar, COMPANY | Самоопределение отрасли |
| after-sales service | послепродажное обслуживание | camar, COMPANY | — |
| raw materials | сырьё | camar, COMPANY | — |

### 4.3 Отраслевая лексика — Salice (петли, направляющие, подъёмники)

| English | Russian | Where you see it | Note / trap |
|---|---|---|---|
| Hinges | Петли | salice, категория 1 | — |
| Runners and drawers | Направляющие и ящики | salice, категория 2 | `runner` (брит.) = `slide` (амер.) |
| Metal drawer | Металлический ящик | salice | Товар `Lineabox Easy` |
| Concealed runners | Скрытые направляющие | salice | — |
| Pull-out shelf | Выдвижная полка | salice | `pull-out` — дефисное прилагательное от фразового глагола |
| Lift systems | Подъёмные механизмы | salice, категория 3 | — |
| systems for fall flaps | системы для откидных фасадов | salice | `fall flap` = откидывающийся вниз фасад |
| Flap door systems | Системы откидных фасадов | salice | — |
| flap door | откидной фасад / дверца | salice | — |
| upward opening | открывание вверх | salice, TILT | — |
| Tilt Up / Tilt Down | подъём вверх / откид вниз | salice, TILT | — |
| Modular system of vertical profiles | Модульная система вертикальных профилей | salice, категория 4 | Товар `Luxer` |
| Internal equipment for wardrobes | Внутреннее наполнение шкафов | salice, категория 5 | `equipment` тут = наполнение, не «оборудование» |
| wardrobe accessories | аксессуары для шкафов | salice | — |
| Sliding systems | Раздвижные системы | salice, категория 6 | — |
| Coplanar systems | Компланарные системы | salice | Термин есть и в русском |
| System for overlapping doors | Система для дверей внахлёст | salice | — |
| Pocket door systems | Системы дверей, убирающихся в корпус | salice | UNSURE по канону: часто говорят просто «pocket-door» |
| Systems for concertina doors | Системы дверей-гармошек | salice | `concertina` = гармошка (инструмент) |
| Dampers and release devices | Амортизаторы и устройства открывания | salice, категория 7 | — |
| Dampers - external and to be recessed | Амортизаторы наружные и врезные | salice | `to be recessed` — инфинитив как классификатор |
| Mechanical and magnetic release devices | Механические и магнитные толкатели | salice | `release device` — UNSURE: «толкатель / push-to-open» |
| Integrated soft-close mechanism | Встроенный доводчик | salice | — |
| soft close / soft-close | доводчик, плавное закрывание | salice, канон отрасли | Пишется и через дефис, и раздельно |
| Sprung closing | Пружинное закрывание | salice | `sprung` — 3-я форма от `spring` |
| Push opening for handle-less doors | Открывание нажатием для фасадов без ручек | salice | `handle-less` (в URL написано `handles-less` — опечатка на сайте) |
| Outdoor | Для наружного применения | salice | Ярлык из одного слова |
| Special applications | Специальные применения | salice | `application` = применение, не «приложение» |
| Mounting plate | Монтажная (ответная) планка | salice, фильтры | — |
| Snap-on | Клипсовое (защёлкивающееся) крепление | salice, фильтры | — |
| Screw fixing / By screws | Крепление винтами | salice, фильтры | — |
| Opening angle: Standard / Great | Угол открывания: стандартный / большой | salice, фильтры | **`Great` = «большой»**, не «отличный» — итальянизм |
| opening limiter | ограничитель открывания | salice, TILT | — |
| disengaged | выведен из зацепления, отключён | salice, TILT | — |
| Decelerated closing | Замедленное закрывание | salice, TILT | — |
| Half-inlay doors | Полунакладные фасады | salice, фильтры | UNSURE: Salice использует `inlay` там, где рынок чаще говорит `overlay/inset` |
| With covers | С накладками (заглушками) | salice, фильтры | — |
| Crampon hinge / Long crampon hinges | UNSURE | salice, фильтры | Итальянизм Salice; уточнить у студента |
| Negative angled / Positive angled | С отрицательным / положительным углом | salice, фильтры | — |
| Corner cabinets | Угловые шкафы | salice, фильтры | — |
| Fridge doors | Двери холодильника | salice, фильтры | — |
| Small operating profile | UNSURE (малый рабочий профиль) | salice, фильтры | — |
| Moulded edge profiles | Профилированная кромка | salice, фильтры | UNSURE по канону |
| Door material: Wood / Aluminium / Glass / Special materials | Материал фасада: дерево / алюминий / стекло / спец. материалы | salice, фильтры | `Aluminium` брит., `Aluminum` амер. |
| Technical features | Технические характеристики | salice, вкладка | — |
| Product versions / Versions | Исполнения, варианты | salice, вкладка | — |
| Components | Комплектующие | salice, вкладка | — |
| Finishes | Покрытия, отделки | salice, вкладка | Мн. ч.; не «финиш» |
| Spring strengths | Усилия пружин | salice, документация | — |
| Packing | Упаковка (данные по упаковке) | salice, документация | Не «набивка» |
| Assembly and adjustment manual | Руководство по монтажу и регулировке | salice, Download | — |
| Adjustments | Регулировки | salice, видео | — |
| Machining depth on the door | Глубина присадки (фрезеровки) в фасаде | salice, TILT | — |
| side panel fixing | крепление к боковой стенке | salice, TILT | — |
| recessed / flush assembly | врезной монтаж / монтаж заподлицо | salice, TILT | — |
| thickness | толщина | salice, TILT | `from 18 to 30 mm` |
| overlay | накладка (величина захода фасада) | канон отрасли | — |
| cup | чашка петли (Ø35 мм) | канон отрасли | — |
| boring | присадка, сверление | канон отрасли | — |

---

## Часть 5. Структурные паттерны, которые ломают неносителя

Это то, что стоит разбирать на доске, а не заучивать списком.

**1. Именные цепочки (noun stacks).** Читать справа налево, последнее слово — главное.
```
base cabinet hanging brackets   →  brackets ← hanging ← for base cabinets
Panel hanging brackets          →  brackets ← hanging ← for panels
Screw fixing with mounting plates Series 300
Modular system of vertical profiles      (тут есть `of` — легче!)
```
Идеальное упражнение: дать `Hanging brackets for wall units` и
`Base cabinet hanging brackets` рядом и попросить объяснить, почему смысл
параллельный, а грамматика разная.

**2. Причастие как классификатор, а не как глагол.**
```
fixed to the side panel · concealed in the base panel · mounted on the side panel
folding legs · sliding systems · hanging brackets · overlapping doors
```
Русский читает `fixed` как «починил / закрепил» (действие в прошлом). Здесь это
«тот, который закреплён».

**3. Инфинитив пассива как классификатор** — самое экзотическое:
```
Dampers - external and to be recessed
```
= «амортизаторы: наружные и врезные (те, которые надо утопить)».

**4. Императив-кнопка.**
```
Discover · Download · Subscribe · Confirm · Close · Search · Change market ·
Send your request · Clear all · Inspire me
```
`Inspire me` — императив с местоимением: не команда пользователю, а «сделай мне».

**5. Одно слово в двух частях речи в пределах одной страницы.**
```
Download  (раздел меню — существительное)   vs   Download (кнопка — глагол)
Search    (пункт меню)                      vs   Search (кнопка `value="Search"`)
Warning   (пункт меню — существительное)    vs   обычное значение «предупреждать»
```

**6. Ложные друзья, встреченные буквально.**
```
Magazine        ≠ магазин          = журнал компании
Sale conditions ≠ условия распродажи = условия продажи
Great (angle)   ≠ отличный          = большой
application     ≠ приложение (ПО)   = применение
equipment (internal ~ for wardrobes) ≠ оборудование = наполнение
Branch          ≠ ветка/отрасль     = филиал
Hardware store  ≠ компьютерный      = магазин фурнитуры
Fair            ≠ честный/ярмарка   = выставка
Packing         ≠ набивка           = упаковка
Finishes        ≠ финиш             = покрытия
Actual/Actually — не встречено, но добавить как пару к Great
```

**7. Британский vs американский, оба на одном сайте.**
```
Levellers (брит.) / leveler (амер.)
Catalogue (брит.) / catalog (амер.)
Aluminium (брит.) / Aluminum (амер.)
Runners  (брит.)  / slides (амер.)
Customise / Customize (кнопка cookie-баннера Camar — `customizeButtonDisplay`)
```

**8. Английский, который не совсем английский (итальянизмы).**
```
CONTACTS (вместо Contact us) · design legs · Great (opening angle) ·
Reserved area · Svago (не переведено) · CARICO MASSIMO AMMESSO на англ. странице ·
`handles-less` в URL
```
Важный вывод для студента: **эти сайты написаны неносителями**, и не надо считать
своё непонимание своей виной. Часть строк объективно кривая.

---

## Часть 6. Двенадцать рабочих задач с точным click-path

Формат: задача → маршрут в **дословных английских ярлыках**. Это готовые задания для
урока «сделай на живом сайте».

**CAMAR**

1. **Переключить сайт на английский.**
   `www.camar.it` → в шапке кликнуть **флаг Великобритании** (текстового ярлыка
   `English` нет; URL станет `?lang=en`).
   *Учебная точка: язык переключается флагом, не словом.*

2. **Найти ножки для стеклянных столов и выписать артикулы.**
   `PRODUCTS` → `Table legs` → `legs for glass tables` → на странице:
   `610 CRISTAL`, `615 CRISTAL`, `620 CRISTAL`, `649 CRISTAL`.
   *Хлебные крошки покажут `Table legs > legs for glass tables`.*

3. **Узнать максимально допустимую нагрузку на изделие по его коду.**
   `WARNING` → выпадающий список `Seleziona prodotto` → или поле
   `Ricerca per codice` → подсказка `Digita il codice completo del prodotto`.
   *Учебная точка: ярлык английский, страница итальянская.*

4. **Найти навесы, которые крепятся на боковую стенку напольного шкафа.**
   `PRODUCTS` → `Base cabinet hanging brackets` →
   `hanging brackets mounted on the side panel`.
   *Разбор именной цепочки прямо на маршруте.*

5. **Скачать PDF-каталог.**
   `PRODUCTS` → плашка `CATALOGUE` → страница `COMING SOON`.
   **Задача не выполняется — и это правильный ответ.**
   *Учебная точка: уметь по-английски сказать «на сайте каталога нет, пришлите,
   пожалуйста, по почте» — `Could you email me the catalogue? The website says
   "coming soon".`*

6. **Найти адрес и e-mail для запроса.**
   `CONTACTS` → адрес `Via Leopardi, 8 — 22060 Figino Serenza (Como) — Italy`,
   `Tel. +39.031.72.811`, `Fax`, `info@camar.it`.
   *Формы обратной связи нет — писать письмо.*

7. **Найти условия продажи перед оформлением заказа.**
   Подвал → `Sale conditions`.
   *Не `Sale` как «распродажа».*

**SALICE**

8. **Проверить, что сайт в международной англоязычной версии, и сменить рынок.**
   Кнопка в шапке `International / EN` → панель `Select market / language` →
   `Select the market` (`International` | `USA / Canada`) →
   `Select a language` (`English`) → `Confirm`.
   Альтернатива: правка URL `/ww/en`.

9. **Скачать каталог по петлям.**
   `Download` → `Catalogues` → блок `Hinges` → выбрать модель
   (`Chromia`, `Silentia+`, `Conecta`, `Air`, `Series N`, `Push`, `Vetro`,
   `Lapis`, `Mounting plates`…) → скачать PDF.

10. **Найти инструкцию по монтажу подъёмника и видео к ней.**
    `Download` → `Assembly instructions` → раздел
    `Lift systems and systems for fall flaps` → ярлыки `pdf` / `video` →
    `Assembly and adjustment manual`.

11. **Подобрать петлю: стеклянный фасад, доводчик, большой угол открывания.**
    `Products` → `Hinges` → фильтры:
    `Type of opening/closing: Soft-close mechanism` +
    `Door material: Glass` + `Opening angle: Great` → при неудаче `Clear all`.
    *Учебная точка: `Great` = большой.*

12. **Найти ближайшего дилера/поставщика.**
    `Distribution` → `To find the nearest distributor/retailer, please select the
    area of your interest.` → фильтр
    `All / Branch / Exclusive agent / Distributor / Agent / Hardware store` →
    при пустом результате `No results found for this query`.

13. **Отправить технический вопрос инженерам.**
    `Company` → `Technical Services` → форма: `Business` / `Private buyer` →
    `Job *` (`Industry / Furniture Dealer`) → `Company / Business name *` →
    `Role *` (`Technical Support`) → `First name *`, `Last name *`,
    `Email address *`, `Phone` → `Select a country *` →
    ☑ `I have read the information about privacy policy` → `Send your request`.

14. **Подписаться на рассылку о новинках.**
    `Contact us` → `Subscribe to our newsletter` →
    ☑ `I would like to subscribe to the newsletter and stay updated on all the
    latest product developments and news.` → `Subscribe`.

15. **Посмотреть готовые решения для кухни (идеи применения).**
    `Inspire me` → фильтр `Kitchen` (рядом `Bathroom`, `LIVING ROOM`, `BEDROOM`) →
    `Discover More`.

16. **Открыть конфигуратор.**
    `Configurators` → переход на `configurator.salice.com` (движок RuleDesigner).
    *Приложение полностью на JS; статически текст интерфейса не читается —
    исследовать вживую на уроке.*

---

## Приложение. Технические заметки об исследовании

- Обе главные страницы и все внутренние страницы Camar получены через `curl`
  (полный HTML), что дало **дословные** ярлыки, включая скрытые в JS.
- `https://www.camar.it/catalogo_welcome.php` → **404**, рабочий адрес
  `https://www.camar.it/catalogo/index.php` → 200, содержимое `COMING SOON`.
- `https://configurator.salice.com/` отдаёт только `RuleDesigner` — SPA, статически
  пустая. Единственная неудача выгрузки; помечена, не обойдена.
- Cookie-движки: Camar — **Iubenda** (accept/reject/customize + переключатели целей),
  Salice — **Cookiebot** (`CookiebotOnAccept` / `CookiebotOnDecline`).
- Веб-поиски (4 шт.) подтвердили канон: `Accept all` / `Reject all` /
  `Manage preferences`; B2B-CTA `Request a quote` / `Download spec sheet` вместо
  `Buy now`; типовой подвал `Terms · Privacy · Sitemap · Copyright · Follow us`.

Источники поиска:
[Transcend — Cookie Consent Banner Best Practices](https://transcend.io/blog/cookie-consent-banner) ·
[Trajectory — B2B Website Navigation](https://www.trajectorywebdesign.com/blog/b2b-website-navigation/) ·
[Orbit Media — Website Footer Design Best Practices](https://www.orbitmedia.com/blog/website-footer-design-best-practices/) ·
[NN/g — Web Page Footers 101](https://www.nngroup.com/articles/footers/) ·
[Ferguson — Door and Cabinet Hardware Glossary](https://www.fergusonhome.com/hardware-buying-guide-glossary/a22728) ·
[Kitchen Cabinet Kings — Drawer Runner](https://kitchencabinetkings.com/glossary/drawer-runner/) ·
[Rockler — Choosing the Right Cabinet Hinges](https://www.rockler.com/learn/choosing-the-right-hinge-for-your-project)
