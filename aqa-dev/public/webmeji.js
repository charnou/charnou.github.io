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

    // create img element for first frame of sprite
    this.img = document.createElement('img');
    this.img.id = containerId;
    this.img.src = spriteConfig.walk.frames[0]; // default to first walk frame
    this.container.appendChild(this.img);

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

    // spawn at random bottom position
    this.positionX = Math.random() * (window.innerWidth - this.containerWidth);
    this.positionY = window.innerHeight - this.containerHeight;

    this.container.style.left = `${this.positionX}px`;
    this.container.style.top = `${this.positionY}px`;

    this.maxPos = window.innerWidth - this.containerWidth; // max horizontal position
    this.forceWalkAfter = false; // flag for forcing walk after some actions
    this.forceThinkAfter = false;

    // platform detection
    this.platforms = [];
    this.currentPlatform = null;

    this.container.style.left = `${this.positionX}px`;
    this.container.style.top = 'auto'; // reset top for CSS positioning
    this.baseBottom = 0; // reference for bottom alignment

    this.updateImageDirection(); // set initial facing

    // start first action
    this.currentAction = this.actionSequence[this.currentActionIndex];
    this.startAction(this.currentAction);

    // bind animate to this object
    this.animate = this.animate.bind(this);
    this.animationFrameId = requestAnimationFrame(this.animate);

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
      if (!this.attachedToViewport && !this.isDragging && !this.isJumping &&
          (!this.isFalling || this.tripAfterFallActive)) {
        this.positionY -= delta;
        this.container.style.top = `${this.positionY}px`;
        if (this.currentPlatform && this.currentPlatform.el) {
          const r = this.currentPlatform.el.getBoundingClientRect();
          this.currentPlatform = { el: this.currentPlatform.el, left: r.left, right: r.right, top: r.top, width: r.width };
        }
      }
    }, { passive: true });

    // tab change: fly in from the side when user switches tabs
    this.activeTabButtonIndex = this.getActiveTabButtonIndex();
    window.addEventListener('hashchange', () => {
      const oldIdx = this.activeTabButtonIndex;
      // wait for React to re-render new tab content
      requestAnimationFrame(() => { requestAnimationFrame(() => {
        const newIdx = this.getActiveTabButtonIndex();
        this.activeTabButtonIndex = newIdx;
        if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return;
        if (this.attachedToViewport) return; // on bottom/edge — stays with user
        // character was on content that's now gone — fly in from the side
        if (this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
          this.animationFrameId = null;
        }
        this.resetAnimation();
        this.isFalling = false;
        this.isJumping = false;
        this.tripAfterFallActive = false;
        this.isPetting = false;
        this.currentPlatform = null;
        this.flyIn(oldIdx < newIdx ? 'left' : 'right');
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

  // stop current animation timers
  resetAnimation() {
    clearInterval(this.frameTimer);
    clearTimeout(this.actionCompletionTimer);
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
                      this.currentEdge === 'right' ? this.containerHeight/2 : 0;
      const offsetY = this.currentEdge === 'top' ? -this.containerHeight/2 : 0;

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
            endX = Math.random() * (window.innerWidth - this.containerWidth); // random horizontal
            break;
        case 'left':
            endX = 0;
            endY = Math.random() * (window.innerHeight - this.containerHeight); // random vertical
            break;
        case 'right':
            endX = window.innerWidth - this.containerWidth;
            endY = Math.random() * (window.innerHeight - this.containerHeight); // random vertical
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

    // animation loop for jump movement
    const step = (time) => {
        if (this.isDragging) {
            clearInterval(frameTimer); 
            this.isJumping = false;    
            return;                    
        }

        const elapsed = (time - startTime) / 1000;
        const t = Math.min(elapsed / duration, 1); // progress 0-1

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
            this.startEdgeIdle(); // start idle after landing
        }
    };
    requestAnimationFrame(step);
  }

  // fly to a target platform (uses falling animation, can go up or down)
  flyToPlatform(target) {
    if (this.isFalling || this.isPetting || this.isDragging || this.isJumping) return;

    this.isJumping = true;
    this.currentPlatform = null;
    this.attachedToViewport = false;
    this.resetAnimation();

    const scrollYAtStart = window.scrollY;
    const cfg = this.spriteConfig.falling;
    if (!cfg) { this.isJumping = false; return; }

    const startX = this.positionX;
    const startY = this.positionY;
    const landX = target.left + Math.random() * Math.max(0, target.width - this.containerWidth);
    const endX = Math.max(target.left, Math.min(landX, target.right - this.containerWidth));
    const endY = target.top - this.containerHeight;

    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.hypot(dx, dy);
    if (distance === 0) { this.isJumping = false; return; }

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
        this.positionY = Math.max(0, r.top - this.containerHeight);
        this.currentPlatform = { el: target.el, left: r.left, right: r.right, top: r.top, width: r.width };
        this.container.style.top = `${this.positionY}px`;
        this.attachedToViewport = false;
        this.lastScrollY = window.scrollY;
        this.currentEdge = 'bottom';
        this.updateEdgeClass();
        this.resetAnimation();
        this.lastTime = performance.now();
        this.setNextAction();
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

  // user interactions ---------------------------------------------------
  // petting animation when hovering
  enablePetInteraction() {
    if(!this.spriteConfig.ALLOWANCES?.includes('pet') || !this.spriteConfig.ALLOWANCES?.includes('bottom')) return;

    this.container.addEventListener('mouseenter',()=> {
        if(this.isFalling||this.isPointerDown||this.isPetting||this.isJumping||this.currentEdge!=='bottom') return;
        this.isPetting=true;
        this.wasActionBeforePet=this.currentAction;
        this.startPetAnimation();
    });
    this.container.addEventListener('mouseleave',()=> {
        if(this.isFalling||this.isPointerDown||this.isJumping||this.currentEdge==='top') return;
        this.isPetting=false;
        this.stopPetAnimation();
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

    this.currentAction = 'drag';
    this.img.style.transform = this.facing === 'left' ? 'scaleX(1)' : 'scaleX(-1)';

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
      return { el, left: r.left, right: r.right, top: r.top, width: r.width };
    }).filter(p => p.width > 0)
      .sort((a, b) => a.top - b.top);
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
    const r = el.getBoundingClientRect();
    const centerX = this.positionX + this.containerWidth / 2;
    if (r.width > 0 && centerX >= r.left && centerX <= r.right &&
        r.top > 0 && r.top < window.innerHeight) {
      this.positionY = r.top - this.containerHeight;
      this.container.style.top = `${this.positionY}px`;
      this.currentPlatform = { el, left: r.left, right: r.right, top: r.top, width: r.width };
    } else {
      this.currentPlatform = null;
      this.fallToBottom();
    }
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
  flyIn(fromSide) {
    if (this.isDragging) return;

    this.isJumping = true;
    this.attachedToViewport = false;
    this.currentPlatform = null;
    this.resetAnimation();

    const scrollYAtStart = window.scrollY;
    const cfg = this.spriteConfig.falling;
    if (!cfg) { this.isJumping = false; return; }

    // find landing target on the new tab
    this.scanPlatforms();
    const visible = this.platforms.filter(p =>
      p.top >= this.containerHeight && p.top < window.innerHeight
    );

    let endX, endY, landingPlatform = null;

    if (visible.length && Math.random() < 0.6) {
      landingPlatform = visible[Math.floor(Math.random() * visible.length)];
      const landX = landingPlatform.left + Math.random() * Math.max(0, landingPlatform.width - this.containerWidth);
      endX = Math.max(landingPlatform.left, Math.min(landX, landingPlatform.right - this.containerWidth));
      endY = Math.max(0, landingPlatform.top - this.containerHeight);
    } else {
      endX = Math.random() * (window.innerWidth - this.containerWidth);
      endY = window.innerHeight - this.containerHeight;
    }

    // start off-screen
    const startX = fromSide === 'left' ? -this.containerWidth * 2 : window.innerWidth + this.containerWidth;
    const startY = endY;
    this.positionX = startX;
    this.positionY = startY;
    this.container.style.left = `${startX}px`;
    this.container.style.top = `${startY}px`;

    this.facing = fromSide === 'left' ? 'right' : 'left';
    this.updateImageDirection();

    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.hypot(dx, dy);
    if (distance === 0) { this.isJumping = false; return; }

    const duration = distance / this.spriteConfig.jumpspeed;
    const startTime = performance.now();

    let frameIndex = 0;
    this.img.src = cfg.frames[0];
    const frameTimer = setInterval(() => {
      frameIndex = (frameIndex + 1) % cfg.frames.length;
      this.img.src = cfg.frames[frameIndex];
    }, cfg.interval);

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

      this.container.style.left = `${this.positionX}px`;
      this.container.style.top = `${this.positionY}px`;

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        clearInterval(frameTimer);
        this.isJumping = false;

        if (landingPlatform && landingPlatform.el && landingPlatform.el.isConnected) {
          const r = landingPlatform.el.getBoundingClientRect();
          this.positionY = Math.max(0, r.top - this.containerHeight);
          this.currentPlatform = { el: landingPlatform.el, left: r.left, right: r.right, top: r.top, width: r.width };
          this.attachedToViewport = false;
        } else {
          this.positionY = window.innerHeight - this.containerHeight;
          this.attachedToViewport = true;
        }
        this.container.style.top = `${this.positionY}px`;
        this.lastScrollY = window.scrollY;
        this.currentEdge = 'bottom';
        this.updateEdgeClass();
        this.resetAnimation();
        this.lastTime = performance.now();
        this.setNextAction();
        this.animationFrameId = requestAnimationFrame(this.animate);
      }
    };
    requestAnimationFrame(step);
  }

  // falling and recovery -------------------------------------------------
  // animate falling to bottom
  fallToBottom(fallSpeed=this.spriteConfig.fallspeed){
    if(this.isFalling) return;
    this.tripAfterFallActive = false;
    this.isFalling = true;
    this.currentEdge='bottom';
    this.currentPlatform = null;
    this.attachedToViewport = false;
    this.updateEdgeClass();
    this.resetAnimation();

    const scrollYAtStart = window.scrollY;
    const cfg=this.spriteConfig.falling; if(!cfg) return;

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
        this.currentPlatform = { el: landingPlatform.el, left: r.left, right: r.right, top: r.top, width: r.width };
        this.attachedToViewport = false;
      } else {
        this.positionY = window.innerHeight - this.containerHeight;
        this.attachedToViewport = true;
      }
      this.container.style.top=`${this.positionY}px`;
      this.lastScrollY = window.scrollY;
      return this.playTripAfterFall();
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
          requestAnimationFrame(step);
      } else {
          clearInterval(this.frameTimer);
          this.frameTimer = null;
          if (landingPlatform && landingPlatform.el) {
            const r = landingPlatform.el.getBoundingClientRect();
            this.positionY = r.top - this.containerHeight;
            this.currentPlatform = { el: landingPlatform.el, left: r.left, right: r.right, top: r.top, width: r.width };
            this.attachedToViewport = false;
          } else {
            this.positionY = window.innerHeight - this.containerHeight;
            this.attachedToViewport = true;
          }
          this.container.style.top = `${this.positionY}px`;
          this.lastScrollY = window.scrollY;
          this.playTripAfterFall();
      }
    };
    requestAnimationFrame(step);
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

    const frameTimer = setInterval(() => {
        frame++;

        if (frame >= totalFrames) {
            clearInterval(frameTimer);
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
    // refresh position from DOM if on a platform (scroll may have shifted it during trip)
    if (this.currentPlatform && this.currentPlatform.el) {
      const r = this.currentPlatform.el.getBoundingClientRect();
      this.positionY = r.top - this.containerHeight;
      this.currentPlatform = { el: this.currentPlatform.el, left: r.left, right: r.right, top: r.top, width: r.width };
      this.container.style.top = `${this.positionY}px`;
      this.attachedToViewport = false;
    } else {
      this.attachedToViewport = true;
    }
    this.lastScrollY = window.scrollY;
    this.resetAnimation();
    this.lastTime = performance.now();
    this.currentAction = 'sit';
    this.setNextAction();
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  // action selection and animation --------------------------------------------------
  // pick next action based on edge, jump chance, or forced actions
  // If on an edge choose edge behavior -> Random chance to jump -> Forced walk / forced think -> Pick next action from shuffled list
  setNextAction() {
    if (this.isDragging || this.isFalling ) return;

    this.resetAnimation();

    if (['top', 'left', 'right'].includes(this.currentEdge)) {
        this.edgeAction();
        return;
    }

    if (!this.isJumping && this.isOnSurface()) {
      if (Math.random() < this.spriteConfig.JUMP_CHANCE) { // decicion on wether to jump or not
        const edges = ['top', 'left', 'right']
          .filter(e => this.spriteConfig.ALLOWANCES.includes(e));

        if (edges.length) {
          const target = edges[Math.floor(Math.random() * edges.length)]; // random coordinate on edge
          this.jumpToEdge(target);
          return;
        }
      }
      // chance to fly to another visible platform
      if (Math.random() < 0.12) {
        this.scanPlatforms();
        const candidates = this.platforms.filter(p => {
          if (this.currentPlatform && p.el === this.currentPlatform.el) return false;
          return p.top >= this.containerHeight && p.top < window.innerHeight;
        });
        if (candidates.length) {
          this.flyToPlatform(candidates[Math.floor(Math.random() * candidates.length)]);
          return;
        }
      }
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
      this.actionCompletionTimer = setTimeout(() => {
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
    if (this.isDragging || this.isFalling) {
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
        // bounce at platform edges
        if (this.currentPlatform) {
          const centerX = this.positionX + this.containerWidth / 2;
          if (centerX <= this.currentPlatform.left) {
            this.positionX = this.currentPlatform.left - this.containerWidth / 2;
            this.direction = 1;
            this.facing = 'right';
            this.updateImageDirection();
          } else if (centerX >= this.currentPlatform.right) {
            this.positionX = this.currentPlatform.right - this.containerWidth / 2;
            this.direction = -1;
            this.facing = 'left';
            this.updateImageDirection();
          }
        }
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

      // flips sprites and movement direction upon reaching a wall
      const maxY = window.innerHeight - this.containerHeight;
      if (this.positionY <= 0) {
        this.positionY = 0;
        this.direction = 1;
      } else if (this.positionY >= maxY) {
        this.positionY = maxY;
        this.direction = -1;
      }
      this.applyEdgeOffset();
    }
    this.animationFrameId = requestAnimationFrame(this.animate);
  }
}
