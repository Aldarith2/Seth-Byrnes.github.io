(function () {
  var STORAGE_KEY = 'sb-theme';
  var SEED_KEY = 'sb-bg-seed';
  var BROKEN_KEY = 'sb-theme-toggle-broken';
  var NAV_REVEAL_ONCE_KEY = 'sb-nav-reveal-once';
  var BURNOUT_COOLDOWN_UNTIL_KEY = 'sb-burnout-cooldown-until';
  var BURNOUT_SOUND = 'assets/ui/switch-burnout.wav';
  var TOGGLE_SOUND = 'assets/ui/ToggleSwitch.wav';
  var FUSE_INSERT_SOUND = 'assets/ui/Fuse-Insert.wav';
  var REMOVE_FUSE_SOUND = 'assets/ui/RemoveFuse.wav';
  var root = document.documentElement;
  var body = document.body;

  function pickTheme() {
    try {
      if (pickBroken()) return 'dark';
      return localStorage.getItem(STORAGE_KEY) || 'dark';
    } catch (e) {
      return 'dark';
    }
  }

  function pickSeed() {
    try {
      var existing = localStorage.getItem(SEED_KEY);
      if (existing) return existing;
      var seed = String(Math.floor(Math.random() * 1000000));
      localStorage.setItem(SEED_KEY, seed);
      return seed;
    } catch (e) {
      return '12345';
    }
  }

  function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function buildBackground() {
    var seed = Number(pickSeed());
    var rand = mulberry32(seed);
    var tiles = [];
    for (var i = 1; i <= 6; i += 1) {
      tiles.push('assets/ui/Randomized Background/dark_tile_subtle_' + i + '.png');
    }
    var layers = [];
    for (var l = 0; l < 4; l += 1) {
      var chosen = tiles[Math.floor(rand() * tiles.length)];
      var x = Math.floor(rand() * 96);
      var y = Math.floor(rand() * 96);
      layers.push('url("' + chosen + '") ' + x + 'px ' + y + 'px / 192px 192px repeat');
    }
    return layers.join(',');
  }

  function pickBroken() {
    try {
      return localStorage.getItem(BROKEN_KEY) === 'true';
    } catch (e) {
      return false;
    }
  }

  function setBroken(value) {
    try {
      if (value) localStorage.setItem(BROKEN_KEY, 'true');
      else localStorage.removeItem(BROKEN_KEY);
    } catch (e) {}
  }

  function resetBrokenState() {
    setBroken(false);
  }

  function pickNavRevealPlayed() {
    try {
      return localStorage.getItem(NAV_REVEAL_ONCE_KEY) === 'true';
    } catch (e) {
      return false;
    }
  }

  function setNavRevealPlayed() {
    try {
      localStorage.setItem(NAV_REVEAL_ONCE_KEY, 'true');
    } catch (e) {}
  }

  function pickBurnoutCooldownUntil() {
    try {
      return Number(localStorage.getItem(BURNOUT_COOLDOWN_UNTIL_KEY) || '0') || 0;
    } catch (e) {
      return 0;
    }
  }

  function setBurnoutCooldownUntil(value) {
    try {
      if (value && value > 0) localStorage.setItem(BURNOUT_COOLDOWN_UNTIL_KEY, String(value));
      else localStorage.removeItem(BURNOUT_COOLDOWN_UNTIL_KEY);
    } catch (e) {}
  }

  function isIndexPage() {
    var path = (window.location.pathname || '').toLowerCase();
    return path === '/' || path.endsWith('/index.html') || path === '/index.html';
  }

  function setupSafetyResets() {
    if (isIndexPage()) {
      resetBrokenState();
    }

    document.querySelectorAll('.sidebar-linkedin-button, .hero-linkedin-button').forEach(function (link) {
      bindLinkedinFxNavigation(link);
    });
  }

  var fxLayer = null;

  function ensureFxLayer() {
    if (fxLayer && fxLayer.parentNode) return fxLayer;
    fxLayer = document.createElement('div');
    fxLayer.className = 'fx-overlay-layer';
    document.body.appendChild(fxLayer);
    return fxLayer;
  }

  function emitDust(link) {
    if (!link) return;
    var layer = ensureFxLayer();
    var rect = link.getBoundingClientRect();
    var count = 12;
    for (var i = 0; i < count; i += 1) {
      var particle = document.createElement('span');
      particle.className = 'linkedin-dust-particle';
      particle.style.left = (rect.left + rect.width * (0.16 + Math.random() * 0.68)).toFixed(2) + 'px';
      particle.style.top = (rect.top + 1 + Math.random() * 3).toFixed(2) + 'px';
      particle.style.setProperty('--dust-rise-x', ((Math.random() * 34) - 17).toFixed(2) + 'px');
      particle.style.setProperty('--dust-rise-y', (-34 - Math.random() * 26).toFixed(2) + 'px');
      particle.style.setProperty('--dust-fall-x', ((Math.random() * 26) - 13).toFixed(2) + 'px');
      particle.style.setProperty('--dust-fall-y', (16 + Math.random() * 18).toFixed(2) + 'px');
      particle.style.setProperty('--dust-delay', (Math.random() * 0.04).toFixed(3) + 's');
      particle.style.setProperty('--dust-scale', (1.02 + Math.random() * 0.48).toFixed(2));
      layer.appendChild(particle);
      window.setTimeout(function (node) {
        return function () {
          if (node && node.parentNode) node.parentNode.removeChild(node);
        };
      }(particle), 820);
    }
  }

  function emitNameDust(target) {
    if (!target) return;
    var layer = ensureFxLayer();
    var rect = target.getBoundingClientRect();
    var count = 10;
    var viewportMid = Math.max(window.innerHeight * 0.48, rect.top + rect.height + 180);
    var availableFall = Math.max(160, viewportMid - rect.top);

    for (var i = 0; i < count; i += 1) {
      var particle = document.createElement('span');
      particle.className = 'name-dust-particle';
      particle.style.left = (rect.right - 8 + Math.random() * 18).toFixed(2) + 'px';
      particle.style.top = (rect.top + rect.height * (0.18 + Math.random() * 0.34)).toFixed(2) + 'px';
      particle.style.setProperty('--dust-drift-x', (16 + Math.random() * 34).toFixed(2) + 'px');
      particle.style.setProperty('--dust-fall-y', (availableFall * (0.82 + Math.random() * 0.16)).toFixed(2) + 'px');
      particle.style.setProperty('--dust-curve-x', ((Math.random() * 18) - 9).toFixed(2) + 'px');
      particle.style.setProperty('--dust-delay', (Math.random() * 0.08).toFixed(3) + 's');
      particle.style.setProperty('--dust-scale', (0.9 + Math.random() * 0.42).toFixed(2));
      particle.style.setProperty('--dust-duration', (2.9 + Math.random() * 0.8).toFixed(2) + 's');
      layer.appendChild(particle);
      window.setTimeout(function (node) {
        return function () {
          if (node && node.parentNode) node.parentNode.removeChild(node);
        };
      }(particle), 4200);
    }
  }

  function emitBurnoutBurst(target) {
    if (!target) return;
    var layer = ensureFxLayer();
    var rect = target.getBoundingClientRect();
    var flash = document.createElement('span');
    flash.className = 'burnout-burst';
    flash.style.left = (rect.left + rect.width * 0.5).toFixed(2) + 'px';
    flash.style.top = (rect.top + rect.height * 0.5).toFixed(2) + 'px';
    layer.appendChild(flash);

    for (var i = 0; i < 14; i += 1) {
      var spark = document.createElement('span');
      var angle = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.18;
      var distance = 58 + Math.random() * 44;
      spark.className = 'burnout-spark-particle';
      spark.style.left = flash.style.left;
      spark.style.top = flash.style.top;
      spark.style.setProperty('--spark-x', (Math.cos(angle) * distance).toFixed(2) + 'px');
      spark.style.setProperty('--spark-y', (Math.sin(angle) * distance).toFixed(2) + 'px');
      spark.style.setProperty('--spark-rot', (-24 + Math.random() * 48).toFixed(2) + 'deg');
      spark.style.setProperty('--spark-delay', (Math.random() * 0.04).toFixed(3) + 's');
      layer.appendChild(spark);
      window.setTimeout(function (node) {
        return function () {
          if (node && node.parentNode) node.parentNode.removeChild(node);
        };
      }(spark), 980);
    }

    window.setTimeout(function () {
      if (flash && flash.parentNode) flash.parentNode.removeChild(flash);
    }, 920);
  }

  function emitFallingFuse(target) {
    if (!target) return;
    var layer = ensureFxLayer();
    var rect = target.getBoundingClientRect();
    var fuse = document.createElement('img');
    fuse.className = 'overlay-falling-fuse';
    fuse.src = 'assets/ui/fuse-burnedout.png';
    fuse.alt = '';
    fuse.setAttribute('aria-hidden', 'true');
    fuse.style.left = (rect.left + rect.width * 0.56).toFixed(2) + 'px';
    fuse.style.top = (rect.top + rect.height * 0.2).toFixed(2) + 'px';
    layer.appendChild(fuse);
    window.setTimeout(function () {
      if (fuse && fuse.parentNode) fuse.parentNode.removeChild(fuse);
    }, 4200);
  }

  function bindLinkedinFxNavigation(link) {
    if (!link || link.dataset.fxNavBound === 'true') return;
    link.dataset.fxNavBound = 'true';
    link.addEventListener('click', function (ev) {
      var href = link.getAttribute('href');
      if (!href) return;
      if (ev.defaultPrevented) return;
      if (ev.button !== 0) return;
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
      ev.preventDefault();
      link.classList.remove('sb-press');
      void link.offsetWidth;
      link.classList.add('sb-press');
      window.setTimeout(function () {
        link.classList.remove('sb-press');
      }, 180);
      try {
        var audio = new Audio(TOGGLE_SOUND);
        audio.preload = 'auto';
        audio.volume = 0.2;
        audio.play().catch(function () {});
      } catch (e) {}
      emitDust(link);
      resetBrokenState();
      var target = (link.getAttribute('target') || '').toLowerCase();
      window.setTimeout(function () {
        if (target === '_blank') {
          window.open(href, '_blank', 'noopener');
        } else {
          window.location.href = href;
        }
      }, 1000);
    });
  }

  function updateThemeAssets(theme) {
    var broken = pickBroken();
    document.querySelectorAll('.theme-toggle-image').forEach(function (img) {
      img.src = broken ? 'assets/ui/theme-toggle-broken.png' : (theme === 'dark' ? 'assets/ui/theme-toggle-dark.png' : 'assets/ui/theme-toggle-light.png');
      img.alt = broken ? 'Burnt out light switch' : (theme === 'dark' ? 'Dark mode' : 'Light mode');
    });
    document.querySelectorAll('.sidebar-linkedin-button img, .hero-linkedin-button img').forEach(function (img) {
      img.src = theme === 'dark' ? 'assets/ui/linkedin-button-bgDark.png' : 'assets/ui/linkedin-button-bgLight.png';
    });
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    root.style.setProperty('--bg-pattern', buildBackground());
    updateThemeAssets(theme);
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
      btn.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function setupThemeToggle() {
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      if (!btn.parentNode) return;
      var stack;
      if (btn.parentNode.classList && btn.parentNode.classList.contains('theme-toggle-stack')) {
        stack = btn.parentNode;
      } else {
        stack = document.createElement('div');
        stack.className = 'theme-toggle-stack';
        btn.parentNode.insertBefore(stack, btn);
        stack.appendChild(btn);
      }

      var panel = stack.querySelector('.fuse-panel');
      if (!panel) {
        panel = document.createElement('button');
        panel.type = 'button';
        panel.className = 'fuse-panel';
        panel.setAttribute('aria-label', 'Replace burnt fuse');
        panel.setAttribute('title', 'Replace burnt fuse');
        panel.innerHTML = '' +
          '<img class="fuse-panel-image" alt="" aria-hidden="true" src="assets/ui/Fusebox-Burntout.png">' +
          '<img class="fuse-falling-image" alt="" aria-hidden="true" src="assets/ui/fuse-burnedout.png">' +
          '<img class="fuse-replacement-image" alt="" aria-hidden="true" src="assets/ui/fuse-replacement.png">' +
          '<span class="fuse-sparks" aria-hidden="true"></span>';
        stack.appendChild(panel);
      }

      var panelImage = panel.querySelector('.fuse-panel-image');
      var fallingFuse = panel.querySelector('.fuse-falling-image');
      var replacementFuse = panel.querySelector('.fuse-replacement-image');

      var clickTimes = [];
      var repairTimeout = null;
      var hoverRepair = false;
      var isDragging = false;
      var dragPointerId = null;
      var dragDx = 0;
      var dragDy = 0;
      var replacementHome = null;

      function buildAudio(src, volume) {
        var audio = new Audio(src);
        audio.preload = 'auto';
        audio.volume = volume;
        return audio;
      }

      if (!stack._burnoutSound) stack._burnoutSound = buildAudio(BURNOUT_SOUND, 0.7);
      if (!stack._toggleSound) stack._toggleSound = buildAudio(TOGGLE_SOUND, 0.18);
      if (!stack._insertSound) stack._insertSound = buildAudio(FUSE_INSERT_SOUND, 0.58);
      if (!stack._removeFuseSound) stack._removeFuseSound = buildAudio(REMOVE_FUSE_SOUND, 0.58);

      function playAudio(audio) {
        try {
          audio.currentTime = 0;
          audio.play().catch(function () {});
        } catch (e) {}
      }

      function setRandomBurnSettings() {
        stack._burnThreshold = randomInt(6, 10);
        stack._burnWindowMs = randomInt(4, 6) * 1000;
      }

      function pulseSparks() {
        stack.classList.remove('fuse-spark');
        void stack.offsetWidth;
        stack.classList.add('fuse-spark');
        window.setTimeout(function () {
          stack.classList.remove('fuse-spark');
        }, 550);
      }

      function triggerBurnoutBurst() {
        emitBurnoutBurst(btn);
      }

      function setPanelImage(src) {
        if (panelImage) panelImage.src = src;
      }

      function resetFuseVisualState() {
        window.clearTimeout(repairTimeout);
        repairTimeout = null;
        isDragging = false;
        dragPointerId = null;
        hoverRepair = false;
        stack.classList.remove('fuse-hover-ready', 'fuse-falling', 'is-resetting', 'fuse-dragging');
        panel.disabled = false;
        panel.dataset.state = 'closed';
        stack.classList.remove('fuse-panel-open');
        setPanelImage('assets/ui/Fusebox-Burntout.png');
        if (fallingFuse) {
          fallingFuse.style.removeProperty('left');
          fallingFuse.style.removeProperty('top');
        }
        if (replacementFuse) {
          replacementFuse.style.removeProperty('left');
          replacementFuse.style.removeProperty('top');
          replacementFuse.style.removeProperty('right');
          replacementFuse.style.removeProperty('bottom');
          replacementFuse.style.removeProperty('transform');
          replacementFuse.style.removeProperty('transition');
          replacementFuse.style.removeProperty('pointer-events');
          replacementFuse.style.removeProperty('position');
          replacementFuse.style.removeProperty('z-index');
        }
        replacementHome = null;
      }

      function syncBrokenUi() {
        var isBroken = pickBroken();
        stack.classList.toggle('is-broken', isBroken);
        btn.setAttribute('aria-disabled', isBroken ? 'true' : 'false');
        btn.setAttribute('title', isBroken ? 'Lightswitch burnt out' : (root.getAttribute('data-theme') === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'));
        if (panel) {
          panel.tabIndex = 0;
          panel.setAttribute('aria-hidden', 'false');
        }
        stack.classList.toggle('fuse-panel-open', panel.dataset.state === 'opened-ready' || panel.dataset.state === 'opened-removed' || panel.dataset.state === 'opened-fixed');
        if (panel.dataset.state === 'opened-fixed') {
          setPanelImage('assets/ui/fusebox-fixed-dark.png');
        } else if (panel.dataset.state === 'opened-removed') {
          setPanelImage('assets/ui/fusebox-fuse-removed.png');
        } else {
          setPanelImage('assets/ui/Fusebox-Burntout.png');
        }
        updateThemeAssets(root.getAttribute('data-theme') || pickTheme());
      }

      function pointOverPanel(clientX, clientY) {
        var rect = panel.getBoundingClientRect();
        return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
      }

      function placeReplacementAtHome() {
        if (!replacementFuse || !panel) return;
        var stackRect = stack.getBoundingClientRect();
        var navRoot = btn.closest('.sidebar') || btn.closest('aside') || btn.closest('nav') || stack;
        var navRect = navRoot.getBoundingClientRect();
        var fuseW = replacementFuse.offsetWidth || 64;
        var fuseH = replacementFuse.offsetHeight || 64;
        var left = Math.round(navRect.right + 14);
        var top = Math.round(Math.max(8, stackRect.top - fuseH - 12));
        replacementHome = { left: left, top: top };
        replacementFuse.style.position = 'fixed';
        replacementFuse.style.left = left + 'px';
        replacementFuse.style.top = top + 'px';
        replacementFuse.style.right = 'auto';
        replacementFuse.style.bottom = 'auto';
        replacementFuse.style.transform = 'none';
        replacementFuse.style.transition = 'none';
        replacementFuse.style.pointerEvents = 'auto';
        replacementFuse.style.zIndex = '9999';
      }

      function openFusePanel() {
        if (!pickBroken()) return;
        panel.dataset.state = 'opened-ready';
        stack.classList.remove('fuse-falling', 'is-resetting', 'fuse-hover-ready', 'fuse-dragging');
        stack.classList.add('fuse-panel-open');
        setPanelImage('assets/ui/Fusebox-Burntout.png');
      }

      function playFuseRemoval() {
        if (!pickBroken()) return;
        panel.dataset.state = 'opened-removed';
        setPanelImage('assets/ui/fusebox-fuse-removed.png');
        stack.classList.remove('fuse-falling');
        emitFallingFuse(panelImage || panel || btn);
        playAudio(stack._removeFuseSound);
      }

      function finishRepair() {
        if (!pickBroken()) return;
        stack.classList.remove('fuse-falling');
        stack.classList.add('is-resetting', 'fuse-panel-open');
        panel.dataset.state = 'opened-fixed';
        setPanelImage('assets/ui/fusebox-fixed-dark.png');
        playAudio(stack._insertSound);
        repairTimeout = window.setTimeout(function () {
          setBroken(false);
          setRandomBurnSettings();
          clickTimes = [];
          stack.classList.remove('is-resetting', 'fuse-panel-open');
          panel.dataset.state = 'closed';
          syncBrokenUi();
        }, 1000);
      }

      btn.addEventListener('click', function (ev) {
        if (pickBroken()) {
          ev.preventDefault();
          ev.stopPropagation();
          pulseSparks();
          return;
        }
        playAudio(stack._toggleSound);
        var now = Date.now();
        var burnoutCooldownUntil = pickBurnoutCooldownUntil();
        if (burnoutCooldownUntil > now) {
          clickTimes = [];
          var cooldownTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
          applyTheme(cooldownTheme);
          return;
        }
        clickTimes = clickTimes.filter(function (time) { return now - time < stack._burnWindowMs; });
        clickTimes.push(now);
        if (clickTimes.length >= stack._burnThreshold) {
          ev.preventDefault();
          ev.stopPropagation();
          clickTimes = [];
          setBurnoutCooldownUntil(now + (randomInt(60, 100) * 1000));
          setBroken(true);
          applyTheme('dark');
          panel.dataset.state = 'closed';
          setPanelImage('assets/ui/Fusebox-Burntout.png');
          syncBrokenUi();
          playAudio(stack._burnoutSound);
          pulseSparks();
          triggerBurnoutBurst();
          window.setTimeout(function () {
            if (!pickBroken()) return;
            playAudio(stack._insertSound);
            openFusePanel();
          }, 2000);
          return;
        }
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });

      panel.addEventListener('click', function (ev) {
        if (!pickBroken()) return;
        ev.preventDefault();
        if (panel.dataset.state === 'opened-ready') {
          playFuseRemoval();
          return;
        }
        if (panel.dataset.state === 'opened-removed') {
          finishRepair();
        }
      });

      resetFuseVisualState();
      setRandomBurnSettings();
      syncBrokenUi();
    });
  }

  function setupDividerDecor() {
    document.querySelectorAll('.section h2').forEach(function (heading) {
      var section = heading.closest('.section');
      if (!section || section.querySelector('.section-divider')) return;
      var divider = document.createElement('div');
      divider.className = 'section-divider';
      divider.innerHTML = '<span class="divider-endcap divider-endcap-left" aria-hidden="true"></span><span class="divider-bar" aria-hidden="true"></span><span class="divider-endcap divider-endcap-right" aria-hidden="true"></span>';
      section.insertBefore(divider, heading);
    });
  }

  function setupLightbox() {
    var galleries = Array.from(document.querySelectorAll('.gallery'));
    if (!galleries.length) return;
    var overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.innerHTML = '<button class="lightbox-close" aria-label="Close image viewer">×</button><button class="lightbox-prev" aria-label="Previous image">‹</button><div class="lightbox-stage"><img class="lightbox-image" alt=""><div class="lightbox-caption"></div></div><button class="lightbox-next" aria-label="Next image">›</button>';
    document.body.appendChild(overlay);
    var imgEl = overlay.querySelector('.lightbox-image');
    var captionEl = overlay.querySelector('.lightbox-caption');
    var currentGallery = [];
    var currentIndex = 0;
    function openLightbox(items, index) { currentGallery = items; currentIndex = index; updateLightbox(); overlay.classList.add('open'); document.body.classList.add('lightbox-open'); }
    function closeLightbox() { overlay.classList.remove('open'); document.body.classList.remove('lightbox-open'); }
    function updateLightbox() { var item = currentGallery[currentIndex]; if (!item) return; imgEl.src = item.src; imgEl.alt = item.alt || ''; captionEl.textContent = item.caption || ''; }
    function move(step) { if (!currentGallery.length) return; currentIndex = (currentIndex + step + currentGallery.length) % currentGallery.length; updateLightbox(); }
    galleries.forEach(function (gallery) {
      var images = Array.from(gallery.querySelectorAll('.gallery-item img'));
      var items = images.map(function (img) {
        var fig = img.closest('.gallery-item');
        return { src: img.getAttribute('src'), alt: img.getAttribute('alt') || '', caption: fig && fig.getAttribute('data-caption') ? fig.getAttribute('data-caption') : (img.getAttribute('alt') || '') };
      });
      images.forEach(function (img, index) {
        img.setAttribute('tabindex', '0');
        img.setAttribute('role', 'button');
        img.setAttribute('aria-label', 'Open image viewer');
        img.addEventListener('click', function () { openLightbox(items, index); });
        img.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openLightbox(items, index); } });
      });
    });
    overlay.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    overlay.querySelector('.lightbox-prev').addEventListener('click', function () { move(-1); });
    overlay.querySelector('.lightbox-next').addEventListener('click', function () { move(1); });
    overlay.addEventListener('click', function (ev) { if (ev.target === overlay) closeLightbox(); });
    document.addEventListener('keydown', function (ev) { if (!overlay.classList.contains('open')) return; if (ev.key === 'Escape') closeLightbox(); if (ev.key === 'ArrowLeft') move(-1); if (ev.key === 'ArrowRight') move(1); });
  }


  function setupVideoPlayback() {
    document.querySelectorAll('.video-frame video, video').forEach(function (video) {
      if (video.dataset.sbVideoBound === 'true') return;
      video.dataset.sbVideoBound = 'true';
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;

      window.setTimeout(function () {
        try {
          video.muted = true;
          video.defaultMuted = true;
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
          }
        } catch (e) {}
      }, 3000);

      video.addEventListener('click', function (ev) {
        if (!video.paused && video.muted) {
          ev.preventDefault();
          ev.stopPropagation();
          if (typeof ev.stopImmediatePropagation === 'function') ev.stopImmediatePropagation();
          video.muted = false;
          video.defaultMuted = false;
        }
      }, true);
    });
  }



  function userPrefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function setupRevealAnimations() {
    var playNavReveal = !pickNavRevealPlayed();
    var groups = [
      { selector: '.site-name, .site-role, .site-location, .sidebar-linkedin-button, .theme-toggle-stack', mode: 'left', baseDelay: 0.02, step: 0.05, immediate: true, once: true },
      { selector: '.sidebar-nav a', mode: 'left', baseDelay: 0.08, step: 0.035, immediate: true, once: true },
      { selector: '.page-header, .project-hero, .resume-item, .media-card, .video-frame, .info-grid > div, .gallery-item, .section', mode: 'up', baseDelay: 0, step: 0.045, immediate: false, once: false }
    ];

    var allTargets = [];

    groups.forEach(function (group) {
      var nodes = Array.from(document.querySelectorAll(group.selector));
      nodes.forEach(function (node, index) {
        if (!node || node.dataset.sbRevealBound === 'true') return;
        node.dataset.sbRevealBound = 'true';

        if (group.once && !playNavReveal) {
          node.classList.add('is-visible');
          return;
        }

        node.classList.add(group.mode === 'left' ? 'sb-reveal-left' : (group.mode === 'right' ? 'sb-reveal-right' : 'sb-reveal-up'));
        node.style.setProperty('--sb-reveal-delay', (group.baseDelay + (index * group.step)).toFixed(3) + 's');
        allTargets.push({ node: node, immediate: !!group.immediate });
      });
    });

    if (playNavReveal && !userPrefersReducedMotion()) {
      var siteName = document.querySelector('.site-name');
      if (siteName) {
        window.setTimeout(function () {
          emitNameDust(siteName);
        }, 700);
      }
    }

    if (playNavReveal) setNavRevealPlayed();

    if (!allTargets.length) return;

    if (userPrefersReducedMotion() || !('IntersectionObserver' in window)) {
      allTargets.forEach(function (item) { item.node.classList.add('is-visible'); });
      return;
    }

    window.requestAnimationFrame(function () {
      allTargets.forEach(function (item) {
        if (item.immediate) item.node.classList.add('is-visible');
      });
    });

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, {
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.12
    });

    allTargets.forEach(function (item) {
      if (item.immediate) return;
      observer.observe(item.node);
    });
  }

  function setupButtonMotion() {
    var selector = '.button, .sidebar-nav a, .sidebar-linkedin-button, .hero-linkedin-button, .theme-toggle, .lightbox-close, .lightbox-prev, .lightbox-next';

    document.querySelectorAll(selector).forEach(function (node) {
      if (!node || node.dataset.sbPressBound === 'true') return;
      node.dataset.sbPressBound = 'true';

      function pulse() {
        node.classList.remove('sb-press');
        void node.offsetWidth;
        node.classList.add('sb-press');
        window.setTimeout(function () {
          node.classList.remove('sb-press');
        }, 180);
      }

      node.addEventListener('pointerdown', function (ev) {
        if (ev.pointerType === 'mouse' && ev.button !== 0) return;
        pulse();
      });

      node.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') {
          pulse();
        }
      });
    });
  }

  function relocateLocationLine() {
    var role = document.querySelector('.site-role');
    if (!role) return;
    var metaParagraphs = Array.from(document.querySelectorAll('.sidebar-meta p'));
    var locationP = metaParagraphs.find(function (p) {
      return (p.textContent || '').trim() === 'Milwaukee, Wisconsin';
    });
    if (!locationP) return;

    var existing = document.querySelector('.site-location');
    if (existing) {
      existing.textContent = 'Milwaukee, Wisconsin';
      locationP.remove();
      return;
    }

    var location = document.createElement('div');
    location.className = 'site-location';
    location.textContent = 'Milwaukee, Wisconsin';
    role.insertAdjacentElement('afterend', location);
    locationP.remove();
  }


  function init() {
    setupSafetyResets();
    relocateLocationLine();
    setupDividerDecor();
    applyTheme(pickTheme());
    setupThemeToggle();
    setupLightbox();
    setupVideoPlayback();
    setupRevealAnimations();
    setupButtonMotion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
