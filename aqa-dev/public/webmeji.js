// ✰ webmeji ✰
// little creatures that walk around your website =w=b
// inspired by shimeji, put together by Lars de Rooij
// not affiliated with any other shimeji projects
// last updated: 27 january 2026
// homepage: webmeji.neocities.org

// this is likely very unoptimized and quite messy code, i apologize for that. plain info on each function is at the bottom of the readme
// this project was made with the intention that changing anything in the config.js would be easy. this is not that. modifying this comes at your own risk.

window.addEventListener('DOMContentLoaded', () => {
  // collect unique config names from SPAWNING
  const configNames = [...new Set(
    window.SPAWNING.map(spawn => spawn.config)
  )];

  // resolve them to actual config objects on window
  const configs = configNames
    .map(name => window[name])
    .filter(Boolean);

  // preload all images
  Promise.all(configs.map(preloadImages))
    .then(() => {
      console.log("all images are loaded!");

      const creatures = [];
      window.SPAWNING.forEach(({ id, config }) => {
        const cfg = window[config];
        if (!cfg) {
          console.warn(`config not found: ${config}`);
          return;
        }
        creatures.push(new Creature(id, cfg));
      });
    })
    .catch(error => {
      console.error("error loading images:", error);
    });
});


// preloads all frames from a given configuration
function preloadImages(config) {
  // collect all frames from every action in the config
  const imagePaths = Object.values(config)
    .flatMap(item => (item.frames && Array.isArray(item.frames)) ? item.frames : []);

  // return a promise that resolves when all images are loaded
  return Promise.all(imagePaths.map(src => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = resolve;  // resolve when image loads
    img.onerror = reject;  // reject if error occurs
    img.src = src;
  })));
}

// creature class -------------------------------------------------------
class Creature {
  constructor(containerId, spriteConfig) {
    this.currentEdge = 'bottom';

    // create div to hold the sprite image
    this.container = document.createElement('div');
    this.container.className = 'webmeji-container';
    document.body.appendChild(this.container);

    // create img wrapper to keep overflow:hidden for sprite only
    this.imgWrap = document.createElement('div');
    this.imgWrap.style.cssText = 'width:100%;height:100%;overflow:hidden;position:relative';
    this.container.appendChild(this.imgWrap);

    // create img element for first frame of sprite
    this.img = document.createElement('img');
    this.img.id = containerId;
    this.img.src = spriteConfig.walk.frames[0];
    this.imgWrap.appendChild(this.img);

    // speech bubble
    this.bubble = document.createElement('div');
    this.bubble.className = 'webmeji-bubble';
    this.container.appendChild(this.bubble);

    // phrase arrays from external config (webmeji-shouts.js)
    const S = window.SHIMEJI_SHOUTS || {};
    this.SHOUT_PHRASES = S.encouragement || [];
    this.FLY_PHRASES = S.flying || [];
    this.THINK_PHRASES = S.thinking || [];
    this.DRAG_PHRASES = S.dragging || [];
    this.TIRED_PHRASES = S.tired || [];
    this.FALLEN_PHRASES = S.fallen || ['Ouch!'];
    this.CURSOR_PHRASES = S.cursorCatch || [];
    this.HOP_PHRASES = S.hop || [];
    this.HOUSE_INSIDE_PHRASES = S.houseInside || [];
    this.HOUSE_CLICK_PHRASES = S.houseClick || [];
    this.HOUSE_CLICK_INSIDE_PHRASES = S.houseClickInside || [];
    this.PET_PHRASES = S.petReaction || [];
    this.WELCOME_BACK_PHRASES = S.welcomeBack || [];

    // store sprite configuration & randomize action sequence
    this.spriteConfig = spriteConfig;
    this.actionSequence = this.shuffle([...this.spriteConfig.ORIGINAL_ACTIONS]);
    this.currentActionIndex = 0;
    this.currentAction = null;
    this.frameTimer = null;          // interval for frame updates
    this.dragFrameTimer = null;      // interval for drag animation
    this.actionCompletionTimer = null; // timer for completing actions
    this.currentFrame = 0;
    this.direction = 1;              // movement direction, 1 = right, -1 = left
    this.facing = 'left';            // visual facing direction of base sprites

    // starting states
    this.isDragging = false;
    this.isFalling = false;
    this.isPetting = false;
    this.isJumping = false;
    this.tripAfterFallActive = false;
    this.wasActionBeforePet = null; 

    // pointer / drag detection
    this.isPointerDown = false;
    window.addEventListener('mousedown', () => { this.isPointerDown = true; });
    window.addEventListener('mouseup', () => { this.isPointerDown = false; });
    window.addEventListener('touchstart', () => { this.isPointerDown = true; }, { passive: true });
    window.addEventListener('touchend', () => { this.isPointerDown = false; });

    // get container size
    const containerStyle = window.getComputedStyle(this.container);
    this.containerWidth = parseFloat(containerStyle.width);
    this.containerHeight = parseFloat(containerStyle.height);

    this.maxPos = window.innerWidth - this.containerWidth;
    this.forceWalkAfter = false;
    this.forceThinkAfter = false;

    // platform detection
    this.platforms = [];
    this.currentPlatform = null;
    this._flyInToken = 0;

    // cursor tracking (for cursor attachment feature)
    this._mouseX = -1;
    this._mouseY = -1;
    this.isAttachedToCursor = false;
    window.addEventListener('mousemove', (e) => {
      this._mouseX = e.clientX;
      this._mouseY = e.clientY;
    }, { passive: true });

    // house feature
    this.house = document.createElement('div');
    this.house.className = 'webmeji-house';
    this.house.textContent = '\u{1F3E0}';
    document.body.appendChild(this.house);
    this.isInHouse = false;
    this._houseActive = false;
    this._houseEdge = null;
    this._houseX = 0;
    this._houseY = 0;
    this.house.addEventListener('click', () => this._onHouseClick());

    // indicator dot (shows character position when off-screen)
    this._indicator = document.createElement('div');
    this._indicator.className = 'webmeji-indicator';
    document.body.appendChild(this._indicator);
    this._indicatorVisible = false;
    this._lastVisibleTime = performance.now();
    this._wasOffScreen = false;

    // screen persistence state
    this._homeScreenIdx = -1; // set after spawn
    this._isOnCurrentScreen = true;
    this._currentScreenIdx = -1; // set after spawn

    // hide before delayed spawn
    this.positionX = -200;
    this.positionY = -200;
    this.container.style.left = '-200px';
    this.container.style.top = '-200px';
    this.container.style.opacity = '0';
    this.container.style.pointerEvents = 'none';

    this.updateImageDirection();
    this.animate = this.animate.bind(this);

    // delayed spawn: appear after 1 second, decide where
    setTimeout(() => {
      this.scanPlatforms();
      const visible = this.platforms.filter(p =>
        p.top >= this.containerHeight && p.top < window.innerHeight
      );

      // recalc maxPos in case viewport changed since constructor
      this.maxPos = window.innerWidth - this.containerWidth;

      const roll = Math.random();
      if (visible.length && roll < 0.4) {
        // spawn on a visible platform
        const p = visible[Math.floor(Math.random() * visible.length)];
        const landX = p.left + Math.random() * Math.max(0, p.width - this.containerWidth);
        this.positionX = Math.max(p.left, Math.min(landX, p.right - this.containerWidth));
        this.positionY = p.top - this.containerHeight;
        this.currentPlatform = p;
        this.currentEdge = 'bottom';
        this.attachedToViewport = false;
      } else if (roll < 0.75) {
        // spawn on viewport bottom
        this.positionX = Math.random() * Math.max(0, this.maxPos);
        this.positionY = window.innerHeight - this.containerHeight;
        this.currentEdge = 'bottom';
        this.attachedToViewport = true;
      } else {
        // spawn on a random allowed edge
        const edges = ['top', 'left', 'right'].filter(e => this.spriteConfig.ALLOWANCES.includes(e));
        const edge = edges.length ? edges[Math.floor(Math.random() * edges.length)] : 'bottom';
        if (edge === 'top') {
          this.positionX = Math.random() * Math.max(0, this.maxPos);
          this.positionY = 0;
        } else if (edge === 'left') {
          this.positionX = 0;
          this.positionY = Math.random() * Math.max(0, window.innerHeight - this.containerHeight);
        } else if (edge === 'right') {
          this.positionX = Math.max(0, this.maxPos);
          this.positionY = Math.random() * Math.max(0, window.innerHeight - this.containerHeight);
        } else {
          this.positionX = Math.random() * Math.max(0, this.maxPos);
          this.positionY = window.innerHeight - this.containerHeight;
          this.currentEdge = 'bottom';
        }
        if (edge !== 'bottom') this.currentEdge = edge;
        this.attachedToViewport = true;
      }
      // clamp to viewport bounds
      this.positionX = Math.max(0, Math.min(this.positionX, Math.max(0, this.maxPos)));
      this.positionY = Math.max(0, Math.min(this.positionY, window.innerHeight - this.containerHeight));

      // clamp to viewport to prevent spawning partially off-screen
      this.positionX = Math.max(0, Math.min(this.positionX, this.maxPos));
      this.positionY = Math.max(0, Math.min(this.positionY, window.innerHeight - this.containerHeight));

      this.container.style.left = `${this.positionX}px`;
      this.container.style.top = `${this.positionY}px`;
      this.container.style.opacity = '1';
      this.container.style.pointerEvents = '';

      this.updateEdgeClass();
      this.lastScrollY = window.scrollY;

      if (['top', 'left', 'right'].includes(this.currentEdge)) {
        // start climbing immediately on edge spawn (no idle wait)
        this.startAction(this.currentEdge === 'top' ? 'climbTop' : 'climbSide');
      } else {
        this.currentAction = this.actionSequence[this.currentActionIndex];
        this.startAction(this.currentAction);
      }
      this.lastTime = performance.now();
      this.animationFrameId = requestAnimationFrame(this.animate);

      // init screen tracking after spawn
      this._homeScreenIdx = this.getActiveTabButtonIndex();
      this._currentScreenIdx = this._homeScreenIdx;
      this._isOnCurrentScreen = true;
    }, 1000);

    // handle window resize to adjust max positions
    this.resizeHandler = () => {
      const style = window.getComputedStyle(this.container);
      this.containerWidth = parseFloat(style.width);
      this.containerHeight = parseFloat(style.height);
      this.maxPos = window.innerWidth - this.containerWidth;
      this.positionX = Math.min(this.positionX, this.maxPos);
      this.container.style.left = `${this.positionX}px`;
    };
    window.addEventListener('resize', this.resizeHandler);

    // platform tracking: periodic scan
    this.scanPlatforms();
    this.platformScanTimer = setInterval(() => this.scanPlatforms(), 500);

    // scroll behavior: follow content when on platforms, follow viewport on bottom/edges
    this.attachedToViewport = true;
    this.lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
      const delta = window.scrollY - this.lastScrollY;
      this.lastScrollY = window.scrollY;
      if (!this.attachedToViewport && !this.isDragging && !this.isJumping && !this.isInHouse &&
          (!this.isFalling || this.tripAfterFallActive)) {
        this.positionY -= delta;
        this.applyEdgeOffset();
        if (this.currentPlatform && this.currentPlatform.el) {
          const r = this.currentPlatform.el.getBoundingClientRect();
          this.currentPlatform = { el: this.currentPlatform.el, left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
        }
      }
    }, { passive: true });

    // tab change: sometimes follow, sometimes stay on old screen
    window.addEventListener('hashchange', () => {
      const oldScreenIdx = this._currentScreenIdx;
      requestAnimationFrame(() => { requestAnimationFrame(() => {
        const newScreenIdx = this.getActiveTabButtonIndex();
        if (oldScreenIdx === -1 || newScreenIdx === -1 || oldScreenIdx === newScreenIdx) return;
        this._currentScreenIdx = newScreenIdx;

        // in house — stay put, house is viewport-attached
        if (this.isInHouse || this._houseActive) {
          this._homeScreenIdx = newScreenIdx; // house moves with viewport, update screen
          return;
        }

        // returning to character's home screen?
        if (this._homeScreenIdx === newScreenIdx) {
          if (!this._isOnCurrentScreen) {
            this._isOnCurrentScreen = true;
            this.container.style.display = '';
            this._showWelcomeBack();
          }
          return;
        }

        // character is already on a different screen (not here), just update dot
        if (!this._isOnCurrentScreen) return;

        // character is on current screen, we're leaving it
        // cooldown: don't fly immediately after landing
        const flyCd = performance.now() - (this._landedAt || 0) < 5000;

        // attached to viewport (screen edge) — ALWAYS stay, viewport moves with user
        if (this.attachedToViewport && !this.currentPlatform) {
          this._homeScreenIdx = newScreenIdx; // viewport follows user
          return;
        }

        const canStay = this.currentPlatform;

        if (!canStay && !flyCd) {
          // floating/unknown state — follow to new screen
          this._homeScreenIdx = newScreenIdx;
          this._isOnCurrentScreen = true;
          this.flyIn(oldScreenIdx < newScreenIdx ? 'left' : 'right');
          return;
        }

        if (flyCd) {
          // just landed — always stay, don't fly again
          this._isOnCurrentScreen = false;
          this._offScreenSince = performance.now();
          this._offScreenTimer = 0;
          this.container.style.display = 'none';
          return;
        }

        // 80% stay, 20% follow
        if (Math.random() < 0.80) {
          // stay on old screen
          this._isOnCurrentScreen = false;
          this._offScreenSince = performance.now();
          this._offScreenTimer = 0;
          this.container.style.display = 'none';
          // dot will appear via _updateIndicator
        } else {
          this._homeScreenIdx = newScreenIdx;
          this._isOnCurrentScreen = true;
          this.flyIn(oldScreenIdx < newScreenIdx ? 'left' : 'right');
        }
      }); });
    });

    // enable mouse hover and drag interactions
    this.enablePetInteraction();
    this.enableDragInteraction();
  }

  // shuffle array for random action order
  shuffle(array) {
    for (let i=array.length-1; i>0; i--){
        const j = Math.floor(Math.random()*(i+1));
        [array[i],array[j]] = [array[j],array[i]]; // swap elements
    }
    return array;
  }

  // flip sprite horizontally depending on facing
  updateImageDirection() {
    this.img.style.transform = this.facing === 'left' ? 'scaleX(1)' : 'scaleX(-1)';
  }

  // update facing from horizontal delta (dx)
  setFacingFromDelta(dx) {
    if (dx && !this.isDragging) {
        this.facing = dx < 0 ? 'left' : 'right';
        this.updateImageDirection();
    }
  }

  // centralized bubble display — prevents race conditions and empty bubbles
  showBubble(text, duration, onDone, force = false) {
    // phrase lock: don't interrupt an active bubble unless forced
    if (!force && this._bubbleUntil && performance.now() < this._bubbleUntil) {
      onDone?.();
      return;
    }
    clearTimeout(this._bubbleTimer);
    clearTimeout(this._bubbleHideTimer);
    this._bubbleUntil = performance.now() + duration;
    this.bubble.textContent = text;
    this.bubble.offsetWidth; // force reflow for CSS transition
    this.bubble.classList.add('visible');
    this._bubbleTimer = setTimeout(() => {
      this.bubble.classList.remove('visible');
      this._bubbleUntil = 0;
      this._bubbleHideTimer = setTimeout(() => {
        this.bubble.textContent = '';
        onDone?.();
      }, 350);
    }, duration);
  }

  hideBubble() {
    clearTimeout(this._bubbleTimer);
    clearTimeout(this._bubbleHideTimer);
    this._bubbleTimer = null;
    this._bubbleHideTimer = null;
    this._bubbleUntil = 0;
    this.bubble.classList.remove('visible');
    this.bubble.textContent = '';
  }

  // stop current animation timers
  resetAnimation() {
    clearInterval(this.frameTimer);
    clearTimeout(this.actionCompletionTimer);
    if (this._tripFrameTimer) { clearInterval(this._tripFrameTimer); this._tripFrameTimer = null; }
    if (this._flyToCursorTimer) { clearInterval(this._flyToCursorTimer); this._flyToCursorTimer = null; }
    if (this._cursorFrameTimer) { clearInterval(this._cursorFrameTimer); this._cursorFrameTimer = null; }
    if (this._cursorFollowRAF) { cancelAnimationFrame(this._cursorFollowRAF); this._cursorFollowRAF = null; }
    if (this._cursorDetachTimer) { clearTimeout(this._cursorDetachTimer); this._cursorDetachTimer = null; }
    if (this._houseFlightTimer) { clearInterval(this._houseFlightTimer); this._houseFlightTimer = null; }
    this.hideBubble();
    this.currentFrame = 0;
    this.frameTimer = null;
    this.actionCompletionTimer = null;
  }

  // cancel all timers and animation frames
  clearAllTimers() {
    this.resetAnimation();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  // check if edge is left/right
  isSideEdge(edge) { return edge === 'left' || edge === 'right'; }
  // check if edge is anything except bottom
  isNonBottomEdge(edge) { return edge !== 'bottom'; }

  // update container class for current edge
  updateEdgeClass() {
      this.container.classList.remove('edge-left','edge-right','edge-top');
      if (!this.isDragging) {
          this.currentEdge === 'left' && this.container.classList.add('edge-left');
          this.currentEdge === 'right' && this.container.classList.add('edge-right');
          this.currentEdge === 'top' && this.container.classList.add('edge-top');
      }
      this.applyEdgeOffset(); // adjust position based on edge
  }

  // apply offsets when at edge to align sprite properly
  applyEdgeOffset() {
      if (this.isDragging) return this.container.style.cssText = `left:${this.positionX}px;top:${this.positionY}px`;

      const offsetX = this.currentEdge === 'left' ? -this.containerWidth/2 :
                      this.currentEdge === 'right' ? this.containerWidth/2 : 0;
      const offsetY = this.currentEdge === 'top' ? -this.containerHeight/4 : 0;

      this.container.style.left = `${(this.positionX||0)+offsetX}px`;
      this.container.style.top  = `${(this.positionY||0)+offsetY}px`;
  }

  // jump to another edge (top, left, right)
  jumpToEdge(targetEdge) {
    if (this.isFalling || this.isPetting || this.isDragging || this.isJumping) return; // ignore if busy
    if (!this.spriteConfig.ALLOWANCES.includes(targetEdge)) return; // edge not allowed

    this.isJumping = true;
    this.attachedToViewport = true;
    this.resetAnimation();

    const jumpConfig = this.spriteConfig.jump;
    if (!jumpConfig) { this.isJumping = false; return; }

    const startX = this.positionX;
    const startY = this.positionY;
    let endX = startX;
    let endY = startY;

    switch (targetEdge) {
      case 'top':
        endY = 0;
        endX = Math.random() * (window.innerWidth - this.containerWidth);
        break;
      case 'left':
        endX = 0;
        endY = Math.random() * (window.innerHeight - this.containerHeight);
        break;
      case 'right':
        endX = window.innerWidth - this.containerWidth;
        endY = Math.random() * (window.innerHeight - this.containerHeight);
        break;
    }

    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.hypot(dx, dy); // calculate distance for speed

    if (distance === 0) { this.isJumping = false; return; }

    const duration = distance / this.spriteConfig.jumpspeed; // time to reach
    const startTime = performance.now();

    // setup frame animation for jump
    let frameIndex = 0;
    const totalFrames = jumpConfig.frames.length;
    this.img.src = jumpConfig.frames[frameIndex];

    const frameTimer = setInterval(() => {
      frameIndex = (frameIndex + 1) % totalFrames;
      this.img.src = jumpConfig.frames[frameIndex];
    }, jumpConfig.interval);

    const step = (time) => {
      if (this.isDragging) {
        clearInterval(frameTimer);
        this.isJumping = false;
        return;
      }

      const elapsed = (time - startTime) / 1000;
      const t = Math.min(elapsed / duration, 1);

      this.positionX = startX + dx * t;
      this.positionY = startY + dy * t;

      if (dx !== 0) this.setFacingFromDelta(dx);

      this.container.style.left = `${this.positionX}px`;
      this.container.style.top = `${this.positionY}px`;

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        clearInterval(frameTimer);
        this.isJumping = false;
        this.currentEdge = targetEdge;
        this.updateEdgeClass();
        this.startEdgeIdle();
      }
    };
    requestAnimationFrame(step);
  }

  // fly to a target platform (uses falling animation, can go up or down)
  flyToPlatform(target, targetEdge) {
    if (this.isFalling || this.isPetting || this.isDragging || this.isJumping) return;

    this.isJumping = true;
    this.currentPlatform = null;
    this.attachedToViewport = false;
    this.clearAllTimers(); // must cancel animate() loop to prevent duplicates

    const scrollYAtStart = window.scrollY;

    const startX = this.positionX;
    const startY = this.positionY;
    let endX, endY;

    if (targetEdge === 'left') {
      endX = target.left;
      endY = target.top + Math.random() * Math.max(0, target.height - this.containerHeight);
    } else if (targetEdge === 'right') {
      endX = target.right - this.containerWidth;
      endY = target.top + Math.random() * Math.max(0, target.height - this.containerHeight);
    } else if (targetEdge === 'bottom-surface') {
      endX = target.left + Math.random() * Math.max(0, target.width - this.containerWidth);
      endY = target.bottom;
    } else {
      // top surface (default)
      const landX = target.left + Math.random() * Math.max(0, target.width - this.containerWidth);
      endX = Math.max(target.left, Math.min(landX, target.right - this.containerWidth));
      endY = target.top - this.containerHeight;
    }

    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.hypot(dx, dy);
    if (distance === 0) { this.isJumping = false; return; }

    // direction-based animation: going up = jump, going down = falling
    const goingUp = dy < 0;
    const cfg = goingUp ? (this.spriteConfig.jump || this.spriteConfig.falling) : this.spriteConfig.falling;
    if (!cfg) { this.isJumping = false; return; }

    const duration = distance / this.spriteConfig.jumpspeed;
    const startTime = performance.now();

    let frameIndex = 0;
    this.img.src = cfg.frames[0];
    const frameTimer = setInterval(() => {
      frameIndex = (frameIndex + 1) % cfg.frames.length;
      this.img.src = cfg.frames[frameIndex];
    }, cfg.interval);

    if (dx !== 0) this.setFacingFromDelta(dx);

    const step = (time) => {
      if (this.isDragging) {
        clearInterval(frameTimer);
        this.isJumping = false;
        return;
      }

      const elapsed = (time - startTime) / 1000;
      const t = Math.min(elapsed / duration, 1);
      const scrollDelta = window.scrollY - scrollYAtStart;

      this.positionX = startX + dx * t;
      this.positionY = (startY + dy * t) - scrollDelta;

      // clamp to page bounds
      const pageY = this.positionY + window.scrollY;
      const maxPageY = document.documentElement.scrollHeight - this.containerHeight;
      if (pageY < 0) this.positionY = -window.scrollY;
      else if (pageY > maxPageY) this.positionY = maxPageY - window.scrollY;

      this.container.style.left = `${this.positionX}px`;
      this.container.style.top = `${this.positionY}px`;

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        clearInterval(frameTimer);
        this.isJumping = false;
        // refresh platform position from DOM on landing
        const r = target.el.getBoundingClientRect();
        const p = { el: target.el, left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
        this.currentPlatform = p;
        this.attachedToViewport = false;
        this.lastScrollY = window.scrollY;

        if (targetEdge === 'left') {
          this.currentEdge = 'left';
          this.positionX = r.left;
          this.positionY = Math.max(r.top, Math.min(this.positionY, r.bottom - this.containerHeight));
        } else if (targetEdge === 'right') {
          this.currentEdge = 'right';
          this.positionX = r.right - this.containerWidth;
          this.positionY = Math.max(r.top, Math.min(this.positionY, r.bottom - this.containerHeight));
        } else if (targetEdge === 'bottom-surface') {
          this.currentEdge = 'top';
          this.positionY = r.bottom;
          this.positionX = Math.max(r.left, Math.min(this.positionX, r.right - this.containerWidth));
        } else {
          this.currentEdge = 'bottom';
          this.positionY = Math.max(0, r.top - this.containerHeight);
        }

        this.container.style.left = `${this.positionX}px`;
        this.container.style.top = `${this.positionY}px`;
        this.updateEdgeClass();
        this.resetAnimation();
        if (this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
          this.animationFrameId = null;
        }
        this.lastTime = performance.now();

        if (this.currentEdge !== 'bottom') {
          this.startEdgeIdle();
        } else {
          this.setNextAction();
        }
        this.animationFrameId = requestAnimationFrame(this.animate);
      }
    };
    requestAnimationFrame(step);
  }

  // start idle animation on edge
  startEdgeIdle() {
    this.updateEdgeClass();
    if (this.currentEdge === 'top') this.startAction('hangstillTop');
    else if (this.isSideEdge(this.currentEdge)) this.startAction('hangstillSide');
  }

  // pick random edge action: hang, climb, fall
  edgeAction() {
    if(this.isJumping||this.isFalling) return;
    const choice=this.spriteConfig.EDGE_ACTIONS[Math.floor(Math.random()*this.spriteConfig.EDGE_ACTIONS.length)];
    choice==='hang'?this.startEdgeIdle():
    choice==='climb'?this.startAction(this.currentEdge==='top'?'climbTop':'climbSide'):
    choice==='fall'&&this.fallToBottom();
  }

  // platform edge action: when on a side/bottom of a platform element
  platformEdgeAction() {
    if (this.isJumping || this.isFalling) return;
    const choices = ['hang','hang','climb','climb','climb','climb','fall','fall'];
    const choice = choices[Math.floor(Math.random() * choices.length)];
    if (choice === 'hang') this.startEdgeIdle();
    else if (choice === 'climb') {
      this.startAction(this.currentEdge === 'top' ? 'climbTop' : 'climbSide');
    }
    else if (choice === 'fall') this.detachFromPlatformEdge();
  }

  // detach from platform side/bottom and fall
  detachFromPlatformEdge() {
    this.currentEdge = 'bottom';
    this.updateEdgeClass();
    this.currentPlatform = null;
    this.fallToBottom();
  }

  // transition to a different surface of the current platform
  transitionToPlatformEdge(edge) {
    if (!this.currentPlatform) return;
    const p = this.currentPlatform;
    const PLAT_OFFSET = 8;

    this.resetAnimation();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (edge === 'left') {
      this.currentEdge = 'left';
      this.positionX = p.left;
      this.positionY = Math.max(p.top, Math.min(this.positionY, p.bottom - this.containerHeight));
    } else if (edge === 'right') {
      this.currentEdge = 'right';
      this.positionX = p.right - this.containerWidth;
      this.positionY = Math.max(p.top, Math.min(this.positionY, p.bottom - this.containerHeight));
    } else if (edge === 'bottom-surface') {
      this.currentEdge = 'top';
      this.positionY = p.bottom;
      this.positionX = Math.max(p.left + PLAT_OFFSET, Math.min(this.positionX, p.right - this.containerWidth - PLAT_OFFSET));
    } else if (edge === 'top-surface') {
      this.currentEdge = 'bottom';
      this.positionY = p.top - this.containerHeight;
      this.positionX = Math.max(p.left + PLAT_OFFSET, Math.min(this.positionX, p.right - this.containerWidth - PLAT_OFFSET));
    }

    this.attachedToViewport = false;
    this.updateEdgeClass();
    this.lastTime = performance.now();
    this.lastScrollY = window.scrollY;

    if (this.currentEdge === 'bottom') {
      this.setNextAction();
    } else {
      this.startEdgeIdle();
    }
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  // user interactions ---------------------------------------------------
  // petting animation when hovering
  enablePetInteraction() {
    if(!this.spriteConfig.ALLOWANCES?.includes('pet') || !this.spriteConfig.ALLOWANCES?.includes('bottom')) return;

    this.container.addEventListener('mouseenter',()=> {
        // block while in house, falling, or already petting
        if(this.isFalling||this.isPointerDown||this.isPetting||this.isInHouse) return;

        // headshake only when standing on bottom surface and not jumping
        const canHeadshake = this.currentEdge === 'bottom' && !this.isJumping;
        if (canHeadshake && Math.random() < 0.4) {
          // 40% chance: head-shake pet animation
          this.isPetting=true;
          this._petMode = 'headshake';
          this.wasActionBeforePet=this.currentAction;
          this.startPetAnimation();
        } else {
          // phrase reaction — works in ALL states (sideways, upside down, flying)
          this.isPetting=true;
          this._petMode = 'phrase';
          this.wasActionBeforePet=this.currentAction;
          const pool = Math.random() < 0.6 ? this.PET_PHRASES : this.THINK_PHRASES;
          const duration = 2000 + Math.random() * 1500;
          if (pool.length) {
            const phrase = pool[Math.floor(Math.random() * pool.length)];
            this.showBubble(phrase, duration, () => {
              // phrase finished — resume normal actions
              if (this._petMode === 'phrase') {
                this.isPetting = false;
                this._petMode = null;
                this.currentAction = this.wasActionBeforePet || 'sit';
                this.wasActionBeforePet = null;
                if (this.currentEdge === 'bottom' && !this.isJumping && !this.isFalling) {
                  this.setNextAction();
                }
              }
            });
          }
        }
    });
    this.container.addEventListener('mouseleave',()=> {
        if(this.isFalling||this.isPointerDown) return;
        if (this._petMode === 'phrase') {
          // phrase persists — don't stop, let the bubble timer handle cleanup
          return;
        }
        // head-shake: stop with small delay
        setTimeout(() => {
          if (this._petMode !== 'headshake') return; // already changed
          this.isPetting=false;
          this._petMode = null;
          this.stopPetAnimation();
        }, 200);
    });
  }

  // dragging animation and pointer tracking
  enableDragInteraction() {
    if (!this.spriteConfig.ALLOWANCES?.includes('drag')) return;
    if (!this.spriteConfig.ALLOWANCES?.includes('bottom')) return;

    let offsetX = 0;
    let offsetY = 0;

    const onPointerMove = (e) => {
        e.preventDefault();
        
        let clientX = e.clientX ?? e.touches?.[0].clientX;
        let clientY = e.clientY ?? e.touches?.[0].clientY;

        this.positionX = clientX - offsetX;
        this.positionY = clientY - offsetY;

        // clamp position to window
        this.positionX = Math.max(0, Math.min(this.positionX, window.innerWidth - this.containerWidth));
        this.positionY = Math.max(0, Math.min(this.positionY, window.innerHeight - this.containerHeight));

        this.container.style.left = this.positionX + 'px';
        this.container.style.top  = this.positionY + 'px';
    };

    const onPointerUp = () => {
        window.removeEventListener('mousemove', onPointerMove);
        window.removeEventListener('touchmove', onPointerMove);
        window.removeEventListener('mouseup', onPointerUp);
        window.removeEventListener('touchend', onPointerUp);

        this.isDragging = false;
        this.isFalling = false;

        this.resetAnimation();
        this.fallToBottom();

        this.animationFrameId = requestAnimationFrame(this.animate);
    };

    // listen to pointer down to start drag
    this.container.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.startDrag(e.clientX, e.clientY);
    });

    this.container.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        this.startDrag(touch.clientX, touch.clientY);
    });

    // actual drag logic
    this.startDrag = (clientX, clientY) => {
    // can't drag character out of house
    if (this.isInHouse) return;

    this.resetAnimation();

    if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
    }

    this.isDragging = true;
    this.tripAfterFallActive = false;
    this.isJumping = false;
    this.isFalling = false;
    this.isPetting = false;
    this.isAttachedToCursor = false;

    // interrupt house flight (before entering) — can still cancel if flying toward house
    if (this._houseActive) {
      this._clearHouseTimers();
      this._dismissHouse();
    }

    this.currentAction = 'drag';
    this.img.style.transform = this.facing === 'left' ? 'scaleX(1)' : 'scaleX(-1)';

    // 85% chance to say something when dragged (force — always interrupts)
    if (Math.random() < 0.85 && this.DRAG_PHRASES.length) {
      const phrase = this.DRAG_PHRASES[Math.floor(Math.random() * this.DRAG_PHRASES.length)];
      this.showBubble(phrase, 3000 + Math.random() * 2500, null, true);
    }

    if (this.dragFrameTimer) clearInterval(this.dragFrameTimer);

    const dragConfig = this.spriteConfig.drag;
    if (dragConfig?.frames?.length) {
        let frame = 0;
        this.img.src = dragConfig.frames[0];

        this.dragFrameTimer = setInterval(() => {
            frame = (frame + 1) % dragConfig.frames.length;
            this.img.src = dragConfig.frames[frame];
        }, dragConfig.interval);
    }

    const rect = this.container.getBoundingClientRect();
    let offsetX = clientX - rect.left;  // remember grab offset
    let offsetY = clientY - rect.top;

    const onPointerMove = (e) => {
        e.preventDefault();
        
        let clientX = e.clientX ?? e.touches?.[0].clientX;
        let clientY = e.clientY ?? e.touches?.[0].clientY;

        this.positionX = clientX - offsetX;
        this.positionY = clientY - offsetY;

        // clamp to window
        this.positionX = Math.max(0, Math.min(this.positionX, window.innerWidth - this.containerWidth));
        this.positionY = Math.max(0, Math.min(this.positionY, window.innerHeight - this.containerHeight));

        this.container.style.left = this.positionX + 'px';
        this.container.style.top  = this.positionY + 'px';
    };

    const onPointerUp = () => {
        window.removeEventListener('mousemove', onPointerMove);
        window.removeEventListener('touchmove', onPointerMove);
        window.removeEventListener('mouseup', onPointerUp);
        window.removeEventListener('touchend', onPointerUp);

        this.isDragging = false;
        this.isFalling = false;

        // stop drag animation
        if (this.dragFrameTimer) {
            clearInterval(this.dragFrameTimer);
            this.dragFrameTimer = null;
        }

        this.hideBubble();
        this.resetAnimation();
        this.fallToBottom(); // return to bottom after drag

        this.animationFrameId = requestAnimationFrame(this.animate);
    };

    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);
  };
  }

  // platform detection ----------------------------------------------------
  scanPlatforms() {
    const sel = this.spriteConfig.PLATFORM_SELECTOR;
    if (!sel) { this.platforms = []; return; }
    const els = document.querySelectorAll(sel);
    this.platforms = Array.from(els).map(el => {
      const r = el.getBoundingClientRect();
      return { el, left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
    }).filter(p => p.width > 0 && p.height > 0 && el_visible(p.el) && !el_sticky(p.el))
      .sort((a, b) => a.top - b.top);

    function el_visible(el) {
      const s = window.getComputedStyle(el);
      return s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0';
    }
    function el_sticky(el) {
      return window.getComputedStyle(el).position === 'sticky';
    }
  }

  findSurfaceBelow(centerX, feetY) {
    for (const p of this.platforms) {
      if (p.top > feetY + 2 && p.top < window.innerHeight &&
          centerX >= p.left && centerX <= p.right) {
        return { y: p.top - this.containerHeight, platform: p };
      }
    }
    return { y: window.innerHeight - this.containerHeight, platform: null };
  }

  getCurrentPlatform() {
    const feetY = this.positionY + this.containerHeight;
    const centerX = this.positionX + this.containerWidth / 2;
    for (const p of this.platforms) {
      if (Math.abs(feetY - p.top) < 4 && centerX >= p.left && centerX <= p.right) {
        return p;
      }
    }
    return null;
  }

  isOnSurface() {
    return this.currentPlatform !== null ||
           this.positionY >= window.innerHeight - this.containerHeight - 2;
  }

  checkPlatformValidity() {
    if (!this.currentPlatform || this.isFalling || this.isDragging || this.isJumping) return;
    const el = this.currentPlatform.el;
    if (!el || !el.isConnected) {
      this.currentPlatform = null;
      this.currentEdge = 'bottom';
      this.updateEdgeClass();
      this.fallToBottom();
      return;
    }
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) {
      this.currentPlatform = null;
      this.currentEdge = 'bottom';
      this.attachedToViewport = true;
      this.positionY = window.innerHeight - this.containerHeight;
      this.positionX = Math.max(0, Math.min(this.positionX, window.innerWidth - this.containerWidth));
      this.container.style.left = `${this.positionX}px`;
      this.container.style.top = `${this.positionY}px`;
      this.updateEdgeClass();
      this.fallToBottom();
      return;
    }
    // update cached platform bounds
    this.currentPlatform = { el, left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
    // reposition based on which surface we're on
    if (this.currentEdge === 'bottom') {
      // on top
      this.positionY = r.top - this.containerHeight;
    } else if (this.currentEdge === 'left') {
      this.positionX = r.left;
      this.positionY = Math.max(r.top, Math.min(this.positionY, r.bottom - this.containerHeight));
    } else if (this.currentEdge === 'right') {
      this.positionX = r.right - this.containerWidth;
      this.positionY = Math.max(r.top, Math.min(this.positionY, r.bottom - this.containerHeight));
    } else if (this.currentEdge === 'top') {
      // on bottom surface
      this.positionY = r.bottom;
      this.positionX = Math.max(r.left, Math.min(this.positionX, r.right - this.containerWidth));
    }
    this.applyEdgeOffset();
  }

  // tab change detection ---------------------------------------------------
  getActiveTabButtonIndex() {
    const els = document.querySelectorAll(this.spriteConfig.PLATFORM_SELECTOR);
    let header = null;
    for (const el of els) {
      if (getComputedStyle(el).position === 'sticky') { header = el; break; }
    }
    if (!header) return -1;
    const buttons = header.querySelectorAll('button');
    for (let i = 0; i < buttons.length; i++) {
      if (buttons[i].style.fontWeight === '600') return i;
    }
    return -1;
  }

  // fly in from the side of the screen (after tab change)
  // Phase 1: horizontal flight for 2-3 seconds
  // Phase 2: pick target, smoothly change trajectory, land
  // Sometimes: fly straight into the opposite wall (crash variant)
  flyIn(fromSide) {
    if (this.isDragging) return;

    // full cleanup — cancel everything in progress
    this.clearAllTimers();
    this.isFalling = false;
    this.isJumping = true;
    this.isPetting = false;
    this.tripAfterFallActive = false;
    this.currentPlatform = null;
    this.attachedToViewport = false;

    // cancellation token so overlapping flyIn calls don't conflict
    this._flyInToken++;
    const myToken = this._flyInToken;

    const fallingCfg = this.spriteConfig.falling;
    const jumpCfg = this.spriteConfig.jump || fallingCfg;
    if (!fallingCfg) { this.isJumping = false; return; }

    const speed = this.spriteConfig.jumpspeed * 1.5;
    const excludeEdge = fromSide;

    // ~10% chance to crash into the opposite wall instead of targeting
    const willCrash = Math.random() < 0.10;

    // start off-screen, random Y in middle 60% of viewport
    const startX = fromSide === 'left' ? -this.containerWidth * 2 : window.innerWidth + this.containerWidth;
    const startY = window.innerHeight * 0.2 + Math.random() * window.innerHeight * 0.5;
    this.positionX = startX;
    this.positionY = startY;
    this.container.style.left = `${startX}px`;
    this.container.style.top = `${startY}px`;

    this.facing = fromSide === 'left' ? 'right' : 'left';
    this.updateImageDirection();

    // velocity vector — constant speed throughout
    let vx = speed * (fromSide === 'left' ? 1 : -1);
    let vy = 0;

    // phase control
    const horizontalDuration = 2 + Math.random(); // 2-3 seconds
    let phase = 'horizontal';
    let target = null;
    let validateTimer = 0;
    let elapsed = 0;
    let decisionX = null; // X at the moment of decision — no going back past this

    // frame animation — use jump sprite for active flight
    let activeCfg = jumpCfg; // start with jump (active flying pose)
    let frameIndex = 0;
    let lastAnimSwitch = performance.now();
    this.img.src = activeCfg.frames[0];
    let frameTimer = setInterval(() => {
      frameIndex = (frameIndex + 1) % activeCfg.frames.length;
      this.img.src = activeCfg.frames[frameIndex];
    }, activeCfg.interval);

    let lastTime = performance.now();

    // flying shout: ~30% chance to shout once during flight
    let flyShoutTimer = 0;
    let flyShoutTriggered = false;
    const willShoutInFlight = Math.random() < 0.50;
    const shoutAfter = 0.8 + Math.random() * 1.5; // shout 0.8-2.3s into flight

    const step = (time) => {
      if (this._flyInToken !== myToken || this.isDragging) {
        clearInterval(frameTimer);
        this.hideBubble();
        if (this.isDragging) this.isJumping = false;
        return;
      }

      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      elapsed += dt;

      // flying shout check
      if (willShoutInFlight && !flyShoutTriggered && elapsed >= shoutAfter) {
        flyShoutTriggered = true;
        const phrase = this.FLY_PHRASES[Math.floor(Math.random() * this.FLY_PHRASES.length)];
        this.showBubble(phrase, 3000 + Math.random() * 2000);
      }

      if (phase === 'horizontal') {
        this.positionX += vx * dt;
        this.positionY += vy * dt;

        // wall crash: check if hit opposite wall
        if (willCrash) {
          const hitRight = fromSide === 'left' && this.positionX >= window.innerWidth - this.containerWidth;
          const hitLeft = fromSide === 'right' && this.positionX <= 0;
          if (hitRight || hitLeft) {
            clearInterval(frameTimer);
            this.hideBubble();
            this.isJumping = false;
            this.positionX = hitRight ? window.innerWidth - this.containerWidth : 0;
            this.container.style.left = `${this.positionX}px`;
            this.container.style.top = `${this.positionY}px`;

            // 50/50: stick to wall or fall down
            if (Math.random() < 0.5) {
              this.currentEdge = hitRight ? 'right' : 'left';
              this.attachedToViewport = true;
              this.updateEdgeClass();
              this.lastScrollY = window.scrollY;
              this.resetAnimation();
              this.lastTime = performance.now();
              this.startEdgeIdle();
              this.animationFrameId = requestAnimationFrame(this.animate);
            } else {
              this.attachedToViewport = true;
              this.currentEdge = 'bottom';
              this.updateEdgeClass();
              this.fallToBottom(undefined, true); // use jump anim after wall crash
              this.animationFrameId = requestAnimationFrame(this.animate);
            }
            return;
          }
        }

        // edge grab: if near a platform edge during horizontal flight, chance to divert
        if (!willCrash && elapsed > 0.5) {
          this.scanPlatforms();
          const charCX = this.positionX + this.containerWidth / 2;
          const charCY = this.positionY + this.containerHeight / 2;
          for (const p of this.platforms) {
            if (p.top < 0 || p.bottom > window.innerHeight) continue;
            const closestX = Math.max(p.left, Math.min(charCX, p.right));
            const closestY = Math.max(p.top, Math.min(charCY, p.bottom));
            const dist = Math.hypot(charCX - closestX, charCY - closestY);
            if (dist < 200 && Math.random() < 0.15) {
              const edgeTarget = this._pickClosestPlatformEdge(p, charCX, charCY);
              // only grab if target is in the flight direction (not behind us)
              const grabDx = edgeTarget.x - this.positionX;
              if (Math.sign(grabDx) === Math.sign(vx) || Math.abs(grabDx) < 50) {
                phase = 'targeting';
                target = edgeTarget;
                decisionX = this.positionX;
                validateTimer = 0;
                break;
              }
            }
          }
        }

        if (!willCrash && phase === 'horizontal' && elapsed >= horizontalDuration) {
          phase = 'targeting';
          decisionX = this.positionX;
          target = this.pickFlyTarget(excludeEdge, fromSide, decisionX, this.positionX, this.positionY);
          validateTimer = 0;
        }
      } else {
        // smooth trajectory change toward target
        const dx = target.x - this.positionX;
        const dy = target.y - this.positionY;
        const dist = Math.hypot(dx, dy);

        if (dist < 6) {
          clearInterval(frameTimer);
          this.hideBubble();
          this.isJumping = false;
          this.positionX = target.x;
          this.positionY = target.y;
          this.container.style.left = `${this.positionX}px`;
          this.container.style.top = `${this.positionY}px`;
          this.landFromFly(target);
          return;
        }

        // desired velocity toward target
        const desiredVx = (dx / dist) * speed;
        const desiredVy = (dy / dist) * speed;

        // lerp velocity for smooth turn (faster when close to prevent orbiting)
        const lerpRate = dist < 80 ? 10 : dist < 200 ? 5 : 3;
        const lerpAmount = Math.min(lerpRate * dt, 1);
        vx += (desiredVx - vx) * lerpAmount;
        vy += (desiredVy - vy) * lerpAmount;

        // normalize to constant speed
        const currentSpeed = Math.hypot(vx, vy);
        if (currentSpeed > 0) {
          vx = (vx / currentSpeed) * speed;
          vy = (vy / currentSpeed) * speed;
        }

        this.positionX += vx * dt;
        this.positionY += vy * dt;

        // dynamic animation with wide hysteresis + min interval to prevent flicker
        const now = performance.now();
        if (now - lastAnimSwitch > 400) {
          if (activeCfg === fallingCfg && vy < -40) {
            activeCfg = jumpCfg;
            lastAnimSwitch = now;
            clearInterval(frameTimer);
            frameIndex = 0;
            this.img.src = activeCfg.frames[0];
            frameTimer = setInterval(() => {
              frameIndex = (frameIndex + 1) % activeCfg.frames.length;
              this.img.src = activeCfg.frames[frameIndex];
            }, activeCfg.interval);
          } else if (activeCfg === jumpCfg && vy > 25) {
            activeCfg = fallingCfg;
            lastAnimSwitch = now;
            clearInterval(frameTimer);
            frameIndex = 0;
            this.img.src = activeCfg.frames[0];
            frameTimer = setInterval(() => {
              frameIndex = (frameIndex + 1) % activeCfg.frames.length;
              this.img.src = activeCfg.frames[frameIndex];
            }, activeCfg.interval);
          }
        }

        if (Math.abs(vx) > 5) this.setFacingFromDelta(vx);

        // validate target periodically
        validateTimer += dt;
        if (validateTimer > 0.5) {
          validateTimer = 0;
          if ((target.type === 'platform' || target.type === 'platform-edge') && target.platform?.el) {
            if (!target.platform.el.isConnected || target.platform.el.getBoundingClientRect().width === 0) {
              const newTarget = this.pickFlyTarget(excludeEdge, fromSide, decisionX, this.positionX, this.positionY);
              // only accept if new target doesn't reverse horizontal direction
              const newDx = newTarget.x - this.positionX;
              if (Math.sign(newDx) === Math.sign(vx) || Math.abs(newDx) < 50) {
                target = newTarget;
              } else {
                // fallback: land at viewport bottom below current position
                target = { type: 'bottom', x: this.positionX, y: window.innerHeight - this.containerHeight, platform: null };
              }
            } else {
              const r = target.platform.el.getBoundingClientRect();
              target.platform = { el: target.platform.el, left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
              // update target coords but cap max shift to prevent mid-flight reversals
              let newX, newY;
              if (target.type === 'platform') {
                newX = Math.max(r.left, Math.min(target.x, r.right - this.containerWidth));
                newY = Math.max(0, r.top - this.containerHeight);
              } else if (target.edge === 'left') {
                newX = r.left; newY = Math.max(r.top, Math.min(target.y, r.bottom - this.containerHeight));
              } else if (target.edge === 'right') {
                newX = r.right - this.containerWidth; newY = Math.max(r.top, Math.min(target.y, r.bottom - this.containerHeight));
              } else {
                newY = r.bottom; newX = Math.max(r.left, Math.min(target.x, r.right - this.containerWidth));
              }
              const shift = Math.hypot(newX - target.x, newY - target.y);
              if (shift < 100) {
                target.x = newX;
                target.y = newY;
              } else {
                // platform shifted too much (scroll/layout change) — re-pick forward target
                const newTarget = this.pickFlyTarget(excludeEdge, fromSide, decisionX, this.positionX, this.positionY);
                const newDx = newTarget.x - this.positionX;
                if (Math.sign(newDx) === Math.sign(vx) || Math.abs(newDx) < 50) {
                  target = newTarget;
                } else {
                  target = { type: 'bottom', x: this.positionX, y: window.innerHeight - this.containerHeight, platform: null };
                }
              }
            }
          }
        }

        // clamp to viewport during targeting
        this.positionX = Math.max(0, Math.min(this.positionX, window.innerWidth - this.containerWidth));
        this.positionY = Math.max(0, Math.min(this.positionY, window.innerHeight - this.containerHeight));
      }

      this.container.style.left = `${this.positionX}px`;
      this.container.style.top = `${this.positionY}px`;
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // pick closest edge of a platform to grab during flight
  _pickClosestPlatformEdge(p, charX, charY) {
    const candidates = [
      { edge: 'top', x: Math.max(p.left, Math.min(charX - this.containerWidth / 2, p.right - this.containerWidth)), y: Math.max(0, p.top - this.containerHeight) },
    ];
    if (p.height > this.containerHeight) {
      candidates.push(
        { edge: 'left', x: p.left, y: Math.max(p.top, Math.min(charY - this.containerHeight / 2, p.bottom - this.containerHeight)) },
        { edge: 'right', x: p.right - this.containerWidth, y: Math.max(p.top, Math.min(charY - this.containerHeight / 2, p.bottom - this.containerHeight)) },
      );
    }
    if (p.width > this.containerWidth) {
      candidates.push(
        { edge: 'bottom-surface', x: Math.max(p.left, Math.min(charX - this.containerWidth / 2, p.right - this.containerWidth)), y: p.bottom },
      );
    }
    let best = candidates[0], bestDist = Infinity;
    for (const c of candidates) {
      const d = Math.hypot(charX - c.x - this.containerWidth / 2, charY - c.y - this.containerHeight / 2);
      if (d < bestDist) { bestDist = d; best = c; }
    }
    if (best.edge === 'top') {
      return { type: 'platform', x: best.x, y: best.y, platform: p };
    }
    if (best.edge === 'bottom-surface') {
      return { type: 'platform-edge', edge: 'bottom-surface', x: best.x, y: best.y, platform: p };
    }
    return { type: 'platform-edge', edge: best.edge, x: best.x, y: best.y, platform: p };
  }

  // pick a random fly target: platform, viewport bottom, or edge (excluding entry side)
  // charX/charY = current character position for distance-weighted selection
  pickFlyTarget(excludeEdge, fromSide, forwardMinX, charX, charY) {
    let options = [];

    // visible platforms
    this.scanPlatforms();
    const visible = this.platforms.filter(p =>
      p.top >= this.containerHeight && p.top < window.innerHeight
    );
    for (const p of visible) {
      // top surface
      const landX = p.left + Math.random() * Math.max(0, p.width - this.containerWidth);
      options.push({
        type: 'platform',
        x: Math.max(p.left, Math.min(landX, p.right - this.containerWidth)),
        y: Math.max(0, p.top - this.containerHeight),
        platform: p,
      });
      // platform sides (only if tall enough)
      if (p.height > this.containerHeight) {
        // left side
        options.push({
          type: 'platform-edge', edge: 'left',
          x: p.left,
          y: p.top + Math.random() * Math.max(0, p.height - this.containerHeight),
          platform: p,
        });
        // right side
        options.push({
          type: 'platform-edge', edge: 'right',
          x: p.right - this.containerWidth,
          y: p.top + Math.random() * Math.max(0, p.height - this.containerHeight),
          platform: p,
        });
      }
      // bottom surface (hang underneath, only if wide enough)
      if (p.width > this.containerWidth && p.bottom < window.innerHeight - this.containerHeight) {
        options.push({
          type: 'platform-edge', edge: 'bottom-surface',
          x: p.left + Math.random() * Math.max(0, p.width - this.containerWidth),
          y: p.bottom,
          platform: p,
        });
      }
    }

    // viewport bottom
    options.push({
      type: 'bottom',
      x: Math.random() * (window.innerWidth - this.containerWidth),
      y: window.innerHeight - this.containerHeight,
      platform: null,
    });

    // allowed edges (excluding entry side)
    const edges = ['top', 'left', 'right'].filter(e =>
      e !== excludeEdge && this.spriteConfig.ALLOWANCES.includes(e)
    );
    for (const edge of edges) {
      let x, y;
      if (edge === 'top') {
        x = Math.random() * (window.innerWidth - this.containerWidth);
        y = 0;
      } else if (edge === 'left') {
        x = 0;
        y = Math.random() * (window.innerHeight - this.containerHeight);
      } else {
        x = window.innerWidth - this.containerWidth;
        y = Math.random() * (window.innerHeight - this.containerHeight);
      }
      options.push({ type: 'edge', edge, x, y, platform: null });
    }

    // filter out backward targets (prevent U-turns during flyIn)
    if (forwardMinX !== undefined && fromSide) {
      const tolerance = 50;
      const forward = fromSide === 'left'
        ? options.filter(o => o.x >= forwardMinX - tolerance)
        : options.filter(o => o.x <= forwardMinX + this.containerWidth + tolerance);
      if (forward.length > 0) options = forward;
    }

    if (!fromSide || options.length <= 1) {
      return options[Math.floor(Math.random() * options.length)];
    }

    // distance-weighted selection: closer to character = much higher chance
    const cx = charX !== undefined ? charX : (fromSide === 'left' ? 0 : window.innerWidth);
    const cy = charY !== undefined ? charY : window.innerHeight * 0.5;
    const weights = options.map(opt => {
      const dist = Math.hypot(opt.x - cx, opt.y - cy);
      // steep inverse: nearby platforms get much higher weight
      return 1 / (1 + dist / 50);
    });
    const totalWeight = weights.reduce((s, w) => s + w, 0);
    let r = Math.random() * totalWeight;
    for (let i = 0; i < options.length; i++) {
      r -= weights[i];
      if (r <= 0) return options[i];
    }
    return options[options.length - 1];
  }

  // land after flyIn animation
  landFromFly(target) {
    if (target.type === 'platform' && target.platform?.el?.isConnected) {
      const r = target.platform.el.getBoundingClientRect();
      this.positionY = Math.max(0, r.top - this.containerHeight);
      this.currentPlatform = { el: target.platform.el, left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
      this.attachedToViewport = false;
      this.currentEdge = 'bottom';
    } else if (target.type === 'platform-edge' && target.platform?.el?.isConnected) {
      const r = target.platform.el.getBoundingClientRect();
      this.currentPlatform = { el: target.platform.el, left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
      this.attachedToViewport = false;
      if (target.edge === 'left') {
        this.currentEdge = 'left';
        this.positionX = r.left;
        this.positionY = Math.max(r.top, Math.min(this.positionY, r.bottom - this.containerHeight));
      } else if (target.edge === 'right') {
        this.currentEdge = 'right';
        this.positionX = r.right - this.containerWidth;
        this.positionY = Math.max(r.top, Math.min(this.positionY, r.bottom - this.containerHeight));
      } else {
        // bottom-surface
        this.currentEdge = 'top';
        this.positionY = r.bottom;
        this.positionX = Math.max(r.left, Math.min(this.positionX, r.right - this.containerWidth));
      }
    } else if (target.type === 'edge') {
      this.attachedToViewport = true;
      this.currentEdge = target.edge;
    } else {
      this.positionY = window.innerHeight - this.containerHeight;
      this.attachedToViewport = true;
      this.currentEdge = 'bottom';
    }

    this.lastScrollY = window.scrollY;
    this._landedAt = performance.now(); // cooldown before next fly
    this.updateEdgeClass();
    this.applyEdgeOffset();
    this.resetAnimation();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.lastTime = performance.now();

    if (['top', 'left', 'right'].includes(this.currentEdge)) {
      this.startEdgeIdle();
    } else {
      this.setNextAction();
    }
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  // falling and recovery -------------------------------------------------
  // animate falling to bottom
  fallToBottom(fallSpeed=this.spriteConfig.fallspeed, useJumpAnim=false){
    if(this.isFalling) return;
    this.tripAfterFallActive = false;
    this.isFalling = true;
    this.currentEdge='bottom';
    this.currentPlatform = null;
    this.attachedToViewport = false;
    this.updateEdgeClass();
    this.resetAnimation();

    const scrollYAtStart = window.scrollY;
    const cfg = useJumpAnim ? (this.spriteConfig.jump || this.spriteConfig.falling) : this.spriteConfig.falling;
    if(!cfg) return;

    let frameIndex=0;
    this.img.src=cfg.frames[0];
    this.frameTimer=setInterval(()=>{
      frameIndex=(frameIndex+1)%cfg.frames.length;
      this.img.src=cfg.frames[frameIndex];
      }, cfg.interval);

    // Find landing surface (platform or viewport bottom)
    this.scanPlatforms();
    const centerX = this.positionX + this.containerWidth / 2;
    const feetY = this.positionY + this.containerHeight;
    const surface = this.findSurfaceBelow(centerX, feetY);
    const startY=this.positionY, endY=surface.y, landingPlatform=surface.platform, distance=endY-startY;
    if(distance<=0){ clearInterval(this.frameTimer);
      this.frameTimer=null;
      if (landingPlatform && landingPlatform.el) {
        const r = landingPlatform.el.getBoundingClientRect();
        this.positionY = r.top - this.containerHeight;
        this.currentPlatform = { el: landingPlatform.el, left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
        this.attachedToViewport = false;
      } else {
        this.positionY = window.innerHeight - this.containerHeight;
        this.attachedToViewport = true;
      }
      this.container.style.top=`${this.positionY}px`;
      this.lastScrollY = window.scrollY;
      return this.softLand();
    }

    const startTime=performance.now();
    const scrollCompensate = !!landingPlatform;
    const step = (time) => {
      if (this.isDragging) {
          clearInterval(this.frameTimer);
          this.frameTimer = null;
          return this.animationFrameId = requestAnimationFrame(this.animate);
      }

      const elapsed = (time - startTime) / 1000;
      const scrollDelta = scrollCompensate ? (window.scrollY - scrollYAtStart) : 0;
      const contentY = Math.min(startY + fallSpeed * elapsed, endY);
      this.positionY = contentY - scrollDelta;
      this.container.style.top = `${this.positionY}px`;

      if (contentY < endY) {
          // edge grab during fall: check for nearby platform edges
          if (Math.random() < 0.10) {
            this.scanPlatforms();
            const charCX = this.positionX + this.containerWidth / 2;
            const charCY = this.positionY + this.containerHeight / 2;
            for (const p of this.platforms) {
              if (p.top < 0 || p.bottom > window.innerHeight) continue;
              if (p.height < this.containerHeight) continue;
              const nearLeft = Math.abs(charCX - p.left) < 100 && charCY >= p.top && charCY <= p.bottom;
              const nearRight = Math.abs(charCX - p.right) < 100 && charCY >= p.top && charCY <= p.bottom;
              if (nearLeft || nearRight) {
                clearInterval(this.frameTimer);
                this.frameTimer = null;
                this.isFalling = false;
                this.tripAfterFallActive = false;
                const edge = nearLeft ? 'left' : 'right';
                const ey = Math.max(p.top, Math.min(charCY - this.containerHeight / 2, p.bottom - this.containerHeight));
                this.positionX = edge === 'left' ? p.left : p.right - this.containerWidth;
                this.positionY = ey;
                this.currentEdge = edge;
                this.currentPlatform = { el: p.el, left: p.left, right: p.right, top: p.top, bottom: p.bottom, width: p.width, height: p.height };
                this.attachedToViewport = false;
                this.updateEdgeClass();
                this.applyEdgeOffset();
                this.lastScrollY = window.scrollY;
                this._landedAt = performance.now();
                this.resetAnimation();
                this.lastTime = performance.now();
                this.startEdgeIdle();
                this.animationFrameId = requestAnimationFrame(this.animate);
                return;
              }
            }
          }
          requestAnimationFrame(step);
      } else {
          clearInterval(this.frameTimer);
          this.frameTimer = null;
          if (landingPlatform && landingPlatform.el) {
            const r = landingPlatform.el.getBoundingClientRect();
            this.positionY = r.top - this.containerHeight;
            this.currentPlatform = { el: landingPlatform.el, left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
            this.attachedToViewport = false;
          } else {
            this.positionY = window.innerHeight - this.containerHeight;
            this.attachedToViewport = true;
          }
          this.container.style.top = `${this.positionY}px`;
          this.lastScrollY = window.scrollY;
          if (distance < 40) {
            this.softLand();
          } else {
            this.playTripAfterFall();
          }
      }
    };
    requestAnimationFrame(step);
  }

  // soft landing for small falls — no trip animation
  softLand() {
    this.isFalling = false;
    this.tripAfterFallActive = false;
    this._landedAt = performance.now();
    this.resetAnimation();
    this.lastTime = performance.now();
    const standFrame = this.spriteConfig.stand?.frames?.[0] || this.spriteConfig.walk.frames[0];
    this.img.src = standFrame;
    this.setNextAction();
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  // play fallen/trip animation after landing
  playTripAfterFall() {
    const tripConfig = this.spriteConfig.fallen;
    if (!tripConfig) {
        this.resumeAfterFallen();
        return;
    }

    this.tripAfterFallActive = true;
    let frame = 0;
    const totalFrames = tripConfig.frames.length;
    this.img.src = tripConfig.frames[0];

    // 90% chance to say ouch when fallen
    if (Math.random() < 0.90 && this.FALLEN_PHRASES.length) {
      const phrase = this.FALLEN_PHRASES[Math.floor(Math.random() * this.FALLEN_PHRASES.length)];
      this.showBubble(phrase, 3000 + Math.random() * 1500);
    }

    this._tripFrameTimer = setInterval(() => {
        frame++;

        if (frame >= totalFrames) {
            clearInterval(this._tripFrameTimer);
            this._tripFrameTimer = null;
            this.img.src = tripConfig.frames[totalFrames - 1];

            setTimeout(() => {
                if (this.tripAfterFallActive) this.resumeAfterFallen();
            }, this.spriteConfig.gettingupspeed);
        } else {
            this.img.src = tripConfig.frames[frame];
        }
    }, tripConfig.interval);
  }

  // continue normal actions after fall
  resumeAfterFallen() {
    if(this.isDragging) return;
    this.isFalling = false;
    this.isPetting = false;
    this._landedAt = performance.now();
    // refresh position from DOM if on a platform (scroll may have shifted it during trip)
    if (this.currentPlatform && this.currentPlatform.el) {
      const r = this.currentPlatform.el.getBoundingClientRect();
      this.positionY = r.top - this.containerHeight;
      this.currentPlatform = { el: this.currentPlatform.el, left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
      this.container.style.top = `${this.positionY}px`;
      this.attachedToViewport = false;
    } else {
      this.attachedToViewport = true;
    }
    this.lastScrollY = window.scrollY;
    this.resetAnimation();
    this.lastTime = performance.now();

    // 30% chance to say a tired phrase when getting up
    if (Math.random() < 0.35 && this.TIRED_PHRASES.length) {
      const phrase = this.TIRED_PHRASES[Math.floor(Math.random() * this.TIRED_PHRASES.length)];
      this.showBubble(phrase, 3500 + Math.random() * 2000);
    }

    this.currentAction = 'sit';
    this.setNextAction();
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  // check if character is visible in viewport
  isVisibleToUser() {
    const x = this.positionX;
    const y = this.positionY;
    return x >= -this.containerWidth && x <= window.innerWidth &&
           y >= -this.containerHeight && y <= window.innerHeight;
  }

  // show a speech bubble with a random phrase
  shout(onComplete) {
    if (!this.isVisibleToUser()) { onComplete?.(); return; }

    this.currentAction = 'shout';
    this.resetAnimation();

    // use sit/stand sprite while shouting
    const standFrame = this.spriteConfig.stand?.frames?.[0] || this.spriteConfig.walk.frames[0];
    this.img.src = standFrame;

    const phrase = this.SHOUT_PHRASES[Math.floor(Math.random() * this.SHOUT_PHRASES.length)];
    const holdDuration = 4000 + Math.random() * 3000;
    this.showBubble(phrase, holdDuration, onComplete);
  }

  // fly to the user's cursor, cling for a while, then detach
  flyToCursor() {
    this.currentAction = 'flyToCursor';
    this.resetAnimation();
    this.isJumping = true;

    const fallingCfg = this.spriteConfig.falling;
    const jumpCfg = this.spriteConfig.jump || fallingCfg;
    if (!fallingCfg) { this.setNextAction(); return; }

    let activeCfg = jumpCfg;
    this.img.src = activeCfg.frames[0];
    let frame = 0;
    this._flyToCursorTimer = setInterval(() => {
      frame = (frame + 1) % activeCfg.frames.length;
      this.img.src = activeCfg.frames[frame];
    }, activeCfg.interval);

    const speed = 350;
    let lastTime = performance.now();

    const step = (time) => {
      if (this.isDragging) {
        clearInterval(this._flyToCursorTimer); this._flyToCursorTimer = null;
        this.isJumping = false;
        return;
      }

      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      // track live cursor position
      const targetX = this._mouseX - this.containerWidth / 2;
      const targetY = this._mouseY - this.containerHeight / 2;
      const dx = targetX - this.positionX;
      const dy = targetY - this.positionY;
      const dist = Math.hypot(dx, dy);

      // switch anim with wide hysteresis
      if (activeCfg === fallingCfg && dy < -40) {
        activeCfg = jumpCfg;
        frame = 0;
        clearInterval(this._flyToCursorTimer);
        this._flyToCursorTimer = setInterval(() => {
          frame = (frame + 1) % activeCfg.frames.length;
          this.img.src = activeCfg.frames[frame];
        }, activeCfg.interval);
      } else if (activeCfg === jumpCfg && dy > 25) {
        activeCfg = fallingCfg;
        frame = 0;
        clearInterval(this._flyToCursorTimer);
        this._flyToCursorTimer = setInterval(() => {
          frame = (frame + 1) % activeCfg.frames.length;
          this.img.src = activeCfg.frames[frame];
        }, activeCfg.interval);
      }

      if (dist < 20) {
        // arrived at cursor — attach
        clearInterval(this._flyToCursorTimer); this._flyToCursorTimer = null;
        this.isJumping = false;
        this.positionX = targetX;
        this.positionY = targetY;
        this.container.style.left = `${this.positionX}px`;
        this.container.style.top = `${this.positionY}px`;
        this._attachToCursor();
        return;
      }

      const moveX = (dx / dist) * speed * dt;
      const moveY = (dy / dist) * speed * dt;
      this.positionX += moveX;
      this.positionY += moveY;
      this.container.style.left = `${this.positionX}px`;
      this.container.style.top = `${this.positionY}px`;

      // face direction of movement
      if (dx !== 0) {
        this.facing = dx < 0 ? 'left' : 'right';
        this.updateImageDirection();
      }

      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  _attachToCursor() {
    this.isAttachedToCursor = true;
    this.currentAction = 'cursorCling';

    // show catch phrase
    if (this.CURSOR_PHRASES.length) {
      const phrase = this.CURSOR_PHRASES[Math.floor(Math.random() * this.CURSOR_PHRASES.length)];
      this.showBubble(phrase, 3500 + Math.random() * 2000);
    }

    // use drag sprite while clinging
    const dragConfig = this.spriteConfig.drag;
    let frame = 0;
    if (dragConfig?.frames?.length) {
      this.img.src = dragConfig.frames[0];
      this._cursorFrameTimer = setInterval(() => {
        frame = (frame + 1) % dragConfig.frames.length;
        this.img.src = dragConfig.frames[frame];
      }, dragConfig.interval);
    }

    // follow cursor
    const followStep = () => {
      if (!this.isAttachedToCursor || this.isDragging) {
        this._detachFromCursor();
        return;
      }
      // offset: character hangs below and slightly to the right of cursor
      this.positionX = this._mouseX - this.containerWidth / 2 + 5;
      this.positionY = this._mouseY + 5;
      this.container.style.left = `${this.positionX}px`;
      this.container.style.top = `${this.positionY}px`;
      this._cursorFollowRAF = requestAnimationFrame(followStep);
    };
    this._cursorFollowRAF = requestAnimationFrame(followStep);

    // detach after 3-5 seconds
    this._cursorDetachTimer = setTimeout(() => {
      this._detachFromCursor();
    }, 3000 + Math.random() * 2000);
  }

  _detachFromCursor() {
    if (!this.isAttachedToCursor) return;
    this.isAttachedToCursor = false;

    if (this._cursorFrameTimer) { clearInterval(this._cursorFrameTimer); this._cursorFrameTimer = null; }
    if (this._cursorFollowRAF) { cancelAnimationFrame(this._cursorFollowRAF); this._cursorFollowRAF = null; }
    if (this._cursorDetachTimer) { clearTimeout(this._cursorDetachTimer); this._cursorDetachTimer = null; }

    this.hideBubble();
    this.currentEdge = 'bottom';
    this.updateEdgeClass();
    this.attachedToViewport = true;

    // find nearest surface below and fall to it
    this.scanPlatforms();
    const centerX = this.positionX + this.containerWidth / 2;
    const feetY = this.positionY + this.containerHeight;
    const surface = this.findSurfaceBelow(centerX, feetY);
    if (surface.platform) {
      this.currentPlatform = surface.platform;
      this.attachedToViewport = false;
    } else {
      this.currentPlatform = null;
      this.attachedToViewport = true;
    }
    this.fallToBottom();
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  // small hop in place on current surface
  smallHop() {
    if (!this.isVisibleToUser() || this.currentEdge !== 'bottom') return;

    this.currentAction = 'hop';
    this.resetAnimation();

    const jumpCfg = this.spriteConfig.jump;
    const standFrame = this.spriteConfig.stand?.frames?.[0] || this.spriteConfig.walk.frames[0];
    if (jumpCfg) {
      this.img.src = jumpCfg.frames[0];
    }

    const startY = this.positionY;
    const hopHeight = 15 + Math.random() * 10; // 15-25px
    const duration = 0.35;
    const startTime = performance.now();

    // 20% chance to show hop phrase
    if (Math.random() < 0.3 && this.HOP_PHRASES.length) {
      const phrase = this.HOP_PHRASES[Math.floor(Math.random() * this.HOP_PHRASES.length)];
      this.showBubble(phrase, 2000);
    }

    const step = (time) => {
      if (this.isDragging) return;

      const t = Math.min((time - startTime) / 1000 / duration, 1);
      // parabolic arc
      const arcY = -4 * hopHeight * t * (t - 1);
      this.positionY = startY - arcY;
      this.container.style.top = `${this.positionY}px`;

      // switch to falling frame at peak
      if (jumpCfg && t > 0.5) {
        const fallingCfg = this.spriteConfig.falling;
        if (fallingCfg) this.img.src = fallingCfg.frames[0];
      }

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        this.positionY = startY;
        this.container.style.top = `${this.positionY}px`;
        this.img.src = standFrame;
        this.setNextAction();
      }
    };
    requestAnimationFrame(step);
  }

  // house feature ------------------------------------------------------------------
  summonHouse() {
    if (this._houseActive) return;
    this._houseActive = true;
    this.currentAction = 'goingHome';

    // pick random edge and position (flush to screen edge, no gap)
    const edges = ['left', 'right', 'top', 'bottom'];
    const edge = edges[Math.floor(Math.random() * edges.length)];
    this._houseEdge = edge;

    const houseSize = 60;
    let x, y, hiddenTransform, rotation;

    if (edge === 'left') {
      x = 0;
      y = 100 + Math.random() * (window.innerHeight - 200);
      hiddenTransform = 'translateX(-100%)';
      rotation = '90deg';
    } else if (edge === 'right') {
      x = window.innerWidth - houseSize;
      y = 100 + Math.random() * (window.innerHeight - 200);
      hiddenTransform = 'translateX(100%)';
      rotation = '-90deg';
    } else if (edge === 'top') {
      x = 100 + Math.random() * (window.innerWidth - 200);
      y = 0;
      hiddenTransform = 'translateY(-100%)';
      rotation = '180deg';
    } else {
      x = 100 + Math.random() * (window.innerWidth - 200);
      y = window.innerHeight - houseSize;
      hiddenTransform = 'translateY(100%)';
      rotation = '0deg';
    }

    this._houseX = x;
    this._houseY = y;

    this.house.style.left = `${x}px`;
    this.house.style.top = `${y}px`;
    this.house.style.rotate = rotation; // rotation applied instantly, not animated
    this.house.style.transform = hiddenTransform; // only translation — will slide in
    this.house.style.filter = '';
    this.house.style.opacity = '1'; // show immediately, no fade
    this.house.offsetWidth; // force reflow
    this.house.classList.add('slide-in');

    // after delay, fly to house
    this._houseDelayTimer = setTimeout(() => {
      this._flyToHouse();
    }, 3000 + Math.random() * 4000); // 3-7s delay before flying to house
  }

  _flyToHouse() {
    if (this.isDragging || !this._houseActive) return;

    this.resetAnimation();
    this.isJumping = true;

    const fallingCfg = this.spriteConfig.falling;
    const jumpCfg = this.spriteConfig.jump || fallingCfg;
    if (!fallingCfg) { this._enterHouse(); return; }

    let activeCfg = jumpCfg;
    this.img.src = activeCfg.frames[0];
    let frame = 0;
    this._houseFlightTimer = setInterval(() => {
      frame = (frame + 1) % activeCfg.frames.length;
      this.img.src = activeCfg.frames[frame];
    }, activeCfg.interval);

    const speed = this.spriteConfig.jumpspeed * 1.5; // same as normal flyIn
    let lastTime = performance.now();
    const targetX = this._houseX;
    const targetY = this._houseY;

    const step = (time) => {
      if (this.isDragging || !this._houseActive) {
        clearInterval(this._houseFlightTimer); this._houseFlightTimer = null;
        this.isJumping = false;
        if (!this._houseActive) return;
        this._dismissHouse();
        return;
      }

      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const dx = targetX - this.positionX;
      const dy = targetY - this.positionY;
      const dist = Math.hypot(dx, dy);

      // hysteresis anim switching: jump when going up, falling when going down
      if (activeCfg === fallingCfg && dy < -40) {
        activeCfg = jumpCfg;
        frame = 0;
        clearInterval(this._houseFlightTimer);
        this._houseFlightTimer = setInterval(() => {
          frame = (frame + 1) % activeCfg.frames.length;
          this.img.src = activeCfg.frames[frame];
        }, activeCfg.interval);
      } else if (activeCfg === jumpCfg && dy > 25) {
        activeCfg = fallingCfg;
        frame = 0;
        clearInterval(this._houseFlightTimer);
        this._houseFlightTimer = setInterval(() => {
          frame = (frame + 1) % activeCfg.frames.length;
          this.img.src = activeCfg.frames[frame];
        }, activeCfg.interval);
      }

      if (dist < 25) {
        clearInterval(this._houseFlightTimer); this._houseFlightTimer = null;
        this.isJumping = false;
        this._enterHouse();
        return;
      }

      const moveX = (dx / dist) * speed * dt;
      const moveY = (dy / dist) * speed * dt;
      this.positionX += moveX;
      this.positionY += moveY;
      this.container.style.left = `${this.positionX}px`;
      this.container.style.top = `${this.positionY}px`;

      if (dx !== 0) {
        this.facing = dx < 0 ? 'left' : 'right';
        this.updateImageDirection();
      }

      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  _enterHouse() {
    this.isInHouse = true;
    this.isJumping = false;
    this.currentAction = 'inHouse';
    this.attachedToViewport = true; // house is viewport-fixed, don't scroll-compensate
    this.currentPlatform = null;
    this.img.style.opacity = '0'; // hide only the image, keep bubble visible
    this.img.style.pointerEvents = 'none';

    // show phrases periodically while inside
    const stayDuration = 90000 + Math.random() * 60000; // ~1.5-2.5 minutes
    let phraseCount = 0;
    const maxPhrases = Math.floor(stayDuration / 4000);

    const showHousePhrase = () => {
      if (!this.isInHouse || phraseCount >= maxPhrases) return;
      phraseCount++;
      if (this.HOUSE_INSIDE_PHRASES.length) {
        const phrase = this.HOUSE_INSIDE_PHRASES[Math.floor(Math.random() * this.HOUSE_INSIDE_PHRASES.length)];
        this.showBubble(phrase, 3500 + Math.random() * 2000);
      }
      this._housePhraseTimer = setTimeout(showHousePhrase, 3000 + Math.random() * 3000);
    };

    // position bubble near house
    this.positionX = this._houseX;
    this.positionY = this._houseY - 10;
    this.container.style.left = `${this.positionX}px`;
    this.container.style.top = `${this.positionY}px`;

    this._housePhraseTimer = setTimeout(showHousePhrase, 1000 + Math.random() * 2000);

    // exit after stay duration
    this._houseExitTimer = setTimeout(() => {
      this._exitHouse();
    }, stayDuration);
  }

  _exitHouse() {
    if (!this.isInHouse) return;
    this.isInHouse = false;

    if (this._housePhraseTimer) { clearTimeout(this._housePhraseTimer); this._housePhraseTimer = null; }
    if (this._houseExitTimer) { clearTimeout(this._houseExitTimer); this._houseExitTimer = null; }
    this.hideBubble();

    // show character near house
    this.img.style.opacity = '';
    this.img.style.pointerEvents = '';
    this.positionX = this._houseX;
    this.positionY = this._houseY;
    this.container.style.left = `${this.positionX}px`;
    this.container.style.top = `${this.positionY}px`;

    this.currentEdge = 'bottom';
    this.attachedToViewport = true;
    this.currentPlatform = null;
    this.updateEdgeClass();

    const standFrame = this.spriteConfig.stand?.frames?.[0] || this.spriteConfig.walk.frames[0];
    this.img.src = standFrame;

    this.resetAnimation();
    this.lastTime = performance.now();

    // dismiss house after short delay
    this._houseDismissTimer = setTimeout(() => {
      this._dismissHouse();
    }, 1000 + Math.random() * 1000);

    // fall to bottom / nearest surface
    this.fallToBottom();
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  _dismissHouse() {
    this.house.classList.remove('slide-in');
    // slides back out via CSS transition (transform goes back to hiddenTransform)
    setTimeout(() => {
      this._houseActive = false;
      this._houseEdge = null;
      this.house.style.opacity = '0';
      this.house.style.rotate = '';
    }, 1700);
  }

  _onHouseClick() {
    if (!this._houseActive) return;

    if (this.isInHouse) {
      // creature is inside — show rest phrase from house position (force — user clicked)
      if (this.HOUSE_CLICK_INSIDE_PHRASES.length) {
        const phrase = this.HOUSE_CLICK_INSIDE_PHRASES[Math.floor(Math.random() * this.HOUSE_CLICK_INSIDE_PHRASES.length)];
        this.showBubble(phrase, 2500 + Math.random() * 1000, null, true);
      }
    } else {
      // creature is outside/flying — say from character position (force — user clicked)
      if (this.HOUSE_CLICK_PHRASES.length) {
        const phrase = this.HOUSE_CLICK_PHRASES[Math.floor(Math.random() * this.HOUSE_CLICK_PHRASES.length)];
        this.showBubble(phrase, 2500 + Math.random() * 1000, null, true);
      }
    }
  }

  // clean up house timers
  _clearHouseTimers() {
    if (this._houseDelayTimer) { clearTimeout(this._houseDelayTimer); this._houseDelayTimer = null; }
    if (this._houseFlightTimer) { clearInterval(this._houseFlightTimer); this._houseFlightTimer = null; }
    if (this._housePhraseTimer) { clearTimeout(this._housePhraseTimer); this._housePhraseTimer = null; }
    if (this._houseExitTimer) { clearTimeout(this._houseExitTimer); this._houseExitTimer = null; }
    if (this._houseDismissTimer) { clearTimeout(this._houseDismissTimer); this._houseDismissTimer = null; }
  }

  // action selection and animation --------------------------------------------------
  // pick next action based on edge, jump chance, or forced actions
  // If on an edge choose edge behavior -> Random chance to jump -> Forced walk / forced think -> Pick next action from shuffled list
  setNextAction() {
    if (this.isDragging || this.isFalling || this.isInHouse || this.isJumping) return;

    this.resetAnimation();

    // platform-specific edge behavior (on side/bottom of a platform element)
    if (this.currentPlatform && this.currentEdge !== 'bottom') {
      this.platformEdgeAction();
      return;
    }

    if (['top', 'left', 'right'].includes(this.currentEdge)) {
      this.edgeAction();
      return;
    }

    const flyCooldown = performance.now() - (this._landedAt || 0) < 5000;

    if (!this.isJumping && this.isOnSurface() && !flyCooldown) {
      if (Math.random() < this.spriteConfig.JUMP_CHANCE) { // decicion on wether to jump or not
        const edges = ['top', 'left', 'right']
          .filter(e => this.spriteConfig.ALLOWANCES.includes(e));

        if (edges.length) {
          const target = edges[Math.floor(Math.random() * edges.length)]; // random coordinate on edge
          this.jumpToEdge(target);
          return;
        }
      }
      // chance to fly to another visible platform (any surface)
      if (Math.random() < 0.16) {
        this.scanPlatforms();
        const candidates = this.platforms.filter(p => {
          if (this.currentPlatform && p.el === this.currentPlatform.el) return false;
          return p.top >= this.containerHeight && p.top < window.innerHeight;
        });
        if (candidates.length) {
          const p = candidates[Math.floor(Math.random() * candidates.length)];
          // pick random target surface: top, left, right, or bottom-surface
          const edges = [undefined]; // undefined = top (default)
          if (p.height > this.containerHeight * 1.5) {
            edges.push('left', 'right');
          }
          if (p.width > this.containerWidth * 1.5) {
            edges.push('bottom-surface');
          }
          const edge = edges[Math.floor(Math.random() * edges.length)];
          this.flyToPlatform(p, edge);
          return;
        }
      }
    }

    // chance to fly to cursor (only if mouse is known, on bottom surface, visible, not in cooldown)
    if (!flyCooldown && Math.random() < 0.07 && this._mouseX >= 0 && this.currentEdge === 'bottom' && this.isVisibleToUser()) {
      this.flyToCursor();
      return;
    }

    // chance to summon house (3%, only if not active, on bottom, visible, cooldown passed)
    if (!this._houseActive && !flyCooldown && Math.random() < 0.03 && this.currentEdge === 'bottom' && this.isVisibleToUser()) {
      this.summonHouse();
      return;
    }

    // small hop in place (5% chance, only on horizontal surface)
    if (Math.random() < 0.05 && this.currentEdge === 'bottom' && this.isOnSurface() && this.isVisibleToUser()) {
      this.smallHop();
      return;
    }

    // chance to shout encouragement (only if user can see us)
    if (Math.random() < 0.14 && this.currentEdge === 'bottom' && this.isVisibleToUser()) {
      this.shout(() => {
        this.forceWalkAfter = true;
        this.setNextAction();
      });
      return;
    }

    if (this.forceWalkAfter) {
      this.forceWalkAfter = false;
      this.startForcedWalk();
      return;
    }

    if (this.forceThinkAfter) {
      this.forceThinkAfter = false;
      this.startForceThink();
      return;
    }

    this.currentActionIndex++;
    if (this.currentActionIndex >= this.actionSequence.length) {
      this.currentActionIndex = 0;
      this.actionSequence = this.shuffle([...this.spriteConfig.ORIGINAL_ACTIONS]);
    }

    this.currentAction = this.actionSequence[this.currentActionIndex];
    this.startAction(this.currentAction);
  }

  // force walk for a number of cycles
  startForcedWalk() {
    const { frames, interval } = this.spriteConfig.walk;
    const walkCycles = this.spriteConfig.forcewalk;
    this.currentAction = 'forced-walk';
    this.playAnimation(frames, interval, walkCycles, () => this.setNextAction());
  }

  // force think for a number of cycles
  startForceThink() {
    const { frames, interval, loops } = this.spriteConfig.forcethink;
    this.currentAction = 'force-think';
    this.playAnimation(frames, interval, loops, () => this.setNextAction());
  }

  // pet animation loop
  startPetAnimation() {
    this.resetAnimation();

    const petConfig = this.spriteConfig.pet;
    if (!petConfig) return;

    this.currentAction = 'pet';
    let frame = 0;
    this.img.src = petConfig.frames[0];

    this.frameTimer = setInterval(() => {
      frame = (frame + 1) % petConfig.frames.length;
      this.img.src = petConfig.frames[frame];
    }, petConfig.interval);
  }

  // stop pet animation
  stopPetAnimation() {
    this.resetAnimation();
    this.currentAction = this.wasActionBeforePet || 'sit';
    this.wasActionBeforePet = null;
    this.setNextAction();
  }

  // start a given action (handles direction, frames, loops, and special cases)
  startAction(action) {  
    if (this.isDragging || this.isFalling ) return;
    this.currentAction = action;
    this.resetAnimation();

    if (action === 'climbTop') {
      this.direction = Math.random() < 0.5 ? -1 : 1;
      this.updateImageDirection();
    }
    if (action === 'climbSide') {
      this.direction = Math.random() < 0.5 ? -1 : 1;
    }
    if (this.isJumping) {
      this.animationFrameId = requestAnimationFrame(this.animate);
      return;
    }

    const config = this.spriteConfig[action];
    if (!config) return;

    const { frames, interval, loops = 1 } = config;

    if (action === 'sit' || action === 'hangstillSide' || action === 'hangstillTop') {
      const duration = config.randomizeDuration
        ? Math.random() * (config.max - config.min) + config.min
        : interval * loops;
      this.img.src = frames[0];

      // ~35% chance to show a thought bubble while sitting (only if visible)
      if (action === 'sit' && Math.random() < 0.40 && this.isVisibleToUser()) {
        const thinkDelay = 800 + Math.random() * 1500; // show after 0.8-2.3s
        this._thinkTimer = setTimeout(() => {
          if (this.currentAction !== 'sit') return;
          const phrase = this.THINK_PHRASES[Math.floor(Math.random() * this.THINK_PHRASES.length)];
          this.showBubble(phrase, 3500 + Math.random() * 2500);
        }, thinkDelay);
      }

      this.actionCompletionTimer = setTimeout(() => {
        if (this._thinkTimer) { clearTimeout(this._thinkTimer); this._thinkTimer = null; }
        this.hideBubble();
        this.forceWalkAfter = true;
        this.setNextAction();
      }, duration);
      return;
    }

    this.playAnimation(frames, interval, loops, () => {
      if (action === 'spin') {
        this.direction *= -1;
        this.facing = this.facing === 'left' ? 'right' : 'left';
        this.updateImageDirection();
      }

      // force-actions can be set here
      if (['trip', 'spin'].includes(action)) this.forceWalkAfter = true;
      if (action === 'dance') this.forceThinkAfter = true;

      this.setNextAction();
    });
  }

  // helper to play a sequence of frames for a given number of loops
  playAnimation(frames, interval, loops, onComplete){
    let playCount=0, f=0;
    this.currentFrame=0;
    this.img.src=frames[0];
    if(this.frameTimer) clearInterval(this.frameTimer);

    this.frameTimer=setInterval(()=>{
      this.currentFrame=f=(f+1)%frames.length;
      this.img.src=frames[f];
      if(f===frames.length-1 && ++playCount>=loops){
        clearInterval(this.frameTimer);
        this.frameTimer=null;
        this.currentAction=null;
        this.actionCompletionTimer=setTimeout(onComplete,0);
      }
    }, interval);
  }

  // main animation loop --------------------------------------------------
  animate(time) {
    if (!this.lastTime) this.lastTime = time;
    const delta = (time - this.lastTime) / 1000;
    this.lastTime = time;
    // if on a different screen, skip movement but update indicator and check if should come over
    if (!this._isOnCurrentScreen) {
      this._updateIndicator();
      this._offScreenTimer = (this._offScreenTimer || 0) + delta;
      if (this._offScreenTimer > 5) { // check every 5 seconds
        this._offScreenTimer = 0;
        // chance increases with time away: starts at 5%, grows to ~60% after ~80 seconds
        const awaySeconds = (performance.now() - (this._offScreenSince || performance.now())) / 1000;
        const comeChance = Math.min(0.60, 0.05 + awaySeconds * 0.007);
        if (Math.random() < comeChance) {
          const oldHome = this._homeScreenIdx;
          this._isOnCurrentScreen = true;
          this._homeScreenIdx = this._currentScreenIdx;
          this.container.style.display = '';
          // fly in from the direction of the old screen
          this.flyIn(oldHome < this._currentScreenIdx ? 'left' : 'right');
        }
      }
      this.animationFrameId = requestAnimationFrame(this.animate);
      return;
    }
    if (this.isDragging || this.isFalling || this.isAttachedToCursor || this.isInHouse) {
        this._updateIndicator();
        this.animationFrameId = requestAnimationFrame(this.animate);
        return;
    }
    const movingActions = ['walk', 'forced-walk', 'climbTop']; // add actions with horizontal movement here
    if (movingActions.includes(this.currentAction)) {
        const dx = this.direction * this.spriteConfig.walkspeed * delta;
        this.positionX += dx;
        this.setFacingFromDelta(dx);

        // flips sprites and movement direction upon reaching a wall
        if (this.positionX <= 0) {
            this.positionX = 0;
            this.direction = 1;
            this.facing = 'right';
            this.updateImageDirection();
        } else if (this.positionX >= this.maxPos) {
            this.positionX = this.maxPos;
            this.direction = -1;
            this.facing = 'left';
            this.updateImageDirection();
        }
        // bounce at platform edges with offset (sometimes transition to side)
        const PLAT_OFFSET = 8;
        if (this.currentPlatform && this.currentEdge === 'bottom') {
          // walking on top of platform
          const centerX = this.positionX + this.containerWidth / 2;
          if (centerX <= this.currentPlatform.left + PLAT_OFFSET) {
            if (Math.random() < 0.25 && this.currentPlatform.height > this.containerHeight * 1.5) {
              this.transitionToPlatformEdge('left');
              return;
            }
            this.positionX = Math.max(0, this.currentPlatform.left + PLAT_OFFSET - this.containerWidth / 2);
            this.direction = 1;
            this.facing = 'right';
            this.updateImageDirection();
          } else if (centerX >= this.currentPlatform.right - PLAT_OFFSET) {
            if (Math.random() < 0.25 && this.currentPlatform.height > this.containerHeight * 1.5) {
              this.transitionToPlatformEdge('right');
              return;
            }
            this.positionX = Math.min(this.maxPos, this.currentPlatform.right - PLAT_OFFSET - this.containerWidth / 2);
            this.direction = -1;
            this.facing = 'left';
            this.updateImageDirection();
          }
        } else if (this.currentPlatform && this.currentEdge === 'top') {
          // moving under platform (climbTop)
          const minX = this.currentPlatform.left + PLAT_OFFSET;
          const maxX = this.currentPlatform.right - this.containerWidth - PLAT_OFFSET;
          if (this.positionX <= minX) {
            this.positionX = minX;
            if (Math.random() < 0.4) {
              this.transitionToPlatformEdge('left');
              return;
            }
            this.direction = 1;
            this.facing = 'right';
            this.updateImageDirection();
          } else if (this.positionX >= maxX) {
            this.positionX = maxX;
            if (Math.random() < 0.4) {
              this.transitionToPlatformEdge('right');
              return;
            }
            this.direction = -1;
            this.facing = 'left';
            this.updateImageDirection();
          }
        }
        // hard clamp — never go off-screen
        this.positionX = Math.max(0, Math.min(this.positionX, this.maxPos));
        this.applyEdgeOffset();
    }

    if (this.currentAction === 'climbSide') {
      this.positionY += this.direction * this.spriteConfig.walkspeed * delta;

      if (this.currentEdge === 'left') {
        this.facing = 'left';
      } else if (this.currentEdge === 'right') {
        this.facing = 'right';
      }
      this.updateImageDirection();

      let minY, maxY;
      if (this.currentPlatform) {
        minY = this.currentPlatform.top;
        maxY = this.currentPlatform.bottom - this.containerHeight;
      } else {
        minY = 0;
        maxY = window.innerHeight - this.containerHeight;
      }
      if (this.positionY <= minY) {
        this.positionY = minY;
        if (this.currentPlatform) {
          // reached top of platform — climb onto top surface
          this.transitionToPlatformEdge('top-surface');
          return;
        }
        this.direction = 1;
      } else if (this.positionY >= maxY) {
        this.positionY = maxY;
        if (this.currentPlatform) {
          // reached bottom of platform — go to underside or fall off
          if (Math.random() < 0.6) {
            this.transitionToPlatformEdge('bottom-surface');
          } else {
            this.detachFromPlatformEdge();
          }
          return;
        }
        this.direction = -1;
      }
      this.applyEdgeOffset();
    }

    // periodic self-validation: check platform still exists
    this._validateTimer = (this._validateTimer || 0) + delta;
    if (this._validateTimer > 0.5) {
      this._validateTimer = 0;
      if (this.currentPlatform && !this.isJumping && !this.isFalling) {
        this.checkPlatformValidity();
        if (!this.currentPlatform) return; // was invalidated and fell
      }
      // sanity: if stuck off-screen, recover (skip if on a platform — scroll may have moved it legitimately)
      if (!this.isJumping && !this.isFalling && this.currentEdge === 'bottom' && !this.currentPlatform && this.attachedToViewport) {
        if (this.positionX < -this.containerWidth || this.positionX > window.innerWidth + this.containerWidth ||
            this.positionY < -this.containerHeight || this.positionY > window.innerHeight + this.containerHeight) {
          this.positionX = Math.random() * this.maxPos;
          this.positionY = window.innerHeight - this.containerHeight;
          this.currentPlatform = null;
          this.attachedToViewport = true;
          this.container.style.left = `${this.positionX}px`;
          this.container.style.top = `${this.positionY}px`;
        }
      }
    }

    // update indicator dot
    this._updateIndicator();

    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  // indicator dot: shows where character is when off-screen
  _updateIndicator() {
    const onScreen = this._isOnCurrentScreen;
    const visible = this.isVisibleToUser();

    if (onScreen && visible) {
      // character is visible — hide dot, track welcome back
      if (this._indicatorVisible) {
        this._indicator.classList.remove('visible');
        this._indicatorVisible = false;
      }
      // welcome back after being off-screen for a while
      if (this._wasOffScreen) {
        this._wasOffScreen = false;
        const offDuration = performance.now() - (this._lastVisibleTime || 0);
        if (offDuration > 10000 && Math.random() < 0.30 && this.WELCOME_BACK_PHRASES.length) {
          const phrase = this.WELCOME_BACK_PHRASES[Math.floor(Math.random() * this.WELCOME_BACK_PHRASES.length)];
          this.showBubble(phrase, 3000 + Math.random() * 1500);
        }
      }
      this._lastVisibleTime = performance.now();
      return;
    }

    // character is off-screen — show dot
    this._wasOffScreen = true;
    const inset = 12;
    let dotX, dotY;

    if (!onScreen) {
      // character is on a different screen — dot at midpoint of the relevant edge
      const dir = this._homeScreenIdx < this._currentScreenIdx ? 'left' : 'right';
      if (dir === 'left') {
        dotX = inset;
        dotY = window.innerHeight / 2;
      } else {
        dotX = window.innerWidth - inset;
        dotY = window.innerHeight / 2;
      }
    } else {
      // character is on this screen but scrolled/walked out of viewport
      dotX = Math.max(inset, Math.min(this.positionX + this.containerWidth / 2, window.innerWidth - inset));
      dotY = Math.max(inset, Math.min(this.positionY + this.containerHeight / 2, window.innerHeight - inset));
      // clamp to edges
      if (this.positionX < 0) dotX = inset;
      else if (this.positionX > window.innerWidth) dotX = window.innerWidth - inset;
      if (this.positionY < 0) dotY = inset;
      else if (this.positionY > window.innerHeight) dotY = window.innerHeight - inset;
    }

    this._indicator.style.left = `${dotX - 4}px`;
    this._indicator.style.top = `${dotY - 4}px`;
    if (!this._indicatorVisible) {
      this._indicator.classList.add('visible');
      this._indicatorVisible = true;
    }
  }

  // show welcome back phrase
  _showWelcomeBack() {
    if (Math.random() < 0.70 && this.WELCOME_BACK_PHRASES.length) {
      const phrase = this.WELCOME_BACK_PHRASES[Math.floor(Math.random() * this.WELCOME_BACK_PHRASES.length)];
      this.showBubble(phrase, 3000 + Math.random() * 1500);
    }
  }
}
