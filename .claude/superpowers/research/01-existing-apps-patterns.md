# 01 — Паттерны существующих приложений (reusable pattern reference)

Цель документа: по нему одному можно собрать новое одностраничное приложение-урок, которое
будет выглядеть и вести себя как родной брат уже существующих. Всё ниже прочитано в исходниках
целиком, цифры посчитаны исполнением данных, а не на глаз.

**Что изучено**

| Файл | Размер | Строк | Что это |
|---|---|---|---|
| `C:\Repositories\charnou.github.io\verb-gangs\index.html` | 67 108 B | 1 260 | «Банды неправильных глаголов» — игровое приложение-тренажёр |
| `C:\Repositories\charnou.github.io\numbers-lab\index.html` | 94 814 B | 1 761 | «Numbers Lab by Valeria» — домашка-практикум по числам |
| `C:\Repositories\charnou.github.io\lera\index.html` | 65 772 B | 668 | «Твоё здоровье — разбор ситуации» — статичный документ-разбор |
| `C:\Repositories\charnou.github.io\a5fwuvzjsi.html` | 36 684 B | 310 | Анкета №1 (40 вопросов) |
| `C:\Repositories\charnou.github.io\1hrtqo3981.html` | 25 709 B | 283 | Анкета №2 (18 вопросов) |
| `C:\Repositories\charnou.github.io\kt9k0yz56p.html` | 21 136 B | 276 | Анкета №3 (14 вопросов) |

Дополнительно рядом лежат `favicon.svg` в каждой папке приложения — рукописный SVG 32×32 в
палитре самого приложения (см. §5.9). Каталоги `eri/`, `find/`, `land/` к этому семейству
не относятся (Angular-сборка и QGIS-экспорт) и в анализ не входят.

---

# 1. verb-gangs — «Банды неправильных глаголов»

## 1.1 Назначение и педагогика

Тренажёр 67 неправильных глаголов, разложенных по 12 «бандам» — группам с общим фонетическим
или морфологическим хвостом (`-ought/-aught`, `i→a→u`, `-en`, `-t`, три одинаковые формы и т.д.).
Педагогическая идея прямо озвучена на стартовом экране:

> «Глаголы держатся стаями: у каждой банды свой звук. Выучила звук — забрала сразу шесть глаголов.»

То есть это не список из 67 карточек, а 12 правил по 5–6 глаголов. Мнемоника усиливается
двустрочной «речёвкой» (`hook`) на русском с ритмом — её проговаривают вслух.

Приложение **не для одного урока**, а для многодневного самостоятельного повторения: есть
XP, уровни, стрик «3 дня подряд», наклейки, коллекция карточек, рекорды. Прогресс сохраняется
в `localStorage`. Один урок = один «Урок» из трёх (4 банды × 4 этапа + 6 игр) — плотных
25–40 минут. Полный проход всех трёх уроков плюс финальный босс — часы, растянутые на недели.

Обращение к ученице — женский род («ты трижды ответила верно», «Я спала десять часов»),
значит файл персонализирован под конкретного ребёнка.

## 1.2 Архитектура экранов и навигация

Роутера нет. Есть **фиксированная шапка + единственная скроллящаяся область**, внутрь которой
функции-экраны полностью перерисовывают DOM:

```html
<body>
<canvas id="fx"></canvas>
<header id="hdr" class="bare">
  <div id="bar"><i></i></div>          <!-- глобальный прогресс-бар 6px -->
  <div class="hrow">
    <div class="brand">Банды глаголов<i>irregular verbs</i></div>
    <span class="xp" id="xp"></span>
    <button class="hbtn" id="bColl" type="button">Коллекция</button>
    <button class="hbtn" id="bChant" type="button">Речёвка</button>
    <button class="hbtn on" id="bSound" type="button" title="Звук">♪</button>
    <button class="hbtn" id="bReset" type="button" title="Начать заново">×</button>
  </div>
</header>
<main id="scroll"><div class="wrap" id="app"></div></main>
<div id="dlg"><div class="sheet" id="dlgSheet">…</div></div>
```

Ключевой приём — `body{display:flex;flex-direction:column;height:100dvh;overflow:hidden}`,
шапка `flex:0 0 auto`, а `#scroll{flex:1 1 auto;min-height:0;overflow-y:auto;
overscroll-behavior-y:contain}`. Скроллится **только** `#scroll`; страница целиком не двигается
никогда. Это то, что делает приложение похожим на нативное на телефоне.

Экраны (все — функции вида `screenX()` / `gameX()`, каждая начинается с `app.innerHTML=""`):

| Функция | Экран |
|---|---|
| `screenStart()` | ввод имени |
| `screenHome()` | выбор урока + плитка «Финальный босс» |
| `screenLesson(L)` | список банд урока + список 6 игр |
| `startGang(g,L)` → `stage()` | мастер из 4 этапов внутри одной банды |
| `gameMemory / gameOdd / gameTrue / gameGap / gameSprint / gameQuiz` | шесть игр |
| `screenColl()` | коллекция: карточки + полка наклеек |
| `screenChant()` | все речёвки целиком (справочник) |

Переход между экранами — простой вызов функции + `slide()` + `toTop()`:

```js
function slide(){if(REDUCED)return;app.classList.remove("slide");void app.offsetWidth;app.classList.add("slide");}
function toTop(){SCR.scrollTop=0;}
```

`void app.offsetWidth` — форсированный reflow, чтобы CSS-анимация перезапустилась. Этот приём
повторяется во всех трёх приложениях.

Состояние — один глобальный объект `S`, сериализуемый целиком:

```js
function blank(){
  return {name:null,xp:0,stars:{},done:{},mast:{},stickers:[],sound:true,
          best:{sprint:0,boss:{}},streak:0,last:null,seen:{}};
}
```

Сохранение — дебаунс 250 мс, с абстракцией на случай хостового `window.storage`:

```js
var STORE={
  get:function(k){
    try{
      if(window.storage&&window.storage.get)return window.storage.get(k).then(function(r){return r?r.value:null;},function(){return null;});
      return Promise.resolve(localStorage.getItem(k));
    }catch(e){return Promise.resolve(null);}
  },
  set:function(k,v){
    try{
      if(window.storage&&window.storage.set)return window.storage.set(k,v);
      localStorage.setItem(k,v);
    }catch(e){}
    return Promise.resolve();
  }
};
var SAVE_T=null;
function save(){
  if(SAVE_T)clearTimeout(SAVE_T);
  SAVE_T=setTimeout(function(){STORE.set("verbGangs",JSON.stringify(S));},250);
}
```

Загрузка на старте мигрирует старые схемы, дозаполняя недостающие ключи из `blank()`:

```js
S=loaded&&typeof loaded==="object"?loaded:blank();
var d=blank();
for(var k in d)if(S[k]===undefined)S[k]=d[k];
```

## 1.3 Каждая интерактивная механика

### (1) Мастер банды: 4 этапа с точками-индикатором

`RUN={g,L,stage,wrong,good,bad,easy}`. Заголовок этапа рисует «шаг N из 4» и ряд точек:

```js
function stageHead(title,idx){
  …
  w.appendChild(el("p","steps",'<span class="stamp '+RUN.g.cls+'" …>'+esc(RUN.g.stamp)+"</span>&nbsp; этап "+(idx+1)+" из 4"));
  var d=el("div","dots");
  for(var i=0;i<4;i++)d.appendChild(el("div","dot"+(i<idx?" on":i===idx?" now":"")));
  …
}
```

Выход из мастера защищён диалогом «Выйти из банды? Этапы придётся начать сначала.»

**Адаптивная сложность** — уникальная и очень удачная деталь. Два счётчика подряд идущих
верных/неверных ответов управляют количеством вариантов и длиной этапа:

```js
function noteGood(r){r.good++;r.bad=0;if(r.good>=3)r.easy=false;if(r.good>=5)award("combo");}
function noteBad(r){r.bad++;r.good=0;r.wrong++;if(r.bad>=2)r.easy=true;}
function optCount(r,first){return (first||r.easy)?2:3;}   // 2 варианта вместо 3
function askLimit(r,total){return r.easy?Math.min(4,total):total;}  // короче этап
```

Первый вопрос всегда с двумя вариантами — чтобы начать с успеха.

### (2) Этап «Знакомство» — карточки-презентации с подсветкой хвоста и озвучкой

Каждый глагол — карточка: русский перевод крупно, три формы моноширинным, общий хвост банды
выделен `<b>` мятным. Подсветка вычисляется, а не хардкодится:

```js
function mark(w,hi){if(!hi)return esc(w);w=String(w);
  return w.length>hi.length&&w.slice(-hi.length)===hi?esc(w.slice(0,-hi.length))+"<b>"+esc(hi)+"</b>":esc(w);}
function tail(g,v){return v.hi||g.hi||"";}   // хвост глагола перекрывает хвост банды
```

Озвучка — Web Speech API, без сети:

```js
function say(t){
  if(!S||!S.sound||!("speechSynthesis" in window))return;
  try{var u=new SpeechSynthesisUtterance(t);u.lang="en-GB";u.rate=.8;
    speechSynthesis.cancel();speechSynthesis.speak(u);}catch(e){}
}
function speakBtn(t){var b=el("button","speak","♪ послушать");b.type="button";b.onclick=function(){say(t);};return b;}
```

`u.rate=.8` — замедленная речь, `en-GB` — британский. Оценивания здесь нет, это чистая
презентация; кнопка «Дальше →».

### (3) Этап «Речёвка» — drag & drop **или** tap-tap, одним кодом

Самая техничная механика файла. Пропуски `.blank` с `dataset.want`, фишки `.chip` с `dataset.w`.
Оба способа взаимодействия сводятся к одной функции `place(chip,slot)`:

```js
ch.addEventListener("pointerdown",function(e){
  if(ch.classList.contains("used"))return;
  var sx=e.clientX,sy=e.clientY,moving=false,fly=null;
  try{ch.setPointerCapture(e.pointerId);}catch(err){}
  function mv(ev){
    if(!moving&&Math.abs(ev.clientX-sx)+Math.abs(ev.clientY-sy)>10){
      moving=true;
      fly=ch.cloneNode(true);fly.className="chip fly";document.body.appendChild(fly);
      ch.classList.add("dragging");
    }
    if(moving){
      fly.style.left=ev.clientX+"px";fly.style.top=ev.clientY+"px";
      var over=document.elementFromPoint(ev.clientX,ev.clientY);
      …
      if(over&&over.classList&&over.classList.contains("blank")&&!over.classList.contains("on"))over.classList.add("hot");
    }
  }
  function up(ev){
    …
    if(moving){
      var t=document.elementFromPoint(ev.clientX,ev.clientY);
      if(t&&t.classList&&t.classList.contains("blank"))place(ch,t);
    }else{
      if(held===ch){clearHeld();}
      else{clearHeld();held=ch;ch.classList.add("held");hintFor(ch);}
    }
  }
  ch.addEventListener("pointermove",mv);ch.addEventListener("pointerup",up);
  ch.addEventListener("pointercancel",up);
});
/* keyboard / no-pointer fallback */
ch.addEventListener("click",function(e){
  if(e.detail!==0)return;            /* real taps are handled by pointer events */
  …
});
```

Разбор приёмов:
- **Порог 10 px** отделяет тап от перетаскивания — одно и то же событие обслуживает оба жеста.
- **Клон-«призрак»** `.chip.fly` в `position:fixed`, оригинал получает `opacity:.35`.
- **`document.elementFromPoint`** вместо HTML5 DnD API — работает на тач-экранах.
- **`e.detail!==0`** отсеивает синтетические клики: клавиатурный `Enter` даёт `detail===0`,
  настоящий тап — нет. Так один обработчик покрывает и клавиатуру.
- `touch-action:none` на `.chip` и `touch-action:manipulation` на всех кнопках — обязательны,
  иначе браузер съест жест.

Проверка правильности — строгое сравнение `slot.dataset.want===chip.dataset.w`. Ошибка:
`beep("no")`, класс `.miss` на 380 мс, счётчик промахов. После **двух** промахов автоматически
включается подсказка первой буквой:

```js
function showTips(){
  slots.forEach(function(s){
    if(!s.classList.contains("on")&&s.textContent==="?"){
      s.textContent=s.dataset.want.charAt(0)+"…";s.classList.add("tip");
    }
  });
}
```

Плюс явная кнопка «показать, куда ставить». При выборе фишки все подходящие пропуски
подсвечиваются `.hot` — то есть после первой же ошибки система начинает помогать.

Заполнили все — конфетти, озвучка всей речёвки, появляется кнопка следующего этапа.

### (4) Этап «Три формы» — множественный выбор с генерируемым дистрактором

Дистракторы не хранятся в данных, а генерируются:

```js
var list=[{t:v.p+" — "+v.pp,ok:true},{t:regular(v.v)+" — "+regular(v.v),ok:false}];
if(optCount(RUN,i===0)>2&&others.length)list.push({t:others[0].p+" — "+others[0].pp,ok:false});
…
function regular(v){
  if(/e$/.test(v))return v+"d";
  if(/[^aeiou]y$/.test(v))return v.slice(0,-1)+"ied";
  return v+"ed";
}
```

Первый дистрактор — **правильная форма по правилу** (`speaked`), то есть ровно та ошибка,
которую ученик и делает. Второй — форма соседнего глагола из той же банды.

Обратная связь и повторные попытки:
- верно → `.opt.good`, звук, озвучка трёх форм, «печать» банды дёргается (`.stamp.thump`),
  все кнопки блокируются, через 700 мс следующий вопрос;
- неверно → `.opt.bad`, кнопка `disabled` (но остальные живы — **можно попробовать снова**),
  открывается панель `.remind` с правилом банды, и через 600 мс правильный вариант получает
  жёлтую обводку `.nudge`;
- «не помню — покажи» → правильный вариант окрашивается `.shown`, звучит, засчитывается как
  промах, через 1500 мс дальше.

```js
function nudge(opts){setTimeout(function(){
  var t=opts.querySelector(".opt.correct:not([disabled])");if(t)t.classList.add("nudge");},600);}
function passBtn(go){var b=el("button","pass","не помню — покажи");b.type="button";b.onclick=go;return b;}
```

Мастерство глагола растёт только при ответе **с первой попытки**: `if(tries===0)markVerb(v,true)`.

### (5) Этап «Что значит» — перевод в обе стороны

Через один вопрос меняется направление: `ruToEn=RUN.easy?false:(i%2===0)`. В «лёгком» режиме
только EN→RU (проще). Дистракторы — случайные глаголы из всех 67 с фильтром по совпадению
перевода: `all.filter(x=>x.v!==v.v&&x.ru!==v.ru)`.

### (6) Игра «Пары» (memory) — 3×3 сетка, 6 пар

```js
var picks=shuffle(verbsOf(L.n)).slice(0,6),cards=[];
picks.forEach(function(v){cards.push({k:v.v,t:v.v,v:v},{k:v.v,t:v.p,v:v});});
cards=shuffle(cards);
```

Пара — «глагол ↔ вторая форма», ключ совпадения `c.k`. Блокировка `lock` на время анимации,
совпадение через 420 мс, промах через 700 мс возвращает рубашки. Значок «без единого промаха»
`award("mem")`. Сетка `repeat(3,1fr)`, на экранах уже 380 px — `repeat(2,1fr)`.

### (7) «Третий лишний» — 8 вопросов

Берёт две банды урока, два глагола из «своей», один из «чужой». Показывает штамп своей банды
в тексте вопроса. Правильно с первой попытки → `right++`. Ошибка не блокирует прохождение,
только не засчитывает.

### (8) «Верю — не верю» — бинарный выбор, 12 вопросов

Генерирует утверждение `verb → form`, где форма либо правильная, либо `regular()`, либо форма
чужого глагола. Есть страховка от случайного совпадения:

```js
var shown=truth?v.p:(Math.random()<.5?regular(v.v):shuffle(pool.filter(function(x){return x.v!==v.v;}))[0].p);
if(shown===v.p)truth=true;
```

Ответ финальный, повтора нет; после ответа всегда печатается правильная строка
«правильно: verb — past — pp» и через 900 мс следующий.

### (9) «Дырка в предложении» — fill-in-the-blank выбором

Предложение с `___`, заменяется на `<u> </u>` (подчёркнутое поле с `padding:0 22px`). При
верном ответе пропуск **заполняется на месте** и озвучивается всё предложение целиком:

```js
c.querySelector(".sent").innerHTML=esc(s[0]).replace("___","<u>"+esc(v.p)+"</u>");
say(s[0].replace("___",v.p));
```

Под предложением всегда виден русский перевод и подсказка «глагол: …» — то есть проверяется
только форма, не понимание. Пул строится по пересечению глаголов урока и словаря `SENT`.

### (10) «Спринт 60 секунд» — таймер со штрафом

```js
iv=setInterval(function(){ left--;tEl.textContent=left; if(left<=0){…} },1000);
```

Ошибка не заканчивает игру, а **отнимает 3 секунды** (`left=Math.max(0,left-3)`) и показывает
правильный ответ на 1100 мс. Рекорд хранится в `S.best.sprint`. Флаг `busy` защищает от
двойного тапа. Кнопка «назад» обязана гасить интервал: `back=function(){if(iv)clearInterval(iv);…}`.

### (11) «Босс» — универсальный квиз, переиспользованный трижды

```js
gameQuiz({verbs:verbsOf(L.n),n:10,title:"Босс урока "+L.n,key:"l"+L.n,back:function(){screenLesson(L);}});
gameQuiz({verbs:allVerbs(),n:15,title:"Финальный босс",key:"final"});
```

Один конфиг-объект: пул, число вопросов, заголовок, ключ рекорда, куда возвращаться. Звёзды
считаются по доле верных с первой попытки: `right>=n-1 ? 3 : right>=n*.6 ? 2 : 1`.

### (12) Наклейки, XP, уровни, стрик

```js
var LEVELS=[[0,"Новичок"],[150,"Ученица"],[400,"Знаток"],[800,"Мастер"],[1400,"Босс банд"]];
function markVerb(v,ok){
  S.mast[v.v]=Math.max(0,(S.mast[v.v]||0)+(ok?1:-1));
  if(ok)addXp(10);
  var m=mastered();
  if(m>=10)award("c10"); if(m>=30)award("c30"); if(m>=67)award("c67");
  save();
}
function mastered(){var c=0;for(var k in S.mast)if(S.mast[k]>=3)c++;return c;}
```

Карточка «открыта» при трёх верных ответах подряд по счётчику, который уменьшается при ошибке.
Наклейки складываются в **очередь** и показываются по одной, после чего управление возвращается
туда, куда пользователь шёл:

```js
var QUEUE=[];
function award(id){ if(S.stickers.indexOf(id)>=0)return; S.stickers.push(id);save(); … QUEUE.push(st); }
function flushThen(next){
  if(!QUEUE.length){if(next)next();return;}
  var st=QUEUE.shift();
  confetti(.7);
  var go=function(){flushThen(next);};
  dialog("Новая наклейка!",'<div style="font-size:52px;line-height:1.1">'+st.e+"</div><b>"+esc(st.t)+"</b>",
    [{label:"Круто",go:go,mint:true}],"gold",go);
}
```

Стрик считается по календарным дням, хранится `S.last`:

```js
function touchStreak(){
  var t=today(),d=daysBetween(S.last,t);
  if(d===1)S.streak++;else if(d!==0)S.streak=1;
  S.last=t;
  if(S.streak>=3)award("streak");
  save();
}
```

### (13) Звук — синтезированный, без файлов

```js
function beep(kind){
  if(!S||!S.sound)return;
  try{
    AC=AC||new (window.AudioContext||window.webkitAudioContext)();
    var seq=kind==="ok"?[660,880]:[240,180];
    seq.forEach(function(f,i){
      var o=AC.createOscillator(),g=AC.createGain();
      o.type=kind==="ok"?"triangle":"sine";o.frequency.value=f;
      g.gain.setValueAtTime(.0001,AC.currentTime+i*.09);
      g.gain.exponentialRampToValueAtTime(.12,AC.currentTime+i*.09+.02);
      g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+i*.09+.16);
      o.connect(g);g.connect(AC.destination);
      o.start(AC.currentTime+i*.09);o.stop(AC.currentTime+i*.09+.18);
    });
  }catch(e){}
}
```

Верно — восходящая пара 660→880 Гц треугольником, ошибка — нисходящая 240→180 синусом.
Ноль сетевых запросов, ноль ассетов. Тумблер `♪ / ✕♪` в шапке пишется в состояние.

### (14) Конфетти на `<canvas>`

Единый паттерн во всех приложениях: `#fx{position:fixed;inset:0;pointer-events:none;z-index:140}`,
частицы-прямоугольники с гравитацией и вращением, `power` от 0 до 1 масштабирует количество:

```js
function confetti(power){
  if(REDUCED)return;
  var cols=["#FF4D9D","#4BE3C4","#FFD166","#B08CFF","#C6F24E"],
      n=Math.round(50+110*(power==null?1:Math.max(0,Math.min(1,power))));
  for(var i=0;i<n;i++)parts.push({x:innerWidth/2+(Math.random()-.5)*innerWidth*.7,y:innerHeight*.3+Math.random()*40,
    vx:(Math.random()-.5)*8,vy:Math.random()*-10-3,g:.25+Math.random()*.12,s:5+Math.random()*8,
    r:Math.random()*6,vr:(Math.random()-.5)*.35,c:cols[i%cols.length],life:110+Math.random()*60});
  if(!raf)tick();
}
```

Вызывается с долей верных ответов: `confetti(right/N)` — то есть праздник пропорционален
результату, а при нуле его почти нет. `if(REDUCED)return` — уважение к `prefers-reduced-motion`.

### (15) Диалог — один на всё приложение

```js
/* buttons: [{label, go, ghost, mint}] · tone: ok|plain|gold · dismiss: что делает тап по фону */
function dialog(title,body,buttons,tone,dismiss){…}
```

Тон меняет только цвет верхней полосы листа (`border-top:5px solid`). Закрытие по фону и по
`Escape` вызывает тот же `dismiss`, что и кнопка — то есть отменить случайно нельзя.
Фокус ставится на «безопасную» кнопку: `row.querySelector(".btn.ghost")||row.querySelector(".btn")`.

## 1.4 Модель данных

Одна большая `var GANGS=[…]` в начале единственного `<script>`. Поля короткие
(`v/p/pp/ru/hi`), русское — рядом с английским в той же записи.

```js
var GANGS=[
 {n:1,lesson:1,stamp:"-ОТ",cls:"c-hot",name:"Банда «ООООТ»",
  rule:"Все формы кончаются на -ought или -aught. Один хвост на шестерых.",
  hook:["Слышишь общий хвостик «-ОТ»?","Это банда, целый взвод!"],hi:"ought",
  verbs:[{v:"bring",p:"brought",pp:"brought",ru:"приносить"},{v:"buy",p:"bought",pp:"bought",ru:"купить"},
   {v:"teach",p:"taught",pp:"taught",ru:"учить",hi:"aught"},{v:"catch",p:"caught",pp:"caught",ru:"ловить",hi:"aught"},
   {v:"think",p:"thought",pp:"thought",ru:"думать"},{v:"fight",p:"fought",pp:"fought",ru:"сражаться"}]},
 {n:2,lesson:1,stamp:"И-А-У",cls:"c-mint",name:"Банда «И — А — У»",
  rule:"Меняется только гласная в середине: i → a → u. Как гудок паровоза.",
  hook:["И — А — У! И — А — У!","Я гудок себе пою!"],
  verbs:[{v:"begin",p:"began",pp:"begun",ru:"начинать"},{v:"drink",p:"drank",pp:"drunk",ru:"пить"},
   {v:"sing",p:"sang",pp:"sung",ru:"петь"},{v:"swim",p:"swam",pp:"swum",ru:"плыть"},
   {v:"ring",p:"rang",pp:"rung",ru:"звонить"}]},
 …
 {n:7,lesson:2,stamp:"= = =",cls:"c-mint",name:"Банда лентяев",
  rule:"Не меняются вообще. Три одинаковые формы — халява.",
  hook:["Три одинаковых подряд —","Самый лучший в мире ряд!"],
  verbs:[{v:"cut",p:"cut",pp:"cut",ru:"резать"},{v:"put",p:"put",pp:"put",ru:"класть"},
   {v:"cost",p:"cost",pp:"cost",ru:"стоить"},{v:"hit",p:"hit",pp:"hit",ru:"ударять"},
   {v:"let",p:"let",pp:"let",ru:"разрешать"},{v:"read",p:"read",pp:"read",ru:"читать («рид — рэд — рэд»)"}]}
];

var LESSONS=[
 {n:1,name:"Урок 1 — звуковые банды",sub:"Глаголы, которые звучат одинаково",cls:"c-hot",ico:"🎸"},
 {n:2,name:"Урок 2 — хвостики",sub:"-t, -old, -en и банда лентяев",cls:"c-mint",ico:"🧩"},
 {n:3,name:"Урок 3 — самые главные",sub:"Двадцать глаголов на каждый день",cls:"c-sun",ico:"👑"}
];

/* one short sentence per verb, used by the gap game */
var SENT={
 buy:["Yesterday I ___ a new phone.","Вчера я купил новый телефон."],
 drink:["She ___ tea yesterday.","Она пила чай вчера."],
 sing:["We ___ a song at the party.","Мы пели песню на вечеринке."],
 …
};

var STICKERS=[
 {id:"first",e:"🌈",t:"Первая банда"},
 {id:"three",e:"🍩",t:"Три звезды"},
 {id:"l1",e:"🐱",t:"Урок 1 закрыт"},
 …
];
var LEVELS=[[0,"Новичок"],[150,"Ученица"],[400,"Знаток"],[800,"Мастер"],[1400,"Босс банд"]];
```

Точные объёмы: **12 банд, 67 глаголов, 24 предложения в `SENT`, 14 наклеек, 5 уровней,
3 урока, 6 игр.**

Производные выборки — крошечные чистые функции, данные ни разу не дублируются:

```js
function gangsOf(l){return GANGS.filter(function(g){return g.lesson===l;});}
function verbsOf(l){var a=[];gangsOf(l).forEach(function(g){g.verbs.forEach(function(v){a.push(v);});});return a;}
function allVerbs(){var a=[];GANGS.forEach(function(g){g.verbs.forEach(function(v){a.push(v);});});return a;}
function gangOfVerb(v){for(var i=0;i<GANGS.length;i++)if(GANGS[i].verbs.indexOf(v)>=0)return GANGS[i];return GANGS[0];}
```

## 1.5 Визуальная система

Тёмная, «постерная», неоновая. Блок `:root` дословно:

```css
:root{
  --night:#1B1233; --panel:#2A1D4D; --panel2:#352561; --edge:#443073;
  --hot:#FF4D9D; --mint:#4BE3C4; --sun:#FFD166; --violet:#B08CFF; --lime:#C6F24E;
  --ink:#F6F0FF; --dim:#A79BC8; --no:#FF7A8A;
  --disp:"Arial Black","Haettenschweiler","Franklin Gothic Heavy",Impact,sans-serif;
  --body:"Trebuchet MS","Segoe UI",system-ui,sans-serif;
  --mono:"Courier New",ui-monospace,monospace;
}
```

Три шрифтовых роли, **все системные, ничего не грузится**:
- `--disp` — сверхжирный гротеск, только `text-transform:uppercase`, для заголовков, штампов,
  «речёвок», таймера;
- `--body` — обычный текст и всё русское;
- `--mono` — **весь английский язык**: формы глаголов, варианты ответов, предложения. Это
  ключевое решение: моноширинный = «материал урока», пропорциональный = «инструкция».

Фон — цвет плюс два радиальных градиента-пятна в `body::before` с `pointer-events:none`:

```css
body::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;
  background:radial-gradient(900px 500px at 15% -10%,rgba(255,77,157,.18),transparent 60%),
             radial-gradient(800px 500px at 95% 8%,rgba(75,227,196,.13),transparent 60%)}
```

Радиусы: карточки и плитки `20px`, диалог `22px`, кнопки `14px`, варианты ответа `16px`,
фишки `999px`, шапочные кнопки `11px`. Теней почти нет (тёмная тема) — глубина строится
границей `1px solid var(--edge)` и заливкой `--panel2` поверх `--panel`.

Цвет = смысл, строго:

```css
.opt.good{background:rgba(75,227,196,.16);border-color:var(--mint);color:var(--mint)}   /* верно */
.opt.bad{background:rgba(255,122,138,.14);border-color:var(--no);color:var(--no)}       /* неверно */
.opt.nudge{border-color:var(--sun);box-shadow:0 0 0 3px rgba(255,209,102,.22)}          /* «сюда» */
.opt.shown{background:rgba(255,209,102,.14);border-color:var(--sun);color:var(--sun)}   /* показанный ответ */
```

Приём «штамп» — фирменная деталь: повёрнутая на −4° рамка в 3 px текущим цветом.

```css
.stamp{display:inline-block;font-family:var(--disp);font-size:19px;padding:6px 13px;border:3px solid currentColor;
  border-radius:12px;transform:rotate(-4deg);text-transform:uppercase;line-height:1}
.stamp.thump{animation:thump .34s cubic-bezier(.3,1.4,.5,1)}
@keyframes thump{0%,100%{transform:rotate(-4deg) scale(1)}40%{transform:rotate(-4deg) scale(1.16)}}
```

Анимации короткие и наперечёт: `slideIn .3s`, `pop .26s`, `shake .28s`, `thump .34s`,
прогресс-бар `width .45s cubic-bezier(.33,1,.68,1)`. Кривая `cubic-bezier(.33,1,.68,1)`
(ease-out-cubic) — единая для всего семейства.

## 1.6 Мобильность

Разработано мобайл-фёрст: `max-width:640px` контейнер, `100dvh`, крупные тач-цели
(`padding:14px 18px` у кнопок, `15px 16px` у вариантов), `-webkit-tap-highlight-color:transparent`,
`touch-action:manipulation`.

Медиазапросов всего три:

```css
@media (max-width:380px){.grid{grid-template-columns:repeat(2,1fr)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
@media (hover:hover){
  .hbtn:hover{color:var(--ink);border-color:var(--violet)}
  .tile:hover{transform:translateY(-2px);border-color:var(--violet)}
  .btn:hover{filter:brightness(1.06)}
  .opt:hover{border-color:var(--violet)}
  …
}
```

`@media (hover:hover)` — важная деталь: на тач-устройствах hover-стили не «залипают» после тапа.
Размеры заголовков — `clamp()`: `h1{font-size:clamp(28px,8.5vw,44px)}`.

На телефоне приложение полностью рабочее; вероятнее всего оно на телефоне и живёт.

## 1.7 Что даёт преподавателю

- **`screenChant()`** — экран «Речёвка целиком»: все 12 банд, все 67 глаголов с переводом,
  подсвеченными хвостами и кнопкой озвучки. Готовый раздаточный экран для чтения вслух.
- **`screenColl()`** — визуальный отчёт: сколько карточек открыто, что ещё не выучено
  («ещё 2 верных»), сколько наклеек. Виден прогресс без вопросов.
- **Кнопка «не помню — покажи»** в каждом упражнении — ученик не залипает.
- **Панель `.remind`** с правилом банды всплывает после ошибки — правило под рукой.
- **Кнопка «×»** в шапке — полный сброс с подтверждением.
- **Тумблер звука** — можно выключить в классе.
- Прогресс-бар в шапке = доля выученного от всех 67.

Печатных стилей (`@media print`) нет ни в одном файле семейства.

## 1.8 Русский / английский

- **Интерфейс, инструкции, правила, названия банд, речёвки, диалоги, наклейки — русский.**
- **Материал урока — английский**: формы глаголов, предложения `SENT`, озвучка (`en-GB`).
- Русский перевод глагола всегда рядом (`.ruBig` жёлтым) — это не проверка перевода, а якорь.
- Гибрид встречается в бренде: «Банды глаголов<i>irregular verbs</i>» — русское крупно,
  английское мелким капсом под ним.
- `<html lang="ru">`.

## 1.9 Организация кода

Один `<style>` в `<head>`, один `<script>` перед `</body>`, никаких внешних ресурсов вообще
(единственный `<link>` — локальный `favicon.svg`). `"use strict"`, ES5-синтаксис целиком
(`var`, `function`, `.forEach`, никаких стрелок/`let`/шаблонных строк) — сознательная
совместимость со старыми телефонами.

Порядок блоков в скрипте, размечен комментариями-разделителями:

```
/* ==================== verb data ==================== */      GANGS, LESSONS, SENT, STICKERS, LEVELS
/* ==================== state + storage ============== */      blank(), STORE, save(), streak
/* ==================== helpers ====================== */      el(), esc(), shuffle(), toTop(), mark()
/* ==================== sound ======================== */      beep(), say(), speakBtn()
/* ==================== confetti ===================== */      confetti(), tick()
/* ==================== dialog ======================= */      dialog(), award(), flushThen()
/* ==================== header ======================= */      paintHeader() + обработчики шапки
/* ==================== screens ====================== */      screenStart/Home/Lesson
/* ==================== gang: 4 stages =============== */      stage*(), gangDone()
/* ==================== games ======================== */      gameMemory/Odd/True/Gap/Sprint/Quiz
/* ==================== collection & chant =========== */      screenColl(), screenChant()
/* ==================== boot ========================= */      boot()
```

Размер функций: большинство 15–40 строк; самая большая — `stageChant()` ≈ 95 строк (вся
drag&drop-логика), `gameQuiz()` ≈ 55. Хелпер-однострочники:

```js
function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
```

`el()` + `esc()` — база всего рендера; JSX не нужен, шаблонизатора нет. **Библиотек нет,
CDN нет, сеть не нужна.** Файл работает из `file://`.

---

# 2. numbers-lab — «Numbers Lab by Valeria»

## 2.1 Назначение и педагогика

Домашняя работа уровня A2 по чтению чисел вслух по-британски: порядковые, даты, годы, дроби,
проценты, десятичные, температуры, большие числа. Приложение само заявляет длительность:

```js
head.appendChild(el("div","topline",'<span>'+done+' of '+BLOCKS.length+' blocks finished</span><span>'+
    DONE_ITEMS+' / '+TOTAL_ITEMS+' tasks · ~20 min</span>'));
```

и на старте: *«Dates, fractions, percentages, decimals, temperatures, years and big numbers.
About 20 minutes.»* Реально — 20–35 минут на основную часть, плюс до 4 минут на каждый
дополнительный раунд (их 7 по 6 заданий).

Педагогическая последовательность жёсткая и явная: **имя → правила → задания**, три шага,
показанные чипсами `1 · Your name / 2 · The rules / 3 · The tasks`. Справочник читается
до практики и остаётся доступен из любого задания.

Тип упражнений подобран по принципу «одна тема — разные каналы»: написать словами, найти
ошибку, соединить пару, узнать цифры по произнесённой фразе, собрать из блоков, проговорить
вслух и итоговый смешанный блок. Это не 7 разных тем, а 7 разных **способов** работы с одними
и теми же 8 темами.

Персонализация: 4 конкретных ученика по имени, и от выбора имени зависит цветовая тема
(тёплая/холодная) и текст похвалы в финале.

## 2.2 Архитектура экранов и навигация

Тот же скелет, что в verb-gangs: фиксированный `#hdr`, единственный скроллер `#scroller`,
всё рисуется в `#app`. Но навигация богаче — двухстраничный сегмент-переключатель в шапке
плюс «глубина» внутри страницы:

```html
<header id="hdr" class="bare">
  <div id="top"><i></i></div>
  <div class="seg">
    <button class="sg" id="segRules" type="button"><span class="ico">◀</span> Rules</button>
    <button class="sg" id="segTasks" type="button">Tasks <span class="ico">▶</span></button>
    <span class="pct" id="pct"></span>
    <button class="sg xbtn" id="segReset" type="button" title="Start over" aria-label="Start over">×</button>
  </div>
</header>
```

Состояние экрана — две переменные: `S.screen` («rules» | «tasks») и `S.deep` (внутри блока
или на списке блоков). Роутер — одна функция:

```js
function render(){
  app.innerHTML="";
  S.deep=false;
  paintHeader();
  if(!S.name)return screenStart();
  if(S.screen==="rules")return screenRules();
  return screenTasks();
}
function switchPage(target,dir){
  if(!S.name)return;
  if(S.screen===target&&!S.deep)return;   /* already here and not inside a block — do nothing */
  askLeave(function(){S.screen=target;render();slide(dir);toTop();});
}
```

Направление перехода задаёт анимацию: `pg-r` (вправо, «вперёд») / `pg-l` (влево, «назад»).

**Защита от потери ответов** — редкая и важная деталь. Уход из блока спрашивает подтверждение,
но только если в блоке уже что-то сделано:

```js
function askLeave(go){
  if(!document.querySelector(".card.solved,.fb.show,.tile.gone,.chip.used")){go();return;}
  confirmBox("Leave this block?",
    "Ответы в этом блоке не сохранятся — придётся проходить его заново.",
    "Yes, leave","Stay here",go);
}
```

Проверка «есть ли работа» — не по состоянию, а по DOM-селекторам. Дёшево и работает для всех
шести типов блоков сразу.

**Персистентности нет вообще.** Прямо предупреждает на старте: *«Делай всё за один раз: если
закрыть страницу, прогресс не сохранится.»* Это осознанный выбор для домашки, которую делают
в один присест и показывают на уроке.

Состояние:

```js
var S={name:null,ru:null,theme:"warm",screen:"rules",prog:{},mistakes:[]};
var STATS={};      /* topic -> {seen, miss} */
var SCORED_SEEN=0; /* how many scored tasks were actually attempted */
var BONUS={};      /* topic -> {score, total} */
var TOTAL_ITEMS=0,DONE_ITEMS=0;
BLOCKS.forEach(function(b){TOTAL_ITEMS+=b.items.length;});
BLOCKS.forEach(function(b){ S.prog[b.id]={done:false,score:0,seen:0,total:scoredTotal(b)}; });
function scoredTotal(b){ return b.kind==="cards"?0:b.items.length; }
```

Обратите внимание: у блока флеш-карточек `total=0` — он засчитывается как пройденный, но
никогда не влияет на счёт. «Проговорить вслух» нельзя оценить, и приложение это признаёт.

## 2.3 Каждая интерактивная механика

### (1) Выбор имени с явным «шлюзом»

Не просто плитки — сначала выбор подсвечивается зелёным (`aria-pressed=true`), и только потом
кнопка внизу перестаёт быть выключенной и **меняет надпись на имя**:

```js
b.onclick=function(){
  chosen=st;
  btns.forEach(function(x){x.setAttribute("aria-pressed","false");});
  b.setAttribute("aria-pressed","true");
  go.disabled=false;
  go.textContent="Continue as "+st.name+" →";
};
```

Кнопка в исходном состоянии называется «Select your name first» — то есть надпись сама
объясняет, почему она неактивна. Выбор имени меняет тему: `document.body.className=(chosen.t==="cool"?"cool":"")`.

### (2) Справочник правил в `<template>`, клонируемый дважды

```html
<template id="rulesTpl">
<div class="rules">
  <p class="eyebrow">Reference — правила</p>
  <h2>How to say numbers</h2>
  …7 × <section class="rsec" data-n="N">…
</div>
</template>
```

Один и тот же контент вставляется и на страницу правил, и в плавающую шпаргалку:

```js
app.appendChild(document.getElementById("rulesTpl").content.cloneNode(true));
…
function openCheat(){
  if(!mBody.firstChild)mBody.appendChild(document.getElementById("rulesTpl").content.cloneNode(true));
  modal.classList.add("open");
  cheatBtn.classList.add("on");
  cheatBtn.textContent="Close";
}
```

Плавающая кнопка `#cheatBtn` — `position:fixed;right:16px;bottom:16px`, всегда доступна поверх
любого задания. Закрывается по клику в фон и по `Escape`. Это лучший ход всего файла:
**справочник никогда не дальше одного тапа.**

Разметка правил: пронумерованные секции с цветным квадратом-номером, таблицы в скроллящейся
обёртке `.tw{overflow-x:auto}`, английские ячейки `td.en` шрифтом Georgia, русские комментарии
`.ru` серым, ошибочные варианты `.no` (красный) против верных `.yes` (зелёный).

### (3) Ввод текстом с многоуровневой диагностикой ошибки

Главная механика приложения и его самая ценная часть для переноса. Функция `check()` не просто
сравнивает строки — она **классифицирует тип ошибки** и объясняет её.

Нормализация:

```js
function norm(s){
  return String(s).toLowerCase()
    .replace(/[’']/g,"")
    .replace(/[-–—]/g," ")
    .replace(/[.,!?;:"()°]/g," ")
    .replace(/\s+/g," ").trim();
}
```

Дефисы превращаются в пробелы, апострофы выкидываются, пунктуация — в пробелы. То есть
`twenty-second` и `twenty second` — одно и то же. Расстояние Левенштейна реализовано вручную
(15 строк) и используется для опечаток.

Сам классификатор (целиком, это эталон):

```js
/* status: ok | ok-note | digits | and | struct | brit | ordinal | plural | typo | wrong */
function check(input,item){
  var n=norm(input);
  if(!n)return{status:"wrong",msg:"Пустое поле — напиши свой вариант."};
  var main=norm(item.a);
  if(n===main)return{status:"ok"};
  var alts=item.alt||[];
  for(var k=0;k<alts.length;k++){
    if(n===norm(alts[k]))return{status:"ok-note",msg:item.altNote||""};
  }
  if(/\d/.test(n))return{status:"digits",msg:"Здесь нужно <b>словами</b>, без цифр."};

  /* variants a real British speaker would use — accepted, with a nudge to the book form */
  function soft(){return{status:"ok-note",msg:"Тоже верно. В учебнике — <b>"+esc(item.a)+"</b>."};}
  function aOne(x){return x.replace(/\ba\b/g,"one");}
  if(aOne(n)===aOne(main))return soft();                      /* a hundred = one hundred */
  if(/ celsius$/.test(main)&&n===main.replace(/ celsius$/,""))return soft();   /* ...degrees */
  if(main.indexOf("the ")===0&&main.indexOf(" of ")<0&&n===main.slice(4))return soft(); /* bare ordinal */

  var uw=n.split(" "),mw=main.split(" ");

  if(n.indexOf("percent")>=0 && norm(n.replace(/percent/g,"per cent"))===main)
    return{status:"brit",msg:"Почти! В британском варианте — <b>per cent</b>, в два слова."};

  if(drop(uw,["and"]).join(" ")===drop(mw,["and"]).join(" ")){
    return uw.length<mw.length
      ? {status:"and",msg:"Почти! Не хватает <b>and</b>: <b>"+esc(item.a)+"</b>. and ставится перед последней частью меньше 100."}
      : {status:"and",msg:"Почти! Здесь <b>and</b> лишний: <b>"+esc(item.a)+"</b>."};
  }
  if(drop(uw,["the","of"]).join(" ")===drop(mw,["the","of"]).join(" ")){
    return{status:"struct",msg:main.indexOf(" of ")>=0
      ? "Почти! Дату по-британски произносят с <b>the … of …</b>: <b>"+esc(item.a)+"</b>."
      : "Почти! Не хватает <b>the</b>: <b>"+esc(item.a)+"</b>."};
  }
  if(uw.length===mw.length){
    var ord=null,plu=null,typo=[],fail=false;
    for(var i=0;i<uw.length;i++){
      if(uw[i]===mw[i])continue;
      if(CARD2ORD[uw[i]]===mw[i]){ord=[uw[i],mw[i]];}
      else if(uw[i]===mw[i]+"s"){plu=["extra",mw[i]];}
      else if(mw[i]===uw[i]+"s"){plu=["missing",mw[i]];}
      else if(lev(uw[i],mw[i])<=1){typo.push(mw[i]);}
      else fail=true;
    }
    if(!fail&&ord)
      return{status:"ordinal",msg:"Почти! Нужно порядковое числительное: <b>"+esc(ord[1])+"</b>, а не "+esc(ord[0])+"."};
    if(!fail&&plu)
      return plu[0]==="extra"
        ? {status:"plural",msg:"Почти! Здесь <b>без -s</b>: "+esc(plu[1])+"."}
        : {status:"plural",msg:"Почти! Здесь нужно <b>-s</b>: "+esc(plu[1])+"."};
    if(!fail&&typo.length&&typo.length<=2)
      return{status:"typo",msg:"Почти! Проверь букву: <b>"+esc(typo.join(", "))+"</b>."};
  }
  if(lev(n,main)<=1)return{status:"typo",msg:"Почти! Одна буква не та — присмотрись."};
  return{status:"wrong",msg:""};
}
```

Иерархия строгая: точное совпадение → допустимый вариант из `alt` → «цифрами нельзя» →
разговорные варианты, которые принимаются с оговоркой → британизм `percent/per cent` →
пропущенный/лишний `and` → пропущенные `the/of` → пословное сравнение (порядковое вместо
количественного, лишний/недостающий `-s`, опечатка на одну букву) → полный промах.

Четыре цвета обратной связи: зелёный `.fb.ok` (верно), **янтарный `.fb.almost` («почти!»)**,
красный `.fb.bad` (не то), синий `.fb.hint` (подсказка). Янтарный уровень — это и есть
педагогика: между «правильно» и «неправильно» есть «ты почти, вот что именно не так».

Эскалация подсказок в `writeCard()`:

```js
chk.onclick=function(){
  if(solved)return;
  tries++;
  var r=check(inp.value,it);
  if(r.status==="ok"){done();return;}
  if(r.status==="ok-note"){done(r.msg);return;}
  settle(false);
  if(!logged){logMistake(blockTitle,it.d,inp.value,it.a,it.rule||"",topic);logged=true;}
  card.classList.remove("pop");card.classList.add("shake");
  setTimeout(function(){card.classList.remove("shake");},320);
  if(r.status==="wrong"){
    fb.className="fb bad show";
    fb.innerHTML=tries>=5
      ?"<span class=\"ru\">Правильный вариант: </span><b>"+esc(it.a)+"</b><br><span class=\"ru\">Впиши его сам — так запомнится. "+esc(it.rule||"")+"</span>"
      :tries>=3
      ?"Не то. Подсказка: <b>"+esc(it.hint)+"</b><br><span class=\"ru\">"+esc(it.rule||"")+"</span>"
      :"Не то. Попробуй ещё раз — или жми Hint.";
    if(tries>=3)usedHint=true;
  }else{
    fb.className="fb almost show";
    fb.innerHTML=r.msg;
    if(tries>=3)fb.innerHTML+="<br><b>"+esc(it.a)+"</b>";
  }
};
```

1–2 попытка — «попробуй ещё»; 3-я — автоматическая подсказка-скелет (`the f_____ of March`)
плюс правило; 5-я — прямо даётся ответ с просьбой **вписать его самому**. Плюс всегда есть
ручная кнопка `Hint`. Ученик не может застрять; но «чистый» балл теряется:

```js
var clean=(tries===1&&!usedHint);
```

Карточка при решении получает `.card.solved` (зелёный фон) + анимацию `.pop`; поле ввода
`disabled` со светло-зелёным фоном. Похвала персональная: «— с первого раза, Rita!»
Ввод отправляется и по `Enter`: `inp.addEventListener("keydown",function(e){if(e.key==="Enter")chk.click();});`

### (4) Множественный выбор (`mcCard`)

Живёт в том же блоке, что и ввод: элемент с `type:"mc"` рендерится другой функцией. Неверная
кнопка красится и блокируется, остальные живы — можно пробовать дальше. При верном ответе
показывается `it.ex` — объяснение **почему**, а не просто «верно».

### (5) «Найди ошибку» — двухходовое упражнение

Уникальная механика: сначала **тапнуть слово** в предложении, потом **выбрать замену**.

```js
it.w.forEach(function(w,i){
  var btn=el("button","word",esc(w));btn.type="button";
  btn.onclick=function(){
    if(fixed)return;
    if(i===it.i){
      found=true;btn.classList.add("found");
      fb.className="fb almost show";fb.innerHTML="Yes — this is the problem. <span class=\"ru\">Теперь выбери замену.</span>";
      buildOpts(btn);
    }else{
      wrongTaps++;btn.classList.add("miss");
      setTimeout(function(){btn.classList.remove("miss");},420);
      fb.className="fb bad show";
      fb.innerHTML=wrongTaps>=3
        ?"<span class=\"ru\">Здесь всё в порядке. Подсказка: ошибка в слове номер "+(it.i+1)+".</span>"
        :"<span class=\"ru\">Это слово правильное. Ищи дальше.</span>";
      …
    }
  };
  sent.appendChild(btn);sent.appendChild(document.createTextNode(" "));
});
```

Варианты замены появляются **только после того**, как найдено слово, — то есть подсказки в них
нет. После верной замены слово заменяется на месте прямо в предложении, а элемент с флагом
`del:true` превращается в «—» (удаление лишнего слова):

```js
wordBtn.classList.remove("found");wordBtn.classList.add("fixed");
wordBtn.textContent=it.del?"—":o;
…
fb.innerHTML="✓ <b>"+esc(correctSentence(it))+"</b><br><span class=\"ru\">"+esc(it.ex)+"</span>";
```

После 3 неудачных тапов подсказывается **номер** слова, не само слово. Три состояния слова:
`.miss` (красный, 420 мс), `.found` (янтарный, найдено), `.fixed` (зелёный, исправлено).
Слово в предложении — это `<button class="word">` с пунктирным подчёркиванием.

### (6) Сопоставление в две колонки

Не drag&drop, а «тап слева → тап справа». Правая колонка перемешана. Заголовки колонок
`the figures` / `how to say it`.

```js
t.onclick=function(){
  if(t.classList.contains("gone"))return;
  if(sel===null){fb.className="fb hint show";fb.innerHTML="<span class=\"ru\">Сначала выбери число слева.</span>";return;}
  var lt=lb.filter(function(x){return +x.dataset.i===sel;})[0];
  if(o.i===sel){
    t.className="tile gone";lt.className="tile n gone";matched++;
    tally(topicOf(b.id,sel),!spoiled[sel]);bump();seen++;
    fb.className="fb ok show";fb.innerHTML="✓ <b>"+esc(b.items[sel].d)+" = "+esc(b.items[sel].a)+"</b>";
    sel=null;
    if(matched===b.items.length){fb.innerHTML="✓ All pairs matched, "+S.name+"!";}
  }else{
    t.classList.add("err");
    setTimeout(function(){t.classList.remove("err");},420);
    spoiled[sel]=true;
    …
  }
};
```

Найденная пара не исчезает, а «гаснет» зелёным (`.tile.gone`) — остаётся видна как результат.
`spoiled[i]` помнит, что пару угадали не с первого раза. Пары подобраны как **минимальные
контрасты**: `1905/1950/1915/2015`, `03/12` против `12/03` — упражнение целится в конкретную
путаницу, а не в случайные пары.

### (7) «Быстрый круг» (reverse) — от слов к цифрам

Обычный множественный выбор, но промпт — произнесённая фраза в кавычках, а варианты — цифры.
Это разворот основного навыка: не «напиши словами», а «пойми, о каком числе речь».

### (8) «Собери фразу» из блоков-фишек

Пул фишек + слот. Ключевая деталь: в пуле есть **лишние** фишки-ловушки (`it.x`), и это прямо
сказано в подсказке при ошибке: *«Лишние блоки в наборе есть — не все нужны.»*

```js
var all=it.a.concat(it.x).slice().sort(function(){return Math.random()-.5;});
…
chk.onclick=function(){
  …
  var mine=chosen.map(function(x){return x.w;}).join(" ");
  if(norm(mine)===norm(it.a.join(" "))){ … }
  else{
    card.classList.add("shake");setTimeout(function(){card.classList.remove("shake");},320);
    fb.innerHTML=tries>=3
      ?"<span class=\"ru\">Смотри: правильный порядок — </span><b>"+esc(it.a.join(" "))+"</b>…"
      :"<span class=\"ru\">Пока не то. Лишние блоки в наборе есть — не все нужны.</span>";
    …
  }
};
```

Фишку из слота можно вынуть обратно тапом; есть кнопка `Clear`. Проверка через ту же `norm()`.
Пустой слот подписывает себя сам:

```css
.slot:empty::before{content:"tap the words below";color:#C9BCC6;font-size:14px}
```

### (9) Флеш-карточки с «переворотом» и самооценкой

Переворот — не 3D-флип, а двухфазный трюк: карточка сжимается по Y-оси до 84°, в этот момент
подменяется содержимое, потом разжимается.

```css
.deck-face{transition:transform .19s cubic-bezier(.4,0,.6,1),box-shadow .19s ease}
.deck-face.flipping{transform:rotateY(84deg);box-shadow:0 4px 14px rgba(120,90,110,.14)}
```

```js
face.onclick=function(){
  if(i>=b.items.length||flipped)return;
  flipped=true;
  var back='<div class="tip">'+esc(b.items[i].d)+'</div><div class="say">'+esc(b.items[i].a)+
           '</div><div class="tip">did you say it like this?</div>';
  if(REDUCED){face.innerHTML=back;kn.disabled=pr.disabled=false;return;}
  face.classList.remove("an-up");face.style.animationDelay="";
  face.classList.add("flipping");
  setTimeout(function(){
    face.innerHTML=back;
    face.classList.remove("flipping");
    kn.disabled=pr.disabled=false;
  },190);
};
kn.onclick=function(){if(!flipped)return;knew++;i++;bump();draw();};
pr.onclick=function(){if(!flipped)return;practise++;i++;bump();draw();};
```

Кнопки `I knew it` / `Need practice` **выключены до переворота** — нельзя оценить себя, не
увидев ответа. Оценивания нет, есть честная подпись:

> «Здесь нет правильных и неправильных ответов — важно произнести вслух до того, как перевернёшь карточку.»

### (10) Закрытие блока с осмысленным вердиктом

`finishBar()` — общая для всех шести типов блоков. Разбирает 4 разных исхода:

```js
if(info.seen===0){
  tone="plain";title="Block closed with no answers";
  body="Задания этого блока остались непройденными. Если где-то застрянешь — в каждом есть кнопка <b>Hint</b>…";
}else if(isCards){
  confetti(.6); tone="ok";title="Deck finished, "+S.name;
  body="Ты проговорил <b>"+info.seen+"</b> карточек вслух — это и была задача.";
}else if(info.score===0){
  tone="almost";title="Every answer needed a correction";
  body="До правильного ответа ты дошёл везде, но каждый раз со второй попытки…";
}else{
  var ratio=total?info.score/total:1;
  confetti(ratio);
  tone="ok";
  title=info.score===total?("Every single one first time, "+S.name+"!"):("Nice work, "+S.name+"!");
  body='<div class="score-line">'+info.score+" / "+total+"</div>"+…;
}
```

Пустой блок помечается в меню оранжевым флажком `empty` — преподаватель видит, что блок
«закрыт», но не сделан. Закрытие пустого блока требует подтверждения.

После закрытия приложение **само подсвечивает следующий незакрытый блок**: прокручивает к нему
и на 2.4 с включает пульсирующую рамку.

```css
@keyframes ring{0%,100%{box-shadow:var(--shadow)}45%{box-shadow:0 0 0 4px var(--acc),var(--shadow)}}
.focusme{animation:ring 1.4s cubic-bezier(.33,1,.68,1) 1}
```

```js
setTimeout(function(){
  var node=target||document.querySelector(".btn.wide");
  if(!node)return;
  try{node.scrollIntoView({behavior:REDUCED?"auto":"smooth",block:"center"});}
  catch(e){try{node.scrollIntoView();}catch(e2){}}
  node.classList.add("focusme");
  setTimeout(function(){node.classList.remove("focusme");},2400);
},40);
```

### (11) Экран результатов: диагностика по темам + разбор ошибок

Три части.

**Счёт.** `got / total`, процент «first-time correct», отдельно — сколько заданий осталось
без ответа. Текст вердикта — три уровня по проценту (≥85 / ≥60 / ниже).

**Диагностика по темам.** Каждое задание помечено темой не в самих данных, а отдельной
картой соответствия:

```js
var TOPIC_MAP={
 write:  ["dates","fractions","percent","decimals","temp","years","fractions","big"],
 error:  ["dates","dates","percent","fractions","big","decimals","years","big"],
 match:  ["years","years","years","years","dates","dates"],
 reverse:["years","years","dates","decimals","fractions","big","temp","percent"],
 build:  ["dates","years","big","percent","temp"],
 boss:   ["dates","years","big","fractions","decimals","temp","dates","big"]
};
function topicOf(id,i){var m=TOPIC_MAP[id];return m?m[i]:null;}
function tally(topic,clean,isExtra){
  if(!isExtra)SCORED_SEEN++;
  if(!topic)return;
  var s=STATS[topic]||(STATS[topic]={seen:0,miss:0});
  s.seen++; if(!clean)s.miss++;
}
function weakList(){
  return Object.keys(STATS).map(function(k){
    return {topic:k,seen:STATS[k].seen,miss:STATS[k].miss,rate:STATS[k].miss/STATS[k].seen};
  }).sort(function(a,b){return (b.miss-a.miss)||(b.rate-a.rate);});
}
```

Результат рисуется горизонтальными полосками, длина = число ошибок, цвет = доля ошибок:

```js
fill.style.width=(row.miss?Math.max(6,row.miss/max*100):0)+"%";
fill.style.background=row.miss===0?"var(--acc2)":(row.rate>=.5?"var(--acc-ink)":"var(--acc)");
```

**Дополнительная практика.** Приложение само предлагает самую слабую тему и открывает пул
из 6 новых заданий по ней; можно выбрать другую тему из сетки, где слабейшие помечены `focus`.
Баллы доп-раунда считаются отдельно (`BONUS`), в общий счёт не идут (`noBump=true`).

**Разбор ошибок.** Каждая ошибка логируется в момент первой неудачи:

```js
function logMistake(block,prompt,mine,right,ex,topic){
  S.mistakes.push({block:block,prompt:prompt,mine:mine,right:right,ex:ex||"",topic:topic||null});
}
```

В финале — группировка по блокам, и для каждой ошибки три строки: сам вопрос, «твой вариант»
красным, «правильно» зелёным, плюс объяснение. С прямой инструкцией:

> «Покажи этот список на уроке или просто проговори вслух каждый правильный вариант.»

Это и есть главный преподавательский артефакт файла.

## 2.4 Модель данных

Одна `var BLOCKS=[…]` — массив блоков, у каждого `kind` определяет рендерер, `items` —
однородный список. Поля предельно короткие: `d` (что показать), `a` (ответ), `o` (варианты),
`c` (индекс верного), `ex` (объяснение), `hint` (скелет ответа), `rule` (правило), `alt`/`altNote`
(допустимый вариант и оговорка), `w`/`i`/`del` (для «найди ошибку»), `x` (лишние фишки),
`t` (ярлык типа), `type` (переопределение рендерера внутри блока).

```js
var BLOCKS=[
 {id:"write",kind:"write",colour:"pink",title:"Write it in words",sub:"Пишем словами: даты, дроби, проценты, числа",
  items:[
   {t:"date",d:"05/03",lab:"day / month",a:"the fifth of March",hint:"the f_____ of March",
    rule:"Дата: the + порядковое + of + месяц. 05/03 по-британски — 5 марта."},
   {t:"fraction",d:"¾",a:"three-quarters",hint:"three-q_______",
    rule:"Числитель больше 1 → знаменатель во множественном числе."},
   {t:"decimal",d:"0.3",a:"nought point three",alt:["zero point three"],
    altNote:"Принято, но в британском учебнике — nought point three.",hint:"n_____ point three",
    rule:"Ноль перед точкой — nought."},
   {t:"big",d:"16,943",a:"sixteen thousand nine hundred and forty-three",hint:"sixteen thousand nine hundred ___ forty-three",
    rule:"and перед последней частью меньше 100; thousand без -s."}
  ]},

 {id:"error",kind:"error",colour:"blue",title:"Spot the mistake",sub:"Найди ошибку и выбери замену",
  items:[
   {d:"22/03",w:["the","twenty-two","of","March"],i:1,o:["twenty-second","twentieth-two","second-twenty"],c:0,
    ex:"В датах нужно порядковое числительное: the twenty-second of March."},
   {d:"16,943",w:["sixteen","thousand","and","nine","hundred","and","forty-three"],i:2,o:["— убрать это слово","plus","with"],c:0,del:true,
    ex:"and ставится только перед последней частью меньше 100."}
  ]},

 {id:"match",kind:"match",colour:"green",title:"Tricky pairs",sub:"Соедини похожие числа с их чтением",
  items:[
   {d:"1905",a:"nineteen oh five"},
   {d:"1950",a:"nineteen fifty"},
   {d:"03/12",a:"the third of December"},
   {d:"12/03",a:"the twelfth of March"}
  ]},

 {id:"build",kind:"build",colour:"pink",title:"Build the phrase",sub:"Собери правильную фразу из блоков",
  items:[
   {d:"26/10",a:["the","twenty-sixth","of","October"],x:["on","twenty-six"],ex:"the + порядковое + of + месяц."},
   {d:"1985",a:["nineteen","eighty-five"],x:["one thousand","hundred","and"],ex:"Год делим на две части, без hundred и and."}
  ]},

 {id:"boss",kind:"quiz",colour:"green",title:"Final challenge",sub:"8 заданий на всё сразу",
  items:[
   {type:"write",t:"date",d:"01/09",a:"the first of September",hint:"the f____ of S________",rule:"День/месяц + the … of …"},
   {type:"mc",d:"2011",q:"Which is correct?",o:["twenty eleven","two thousand eleven","twenty and eleven"],c:0,
    ex:"С 2010 года: twenty eleven или two thousand and eleven."}
  ]}
];
```

Рядом — служебные словари:

```js
var STUDENTS=[
  {name:"Alesya",ru:"Алеся",c:"var(--pink)",t:"warm"},
  {name:"Rita",ru:"Рита",c:"var(--yellow)",t:"warm"},
  {name:"Rodion",ru:"Родион",c:"var(--green)",t:"cool"},
  {name:"Vladimir",ru:"Владимир",c:"var(--blue)",t:"cool"}
];
var PRAISE={
 Alesya:"Alesya, ты прошла всё до конца — даты и дроби больше не страшные.",
 Rita:"Rita, полный проход — теперь годы и проценты читаются на автомате.",
 Rodion:"Rodion, дошёл до конца. Большие числа с and — уже твои.",
 Vladimir:"Vladimir, весь путь пройден. Ordinals и dates закрыты."
};
var TABLAB={date:"date",fraction:"fraction",percent:"percentage",decimal:"decimal",
 temp:"temperature",year:"year",big:"big number",ordinal:"ordinal"};
var TOPICS={
 dates:{en:"Dates",ru:"даты"},
 ordinals:{en:"Ordinal numbers",ru:"порядковые"},
 fractions:{en:"Fractions",ru:"дроби"},
 percent:{en:"Percentages",ru:"проценты"},
 decimals:{en:"Decimals",ru:"десятичные"},
 temp:{en:"Temperatures",ru:"температура"},
 years:{en:"Years",ru:"годы"},
 big:{en:"Big numbers",ru:"большие числа"}
};
```

И отдельный пул добавочной практики `var EXTRA={topic:[…6 items…]}` — те же формы карточек
(`write` и `mc`), просто другой контейнер:

```js
var EXTRA={
 dates:[
  {t:"date",d:"14/02",a:"the fourteenth of February",hint:"the f__________ of F_______",rule:"14 → fourteenth."},
  {t:"date",d:"21/08",a:"the twenty-first of August",hint:"the twenty-f____ of August",rule:"-th получает только последнее слово: twenty-first."},
  {type:"mc",d:"09/07",q:"Which is correct?",o:["the ninth of July","the nineth of July","the ninth of June"],c:0,
   ex:"nine → ninth, буква e выпадает. И 07 — это июль."},
  …
 ],
 …
};
```

Точные объёмы: **7 блоков, 53 задания** (write 8, error 8, match 6, reverse 8, build 5,
cards 10, boss 8), **7 тем в `EXTRA` по 6 = 42 доп-задания**, **8 тем диагностики**,
**7 разделов справочника**, 4 ученика. Итого 95 упражнений в одном файле.

## 2.5 Визуальная система

Светлая, «бумажная», пастельная. Две палитры — тёплая по умолчанию и холодная через
`body.cool`. Блок `:root` и переключатель дословно:

```css
:root{
  --paper:#FDF7F3; --card:#FFFFFF; --ink:#4B4351; --ink-soft:#7C7288;
  --pink:#F6C9DA; --pink-ink:#B85B85; --pink-tint:#FDEFF5;
  --blue:#C9E3F0; --blue-ink:#4682A2; --blue-tint:#EEF7FC;
  --green:#CFE8D5; --green-ink:#4F9370; --green-tint:#EFF8F1;
  --yellow:#FAEEC2; --yellow-ink:#A98726; --yellow-tint:#FDF8E6;
  --bad:#F6DEDE; --bad-ink:#C07B7B;
  --almost:#FAEBD3; --almost-ink:#A9803D;
  --line:#EFE3DC; --shadow:0 1px 0 #F4EAE4, 0 6px 18px rgba(120,90,110,.055);
  --r:18px;
  /* accent pair — swapped per student */
  --acc:var(--pink); --acc-ink:var(--pink-ink); --acc-tint:var(--pink-tint); --acc-on:#6B3550;
  --acc2:var(--yellow); --acc2-ink:var(--yellow-ink); --acc2-tint:var(--yellow-tint); --acc2-on:#6A5416;
  --paper:#FDF7F3; --dot:#F5EAEF;
  /* category hues — warm set */
  --c1:#F6C9DA; --c1i:#B85B85; --c2:#FAEEC2; --c2i:#A98726;
  --c3:#FBDCC6; --c3i:#B0693F; --c4:#E9DCF2; --c4i:#7D5FA0;
}
body.cool{
  --acc:var(--blue); --acc-ink:var(--blue-ink); --acc-tint:var(--blue-tint); --acc-on:#2E5D75;
  --acc2:var(--green); --acc2-ink:var(--green-ink); --acc2-tint:var(--green-tint); --acc2-on:#2F6248;
  --paper:#F6FAFB; --dot:#E4EFF3; --line:#E2ECEF;
  --shadow:0 1px 0 #E8F1F4, 0 6px 18px rgba(70,110,130,.06);
  /* category hues — cool set */
  --c1:#C9E3F0; --c1i:#4682A2; --c2:#CFE8D5; --c2i:#4F9370;
  --c3:#D3EAEA; --c3i:#3F8388; --c4:#DEE6F6; --c4i:#5A6EA0;
}
```

Структура палитры — эталонная и достойна копирования дословно: **каждый цвет живёт тройкой**
`base / ink / tint` (заливка плашки / текст поверх / очень светлый фон блока). Плюс
семантическая пара `--acc/--acc2` как алиасы, которые переопределяются темой, а не
переписываются по всему файлу. Категорийные `--c1..--c4` + `--c1i..--c4i` дают четыре
взаимозаменяемых «цвета раздела».

Фон — «бумага в точку»:

```css
body{background:var(--paper);background-image:radial-gradient(var(--dot) 1px, transparent 1px);background-size:24px 24px;}
```

Шрифты — тоже **только системные**:

```css
body{font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;}
h1,h2,h3,.digits,.deck-face{font-family:Georgia,"Iowan Old Style","Times New Roman",serif}
```

Та же логика, что в verb-gangs, но другим кодом: **серифная Georgia = английский/материал,
системный гротеск = русский/интерфейс**. Всё, что показывает язык (`td.en`, `.opt`, `.chip`,
`.tile.n`, `.digits`, `.sentence`, `.review .q`, `.review .right`, `.score`) — Georgia. Заголовки
`h1{font-weight:400}` — тонкие, не жирные; выразительность даётся размером и курсивом
(`h1 em{font-style:italic;color:var(--acc-ink)}`).

Тень одна на всё приложение и двухслойная:
`--shadow:0 1px 0 #F4EAE4, 0 6px 18px rgba(120,90,110,.055)`. Первый слой — «бумажный край»,
второй — мягкое рассеивание. Радиусы: карточка `--r:18px`, кнопка `12px`, плитка `14px`,
диалог `20px`, чип/плашка `999px`.

Типографские мелочи, из которых складывается «дорого»:
- `.eyebrow{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-soft)}` —
  надзаголовок над каждым экраном;
- `.tab{font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;border-radius:999px}` —
  ярлык типа задания в углу карточки (`date`, `fraction`, `find the mistake`, `build it`);
- `font-variant-numeric:tabular-nums` на цифрах;
- `.lead{max-width:62ch}` — длина строки ограничена по-типографски;
- `.by` — «by Valeria» мелким разрядкой, приподнято `vertical-align:.42em` рядом с логотипом;
- `.sig` — подпись «Numbers Lab · by Valeria» внизу экрана результатов.

Анимации: `pop .42s` (масштаб 1.018 — почти незаметный, «дышит»), `shake .3s` (±3 px),
`fadeUp .34s`, `inR/inL .42s` для перехода страниц, `ring 1.4s` для привлечения внимания.
Все на кривой `cubic-bezier(.33,1,.68,1)`.

## 2.6 Мобильность

Контейнер `max-width:760px` (шире, чем у verb-gangs — здесь есть таблицы). Тот же
`height:100dvh;overflow:hidden` + единственный скроллер. Один брейкпойнт:

```css
@media (max-width:430px){
  .wrap{padding:16px 12px 110px}
  .match{gap:7px}
  .mcol{gap:6px;grid-auto-rows:minmax(58px,auto)}
  .tile{font-size:13.5px;padding:9px 6px;border-radius:12px}
  .tile.n{font-size:18px}
}
```

То есть на телефоне ужимается только сетка сопоставления — остальное и так резиновое.
Сетки везде `repeat(auto-fit,minmax(215px,1fr))` — сами схлопываются в одну колонку.
Таблицы завёрнуты в `.tw{overflow-x:auto}` — горизонтально скроллится таблица, а не страница.
Плавающая кнопка «Rules» в нижнем правом углу — большой палец достаёт.

## 2.7 Что даёт преподавателю

- **Страница правил + плавающая шпаргалка** — справочник всегда под рукой, из любого задания.
- **Hint на каждой карточке** и автоподсказка после 3 попыток, ответ после 5.
- **Экран результатов = готовый план урока**: процент, диаграмма слабых тем, список всех
  ошибок с «твой вариант / правильно / почему», прямая инструкция показать его на уроке.
- **Флажок `empty`** в меню — видно, что блок закрыли, не решая.
- **Доп-раунды по слабым темам** — 42 запасных задания «в рукаве», если урок идёт быстрее.
- **Кнопка «×» Start over** с полным сбросом (включая `STATS`, `BONUS`, конфетти).
- **Заявленное время** прямо в интерфейсе: «~20 min», «Займёт 3–4 минуты».
- Персональная похвала по имени в конце.

Печатных стилей (`@media print`) нет — как и во всех остальных файлах семейства.

## 2.8 Русский / английский

Разделение более выражено, чем в verb-gangs, и **систематизировано на уровне CSS-класса**:
`.ru{color:var(--ink-soft);font-size:14.5px}` — русский всегда мельче и глуше английского.

- **Английский:** `<html lang="en">`, все заголовки экранов и кнопки (`Write it in words`,
  `Spot the mistake`, `Check`, `Hint`, `Clear`, `I knew it`, `Need practice`, `Finish this block`,
  `See my results`), ярлыки типов, названия тем, вопрос `Which is correct?`, весь материал.
- **Русский:** объяснения правил, все объяснения ошибок (`ex`), подписи `sub` у блоков,
  инструкции, предупреждения, диалоги подтверждения, разбор ошибок.
- **Смешанные строки** — норма: `"✓ <b>"+esc(it.a)+"</b>… <span class=\"ru\">— с первого раза, "+S.name+"!</span>"`,
  `Dates <span class="ru">— даты</span>`. Английский несёт содержание, русский — комментарий.

Логика: заголовок/кнопка по-английски (это тоже практика интерфейсного языка), а всё, что
объясняет и утешает, — по-русски.

## 2.9 Организация кода

Один `<style>`, один `<template id="rulesTpl">` (правила как разметка, не как данные), один
`<script>`. Ноль внешних ресурсов. `"use strict"`, ES5.

Порядок блоков:

```
/* ====== data ====== */   STUDENTS, BLOCKS, PRAISE, TABLAB, TOPICS, TOPIC_MAP, EXTRA
/* ====== state ===== */   S, STATS, BONUS, TOTAL_ITEMS, tally(), weakList(), logMistake()
/* ====== helpers === */   el(), esc(), norm(), lev(), drop(), CARD2ORD, check()
/* ====== confetti == */   confetti(), tick()
/* ====== screens === */   render(), goRules(), goTasks(), screenStart/Rules/Tasks,
                           blockHead(), finishBar(), openBlock(),
                           blockWrite/Error/Match/Reverse/Build/Cards, writeCard(), mcCard()
/* ====== results === */   screenResults(), screenTopics(), screenExtra()
/* ====== dialogs === */   dialog(), confirmBox(), askLeave()
/* ====== reset ===== */   resetAll()
/* ====== header ==== */   switchPage()
/* ====== cheat ==== */    openCheat(), closeCheat()
render(); paintTop();
```

Размер функций: `writeCard()` ≈ 65 строк, `blockError()` ≈ 65, `screenResults()` ≈ 110
(самая длинная, но это линейный рендер отчёта), `check()` ≈ 55. Диспетчер блоков — плоский
if/else по `kind`:

```js
if(b.kind==="write"||b.kind==="quiz")blockWrite(b);
else if(b.kind==="error")blockError(b);
else if(b.kind==="match")blockMatch(b);
else if(b.kind==="reverse")blockReverse(b);
else if(b.kind==="build")blockBuild(b);
else if(b.kind==="cards")blockCards(b);
```

---

# 3. lera — «Твоё здоровье — разбор ситуации»

## 3.1 Что это и зачем оно в этом анализе

Это **не** учебное приложение и почти не интерактив: длинный статичный документ-разбор личной
медицинской ситуации, написанный тепло и очень подробно. Интерактивность ровно одна — падающие
цветочки-эмодзи на фоне.

Для нашей задачи файл важен как **эталон «читаемого экрана»**: как в этом семействе выглядит
чистый контент — объяснения, правила, справочные материалы, «карта: симптом → что делать →
что спросить». Если новому приложению нужен раздел с теорией (для урока по интерфейсному
английскому он нужен обязательно), брать надо отсюда, а не из тёмного verb-gangs.

Объём: **11 тематических секций, 7 «поддерживающих баннеров», 16 карточек-идей,
11 карточек-вопросов, 9 пунктов чеклиста**, отдельная финальная секция и подпись.
Читается 15–25 минут. Заявленное назначение — открыть на телефоне и показать врачу:

> «Можешь просто открыть эту страницу на телефоне и показать врачу — или зачитать по пунктам.»

## 3.2 Архитектура документа

Обычная страница, никакого скелета из flex-колонок: `<div class="top-strip">` (радужная
полоска 4 px во всю ширину), `<div class="container">` шириной 760 px, `<header>`, дальше
вертикальный поток секций. Скроллится вся страница, а не внутренний контейнер.

**Навигации нет вообще: ни оглавления, ни якорей, ни `id` у секций, ни кнопки «наверх».**
Только чтение сверху вниз. Для 668 строк это работает благодаря ритму (см. 3.3), но для
нового учебного приложения это как раз то место, где нужно добавить оглавление или аккордеон —
иначе преподаватель не сможет прыгнуть к нужному разделу на уроке.

Единица содержания — `.section` с цветовым модификатором:

```html
<div class="section green">
  <div class="section-icon">🌙</div>
  <h2>Бессонница и частые пробуждения</h2>
  <p>…</p>
  <div class="hl hl-green">
    <strong>Почему ещё просыпаешься?</strong> Две недели — ранний срок. …
  </div>
</div>
```

Пять цветовых линий чередуются: `green / warm / rose / blue / violet`. Каждая даёт цветную
полоску сверху секции (`::before`), цветной фон у иконки-эмодзи и цветную плашку-акцент `.hl`:

```css
.section { background: var(--bg-card); border-radius: var(--radius); padding: 32px; margin-bottom: 24px;
  box-shadow: var(--shadow); transition: box-shadow 0.3s ease; position: relative; overflow: hidden; }
.section:hover { box-shadow: var(--shadow-hover); }
.section::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
.section.green::before  { background: var(--accent); }
.section.warm::before   { background: var(--warm); }
.section.rose::before   { background: var(--rose); }
.section.blue::before   { background: var(--blue); }
.section.violet::before { background: var(--violet); }
.section-icon { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px;
  border-radius: 12px; font-size: 20px; margin-bottom: 16px; }
.green .section-icon  { background: var(--accent-light); }
.warm .section-icon   { background: var(--warm-light); }
```

Обратите внимание на приём: цвет секции задаётся **одним классом на контейнере**, а все
дочерние элементы (`.section-icon`, `.talk-num`) подхватывают его через контекстный селектор
`.green .section-icon`. Не нужно ставить цвет на каждый элемент.

## 3.3 Ритм длинного чтения

Между секциями вставлены **баннеры-передышки** — короткая эмоциональная фраза на градиенте,
по центру, с эмодзи сверху. Ритм: 2–3 плотных секции → баннер. Это главный структурный приём
против «стены текста», прямо переносимый на длинный справочный раздел урока.

```html
<div class="support-banner">
  <span class="emoji">🌸</span>
  Панические атаки отступили. Сон стал приходить быстрее. Это не случайность —<br>
  <strong>это твоё тело начинает отпускать то, что копилось годами.</strong>
</div>
```

```css
.support-banner { background: linear-gradient(135deg, var(--accent-light), var(--warm-light));
  border-radius: var(--radius); padding: 24px 28px; margin-bottom: 24px; text-align: center;
  font-size: 15px; color: var(--text-soft); line-height: 1.75; box-shadow: var(--shadow); }
.support-banner .emoji { font-size: 24px; display: block; margin-bottom: 8px; }
```

Типографическая шкала — очень плотная по вертикали и мелкая по кеглю:
`body{line-height:1.75;font-size:16px}`, `h1{28px}`, `h2{20px}`, абзац `16px`, плашка `.hl{15px}`,
описание `.med-desc{14px}`, подпункт `.q-text em{13px}`. То есть **всего 4 уровня кегля**,
а иерархия строится цветом (`--text / --text-soft / --text-muted`) и отступами.
Мера строки задаётся только контейнером (760 px ≈ 85–90 знаков) — `max-width` в `ch` нет.

## 3.4 Компоненты содержания (все переносимы)

| Компонент | Разметка | Для чего годится в уроке |
|---|---|---|
| `.hl` + `.hl-{цвет}` | плашка внутри секции | «Правило», «Ловушка», «Запомни» |
| `.med-card` (эмодзи + название + описание) | список сущностей | словарные карточки: `Cancel` — «отменить, а не „канцелярия“» |
| `.idea-card` + `.idea-tag` | тег + название + текст | приём/совет с меткой важности (`Топ` / `Идея` / `Учесть`) |
| `.talk-point` + `.talk-num` | нумерованный чеклист с кружком | «как читать незнакомое меню» — последовательность шагов |
| `.q-card` (`.q-icon` + `strong` + `em`) | вопрос + курсивный подпункт мельче | разбор ловушки / вопрос на рефлексию |
| `.friends-quote` | цитата с левой чертой, курсив, Literata | важная мысль крупно |
| `.bottom-note` | центрированный финал с эмодзи | завершение урока |

Метки-теги — готовая система приоритетов:

```css
.idea-tag { flex-shrink: 0; padding: 3px 10px; border-radius: 8px; font-size: 12px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; white-space: nowrap; }
.tag-top  { background: #D4EDDA; color: #2D6A4F; }
.tag-alt  { background: var(--blue-light); color: var(--blue); }
.tag-easy { background: var(--warm-light); color: #8B6340; }
```

Нумерованный чеклист (готовый компонент под «9 шагов чтения интерфейса»):

```css
.talk-point { display: flex; gap: 12px; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid var(--bg-accent); }
.talk-point:last-child { border-bottom: none; }
.talk-num { flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center;
  justify-content: center; font-size: 13px; font-weight: 700; margin-top: 2px; }
.blue .talk-num { background: var(--blue-light); color: var(--blue); }
```

Карточка «вопрос + пояснение мельче» — тот самый паттерн, который идеально подходит под
«ловушку интерфейса»: жирным сама ловушка, курсивом мелким — разбор.

```css
.q-card { padding: 16px 20px; background: var(--bg); border-radius: 12px; margin-bottom: 10px;
  display: flex; gap: 14px; align-items: flex-start; }
.q-icon { font-size: 18px; flex-shrink: 0; margin-top: 3px; }
.q-text { font-size: 15px; color: var(--text-soft); line-height: 1.65; }
.q-text strong { color: var(--text); }
.q-text em { color: var(--text-muted); font-style: normal; font-size: 13px; display: block; margin-top: 4px; }
```

## 3.5 Визуальная система

Светлая, тёплая, «бумага + зелень». Блок `:root` дословно:

```css
:root {
  --bg: #F7F3EE;
  --bg-card: #FFFFFF;
  --bg-accent: #EDE7DF;
  --text: #3D3330;
  --text-soft: #6B5E59;
  --text-muted: #9B8E88;
  --accent: #7B8F6A;
  --accent-light: #E8EDE4;
  --accent-dark: #5A6E4A;
  --warm: #C48B5C;
  --warm-light: #F5EBE0;
  --rose: #B07A7A;
  --rose-light: #F2E4E4;
  --blue: #6A7F8F;
  --blue-light: #E4EBF0;
  --violet: #8B7AAF;
  --violet-light: #EDE4F2;
  --shadow: 0 2px 20px rgba(61, 51, 48, 0.06);
  --shadow-hover: 0 4px 30px rgba(61, 51, 48, 0.1);
  --radius: 16px;
}
```

Та же идея, что в numbers-lab, но парами вместо тройек: пять смысловых цветов, у каждого
светлый двойник `-light` (у зелёного ещё и `-dark` для текста на плашке). Три уровня текста
(`--text / --text-soft / --text-muted`) — заголовок / абзац / подпись. Один радиус на всё
(`--radius:16px`, локально `12px` для вложенных карточек), две тени: базовая и hover.

**Единственный файл семейства, который грузит шрифты из сети:**

```html
<link href="https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,300;0,7..72,400;0,7..72,500;0,7..72,600;1,7..72,400&family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet">
```

Как это используется:

```css
body { font-family: 'Nunito', sans-serif; line-height: 1.75; font-size: 16px; }
h1 { font-family: 'Literata', serif; font-size: 28px; font-weight: 600; letter-spacing: -0.3px; }
h2 { font-family: 'Literata', serif; font-size: 20px; font-weight: 600; }
.friends-quote { font-family: 'Literata', serif; font-style: italic; font-size: 17px;
  padding-left: 18px; border-left: 3px solid var(--rose); }
```

То есть Literata (переменный serif, оси `ital,opsz,wght`) — **только заголовки и цитаты**,
Nunito (мягкий гротеск) — весь текст. Из шести запрошенных начертаний Literata реально
используются два (600 и 400 italic) — то есть запрос переутяжелён. Fallback указан
минимальный (`serif` / `sans-serif`), поэтому **без сети файл теряет всю типографику** —
это единственная сетевая зависимость во всём семействе и главный аргумент в пользу того,
чтобы новое приложение шрифты не грузило.

Милые детали, которых нет в других файлах:

```css
/* радужная полоска на самом верху страницы */
.top-strip { height: 4px; background: linear-gradient(90deg, var(--accent), var(--warm), var(--rose), var(--blue), var(--violet)); }

/* кастомный скроллбар в цветах темы */
body { scrollbar-color: var(--rose) var(--bg-accent); }
::-webkit-scrollbar { width: 14px; }
::-webkit-scrollbar-track { background: var(--bg-accent); border-radius: 100px; }
::-webkit-scrollbar-thumb { background: linear-gradient(180deg, var(--rose), var(--warm));
  border-radius: 100px; border: 2px solid var(--bg-accent); min-height: 120px; }

/* «дышащий» листик в шапке */
header .leaf { display: inline-block; font-size: 32px; margin-bottom: 12px; animation: float 3s ease-in-out infinite; }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
```

## 3.6 Единственный интерактив — падающие цветы

Разреженные (1 цветок в 3–6 секунд), полупрозрачные, самоудаляющиеся. Это весь JS файла (~40 строк):

```css
.flower {
  position: fixed; z-index: 0; pointer-events: none; opacity: 0; font-size: 14px;
  animation: flowerFall linear forwards; filter: saturate(0.7) brightness(1.1);
}
@keyframes flowerFall {
  0%   { opacity: 0;   transform: translateX(0) translateY(0) rotate(0deg) scale(0.7); }
  8%   { opacity: 0.6; }
  50%  { opacity: 0.5; transform: translateX(40px) translateY(45vh) rotate(180deg) scale(1); }
  85%  { opacity: 0.3; }
  100% { opacity: 0;   transform: translateX(-20px) translateY(95vh) rotate(360deg) scale(0.6); }
}
```

```js
(function() {
  const flowers = ['🌸', '🌺', '🌼', '🌷', '🏵️', '💮', '🌻'];
  const body = document.body;

  function createFlower() {
    const el = document.createElement('div');
    el.className = 'flower';
    el.textContent = flowers[Math.floor(Math.random() * flowers.length)];
    el.style.left = (Math.random() * 100) + 'vw';
    el.style.top = (-5 - Math.random() * 5) + 'vh';
    el.style.fontSize = (11 + Math.random() * 8) + 'px';
    const duration = 12 + Math.random() * 18;
    el.style.animationDuration = duration + 's';
    const sway = -60 + Math.random() * 120;
    el.style.setProperty('--sway', sway + 'px');
    body.appendChild(el);
    setTimeout(() => el.remove(), duration * 1000);
  }

  // Sparse: one flower every 3-6 seconds
  function scheduleNext() {
    const delay = 3000 + Math.random() * 3000;
    setTimeout(() => { createFlower(); scheduleNext(); }, delay);
  }

  // Start after a small delay
  setTimeout(() => { createFlower(); scheduleNext(); }, 2000);
})();
```

Приёмы: `pointer-events:none` + `z-index:0` (не мешает чтению), `filter:saturate(0.7)`
(эмодзи приглушены до фонового шума), `setTimeout(el.remove)` по длительности анимации
(DOM не растёт). Единственный файл семейства на современном JS (`const`, стрелки, IIFE)
и **единственный без `prefers-reduced-motion`** — это дефект: анимации не отключаются.
Свойство `--sway` устанавливается, но в CSS не используется — мёртвый код.

## 3.7 Мобильность

Один брейкпойнт:

```css
@media (max-width: 600px) {
  .container { padding: 24px 16px 60px; }
  .section, .friends-section { padding: 24px 20px; }
  h1 { font-size: 24px; }
  h2 { font-size: 18px; }
  .idea-card { flex-direction: column; gap: 8px; }
}
```

Горизонтальные пары «тег + текст» на телефоне превращаются в вертикальные. Всё остальное
резиновое. На телефоне читается отлично — там его и открывают.

## 3.8 Русский / английский

Полностью русский, `<html lang="ru">`. Английские вкрапления — только термины (`C-PTSD`,
`REM`, `SOS`) и латинские названия. Для нового приложения это подтверждает правило:
**объяснительная часть — по-русски, целиком, без исключений.**

## 3.9 Организация кода

`<style>` в `<head>` (≈130 строк, по правилу «одно правило — одна строка»), затем чистая
разметка ≈480 строк, затем один `<script>` на 40 строк перед `</body>`. Ни одной функции
длиннее 20 строк. Одна внешняя зависимость — Google Fonts.

---

# 4. Анкеты (`a5fwuvzjsi` / `1hrtqo3981` / `kt9k0yz56p`)

Три файла — **одна и та же программа с разным содержимым** (40 / 18 / 14 вопросов).
Разбирать надо как один паттерн: «данные → генерируемая форма → localStorage → markdown на выход».

## 4.1 Визуальная система: намеренно «служебная»

Никакой игры — стиль Google-форм. Блок `:root` дословно (версия с 40 вопросами, у остальных
отличается только отсутствием `--star`):

```css
:root {
  --bg: #f8f9fa; --card: #ffffff; --ink: #1b1c1e; --muted: #3c4043;
  --accent: #1a73e8; --accent-ink: #ffffff; --line: #dadce0;
  --star: #e37400; --hint-bg: #f1f3f4; --done: #188038;
}
```

Google-синий `#1a73e8`, зелёный «готово» `#188038`, серая рамка `#dadce0`, оранжевый «важно»
`#e37400`. Шрифт `font: 15px/1.55 'Segoe UI', Roboto, Arial, sans-serif`, моноширинный
`Consolas` только для номеров вопросов и текстового вывода. Радиусы мелкие (`6–8px`),
тень еле заметная `0 1px 2px rgba(60,64,67,.08)`, контейнер `max-width:860px`.

## 4.2 Разметка вопроса и вариантов

```css
.q { background: var(--card); border: 1px solid var(--line); border-radius: 8px; padding: 14px 16px;
  margin: 12px 0; box-shadow: 0 1px 2px rgba(60,64,67,.08); }
.q.answered { border-left: 4px solid var(--done); }
.q .head { display: flex; gap: 8px; align-items: baseline; }
.q .num { font-family: Consolas, monospace; font-size: 13px; color: var(--muted); flex-shrink: 0; }
.q .text { font-weight: bold; }
.q .hint { font-size: 14px; color: var(--ink); background: #e8f0fe; border-left: 3px solid var(--accent);
  border-radius: 4px; padding: 8px 12px; margin: 8px 0; }
.opts label { display: block; padding: 6px 8px; border-radius: 6px; cursor: pointer; font-size: 15px; }
.opts label:hover { background: var(--hint-bg); }
.opts input { margin-right: 8px; accent-color: var(--accent); }
.progressbar { position: sticky; top: 0; z-index: 5; background: var(--bg); padding: 10px 0 8px;
  border-bottom: 1px solid var(--line); display: flex; align-items: center; gap: 12px; }
```

Данные — два литерала: словарь блоков и плоский массив вопросов. Поля: `n` номер, `b` блок,
`t` текст, `type` (`radio` | `check` | отсутствует = свободный текст), `opts` варианты,
`h` подсказка-«зачем это спрашивают», `ph` плейсхолдер-пример, `s:1` (в первой анкете) —
пометка важного вопроса.

```js
var BLOCKS = {
  A: { title: "A. Отрасль и стратегия", note: "Клиенты в консалтинге ротируются, поэтому отрасль для дела выбираем по накопленному следу, а не по текущему аккаунту." },
  B: { title: "B. Точные факты для бумаг", note: "Мелочи, от которых зависят оценка диплома и подсчёт стажа." }
};

var Q = [
 {n:1, b:"A", t:"За 5 лет в EPAM — где наработано больше всего?…", type:"radio",
  opts:["Банки / финансы / страхование","Ритейл / e-commerce","Примерно поровну","Другое — опишу в подробностях"],
  h:"На собеседовании спросят «почему эта отрасль» — ответ должен опираться на годы работы…",
  ph:"Например: 3 года банк, 1,5 года ритейл."},
 {n:7, b:"B", t:"Месяц и год: выход в EPAM и повышение до Senior?",
  h:"Стаж считается по месяцам…", ph:"В EPAM: 03.2021. Senior: 06.2024."},
 {n:14, b:"D", t:"Активы семьи — что есть кроме накоплений?", type:"check",
  opts:["Квартира / недвижимость","Машина","Депозиты / вклады","Брокерский счёт / крипта","Практически всё — наличные и карты"],
  h:"…", ph:"Примерная оценка, если готовы поделиться."}
];
```

Рендер — конкатенация строк в один `innerHTML`; заголовок блока вставляется при смене `q.b`:

```js
function render(){
  var html = "", curBlock = "";
  Q.forEach(function(q){
    if (q.b !== curBlock) {
      curBlock = q.b;
      html += "<h2>" + esc(BLOCKS[q.b].title) + "</h2>";
      html += "<p class='block-note'>" + esc(BLOCKS[q.b].note) + "</p>";
    }
    html += "<div class='q' id='q" + q.n + "'>";
    html += "<div class='head'><span class='num'>#" + q.n + "</span><span class='text'>" + esc(q.t) + "</span></div>";
    if (q.h) html += "<div class='hint'>" + esc(q.h) + "</div>";
    if (q.type === "radio" || q.type === "check") {
      var it = q.type === "radio" ? "radio" : "checkbox";
      html += "<div class='opts'>";
      q.opts.forEach(function(o, i){
        html += "<label><input type='" + it + "' name='opt" + q.n + "' data-q='" + q.n + "' data-i='" + i + "'>" + esc(o) + "</label>";
      });
      html += "</div>";
      html += "<label class='comment-label'>Подробности (если есть):</label>";
      html += "<textarea data-q='" + q.n + "' data-role='comment' rows='2' placeholder='" + esc(q.ph || "") + "'></textarea>";
    } else {
      html += "<textarea data-q='" + q.n + "' data-role='answer' rows='2' placeholder='" + esc(q.ph || "Ваш ответ…") + "'></textarea>";
    }
    html += "</div>";
  });
  form.innerHTML = html;
}
```

**Важно: у каждого вопроса с вариантами всегда есть поле «Подробности».** Ни один вопрос
не запирает в четыре варианта.

## 4.3 Сбор и экспорт ответов

**localStorage, ключ на каждый вопрос** — `LS + q.n`, где `LS` уникален для анкеты
(`"eb2form-f3b."`, `"eb2form-f2."`). Сохранение по каждому `input`/`change`, без дебаунса:

```js
function attach(){
  form.querySelectorAll("textarea, input").forEach(function(el){
    el.addEventListener("input", function(){ save(parseInt(el.getAttribute("data-q"), 10)); });
    el.addEventListener("change", function(){ save(parseInt(el.getAttribute("data-q"), 10)); });
  });
}
render(); attach(); load();
```

`save(n)` собирает `{sel:[индексы], comment}` либо `{answer}`, пишет JSON, красит карточку
и обновляет прогресс. `load()` при старте восстанавливает состояние обратно в DOM.
Признак «отвечено»:

```js
function isAnswered(data){
  if (!data) return false;
  if (data.sel && data.sel.length) return true;
  if (data.comment && data.comment.trim()) return true;
  if (data.answer && data.answer.trim()) return true;
  return false;
}
```

**Экспорт — markdown в `<textarea readonly>`, никакого mailto и никакой отправки.** Кнопка
«Собрать ответы» строит текст и раскрывает панель, «📋 Копировать» кладёт в буфер:

```js
function buildOutput(){
  var lines = [];
  lines.push("# EB2-NIW: ОТВЕТЫ ЗАЯВИТЕЛЯ — АНКЕТА 3 (ФИНАЛЬНАЯ)");
  lines.push("Заполнено: " + new Date().toISOString().slice(0, 10));
  lines.push("");
  var curBlock = "";
  Q.forEach(function(q){
    if (q.b !== curBlock) { curBlock = q.b; lines.push("## " + BLOCKS[q.b].title); lines.push(""); }
    var raw = localStorage.getItem(LS + q.n);
    var data = null; try { data = raw ? JSON.parse(raw) : null; } catch(e){}
    lines.push("**" + q.n + ". " + q.t + "**");
    if (!isAnswered(data)) { lines.push("— (нет ответа)"); }
    else if (q.type === "radio" || q.type === "check") {
      (data.sel || []).forEach(function(i){ lines.push("[выбрано] " + q.opts[i]); });
      if (data.comment && data.comment.trim()) lines.push("Подробности: " + data.comment.trim());
    } else { lines.push(data.answer.trim()); }
    lines.push("");
  });
  return lines.join("\n");
}
…
if (navigator.clipboard && navigator.clipboard.writeText) {
  navigator.clipboard.writeText(out.value).then(ok, function(){ out.select(); document.execCommand("copy"); ok(); });
} else { out.select(); document.execCommand("copy"); ok(); }
```

Кнопка на 2.5 с становится зелёной «✓ Скопировано». Приватность обещана в подвале:
*«Страница ничего никуда не отправляет: данные не покидают ваш браузер, пока вы сами их не
скопируете»*, плюс `<meta name="robots" content="noindex, nofollow">`.

**Двухшаговое «Очистить всё»** — дешёвая замена модалке: кнопка превращается в подтверждение
и через 4 секунды разоружается сама:

```js
var clearArmed = false;
document.getElementById("btnClear").addEventListener("click", function(){
  var btn = this;
  if (!clearArmed) {
    clearArmed = true; btn.textContent = "Точно очистить всё?";
    setTimeout(function(){ clearArmed = false; btn.textContent = "Очистить всё"; }, 4000);
    return;
  }
  Q.forEach(function(q){ localStorage.removeItem(LS + q.n); });
  render(); attach(); updateProgress();
  document.getElementById("output").value = "";
  document.getElementById("outputPanel").classList.remove("visible");
  clearArmed = false; btn.textContent = "Очистить всё";
});
```

Что переносимо в учебное приложение: **липкий прогресс-бар «сделано / всего»**, **зелёная
планка «отвечено» слева у карточки**, **подсказка «зачем это» голубой плашкой**,
**двухшаговая опасная кнопка**, **экспорт результата текстом для отправки преподавателю**
и **паттерн localStorage на элемент** (см. §5.5 — именно его надо взять для сохранения
прогресса урока).

---

# 5. СИНТЕЗ — house style

## 5.1 Что новое приложение ОБЯЗАНО делать, чтобы быть родным братом

Ниже — предписания, а не наблюдения. Каждый пункт подтверждён минимум двумя файлами из трёх.

### 5.1.1 Один файл, ноль зависимостей

- **Один `.html`**, всё внутри: один `<style>` в `<head>`, ноль или один `<template>`,
  один `<script>` перед `</body>`. Никаких `.js`/`.css` рядом.
- **Никаких CDN, библиотек, фреймворков, шрифтов из сети.** Ни React, ни jQuery, ни Tailwind,
  ни Google Fonts. verb-gangs и numbers-lab не делают ни одного сетевого запроса и работают
  из `file://`. lera грузит Google Fonts — это единственное исключение и его **не надо
  повторять**: без сети файл теряет типографику целиком.
- Рядом с `index.html` — **рукописный `favicon.svg` 32×32** в палитре приложения:
  скруглённый квадрат `rx=7..8`, градиент из фирменных цветов, внутри 1–2 глифа или короткий
  текст, иногда точка-акцент в углу. Подключается `<link rel="icon" type="image/svg+xml" href="favicon.svg">`.
- Приложение живёт в своей папке: `/<slug>/index.html` + `/<slug>/favicon.svg`.
- ES5-стиль JS (`var`, `function`, `.forEach`, конкатенация строк), `"use strict";`.
  Ни стрелок, ни `let`, ни шаблонных строк, ни `class`. Это осознанная совместимость.

### 5.1.2 Каркас страницы: фиксированная шапка + единственный скроллер

Копировать дословно (обе игровые приложения делают именно так):

```css
html,body{margin:0;padding:0;height:100%}
body{display:flex;flex-direction:column;height:100vh;height:100dvh;overflow:hidden;…}
#hdr{position:relative;flex:0 0 auto;z-index:100;background:rgba(...,.97);
  -webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
#scroller{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;
  -webkit-overflow-scrolling:touch;overscroll-behavior-y:contain}
.wrap{max-width:760px;margin:0 auto;padding:22px 16px 130px}
```

Правила: страница целиком **никогда** не скроллится; `100dvh` рядом с `100vh`;
`min-height:0` на скроллере обязателен (иначе flex не даст ему сжаться); нижний padding
90–130 px под плавающие кнопки. Ширина контейнера: **640 px** для «карточка за карточкой»
(verb-gangs), **760 px** если есть таблицы и колонки (numbers-lab, lera), **860 px** для форм.

Статичный документ (как lera) — исключение: обычный скролл страницы. Но если в приложении
есть и теория, и упражнения, теория живёт внутри того же `#scroller`.

### 5.1.3 Наименование CSS-переменных

Конвенция строгая и её надо соблюдать:

- фон/поверхности: `--bg` (или `--paper` / `--night`), `--card`, `--line`;
- текст тремя уровнями: `--ink` / `--ink-soft` / `--ink-muted` (или `--text` / `--text-soft` / `--text-muted`);
- **каждый смысловой цвет — тройкой** `--<name>` (заливка плашки) / `--<name>-ink` (текст поверх) /
  `--<name>-tint` (очень светлый фон блока). Минимум: `pink/blue/green/yellow` или
  `accent/warm/rose/blue/violet`;
- состояния ответа: `--bad` + `--bad-ink`, `--almost` + `--almost-ink`, зелёный как «ok»;
- **семантические алиасы-акценты** `--acc / --acc-ink / --acc-tint / --acc-on` и `--acc2…`,
  которые переопределяются одним классом на `<body>` — так тема меняется в одну строку;
- категорийные цвета разделов `--c1..--c4` + `--c1i..--c4i`;
- один `--r` (или `--radius`) и один `--shadow` (+ опционально `--shadow-hover`).

### 5.1.4 Шрифты: три роли, только системные

**Ключевое правило семейства: гарнитура кодирует язык.**

| Роль | verb-gangs | numbers-lab | что значит |
|---|---|---|---|
| Дисплейная | `"Arial Black",Impact` + `uppercase` | `Georgia` serif, `font-weight:400` | заголовки, крупные акценты |
| Текстовая | `"Trebuchet MS","Segoe UI"` | `-apple-system,"Segoe UI",Roboto` | **русский**: инструкции, объяснения |
| Материальная | `"Courier New"` mono | `Georgia` serif | **английский**: то, что учим |

Для приложения про интерфейсный английский это ложится идеально: **весь английский текст
интерфейсов показывать одним особым шрифтом** — моноширинным (он же выглядит как «системная
надпись») — а все русские пояснения обычным гротеском. Плюс обязательный класс-«глушитель»
для русского:

```css
.ru{color:var(--ink-soft);font-size:14.5px}
```

Русский всегда мельче и глуше английского — это визуальная иерархия «материал важнее
комментария».

### 5.1.5 Шкала радиусов, теней, отступов

| Элемент | Радиус |
|---|---|
| карточка / панель | `18–20px` (`--r`) |
| диалог / лист | `20–22px` |
| кнопка | `12–14px` |
| вариант ответа / плитка | `14–16px` |
| чип / плашка / прогресс-бар | `999px` |
| ярлык (`.tag`) | `6–8px` |

Тени: **одна на всё приложение**, двухслойная, почти невидимая
(`0 1px 0 <светлый>, 0 6px 18px rgba(...,.055)`). В тёмной теме теней нет вовсе — глубина
делается `1px solid var(--edge)` и заливкой на тон светлее. Никаких «карточек с drop-shadow 20px».

Отступы: карточка `padding:18–20px` (в документе 32px), между карточками `margin-bottom:14–16px`,
сетки `gap:8–12px`. Заголовки — `clamp()`: `h1{clamp(28px,7vw,46px)}`, `h2{clamp(20px,5.6vw,27px)}`.

### 5.1.6 Как открываются и закрываются разделы

- Экран = функция. `app.innerHTML=""` → собрать → `slide(dir)` → `toTop()`. Роутера нет,
  history API не используется, `#hash` не используется.
- Внутрь раздела ведёт **плитка-кнопка** (`.tile` / `.m-card`) с номером, названием,
  подписью и статусом справа. Внутри раздела сверху — **липкая полоса** с кнопкой «← назад»
  и текстом «где я»:

```js
var bar=el("div","sticky");
var back=el("button","btn ghost","← All blocks");back.type="button";
back.onclick=function(){askLeave(function(){goTasks(null,"pg-l");});};
bar.appendChild(back);
bar.appendChild(el("span","where",S.name+" · block "+(BLOCKS.indexOf(b)+1)+" of 7"));
```

- Закрывается раздел **кнопкой во всю ширину внизу** («Finish this block»), которая показывает
  диалог с вердиктом и уводит к следующему нерешённому разделу, подсвечивая его пульсацией.
- Уход из недоделанного раздела спрашивает подтверждение — но только если работа началась.
- Прогресс раздела виден в списке: `done 6/8`, звёзды `★★☆`, или флажок `empty`.

### 5.1.7 Кнопки

```css
.btn{font:inherit;font-size:15px;cursor:pointer;border:1px solid transparent;border-radius:12px;
  padding:11px 18px;background:var(--acc);color:var(--acc-on);transition:transform .12s ease,filter .12s ease}
.btn:active{transform:translateY(1px)}
.btn.ghost{background:#fff;border-color:var(--line);color:var(--ink-soft)}
.btn.danger{background:var(--bad);color:var(--bad-ink)}
.btn.wide{width:100%}
.btn:disabled{opacity:.5;cursor:default}
.btn:focus-visible{outline:3px solid var(--acc-ink);outline-offset:2px}
@media (hover:hover){.btn:hover{filter:brightness(1.03)}}
```

Четыре варианта и не больше: **primary** (акцент), **ghost** (белая с рамкой — всегда
«назад»/«отмена»), **danger** (для сброса), **wide** (главное действие раздела).
Все кнопки — `<button type="button">` (никогда не `<a>`, никогда без `type`).
`:active{transform:translateY(1px)}` и `:hover{filter:brightness()}` — весь «фидбек нажатия».
Hover-стили **только внутри `@media (hover:hover)`**, иначе залипают на тач-экране.
Выключенная кнопка обязана объяснять себя надписью: `«Select your name first»`,
`«Finish all 7 blocks to see your results»`, `«Сначала пройди три урока»`.

### 5.1.8 Цвета обратной связи — четыре, не два

Это самая важная содержательная черта семейства:

| Состояние | Класс | Цвет | Смысл |
|---|---|---|---|
| верно | `.fb.ok` / `.opt.good` | зелёный | принято |
| **почти** | `.fb.almost` / `.word.found` | **янтарный** | ответ близок, вот что именно не так |
| неверно | `.fb.bad` / `.opt.bad` | красный | не то |
| подсказка / «сюда» | `.fb.hint` / `.opt.nudge` / `.opt.shown` | синий или жёлтый | помощь, а не оценка |

```css
.fb{margin-top:10px;font-size:14.5px;padding:10px 12px;border-radius:12px;display:none}
.fb.show{display:block;animation:fbIn .22s ease}
.fb.ok{background:var(--green-tint);color:var(--green-ink)}
.fb.almost{background:var(--almost);color:var(--almost-ink)}
.fb.bad{background:var(--bad);color:var(--bad-ink)}
.fb.hint{background:var(--acc-tint);color:var(--acc-ink)}
```

Правила поведения, обязательные к переносу:
- **ошибка никогда не заканчивает задание** — можно пробовать ещё, неверная кнопка гаснет,
  остальные живы;
- **у каждого задания есть выход**: кнопка «не помню — покажи» / `Hint`, автоподсказка после
  3 попытки, готовый ответ после 5;
- **счёт считается «с первой попытки»** (`clean = tries===1 && !usedHint`) — то есть подсказки
  разрешены и не наказываются, просто не приносят балл;
- **при верном ответе всегда объясняем почему** (`ex` / `rule`), а не просто «✓»;
- решённая карточка окрашивается зелёным целиком (`.card.solved`) + микро-анимация `pop`,
  ошибка — `shake` на 300–320 мс;
- обращение по имени в момент успеха: `«— с первого раза, Rita!»`.

### 5.1.9 Анимация

Одна кривая на всё: `cubic-bezier(.33,1,.68,1)`. Длительности 0.12–0.45 с, ни одной длиннее.
Набор: `pop` (масштаб 1.018–1.05), `shake` (±3–5 px), `slideIn` / `inR` / `inL` (±18 px + fade),
`fadeUp` (6 px), `ring` (пульс рамкой для «смотри сюда»), `thump` (штамп подпрыгивает).
Перезапуск анимации — форсированным reflow: `el.classList.remove(c); void el.offsetWidth; el.classList.add(c);`

Обязательно:

```css
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
```

и в JS `var REDUCED=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;`
с ранним `return` в конфетти, слайдах и флипе.

### 5.1.10 Праздник по делу

Конфетти на `<canvas id="fx">` (`position:fixed;inset:0;pointer-events:none`), **всегда
с аргументом-силой**: `confetti(right/total)`. Ноль верных — почти нет конфетти. Звук —
синтезированный `AudioContext` (восходящая пара для «верно», нисходящая для «неверно»),
с тумблером в шапке. Никаких mp3.

### 5.1.11 Язык

`<html lang="ru">`, если интерфейс русский (verb-gangs, lera, анкеты); `lang="en"`, если
заголовки и кнопки английские (numbers-lab). Правило разделения:

- **английский** — материал урока, заголовки разделов, надписи на кнопках действий
  (`Check`, `Hint`, `Clear`, `Finish this block`), ярлыки типов заданий;
- **русский** — вся объяснительная часть: правила, разборы ошибок, инструкции, подтверждения,
  подписи разделов, ободрение;
- **смешанная строка — норма**: `Dates <span class="ru">— даты</span>`.

### 5.1.12 Обязательные преподавательские элементы

1. Прогресс-бар и счётчик `сделано / всего` в шапке.
2. Справочник, доступный **из любого места** (плавающая кнопка + модалка с клоном `<template>`).
3. Кнопка «покажи ответ» в каждом упражнении.
4. Экран результатов с разбором ошибок «твой вариант / правильно / почему» и прямой
   инструкцией показать его на уроке.
5. Заявленное время прямо в UI («~20 min», «займёт 3–4 минуты»).
6. Кнопка полного сброса «×» с подтверждением.
7. Экспорт результата текстом в буфер (взять из анкет) — у приложения нет бэкенда.

---

## 5.2 Каталог всех переиспользуемых механик

`Оценка` — насколько механика подходит для обучения интерфейсному английскому (кнопки,
пункты меню, фразы диалогов, экраны настроек), 1–5.

| # | Механика | Где живёт | ~LOC | Как судится правильность | Оценка | Почему |
|---|---|---|---|---|---|---|
| 1 | Множественный выбор с мгновенным фидбеком и повтором | verb-gangs `stageForms/stageMean/gameOdd/gameQuiz`; numbers-lab `mcCard/blockReverse` | 35 | сравнение индекса/флага `ok`; балл только при `tries===1` | **5** | базовая форма для «что делает эта кнопка» — быстро, безопасно, легко насытить скриншотной лексикой |
| 2 | Ввод текстом с классификацией типа ошибки | numbers-lab `writeCard` + `check()` | 120 | `norm()` + `alt[]` + Левенштейн + пословный разбор → 10 статусов | **4** | точен для заучивания формулировок диалогов, но требует писать по-английски — для A2 с тревогой ставить не первым |
| 3 | «Найди ошибку»: тап по слову → выбор замены | numbers-lab `blockError` | 65 | индекс слова `it.i`, затем индекс замены `it.c` | **5** | идеально под двойные отрицания (`Turn off … effect`) и кривые переводы — ровно страх ученика |
| 4 | Сопоставление в две колонки тапами | numbers-lab `blockMatch` | 45 | совпадение индексов; `spoiled[i]` помнит грязную пару | **5** | label ↔ значение, иконка ↔ имя, `un-`пара `hide/unhide` — минимальные контрасты |
| 5 | «Собери фразу» из чипов с ловушками | numbers-lab `blockBuild` | 55 | `norm(mine)===norm(a.join(" "))`, лишние чипы `x[]` | **5** | стеки существительных (`Base cabinet hanging brackets`) и фразы диалогов собираются буквально этим |
| 6 | Пропуск в предложении, выбор варианта | verb-gangs `gameGap` | 45 | флаг `ok`; при успехе пропуск заполняется на месте | **5** | «`___` this app to continue» — фразы диалогов и подсказок |
| 7 | Верю / не верю (бинарный, быстрый) | verb-gangs `gameTrue` | 35 | сравнение `o.yes===truth`; после ответа всегда печатается правда | **4** | «серое = сломано: верно/неверно» — быстро снимает мифы, но мало нюанса |
| 8 | Реверс: фраза → выбрать «цифры»/объект | numbers-lab `blockReverse` | 30 | индекс `c`, объяснение `ex` всегда | **5** | «Куда нажать, чтобы…» с вариантами-названиями кнопок |
| 9 | Drag & drop + tap-tap одним кодом | verb-gangs `stageChant` | 95 | `slot.dataset.want===chip.dataset.w` | **4** | физичность приятна, но #4/#5 дают тот же учебный эффект за половину кода |
| 10 | Флеш-карточки с флипом и самооценкой | numbers-lab `blockCards` | 45 | не судится; `I knew it` / `Need practice` | **4** | ядро «50 слов намертво» и проговаривание вслух — без давления оценки |
| 11 | Memory-пары на сетке | verb-gangs `gameMemory` | 40 | равенство ключа `c.k` | **3** | весело, но медленно и плохо работает на длинных фразах |
| 12 | Спринт с таймером и штрафом −3 с | verb-gangs `gameSprint` | 55 | как #1, ошибка съедает время | **3** | бодрит, но ученик пришёл с тревогой — таймер противопоказан |
| 13 | Настраиваемый «босс»-квиз | verb-gangs `gameQuiz(cfg)` | 55 | как #1 + звёзды по доле верных | **4** | итоговая проверка урока одним конфигом; переиспользуется трижды |
| 14 | Адаптивная сложность (2 варианта вместо 3, короче раунд) | verb-gangs `noteGood/noteBad/optCount/askLimit` | 6 | 2 ошибки подряд → «легко», 3 успеха → обратно | **5** | шесть строк, которые превращают «ступор» в «получается» |
| 15 | Кнопка «не помню — покажи» | verb-gangs `passBtn` | 4 | помечает как промах, показывает ответ | **5** | обязательна: ученик не залипает и не бросает |
| 16 | Эскалация подсказок 3 → скелет, 5 → ответ | numbers-lab `writeCard` | 15 | `tries` + `usedHint` | **5** | тот же эффект, что #15, но автоматический |
| 17 | Панель-напоминание правила при ошибке | verb-gangs `.remind` | 8 | появляется на первой ошибке | **5** | правило приходит в момент, когда оно нужно |
| 18 | Плавающая шпаргалка (модалка + клон `<template>`) | numbers-lab `#cheatBtn` / `openCheat` | 25 | — | **5** | таблица «сленг интерфейса» в одном тапе из любого задания |
| 19 | Журнал ошибок → экран разбора | numbers-lab `logMistake` + `screenResults` | 40 | пишется при первой неудаче | **5** | готовый материал для последних 10 минут урока |
| 20 | Диагностика по темам полосками | numbers-lab `TOPIC_MAP/tally/weakList` | 30 | доля промахов на тему | **4** | видно, что провалилось: «меню» vs «диалоги» vs «настройки» |
| 21 | Доп-раунды по слабой теме (`EXTRA`) | numbers-lab `screenExtra/screenTopics` | 45 | как #1/#2, счёт отдельный | **4** | резерв на случай, если урок идёт быстрее плана |
| 22 | Прогресс-бар + счётчик в шапке | оба приложения | 10 | `DONE/TOTAL` | **4** | «сколько осталось» снижает тревогу |
| 23 | Наклейки-достижения с очередью показа | verb-gangs `award/flushThen/STICKERS` | 30 | набор условий | **2** | детская мотивация; взрослому ученику не нужна |
| 24 | XP, уровни, стрик по дням | verb-gangs `addXp/LEVELS/touchStreak` | 25 | пороги | **2** | то же: для одноразового 90-минутного урока бессмысленно |
| 25 | Конфетти на canvas с силой | оба приложения | 30 | — | **3** | приятно в финале раздела; не злоупотреблять |
| 26 | Синтезированные бип-звуки | verb-gangs `beep` | 18 | — | **3** | помогает ритму, но нужен тумблер |
| 27 | Озвучка `speechSynthesis` с кнопкой «♪ послушать» | verb-gangs `say/speakBtn` | 8 | — | **5** | ученик не знает, как звучат `Cancel`, `Browse`, `Gtol` — это его прямой запрос |
| 28 | Единый диалог с тонами (`ok/almost/plain/gold`) | оба приложения `dialog()` | 25 | — | **5** | инфраструктура: все вердикты и подтверждения одним вызовом |
| 29 | Защита от потери ответов через DOM-запрос | numbers-lab `askLeave` | 7 | `querySelector(".card.solved,.fb.show,…")` | **4** | семь строк вместо ведения состояния |
| 30 | Автофокус на следующий раздел (пульс + скролл) | numbers-lab `PENDING` + `.focusme` | 15 | — | **4** | ведёт ученика за руку, не давая потеряться в меню |
| 31 | Липкая полоса раздела с «← назад» и «где я» | numbers-lab `.sticky` | 10 | — | **4** | на длинном разделе всегда видно контекст |
| 32 | Двухшаговая опасная кнопка (без модалки) | анкеты `#btnClear` | 12 | второй клик в течение 4 с | **4** | дешёвая защита сброса |
| 33 | Экспорт результата в markdown + буфер обмена | анкеты `buildOutput` + `btnCopy` | 35 | — | **5** | единственный способ отдать результат преподавателю без бэкенда |
| 34 | Автосохранение в localStorage по элементу | анкеты `save/load` | 30 | — | **5** | 90-минутный урок обязан переживать перезагрузку (см. §5.5.7) |
| 35 | Сохранение всего состояния одним JSON с дебаунсом | verb-gangs `STORE/save/boot` | 35 | миграция недостающих ключей из `blank()` | **5** | тот же результат, но одна точка истины |
| 36 | Выбор ученика с «шлюзом» (кнопка объясняет, почему выключена) | numbers-lab `screenStart` | 25 | — | **3** | у нас один ученик; полезен сам приём «кнопка объясняет себя» |
| 37 | Секции документа с цветной линией и иконкой | lera `.section.<colour>` | CSS 20 | — | **5** | так должна выглядеть теоретическая часть урока |
| 38 | Баннеры-передышки между секциями | lera `.support-banner` | CSS 8 | — | **5** | ритм длинного чтения; вместо «стены текста» |
| 39 | Нумерованный чеклист с кружками | lera `.talk-point/.talk-num` | CSS 12 | — | **5** | «9 шагов, как прочитать незнакомое меню» — готовый компонент |
| 40 | Карточки с тегом важности (`Топ/Идея/Учесть`) | lera `.idea-card/.idea-tag` | CSS 15 | — | **4** | приоритизация приёмов декодирования |
| 41 | «Вопрос жирным + разбор курсивом мельче» | lera `.q-card` | CSS 12 | — | **5** | идеальная форма для «ловушки интерфейса» |
| 42 | Смена темы одним классом на `<body>` | numbers-lab `body.cool` | CSS 12 | — | **3** | приятно, не обязательно |
| 43 | Падающие эмодзи фоном | lera `.flower` + JS | 40 | — | **2** | милота; для рабочего урока — шум |
| 44 | Генерация дистракторов из правила | verb-gangs `regular(v)` | 5 | — | **5** | аналог для UI-английского: подставлять ложных друзей (`Magazine` → «магазин») |

**Топ-10 под наш урок (в порядке внедрения):** #4 сопоставление → #3 найди ошибку →
#8 реверс «куда нажать» → #5 собери фразу → #6 пропуск в предложении → #1 множественный
выбор → #10 флеш-карточки с озвучкой (#27) → #16/#15 подсказки → #19 разбор ошибок →
#18 плавающая шпаргалка. Плюс обязательный фундамент: #14 адаптивная сложность,
#28 диалог, #34/#35 сохранение, #33 экспорт.

**Что не брать:** #23, #24 (наклейки/XP — ученик взрослый), #12 (таймер — усилит тревогу),
#43 (падающие эмодзи), #11 (memory на фразах не работает).

---

## 5.3 Анти-паттерны и больные места существующего кода

1. **numbers-lab не сохраняет прогресс вообще.** Разработчик даже написал предупреждение
   вместо решения: *«Делай всё за один раз: если закрыть страницу, прогресс не сохранится.»*
   53 задания без сохранения — случайное обновление стирает 25 минут работы. Для урока на
   90 минут это прямой дефект. Лечится (§5.5.7).

2. **`app.innerHTML=""` + полная перерисовка теряет позицию скролла и состояние всех полей.**
   Отсюда и защита `askLeave()`, и «ответы не сохранятся». Это цена простоты; принимаем, но
   тогда сохранение обязано быть по каждому ответу, а не по разделу.

3. **`innerHTML` + ручной `esc()` вместо `textContent`.** Работает, но `esc()` легко забыть:
   в анкетах и приложениях есть места, где данные вставляются без экранирования
   (`b.title`, `b.sub`, `it.q` в некоторых карточках). Данные свои, поэтому не рвётся —
   но паттерн хрупкий.

4. **`TOPIC_MAP` — параллельный массив, привязанный к порядку `items`.** Тема задания живёт
   отдельно от задания:

   ```js
   write: ["dates","fractions","percent","decimals","temp","years","fractions","big"],
   ```

   Вставил задание в середину — вся диагностика поехала, и ничто об этом не скажет.
   **Правильно: поле `topic` внутри самого item.**

5. **Мёртвый и дублирующийся CSS.** В numbers-lab `.name` и `.names` объявлены дважды
   (второй блок помечен `/* ---------- old name grid tweak ---------- */` и частично
   переопределяет первый); в lera устанавливается `--sway`, который в CSS не используется;
   в `blockMatch` заведены `seq` и функция `box()` со счётчиком, который никуда не идёт.

6. **Логика подсчёта очков размазана и местами дублируется.** В `blockError`/`blockReverse`/
   `blockBuild` строка `if(tries===1)score++` соседствует с `settle(clean)`, который считает
   то же самое для `STATS` — два независимых счётчика одного факта. В `blockError` условие
   вообще подозрительное: `settle(wrongTaps===0&&!logged); if(wrongTaps===0&&!logged)score++;`
   — `logged` к «чистоте» ответа отношения не имеет.

7. **lera грузит Google Fonts с минимальным fallback** и запрашивает шесть начертаний
   Literata, используя два. Без сети документ выглядит другим шрифтом.

8. **lera без `prefers-reduced-motion`** — цветы и «дышащий листик» не отключаются.

9. **Нет `@media print` ни в одном файле.** Раздаточный материал распечатать нельзя
   (а для «БАЗЫ из 50 слов» распечатка была бы кстати).

10. **Доступность фрагментарна.** `aria-pressed` есть только у выбора имени, `aria-label`
    один; у динамических блоков обратной связи нет `role="status"`/`aria-live`, так что
    скринридер не объявит «Почти! не хватает and». `:focus-visible` — есть везде, это плюс.

11. **Тексты приложения жёстко вписаны в функции.** Русские строки вердиктов, похвал и
    подсказок рассыпаны по коду (в `finishBar` четыре ветки с текстами внутри). Менять
    формулировки приходится по всему файлу.

12. **`stageChant` — 95 строк одной функции** с вложенными обработчиками, замыканиями и
    ручной обработкой pointer-событий. Работает, но это самое трудноизменяемое место
    во всём семействе. Если механика не нужна принципиально — брать #4/#5.

13. **`verb-gangs`: `S.mast` уменьшается при ошибке**, поэтому «открытая» карточка может
    закрыться обратно. Педагогически спорно и нигде не объяснено ученику.

14. **Названия файлов анкет — случайные строки** (`a5fwuvzjsi.html`). Это обфускация ссылки,
    но найти файл в репозитории невозможно. Учебные приложения так называть не надо —
    у них человекочитаемые папки.

---

## 5.4 Объёмы: сколько контента и на сколько минут

### 5.4.1 Реальные цифры (посчитано исполнением данных)

| Приложение | Размер | Строк | Единиц контента | Заявленное/оценочное время |
|---|---|---|---|---|
| verb-gangs | 67 108 B | 1 260 | **12 банд, 67 глаголов, 24 предложения, 14 наклеек, 3 урока, 6 игр** | один урок ≈ 25–40 мин; весь файл — часы на неделях |
| numbers-lab | 94 814 B | 1 761 | **7 блоков, 53 задания + 42 доп. = 95 упражнений, 7 разделов правил, 8 тем** | «~20 min» по UI; реально 25–35 мин + 3–4 мин на доп-раунд |
| lera | 65 772 B | 668 | **11 секций, 7 баннеров, 16 карточек-идей, 11 карточек-вопросов, 9 пунктов чеклиста** | 15–25 мин чтения |
| анкеты | 21–37 kB | 276–310 | **40 / 18 / 14 вопросов** | 10–30 мин заполнения |

### 5.4.2 Пересчёт «единица контента → минуты»

Из соотношения заявленного времени и числа заданий:

| Тип единицы | Минут на единицу |
|---|---|
| множественный выбор / верю-не-верю / реверс | **0.3–0.4** (≈20–25 с) |
| сопоставление (пара) | 0.3 |
| пропуск в предложении с выбором | 0.4 |
| ввод текстом с проверкой | **0.6–0.8** (включая 1–2 неудачные попытки) |
| «найди ошибку» (два хода) | 0.7 |
| «собери фразу» из чипов | 0.8 |
| флеш-карточка, проговорить вслух | 0.4 |
| презентационная карточка (только читать/слушать) | 0.3 |
| секция теории на 2–4 абзаца + плашка | **1.5–2.5** |
| пункт чеклиста | 0.2 |

Проверка на numbers-lab: 53 задания × ≈0.45 ≈ 24 мин + 7 разделов правил × ≈1.2 ≈ 8 мин
= ~32 мин против заявленных 20. То есть **UI-оценки в этом семействе оптимистичны примерно
в 1.5 раза** — планировать надо по расчёту, а не по обещанию.

### 5.4.3 Сколько нужно на 90 минут

Урок 90 минут с преподавателем — это не 90 минут «в приложении»: минимум треть уходит на
разговор, показ и разбор. Планировать нужно **55–65 минут экранного времени** и держать
резерв.

Рекомендуемая комплектация приложения на 90-минутный урок:

| Часть | Объём | Минут |
|---|---|---|
| Теория / справочник (3 модуля: БАЗА, РАБОТА, ИГРА) | **12–16 секций** в стиле lera, из них 3–4 таблицы | 15–20 |
| Ядро лексики (карточки с озвучкой) | **50 единиц** (прямой запрос ученика) | 8–10 |
| Практика | **60–75 упражнений** в 6–8 блоках по 8–12 | 28–34 |
| Итоговая проверка | **10–12 заданий** смешанных | 6–8 |
| Экран результатов + разбор ошибок | — | 5 |
| Резерв (доп-раунды по слабым темам) | **+30–40 упражнений** в 4–6 пулах | 0–15 |

Итого: **~75 основных + ~35 резервных упражнений, 12–16 секций теории, 50 словарных карточек.**

Ожидаемый размер файла: numbers-lab держит 95 упражнений + 7 разделов правил в 95 kB.
С 110 упражнениями, 16 секциями теории и 50 карточками получится **110–140 kB / 1 900–2 400
строк**. Это в норме семейства (67–95 kB) с превышением из-за объёма теории. Если переваливает
за 150 kB — сокращать теорию, а не упражнения.

**Дробление разделов:** 8–12 заданий в блоке (verb-gangs: 8/12/10/15; numbers-lab: 5–10).
Меньше 5 — раздел не чувствуется, больше 12 — устаёшь до кнопки «Finish».

---

## 5.5 Скелет нового приложения

Порядок блоков — сводный из обоих игровых приложений. Код ниже — рабочий, взятый из
существующих файлов (адаптации помечены).

### 5.5.1 Порядок внутри файла

```
<!DOCTYPE html><html lang="ru"><head>
  meta charset / viewport
  link rel=icon → favicon.svg
  title
  <style>
    :root { … }              /* палитра, шрифты, радиус, тень */
    reset + body shell       /* flex-колонка, 100dvh, overflow:hidden */
    header / scroller / wrap
    typography (h1..h3, .eyebrow, .ru, .lead)
    components:  .card .tile .m-card .btn .opt .chip .tile(match) .slot .fb .tab .sticky
    section-document components (.section.<colour>, .hl, .talk-point, .q-card, .banner)
    dialog / modal
    animations + @media (prefers-reduced-motion) + @media (hover:hover) + @media (max-width)
  </style>
</head><body>
  <canvas id="fx"></canvas>
  <header id="hdr" class="bare"> progress + segmented nav + reset </header>
  <main id="scroller"><div class="wrap" id="app"></div></main>
  <button id="cheatBtn">Шпаргалка</button>
  <div id="ask">…dialog…</div>
  <div id="modal">…cheat sheet…</div>
  <template id="refTpl">…теория/справочник разметкой…</template>
  <script>
    "use strict";
    /* ===== data ===== */      VOCAB, BLOCKS, EXTRA, TOPICS, RULES-as-template
    /* ===== state ===== */     S, STATS, TOTAL/DONE, tally(), logMistake(), STORE, save(), boot()
    /* ===== helpers ===== */   el(), esc(), norm(), lev(), shuffle(), toTop(), slide()
    /* ===== confetti ===== */
    /* ===== dialog ===== */    dialog(), confirmBox(), askLeave()
    /* ===== screens ===== */   render(), screenStart/Theory/Tasks, openBlock(), finishBar()
    /* ===== exercises ===== */ cardMC(), cardWrite(), cardError(), cardMatch(), cardBuild(), cardDeck()
    /* ===== results ===== */   screenResults(), screenExtra(), exportText()
    /* ===== cheat ===== */     openCheat(), closeCheat()
    boot();
  </script>
</body></html>
```

### 5.5.2 `<head>` и `:root` (готовый старт — светлая тема семейства)

```html
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" type="image/svg+xml" href="favicon.svg">
<title>Interface English — читаем интерфейсы без переводчика</title>
<style>
:root{
  --paper:#FDF7F3; --card:#FFFFFF; --ink:#4B4351; --ink-soft:#7C7288;
  --pink:#F6C9DA; --pink-ink:#B85B85; --pink-tint:#FDEFF5;
  --blue:#C9E3F0; --blue-ink:#4682A2; --blue-tint:#EEF7FC;
  --green:#CFE8D5; --green-ink:#4F9370; --green-tint:#EFF8F1;
  --yellow:#FAEEC2; --yellow-ink:#A98726; --yellow-tint:#FDF8E6;
  --bad:#F6DEDE; --bad-ink:#C07B7B;
  --almost:#FAEBD3; --almost-ink:#A9803D;
  --line:#EFE3DC; --shadow:0 1px 0 #F4EAE4, 0 6px 18px rgba(120,90,110,.055);
  --r:18px; --dot:#F5EAEF;
  --acc:var(--blue); --acc-ink:var(--blue-ink); --acc-tint:var(--blue-tint); --acc-on:#2E5D75;
  --acc2:var(--green); --acc2-ink:var(--green-ink); --acc2-tint:var(--green-tint); --acc2-on:#2F6248;
  --c1:#C9E3F0; --c1i:#4682A2; --c2:#CFE8D5; --c2i:#4F9370;
  --c3:#FAEEC2; --c3i:#A98726; --c4:#E9DCF2; --c4i:#7D5FA0;
  /* UI-строки интерфейсов показываем моноширинным — «системная надпись» */
  --ui:"Consolas","SF Mono",ui-monospace,"Courier New",monospace;
}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
.btn,.opt,.tile,.chip,.word,.m-card{touch-action:manipulation}
html,body{margin:0;padding:0;height:100%}
body{display:flex;flex-direction:column;height:100vh;height:100dvh;overflow:hidden;
  background:var(--paper);background-image:radial-gradient(var(--dot) 1px,transparent 1px);
  background-size:24px 24px;color:var(--ink);
  font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;
  -webkit-text-size-adjust:100%}
h1,h2,h3{font-family:Georgia,"Iowan Old Style","Times New Roman",serif;font-weight:400}
h1{font-size:clamp(30px,7vw,46px);line-height:1.05;margin:0 0 6px;letter-spacing:-.01em}
h2{font-size:clamp(22px,5.6vw,27px);margin:0 0 6px}
h3{font-size:18px;margin:22px 0 8px}
p{margin:0 0 12px}
.eyebrow{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-soft);margin:0 0 10px}
.lead{color:var(--ink-soft);margin-bottom:22px;max-width:62ch}
.ru{color:var(--ink-soft);font-size:14.5px}
.ui{font-family:var(--ui);letter-spacing:-.01em}   /* любая строка интерфейса */
#fx{position:fixed;inset:0;pointer-events:none;z-index:130}
#hdr{position:relative;flex:0 0 auto;z-index:100;background:rgba(253,247,243,.97);
  -webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);
  border-bottom:1px solid var(--line);box-shadow:0 2px 10px rgba(120,90,110,.05)}
#scroller{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;
  -webkit-overflow-scrolling:touch;overscroll-behavior-y:contain}
.wrap{max-width:760px;margin:0 auto;padding:22px 16px 130px}
</style>
</head>
```

### 5.5.3 Каркас `<body>`

```html
<body>
<header id="hdr" class="bare">
  <div id="top"><i></i></div>
  <div class="seg">
    <button class="sg" id="segTheory" type="button"><span class="ico">◀</span> Справочник</button>
    <button class="sg" id="segTasks" type="button">Практика <span class="ico">▶</span></button>
    <span class="pct" id="pct"></span>
    <button class="sg xbtn" id="segReset" type="button" title="Начать заново" aria-label="Начать заново">×</button>
  </div>
</header>
<canvas id="fx"></canvas>
<main id="scroller"><div class="wrap" id="app"></div></main>
<button id="cheatBtn" type="button">Шпаргалка</button>
<div id="ask"><div class="sheet2" id="askSheet">
  <h3 id="askT"></h3><div id="askB"></div><div class="row" id="askRow"></div>
</div></div>
<div id="modal"><div class="sheet"><div id="modalBody"></div></div></div>
<template id="refTpl">…</template>
```

### 5.5.4 Компонент «секция теории» (из lera, дословно)

```css
.section{background:var(--card);border-radius:var(--r);padding:28px;margin-bottom:20px;
  box-shadow:var(--shadow);position:relative;overflow:hidden}
.section::before{content:'';position:absolute;top:0;left:0;right:0;height:3px}
.section.c1::before{background:var(--c1)} .section.c2::before{background:var(--c2)}
.section.c3::before{background:var(--c3)} .section.c4::before{background:var(--c4)}
.section-icon{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;
  border-radius:12px;font-size:20px;margin-bottom:16px}
.c1 .section-icon{background:var(--c1)} .c2 .section-icon{background:var(--c2)}
.hl{padding:14px 18px;border-radius:12px;margin:16px 0;font-size:15px;line-height:1.7}
.hl-c1{background:var(--blue-tint);color:var(--blue-ink)}
.hl-c2{background:var(--green-tint);color:var(--green-ink)}
.talk-point{display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--line)}
.talk-point:last-child{border-bottom:none}
.talk-num{flex-shrink:0;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;
  justify-content:center;font-size:13px;font-weight:700;margin-top:2px;background:var(--c1);color:var(--c1i)}
.q-card{padding:16px 20px;background:var(--paper);border-radius:12px;margin-bottom:10px;
  display:flex;gap:14px;align-items:flex-start}
.q-text strong{color:var(--ink)}
.q-text em{color:var(--ink-soft);font-style:normal;font-size:13px;display:block;margin-top:4px}
.banner{background:linear-gradient(135deg,var(--acc-tint),var(--acc2-tint));border-radius:var(--r);
  padding:24px 28px;margin-bottom:20px;text-align:center;font-size:15px;color:var(--ink-soft);
  line-height:1.75;box-shadow:var(--shadow)}
```

**Раскрывающаяся секция (аккордеон)** — этого в семействе нет, но для 12–16 секций теории
нужно; реализация в том же стиле, `<details>` без JS:

```css
.section > summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:12px}
.section > summary::-webkit-details-marker{display:none}
.section > summary::after{content:"▾";margin-left:auto;color:var(--ink-soft);transition:transform .18s ease}
.section[open] > summary::after{transform:rotate(180deg)}
```

```html
<details class="section c1" open>
  <summary><span class="section-icon">🖱</span><h2>Кнопки: 20 слов, которые решают всё</h2></summary>
  …
</details>
```

### 5.5.5 Диалог (из numbers-lab, дословно)

```css
#ask{position:fixed;inset:0;z-index:110;background:rgba(75,67,81,.32);display:none;
  align-items:center;justify-content:center;padding:20px}
#ask.open{display:flex}
#ask .sheet2{background:#fff;border-radius:20px;padding:24px;max-width:400px;width:100%;
  box-shadow:0 24px 60px rgba(90,60,80,.22);border-top:5px solid var(--acc);
  animation:popIn .26s cubic-bezier(.33,1,.68,1)}
#ask .sheet2.t-ok{border-top-color:var(--green-ink)}
#ask .sheet2.t-almost{border-top-color:var(--almost-ink)}
#ask .sheet2.t-plain{border-top-color:var(--line)}
@keyframes popIn{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}
```

```js
var ask=document.getElementById("ask");
var DISMISS=null;
function closeDialog(){ask.classList.remove("open");DISMISS=null;}
/* buttons: [{label, go, ghost, danger}] · tone: ok | almost | plain · dismiss: что делает тап по фону */
function dialog(title,bodyHtml,buttons,tone,dismiss){
  document.getElementById("askT").textContent=title;
  document.getElementById("askB").innerHTML=bodyHtml||"";
  document.getElementById("askSheet").className="sheet2"+(tone?" t-"+tone:"");
  var row=document.getElementById("askRow");
  row.innerHTML="";
  buttons.forEach(function(cfg){
    var b=el("button","btn"+(cfg.ghost?" ghost":"")+(cfg.danger?" danger":""),esc(cfg.label));
    b.type="button";
    b.onclick=function(){closeDialog();if(cfg.go)cfg.go();};
    row.appendChild(b);
  });
  DISMISS=dismiss||null;
  ask.classList.add("open");
  var safe=row.querySelector(".btn.ghost")||row.querySelector(".btn");
  if(safe)try{safe.focus();}catch(e){}
}
function confirmBox(title,body,yesLab,noLab,go){
  dialog(title,body,[{label:yesLab,go:go},{label:noLab,ghost:true}],"plain");
}
ask.addEventListener("click",function(e){
  if(e.target!==ask)return;
  var d=DISMISS;closeDialog();if(d)d();
});
document.addEventListener("keydown",function(e){
  if(e.key!=="Escape")return;
  if(ask.classList.contains("open")){var d=DISMISS;closeDialog();if(d)d();return;}
  closeCheat();
});
```

### 5.5.6 Фидбек-плашка и микро-анимации (из numbers-lab)

```css
.fb{margin-top:10px;font-size:14.5px;padding:10px 12px;border-radius:12px;display:none}
.fb.show{display:block;animation:fbIn .22s ease}
.fb.ok{background:var(--green-tint);color:var(--green-ink)}
.fb.almost{background:var(--almost);color:var(--almost-ink)}
.fb.bad{background:var(--bad);color:var(--bad-ink)}
.fb.hint{background:var(--acc-tint);color:var(--acc-ink)}
.fb b{font-family:Georgia,serif}
.card.solved{background:var(--green-tint);border-color:var(--green)}
.pop{animation:pop .42s cubic-bezier(.33,1,.68,1)}
@keyframes pop{0%{transform:scale(1)}40%{transform:scale(1.018)}100%{transform:scale(1)}}
.shake{animation:shake .3s ease}
@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}
@keyframes fbIn{from{opacity:.3}to{opacity:1}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
```

Плюс одна правка против дефекта §5.3(10) — объявить плашку живым регионом:

```js
var fb=el("div","fb");fb.setAttribute("role","status");fb.setAttribute("aria-live","polite");
```

### 5.5.7 Сохранение состояния в localStorage — ОБЯЗАТЕЛЬНО

**Существующие паттерны.** verb-gangs сохраняет **всё состояние одним JSON** с дебаунсом
и миграцией ключей — это и есть готовый образец, брать целиком. Анкеты сохраняют
**по одному ключу на элемент** — надёжнее при частичной порче, но 40 ключей и ручное
восстановление в DOM. numbers-lab **не сохраняет ничего** — это дефект, который нельзя
повторять на 90-минутном уроке.

Рекомендация: **один JSON, как в verb-gangs, но с состоянием, достаточным для восстановления
ответов, а не только счёта.** Готовый код (адаптировано: имя ключа, версия схемы, `ans`):

```js
/* ---------- storage ---------- */
var LSKEY="uiEnglish.v1";
var STORE={
  get:function(k){
    try{
      if(window.storage&&window.storage.get)
        return window.storage.get(k).then(function(r){return r?r.value:null;},function(){return null;});
      return Promise.resolve(localStorage.getItem(k));
    }catch(e){return Promise.resolve(null);}
  },
  set:function(k,v){
    try{
      if(window.storage&&window.storage.set)return window.storage.set(k,v);
      localStorage.setItem(k,v);
    }catch(e){}
    return Promise.resolve();
  }
};
var SAVE_T=null;
function save(){
  if(SAVE_T)clearTimeout(SAVE_T);
  SAVE_T=setTimeout(function(){STORE.set(LSKEY,JSON.stringify(S));},250);
}

/* ---------- state shape ---------- */
function blank(){
  return {v:1, screen:"theory", deep:null,
          ans:{},            /* "blockId:itemIndex" -> {done:bool, clean:bool, mine:"…", tries:n} */
          prog:{},           /* blockId -> {done, score, seen} */
          stats:{},          /* topic -> {seen, miss} */
          mistakes:[],       /* [{block,prompt,mine,right,ex,topic}] */
          bonus:{}, sound:true, opened:{} /* какие секции теории раскрыты */ };
}

/* ---------- boot: load + migrate + render ---------- */
var S=null;
function boot(){
  STORE.get(LSKEY).then(function(raw){
    var loaded=null;
    try{loaded=raw?JSON.parse(raw):null;}catch(e){loaded=null;}
    S=loaded&&typeof loaded==="object"&&loaded.v===1?loaded:blank();
    var d=blank();
    for(var k in d)if(S[k]===undefined)S[k]=d[k];   /* миграция: добираем новые ключи */
    render();paintTop();
  });
}
boot();
```

Три обязательных дополнения к этому:

1. **Писать ответ в `S.ans` в тот же момент, что и балл.** Точка одна — функция `settle()`,
   которая уже есть в каждом упражнении numbers-lab:

```js
function settle(clean){
  if(scored)return;
  scored=true;
  S.ans[key]={done:true,clean:clean,mine:inp?inp.value:null,tries:tries};
  tally(topic,clean,noBump);
  if(!noBump)bump();
  save();                     /* ← добавленная строка */
  cb(clean);
}
```

2. **При рендере карточки восстанавливать её из `S.ans`** — если задание уже решено, рисовать
   его сразу в решённом виде и не давать переигрывать:

```js
var prev=S.ans[key];
if(prev&&prev.done){
  if(inp){inp.value=prev.mine||it.a;inp.disabled=true;}
  chk.disabled=true;hb.disabled=true;
  card.classList.add("solved");
  fb.className="fb ok show";
  fb.innerHTML="✓ <b>"+esc(it.a)+"</b>"+(prev.clean?" <span class=\"ru\">— с первого раза</span>":"");
  return card;                /* дальше обработчики не навешиваем */
}
```

3. **Сбрасывать по кнопке «×» полностью** — включая ключ в хранилище:

```js
function resetAll(){
  S=blank();
  STORE.set(LSKEY,JSON.stringify(S));
  closeCheat();closeDialog();
  parts.length=0;try{ctx.clearRect(0,0,cv.width,cv.height);}catch(e){}
  render();paintTop();toTop();
}
document.getElementById("segReset").onclick=function(){
  dialog("Начать заново?",
    "Обнулится всё: пройденные блоки, счёт, разбор ошибок и доп-раунды.",
    [{label:"Да, начать заново",go:resetAll,danger:true},{label:"Отмена",ghost:true}],"plain");
};
```

Побочный выигрыш: с восстановлением ответов исчезает нужда в `askLeave()` — уйти из блока
можно свободно, ничего не теряется. Это убирает главное трение numbers-lab.

### 5.5.8 Подсчёт результата (сводно из обоих приложений)

```js
var TOTAL_ITEMS=0,DONE_ITEMS=0;
BLOCKS.forEach(function(b){TOTAL_ITEMS+=b.items.length;});
function scoredTotal(b){return b.kind==="cards"?0:b.items.length;}   /* карточки не оцениваются */

function paintTop(){
  var f=document.querySelector("#top i");
  if(f)f.style.width=Math.min(100,DONE_ITEMS/TOTAL_ITEMS*100)+"%";
  var p=document.getElementById("pct");
  if(p)p.textContent=DONE_ITEMS+" / "+TOTAL_ITEMS;
}
function bump(){DONE_ITEMS++;paintTop();}

function tally(topic,clean,isExtra){
  if(!topic)return;
  var s=S.stats[topic]||(S.stats[topic]={seen:0,miss:0});
  s.seen++; if(!clean)s.miss++;
}
function weakList(){
  return Object.keys(S.stats).map(function(k){
    return {topic:k,seen:S.stats[k].seen,miss:S.stats[k].miss,rate:S.stats[k].miss/S.stats[k].seen};
  }).sort(function(a,b){return (b.miss-a.miss)||(b.rate-a.rate);});
}
function logMistake(block,prompt,mine,right,ex,topic){
  S.mistakes.push({block:block,prompt:prompt,mine:mine,right:right,ex:ex||"",topic:topic||null});
  save();
}
```

**Исправление анти-паттерна §5.3(4):** тему держать в самом элементе, а не в `TOPIC_MAP`:

```js
{topic:"buttons", t:"dialog", d:"Are you sure you want to discard changes?", a:"…", …}
…
function topicOf(item){return item.topic||null;}
```

### 5.5.9 Экран результатов (структура из numbers-lab)

```
.eyebrow  "Результат · <имя>"
h1        "Готово"
card      .score "42 / 53" + "79% с первой попытки" + вердикт по трём порогам
h3        "Где спотыкался — по темам"
card      для каждой темы: .topline (название EN + <span class="ru">рус</span> + miss/seen) + .bar
card      "Хочешь ещё?" → доп-раунд по слабейшей теме / выбор темы / "нет, готово"
h3        "Твои ошибки — разбор"
p.ru      "Покажи этот список на уроке или проговори вслух каждый правильный вариант."
.review × N   .q (вопрос) + .mine (твой вариант, красный) + .right (правильно, зелёный) + p.ru (почему)
button.wide   "Скопировать разбор для преподавателя"     ← из анкет
p.sig     подпись
```

```css
.score{font-family:Georgia,serif;font-size:56px;line-height:1;color:var(--acc-ink)}
.review{background:#fff;border:1px solid var(--line);border-left:3px solid var(--acc);
  border-radius:12px;padding:14px 16px;margin-bottom:10px}
.review .q{font-family:Georgia,serif;font-size:19px}
.review .mine{color:var(--bad-ink)}
.review .right{color:var(--green-ink);font-family:Georgia,serif}
.bar{height:8px;border-radius:99px;background:#F1E4DE;overflow:hidden;margin:6px 0 18px}
.bar i{display:block;height:100%;background:linear-gradient(90deg,var(--acc),var(--acc2));transition:width .4s ease}
.sig{text-align:center;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--ink-soft);margin:26px 0 0;opacity:.75}
```

### 5.5.10 Экспорт разбора преподавателю (из анкет, адаптировано)

```js
function exportText(){
  var lines=[];
  lines.push("# Interface English — результат");
  lines.push("Дата: "+new Date().toISOString().slice(0,10));
  lines.push("Счёт: "+scoreGot()+" / "+scoreTotal());
  lines.push("");
  var weak=weakList().filter(function(x){return x.miss>0;});
  if(weak.length){
    lines.push("## Слабые темы");
    weak.forEach(function(w){lines.push("- "+TOPICS[w.topic].ru+": ошибок "+w.miss+" из "+w.seen);});
    lines.push("");
  }
  lines.push("## Ошибки");
  S.mistakes.forEach(function(m){
    lines.push("**"+m.prompt+"**");
    lines.push("- мой вариант: "+(m.mine||"—"));
    lines.push("- правильно: "+m.right);
    if(m.ex)lines.push("- почему: "+m.ex);
    lines.push("");
  });
  return lines.join("\n");
}
function copyReport(btn){
  var text=exportText();
  function ok(){
    btn.classList.add("copied");btn.textContent="✓ Скопировано";
    setTimeout(function(){btn.classList.remove("copied");btn.textContent="Скопировать разбор";},2500);
  }
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(ok,function(){fallback(text);ok();});
  }else{fallback(text);ok();}
  function fallback(t){
    var ta=document.createElement("textarea");ta.value=t;document.body.appendChild(ta);
    ta.select();try{document.execCommand("copy");}catch(e){}document.body.removeChild(ta);
  }
}
```

### 5.5.11 Плавающая шпаргалка (из numbers-lab, дословно)

```css
#cheatBtn{position:fixed;right:16px;bottom:16px;z-index:105;background:var(--acc2);color:var(--acc2-on);
  border:0;border-radius:999px;padding:13px 20px;font:inherit;font-size:15px;
  box-shadow:0 8px 20px rgba(90,120,150,.22);cursor:pointer}
#cheatBtn.on{background:#fff;color:var(--ink-soft);border:1px solid var(--line)}
#modal{position:fixed;inset:0;z-index:96;background:rgba(75,67,81,.35);display:none;padding:16px;overflow:auto}
#modal.open{display:block}
#modal .sheet{max-width:720px;margin:24px auto;background:var(--paper);border-radius:22px;padding:20px 20px 96px}
```

```js
var modal=document.getElementById("modal"),mBody=document.getElementById("modalBody");
var cheatBtn=document.getElementById("cheatBtn");
function openCheat(){
  if(!mBody.firstChild)mBody.appendChild(document.getElementById("refTpl").content.cloneNode(true));
  modal.classList.add("open");cheatBtn.classList.add("on");cheatBtn.textContent="Закрыть";
}
function closeCheat(){
  modal.classList.remove("open");cheatBtn.classList.remove("on");cheatBtn.textContent="Шпаргалка";
}
cheatBtn.onclick=function(){ if(modal.classList.contains("open"))closeCheat(); else openCheat(); };
modal.addEventListener("click",function(e){if(e.target===modal)closeCheat();});
```

### 5.5.12 Озвучка (из verb-gangs, дословно) — для «как это читается»

```js
function say(t){
  if(!S||!S.sound||!("speechSynthesis" in window))return;
  try{var u=new SpeechSynthesisUtterance(t);u.lang="en-GB";u.rate=.8;
    speechSynthesis.cancel();speechSynthesis.speak(u);}catch(e){}
}
function speakBtn(t){var b=el("button","speak","♪ послушать");b.type="button";b.onclick=function(){say(t);};return b;}
```

### 5.5.13 Хелперы, без которых ничего не собирается

```js
var app=document.getElementById("app"),SCR=document.getElementById("scroller");
function el(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function toTop(){if(SCR)SCR.scrollTop=0;try{if(window.pageYOffset)window.scroll(0,0);}catch(e){}}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
var REDUCED=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function slide(dir){if(REDUCED)return;app.classList.remove("pg-r","pg-l");void app.offsetWidth;app.classList.add(dir);}
function norm(s){
  return String(s).toLowerCase().replace(/[’']/g,"").replace(/[-–—]/g," ")
    .replace(/[.,!?;:"()°]/g," ").replace(/\s+/g," ").trim();
}
```

### 5.5.14 Чеклист «готово к уроку»

- [ ] один файл + `favicon.svg`, ноль сетевых запросов (проверить в DevTools → Network)
- [ ] работает из `file://` и на телефоне (проверить `100dvh`, единственный скроллер)
- [ ] `localStorage`: закрыть и открыть страницу — ответы, счёт и раскрытые секции на месте
- [ ] кнопка «×» полностью сбрасывает, включая ключ в хранилище
- [ ] в каждом упражнении есть выход: `Hint` / «покажи ответ» / автоподсказка на 3-й попытке
- [ ] при верном ответе объясняется **почему**, при неверном — что именно не так («почти!»)
- [ ] `prefers-reduced-motion` глушит все анимации; hover-стили только в `@media (hover:hover)`
- [ ] `:focus-visible` виден на всех кнопках, полях и плитках
- [ ] шпаргалка доступна из любого места
- [ ] экран результатов даёт разбор ошибок и кнопку «скопировать для преподавателя»
- [ ] в UI указано ожидаемое время каждого раздела
- [ ] русский только в объяснениях, английский только в материале и надписях кнопок действий
