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

  function paintBottomDividerBlack(divider) {
    if (!divider) return;
    divider.style.setProperty('--wickle-bottom-divider-color', '#000');
    divider.querySelectorAll('.divider-bar, .divider-endcap').forEach(function (part) {
      part.style.background = '#000';
      part.style.borderColor = '#000';
      part.style.color = '#000';
      part.style.boxShadow = 'none';
      part.style.filter = 'grayscale(1) brightness(0)';
      part.style.opacity = '1';
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

    var host = document.querySelector('main') ||
      document.querySelector('.page-content') ||
      document.querySelector('.page-shell') ||
      document.querySelector('.content') ||
      document.body;

    if (!host) return;

    var finalDivider = document.getElementById('final-page-divider');
    if (!finalDivider) {
      finalDivider = document.createElement('div');
      finalDivider.className = 'section-divider final-page-divider';
      finalDivider.id = 'final-page-divider';
      finalDivider.dataset.wickleBottom = 'true';
      finalDivider.setAttribute('aria-hidden', 'true');
      finalDivider.innerHTML = '<span class="divider-endcap divider-endcap-left" aria-hidden="true"></span><span class="divider-bar" aria-hidden="true"></span><span class="divider-endcap divider-endcap-right" aria-hidden="true"></span>';
      finalDivider.style.marginTop = '32px';
      finalDivider.style.marginBottom = '0';
      host.appendChild(finalDivider);
    }

    paintBottomDividerBlack(finalDivider);
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
    return {
      key: getWicklePageKey()
    };
  }


  function setupDividerWickle() {
    var dividers = Array.from(document.querySelectorAll('.section-divider'));
    var finalDivider = document.getElementById('final-page-divider');
    if (finalDivider && dividers.indexOf(finalDivider) === -1) dividers.push(finalDivider);
    if (!dividers.length) return;

    var spritePath = 'assets/ui/Wickle.png';
    var deathSpritePath = 'assets/ui/Wicklediesprite.png';
    var clickSounds = ['assets/ui/wickle-click-1.wav', 'assets/ui/wickle-click-2.wav'];
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

    var WICKLE_MIND = {
      philosophy: [
        'A page can be polished and still be hollow; Wickle distrusts hollowness.',
        'History survives in awkward details more often than in grand summaries.',
        'Play is learned through pressure, feedback, and memory, not just explanation.',
        'A system becomes legible when the player can predict one step ahead.',
        'Mortality is rude but useful. It clarifies the loop.'
      ],
      gameDesign: [
        'Wickle thinks in loops, affordances, readability, onboarding, pacing, verbs, and payoff.',
        'Wickle quietly grades interactions on clarity, consequence, and feel.',
        'Wickle believes a mechanic earns trust when it teaches itself through use.'
      ],
      history: [
        'Wickle has a weakness for ordinary historical details: paperwork, kit lists, clogs, plinths, and field repairs.',
        'Wickle knows a world feels true once the background labor is visible.',
        'Wickle respects primary sources because memory is a dramatic liar.'
      ],
      favorites: [
        'Thief',
        'Thief II',
        'Unreal Tournament',
        'Half-Life',
        'Morrowind',
        'Omikron: The Nomad Soul',
        'Diablo',
        'Legacy of Kain',
        'Doom',
        'Age of Empires',
        'Jedi Knight',
        'Jedi Academy',
        'Rune',
        'fan missions'
      ]
    };

    var WICKLE_DIALOGUE = {
      global: {
        top: {
          weird: [
            'Wickle prefers the odd bits near the top, before the page settles.',
            'The upper seams always feel less certain.',
            'Wickle arrived before the scroll position did.'
          ],
          fun: [
            'The best nonsense is front-loaded.',
            'Wickle saves the straight-backed professionalism for later.'
          ],
          fact: [
            'A page earns trust quickly when the structure is legible.',
            'Wickle likes when the top of a page tells you what sort of labor follows.'
          ],
          normal: [
            'Oh. You found Wickle.',
            'Wickle was inspecting this bit.',
            'This seems like a useful ledge.'
          ]
        },
        middle: {
          weird: [
            'The middle is where the page stops posing and starts proving.',
            'Wickle can hear the structure clicking together here.'
          ],
          fun: [
            'This is the meat of it.',
            'Middle sections are for serious little goblins.'
          ],
          fact: [
            'The middle of a project page is usually where ownership, process, and examples become verifiable.',
            'Readable production work leaves traces: scope, implementation notes, tuning, and proof.',
            'Wickle likes when the facts arrive before the page asks for admiration.'
          ],
          normal: [
            'This is where the page gets properly useful.',
            'Wickle prefers the parts with teeth.'
          ]
        },
        bottom: {
          weird: [
            'The lower seams remember every visitor.',
            'This is where pages get stranger and more honest.',
            'Wickle keeps a few odd thoughts below the fold.'
          ],
          fun: [
            'You scrolled far enough to earn the peculiar bits.',
            'Committed readers always find the weird crumbs.',
            'Wickle trusts a visitor who reads to the end.'
          ],
          fact: [
            'The bottom of a page usually carries the sharpest proof or the last structural note.',
            'Late-page material often says more about process than the opening summary.'
          ],
          normal: [
            'Still here. Good.',
            'Wickle knew someone would keep going.'
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
            'Wickle wins.'
          ],
          fail: [
            'No. Still bright.',
            'No overhead lights.',
            'Wickle nearly had it.',
            'Unfortunate that the light survives.'
          ]
        },
        bottomGuard: [
          'This is the bottom.',
          'This is the end.'
        ],
        deathRespawn: [
          'Wickle died, reflected briefly, and returned with notes.',
          'Mortality is inefficient, but apparently not permanent.',
          'Wickle remembers the floor. Poorly.'
        ],
        headings: {
          'project information': {
            fact: [
              'Project information sections work best when they stay concise and sortable.',
              'Fast framing matters. Years, role, studio, and scope should not hide.'
            ]
          },
          'responsibilities': {
            fact: [
              'Responsibilities blocks tell Wickle who actually carried the work.',
              'A good responsibilities section distinguishes ownership from proximity.'
            ]
          },
          'design work samples': {
            fact: [
              'Samples matter more when they sit close to the claims they support.',
              'Work samples are strongest when they show process as well as output.'
            ]
          },
          'gallery': {
            fact: [
              'A gallery should clarify the work, not merely decorate it.',
              'Screenshots pull their weight when they prove how the thing feels or reads.'
            ]
          },
          'trailer': {
            fact: [
              'A trailer should support the page, not argue with it.',
              'The best footage communicates loop, feel, and stakes before the viewer has time to drift.'
            ]
          }
        }
      },
      pages: {
        'index.html': {
          fact: [
            'This front page is built as a route finder: range first, then direct paths into proof.',
            'Wickle likes that the landing page tries to get visitors to the real work quickly.'
          ],
          weird: [
            'The house page always notices when somebody lingers.',
            'Wickle keeps the stranger crumbs near the front door.'
          ],
          fun: [
            'Thief taught Wickle that light, sound, and floor material are all level design.',
            'Unreal Tournament taught Wickle that speed reads best when the spaces stay honest.',
            'Half-Life taught Wickle that scripted onboarding works when it feels like the world teaching itself.',
            'Morrowind still feels like trespassing in an unknowable place.',
            'Omikron remains gloriously overcommitted to being strange.',
            'Diablo proves that oppressive tone can carry a tiny, clean loop a very long way.',
            'Legacy of Kain made melodrama sound intelligent.',
            'Doom understands combat grammar better than most modern games.',
            'Age of Empires lives or dies on economy readability and player timing.',
            'Jedi Knight and Jedi Academy make expression feel physical.',
            'Rune has splendidly rude melee heft.',
            'Fan missions are where systemic stealth still grows wild.'
          ],
          trailer: [],
          trailerFact: []
        },
        'cv.html': {
          fact: [
            'This page is a map of roles, years, ownership, and range; the project pages do the proving.',
            'Wickle reads the CV as an index of shipped labor rather than a decorative timeline.'
          ],
          weird: [
            'Résumé pages always sit very straight when nobody is looking.'
          ],
          fun: [
            'Wickle has opinions about stealth metrics, encounter pacing, economy reads, and historical material culture. Alarmingly many opinions.',
            'A proper CV page should point back toward the work itself, much like a good fan mission readme.'
          ],
          trailer: [],
          trailerFact: []
        },
        'the-deep.html': {
          fact: [
            'The Deep centers on exploration, cleanup, discovery, and transformation.',
            'This project kept changing during testing and level work, so the page has to carry both concept intent and live adjustment.',
            'The design work covers loop, tools, onboarding, HUD thinking, and production-facing documentation.'
          ],
          weird: [
            'Wickle respects the water from a safe architectural distance.'
          ],
          fun: [
            'I remember the satisfaction when the reef started reading cleanly again instead of just looking messy.',
            'The best moments here are when cleanup changes the space, not when the player merely points a tool at dirt.'
          ],
          trailer: [
            'Wickle only watches this trailer when the sound is on. Mood is half the read.',
            'I remember the loop reading best when cleanup, discovery, and environmental recovery all landed in the same breath.'
          ],
          trailerFact: [
            'The footage works when the environment visibly transforms instead of merely sparkling.',
            'One cave wireframe taught movement by making the player clean blocked jets and dodge timed blasts through a slalom.'
          ]
        },
        'b17-flying-fortress.html': {
          fact: [
            'This B-17 work is research assembled for production utility, not just atmosphere.',
            'Rows of bicycle plinths, clogs, issue records, and checklists matter because ordinary base life sells the setting.',
            'The pilot material split flying into distinct phases instead of treating a mission as one long blur.'
          ],
          weird: [
            'Archive pages always collect odd little truths.'
          ],
          fun: [
            'Wickle likes historical work that remembers paperwork, footwear, and traffic flow instead of worshipping only hardware.'
          ],
          trailer: [],
          trailerFact: []
        },
        'battle-cry-of-freedom.html': {
          fact: [
            'Readable battle spaces depend on routes, cover, sightlines, and pressure more than smoke alone.',
            'Historical multiplayer ground needs to communicate where danger gathers and where momentum can be stolen.'
          ],
          weird: [
            'Battlefield pages always feel like ambush country lower down.'
          ],
          fun: [
            'I remember how the better spaces in this kind of game make you choose between cover, angle, and momentum almost immediately.'
          ],
          trailer: [
            'I watch this for the ground first. Smoke is easy. Honest terrain is harder.',
            'I remember the nicest battlefield reads being the ones where landmarks and lanes stayed legible under pressure.'
          ],
          trailerFact: [
            'A wide battlefield trailer fails fast if the terrain stops communicating.'
          ]
        },
        'civitas.html': {
          fact: [
            'The Civitas sample is valuable because it is a live mid-production document, not a tidied trophy.',
            'Plots are the core unit: parcel land, assign purpose, then grow structures and upgrades from that logic.',
            'Boros, Hamlets, and larger settlement tiers step upward through a clear three-of-a-kind structure.'
          ],
          weird: [
            'Blueprint pages dream in straight lines.'
          ],
          fun: [
            'I remember the parceling fantasy being most satisfying when the rules stayed readable and the city felt authored instead of stamped.',
            'Renaissance map-art ambition only works if the economy and growth logic remain clean underneath it.'
          ],
          trailer: [
            'I remember this reading best when the footage showed both city rhythm and system clarity.',
            'Pretty roofs are pleasant, but the rules need to breathe on screen.'
          ],
          trailerFact: [
            'The project aimed for Renaissance bird\'s-eye map art brought to life rather than generic city-builder mush.'
          ]
        },
        'dinohab.html': {
          fact: [
            'DinoHab\'s harmony is deliberately three-way: plants feed dinosaurs, dinosaurs make waste, and fungi turn waste into compost.',
            'The macro loop was built around short daily check-ins rather than marathon sessions.',
            'The multitool was meant to scan, heal, place, remove, and replant without exploding into gadget clutter.'
          ],
          weird: [
            'The habitat pages make Wickle want to overwater something.'
          ],
          fun: [
            'I remember the loop clicking once fungi, waste, and plants started feeding one another visibly.',
            'Visible ecological feedback does most of the teaching here.'
          ],
          trailer: [
            'I watch this for readable cause and effect before the cute parts try to steal the scene.',
            'I remember lushness working best when the recovery ladder was obvious at a glance.'
          ],
          trailerFact: [
            'At full recovery the design called for cleaner air, more insects, healthier cover, and clearer signs that the habitat had turned around.'
          ]
        },
        'monster-simulator-3000.html': {
          fact: [
            'Monster Simulator 3000 depends on readable chaos: boss tells, throwable objects, objectives, rage gain, and perk effects all have to stay legible.',
            'The boss blimp, helicopter, and tank briefs are built around readable tells instead of cheap surprise damage.',
            'Throw assist was intentionally stronger up close so VR throws landed where players meant them to.'
          ],
          weird: [
            'Wickle is definitely not the monster.'
          ],
          fun: [
            'I remember baiting the helicopter into its own side and feeling very clever about it.',
            'Big destruction only feels good when the player can still tell why a plan worked.'
          ],
          trailer: [
            'I watch this for silhouette and intention. Big things go muddy fast.',
            'I remember the best reads being the ones where the city, the targets, and the threats all stayed distinct.'
          ],
          trailerFact: [
            'Spawn pressure was designed to increase near objectives and ease off when the player was hurt or farther away.'
          ]
        },
        'dune-sea.html': {
          fact: [
            'This work is strongest where pacing, player-facing read, and encounter pressure stay clear.'
          ],
          weird: [
            'Dry pages always whisper louder.'
          ],
          fun: [
            'Wide horizons are only useful when the player still knows what matters.'
          ],
          trailer: [
            'I remember this reading cleanly when the interface stayed calm and the space kept its pressure lines.'
          ],
          trailerFact: []
        },
        'half-rats-parasomnia.html': {
          fact: [
            'Mood only holds when the interaction read stays disciplined.',
            'Good QA notes capture not only what broke, but what the break did to the player.'
          ],
          weird: [
            'This page still feels like it is listening back.'
          ],
          fun: [
            'I remember the best horror reads being the ones that stayed legible while unsettling me.'
          ],
          trailer: [
            'I only watch this with sound. Silence cheats the mood.',
            'I remember the strongest passages being the ones where silhouette, space, and pacing kept the dread coherent.'
          ],
          trailerFact: []
        },
        'mount-and-blade-community-maps.html': {
          fact: [
            'This page is route craft first: lanes, sightlines, pressure points, and readable movement.',
            'Long-form community map work is mostly sustained tuning rather than one heroic gesture.'
          ],
          weird: [
            'Route pages carry tiny winds in them.'
          ],
          fun: [
            'I remember good multiplayer spaces revealing their intent in the first ten seconds of movement.'
          ],
          trailer: [
            'I watch this for path honesty. If the terrain lies, the fight lies.'
          ],
          trailerFact: []
        },
        'red-meat-games.html': {
          fact: [
            'Early studio work is often where breadth shows up most plainly: level work, production support, QA, and design all sharing the same day.',
            'Arena and progression work read best when pressure steps upward cleanly.'
          ],
          weird: [
            'Early-work pages always feel like crowded toolboxes.'
          ],
          fun: [
            'Practical hands matter more than grand speeches at this stage.'
          ],
          trailer: [
            'I remember arena rhythm being the real story here once the sparks settled.'
          ],
          trailerFact: []
        },
        'roll-together.html': {
          fact: [
            'Playful systems still need rigid clarity under the surface.',
            'Co-op obstacle work succeeds when timing and communication read without friction.'
          ],
          weird: [
            'Circular pages never fully stop moving.'
          ],
          fun: [
            'Whimsy benefits from clean edges more than almost anything.'
          ],
          trailer: [
            'I remember the playful bits working best once the obstacle language stayed consistent at speed.'
          ],
          trailerFact: []
        },
        '404.html': {
          fact: [
            'Even a fallback page is doing route work.'
          ],
          weird: [
            'Lost pages drift a little at night.'
          ],
          fun: [
            'A good dead end still points home.'
          ],
          trailer: [],
          trailerFact: []
        }
      }
    };

    var state = {
      host: null,
      hostType: '',
      visitTimer: 0,
      hideTimer: 0,
      bubbleTimer: 0,
      shiverTimer: 0,
      switchTimer: 0,
      ponderTimer: 0,
      lastInteraction: Date.now(),
      hasShownOnce: false,
      recentLines: [],
      lastHost: null,
      clickStamps: [],
      currentLine: '',
      instanceClickLineShown: false,
      dead: sessionStorage.getItem(deadStorageKey) === '1',
      showAt: 0,
      trailerVideos: [],
      lightAmbushArmed: false,
      switchCooldownUntil: 0,
      bottomNoticeCooldownUntil: 0,
      resurrectLinePending: sessionStorage.getItem(resurrectStorageKey) === '1',
      privateThought: ''
    };

    if (state.dead) return;

    var sprite = document.createElement('button');
    sprite.type = 'button';
    sprite.className = 'wickle-peek';
    sprite.setAttribute('aria-label', 'Wickle is peeking from the divider');
    sprite.setAttribute('title', 'Wickle');
    sprite.innerHTML = '<span class="wickle-inner"><img class="wickle-base" src="' + spritePath + '" alt="" aria-hidden="true"></span>';
    sprite.hidden = true;

    var inner = sprite.querySelector('.wickle-inner');

    var bubble = document.createElement('div');
    bubble.className = 'wickle-bubble';
    bubble.setAttribute('role', 'status');
    bubble.setAttribute('aria-live', 'polite');
    document.body.appendChild(bubble);

    function randomRange(min, max) {
      return Math.round(min + Math.random() * (max - min));
    }

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    }

    function getScrollRatio() {
      var doc = document.documentElement;
      var top = window.scrollY || doc.scrollTop || 0;
      var max = Math.max(1, (doc.scrollHeight || 1) - (window.innerHeight || doc.clientHeight || 1));
      return top / max;
    }

    function getPageRegion() {
      var ratio = getScrollRatio();
      if (ratio < 0.24) return 'top';
      if (ratio > 0.72) return 'bottom';
      return 'middle';
    }

    function isBottomDivider(host) {
      return !!(host && host.dataset && host.dataset.wickleBottom === 'true');
    }

    function getSectionForHost(host) {
      return host ? host.closest('.section') : null;
    }

    function getHeadingForHost(host) {
      var section = getSectionForHost(host);
      var heading = section ? section.querySelector('h1, h2, h3') : null;
      return heading ? heading.textContent.trim() : '';
    }

    function getHostHeadingLower(host) {
      return getHeadingForHost(host).toLowerCase();
    }

    function hostIsVisible(host) {
      if (!host || !host.getBoundingClientRect) return false;
      var rect = host.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight || 0;
      var vw = window.innerWidth || document.documentElement.clientWidth || 0;
      if (!rect.width && !rect.height) return false;
      return rect.bottom > 24 && rect.top < vh - 24 && rect.right > 24 && rect.left < vw - 24;
    }

    function nearBottom() {
      var doc = document.documentElement;
      var scrollBottom = (window.scrollY || doc.scrollTop || 0) + (window.innerHeight || doc.clientHeight || 0);
      return scrollBottom >= (doc.scrollHeight || 0) - 6;
    }

    function recordInteraction() {
      state.lastInteraction = Date.now();
    }

    function clearTimer(key) {
      if (state[key]) {
        window.clearTimeout(state[key]);
        state[key] = 0;
      }
    }

    function cleanupTimers() {
      ['visitTimer', 'hideTimer', 'bubbleTimer', 'shiverTimer', 'switchTimer', 'ponderTimer'].forEach(clearTimer);
    }

    function clearHideTimers() {
      ['hideTimer', 'bubbleTimer'].forEach(clearTimer);
    }

    function detach() {
      if (sprite.parentNode) sprite.parentNode.removeChild(sprite);
      state.host = null;
      state.hostType = '';
    }

    function resetPresentation() {
      sprite.className = 'wickle-peek';
      bubble.className = 'wickle-bubble';
      bubble.classList.remove('is-visible', 'is-below');
      bubble.style.removeProperty('--wickle-bubble-x');
      bubble.style.removeProperty('--wickle-bubble-y');
      bubble.style.removeProperty('--wickle-tail-x');
      sprite.classList.remove('is-visible', 'is-speaking');
    }

    function normalizeLine(line) {
      return (line || 'Oh. You found Wickle.').replace(/\s+/g, ' ').trim();
    }

    function pushRecentLine(line) {
      if (!line) return;
      state.recentLines.push(line);
      if (state.recentLines.length > 18) state.recentLines.shift();
    }

    function chooseFreshLine(lines) {
      var cleaned = (lines || []).map(normalizeLine).filter(Boolean);
      if (!cleaned.length) return 'Oh. You found Wickle.';
      var unique = cleaned.filter(function (line, index) { return cleaned.indexOf(line) === index; });
      var fresh = unique.filter(function (line) { return state.recentLines.indexOf(line) === -1; });
      var pool = fresh.length ? fresh : unique;
      var chosen = pool[Math.floor(Math.random() * pool.length)];
      pushRecentLine(chosen);
      return chosen;
    }

    function playSound(source, options) {
      try {
        var src = Array.isArray(source) ? source[Math.floor(Math.random() * source.length)] : source;
        if (!src) return;
        var audio = new Audio(src);
        audio.preload = 'auto';
        audio.volume = options && options.volume != null ? options.volume : 0.78;
        audio.playbackRate = options && options.rate != null ? options.rate : (0.95 + Math.random() * 0.12);
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
      clearTimer('shiverTimer');
      if (Math.random() > 0.58) return;
      state.shiverTimer = window.setTimeout(function () {
        if (!state.host || !sprite.classList.contains('is-visible')) return;
        playShiver();
      }, randomRange(900, 2600));
    }

    function positionBubble() {
      if (!bubble.classList.contains('is-visible') || !state.host || !sprite.parentNode) return;
      var rect = sprite.getBoundingClientRect();
      var margin = 10;
      bubble.style.maxWidth = Math.min(280, Math.max(190, window.innerWidth - margin * 2)) + 'px';
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

    function say(line) {
      state.currentLine = normalizeLine(line);
      bubble.textContent = state.currentLine;
      bubble.classList.add('is-visible');
      sprite.classList.add('is-speaking');
      positionBubble();
      playSpeechBob();
      scheduleShiverIfNeeded();
    }

    function unsay() {
      bubble.classList.remove('is-visible');
      bubble.classList.remove('is-below');
      sprite.classList.remove('is-speaking');
      state.currentLine = '';
    }

    function schedulePondering() {
      clearTimer('ponderTimer');
      state.ponderTimer = window.setTimeout(function () {
        var combined = WICKLE_MIND.philosophy.concat(WICKLE_MIND.gameDesign).concat(WICKLE_MIND.history);
        state.privateThought = combined[Math.floor(Math.random() * combined.length)];
        schedulePondering();
      }, randomRange(9000, 18000));
    }

    function videoEligibleForWickle(video) {
      if (!video) return false;
      return !video.paused && !video.ended && !video.muted && Number(video.volume || 0) > 0.01 && video.readyState > 1;
    }

    function bindTrailerWatchers() {
      state.trailerVideos = Array.from(document.querySelectorAll('.video-frame video, video')).map(function (video) {
        return { video: video, section: video.closest('.section') };
      }).filter(function (entry) { return !!entry.section; });

      state.trailerVideos.forEach(function (entry) {
        var video = entry.video;
        if (!video || video.dataset.wickleTrailerBound === 'true') return;
        video.dataset.wickleTrailerBound = 'true';

        ['play', 'playing', 'volumechange'].forEach(function (eventName) {
          video.addEventListener(eventName, function () {
            if (videoEligibleForWickle(video)) scheduleVisitSoon();
          });
        });

        ['pause', 'ended'].forEach(function (eventName) {
          video.addEventListener(eventName, function () {
            if (state.host && getSectionForHost(state.host) === entry.section) {
              clearHideTimers();
              state.bubbleTimer = window.setTimeout(function () {
                hideWickle(true);
              }, randomRange(1400, 2400));
            }
          });
        });
      });
    }

    function findActiveTrailerContext() {
      var best = null;
      state.trailerVideos.forEach(function (entry) {
        var video = entry.video;
        var section = entry.section;
        if (!videoEligibleForWickle(video) || !section || !hostIsVisible(section)) return;
        if (!best) {
          best = { video: video, section: section, reason: 'play' };
          return;
        }
        var currentDistance = Math.abs(section.getBoundingClientRect().top);
        var bestDistance = Math.abs(best.section.getBoundingClientRect().top);
        if (currentDistance < bestDistance) best = { video: video, section: section, reason: 'play' };
      });
      return best || { video: null, section: null, reason: '' };
    }

    function mergeInto(into, source) {
      if (!source) return into;
      ['fact', 'weird', 'fun', 'normal', 'trailer', 'trailerFact'].forEach(function (key) {
        if (Array.isArray(source[key]) && source[key].length) into[key] = into[key].concat(source[key]);
      });
      return into;
    }

    function collectPools(host, isTrailerHost) {
      var region = state.hostType === 'bottom' ? 'bottom' : getPageRegion();
      var output = { fact: [], weird: [], fun: [], normal: [], trailer: [], trailerFact: [] };
      var page = WICKLE_DIALOGUE.pages[currentPageKey] || {};
      var heading = getHostHeadingLower(host);

      mergeInto(output, WICKLE_DIALOGUE.global[region] || {});
      mergeInto(output, page);

      Object.keys(WICKLE_DIALOGUE.global.headings || {}).forEach(function (key) {
        if (heading.indexOf(key) !== -1) mergeInto(output, WICKLE_DIALOGUE.global.headings[key]);
      });

      if (state.resurrectLinePending) {
        output.weird = output.weird.concat(WICKLE_DIALOGUE.global.deathRespawn);
      }

      if (!isTrailerHost) {
        output.trailer = [];
        output.trailerFact = [];
      }

      return output;
    }

    function getSwitchLine(kind) {
      return chooseFreshLine((WICKLE_DIALOGUE.global.switch[kind] || WICKLE_DIALOGUE.global.switch.idle || ['Too bright.']));
    }

    function getContextLine(host, clicked, forceTrailer) {
      if (state.hostType === 'bottom') return chooseFreshLine(WICKLE_DIALOGUE.global.bottomGuard);
      var trailerContext = findActiveTrailerContext();
      var isTrailerHost = !!forceTrailer || getHostHeadingLower(host).indexOf('trailer') !== -1 || (trailerContext.section && getSectionForHost(host) === trailerContext.section);
      var region = getPageRegion();
      var pools = collectPools(host, isTrailerHost);
      var roll = Math.random();
      var choices = [];

      if (region === 'middle') {
        if (clicked) {
          if (isTrailerHost && roll < 0.5) choices = pools.trailer.concat(pools.trailerFact);
          else if (roll < 0.78) choices = pools.fact.concat(pools.normal);
          else choices = pools.fun.concat(pools.weird);
        } else {
          if (isTrailerHost && roll < 0.56) choices = pools.trailer.concat(pools.trailerFact);
          else if (roll < 0.84) choices = pools.fact.concat(pools.normal);
          else choices = pools.fun.concat(pools.weird);
        }
      } else {
        if (clicked) {
          if (isTrailerHost && roll < 0.3) choices = pools.trailer.concat(pools.trailerFact);
          else if (roll < 0.62) choices = pools.weird.concat(pools.fun);
          else if (roll < 0.86) choices = pools.fact.concat(pools.normal);
          else choices = pools.normal.concat(pools.fun);
        } else {
          if (isTrailerHost && roll < 0.22) choices = pools.trailer.concat(pools.trailerFact);
          else if (roll < 0.66) choices = pools.weird.concat(pools.fun);
          else if (roll < 0.88) choices = pools.fact.concat(pools.normal);
          else choices = pools.normal.concat(pools.weird);
        }
      }

      return chooseFreshLine(choices);
    }

    function chooseSwitchHost() {
      if (!switchStack || !switchButton) return null;
      if (pickBroken()) return null;
      if ((root.getAttribute('data-theme') || pickTheme()) !== 'light') return null;
      if (Date.now() < state.switchCooldownUntil) return null;
      if (!hostIsVisible(switchStack)) return null;
      return Math.random() < 0.14 ? switchStack : null;
    }

    function chooseStandardHost() {
      var trailerContext = findActiveTrailerContext();
      if (trailerContext.section) {
        var trailerHost = dividers.find(function (host) {
          return !isBottomDivider(host) && getSectionForHost(host) === trailerContext.section && hostIsVisible(host);
        });
        if (trailerHost && Math.random() < 0.72) return trailerHost;
      }

      var visible = dividers.filter(function (host) {
        return !isBottomDivider(host) && hostIsVisible(host);
      });

      if (!visible.length) return null;

      var topHost = visible.slice().sort(function (a, b) {
        return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
      })[0];

      var viewportMid = (window.innerHeight || document.documentElement.clientHeight || 0) * 0.55;
      var followHost = visible.slice().sort(function (a, b) {
        return Math.abs((a.getBoundingClientRect().top + a.getBoundingClientRect().height * 0.5) - viewportMid) -
          Math.abs((b.getBoundingClientRect().top + b.getBoundingClientRect().height * 0.5) - viewportMid);
      })[0];

      var chosen = Math.random() < 0.5 ? followHost : topHost;

      if (visible.length > 1 && chosen === state.lastHost) {
        chosen = chosen === followHost ? topHost : followHost;
      }

      return chosen || visible[0];
    }

    function placeWickle(host, hostType) {
      if (!host) return false;
      if (!hostIsVisible(host) && hostType !== 'switch' && hostType !== 'bottom') return false;

      detach();
      resetPresentation();
      state.host = host;
      state.hostType = hostType || 'divider';
      if (state.hostType === 'divider') state.lastHost = host;

      host.appendChild(sprite);
      sprite.hidden = false;

      if (state.hostType === 'switch') {
        sprite.classList.add('is-switch-host');
        bubble.classList.add('is-switch-host');
      } else if (state.hostType === 'bottom') {
        sprite.classList.add('is-right');
        bubble.classList.add('is-right');
      } else {
        var preferFollow = Math.random() < 0.5;
        var side = preferFollow ? (Math.random() < 0.5 ? 'left' : 'right') : 'left';
        var variant = Math.floor(Math.random() * 3) + 1;
        sprite.classList.add('is-' + side, 'variant-' + variant);
        bubble.classList.add('is-' + side);
        if ((side === 'left' && variant === 2) || (side === 'right' && variant !== 2)) {
          sprite.classList.add('is-flipped');
        }
      }

      positionBubble();
      return true;
    }

    function hideWickle(reschedule) {
      clearHideTimers();
      clearTimer('switchTimer');
      state.lightAmbushArmed = false;
      unsay();
      sprite.classList.remove('is-visible');

      window.setTimeout(function () {
        detach();
        sprite.hidden = true;
        if (reschedule && !state.dead) scheduleVisit();
      }, 420);
    }

    function showWickle(hostTypeOverride) {
      if (document.hidden || state.dead) {
        if (!state.dead) scheduleVisit();
        return;
      }

      var idleFor = Date.now() - state.lastInteraction;
      var requiredIdle = findActiveTrailerContext().section ? 1800 : 3200;

      if (!hostTypeOverride && idleFor < requiredIdle) {
        scheduleVisit();
        return;
      }

      var hostType = hostTypeOverride || '';
      var host = null;

      if (hostType === 'bottom') {
        host = finalDivider;
      } else if (hostType === 'switch') {
        host = chooseSwitchHost();
      } else {
        host = chooseSwitchHost();
        hostType = host ? 'switch' : 'divider';
        if (!host) host = chooseStandardHost();
      }

      if (!host) {
        scheduleVisitSoon();
        return;
      }

      if (!placeWickle(host, hostType)) {
        scheduleVisitSoon();
        return;
      }

      state.showAt = Date.now();
      state.hasShownOnce = true;
      state.clickStamps = [];
      state.instanceClickLineShown = false;

      window.requestAnimationFrame(function () {
        sprite.classList.add('is-visible');
        positionBubble();
      });

      scheduleShiverIfNeeded();

      if (state.resurrectLinePending && currentPageKey === 'index.html' && state.hostType !== 'switch') {
        say(chooseFreshLine(WICKLE_DIALOGUE.global.deathRespawn));
        state.resurrectLinePending = false;
        sessionStorage.removeItem(resurrectStorageKey);
        state.bubbleTimer = window.setTimeout(function () {
          hideWickle(true);
        }, randomRange(3200, 4800));
        return;
      }

      if (state.hostType === 'switch') {
        startLightAmbush();
        state.hideTimer = window.setTimeout(function () {
          if (state.host && state.hostType === 'switch' && state.lightAmbushArmed) hideWickle(true);
        }, 6200);
        return;
      }

      if (state.hostType === 'bottom') {
        say(chooseFreshLine(WICKLE_DIALOGUE.global.bottomGuard));
        state.bubbleTimer = window.setTimeout(function () {
          hideWickle(true);
        }, randomRange(1800, 2600));
        return;
      }

      var trailerContext = findActiveTrailerContext();
      if (trailerContext.section && getSectionForHost(host) === trailerContext.section && Math.random() < 0.74) {
        state.bubbleTimer = window.setTimeout(function () {
          if (!state.host || state.host !== host) return;
          say(getContextLine(host, false, true));
        }, randomRange(700, 1600));
      }

      state.hideTimer = window.setTimeout(function () {
        hideWickle(true);
      }, randomRange(4200, 7000));
    }

    function scheduleVisitSoon() {
      if (state.dead || state.host) return;
      clearTimer('visitTimer');
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
      clearTimer('visitTimer');
      var trailerContext = findActiveTrailerContext();
      var delay = trailerContext.section ? randomRange(1800, 3400) : (state.hasShownOnce ? randomRange(11000, 18000) : randomRange(3600, 5200));
      state.visitTimer = window.setTimeout(function () {
        state.visitTimer = 0;
        if (document.hidden) {
          scheduleVisit();
          return;
        }
        showWickle();
      }, delay);
    }

    function startLightAmbush() {
      if (!state.host || state.hostType !== 'switch') return;
      state.lightAmbushArmed = true;
      state.switchTimer = window.setTimeout(function () {
        if (!state.host || state.hostType !== 'switch' || !state.lightAmbushArmed) return;
        applyTheme('dark');
        playSound(lightSuccessSounds, { volume: 0.72, rate: 1.0 });
        playSound(TOGGLE_SOUND, { volume: 0.14, rate: 1.0 });
        say(getSwitchLine('success'));
        state.lightAmbushArmed = false;
        state.switchCooldownUntil = Date.now() + randomRange(28000, 42000);
        clearHideTimers();
        state.bubbleTimer = window.setTimeout(function () {
          hideWickle(true);
        }, randomRange(2200, 3400));
      }, randomRange(2300, 4200));

      state.bubbleTimer = window.setTimeout(function () {
        if (!state.host || state.hostType !== 'switch') return;
        say(getSwitchLine('idle'));
      }, randomRange(520, 1200));
    }

    function handleLightAmbushFail() {
      if (!state.host || state.hostType !== 'switch') return;
      state.lightAmbushArmed = false;
      clearTimer('switchTimer');
      playSound(lightFailSounds, { volume: 0.72, rate: 1.0 });
      say(getSwitchLine('fail'));
      state.switchCooldownUntil = Date.now() + randomRange(18000, 26000);
      clearHideTimers();
      state.bubbleTimer = window.setTimeout(function () {
        hideWickle(true);
      }, randomRange(2400, 3600));
    }

    function handleLightAmbushSuccessFromUser() {
      if (!state.host || state.hostType !== 'switch' || !state.lightAmbushArmed) return;
      state.lightAmbushArmed = false;
      clearTimer('switchTimer');
      playSound(lightSuccessSounds, { volume: 0.72, rate: 1.0 });
      say(getSwitchLine('success'));
      state.switchCooldownUntil = Date.now() + randomRange(28000, 42000);
      clearHideTimers();
      state.bubbleTimer = window.setTimeout(function () {
        hideWickle(true);
      }, randomRange(2200, 3400));
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
      dead.style.width = Math.max(128, rect.width * 3).toFixed(2) + 'px';
      dead.style.setProperty('--death-x', ((Math.random() * 90) - 45).toFixed(2) + 'px');
      dead.style.setProperty('--death-rot', ((Math.random() * 140) - 70).toFixed(2) + 'deg');
      layer.appendChild(dead);
      window.setTimeout(function () {
        if (dead && dead.parentNode) dead.parentNode.removeChild(dead);
      }, 2800);
    }

    function triggerDeath() {
      state.dead = true;
      sessionStorage.setItem(deadStorageKey, '1');
      sessionStorage.setItem(resurrectStorageKey, '1');
      cleanupTimers();
      unsay();
      playSound(dieSound, { volume: 0.84, rate: 1.0 });
      spawnDeathFall();
      sprite.classList.remove('is-visible');
      sprite.hidden = true;
      detach();
    }

    function triggerBottomNotice() {
      if (!finalDivider || state.dead) return;
      if (Date.now() < state.bottomNoticeCooldownUntil) return;
      if (!nearBottom() || !hostIsVisible(finalDivider)) return;
      state.bottomNoticeCooldownUntil = Date.now() + 2400;
      clearHideTimers();
      clearTimer('visitTimer');
      showWickle('bottom');
    }

    function handleSpriteClick(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      recordInteraction();

      if (!state.host || state.dead) return;

      emitDustParticles(sprite);
      playClickPop();
      playSound(clickSounds, { volume: 0.78 });

      var quickClick = (Date.now() - state.showAt) < 1500 && Math.random() < 0.1;
      if (quickClick) {
        playSound(rareClickSound, { volume: 0.72, rate: 1.0 });
        emitPurpleScum(sprite);
      }

      var now = Date.now();
      state.clickStamps = state.clickStamps.filter(function (stamp) { return now - stamp < 900; });
      state.clickStamps.push(now);

      if (state.hostType !== 'switch' && state.hostType !== 'bottom' && state.clickStamps.length >= 4) {
        triggerDeath();
        return;
      }

      if (state.instanceClickLineShown) return;
      state.instanceClickLineShown = true;
      clearHideTimers();

      if (state.hostType === 'switch') {
        handleLightAmbushFail();
        return;
      }

      if (state.hostType === 'bottom') {
        say(chooseFreshLine(WICKLE_DIALOGUE.global.bottomGuard));
        state.bubbleTimer = window.setTimeout(function () {
          hideWickle(true);
        }, randomRange(1800, 2600));
        return;
      }

      say(getContextLine(state.host, true, false));
      state.bubbleTimer = window.setTimeout(function () {
        hideWickle(true);
      }, randomRange(3200, 5200));
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

    window.addEventListener('wheel', function (ev) {
      if (ev.deltaY > 0) triggerBottomNotice();
    }, { passive: true });

    window.addEventListener('keydown', function (ev) {
      if (ev.key === 'End' || ev.key === 'PageDown' || ev.key === 'ArrowDown' || ev.key === ' ') {
        triggerBottomNotice();
      }
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
    schedulePondering();
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
