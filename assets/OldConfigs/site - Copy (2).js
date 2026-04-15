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
        if (window.__wickleLightMisclickBoost && window.__wickleLightMisclickBoost.active && window.__wickleLightMisclickBoost.until > now) {
          clickTimes.push(now - 1);
          clickTimes.push(now - 2);
          if (Math.random() < 0.11) {
            clickTimes.push(now - 3);
            clickTimes.push(now - 4);
            clickTimes.push(now - 5);
            clickTimes.push(now - 6);
          }
          window.__wickleLightMisclickBoost.active = false;
        }
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

  function setupIndexAvatarSecret() {
    if (!isIndexPage()) return;
    var avatar = document.querySelector('.profile-photo');
    if (!avatar || avatar.dataset.sbSecretBound === 'true') return;
    avatar.dataset.sbSecretBound = 'true';
    avatar.addEventListener('click', function () {
      var host = avatar.closest('.intro-grid') || avatar.parentNode || document.body;
      var existing = host.querySelector('.avatar-secret-message');
      if (existing) existing.remove();
      var message = document.createElement('div');
      message.className = 'avatar-secret-message';
      message.textContent = "You've found a secret message! Congratulations!";
      host.appendChild(message);
      window.requestAnimationFrame(function () {
        message.classList.add('is-visible');
      });
      window.setTimeout(function () {
        message.classList.remove('is-visible');
      }, 1700);
      window.setTimeout(function () {
        if (message && message.parentNode) message.parentNode.removeChild(message);
      }, 2200);
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



  

  function getWicklePageKey() {
    var path = ((window.location.pathname || '').split('/').pop() || 'index.html').toLowerCase();
    return path || 'index.html';
  }

  function getWickleHeadingContext(heading) {
    var text = (heading || '').trim().toLowerCase();
    if (!text) return { normal: [], affirming: [], weird: [], factoids: [], trailer: [], trailerFactoids: [] };

    if (text.indexOf('trailer') !== -1) {
      return {
        normal: [
          'Wickle watches the moving picture from the seam. Safer there.',
          'Do not tell the trailer Wickle is here. Wickle is being subtle.'
        ],
        affirming: [
          'The Pagekeeper lets the work move for itself here. Good instinct.',
          'The Maker knew motion would sell this better than a wall of boasting.'
        ],
        weird: [
          'The little lights in this trailer taste electric.',
          'Wickle likes when the moving picture notices him back.'
        ],
        factoids: [
          'This is the fast proof section. Wickle respects fast proof.',
          'A good trailer says what the page does before the eyes get tired.'
        ],
        trailer: [
          'Wickle waits for the good cuts.',
          'Wickle likes the moving bits. They make the divider purr.'
        ],
        trailerFactoids: [
          'The Pagekeeper put playable truth here, not just shiny noise.',
          'Wickle approves when the trailer and the page tell the same story.'
        ]
      };
    }

    if (text.indexOf('design work samples') !== -1) {
      return {
        normal: [
          'Wickle likes pages with receipts.',
          'These sample bits smell like actual production.'
        ],
        affirming: [
          'The Pagekeeper leaves tracks builders can follow.',
          'The Maker shows the work under the polish. Wickle likes that.'
        ],
        weird: [
          'The paper bits whisper softer than the shiny bits.',
          'These samples keep their warm little secrets folded inward.'
        ],
        factoids: [
          'Wickle likes when the proof lives next to the claims.',
          'This is where the Pagekeeper shows the bones, not just the feathers.'
        ],
        trailer: [],
        trailerFactoids: []
      };
    }

    if (text.indexOf('responsibilities') !== -1) {
      return {
        normal: [
          'Wickle likes when ownership is named plainly.',
          'This is the bit where the claws get counted.'
        ],
        affirming: [
          'The Pagekeeper sounds like a lead here, not a passenger.',
          'The Maker follows the feature clear through implementation.'
        ],
        weird: [
          'Responsibility sections weigh more than they look.',
          'This divider goes very still around ownership words.'
        ],
        factoids: [
          'Wickle trusts pages that say who held the sharp end.',
          'This part tells Wickle whether the Maker merely visited or actually built.'
        ],
        trailer: [],
        trailerFactoids: []
      };
    }

    if (text.indexOf('project information') !== -1) {
      return {
        normal: [
          'Wickle appreciates clean framing.',
          'This part is easy for a tiny inspector to parse.'
        ],
        affirming: [
          'The Pagekeeper saves visitors time by setting the table first.',
          'The Maker frames the work before asking anyone to admire it.'
        ],
        weird: [
          'Facts stack themselves neatly here after dark.',
          'This section clicks into place all by itself at night.'
        ],
        factoids: [
          'Years, studio, role. Wickle likes a page that says what it is.',
          'This is the quick compass bit. Good. Wickle dislikes getting lost.'
        ],
        trailer: [],
        trailerFactoids: []
      };
    }

    if (text.indexOf('professional summary') !== -1 || text.indexOf('experience snapshot') !== -1 || text.indexOf('position summary') !== -1) {
      return {
        normal: [
          'Wickle is checking the through-line.',
          'This is the quick bones part.'
        ],
        affirming: [
          'The Pagekeeper reads like someone who can own work and steer creatures.',
          'The Maker sounds steady here. Wickle approves.'
        ],
        weird: [
          'Summary sections get louder on the second visit.',
          'This part keeps tiny echoes between the lines.'
        ],
        factoids: [
          'Wickle likes when the quick version still says something true.',
          'A good summary points at the real labor instead of fog. This one does.'
        ],
        trailer: [],
        trailerFactoids: []
      };
    }

    if (text.indexOf('primary strengths') !== -1 || text.indexOf('tools') !== -1) {
      return {
        normal: [
          'Wickle is counting the useful claws.',
          'Plenty of sharp little tools in this bit.'
        ],
        affirming: [
          'The Pagekeeper stays readable across disciplines.',
          'The Maker keeps range without turning muddy. Hard trick.'
        ],
        weird: [
          'Tool lists make tiny tidy noises.',
          'This section has the straightest corners in the whole house.'
        ],
        factoids: [
          'Wickle likes when a page says what hands can actually do.',
          'Useful range is nicer than decorative range. The Pagekeeper knows that.'
        ],
        trailer: [],
        trailerFactoids: []
      };
    }

    if (text.indexOf('welcome') !== -1 || text.indexOf('how to use this site') !== -1 || text.indexOf('contact') !== -1) {
      return {
        normal: [
          'Wickle likes the welcoming bits.',
          'This is where polite gremlins would begin.'
        ],
        affirming: [
          'The Pagekeeper knows how to greet without wasting the visitor.',
          'The Maker keeps the first steps clear. Good manners.'
        ],
        weird: [
          'Greeting sections remember who came through first.',
          'This part stays awake longer than the others.'
        ],
        factoids: [
          'Wickle likes when the front door actually works.',
          'The first page tells Wickle whether the house has a keeper. This one does.'
        ],
        trailer: [],
        trailerFactoids: []
      };
    }

    if (text.indexOf('gallery') !== -1) {
      return {
        normal: [
          'Wickle likes a page that shows the goods.',
          'Pictures help tiny brains. Wickle has one.'
        ],
        affirming: [
          'The Pagekeeper knows that proof should look back at the visitor.',
          'The Maker put the visual receipts where they belong.'
        ],
        weird: [
          'Some screenshots keep moving after Wickle blinks.',
          'The gallery bits hum in little rectangles.'
        ],
        factoids: [
          'Wickle checks whether the page can support its own claims. Pictures help.',
          'Good galleries do real labor. This one is not just wallpaper.'
        ],
        trailer: [],
        trailerFactoids: []
      };
    }

    return { normal: [], affirming: [], weird: [], factoids: [], trailer: [], trailerFactoids: [] };
  }

  function getWicklePageConfig() {
    var key = getWicklePageKey();
    var defaults = {
      accessory: 'assets/ui/wickle/wickle-acc-home.png',
      accessoryClass: 'acc-band',
      toneClass: 'tone-default',
      sideBias: 'either',
      preferredHeadings: [],
      requiredIdle: 3200,
      firstVisitDelay: [3600, 5200],
      repeatVisitDelay: [11000, 19000],
      idleVisibleRange: [4300, 6800],
      clickedVisibleRange: [3200, 5200],
      autoTrailerCommentChance: 0.72,
      normal: [
        'Oh. Wickle has been discovered again.',
        'Just a small inspection. Nothing to worry your bones.',
        'This divider is surprisingly comfortable.',
        'Wickle likes this corner.',
        'The Maker builds tidy hiding places.',
        'Only a little peeking.'
      ],
      affirming: [
        'The Pagekeeper knows how things should look, feel, and play.',
        'The Maker leaves notes artists and builders can both follow.',
        'Wickle trusts a Pagekeeper who finishes the thing, not just the pitch.',
        'The Maker builds systems that read clearly.',
        'The Pagekeeper keeps the work sturdy.',
        'Wickle says the Quiet Maker knows where the fun lives.'
      ],
      weird: [
        'Wickle was here before the page opened.',
        'The quiet bits blink when the Maker is near.',
        'Wickle sleeps in the seam under this divider.',
        'Some corners hum the Pagekeeper\'s name.',
        'This place remembers careful hands.',
        'Sometimes Wickle hears the site breathe.'
      ],
      clicked: [
        'Ah. Gentle click. Good manners.',
        'Easy, easy. Little bones.',
        'Wickle knew this peek was safe.',
        'Wickle was not stealing. Wickle was borrowing the air.'
      ],
      factoids: [
        'Wickle likes pages where the proof sits right next to the claim.',
        'The Pagekeeper keeps the labor legible. That matters.',
        'Wickle can tell when the Maker actually carried the feature instead of just naming it.'
      ],
      trailer: [
        'Wickle watches the trailers from back here. Secretly. Professionally.',
        'Do not mind Wickle. Wickle is reviewing the moving picture.'
      ],
      trailerFactoids: [
        'A good trailer shows the loop cleanly. The Pagekeeper usually knows when it does.',
        'Wickle likes when the moving picture supports the page instead of arguing with it.'
      ]
    };

    var byPage = {
      'index.html': {
        accessory: 'assets/ui/wickle/wickle-acc-home.png',
        accessoryClass: 'acc-band',
        toneClass: 'tone-home',
        sideBias: 'left',
        preferredHeadings: ['welcome', 'primary strengths'],
        normal: [
          'Wickle likes the light switch, but Wickle does not trust it.',
          'This house feels lived in.',
          'House-goblin inspection complete.'
        ],
        affirming: [
          'The Pagekeeper made this landing place feel authored, not stitched together.',
          'The Maker set the tone fast. Good trick.'
        ],
        weird: [
          'The lights change the grain inside the page.',
          'This room knows when someone arrives quietly.'
        ],
        clicked: [
          'You found the house goblin.',
          'Wickle keeps watch near the brighter rooms.'
        ],
        factoids: [
          'This front page says the Pagekeeper ships across VR, PC, strategy, simulation, shooters, UI, and multiplayer maps.',
          'Wickle likes that the house opens with range and then points straight at the proof.'
        ]
      },
      'the-deep.html': {
        accessory: 'assets/ui/wickle/wickle-acc-deep.png',
        accessoryClass: 'acc-goggles',
        toneClass: 'tone-deep',
        sideBias: 'right',
        preferredHeadings: ['design work samples', 'trailer', 'gallery'],
        normal: [
          'Too wet. Still curious.',
          'Wickle prefers shallower mysteries.',
          'This page sounds deep even when it is silent.'
        ],
        affirming: [
          'The Pagekeeper can rework a live feature without dropping the fantasy.',
          'The Maker built a loop here with good teeth: explore, solve, improve, move.'
        ],
        weird: [
          'There is another wetter version of this page somewhere below it.',
          'The dark water bits always creep closer after midnight.'
        ],
        clicked: [
          'Wickle does not go in. Wickle monitors the edges.',
          'Wickle respects the water from up here.'
        ],
        factoids: [
          'This one shipped in 2025 for Dark Slope, and the Pagekeeper shaped it from pre-production into live revision.',
          'The Maker handled core loop, tools, onboarding, HUD thinking, and production-facing documentation here.',
          'Wickle knows this one kept changing in flight. The Pagekeeper kept tuning while testing and level-shaping.'
        ],
        trailer: [
          'Wickle watches this trailer for the moment the reef starts feeling alive again.',
          'The moving picture tells the truth here: explore, clean, unlock, go deeper.'
        ],
        trailerFactoids: [
          'The Deep is built around exploration, cleanup, discovery, and transformation. Wickle heard the Pagekeeper say so many times.',
          'This trailer works because the loop reads quickly and the mood stays intact.'
        ]
      },
      'b17-flying-fortress.html': {
        accessory: 'assets/ui/wickle/wickle-acc-b17.png',
        accessoryClass: 'acc-cap',
        toneClass: 'tone-b17',
        sideBias: 'right',
        preferredHeadings: ['design work samples', 'project information', 'gallery'],
        normal: [
          'Too many engines for Wickle.',
          'Wickle likes the rivets on this one.',
          'Reference-goblin approved.'
        ],
        affirming: [
          'The Pagekeeper did the hard digging so the art could move cleanly.',
          'The Maker brought discipline here, not just enthusiasm.'
        ],
        weird: [
          'The rivets count themselves when nobody is here.',
          'Old metal pages keep their own weather.'
        ],
        clicked: [
          'Careful page. Careful hands. Wickle likes that.',
          'Wickle was checking the obscure details for teeth marks.'
        ],
        factoids: [
          'This B-17 work bridged design, coordination, mission support, and narrative support.',
          'The Pagekeeper pulled from museum support and primary-source material so the references stayed grounded.',
          'Wickle likes that these samples help artists and modellers with real period detail instead of mushy vibes.'
        ]
      },
      'battle-cry-of-freedom.html': {
        accessory: 'assets/ui/wickle/wickle-acc-freedom.png',
        accessoryClass: 'acc-cap',
        toneClass: 'tone-freedom',
        sideBias: 'left',
        preferredHeadings: ['trailer', 'responsibilities', 'gallery'],
        normal: [
          'Wickle stays behind hard cover.',
          'Enough musket fire already.',
          'Wickle approves of the terrain work.'
        ],
        affirming: [
          'The Pagekeeper reads space for flow, not just dressing.',
          'The Maker knows readable combat ground is not luck.'
        ],
        weird: [
          'This page smells faintly of old smoke and wet grass.',
          'Some battle pages echo before they load.'
        ],
        factoids: [
          'This one shipped in 2022 with Flying Squirrel, and the Pagekeeper worked level design and QA.',
          'Wickle heard there was research behind the maps: landmarks, sightlines, terrain, and cover metrics all behaving themselves.',
          'The Maker shaped readable battle space here, not just pretty earth.'
        ],
        trailer: [
          'Wickle likes this trailer for the smoke, the scale, and the useful ground.',
          'The moving picture here knows where the lines of fire live.'
        ],
        trailerFactoids: [
          'Battle Cry of Freedom is large-scale historical multiplayer work. Wickle can tell by how wide the trailer breathes.',
          'The trailer works because the terrain and landmarking read fast.'
        ]
      },
      'civitas.html': {
        accessory: 'assets/ui/wickle/wickle-acc-civitas.png',
        accessoryClass: 'acc-crown',
        toneClass: 'tone-civitas',
        sideBias: 'right',
        preferredHeadings: ['design work samples', 'responsibilities', 'project information'],
        normal: [
          'Wickle inspected the layouts.',
          'The corners are strong on this one.',
          'This page feels pleasantly structural.'
        ],
        affirming: [
          'The Pagekeeper sounds like an owner here, not a helper.',
          'The Maker thinks in layouts, rules, and downstream trouble all at once.'
        ],
        weird: [
          'This page stacks itself neatly after dark.',
          'Blueprint pages dream in straight lines.'
        ],
        clicked: [
          'Wickle was measuring the seams.',
          'The layout passed.'
        ],
        factoids: [
          'Civatlas was heading toward Early Access in 2023, and the Pagekeeper was the general design lead.',
          'Wickle likes that the design sample here is a live mid-production document, not a tidy after-the-fact trophy.',
          'The Maker handled systems, planning, wireframes, UI support, and implementation-facing notes here.'
        ],
        trailer: [
          'Wickle watches this trailer for city rhythm and system clarity.',
          'Pretty roofs are nice, but Wickle is checking whether the rules breathe.'
        ],
        trailerFactoids: [
          'This trailer works because the city-builder logic reads instead of hiding under ornament.',
          'The Pagekeeper did not just decorate this one. He led the design spine.'
        ]
      },
      'cv.html': {
        accessory: 'assets/ui/wickle/wickle-acc-cv.png',
        accessoryClass: 'acc-goggles',
        toneClass: 'tone-cv',
        sideBias: 'left',
        preferredHeadings: ['professional summary', 'professional experience', 'tools'],
        normal: [
          'Very official page. Tiny serious face.',
          'Professional goblin review complete.',
          'Wickle is trying to look employable too.'
        ],
        affirming: [
          'Lead fits the Pagekeeper better than helper.',
          'The Maker sounds like someone who can scope, align, and keep the work legible.'
        ],
        weird: [
          'Résumé pages sit very straight when no one is looking.',
          'This section hums in bullet points.'
        ],
        factoids: [
          'Wickle counts Dark Slope, Sharp End, MicroProse, Flying Squirrel, Frolic, Mindwax, Red Meat, Heath, and the self-directed map years on this page.',
          'The Pagekeeper keeps the timeline readable without sanding the edges off the work.'
        ]
      },
      'dinohab.html': {
        accessory: 'assets/ui/wickle/wickle-acc-dinohab.png',
        accessoryClass: 'acc-crown',
        toneClass: 'tone-dinohab',
        sideBias: 'left',
        preferredHeadings: ['design work samples', 'responsibilities', 'gallery'],
        normal: [
          'Wickle would absolutely feed the plants.',
          'Wickle likes the habitat bits.',
          'This page feels surprisingly nutritious.'
        ],
        affirming: [
          'Owned systems work leaves a footprint. The Pagekeeper left one here.',
          'The Maker stewards a feature from first shape through tuning. Wickle can smell it.'
        ],
        weird: [
          'Green pages breathe a little.',
          'The leaves here keep counting visitors.'
        ],
        factoids: [
          'DinoHab is 2024 Dark Slope work, and the Pagekeeper owned plants, fungi, and waste-harmony here.',
          'Wickle saw the Maker carry those habitat systems through design, implementation oversight, testing, and release tuning.',
          'This page also holds onboarding, behavior support, and wireframe planning bits. Wickle respects a broad nest.'
        ],
        trailer: [
          'Wickle likes this trailer because the care loop reads before the cute parts distract the eyes.',
          'The moving picture makes the habitat logic feel warm instead of mushy.'
        ],
        trailerFactoids: [
          'DinoHab is habitat restoration and creature-care work with readable feedback. Wickle likes readable feedback.',
          'The trailer works because the player-facing loop and the world fantasy point the same way.'
        ]
      },
      'dune-sea.html': {
        accessory: 'assets/ui/wickle/wickle-acc-dunesea.png',
        accessoryClass: 'acc-goggles',
        toneClass: 'tone-dunesea',
        sideBias: 'right',
        preferredHeadings: ['trailer', 'gallery', 'project information'],
        normal: [
          'Too much sand for bare feet.',
          'Wickle found dust in the divider.',
          'The dunes can keep their heat.'
        ],
        affirming: [
          'The Pagekeeper thinks about traversal and sightlines together.',
          'The Maker lets the page breathe instead of overstuffing it.'
        ],
        weird: [
          'Dry pages whisper louder.',
          'The sand keeps trying to move sideways.'
        ],
        factoids: [
          'Dune Sea is 2019 Frolic Labs work, and the Pagekeeper owned the full player-facing UI flow.',
          'Main menu, settings, tutorial, pause, level select, and in-game interface all run through the Maker\'s hands here.',
          'Wickle likes when UI work gets treated like real design work. This page does that.'
        ],
        trailer: [
          'Wickle watches this trailer for silhouette, pacing, and whether the player-facing read stays clean.',
          'The moving picture is dry, bright, and nicely legible. Good.'
        ],
        trailerFactoids: [
          'This trailer supports a side-scrolling exploration platformer, and the Pagekeeper\'s UI sense helps the read stay calm.',
          'Wickle approves when the screen language does not fight the world.'
        ]
      },
      'half-rats-parasomnia.html': {
        accessory: 'assets/ui/wickle/wickle-acc-parasomnia.png',
        accessoryClass: 'acc-candle',
        toneClass: 'tone-parasomnia',
        sideBias: 'either',
        preferredHeadings: ['trailer', 'gallery', 'project information'],
        normal: [
          'Wickle prefers a lamp left on.',
          'The shadows here are busy.',
          'This page feels like soft trouble.'
        ],
        affirming: [
          'Mood only works when the bones are stable. The Pagekeeper kept the bones stable.',
          'The Maker knows eerie work needs restraint.'
        ],
        weird: [
          'This page blinks back sometimes.',
          'The candle wax always knows the way out.'
        ],
        factoids: [
          'Half-Rats is 2017 QA work, and the Pagekeeper logged issues with screenshots, repro steps, location notes, and player-feel context.',
          'Wickle likes testers who write what the bug does to the player, not just what broke.',
          'This page smells like careful capture and pacing awareness.'
        ],
        trailer: [
          'Wickle watches this trailer from farther back. Just in case it notices.',
          'The moving picture is unsettling in a disciplined way. Wickle respects discipline.'
        ],
        trailerFactoids: [
          'This is survival-horror QA work with real attention to interaction clarity and pacing.',
          'The trailer sells mood, but Wickle likes that the Pagekeeper\'s work here lived in feedback and issue capture.'
        ]
      },
      'monster-simulator-3000.html': {
        accessory: 'assets/ui/wickle/wickle-acc-monster.png',
        accessoryClass: 'acc-helm',
        toneClass: 'tone-monster',
        sideBias: 'left',
        preferredHeadings: ['design work samples', 'responsibilities', 'gallery'],
        normal: [
          'Wickle is not the monster.',
          'Moderate confidence only.',
          'Wickle likes the ugly-cute bits best.'
        ],
        affirming: [
          'The Pagekeeper made behavior, readability, and tone bite in the same direction.',
          'The Maker owned the feature, not just the idea.'
        ],
        weird: [
          'The monsters on this page are mostly well behaved when fed.',
          'Sometimes the cute parts bite first.'
        ],
        factoids: [
          'Monster Simulator 3000 is 2024 Dark Slope VR kaiju work, and the Pagekeeper owned enemy design end to end.',
          'Boss briefs, tuning, implementation oversight, testing, release configuration: the Maker kept claws on the whole chain.',
          'Wickle likes that the sample set shows both the behavior ideas and the production knobs.'
        ],
        trailer: [
          'Wickle watches this trailer for scale, destruction, and whether the threats stay readable up close.',
          'Big monster work falls apart fast if the trailer muddies the action. This one does not.'
        ],
        trailerFactoids: [
          'This trailer sells close-perspective VR destruction without losing threat clarity.',
          'The Pagekeeper\'s enemy work matters here because readable chaos is still design.'
        ]
      },
      'mount-and-blade-community-maps.html': {
        accessory: 'assets/ui/wickle/wickle-acc-mountblade.png',
        accessoryClass: 'acc-helm',
        toneClass: 'tone-mountblade',
        sideBias: 'right',
        preferredHeadings: ['gallery', 'responsibilities', 'trailer'],
        normal: [
          'Wickle knows a shortcut through this map.',
          'Wickle would absolutely hide in the rocks.',
          'A good route line makes Wickle happy.'
        ],
        affirming: [
          'Map work shows itself in movement first. The Pagekeeper understands that.',
          'The Maker thinks spatially, not just decoratively.'
        ],
        weird: [
          'Route pages keep tiny winds in them.',
          'This divider has seen ambushes.'
        ],
        factoids: [
          'This was self-directed mapping work from 2015 to 2018.',
          'Twenty-plus original multiplayer maps and fifty-plus overhauls went through the Pagekeeper\'s hands here.',
          'Wickle likes that the Maker kept tuning lanes, metrics, balance, and readability over time instead of calling them done.'
        ],
        trailer: [
          'Wickle watches this trailer for routes, pressure, and whether the space tells the fighters where to be.',
          'The moving picture here is all about paths, timing, and where trouble gathers.'
        ],
        trailerFactoids: [
          'This page is about multiplayer map craft, and the trailer supports that by showing how the spaces breathe.',
          'The Pagekeeper\'s mapping years taught him that movement is the first proof. Wickle agrees.'
        ]
      },
      'red-meat-games.html': {
        accessory: 'assets/ui/wickle/wickle-acc-rmg.png',
        accessoryClass: 'acc-goggles',
        toneClass: 'tone-rmg',
        sideBias: 'left',
        preferredHeadings: ['responsibilities', 'project information', 'trailer'],
        normal: [
          'Wickle only handles the small tools.',
          'This one has workshop energy.',
          'Tiny foreman inspection complete.'
        ],
        affirming: [
          'The Pagekeeper leaves practical fingerprints here.',
          'The Maker knows theory is not enough once production starts creaking.'
        ],
        weird: [
          'Workbench pages keep warm little sparks in them.',
          'This divider smells faintly of sawdust.'
        ],
        factoids: [
          'This 2017 work split between First Impact and Onslaught.',
          'The Pagekeeper built four replayable arena levels for Onslaught and helped shape progression and enemy-wave escalation.',
          'Wickle likes early studio pages where design support, level work, production tasks, and QA all share a toolbox.'
        ],
        trailer: [
          'Wickle watches this trailer for arena rhythm and how the pressure steps upward.',
          'The moving picture here has workshop sparks all over it.'
        ],
        trailerFactoids: [
          'This trailer belongs to early studio work where the Pagekeeper was already touching level design, progression, and QA.',
          'Wickle approves when even early work shows practical hands.'
        ]
      },
      'roll-together.html': {
        accessory: 'assets/ui/wickle/wickle-acc-roll.png',
        accessoryClass: 'acc-band',
        toneClass: 'tone-roll',
        sideBias: 'either',
        preferredHeadings: ['trailer', 'responsibilities', 'project information'],
        normal: [
          'Round things still unsettle Wickle.',
          'Wickle keeps losing track of the ball.',
          'Momentum is suspicious.'
        ],
        affirming: [
          'Playful systems still need disciplined communication. The Pagekeeper knows that.',
          'The Maker keeps whimsy legible. Harder than it looks.'
        ],
        weird: [
          'Circular pages never fully stop moving.',
          'This one rolls around in Wickle\'s head afterwards.'
        ],
        factoids: [
          'This 2018 student-studio work spans Roll Together, CritterBall, and CritterBox.',
          'The Pagekeeper handled cooperative play, obstacles, hazards, puzzle structure, and level flow here.',
          'Wickle likes that playful work still gets treated like serious structure.'
        ],
        trailer: [
          'Wickle watches this trailer to see whether the playful bits stay readable once they start bouncing.',
          'The moving picture here is silly in a responsible way.'
        ],
        trailerFactoids: [
          'This trailer sells co-op timing and obstacle play, which is exactly where the Maker\'s design hands were.',
          'Wickle approves when whimsy still has clean edges.'
        ]
      },
      '404.html': {
        accessory: 'assets/ui/wickle/wickle-acc-404.png',
        accessoryClass: 'acc-tag',
        toneClass: 'tone-404',
        sideBias: 'either',
        preferredHeadings: ['welcome', 'how to use this site'],
        normal: [
          'Wickle got lost first.',
          'This page was not here a minute ago.',
          'Even the goblin took a wrong turn.'
        ],
        affirming: [
          'Even the dead ends feel considered when the Pagekeeper is working.',
          'The Maker tidied the fallback nest too.'
        ],
        weird: [
          'Lost pages drift a little at night.',
          'This divider leads somewhere else when it rains.'
        ],
        factoids: [
          'Wickle respects a dead end that still points back toward the real house.',
          'The Pagekeeper bothered to make even the missing bits feel intentional.'
        ]
      }
    };

    var specific = byPage[key] || {};
    return {
      key: key,
      accessory: specific.accessory || defaults.accessory,
      accessoryClass: specific.accessoryClass || defaults.accessoryClass,
      toneClass: specific.toneClass || defaults.toneClass,
      sideBias: specific.sideBias || defaults.sideBias,
      preferredHeadings: (specific.preferredHeadings || defaults.preferredHeadings).slice(),
      requiredIdle: typeof specific.requiredIdle === 'number' ? specific.requiredIdle : defaults.requiredIdle,
      firstVisitDelay: (specific.firstVisitDelay || defaults.firstVisitDelay).slice(),
      repeatVisitDelay: (specific.repeatVisitDelay || defaults.repeatVisitDelay).slice(),
      idleVisibleRange: (specific.idleVisibleRange || defaults.idleVisibleRange).slice(),
      clickedVisibleRange: (specific.clickedVisibleRange || defaults.clickedVisibleRange).slice(),
      autoTrailerCommentChance: typeof specific.autoTrailerCommentChance === 'number' ? specific.autoTrailerCommentChance : defaults.autoTrailerCommentChance,
      normal: defaults.normal.concat(specific.normal || []),
      affirming: defaults.affirming.concat(specific.affirming || []),
      weird: defaults.weird.concat(specific.weird || []),
      clicked: defaults.clicked.concat(specific.clicked || []),
      factoids: defaults.factoids.concat(specific.factoids || []),
      trailer: defaults.trailer.concat(specific.trailer || []),
      trailerFactoids: defaults.trailerFactoids.concat(specific.trailerFactoids || [])
    };
  }


  function setupDividerWickle() {
    var dividers = Array.from(document.querySelectorAll('.section-divider'));
    if (!dividers.length) return;

    var spritePath = 'assets/ui/Wickle.png';
    var deathSpritePath = 'assets/ui/Wicklediesprite.png';
    var clickSounds = ['assets/ui/wickle-click-1.wav', 'assets/ui/wickle-click-2.wav'];
    var dropSounds = ['assets/ui/WickleClicked3.wav', 'assets/ui/WickleClicked4.wav'];
    var rareClickSound = 'assets/ui/RareWickleSquishClick.wav';
    var dieSound = 'assets/ui/WickleDie.wav';
    var lightFailSounds = ['assets/ui/WickleLightSwitchFail1.wav', 'assets/ui/WickleLightSwitchFail2.wav'];
    var lightSuccessSounds = ['assets/ui/WickleLightSwitchSuccess1.wav', 'assets/ui/WickleLightSwitchSuccess2.wav'];
    var switchButton = document.querySelector('.theme-toggle');
    var switchStack = document.querySelector('.theme-toggle-stack') || (switchButton ? switchButton.parentNode : null);
    var deadStorageKey = 'wickle_dead_until_index_reload';
    var resurrectStorageKey = 'wickle_resurrect_once';
    var currentPageKey = getWicklePageKey();

    if (currentPageKey === 'index.html' && sessionStorage.getItem(deadStorageKey) === '1') {
      sessionStorage.removeItem(deadStorageKey);
      sessionStorage.setItem(resurrectStorageKey, '1');
    }

    var WICKLE_DIALOGUE = {
      /*
        Active Wickle dialogue lives here.
        Organize or edit lines by page, then by location bucket:
        - top: for upper-page / task-facing appearances
        - lower: for lower-page / stranger appearances
        - trailer: for trailer-watching lines
        - switch: for lightswitch minigame lines
        - headings: optional heading-keyword buckets that blend into the page pool
      */
      global: {
        top: {
          task: [
            'I want to understand you.',
            'Eek - Just looking!.',
            'Wickle recommends reading.',
            'Dont look at me!.'
          ],
          factoids: [
            'This site has many works!',
            'The section headers tell all...',
            'There are four sections per project page!'
          ],
          normal: [
            'Oh. You found Wickle.',
            'Wickle was inspecting this bit.',
            'This seems like the useful part.',
            'Wickle likes it when a page says what it is doing.',
			'Wickle!'
          ],
          weird: [
            'Wickle was here before this scroll position existed.',
			'Wickle checks that the page is still breathing.',
			'Refreshes hurts Wickle.',
			'I likes when the page breathes.',
            'Wickle keeps the seams together ...'
          ],
          fun: [
            'There are odder crumbs farther down.',
            'Wickle saves the weirder bits for committed visitors.'
          ]
        },
        lower: {
          task: [
            'If you made it this far, you are patient!',
            'This is where the page usually stops.'
          ],
          factoids: [
            'Lower on the page is usually where the sharper evidence lives.',
            'These deeper sections tend to say more about process than the opening summary does.'
          ],
          normal: [
            'Still here. Good.',
            'Wickle knew someone would keep going.',
            'This is where the page gets thin over its bones.'
          ],
          weird: [
            'The lower seams always remember.',
            'Wickle keeps the code clean below the fold.',
            'Some pages get quieter once the top is behind you.'
          ],
          fun: [
            'You scrolled far enough!',
            'Wickle trusts a visitor who reads past the tidy parts.'
          ]
        },
        trailer: {
          comments: [
            'Wickle is watching the trailer quietly.',
            'The moving picture makes me warm.',
            'Wickle watches this one often.',
            'Trailers should complement the page, not argue with it.'
          ],
          factoids: [
            'A strong trailer..',
            'Wickle pays attention to pacing.'
          ]
        },
        switch: {
          idle: [
            'Too bright. Wickle objects.',
            'The light comes through the seams.',
            'Wickle would prefer the dark, please.'
          ],
          success: [
            'There. Better.',
            'Good. The bright stopped.',
			'People always forget the lights.',
            'Wickle wins!'
          ],
          fail: [
            'Noooo. Still bright.',
			'No overhead lights!',
            'Wickle nearly had it.',
            'Unfortunate that the light survives..'
          ]
        },
        headings: {
          'project information': {
            task: ['This section is the fast sorting pass.'],
            factoids: ['Project information blocks are useful when they stay concise.']
          },
          'responsibilities': {
            task: ['Responsibilities sections tell Wickle who actually carried the work.'],
            factoids: ['A good responsibilities block distinguishes ownership from proximity.']
          },
          'design work samples': {
            task: ['Samples matter more when they are close to the claims they support.'],
            factoids: ['Work samples are strongest when they show process as well as output.']
          },
          'gallery': {
            task: ['Wickle checks galleries for whether the images do any real proving.'],
            factoids: ['A gallery should clarify the work, not merely decorate it.']
          },
          'trailer': {
            task: ['This is where the page has to prove feel quickly.']
          }
        }
      },
      pages: {
        'index.html': {
          top: {
            task: [
              'The front page is trying to get you to the proof quickly.',
              'If you are deciding whether to keep reading, the useful links start near the top.'
            ],
            factoids: [
              'The index is structured as a front door: overview first, then direct routes into examples.',
              'This page is meant to establish range before handing you off to the deeper pages.'
            ],
            normal: [
              'The front door is working.',
              'Wickle checks this page for wayfinding first.'
            ]
          },
          lower: {
            weird: [
              'Wickle keeps the stranger crumbs lower on the front page.',
              'The index gets weirder if you stay with it.'
            ],
            fun: [
              'This is the part for people who kept snooping.',
              'Wickle knew someone would keep scrolling.'
            ]
          }
        },
        'the-deep.html': {
          top: {
            task: [
              'This page is strongest when you read the loop and then check the evidence.',
              'The fast read here is feel, loop, ownership, then samples.'
            ],
            factoids: [
              'The Deep centers on exploration, cleanup, discovery, and transformation.',
              'This project kept changing during testing and level work, so the page carries both concept intent and live adjustment.',
              'One cave wireframe teaches movement by making the player clean plugged jets, then dodge timed blasts through a slalom.',
              'Yellow Cave used a false statue piece so players could learn grabbing by making a harmless mistake first.',
              'Some contamination trails were meant to stay invisible until the scanner revealed them.'
            ],
            normal: [
              'Wickle keeps to the dry edge of this one.',
              'The water page is behaving itself.'
            ]
          },
          lower: {
            factoids: [
              'One reef plan only needed about sixty-five percent of contamination cleaned to unlock the next level, so full cleanup was rewarded but not mandatory.',
              'Cleaning certain contamination points was planned to pay out energy crystals, turning cleanup into both progress and refill.',
              'The cave exit was meant to be backlit the instant the Green Laser artifact was claimed.',
              'The production template asked designers to track enemy paths, contamination totals, hazards, artifacts, and even the reward for one-hundred-percent completion.'
            ],
            weird: [
              'The lower parts of this page sound damp.',
              'Wickle stays near the edge when the page gets deeper.'
            ],
            fun: [
              'Water makes the lower sections stranger.',
              'Wickle prefers the reef side of the mystery.'
            ]
          },
          trailer: {
            comments: [
              'Wickle watches this trailer for the moment the place starts feeling alive again.',
              'This trailer gets judged on atmosphere, clarity, and whether the cleanup loop reads.'
            ],
            factoids: [
              'The trailer works best when the environment visibly transforms, not just when it looks pretty.',
              'Wickle checks whether the footage supports the page\'s claims about discovery and feedback.',
              'The docs describe the sortie rhythm very plainly: leave the Nautilus, clean contamination, scan wildlife, collect artifacts, then return to upgrade.',
              'One planned cave cue was a deep resonant chime when the statue puzzle snapped back together.'
            ]
          },
          headings: {
            'project information': {
              factoids: [
                'Early mixed-reality plans turned the player\'s room into the Nautilus and expected four walls, a table, and about five square metres of space.',
                'The suit-up fantasy originally began in the room-sized base before the dive even started.'
              ]
            },
            'responsibilities': {
              factoids: [
                'The docs treat scanner work, HUD thinking, onboarding, and live tuning as part of the same authored design chain.',
                'A lot of this page\'s value is that the design had to keep changing while the levels were already being tested.'
              ]
            },
            'design work samples': {
              factoids: [
                'Yellow Cave was designed to teach movement, sprint timing, cleaning, grabbing, and hostile evasion in one sequence.',
                'The sample docs also planned false puzzle pieces so players could learn the rules by making a safe mistake first.'
              ]
            },
            'gallery': {
              factoids: [
                'One reef rebuild plan divided the space into named zones like Turtle Shallow, Stonewatch Ridge, Four Face Garden, Warm Algae Shelf, and Fire Coral.',
                'The docs already cared about how each area would feel and read long before final art polish.'
              ]
            },
            'trailer': {
              factoids: [
                'The strongest footage here should make the cleanup loop, the scan loop, and the environmental recovery readable at a glance.',
                'The cave brief explicitly wanted soft bioluminescence, a clear focal pedestal, and a dramatic backlit exit once the artifact was won.'
              ]
            }
          }
        },
        'b17-flying-fortress.html': {
          top: {
            task: [
              'This page is for checking whether the research was deep enough to be usable.',
              'If you want the value quickly, look at how the references support artists and modellers.'
            ],
            factoids: [
              'The B-17 material here was gathered to support layouts, material culture, and usable visual reference.',
              'This is reference work aimed at production utility, not just mood.',
              'Rows of bicycle plinths were kept as reference because ordinary base traffic mattered to believable airfield layouts.',
              'The clothing brief points out that W.A.A.F. kitchen staff wore wooden-soled clogs to save regular shoes.',
              'One pilot checklist split flying into six phases instead of treating a mission as one long blur.',
              'The pilot information file was loose-leaf on purpose so new safety pages could be signed and inserted over time.'
            ],
            normal: ['Old paper page. Careful page.']
          },
          lower: {
            factoids: [
              'Issue records gave artists stock numbers, issue counts, and role-specific gear instead of hazy memory.',
              'One pilot file says crews should mark their route every twenty minutes on the chart.',
              'The same safety material says more than half of aircraft accidents happened on the ground.',
              'A radio operator report form is basically wartime paperwork for saying this set is broken.',
              'One combat manual ties good bombing results directly to training time.'
            ],
            weird: [
              'Archive pages always collect odd little details.',
              'Wickle keeps the dustier thoughts lower down on this one.'
            ],
            fun: [
              'Oil, canvas, and paper start taking over down here.',
              'Wickle expects careful readers on the B-17 page.'
            ]
          },
          headings: {
            'project information': {
              factoids: [
                'The production support brief says the goal was to help anchor everyday life on base, not just aircraft and mission scenes.',
                'That is why this page cares about shoes, bikes, forms, and support spaces as much as rivets and engines.'
              ]
            },
            'design work samples': {
              factoids: [
                'The strongest samples here answer different art questions instead of repeating one another: airfield movement, clothing, issue records, and flight procedure.',
                'It is practical research packaged so artists and modellers can actually build from it.'
              ]
            },
            'gallery': {
              factoids: [
                'The gallery matters because little support details like bike plinths and duty footwear stop a base from feeling like a museum set.',
                'Historical environments usually feel real once the ordinary background life becomes visible.'
              ]
            },
            'clothing': {
              factoids: [
                'The clothing brief treats issue forms like evidence of what people really wore and stored, not what later memory romanticized.',
                'W.A.A.F. clogs matter because they show how mundane economy shaped the look of people on base.'
              ]
            },
            'material culture': {
              factoids: [
                'Material culture here mostly means the everyday objects that made Thorpe Abbotts feel inhabited: bikes, footwear, personal kit, and paperwork.',
                'Those background objects are often what sell the illusion of real use.'
              ]
            },
            'pilot checklist': {
              factoids: [
                'The checklist pack divides flight into before start, warm-up, takeoff, flight, landing, and after landing.',
                'It was built as crew discipline, not optional paperwork.'
              ]
            },
            'checklist': {
              factoids: [
                'One warning in the checklist is basically never trust memory, because the live list may have changed.',
                'That is a useful reminder of how procedural bomber flying really was.'
              ]
            },
            'pilot': {
              factoids: [
                'One pilot safety note says that if the weather turns doubtful, a plain one-hundred-eighty-degree turn is often the right answer.',
                'Another keeps hammering the point that oxygen loss can wreck judgment long before a crewman feels dramatic about it.'
              ]
            },
            'manual': {
              factoids: [
                'The B-17 manual is most revealing when it quietly shows all the systems a crew had to manage every flight: fuel, oxygen, communications, and more.',
                'One of the clearest takeaways is that a bomber was a network of jobs and systems, not just four engines and a target.'
              ]
            },
            'radio': {
              factoids: [
                'The radio paperwork makes constant listening watch sound like a real operational duty, not background waiting.',
                'It also shows the paper trail for defects, which is a useful reminder that communications gear failed in very ordinary bureaucratic ways.'
              ]
            },
            'combat crew': {
              factoids: [
                'One combat manual says the job is to put the greatest number of bombs on target with the minimum losses to your own force.',
                'It is blunt language, but it makes the practical mission logic very clear.'
              ]
            }
          }
        },
        'battle-cry-of-freedom.html': {
          top: {
            task: [
              'This page is a good test of whether the work was built from more than nice smoke.',
              'Routes, cover, sightlines, and pressure matter more here than spectacle alone.'
            ],
            factoids: [
              'Battle Cry of Freedom work here is about turning historical reference into readable multiplayer ground.',
              'Good battlefield spaces teach movement through terrain, cover, and line of sight.'
            ],
            normal: ['Wickle stays behind hard cover on this page.']
          },
          lower: {
            weird: ['The lower parts of battlefield pages always feel like ambush country.'],
            fun: ['Wickle approves of useful ground.']
          },
          trailer: {
            comments: ['Wickle watches this trailer for smoke, scale, and whether the ground still reads.'],
            factoids: ['A wide battlefield trailer fails fast if the terrain stops communicating.']
          }
        },
        'civitas.html': {
          top: {
            task: [
              'This page should tell you quickly whether the city systems were thought through.',
              'The useful read here is how the design sample supports the systems claim.'
            ],
            factoids: [
              'The Civitas sample is a live mid-production snapshot rather than a polished after-the-fact summary.',
              'That makes it useful for seeing process texture as well as intent.',
              'The pitch says thrive, not merely survive.',
              'World generation was meant to use plate tectonics on sixteen-square-kilometre tiles.',
              'Plots are the core unit: parcel land, give it a purpose, then grow it with structures, upgrades, and decorations.'
            ],
            normal: ['Wickle is checking the city rhythm.']
          },
          lower: {
            factoids: [
              'A Boro is formed from three plots, then three Boros make a Hamlet, and the same three-of-a-kind rule keeps stacking upward.',
              'Patrons are generated from the mix of plot types in an area and can partially automate their specialty.',
              'Civvies were meant to live, work, learn, and age through Shakespeare\'s seven ages.',
              'If upkeep is ignored long enough, buildings decay into derelicts until repaired.'
            ],
            weird: ['Roofs are loud. Rules are louder.'],
            fun: ['Wickle gets more interested in the city logic lower down.']
          },
          trailer: {
            comments: ['Wickle watches this trailer for rhythm, readability, and whether the rules breathe.'],
            factoids: [
              'The art direction aimed for Renaissance map art brought to life, not generic medieval city-builder mush.',
              'Menu sound plans even called for paper, quills, and books on a cartographer\'s desk.'
            ]
          },
          headings: {
            'project information': {
              factoids: [
                'The opening pitch ties Civitas directly to Renaissance bird\'s-eye maps by John Speed, Georg Braun, and Frans Hogenberg.',
                'That is why the project reads like both a city-builder and a living atlas.'
              ]
            },
            'responsibilities': {
              factoids: [
                'The design pillars are blunt about priorities: simple UI, easy building, and an economy that keeps moving.',
                'One line says it plainly: people build cities, they do not build themselves.'
              ]
            },
            'design work samples': {
              factoids: [
                'Plotting was designed to be gridless: click out the corners, close the shape, then choose the plot purpose and primary structure.',
                'Once the settlement reached City status, plots could even be subdivided into smaller ones.'
              ]
            },
            'gallery': {
              factoids: [
                'The project also planned Civvies in UI and cutscenes as Terry Gilliam-style cutouts while the in-world version stayed 3D for performance.',
                'That mix says a lot about how the team wanted the game to feel like a storybook map without giving up playability.'
              ]
            },
            'trailer': {
              factoids: [
                'The best footage for this project should make plot logic, borough growth, and map-art fantasy readable in the same breath.',
                'Pretty roofs alone are not enough if the city\'s rules vanish under them.'
              ]
            }
          }
        },
        'cv.html': {
          top: {
            task: [
              'This page is for sorting breadth, roles, and where the experience clusters.',
              'If you are skimming, read the summary and then confirm it against the project pages.'
            ],
            factoids: [
              'The CV page covers roles across design, leadership, implementation support, and production-facing work.',
              'It works best as a map that points you back toward the proof pages.'
            ],
            normal: ['Wickle is counting roles and years.']
          },
          lower: {
            weird: ['Resumes always get stranger the longer you stare at them.'],
            fun: ['Wickle assumes lower-page readers are serious now.']
          }
        },
        'dinohab.html': {
          top: {
            task: [
              'This page is useful for checking systems ownership and readable feedback.',
              'Care loops only work if the player can read cause and effect quickly.'
            ],
            factoids: [
              'DinoHab work here includes the plant, fungi, and waste harmony systems.',
              'This page also points toward milestone planning and wireframe support.',
              'Harmony is three-way: plants feed dinosaurs, dinosaurs make waste, and fungi turn waste into compost.',
              'The macro loop was built around short daily check-ins of about fifteen minutes.',
              'The first buddy hatches when the player scans the egg, not by simply waiting.',
              'The multitool was meant to scan, heal, place, remove, and replant without turning into a pile of separate gadgets.'
            ],
            normal: ['Habitat page. Wickle behaves better here.']
          },
          lower: {
            factoids: [
              'Only parent plants propagate, which stops the habitat from multiplying forever without player input.',
              'In the alpha harmony rules, one fungus unit was budgeted to support about three plants.',
              'Scanned mycelium links were supposed to show as purple lines with bright points moving through the network.',
              'Removing dead leaves was part of gameplay because dead growth was meant to slow the plant down.',
              'Buddies could be hand-fed, petted for Dino Points, and taken back to the lab, but only one buddy could be active at a time.'
            ],
            weird: ['The lower habitat bits always make Wickle want to overwater something.'],
            fun: ['Readable feedback matters more than cute distractions.']
          },
          trailer: {
            comments: ['Wickle watches this trailer for the care loop before the cute parts take over.'],
            factoids: [
              'The footage works best when the loop reads before the charm does.',
              'Full harmony was meant to make new dinosaurs more likely to arrive, which then disrupted the balance again.',
              'Lushness was a visible recovery ladder from barren ground to fully restored habitat.'
            ]
          },
          headings: {
            'project information': {
              factoids: [
                'The harmony meter only really means something when plant health, dino satisfaction, and fungi support are all pulling together.',
                'The player-planted version of a plant is the important one in the logic, because it acts as the parent that can seed more life nearby.'
              ]
            },
            'responsibilities': {
              factoids: [
                'The fungi spec treats mushrooms like living compost silos that eat waste, store compost, and feed it back to plants.',
                'The plant spec treats one number, nutrients, as food, health, and growth progression all at once.'
              ]
            },
            'design work samples': {
              factoids: [
                'A valid dinosaur rest patch could be something as simple as three nearby plants whose cover values add up high enough.',
                'Some plants were allowed to go dormant and come back instead of simply dying forever.'
              ]
            },
            'gallery': {
              factoids: [
                'At full lushness the docs call for cleaner air, more insects around healthy cover, and ripe fruit under trees.',
                'The goal was to make habitat recovery visibly readable, not just hide it in meters.'
              ]
            },
            'trailer': {
              factoids: [
                'The strongest read here is plant, feed, pet, balance harmony, grow the herd, then come back later to see the result.',
                'This project was designed so visible ecological feedback would do as much teaching as the UI.'
              ]
            }
          }
        },
        'dune-sea.html': {
          top: {
            task: ['This page reads best if you watch for pacing, pressure, and encounter setup.'],
            factoids: ['The dune work is strongest where space and pressure teach the player what matters.'],
            normal: ['Wickle keeps sand out of his eyes as best he can.']
          },
          lower: {
            weird: ['Lower dune sections always feel wind-scoured.'],
            fun: ['Wickle distrusts wide horizons a little.']
          }
        },
        'half-rats-parasomnia.html': {
          top: {
            task: ['This page should tell you quickly whether the mood work is disciplined or merely loud.'],
            factoids: ['Parasomnia-facing work here leans on feedback, issue capture, and controlled player-facing read.'],
            normal: ['Wickle stands a little farther back on this page.']
          },
          lower: {
            weird: ['Some pages feel like they are listening back.'],
            fun: ['Wickle is not afraid. Wickle is just cautious.']
          },
          trailer: {
            comments: ['Wickle watches this trailer for pacing, silhouette, and controlled unease.'],
            factoids: ['Mood trailers work best when they stay legible under pressure.']
          }
        },
        'monster-simulator-3000.html': {
          top: {
            task: ['This page is for checking threat readability, behavior intent, and tuning control.'],
            factoids: [
              'Monster Simulator 3000 work here includes enemy-design features and close balance attention.',
              'Power plants were multi-step objectives: open the stack, carry cores, and force an overheat.',
              'Throw assist was intentionally stronger up close so heavy VR throws landed where players meant them to.',
              'Rage comes from wrecking things, killing enemies, and even taking damage.',
              'Perks are temporary run upgrades and disappear on death.'
            ],
            normal: ['Wickle is definitely not the monster.']
          },
          lower: {
            factoids: [
              'The boss blimp flies a figure-eight and drops bombs with blinking fuses that the player can grab or crush.',
              'The boss helicopter tries to stay between the player and the nearest spawner, and clever players can bait it into hitting its own side.',
              'The boss tank teaches shield timing: wind-up, reticle lock, shield drop, then the volley.',
              'Knocking out all the buddy tanks was meant to leave the boss exposed.',
              'Boom perks create chain explosions, while Stone perks can destroy enemy projectiles as well as enemies.'
            ],
            weird: ['Ugly things are easier to trust when they stay readable.'],
            fun: ['Wickle likes the ugly-cute bits best.']
          },
          trailer: {
            comments: ['Wickle watches this trailer for scale, destruction, and whether the threats stay readable up close.'],
            factoids: [
              'Big creature footage fails quickly if silhouette and intent get muddy.',
              'The level process was expected to stay playable through whitebox, production, and balance passes.',
              'Spawn pressure was designed to get meaner near objectives and ease off when the player was hurt or farther away.'
            ]
          },
          headings: {
            'project information': {
              factoids: [
                'The core run logic is simple in plain English: smash the city, kill the power, survive the bosses, and chase score, destruction, and time.',
                'A lot of the systems work here was about making that chaos readable instead of random.'
              ]
            },
            'responsibilities': {
              factoids: [
                'The configuration docs expose exactly how adjustable the combat was, right down to rage gain, shockwave costs, projectile behavior, and enemy fire rates.',
                'That means this page is not only concept work; it is also tuning-knob work.'
              ]
            },
            'design work samples': {
              factoids: [
                'The boss tank, helicopter, and blimp briefs are all built around player-readable tells, not cheap surprise damage.',
                'The throw feature page even adds coyote timing and aim help so grabbing and hurling feel intentional in VR.'
              ]
            },
            'gallery': {
              factoids: [
                'The strongest images on this page should show scale, target clarity, and the difference between throwables, threats, and objectives.',
                'Monster chaos only really works once the city still reads as a place and not just a debris cloud.'
              ]
            },
            'trailer': {
              factoids: [
                'The best footage here should make boss tells, throwable objects, and objective logic readable at the same time.',
                'A kaiju game can be messy, but the player still needs to understand why a plan worked.'
              ]
            }
          }
        },
        'mount-and-blade-community-maps.html': {
          top: {
            task: ['This page is a route, lane, and readability page before it is anything else.'],
            factoids: ['The Mount & Blade map work here reflects long-form tuning of paths, pressure, balance, and readable ground.'],
            normal: ['Wickle knows better than to trust a dishonest route line.']
          },
          lower: {
            weird: ['The lower route notes always smell faintly like ambushes.'],
            fun: ['Wickle would absolutely hide in the rocks.']
          },
          trailer: {
            comments: ['Wickle watches this trailer for route clarity, pressure, and whether the space tells fighters where to be.'],
            factoids: ['Multiplayer map footage only helps if the terrain is still legible at speed.']
          }
        },
        'red-meat-games.html': {
          top: {
            task: ['This page is useful for checking early-career breadth and practical hands.'],
            factoids: ['The Red Meat page points toward design support, level work, production tasks, and QA-facing responsibilities.'],
            normal: ['Early studio pages always have more moving parts than they admit.']
          },
          lower: {
            weird: ['The lower parts of early-work pages always feel like crowded toolboxes.'],
            fun: ['Wickle respects practical hands.']
          },
          trailer: {
            comments: ['Wickle watches this trailer for arena rhythm and pressure stepping.'],
            factoids: ['Even early work reads better when the action language stays clean.']
          }
        },
        'roll-together.html': {
          top: {
            task: ['This page should tell you whether the playful systems still have clean structure.'],
            factoids: ['Roll Together reads best when the playful surface and the underlying clarity stay aligned.'],
            normal: ['Round things remain suspicious.']
          },
          lower: {
            weird: ['Some playful pages keep rolling around in the head afterwards.'],
            fun: ['Wickle keeps losing track of the ball.']
          },
          trailer: {
            comments: ['Wickle watches this trailer to see whether the playful bits stay readable once they start bouncing.'],
            factoids: ['Whimsy benefits from clean edges.']
          }
        },
        '404.html': {
          top: {
            task: ['This page exists to send you back toward the real house quickly.'],
            factoids: ['Even a fallback page is doing route work.'],
            normal: ['Wickle got lost first.']
          },
          lower: {
            weird: ['Dead ends get odd after dark.'],
            fun: ['A good 404 still points home.']
          }
        }
      }
    };

    function emptyBuckets() {
      return { task: [], factoids: [], normal: [], weird: [], fun: [], comments: [] };
    }

    function mergeBuckets(into, source) {
      if (!source) return into;
      ['task', 'factoids', 'normal', 'weird', 'fun', 'comments'].forEach(function (key) {
        if (Array.isArray(source[key]) && source[key].length) {
          into[key] = into[key].concat(source[key]);
        }
      });
      return into;
    }

    var state = {
      host: null,
      hostType: '',
      visitTimer: 0,
      hideTimer: 0,
      bubbleTimer: 0,
      murmurTimer: 0,
      shiverTimer: 0,
      switchTimer: 0,
      lastInteraction: Date.now(),
      hasShownOnce: false,
      recentLines: [],
      lastHost: null,
      trailerFocusUntil: 0,
      trailerFocusSection: null,
      trailerReason: '',
      trailerVideos: [],
      showAt: 0,
      activeAccessory: '',
      activeAccessoryClass: '',
      lightAmbushArmed: false,
      switchCooldownUntil: 0,
      clickStamps: [],
      dead: sessionStorage.getItem(deadStorageKey) === '1',
      trailerShown: {},
      currentLine: '',
      instanceClickLineShown: false
    };

    window.__wickleLightMisclickBoost = window.__wickleLightMisclickBoost || { active: false, until: 0 };

    if (state.dead) return;

    var sprite = document.createElement('button');
    sprite.type = 'button';
    sprite.className = 'wickle-peek';
    sprite.setAttribute('aria-label', 'Wickle is peeking from the divider');
    sprite.setAttribute('title', 'Wickle');
    sprite.innerHTML = '<span class="wickle-inner"><img class="wickle-base" src="' + spritePath + '" alt="" aria-hidden="true"><img class="wickle-accessory" alt="" aria-hidden="true"></span>';
    sprite.hidden = true;

    var inner = sprite.querySelector('.wickle-inner');
    var accessory = sprite.querySelector('.wickle-accessory');

    var bubble = document.createElement('div');
    bubble.className = 'wickle-bubble';
    bubble.setAttribute('role', 'status');
    bubble.setAttribute('aria-live', 'polite');
    document.body.appendChild(bubble);

    function randomRange(min, max) {
      return Math.round(min + Math.random() * (max - min));
    }

    function getScrollRatio() {
      var doc = document.documentElement;
      var top = window.scrollY || doc.scrollTop || 0;
      var max = Math.max(1, (doc.scrollHeight || 1) - (window.innerHeight || doc.clientHeight || 1));
      return top / max;
    }

    function recordInteraction() {
      state.lastInteraction = Date.now();
    }

    function cleanupTimers() {
      ['visitTimer', 'hideTimer', 'bubbleTimer', 'murmurTimer', 'shiverTimer', 'switchTimer'].forEach(function (key) {
        if (state[key]) {
          window.clearTimeout(state[key]);
          state[key] = 0;
        }
      });
    }

    function clearHideTimer() {
      ['hideTimer', 'bubbleTimer'].forEach(function (key) {
        if (state[key]) {
          window.clearTimeout(state[key]);
          state[key] = 0;
        }
      });
    }

    function detach() {
      if (sprite.parentNode) sprite.parentNode.removeChild(sprite);
      state.host = null;
      state.hostType = '';
    }

    function clearPresentationClasses() {
      sprite.className = 'wickle-peek';
      bubble.className = 'wickle-bubble';
      accessory.className = 'wickle-accessory';
      accessory.removeAttribute('src');
      accessory.hidden = true;
      state.activeAccessory = '';
      state.activeAccessoryClass = '';
      bubble.classList.remove('is-visible', 'is-below');
      bubble.style.removeProperty('--wickle-bubble-x');
      bubble.style.removeProperty('--wickle-bubble-y');
      bubble.style.removeProperty('--wickle-tail-x');
    }

    function pushRecentLine(line) {
      if (!line) return;
      state.recentLines.push(line);
      if (state.recentLines.length > 14) state.recentLines.shift();
    }

    function normalizeLine(line) {
      var output = (line || 'Oh. You found Wickle.').trim();
      output = output.replace(/\s+/g, ' ');
      return output;
    }

    function chooseFreshLine(lines) {
      var cleaned = (lines || []).map(normalizeLine).filter(Boolean);
      if (!cleaned.length) return 'Oh. You found Wickle.';
      var unique = cleaned.filter(function (line, index) { return cleaned.indexOf(line) === index; });
      var fresh = unique.filter(function (line) { return state.recentLines.indexOf(line) === -1; });
      var options = fresh.length ? fresh : unique;
      var choice = options[Math.floor(Math.random() * options.length)];
      pushRecentLine(choice);
      return choice;
    }

    function getSectionForHost(host) {
      return host ? host.closest('.section') : null;
    }

    function getHeadingForHost(host) {
      var section = getSectionForHost(host);
      var heading = section ? section.querySelector('h1, h2, h3') : null;
      return heading ? heading.textContent.trim() : '';
    }

    function getHostSectionHeadingText(host) {
      return getHeadingForHost(host).toLowerCase();
    }

    function getHostForSection(section) {
      return section ? section.querySelector('.section-divider') : null;
    }

    function sectionVisibleEnough(section) {
      if (!section) return false;
      var rect = section.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight || 0;
      return rect.bottom > vh * 0.18 && rect.top < vh * 0.82;
    }

    function hostIsVisible(host) {
      if (!host || !host.getBoundingClientRect) return false;
      var rect = host.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight || 0;
      var vw = window.innerWidth || document.documentElement.clientWidth || 0;
      if (!rect.width && !rect.height) return false;
      return rect.bottom > 24 && rect.top < vh - 24 && rect.right > 24 && rect.left < vw - 24;
    }

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    }

    function positionBubble() {
      if (!bubble.classList.contains('is-visible') || !state.host || !sprite.parentNode) return;
      var rect = sprite.getBoundingClientRect();
      var margin = 10;
      bubble.style.maxWidth = Math.min(270, Math.max(180, window.innerWidth - margin * 2)) + 'px';
      bubble.style.left = '0px';
      bubble.style.top = '0px';
      var bw = bubble.offsetWidth || 220;
      var bh = bubble.offsetHeight || 60;
      var x = rect.left + rect.width * 0.5 - bw * 0.5;
      x = clamp(x, margin, Math.max(margin, window.innerWidth - bw - margin));
      var y = rect.top - bh - 14;
      var below = false;
      if (y < margin) {
        y = Math.min(window.innerHeight - bh - margin, rect.bottom + 14);
        below = true;
      }
      bubble.classList.toggle('is-below', below);
      bubble.style.setProperty('--wickle-bubble-x', x.toFixed(2) + 'px');
      bubble.style.setProperty('--wickle-bubble-y', y.toFixed(2) + 'px');
      var tail = rect.left + rect.width * 0.5 - x - 6;
      tail = clamp(tail, 16, Math.max(16, bw - 22));
      bubble.style.setProperty('--wickle-tail-x', tail.toFixed(2) + 'px');
    }

    function playSound(source, options) {
      try {
        var src = Array.isArray(source) ? source[Math.floor(Math.random() * source.length)] : source;
        if (!src) return;
        var audio = new Audio(src);
        audio.preload = 'auto';
        audio.volume = options && options.volume != null ? options.volume : (0.74 + Math.random() * 0.16);
        audio.playbackRate = options && options.rate != null ? options.rate : (0.94 + Math.random() * 0.14);
        audio.preservesPitch = false;
        audio.mozPreservesPitch = false;
        audio.webkitPreservesPitch = false;
        audio.play().catch(function () {});
      } catch (e) {}
    }

    function emitPixelBurst(target, palette, amount, className) {
      if (!target) return;
      var layer = ensureFxLayer();
      var rect = target.getBoundingClientRect();
      var count = amount || 10;
      for (var i = 0; i < count; i += 1) {
        var particle = document.createElement('span');
        particle.className = className || 'wickle-dust-particle';
        particle.style.left = (rect.left + rect.width * (0.18 + Math.random() * 0.64)).toFixed(2) + 'px';
        particle.style.top = (rect.top + rect.height * (0.2 + Math.random() * 0.54)).toFixed(2) + 'px';
        particle.style.setProperty('--wpx-x', ((Math.random() * 54) - 27).toFixed(2) + 'px');
        particle.style.setProperty('--wpx-y', (-14 - Math.random() * 24).toFixed(2) + 'px');
        particle.style.setProperty('--wpx-y2', (22 + Math.random() * 48).toFixed(2) + 'px');
        particle.style.setProperty('--wpx-rot', ((Math.random() * 200) - 100).toFixed(2) + 'deg');
        particle.style.setProperty('--wpx-scale', (0.9 + Math.random() * 0.9).toFixed(2));
        if (palette && palette.length) particle.style.background = palette[Math.floor(Math.random() * palette.length)];
        layer.appendChild(particle);
        window.setTimeout(function (node) {
          return function () {
            if (node && node.parentNode) node.parentNode.removeChild(node);
          };
        }(particle), 1300);
      }
    }

    function emitDustParticles(target) {
      emitPixelBurst(target, ['rgba(204,192,168,.78)', 'rgba(176,166,142,.66)', 'rgba(154,144,122,.52)'], 12, 'wickle-dust-particle');
    }

    function emitPurpleScum(target) {
      emitPixelBurst(target, ['rgba(142,89,220,.92)', 'rgba(188,117,240,.84)', 'rgba(92,46,142,.88)'], 18, 'wickle-scum-particle');
    }

    function dropAccessorySprite() {
      if (!state.activeAccessory || accessory.hidden || !accessory.getAttribute('src')) return false;
      if (Math.random() > 0.24) return false;
      var rect = accessory.getBoundingClientRect();
      if (!rect.width || !rect.height) return false;
      var layer = ensureFxLayer();
      var clone = document.createElement('img');
      clone.className = 'wickle-dropped-accessory';
      clone.src = state.activeAccessory;
      clone.alt = '';
      clone.setAttribute('aria-hidden', 'true');
      clone.style.left = (rect.left + rect.width * 0.5).toFixed(2) + 'px';
      clone.style.top = (rect.top + rect.height * 0.5).toFixed(2) + 'px';
      clone.style.width = Math.max(16, rect.width).toFixed(2) + 'px';
      clone.style.setProperty('--drop-x', ((Math.random() * 120) - 60).toFixed(2) + 'px');
      clone.style.setProperty('--drop-rot', ((Math.random() * 240) - 120).toFixed(2) + 'deg');
      layer.appendChild(clone);
      accessory.hidden = true;
      playSound(dropSounds, { volume: 0.84, rate: 0.94 + Math.random() * 0.1 });
      window.setTimeout(function () {
        if (clone && clone.parentNode) clone.parentNode.removeChild(clone);
      }, 2200);
      return true;
    }

    function spawnDeathFall() {
      var layer = ensureFxLayer();
      var rect = sprite.getBoundingClientRect();
      var dead = document.createElement('img');
      dead.className = 'wickle-death-fall';
      dead.src = deathSpritePath;
      dead.alt = '';
      dead.setAttribute('aria-hidden', 'true');
      dead.style.left = (rect.left + rect.width * 0.5).toFixed(2) + 'px';
      dead.style.top = (rect.top + rect.height * 0.5).toFixed(2) + 'px';
      dead.style.width = Math.max(42, rect.width * 0.96).toFixed(2) + 'px';
      dead.style.setProperty('--death-x', ((Math.random() * 90) - 45).toFixed(2) + 'px');
      dead.style.setProperty('--death-rot', ((Math.random() * 140) - 70).toFixed(2) + 'deg');
      layer.appendChild(dead);
      window.setTimeout(function () {
        if (dead && dead.parentNode) dead.parentNode.removeChild(dead);
      }, 2800);
    }

    function playInnerAnimation(frames, options) {
      try {
        if (!inner || !inner.animate) return;
        inner.animate(frames, options);
      } catch (e) {}
    }

    function playSpeechBob() {
      playInnerAnimation([
        { transform: 'translate3d(0,0,0) scale(1,1)' },
        { transform: 'translate3d(0,-2px,0) scale(1.015,.985)', offset: 0.5 },
        { transform: 'translate3d(0,0,0) scale(1,1)' }
      ], { duration: 620, easing: 'steps(3,end)' });
    }

    function playShiver() {
      playInnerAnimation([
        { transform: 'translate3d(0,0,0) scale(1,1)' },
        { transform: 'translate3d(-1px,0,0) scale(1.01,.99)' },
        { transform: 'translate3d(1px,0,0) scale(.99,1.01)' },
        { transform: 'translate3d(0,0,0) scale(1,1)' }
      ], { duration: 320, easing: 'steps(4,end)' });
    }

    function playClickPop() {
      playInnerAnimation([
        { transform: 'translate3d(0,0,0) scale(1,1)' },
        { transform: 'translate3d(0,1px,0) scale(1.08,.88)', offset: 0.24 },
        { transform: 'translate3d(0,-2px,0) scale(.94,1.08)', offset: 0.58 },
        { transform: 'translate3d(0,0,0) scale(1,1)' }
      ], { duration: 520, easing: 'cubic-bezier(.22,.9,.28,1)' });
    }

    function scheduleShiverIfNeeded() {
      if (state.shiverTimer) window.clearTimeout(state.shiverTimer);
      if (Math.random() > 0.58) return;
      state.shiverTimer = window.setTimeout(function () {
        if (!state.host || !sprite.classList.contains('is-visible')) return;
        playShiver();
      }, randomRange(900, 2600));
    }

    function say(line) {
      state.currentLine = normalizeLine(line);
      bubble.textContent = state.currentLine;
      bubble.classList.add('is-visible');
      sprite.classList.add('is-speaking');
      positionBubble();
      playSpeechBob();
      scheduleShiverIfNeeded();
    }

    function maybeUnsay() {
      bubble.classList.remove('is-visible');
      bubble.classList.remove('is-below');
      sprite.classList.remove('is-speaking');
      state.currentLine = '';
    }

    function markTrailerInterest(section, reason) {
      if (!section) return;
      var now = Date.now();
      var duration = reason === 'play' ? 14000 : 9000;
      state.trailerFocusUntil = Math.max(state.trailerFocusUntil, now + duration);
      state.trailerFocusSection = section;
      state.trailerReason = reason || 'watch';
      if (!state.host) scheduleVisitSoon();
    }

    function findActiveTrailerContext() {
      var now = Date.now();
      var activeVideo = null;
      var activeSection = null;

      state.trailerVideos.forEach(function (entry) {
        var video = entry.video;
        var section = entry.section;
        if (!video || !section) return;
        var playing = !video.paused && !video.ended && video.readyState > 1;
        if (playing && sectionVisibleEnough(section)) {
          activeVideo = video;
          activeSection = section;
        }
      });

      if (activeSection) {
        state.trailerFocusUntil = Math.max(state.trailerFocusUntil, now + 1800);
        state.trailerFocusSection = activeSection;
        state.trailerReason = 'play';
      }

      if (state.trailerFocusSection && state.trailerFocusUntil > now) {
        return {
          active: true,
          section: state.trailerFocusSection,
          reason: state.trailerReason || 'watch',
          video: activeVideo
        };
      }

      return { active: false, section: null, reason: '', video: null };
    }

    function bindTrailerWatchers() {
      state.trailerVideos = Array.from(document.querySelectorAll('.video-frame video, video')).map(function (video) {
        return { video: video, section: video.closest('.section') };
      }).filter(function (entry) { return !!entry.section; });

      state.trailerVideos.forEach(function (entry) {
        var video = entry.video;
        var section = entry.section;
        if (!video || video.dataset.wickleTrailerBound === 'true') return;
        video.dataset.wickleTrailerBound = 'true';

        ['play', 'playing'].forEach(function (eventName) {
          video.addEventListener(eventName, function () {
            markTrailerInterest(section, 'play');
          });
        });

        ['mouseenter', 'pointerenter', 'focusin'].forEach(function (eventName) {
          video.addEventListener(eventName, function () {
            markTrailerInterest(section, 'hover');
          });
        });

        video.addEventListener('click', function () {
          markTrailerInterest(section, 'click');
        }, true);
      });
    }

    function collectDialogue(host, locationKey, isTrailerHost) {
      var pageKey = getWicklePageKey();
      var output = emptyBuckets();
      var globalBlock = WICKLE_DIALOGUE.global[locationKey] || {};
      var pageBlock = ((WICKLE_DIALOGUE.pages[pageKey] || {})[locationKey]) || {};
      var headingText = getHostSectionHeadingText(host);
      var globalHeadings = WICKLE_DIALOGUE.global.headings || {};
      var pageHeadings = ((WICKLE_DIALOGUE.pages[pageKey] || {}).headings) || {};

      mergeBuckets(output, globalBlock);
      mergeBuckets(output, pageBlock);

      Object.keys(globalHeadings).forEach(function (key) {
        if (headingText.indexOf(key) !== -1) mergeBuckets(output, globalHeadings[key]);
      });
      Object.keys(pageHeadings).forEach(function (key) {
        if (headingText.indexOf(key) !== -1) mergeBuckets(output, pageHeadings[key]);
      });

      if (isTrailerHost) {
        mergeBuckets(output, WICKLE_DIALOGUE.global.trailer || {});
        mergeBuckets(output, ((WICKLE_DIALOGUE.pages[pageKey] || {}).trailer) || {});
      }

      if (sessionStorage.getItem(resurrectStorageKey) === '1') {
        output.weird = output.weird.concat([
          'Wickle remembers being dead. Only briefly.',
          'Wickle came back wrong, but not inconveniently wrong.'
        ]);
      }

      return output;
    }

    function getSwitchLines(kind) {
      var pools = WICKLE_DIALOGUE.global.switch || {};
      return pools[kind] || pools.idle || ['Too bright.'];
    }

    function getContextLine(host, clicked, forceTrailer) {
      var config = getWicklePageConfig();
      var trailerContext = findActiveTrailerContext();
      var isTrailerHost = !!forceTrailer || getHostSectionHeadingText(host).indexOf('trailer') !== -1 || (trailerContext.active && getSectionForHost(host) === trailerContext.section);
      var lowerDown = getScrollRatio() > 0.44;
      var locationKey = lowerDown ? 'lower' : 'top';
      var buckets = collectDialogue(host, locationKey, isTrailerHost);
      var roll = Math.random();
      var pool = [];

      if (state.hostType === 'switch') {
        return chooseFreshLine(getSwitchLines('idle'));
      }

      if (!lowerDown) {
        if (clicked) {
          if (isTrailerHost && roll < 0.40) {
            pool = buckets.comments.concat(buckets.factoids);
          } else if (roll < 0.68) {
            pool = buckets.factoids.concat(buckets.task);
          } else if (roll < 0.9) {
            pool = buckets.normal.concat(buckets.task);
          } else {
            pool = buckets.weird.concat(buckets.fun);
          }
        } else {
          if (isTrailerHost && roll < config.autoTrailerCommentChance) {
            pool = buckets.comments.concat(buckets.factoids);
          } else if (roll < 0.7) {
            pool = buckets.factoids.concat(buckets.task);
          } else if (roll < 0.88) {
            pool = buckets.normal.concat(buckets.task);
          } else {
            pool = buckets.weird.concat(buckets.fun);
          }
        }
      } else {
        if (clicked) {
          if (isTrailerHost && roll < 0.26) {
            pool = buckets.comments.concat(buckets.factoids);
          } else if (roll < 0.52) {
            pool = buckets.weird.concat(buckets.fun);
          } else if (roll < 0.8) {
            pool = buckets.factoids.concat(buckets.task);
          } else {
            pool = buckets.normal.concat(buckets.fun);
          }
        } else {
          if (roll < 0.34) {
            pool = buckets.normal.concat(buckets.fun);
          } else if (roll < 0.62) {
            pool = buckets.weird.concat(buckets.fun);
          } else if (roll < 0.86) {
            pool = buckets.factoids.concat(buckets.task);
          } else {
            pool = buckets.comments.concat(buckets.weird);
          }
        }
      }

      return chooseFreshLine(pool);
    }

    function hideWickle(reschedule) {
      cleanupTimers();
      if (!state.host || !sprite.parentNode) {
        if (reschedule && !state.dead) scheduleVisit();
        return;
      }
      maybeUnsay();
      sprite.classList.remove('is-visible');
      window.setTimeout(function () {
        detach();
        sprite.hidden = true;
        if (reschedule && !state.dead) scheduleVisit();
      }, 420);
    }

    function scoreHost(host, config, trailerContext) {
      var heading = getHostSectionHeadingText(host);
      var score = 1;
      config.preferredHeadings.forEach(function (keyword) {
        if (heading.indexOf(keyword.toLowerCase()) !== -1) score += 4;
      });
      if (heading.indexOf('design work samples') !== -1) score += 2;
      if (heading.indexOf('project information') !== -1) score += 2;
      if (heading.indexOf('responsibilities') !== -1) score += 2;
      if (trailerContext.active && getSectionForHost(host) === trailerContext.section) score += 12;
      if (trailerContext.active && heading.indexOf('trailer') !== -1) score += 8;
      if (getScrollRatio() < 0.28 && heading.indexOf('gallery') !== -1) score += 2;
      if (state.lastHost && host === state.lastHost && dividers.length > 1) score -= 1;
      if (!hostIsVisible(host)) score -= 100;
      return Math.max(1, score);
    }

    function chooseHost(config) {
      if (!dividers.length) return null;
      var trailerContext = findActiveTrailerContext();
      var visible = dividers.filter(hostIsVisible);
      if (!visible.length) return null;

      if (trailerContext.active) {
        var directHost = getHostForSection(trailerContext.section);
        if (directHost && hostIsVisible(directHost)) {
          var trailerKey = currentPageKey + '::' + getHeadingForHost(directHost);
          if (!state.trailerShown[trailerKey] && Math.random() < 0.9) return directHost;
        }
      }

      var weighted = [];
      visible.forEach(function (host) {
        var score = scoreHost(host, config, trailerContext);
        for (var i = 0; i < score; i += 1) weighted.push(host);
      });
      return weighted[Math.floor(Math.random() * weighted.length)] || visible[0];
    }

    function chooseSide(config) {
      if (config.sideBias === 'left') return Math.random() < 0.72 ? 'left' : 'right';
      if (config.sideBias === 'right') return Math.random() < 0.72 ? 'right' : 'left';
      return Math.random() < 0.5 ? 'left' : 'right';
    }

    function maybeApplyAccessory(config, allowAccessory) {
      accessory.className = 'wickle-accessory';
      var wear = !!(allowAccessory && config.accessory && Math.random() < 0.58);
      if (!wear) {
        accessory.hidden = true;
        state.activeAccessory = '';
        state.activeAccessoryClass = '';
        return;
      }
      accessory.classList.add(config.accessoryClass);
      accessory.src = config.accessory;
      accessory.hidden = false;
      state.activeAccessory = config.accessory;
      state.activeAccessoryClass = config.accessoryClass;
    }

    function placeWickle(host, hostType) {
      if (!host) return false;
      if (!hostIsVisible(host) && hostType !== 'switch') return false;
      var config = getWicklePageConfig();
      detach();
      state.host = host;
      state.hostType = hostType || 'divider';
      state.lastHost = hostType === 'divider' ? host : state.lastHost;
      host.appendChild(sprite);
      sprite.hidden = false;
      clearPresentationClasses();

      if (state.hostType === 'switch') {
        sprite.classList.add('is-switch-host', config.toneClass);
        bubble.classList.add('is-switch-host', config.toneClass);
        maybeApplyAccessory(config, Math.random() < 0.32);
        positionBubble();
        return true;
      }

      var side = chooseSide(config);
      var variant = Math.floor(Math.random() * 3) + 1;
      sprite.classList.add('is-' + side, 'variant-' + variant, config.toneClass);
      bubble.classList.add('is-' + side, config.toneClass);
      maybeApplyAccessory(config, true);

      if (side === 'left') {
        if (variant === 2) sprite.classList.add('is-flipped');
      } else if (variant !== 2) {
        sprite.classList.add('is-flipped');
      }

      positionBubble();
      return true;
    }

    function maybeAutoComment(host) {
      var config = getWicklePageConfig();
      var trailerContext = findActiveTrailerContext();
      var isTrailerHost = state.hostType === 'switch' || getHostSectionHeadingText(host).indexOf('trailer') !== -1 || (trailerContext.active && getSectionForHost(host) === trailerContext.section);
      if (!isTrailerHost) return;
      if (Math.random() > config.autoTrailerCommentChance) return;
      state.murmurTimer = window.setTimeout(function () {
        if (!state.host || state.host !== host || document.hidden) return;
        say(getContextLine(host, false, true));
      }, randomRange(900, 1800));
    }

    function chooseSwitchHost() {
      if (!switchStack || !switchButton) return null;
      if (pickBroken()) return null;
      if ((root.getAttribute('data-theme') || pickTheme()) !== 'light') return null;
      if (Date.now() < state.switchCooldownUntil) return null;
      if (!hostIsVisible(switchStack)) return null;
      return Math.random() < 0.14 ? switchStack : null;
    }

    function startLightAmbush() {
      if (!state.host || state.hostType !== 'switch') return;
      state.lightAmbushArmed = true;
      window.__wickleLightMisclickBoost.active = true;
      window.__wickleLightMisclickBoost.until = Date.now() + 5200;
      state.murmurTimer = window.setTimeout(function () {
        if (!state.host || state.hostType !== 'switch') return;
        say(chooseFreshLine(getSwitchLines('idle')));
      }, randomRange(520, 1200));
      state.switchTimer = window.setTimeout(function () {
        if (!state.host || state.hostType !== 'switch' || !state.lightAmbushArmed) return;
        playInnerAnimation([
          { transform: 'translate3d(0,0,0) scale(1,1)' },
          { transform: 'translate3d(0,-1px,0) scale(1.02,.98)' },
          { transform: 'translate3d(0,0,0) scale(.98,1.02)' },
          { transform: 'translate3d(0,-2px,0) scale(1.03,.97)' },
          { transform: 'translate3d(0,0,0) scale(1,1)' }
        ], { duration: 460, easing: 'steps(4,end)' });
        window.setTimeout(function () {
          if (!state.host || state.hostType !== 'switch' || !state.lightAmbushArmed) return;
          applyTheme('dark');
          if (switchButton) {
            switchButton.classList.remove('sb-press');
            void switchButton.offsetWidth;
            switchButton.classList.add('sb-press');
            window.setTimeout(function () { switchButton.classList.remove('sb-press'); }, 180);
          }
          state.lightAmbushArmed = false;
          playSound(lightSuccessSounds, { volume: 0.72, rate: 0.96 + Math.random() * 0.08 });
          playSound(TOGGLE_SOUND, { volume: 0.14, rate: 1 });
          say(chooseFreshLine(getSwitchLines('success')));
          state.switchCooldownUntil = Date.now() + randomRange(28000, 42000);
          clearHideTimer();
          state.bubbleTimer = window.setTimeout(function () {
            hideWickle(true);
          }, randomRange(2200, 3400));
        }, 240);
      }, randomRange(2300, 4200));
    }

    function handleLightAmbushBlocked() {
      if (!state.host || state.hostType !== 'switch') return;
      state.lightAmbushArmed = false;
      window.__wickleLightMisclickBoost.active = false;
      playSound(lightFailSounds, { volume: 0.72, rate: 0.96 + Math.random() * 0.08 });
      say(chooseFreshLine(getSwitchLines('fail')));
      clearHideTimer();
      state.bubbleTimer = window.setTimeout(function () {
        hideWickle(true);
      }, randomRange(3000, 5000));
      state.switchCooldownUntil = Date.now() + randomRange(18000, 26000);
    }

    function handleLightAmbushSuccessFromUser() {
      if (!state.host || state.hostType !== 'switch') return;
      if (!state.lightAmbushArmed) return;
      state.lightAmbushArmed = false;
      window.__wickleLightMisclickBoost.active = false;
      playSound(lightSuccessSounds, { volume: 0.72, rate: 0.98 + Math.random() * 0.06 });
      say(chooseFreshLine(getSwitchLines('success')));
      clearHideTimer();
      state.bubbleTimer = window.setTimeout(function () {
        hideWickle(true);
      }, randomRange(2200, 3400));
      state.switchCooldownUntil = Date.now() + randomRange(28000, 42000);
    }

    function showWickle() {
      if (document.hidden || state.dead) {
        if (!state.dead) scheduleVisit();
        return;
      }

      var config = getWicklePageConfig();
      var trailerContext = findActiveTrailerContext();
      var idleFor = Date.now() - state.lastInteraction;
      var requiredIdle = trailerContext.active ? Math.min(config.requiredIdle, 1800) : config.requiredIdle;
      if (idleFor < requiredIdle) {
        if (trailerContext.active) scheduleVisitSoon();
        else scheduleVisit();
        return;
      }

      var switchHost = chooseSwitchHost();
      var host = switchHost || chooseHost(config);
      if (!host) {
        scheduleVisitSoon();
        return;
      }
      if (!placeWickle(host, switchHost ? 'switch' : 'divider')) {
        scheduleVisitSoon();
        return;
      }

      state.showAt = Date.now();
      state.hasShownOnce = true;
      state.clickStamps = [];
      state.instanceClickLineShown = false;

      if (!switchHost) {
        var trailerKey = currentPageKey + '::' + getHeadingForHost(host);
        if (getHostSectionHeadingText(host).indexOf('trailer') !== -1) state.trailerShown[trailerKey] = true;
      }

      window.requestAnimationFrame(function () {
        sprite.classList.add('is-visible');
        positionBubble();
      });

      scheduleShiverIfNeeded();

      if (state.hostType === 'switch') {
        startLightAmbush();
        state.hideTimer = window.setTimeout(function () {
          if (state.host && state.hostType === 'switch' && state.lightAmbushArmed) startLightAmbush();
        }, 6000);
        return;
      }

      maybeAutoComment(host);

      state.hideTimer = window.setTimeout(function () {
        hideWickle(true);
      }, randomRange(config.idleVisibleRange[0], config.idleVisibleRange[1]));
    }

    function scheduleVisitSoon() {
      if (state.host || state.dead) return;
      if (state.visitTimer) window.clearTimeout(state.visitTimer);
      state.visitTimer = window.setTimeout(function () {
        state.visitTimer = 0;
        if (document.hidden) {
          scheduleVisit();
          return;
        }
        showWickle();
      }, randomRange(1600, 2800));
    }

    function scheduleVisit() {
      if (state.dead) return;
      if (state.visitTimer) window.clearTimeout(state.visitTimer);
      var config = getWicklePageConfig();
      var range = state.hasShownOnce ? config.repeatVisitDelay : config.firstVisitDelay;
      var trailerContext = findActiveTrailerContext();
      var delay = trailerContext.active ? randomRange(1800, 3400) : randomRange(range[0], range[1]);
      state.visitTimer = window.setTimeout(function () {
        state.visitTimer = 0;
        if (document.hidden) {
          scheduleVisit();
          return;
        }
        showWickle();
      }, delay);
    }

    function triggerDeath() {
      state.dead = true;
      sessionStorage.setItem(deadStorageKey, '1');
      cleanupTimers();
      maybeUnsay();
      playSound(dieSound, { volume: 0.84, rate: 1 });
      spawnDeathFall();
      sprite.classList.remove('is-visible');
      sprite.hidden = true;
      detach();
    }

    function handleSpriteClick(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      recordInteraction();
      if (!state.host || state.dead) return;

      emitDustParticles(sprite);
      playClickPop();
      playSound(clickSounds, { volume: 0.78, rate: 0.94 + Math.random() * 0.14 });

      var quickClick = (Date.now() - state.showAt) < 1500 && Math.random() < 0.1;
      if (quickClick) {
        playSound(rareClickSound, { volume: 0.72, rate: 0.98 + Math.random() * 0.06 });
        emitPurpleScum(sprite);
      }

      var now = Date.now();
      state.clickStamps = state.clickStamps.filter(function (stamp) { return now - stamp < 900; });
      state.clickStamps.push(now);

      var isFirstClickDialogue = !state.instanceClickLineShown;

      if (isFirstClickDialogue && dropAccessorySprite()) emitDustParticles(sprite);

      if (state.hostType !== 'switch' && state.clickStamps.length >= 4) {
        triggerDeath();
        return;
      }

      if (!isFirstClickDialogue) return;

      state.instanceClickLineShown = true;
      clearHideTimer();

      if (state.hostType === 'switch') {
        handleLightAmbushBlocked();
        return;
      }

      say(getContextLine(state.host, true, false));
      if (sessionStorage.getItem(resurrectStorageKey) === '1') sessionStorage.removeItem(resurrectStorageKey);
      var config = getWicklePageConfig();
      state.bubbleTimer = window.setTimeout(function () {
        hideWickle(true);
      }, randomRange(config.clickedVisibleRange[0], config.clickedVisibleRange[1]));
    }

    sprite.addEventListener('click', handleSpriteClick);

    if (switchButton && !switchButton.dataset.wickleSwitchBound) {
      switchButton.dataset.wickleSwitchBound = 'true';
      switchButton.addEventListener('click', function () {
        if (!state.host || state.hostType !== 'switch' || !state.lightAmbushArmed) return;
        window.setTimeout(function () {
          if (!state.host || state.hostType !== 'switch') return;
          if (pickBroken() || (root.getAttribute('data-theme') || pickTheme()) === 'dark') {
            handleLightAmbushSuccessFromUser();
          }
        }, 24);
      }, true);
    }

    ['pointerdown', 'keydown', 'scroll', 'touchstart', 'mousemove'].forEach(function (eventName) {
      window.addEventListener(eventName, recordInteraction, { passive: true });
    });

    window.addEventListener('scroll', function () {
      if (state.host && state.hostType !== 'switch' && !hostIsVisible(state.host)) {
        hideWickle(false);
        scheduleVisitSoon();
        return;
      }
      positionBubble();
    }, { passive: true });

    window.addEventListener('resize', function () {
      if (state.host && state.hostType !== 'switch' && !hostIsVisible(state.host)) {
        hideWickle(false);
        scheduleVisitSoon();
        return;
      }
      positionBubble();
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) hideWickle(false);
      else if (!state.dead) scheduleVisit();
    });

    bindTrailerWatchers();
    scheduleVisit();
  }


  function init() {


    setupSafetyResets();
    relocateLocationLine();
    setupDividerDecor();
    applyTheme(pickTheme());
    setupThemeToggle();
    setupDividerWickle();
    setupLightbox();
    setupVideoPlayback();
    setupIndexAvatarSecret();
    setupRevealAnimations();
    setupButtonMotion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
