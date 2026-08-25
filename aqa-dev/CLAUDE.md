# AQA Roadmap App + Webmeji Character Engine

## Project Overview

AQA Roadmap — single-page React + Vite study app for QA Automation learning path. A 4-month curriculum broken into weeks/tasks with checkbox tracking, notes, glossary, and resources. Ships with a standalone character engine (Webmeji) — an animated sprite that walks, climbs, flies, and interacts with the user on top of the app.

**Author**: Stanislau Charnou
**Language**: Russian UI, bilingual character phrases (EN/RU)

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 18.3.1 |
| Build | Vite | 6.x |
| Animation | motion (framer-motion) | 12.35.1 |
| Confetti | canvas-confetti | 1.9.4 |
| Character engine | Vanilla JS (webmeji) | standalone |
| Fonts | IBM Plex Sans, JetBrains Mono | Google Fonts CDN |

## Build & Deploy

```bash
cd /c/Repositories/charnou.github.io/aqa-dev
npm run build          # output -> ../aqa/
cp public/webmeji*.{js,css} ../aqa/   # webmeji files are NOT bundled by Vite
```

- **Dev source**: `aqa-dev/`
- **Build output**: `../aqa/` (Vite `outDir`, `emptyOutDir: false`)
- **Base path**: `/aqa/` (set in `vite.config.js`)
- Webmeji files live in `public/` and are loaded as plain `<script>` tags in `index.html` — they are **not** part of the Vite bundle, not processed by React

## index.html — Loading Order

```html
<link rel="stylesheet" href="webmeji.css" />           <!-- character styles -->
<div id="root"></div>                                    <!-- React mounts here -->
<script type="module" src="/src/main.jsx"></script>      <!-- React app (Vite-bundled) -->
<script src="webmeji-shouts.js"></script>                <!-- phrases -> window.SHIMEJI_SHOUTS -->
<script src="webmeji-config.js"></script>                <!-- config -> window.SHIMEJI_CONFIG, window.SPAWNING -->
<script src="webmeji.js"></script>                       <!-- engine -> waits for DOMContentLoaded -->
```

Body background: `#0D1117` (GitHub dark theme base).

---

# PART 1: React App (src/)

## Entry Point (src/main.jsx)

```jsx
createRoot(document.getElementById("root")).render(<App />);
```

No StrictMode, no Router, no providers. Single `<App />` component handles everything.

## App.jsx — Main Component (~1440 lines)

### State Variables

| Variable | Setter | Type | Description |
|----------|--------|------|-------------|
| `ck` | `sC` | `{[taskId]: true}` | Checkbox state for all tasks |
| `ex` | `sE` | `{[taskId]: true}` | Expanded/collapsed state per task |
| `em` | `sM` | `{[month]: true}` | Expanded months (default: all 4 open) |
| `gk` | `sGK` | `{[term]: true}` | Glossary learned terms |
| `notes` | `sN` | `{[taskId]: "text"}` | User notes per task |
| `tab` | `sT` | string | Active tab ID |
| `gf` | `sG` | string | Glossary filter/search text |
| `ok` | `sO` | boolean | Data loaded flag (prevents saves before load) |

### Tab System

7 tabs defined in `TABS` constant, hash-based routing (`window.location.hash`):

| Tab ID | Emoji | Label | Content |
|--------|-------|-------|---------|
| `road` | 🗺️ | Роадмап | 4-month roadmap with collapsible months/weeks |
| `alt` | 🔀 | Альтернативы | Alternative tools/frameworks overview |
| `soft` | 🤝 | Soft Skills | Communication & thinking skills |
| `tips` | 💡 | Советы | Practical learning advice |
| `dict` | 📖 | Словарь | Glossary with filter, new/learned sections |
| `res` | 📚 | Ресурсы | Curated learning resources by category |
| `notes` | 📝 | Конспект | All user notes grouped by source + download button |

Tab selection: `setTab(id)` updates state + `window.location.hash`. `hashchange` listener syncs back.

### Persistence (src/utils/storage.js)

**localStorage keys** (split by category for efficiency):
- `aqa-roadmap` — roadmap task checks
- `aqa-alternatives` — alternative task checks
- `aqa-softskills` — soft skills checks
- `aqa-advice` — advice checks
- `aqa-glossary` — learned glossary terms
- `aqa-months` — expanded month state
- `aqa-notes` — all user notes

**Migration**: old single-key format (`aqa-v5`) auto-migrates on first load, then deletes old key.

**Save mechanism**: debounced 400ms via `useEffect` on `[ck, em, gk, notes, ok]`. Ref `sv2` holds timeout ID. `save()` calls `splitChecks()` to route task IDs by prefix (`alt-*`, `ss-*`, `adv-*`, else roadmap).

**Load**: `load()` reads all keys, merges checks back into single `ck` object. Returns `null` if no data.

### Auto-scroll on Load

On first load (`scrolledRef`), finds the first unchecked roadmap task, expands its month, and smooth-scrolls to it. Custom easing animation (ease-in-out quadratic, max 800ms). Cancellable by user interaction (wheel, touchstart, pointerdown).

### Task Toggling & Confetti

`tg(id, event)` — toggles checkbox for task ID. On first check (not uncheck), fires `canvas-confetti` burst at the checkbox position:
- 25 particles, spread 50, 5 brand colors
- Same for glossary terms via `tgk(term, event)` (30 particles)

### Text Formatting Pipeline

**`formatDesc(text)`** — processes task description strings:
1. Splits on backtick-wrapped code segments
2. Code: runs through `fmtCode()` (auto-indents multi-statement blocks with `{`/`}`) then `synHL()` (syntax highlighting)
3. Non-code: runs through `fmtText()` which handles `**bold**` markdown and `hlAbbr()` (highlights uppercase abbreviations like API, REST, CI/CD)

**Syntax highlighter** (`synHL`):
- Regex-based, supports: keywords (blue #569CD6), strings (orange #CE9178), numbers (green #B5CEA8), builtins (blue), objects (teal #4EC9B0), operators (#D4D4D4), functions (#DCDCAA)
- VS Code–inspired color scheme

### Lava Lamp Gradient System

Two gradient generators for animated text:
- `lavaGrad(hex)` — wider 4-color variation (lighter, warmer, deeper + original). Used for month numbers, week labels. Animation: `lavaFlow 18s`.
- `lavaSub(hex)` — subtle 3-color variation. Used for section labels, glossary terms. Animation: `lavaFlow 25s`.

CSS animation `@keyframes lavaFlow` — moves `background-position` from 0% to 400% with `-webkit-background-clip: text`.

Additional animations:
- `checkPop` — scale bounce (1 → 1.3 → 1) on checkbox toggle
- `lavaGlow` — brightness pulse + box-shadow for checked items
- `glowPulse` — subtle box-shadow pulse for search buttons
- `lavaPulse` — brightness + drop-shadow for progress circles

### Navigation (`goToTask`)

Used by notes page "go to task" links:
1. Determines target tab from ID prefix (`alt-*` → alt, `ss-*` → soft, `adv-*` → tips, default → road)
2. Expands month if roadmap task
3. Sets `scrollTargetRef` — task component uses callback ref to `scrollIntoView({ behavior: "smooth", block: "center" })`
4. Expands the task

### Task Renderer (`rT(task, color)`)

Renders individual task item with:
- **Checkbox**: colored square with checkmark SVG, lava-glow animation when checked
- **Title**: strikethrough + dimmed when checked. Pencil icon if notes exist for this task
- **Time badge**: monospace, dark pill (e.g., "1.5ч")
- **Chevron**: rotates 180° when expanded
- **Expanded content** (AnimatePresence, height animation):
  - Formatted description (`formatDesc`)
  - Google search buttons (`SearchButton` component) — each query is a clickable link
  - Notes textarea (min-height 60px, auto-deletes note on empty)

### Motivation Cards (`rM(motivation)`)

Styled cards with `data-platform` attr (webmeji can walk on them). Lava gradient text, colored border. Interspersed between roadmap months and on other tabs.

### Tab Content Details

**Roadmap (`road`)**:
- Motivational card → month blocks (collapsible). Each month: header with number, title, progress circle (SVG), progress stats (d/n · ~Xч), chevron. Expanded: weeks with labels → tasks.
- Motivations inserted after months 1, 2, 3 and at end.

**Alternatives (`alt`)**: intro text → motivation card → single `data-platform` block with all items. Color: #F0883E.

**Soft Skills (`soft`)**: same structure, color: #D2A8FF.

**Tips (`tips`)**: split into two blocks (first 5 and rest) with motivation cards between. Color: #F778BA.

**Dictionary (`dict`)**:
- Search input filters by term or definition
- LayoutGroup for smooth reorder animations
- Two sections: "Новые" (new, blue) and "Выученные" (learned, green)
- Each term: monospace lava-text name + definition, checkbox on right
- AnimatePresence with `popLayout` mode for smooth enter/exit
- Empty states: "Все термины выучены!" / "Отмечай выученные слова"

**Resources (`res`)**: grouped by category (Теория QA, JavaScript, Playwright, SQL, etc.). Each category: title + bulleted items with left border.

**Notes (`notes`)**:
- Empty state: "Пока нет заметок..."
- Groups notes by source: roadmap months, alternatives, soft skills, advice
- Each section: lava gradient title, dark card with note text (left colored border) + task name with navigation link
- **Download button** (top right): generates TXT file with all notes grouped by section. Filename: `aqa-conspect-YYYY-MM-DD.txt`. Format: header with date + count, then sections with `─` separators, task names + `- - -` + note text.

### Footer

Centered text: "прогресс сохраняется автоматически" + "made by Stanislau Charnou". Monospace, very dim colors.

### Header (Sticky)

- `data-platform` + `position: sticky` (webmeji detects this for tab tracking)
- Title "AQA Roadmap" + version "v5" + progress counter (dn/tot)
- Global progress bar: lava gradient, 100% = solid green (#3CC78C)
- Tab buttons: emoji + label, active = bold + blue underline

## Components

### Chevron (src/components/Chevron.jsx)
Simple SVG chevron (down arrow). Props: `s` (size, default 14), `c` (color, default #484F58).

### SearchButton (src/components/SearchButton.jsx)
Google search link button. Props: `q` (search query). Opens `google.com/search?q=...` in new tab. Styled: monospace, blue lava gradient text, magnifying glass icon + external link icon, glow pulse animation.

## Data Files (src/data/)

### plan.js (647 lines)
4-month roadmap. Structure:
```js
[{
  month: 1,
  title: "Фундамент: Теория QA + JavaScript",
  color: "#E86F3C",    // orange
  weeks: [{
    week: "Неделя 1–2",
    sub: "Теория тестирования",
    tasks: [{
      id: "1-1",       // month-tasknum
      text: "QA vs QC vs тестирование",
      time: "1.5ч",
      desc: "...",      // supports **bold**, `code`, abbreviations
      s: ["query1", "query2"]   // Google search suggestions
    }]
  }]
}]
```

Month colors: 1=#E86F3C (orange), 2=#3C8CE8 (blue), 3=#8C3CE8 (purple), 4=#3CC78C (green).

### alternatives.js (112 lines)
Task IDs: `alt-1` through `alt-N`. Same structure as plan tasks. Topics: Cypress, Selenium, JMeter, Appium, etc.

### softSkills.js (127 lines)
Task IDs: `ss-1` through `ss-N`. Topics: communication, reporting, time management, etc.

### advice.js (162 lines)
Task IDs: `adv-1` through `adv-N`. Practical learning tips, interview prep, portfolio advice.

### glossary.js (157 lines)
Array of `{ t: "TERM", d: "definition" }`. ~60 QA/dev terms. Definitions may contain backtick code.

### resources.js (69 lines)
Array of `{ c: "Category", i: ["item1", "item2"] }`. Categories: Теория QA, JavaScript, Playwright, SQL, API, Git, Docker, Практика, Собеседования.

### motivations.js (27 lines)
5 motivational cards: `{ id, text, c }`. Displayed between roadmap sections.

## Design System

**Color palette** (GitHub dark theme):
- Background: `#0D1117`
- Card: `#161B22`
- Border: `#21262D`
- Dimmed: `#30363D`, `#484F58`
- Secondary text: `#8B949E`
- Primary text: `#C9D1D9`, `#E6EDF3`
- Brand colors: orange #E86F3C/#F0883E, blue #3C8CE8/#58A6FF, purple #8C3CE8/#D2A8FF, green #3CC78C, pink #F778BA

**Layout**: max-width 780px, centered. Content padding 10px. All inline styles (no CSS modules/files for React).

**`data-platform` attribute**: added to elements the webmeji character can walk on — header, month buttons, content blocks, motivation cards. This is the bridge between React app and webmeji engine.

---

# PART 2: Webmeji Character Engine (public/)

## public/ Directory — File Reference

### favicon.svg
SVG favicon: dark rounded rectangle (#0D1117) with a 4-color gradient checkmark (orange → blue → purple → green). Matches the app's lava gradient theme.

### shimeji/ (sprite assets)
46 PNG sprite frames (`shime1.png` — `shime46.png`). Each ~2-4KB. Used by the character for all animations. Note: not all 46 are referenced in config — some may be extras or for future use.

---

## webmeji.js — Character Engine (~2700 lines)

Vanilla JS, zero dependencies. Entirely self-contained. Runs independently of React.

### Top-Level Initialization (lines 11-40)

```
DOMContentLoaded → collect unique config names from window.SPAWNING
                  → resolve to window[name] objects
                  → preloadImages() all configs in parallel (Promise.all)
                  → create new Creature(id, cfg) for each spawn entry
```

**`preloadImages(config)`**: extracts all `.frames` arrays from config, creates `Image()` objects and returns a Promise that resolves when all frames are loaded.

### Creature Class (lines 59-2697)

#### Constructor (lines 60-372)

**DOM Creation**:
1. `div.webmeji-container` → appended to `document.body`
2. `div` (imgWrap) → `overflow:hidden`, relative positioning → inside container
3. `img` → character sprite, set to walk frame 0 → inside imgWrap
4. `div.webmeji-bubble` → speech bubble → inside container

**Phrase Array Loading** (from `window.SHIMEJI_SHOUTS`):
| Internal Property | Source Key | Fallback |
|-------------------|-----------|----------|
| `SHOUT_PHRASES` | encouragement | `[]` |
| `FLY_PHRASES` | flying | `[]` |
| `THINK_PHRASES` | thinking | `[]` |
| `DRAG_PHRASES` | dragging | `[]` |
| `TIRED_PHRASES` | tired | `[]` |
| `FALLEN_PHRASES` | fallen | `['Ouch!']` |
| `CURSOR_PHRASES` | cursorCatch | `[]` |
| `HOP_PHRASES` | hop | `[]` |
| `HOUSE_INSIDE_PHRASES` | houseInside | `[]` |
| `HOUSE_CLICK_PHRASES` | houseClick | `[]` |
| `HOUSE_CLICK_INSIDE_PHRASES` | houseClickInside | `[]` |
| `PET_PHRASES` | petReaction | `[]` |
| `WELCOME_BACK_PHRASES` | welcomeBack | `[]` |

**State Initialization**:
| Flag | Initial | Purpose |
|------|---------|---------|
| `isDragging` | false | User is dragging the character |
| `isFalling` | false | Character is falling to ground |
| `isPetting` | false | Pet interaction active |
| `isJumping` | false | Jump/flight in progress |
| `tripAfterFallActive` | false | Fallen trip animation playing |
| `isInHouse` | false | Character is inside house |
| `isAttachedToCursor` | false | Clinging to cursor |
| `attachedToViewport` | true | Position is viewport-relative |
| `direction` | 1 | Movement direction: 1=right, -1=left |
| `facing` | 'left' | Visual facing of base sprites |
| `currentEdge` | 'bottom' | Which surface character is on |
| `currentPlatform` | null | Platform object if on one |
| `_flyInToken` | 0 | Cancellation token for flyIn |
| `_isOnCurrentScreen` | true | Character is on the current tab's screen |

**Timer References** (all cleared by `resetAnimation`/`clearAllTimers`):
- `frameTimer` — setInterval for sprite frame cycling
- `dragFrameTimer` — setInterval for drag animation
- `actionCompletionTimer` — setTimeout for action duration
- `_tripFrameTimer` — setInterval for fallen animation
- `_flyToCursorTimer` — setInterval for cursor chase frames
- `_cursorFrameTimer` — setInterval for cursor cling frames
- `_cursorFollowRAF` — requestAnimationFrame for cursor follow
- `_cursorDetachTimer` — setTimeout for detach from cursor
- `_houseFlightTimer` — setInterval for house flight frames
- `_houseDelayTimer` — setTimeout before flying to house
- `_housePhraseTimer` — setTimeout for next house phrase
- `_houseExitTimer` — setTimeout for exiting house
- `_houseDismissTimer` — setTimeout for house slide-out
- `_thinkTimer` — setTimeout for thought bubble during sit
- `_bubbleTimer` — setTimeout for hiding bubble text
- `_bubbleHideTimer` — setTimeout for clearing bubble element

**Pointer Tracking**:
- `isPointerDown` — global flag, set by window mousedown/touchstart, cleared by mouseup/touchend
- `_mouseX`, `_mouseY` — live cursor position from window mousemove (passive)

**House Setup**: creates `.webmeji-house` div with 🏠 emoji, appends to body. Click listener → `_onHouseClick()`.

**Indicator Dot**: creates `.webmeji-indicator` div, appends to body. Tracks off-screen character position.

**Screen Tracking State**:
- `_homeScreenIdx` — tab index where character "lives"
- `_currentScreenIdx` — tab index user is currently viewing
- `_isOnCurrentScreen` — whether character is on the current screen

**Hidden Before Spawn**: positioned at (-200, -200), opacity 0, pointerEvents none.

**Delayed Spawn** (1s timeout):
1. `scanPlatforms()` to find `[data-platform]` elements
2. Filter visible platforms (top within viewport)
3. Random roll:
   - < 0.4 (40%): spawn on random visible platform (content-relative, `attachedToViewport = false`)
   - < 0.75 (35%): spawn on viewport bottom
   - else (25%): spawn on random allowed edge (top/left/right)
4. Clamp to viewport bounds (double-clamped for safety)
5. Show container (opacity 1)
6. Start first action: edge actions if on edge, else first from `actionSequence`
7. Start `animate()` RAF loop
8. Init screen tracking indices

**Event Listeners**:
- `resize` → recalculate `containerWidth`, `containerHeight`, `maxPos`, clamp `positionX`
- `scroll` (passive) → when `attachedToViewport === false`: compensate position by `scrollDelta`. Also updates cached platform rect if on platform.
- `hashchange` → tab change handler (see Screen Persistence section)
- Platform scan timer: `setInterval(scanPlatforms, 500)`

**Final constructor calls**: `enablePetInteraction()`, `enableDragInteraction()`.

#### Coordinate System (CRITICAL)

**Dual mode** controlled by `attachedToViewport`:
- `true` — `positionX`/`positionY` are viewport-relative pixels. Used when on screen edges, flying, in house, after drag. Scroll does NOT affect position.
- `false` — position is content-relative. The `scroll` listener subtracts scroll delta from `positionY`. Used when on platforms. Character stays on the platform as user scrolls.

**`currentEdge`** semantics:
- `'bottom'` — character stands on TOP of a surface (feet at surface top). This is the default/ground state.
- `'left'` — character is on a LEFT wall (hanging on left side)
- `'right'` — character is on a RIGHT wall
- `'top'` — character hangs from the BOTTOM of a surface (upside down / ceiling)

**`applyEdgeOffset()`** — adjusts visual container position:
- Left edge: offset X by `-containerWidth/2`
- Right edge: offset X by `+containerWidth/2`
- Top edge: offset Y by `-containerHeight/4`
- During drag: no offset, direct positioning

#### Sprite & Direction Control

- `updateImageDirection()` — `scaleX(1)` when `facing === 'left'`, `scaleX(-1)` when `facing === 'right'`. Base sprites face left.
- `setFacingFromDelta(dx)` — if `dx !== 0` and not dragging, set facing from sign of dx.
- `updateEdgeClass()` — toggles CSS classes `edge-left`, `edge-right`, `edge-top` on container. Calls `applyEdgeOffset()`.

#### Speech Bubble System

**`showBubble(text, duration, onDone, force = false)`**:
1. **Phrase lock**: if `_bubbleUntil` is in the future and `force === false`, immediately calls `onDone` and returns (won't interrupt active speech)
2. Clears previous timers (`_bubbleTimer`, `_bubbleHideTimer`)
3. Sets `_bubbleUntil = now + duration`
4. Sets text, forces reflow (`element.offsetWidth`), adds `.visible` class
5. After `duration`: removes `.visible`, resets `_bubbleUntil`, waits 350ms for fade-out, then clears text and calls `onDone`

**`hideBubble()`**: immediately clears all bubble state, removes class, empties text.

`force = true` is used for drag phrases and house click — these always interrupt.

#### Timer Management

**`resetAnimation()`**: clears ALL timers (frame, action, trip, cursor, house flight), calls `hideBubble()`, resets `currentFrame` to 0.

**`clearAllTimers()`**: calls `resetAnimation()` + cancels the main `animationFrameId` RAF.

#### Action System

**`setNextAction()`** — the brain. Called after every action completes. Evaluation chain:

1. Guard: skip if dragging, falling, in house, or jumping
2. Call `resetAnimation()`
3. **Platform edge** (currentPlatform exists AND currentEdge !== 'bottom'): delegates to `platformEdgeAction()` — 25% hang, 50% climb, 25% fall off
4. **Viewport edge** (top/left/right): delegates to `edgeAction()` — 25% hang, 50% climb, 25% fall to bottom
5. **5% JUMP_CHANCE**: if on surface, not jumping, no fly cooldown → `jumpToEdge()` to random allowed edge
6. **16% fly to platform**: `scanPlatforms()`, filter candidates (different from current, visible in viewport), pick random → `flyToPlatform()` with random target surface
7. **7% fly to cursor**: only if `_mouseX >= 0`, on bottom, visible, no cooldown → `flyToCursor()`
8. **3% summon house**: only if house not active, on bottom, visible, no cooldown → `summonHouse()`
9. **5% small hop**: only on bottom, on surface, visible → `smallHop()`
10. **14% shout**: only on bottom, visible → `shout()` with encouragement phrase, sets `forceWalkAfter`
11. **Forced walk**: if `forceWalkAfter` flag → `startForcedWalk()`
12. **Forced think**: if `forceThinkAfter` flag → `startForceThink()`
13. **Default**: advance `currentActionIndex` in `actionSequence`, reshuffle when exhausted → `startAction()`

**Fly cooldown**: 5 seconds after `_landedAt`. Prevents immediate re-flight after landing.

**`startAction(action)`**:
- Sets random `direction` for climbTop and climbSide
- If jumping: just restarts RAF loop (don't play animation)
- **Static actions** (sit, hangstillSide, hangstillTop):
  - Show first frame for random or fixed duration
  - Sit: 40% chance to show thought bubble after 0.8-2.3s delay (only if visible)
  - After duration: hide bubble, set `forceWalkAfter`, call `setNextAction()`
- **Animated actions**: call `playAnimation(frames, interval, loops, onComplete)`
  - Post-action hooks: spin → `forceWalkAfter`, trip → `forceWalkAfter`, dance → `forceThinkAfter`

**`playAnimation(frames, interval, loops, onComplete)`**:
- `setInterval` cycles frames
- Counts completed loops
- On completion: clears timer, sets `currentAction = null`, calls `onComplete` via `setTimeout(..., 0)`

**`actionSequence`**: shuffled copy of `ORIGINAL_ACTIONS`. Cycles through, reshuffles when index wraps. Weighted distribution: walk 63%, spin 16%, sit 11%, dance 11%, trip 5%.

#### Movement — Main Animation Loop (`animate(time)`)

Called every frame via RAF. Delta-time based movement.

**Off-screen check**: if `_isOnCurrentScreen === false`:
- Update indicator dot
- Every 5s, increasing chance to come back (5% base, +0.7%/s, caps at 60%). If triggered: show container, `flyIn()` from direction of old screen.
- Skip all movement.

**Busy states**: if dragging, falling, attached to cursor, or in house → only update indicator + continue RAF.

**Walking** (walk, forced-walk, climbTop):
- `positionX += direction * walkspeed * delta`
- Set facing from movement direction
- **Wall bounce**: at `positionX <= 0` or `>= maxPos`, reverse direction + facing
- **Platform top surface**: bounce at `currentPlatform.left + 8` and `currentPlatform.right - 8`
  - 25% chance to `transitionToPlatformEdge('left'/'right')` instead of bouncing
- **Platform bottom surface** (climbTop): bounce at platform edges
  - 40% chance to transition to side edge instead
- Hard clamp: never off-screen

**Climbing side** (climbSide):
- `positionY += direction * walkspeed * delta`
- Facing matches edge side
- On platform: bounce between `platform.top` and `platform.bottom - containerHeight`
  - At top: `transitionToPlatformEdge('top-surface')` (climb onto top)
  - At bottom: 60% `transitionToPlatformEdge('bottom-surface')`, 40% `detachFromPlatformEdge()`
- On viewport edge: bounce between 0 and `innerHeight - containerHeight`

**Platform validity check** (every 0.5s via `_validateTimer`):
- If platform element disconnected from DOM or has zero size → fall
- Otherwise: refresh cached bounds, reposition character on correct surface

**Sanity recovery** (every 0.5s):
- If on bottom, viewport-attached, not jumping/falling, and position is way off-screen → teleport to random position on viewport bottom

**Indicator update**: called every frame.

#### Platform Transitions

**`transitionToPlatformEdge(edge)`**: move from one surface of a platform to another:
- Cancels all animations and RAF
- Repositions character to the target surface edge
- Sets `currentEdge`, `attachedToViewport = false`
- Resumes: `startEdgeIdle()` or `setNextAction()` + new RAF

**`detachFromPlatformEdge()`**: set edge to bottom, clear platform, `fallToBottom()`.

#### Falling (`fallToBottom`)

1. Guard: skip if already falling
2. Reset state: `isFalling = true`, `currentEdge = 'bottom'`, clear platform, `attachedToViewport = false`
3. Snapshot `scrollYAtStart` for scroll compensation when falling onto platforms
4. Choose animation: `falling` config (or `jump` if `useJumpAnim` flag — used after wall crash)
5. `scanPlatforms()` → `findSurfaceBelow()` → get target Y and landing platform
6. If already at target (distance ≤ 0): land immediately with `softLand()`
7. Animate: `positionY = startY + fallspeed * elapsed`, compensate for scroll if landing on platform
8. **Edge grab during fall** (10% per-frame chance): scan platforms for nearby left/right edges within 100px → grab and idle
9. On landing:
   - Refresh platform from DOM if landing on one
   - If fall < 40px: `softLand()` (no trip)
   - Else: `playTripAfterFall()` (fallen animation + 90% ouch phrase + 2s recovery)

**`softLand()`**: reset state, show stand frame, `setNextAction()`.

**`playTripAfterFall()`**: play `fallen` frames once → wait `gettingupspeed` ms → `resumeAfterFallen()`.

**`resumeAfterFallen()`**: refresh platform position, 35% tired phrase, start with 'sit' then `setNextAction()`.

#### Jumping to Edges (`jumpToEdge(targetEdge)`)

1. Guard: skip if busy, edge not allowed
2. Calculate end position: random point on target edge
3. Linear interpolation at `jumpspeed` over `distance / jumpspeed` seconds
4. Play `jump` animation during flight
5. On arrival: set `currentEdge`, `updateEdgeClass()`, `startEdgeIdle()`
6. Interruptible by drag

#### Flying to Platforms (`flyToPlatform(target, targetEdge)`)

- Targets: top surface, left side, right side, or bottom-surface
- Records `scrollYAtStart` for scroll compensation
- Direction-based animation: going up = jump sprite, going down = falling sprite
- Linear interpolation at `jumpspeed`
- On landing: refresh platform bounds from DOM, set appropriate edge/position, resume actions

#### FlyIn System (`flyIn(fromSide)`)

Most complex movement. Two-phase flight triggered by tab change.

**Setup**:
- Full cleanup (`clearAllTimers`)
- Increment `_flyInToken` for cancellation
- Start position: off-screen (left or right), random Y in middle 60%
- Initial velocity: horizontal only, at `jumpspeed * 1.5`

**Phase 1 — Horizontal** (2-3 seconds):
- Constant horizontal speed, no vertical component
- **Wall crash variant** (10% chance, decided upfront):
  - If character hits opposite wall: 50% stick to wall (edge idle), 50% fall down (`fallToBottom` with jump animation)
  - Returns immediately on wall hit
- **Edge grab** (if not crash variant, after 0.5s in):
  - `scanPlatforms()`, check each platform within 200px
  - 15% chance per nearby platform to divert
  - `_pickClosestPlatformEdge()` finds nearest surface (top, left, right, or bottom-surface)
  - Only grabs if target is in flight direction (prevents backward U-turns)
  - Immediately enters Phase 2 targeting the grabbed edge
- After `horizontalDuration`: enter Phase 2 with `pickFlyTarget()`

**Phase 2 — Targeting**:
- Smooth velocity lerp toward target:
  - `desiredV = (target - pos) / dist * speed`
  - `lerp rate`: 10 when close (<80px), 5 medium (<200px), 3 far
  - Normalize to constant speed after lerp
- **Dynamic animation**: switches between jump (ascending, vy < -40) and falling (descending, vy > 25) with 400ms hysteresis to prevent flicker
- **Target validation** (every 0.5s):
  - Check platform still exists in DOM
  - Update target coordinates from fresh DOM rect
  - Cap max shift to prevent mid-flight reversals
  - If platform moved too much or disappeared: re-pick target via `pickFlyTarget()`
  - Fallback: land at viewport bottom below current position
- **Landing** (dist < 6px): stop animation, position exactly, call `landFromFly()`
- Viewport clamping during targeting

**`pickFlyTarget(excludeEdge, fromSide, forwardMinX, charX, charY)`**:
- Builds options list:
  - All visible platform surfaces (top, left if tall, right if tall, bottom-surface if wide)
  - Viewport bottom (random X)
  - Allowed edges excluding entry side
- Filters backward targets (prevents U-turns)
- **Distance-weighted selection**: weight = `1 / (1 + dist/50)` — nearby targets much more likely

**`_pickClosestPlatformEdge(platform, charX, charY)`**:
- Evaluates candidates: top surface, left/right sides (if tall enough), bottom-surface (if wide enough)
- Returns closest by Euclidean distance

**`landFromFly(target)`**:
- Platform landing: refresh rect, set `currentPlatform`, `attachedToViewport = false`
- Platform edge landing: set appropriate `currentEdge` and position
- Viewport edge landing: set `attachedToViewport = true`
- Bottom landing: set to viewport bottom
- Record `_landedAt` for cooldown
- Resume: edge idle or `setNextAction()`

**Flying phrases**: 50% chance to shout (from FLY_PHRASES) 0.8-2.3s into flight.

#### Cursor Chase (`flyToCursor`)

1. Set action to 'flyToCursor', `isJumping = true`
2. Fly at 350px/s toward live `_mouseX`/`_mouseY` (updated every frame)
3. Dynamic animation switching (jump/falling with hysteresis)
4. On arrival (dist < 20px): `_attachToCursor()`

**`_attachToCursor()`**:
- `isAttachedToCursor = true`
- Show catch phrase (always, from CURSOR_PHRASES)
- Play drag sprite animation
- RAF loop follows cursor with offset (+5px X, +5px Y)
- Auto-detach after 3-5s via `_cursorDetachTimer`

**`_detachFromCursor()`**:
- Clear all cursor timers/RAF
- Hide bubble
- Find nearest surface below → `fallToBottom()`

#### Small Hop (`smallHop`)

- Only on bottom edge, on surface, visible
- Jump animation: parabolic arc (15-25px height, 0.35s duration)
- `positionY = startY - 4 * hopHeight * t * (t - 1)` (quadratic arc)
- Switch to falling frame at peak (t > 0.5)
- 30% chance to show hop phrase
- After: `setNextAction()`

#### Shout (`shout`)

- Only if visible to user
- Show stand frame
- Random encouragement phrase, hold 4-7s
- `onComplete` callback (usually sets `forceWalkAfter`)

#### House Feature

**`summonHouse()`**:
- Pick random edge (left/right/top/bottom), position flush to edge
- Set hidden transform (translateX/Y off-screen) + rotation:
  - Left: 90deg, Right: -90deg, Top: 180deg, Bottom: 0deg
- House always has a rotation applied (but house element itself is an emoji, so rotation = which way the house "faces")
- Force reflow → add `.slide-in` class (CSS transition slides it in over 1.5s)
- After 3-7s delay: `_flyToHouse()`

**`_flyToHouse()`**:
- Fly at `jumpspeed * 1.5` toward house position
- Dynamic animation (jump/falling with hysteresis)
- Interruptible by drag → cancels house and dismisses
- On arrival (dist < 25): `_enterHouse()`

**`_enterHouse()`**:
- `isInHouse = true`, hide sprite (opacity 0), keep bubble visible
- Position bubble near house
- `attachedToViewport = true` (house is fixed)
- Periodic phrases every 3-6s from HOUSE_INSIDE_PHRASES
- Stay duration: 90-150 seconds (1.5-2.5 minutes)
- After stay: `_exitHouse()`

**`_exitHouse()`**:
- Show sprite again, position at house location
- Dismiss house after 1-2s delay
- `fallToBottom()` to nearest surface

**`_dismissHouse()`**:
- Remove `.slide-in` class → CSS transition slides house out
- After 1.7s: set `_houseActive = false`, hide completely

**`_onHouseClick()`**:
- If inside: HOUSE_CLICK_INSIDE_PHRASES (force)
- If outside: HOUSE_CLICK_PHRASES (force)

#### Pet Interaction (`enablePetInteraction`)

Guard: requires 'pet' and 'bottom' in ALLOWANCES.

**mouseenter**:
- Block if: falling, pointer down, already petting, in house
- `canHeadshake` = on bottom edge + not jumping
- **40% headshake** (only if `canHeadshake`):
  - `_petMode = 'headshake'`
  - Start pet animation (shime15-17 at 75ms, continuous loop)
- **60% phrase** (works in ALL states — sideways, upside down, etc.):
  - `_petMode = 'phrase'`
  - 60% from PET_PHRASES, 40% from THINK_PHRASES
  - Duration: 2-3.5s
  - On bubble done: reset petting, resume normal actions

**mouseleave**:
- Block if: falling, pointer down
- If phrase mode: do nothing (phrase persists, timer handles cleanup)
- If headshake mode: 200ms delay, then stop pet animation, `setNextAction()`

#### Drag Interaction (`enableDragInteraction`)

Guard: requires 'drag' and 'bottom' in ALLOWANCES.

**mousedown/touchstart on container**:
1. Block if in house
2. `resetAnimation()`, cancel RAF
3. Set flags: `isDragging = true`, clear jumping/falling/petting/cursor
4. If house flight in progress: cancel and dismiss house
5. 85% chance drag phrase (force — interrupts any bubble)
6. Start drag frame animation (shime5-8 at 210ms)
7. Track grab offset from container rect

**mousemove/touchmove (window)**:
- Update `positionX`/`positionY` from pointer minus offset
- Clamp to viewport bounds

**mouseup/touchend (window)**:
- Stop drag animation
- `hideBubble()`
- `resetAnimation()`
- `fallToBottom()` + restart RAF

#### Platform System

**`scanPlatforms()`**:
- Query `document.querySelectorAll(PLATFORM_SELECTOR)` → `[data-platform]`
- Map to `{ el, left, right, top, bottom, width, height }` from `getBoundingClientRect()`
- Filter: width > 0, height > 0, not `display:none`/`visibility:hidden`/`opacity:0`, not `position:sticky`
- Sort by `top` ascending

**`findSurfaceBelow(centerX, feetY)`**:
- Linear scan through sorted platforms
- First platform where: `top > feetY + 2` AND `top < innerHeight` AND `centerX` within left-right range
- Returns `{ y: platform.top - containerHeight, platform }` or viewport bottom

**`getCurrentPlatform()`**: find platform matching character's feet position within 4px tolerance.

**`isOnSurface()`**: has `currentPlatform` OR position at viewport bottom within 2px.

**`checkPlatformValidity()`**: every 0.5s, check platform element:
- Not connected to DOM → fall
- Zero size → teleport to viewport bottom + fall
- Otherwise: refresh cached bounds, reposition character on correct surface based on `currentEdge`

#### Screen Persistence (Tab Tracking)

**`getActiveTabButtonIndex()`**:
- Find first `position:sticky` platform element (the header)
- Query its buttons, find one with `fontWeight === '600'`
- Return index (or -1)

**hashchange handler** (double-RAF for layout stability):
1. Get old and new screen indices
2. If same or invalid: skip
3. **In house**: update home screen, house moves with viewport
4. **Returning to home screen**: show container, show welcome back phrase (70% chance)
5. **Already off-screen**: skip
6. **Fly cooldown** (< 5s since landing): always stay on old screen, hide container
7. **Viewport-attached, no platform**: always follow user (update home screen)
8. **On platform**: 80% stay / 20% follow
   - Stay: hide container, record `_offScreenSince`
   - Follow: `flyIn()` from direction of old screen

**Off-screen recovery** (in `animate()` loop):
- Check every 5s via `_offScreenTimer`
- Chance: `min(0.60, 0.05 + secondsAway * 0.007)` — starts at 5%, grows to 60% over ~80s
- If triggered: show container, update screen indices, `flyIn()`

#### Indicator Dot (`_updateIndicator`)

Called every animation frame.

**Character visible**: hide dot. If was off-screen for 10s+: 30% "welcome back" phrase.

**Character on different screen**: show dot at midpoint of relevant viewport edge (left or right, based on direction to home screen).

**Character scrolled out of current screen**: show dot clamped to nearest viewport edge, tracking actual character position.

Dot position: `left/top` with 12px inset. 8px circle, offset by -4px for centering.

---

## webmeji-config.js

### window.SPAWNING
```js
[{ id: 'webmeji-0', config: 'SHIMEJI_CONFIG' }]
```
Single creature. `id` becomes the `<img>` element ID.

### window.SHIMEJI_CONFIG

#### Permissions
```js
ALLOWANCES: ['pet', 'drag', 'bottom', 'top', 'left', 'right']
PLATFORM_SELECTOR: '[data-platform]'
```
All interactions enabled. Platform detection targets React app's `data-platform` elements.

#### Speeds
| Property | Value | Unit | Usage |
|----------|-------|------|-------|
| walkspeed | 25 | px/s | Horizontal walk, vertical climb |
| fallspeed | 100 | px/s | Gravity during fallToBottom |
| jumpspeed | 75 | px/s | Edge jumps, platform flights, base for flyIn (×1.5) |
| gettingupspeed | 2000 | ms | Delay before getting up after trip |

#### Animation Configs

| Action | Frames (shime#) | Interval (ms) | Loops | Special |
|--------|-----------------|---------------|-------|---------|
| walk | 1,2,3,2 | 350 | 6 | Main locomotion cycle |
| stand | 1 | 400 | 1 | Idle pose, used during shout |
| sit | 11 | 1000 | 1 | `randomizeDuration: true, min: 3000, max: 11000` |
| spin | 1 | 300 | 3 | Uses standing frame, effect is from sprite flip |
| dance | 5,6,1 | 400 | 5 | Three-frame bounce |
| trip | 20,21,21,20,21,21 | 500 | 1 | Stumble animation, 6 frames |
| forcewalk | (inherits walk frames) | — | 6 | `loops: 6` only, frames/interval from walk |
| forcethink | 27,28 | 500 | 2 | Post-dance pondering |
| pet | 15,16,17 | 75 | continuous | Fast head-shake, no loops limit |
| drag | 5,7,5,6,8,6 | 210 | continuous | Flailing while dragged |
| falling | 4 | 400 | 2 | Spread-eagle fall pose |
| fallen | 19,18 | 500 | 1 | Lying on ground after fall |
| climbSide | 13,14 | 400 | 2 | Climbing up/down walls |
| hangstillSide | 12 | 400 | 2 | `randomizeDuration: true, min: 3000, max: 11000` |
| climbTop | 24,25 | 400 | 6 | Moving along ceiling |
| hangstillTop | 23 | 400 | 2 | `randomizeDuration: true, min: 3000, max: 11000` |
| jump | 22 | 400 | — | Single frame, used during ascent |

#### Action Pools

**ORIGINAL_ACTIONS** (ground behavior, shuffled):
```js
['walk','walk','walk','walk','walk','walk',
 'walk','walk','walk','walk','walk','walk',
 'spin','spin','spin',
 'sit','sit',
 'dance','dance',
 'trip']
```
Walk: 12/19 (63%), Spin: 3/19 (16%), Sit: 2/19 (10.5%), Dance: 2/19 (10.5%), Trip: 1/19 (5.3%)

**EDGE_ACTIONS** (wall/ceiling):
```js
['hang','hang', 'climb','climb','climb','climb', 'fall','fall']
```
Hang: 2/8 (25%), Climb: 4/8 (50%), Fall: 2/8 (25%)

**JUMP_CHANCE**: 0.05 (5% per action cycle)

---

## webmeji-shouts.js

`window.SHIMEJI_SHOUTS` — 12 phrase arrays. All bilingual (English + Russian).

| Key | ~Count | Used By | Trigger Probability |
|-----|--------|---------|-------------------|
| `encouragement` | 50 | `shout()` | 14% per action cycle, visible+bottom |
| `flying` | 40 | `flyIn()` | 50% during flight, 0.8-2.3s in |
| `thinking` | 40 | `startAction('sit')`, pet phrase | 40% while sitting; 40% of pet phrase reactions |
| `dragging` | 40 | `startDrag()` | 85% on drag start (force) |
| `tired` | 30 | `resumeAfterFallen()` | 35% when getting up |
| `fallen` | 20 | `playTripAfterFall()` | 90% on landing from height |
| `cursorCatch` | 30 | `_attachToCursor()` | 100% on cursor attach |
| `hop` | 25 | `smallHop()` | 30% on hop |
| `houseInside` | 30 | `_enterHouse()` | Periodic every 3-6s while inside |
| `houseClick` | 14 | `_onHouseClick()` | 100% when clicking house (char outside) |
| `houseClickInside` | 16 | `_onHouseClick()` | 100% when clicking house (char inside) |
| `petReaction` | 14 | `enablePetInteraction()` | 60% of phrase pet reactions |
| `welcomeBack` | 30 | `_showWelcomeBack()`, `_updateIndicator()` | 70% on tab return; 30% after 10s+ off-screen |

Phrase durations vary: encouragement 4-7s, flying 3-5s, thinking 3.5-6s, dragging 3-5.5s, tired 3.5-5.5s, fallen 3-4.5s, cursor 3.5-5.5s, hop 2s, house inside 3.5-5.5s, house click 2.5-3.5s, pet 2-3.5s, welcome back 3-4.5s.

---

## webmeji.css

### Container
```css
.webmeji-container {
  position: fixed; bottom: 0;
  width: 60px; height: 60px;
  overflow: visible;           /* bubble and house extend beyond */
  z-index: 9999;
}
.webmeji-container img {
  width: 100%; height: auto;
  user-select: none; pointer-events: none;  /* clicks pass through to container */
  display: block; transform-origin: center;  /* for scaleX flip */
}
```

### Speech Bubble
```css
.webmeji-bubble {
  position: absolute; bottom: 100%; left: 50%;
  transform: translateX(-50%);
  background: #E6EDF3; color: #0D1117;
  font: 600 10px/1.3 'IBM Plex Sans', system-ui, sans-serif;
  padding: 4px 8px; border-radius: 8px;
  white-space: nowrap; pointer-events: none;
  opacity: 0; transition: opacity 0.3s;
  margin-bottom: 4px;
}
.webmeji-bubble::after {           /* triangle pointer */
  content: ''; position: absolute;
  top: 100%; left: 50%; transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: #E6EDF3;
}
.webmeji-bubble.visible { opacity: 1; }
```

### House
```css
.webmeji-house {
  position: fixed; font-size: 55px; line-height: 1;
  z-index: 9998;                  /* below character */
  pointer-events: auto; cursor: pointer;
  user-select: none; opacity: 0;
  transition: transform 1.5s ease-in-out;
}
.webmeji-house.slide-in {
  opacity: 1;
  transform: none !important;     /* overrides hidden translateX/Y */
}
```

### Indicator Dot
```css
.webmeji-indicator {
  position: fixed; width: 8px; height: 8px;
  border-radius: 50%; background: #ff8c00;
  box-shadow: 0 0 6px 2px rgba(255,140,0,0.6);
  z-index: 9999; pointer-events: none;
  opacity: 0; transition: opacity 0.3s;
}
.webmeji-indicator.visible { opacity: 1; }
```

### Responsive (≤768px)
```css
.webmeji-container { width: 48px; height: 48px; }
.webmeji-house { font-size: 42px; }
```

---

## Complete Probability Reference

| Event | Probability | Conditions | Location in webmeji.js |
|-------|-------------|------------|----------------------|
| Spawn on platform | 40% | Visible platforms exist | Constructor, roll < 0.4 |
| Spawn on viewport bottom | 35% | — | Constructor, roll < 0.75 |
| Spawn on random edge | 25% | Edge in ALLOWANCES | Constructor, else |
| Jump to edge | 5% | On surface, no cooldown, JUMP_CHANCE | `setNextAction()` |
| Fly to platform | 16% | On surface, no cooldown, candidates exist | `setNextAction()` |
| Fly to cursor | 7% | Bottom, cursor known, visible, no cooldown | `setNextAction()` |
| Summon house | 3% | Bottom, visible, no cooldown, house not active | `setNextAction()` |
| Small hop | 5% | Bottom, on surface, visible | `setNextAction()` |
| Shout encouragement | 14% | Bottom, visible | `setNextAction()` |
| Thought bubble while sitting | 40% | Visible | `startAction('sit')` |
| Drag phrase | 85% | On drag start | `startDrag()` |
| Fall phrase (ouch) | 90% | After high fall | `playTripAfterFall()` |
| Tired phrase | 35% | Getting up after fall | `resumeAfterFallen()` |
| Flying phrase | 50% | During flyIn | `flyIn()` |
| Hop phrase | 30% | During small hop | `smallHop()` |
| Cursor catch phrase | 100% | On cursor attach | `_attachToCursor()` |
| Pet headshake | 40% | mouseenter, bottom edge, not jumping | `enablePetInteraction()` |
| Pet phrase | 60% | mouseenter, any state | `enablePetInteraction()` |
| Pet phrase from PET pool | 60% | Within phrase pet reaction | `enablePetInteraction()` |
| Pet phrase from THINK pool | 40% | Within phrase pet reaction | `enablePetInteraction()` |
| Edge grab during flyIn | 15% | < 200px from platform, after 0.5s | `flyIn()` |
| Wall crash during flyIn | 10% | Once per flyIn | `flyIn()` |
| Wall crash: stick | 50% | After wall crash | `flyIn()` |
| Wall crash: fall | 50% | After wall crash | `flyIn()` |
| Edge grab during fall | 10% | Per frame, near platform side | `fallToBottom()` |
| Platform edge → side transition | 25% | Walking on platform, hitting edge | `animate()` |
| Platform underside → side transition | 40% | climbTop on platform, hitting edge | `animate()` |
| Platform climb down → underside | 60% | climbSide at bottom of platform | `animate()` |
| Platform climb down → fall off | 40% | climbSide at bottom of platform | `animate()` |
| Tab change: stay on old screen | 80% | On platform, no cooldown | hashchange handler |
| Tab change: follow to new screen | 20% | On platform, no cooldown | hashchange handler |
| Come back (off-screen) | 5%→60% | Checked every 5s, grows by +0.7%/s | `animate()` |
| Welcome back phrase (tab return) | 70% | Returning to character's screen | `_showWelcomeBack()` |
| Welcome back phrase (scroll/visibility) | 30% | After 10s+ off-screen | `_updateIndicator()` |
| House stay duration | — | 90-150s (1.5-2.5 min) | `_enterHouse()` |
| House delay before flight | — | 3-7s | `summonHouse()` |
| Cursor cling duration | — | 3-5s | `_attachToCursor()` |
