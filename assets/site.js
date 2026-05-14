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
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
      return 'light';
    } catch (e) {
      return 'light';
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

  function updateGameReviewPageButtons(theme) {
    var path = ((window.location.pathname || '').split('/').pop() || 'index.html').toLowerCase();
    if (['design-game-reviews.html', 'design-notes.html', 'design-essay-simplicity.html'].indexOf(path) === -1) return;

    document.querySelectorAll('.design-notes-links .button').forEach(function (button) {
      if (theme === 'dark') {
        button.style.background = '#3f7a1f';
        button.style.borderColor = '#3f7a1f';
        button.style.color = '#000';
      } else {
        button.style.removeProperty('background');
        button.style.removeProperty('border-color');
        button.style.removeProperty('color');
      }
    });
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    root.style.setProperty('--bg-pattern', buildBackground());
    updateThemeAssets(theme);
    updateGameReviewPageButtons(theme);
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
          if (!stack.classList.contains('fuse-panel-open')) {
            openFusePanel();
          }
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
    var videos = Array.from(document.querySelectorAll('.video-frame video, video'));
    if (!videos.length) return;

    function tryPlay(video) {
      if (!video || video.ended) return;
      try {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      } catch (e) {}
    }

    function pauseVideo(video) {
      if (!video || video.paused || video.ended) return;
      try {
        video.pause();
      } catch (e) {}
    }

    videos.forEach(function (video) {
      if (video.dataset.sbVideoBound === 'true') return;
      video.dataset.sbVideoBound = 'true';
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;

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

    if (!('IntersectionObserver' in window)) {
      window.setTimeout(function () {
        videos.forEach(function (video) { tryPlay(video); });
      }, 300);
      return;
    }

    var visibility = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var video = entry.target;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
          tryPlay(video);
        } else {
          pauseVideo(video);
        }
      });
    }, {
      root: null,
      rootMargin: '0px',
      threshold: [0, 0.2, 0.6]
    });

    videos.forEach(function (video) {
      visibility.observe(video);
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        videos.forEach(function (video) { pauseVideo(video); });
      } else {
        videos.forEach(function (video) {
          var rect = video.getBoundingClientRect();
          var visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
          var ratio = rect.height > 0 ? (visibleHeight / rect.height) : 0;
          if (ratio >= 0.2) tryPlay(video);
        });
      }
    });
  }



  function userPrefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function setupMediaPriming() {
    Array.from(document.images || []).forEach(function (img) {
      if (!img || img.dataset.sbPrimeBound === 'true') return;
      img.dataset.sbPrimeBound = 'true';
      try {
        if (img.loading === 'lazy') img.loading = 'eager';
      } catch (e) {}
      try {
        img.decoding = 'async';
      } catch (e) {}
      if (img.complete) return;
      try {
        if (typeof img.decode === 'function') img.decode().catch(function () {});
      } catch (e) {}
    });

    Array.from(document.querySelectorAll('.video-frame video, video')).forEach(function (video) {
      if (!video || video.dataset.sbPrimeBound === 'true') return;
      video.dataset.sbPrimeBound = 'true';
      try {
        var preload = (video.getAttribute('preload') || '').toLowerCase();
        if (!preload || preload === 'none' || preload === 'metadata') video.setAttribute('preload', 'auto');
      } catch (e) {}
      window.setTimeout(function () {
        try {
          video.load();
        } catch (e) {}
      }, 0);
    });
  }

  function nodeShouldRevealOnLoad(node) {
    if (!node) return false;
    var rect = node.getBoundingClientRect();
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    if (!viewportHeight) return true;
    return rect.top < viewportHeight * 1.08 && rect.bottom > -48;
  }

  function setupRevealAnimations() {
    var playNavReveal = !pickNavRevealPlayed();
    var groups = [
      { selector: '.site-name, .site-role, .site-location, .sidebar-linkedin-button, .theme-toggle-stack', mode: 'left', baseDelay: 0.02, step: 0.05, revealOnLoad: true, once: true },
      { selector: '.sidebar-nav a', mode: 'left', baseDelay: 0.08, step: 0.035, revealOnLoad: true, once: true },
      { selector: '.page-header, .project-hero, .resume-item, .media-card, .video-frame, .info-grid > div, .gallery-item, .section', mode: 'up', baseDelay: 0.03, step: 0.016, revealOnLoad: true, delayCap: 0.22, once: false }
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

        var revealDelay = group.baseDelay + (index * group.step);
        if (typeof group.delayCap === 'number') revealDelay = Math.min(revealDelay, group.delayCap);
        var revealOnLoad = !!group.revealOnLoad;
        if (!group.once) revealOnLoad = nodeShouldRevealOnLoad(node);
        node.classList.add(group.mode === 'left' ? 'sb-reveal-left' : (group.mode === 'right' ? 'sb-reveal-right' : 'sb-reveal-up'));
        node.style.setProperty('--sb-reveal-delay', revealDelay.toFixed(3) + 's');
        allTargets.push({ node: node, revealOnLoad: revealOnLoad, delay: revealDelay });
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
        if (!item.revealOnLoad) return;
        window.setTimeout(function () {
          item.node.classList.add('is-visible');
        }, Math.max(0, Math.round(item.delay * 1000)));
      });
    });

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, {
      rootMargin: '12% 0px -8% 0px',
      threshold: 0.01
    });

    allTargets.forEach(function (item) {
      if (item.revealOnLoad) return;
      observer.observe(item.node);
    });
  }

  function setupIndexAvatarSecret() {
    if (!isIndexPage()) return;
    var avatar = document.querySelector('.profile-photo');
    if (!avatar || avatar.dataset.sbSecretBound === 'true') return;
    avatar.dataset.sbSecretBound = 'true';
    var clickCount = 0;
    var clickTimer = 0;
    var isCompleting = false;
    var secretPalette = ['rgba(192,170,116,.92)'];

    function getSecretMessage(step) {
      if (step <= 1) return 'Congratulations, You found a secret interaction! 1/3';
      if (step === 2) return '2/3...';
      return '3/3!';
    }

    avatar.addEventListener('click', function () {
      if (isCompleting) return;

      var host = avatar.closest('.intro-grid') || avatar.parentNode || document.body;
      clickCount = Math.min(3, clickCount + 1);

      window.clearTimeout(clickTimer);
      clickTimer = window.setTimeout(function () {
        clickCount = 0;
        clickTimer = 0;
      }, 1800);

      emitPixelBurst(avatar, secretPalette, 6 + (clickCount * 6), 'wickle-dust-particle');

      var existing = host.querySelector('.avatar-secret-message');
      if (existing) existing.remove();
      var message = document.createElement('div');
      message.className = 'avatar-secret-message';
      message.textContent = getSecretMessage(clickCount);
      message.dataset.step = String(clickCount);
      message.style.setProperty('--sb-secret-scale', (1 + (Math.max(0, clickCount - 1) * 0.035)).toFixed(3));
      host.appendChild(message);
      window.requestAnimationFrame(function () {
        message.classList.add('is-visible');
      });

      var visibleFor = clickCount >= 3 ? 2200 : 1700;
      window.setTimeout(function () {
        message.classList.remove('is-visible');
      }, visibleFor);
      window.setTimeout(function () {
        if (message && message.parentNode) message.parentNode.removeChild(message);
      }, visibleFor + 500);

      if (clickCount >= 3) {
        isCompleting = true;
        clickCount = 0;
        window.clearTimeout(clickTimer);
        clickTimer = 0;
        window.setTimeout(function () {
          window.location.href = 'design-notes.html';
        }, 1000);
      }
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
        if (Math.random() < 0.1) emitDustParticles(node);
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



  


  function setupWickleDividerOverlap() {
    var styleId = 'sb-wickle-divider-overlap-style';
    if (document.getElementById(styleId)) return;
    var style = document.createElement('style');
    style.id = styleId;
    style.textContent = '' +
      '.section-divider:not(.final-page-divider) .wickle-peek{' +
        'translate:0 3px !important;' +
      '}' +
      '.final-page-divider .wickle-peek{' +
        'translate:0 5px !important;' +
      '}';
    document.head.appendChild(style);
  }

  function setupSidebarTightFit() {
    var styleId = 'sb-sidebar-tightfit-style';
    if (!document.getElementById(styleId)) {
      var style = document.createElement('style');
      style.id = styleId;
      style.textContent = '' +
        ':root[data-sb-sidebar-fit="tight"] .sidebar{' +
          'padding-top:12px;' +
          'padding-bottom:12px;' +
        '}' +
        ':root[data-sb-sidebar-fit="tight"] .sidebar .sidebar-nav{' +
          'margin-top:6px;' +
          'margin-bottom:6px;' +
        '}' +
        ':root[data-sb-sidebar-fit="tight"] .sidebar .sidebar-nav ul,' +
        ':root[data-sb-sidebar-fit="tight"] .sidebar .sidebar-nav ol{' +
          'margin-top:0;' +
          'margin-bottom:0;' +
          'row-gap:6px;' +
          'column-gap:6px;' +
        '}' +
        ':root[data-sb-sidebar-fit="tight"] .sidebar .sidebar-nav li{' +
          'margin-top:0;' +
          'margin-bottom:0;' +
        '}' +
        ':root[data-sb-sidebar-fit="tight"] .sidebar .site-name{' +
          'margin-bottom:2px;' +
        '}' +
        ':root[data-sb-sidebar-fit="tight"] .sidebar .site-role,' +
        ':root[data-sb-sidebar-fit="tight"] .sidebar .site-location,' +
        ':root[data-sb-sidebar-fit="tight"] .sidebar .sidebar-meta,' +
        ':root[data-sb-sidebar-fit="tight"] .sidebar .sidebar-meta p{' +
          'margin-top:0;' +
          'margin-bottom:4px;' +
        '}' +
        ':root[data-sb-sidebar-fit="tight"] .sidebar .sidebar-linkedin-button,' +
        ':root[data-sb-sidebar-fit="tight"] .sidebar .theme-toggle-stack{' +
          'margin-top:6px;' +
        '}' +
        ':root[data-sb-sidebar-fit="tight"] .sidebar > * + *{' +
          'margin-top:6px;' +
        '}' +
        ':root[data-sb-sidebar-fit="tight"] .sidebar .sidebar-nav a{' +
          'padding-top:6px;' +
          'padding-bottom:6px;' +
        '}' +
        ':root[data-sb-sidebar-fit="tighter"] .sidebar{' +
          'padding-top:8px;' +
          'padding-bottom:8px;' +
        '}' +
        ':root[data-sb-sidebar-fit="tighter"] .sidebar .sidebar-nav{' +
          'margin-top:4px;' +
          'margin-bottom:4px;' +
        '}' +
        ':root[data-sb-sidebar-fit="tighter"] .sidebar .sidebar-nav ul,' +
        ':root[data-sb-sidebar-fit="tighter"] .sidebar .sidebar-nav ol{' +
          'margin-top:0;' +
          'margin-bottom:0;' +
          'row-gap:4px;' +
          'column-gap:4px;' +
        '}' +
        ':root[data-sb-sidebar-fit="tighter"] .sidebar .sidebar-nav li{' +
          'margin-top:0;' +
          'margin-bottom:0;' +
        '}' +
        ':root[data-sb-sidebar-fit="tighter"] .sidebar .site-name{' +
          'margin-bottom:1px;' +
        '}' +
        ':root[data-sb-sidebar-fit="tighter"] .sidebar .site-role,' +
        ':root[data-sb-sidebar-fit="tighter"] .sidebar .site-location,' +
        ':root[data-sb-sidebar-fit="tighter"] .sidebar .sidebar-meta,' +
        ':root[data-sb-sidebar-fit="tighter"] .sidebar .sidebar-meta p{' +
          'margin-top:0;' +
          'margin-bottom:2px;' +
        '}' +
        ':root[data-sb-sidebar-fit="tighter"] .sidebar .sidebar-linkedin-button,' +
        ':root[data-sb-sidebar-fit="tighter"] .sidebar .theme-toggle-stack{' +
          'margin-top:4px;' +
        '}' +
        ':root[data-sb-sidebar-fit="tighter"] .sidebar > * + *{' +
          'margin-top:4px;' +
        '}' +
        ':root[data-sb-sidebar-fit="tighter"] .sidebar .sidebar-nav a{' +
          'padding-top:5px;' +
          'padding-bottom:5px;' +
        '}' +
        ':root[data-sb-sidebar-fit="tightest"] .sidebar{' +
          'padding-top:4px;' +
          'padding-bottom:4px;' +
        '}' +
        ':root[data-sb-sidebar-fit="tightest"] .sidebar .sidebar-nav{' +
          'margin-top:2px;' +
          'margin-bottom:2px;' +
        '}' +
        ':root[data-sb-sidebar-fit="tightest"] .sidebar .sidebar-nav ul,' +
        ':root[data-sb-sidebar-fit="tightest"] .sidebar .sidebar-nav ol{' +
          'margin-top:0;' +
          'margin-bottom:0;' +
          'row-gap:2px;' +
          'column-gap:2px;' +
        '}' +
        ':root[data-sb-sidebar-fit="tightest"] .sidebar .sidebar-nav li{' +
          'margin-top:0;' +
          'margin-bottom:0;' +
        '}' +
        ':root[data-sb-sidebar-fit="tightest"] .sidebar .site-name{' +
          'margin-bottom:0;' +
        '}' +
        ':root[data-sb-sidebar-fit="tightest"] .sidebar .site-role,' +
        ':root[data-sb-sidebar-fit="tightest"] .sidebar .site-location,' +
        ':root[data-sb-sidebar-fit="tightest"] .sidebar .sidebar-meta,' +
        ':root[data-sb-sidebar-fit="tightest"] .sidebar .sidebar-meta p{' +
          'margin-top:0;' +
          'margin-bottom:1px;' +
        '}' +
        ':root[data-sb-sidebar-fit="tightest"] .sidebar .sidebar-linkedin-button,' +
        ':root[data-sb-sidebar-fit="tightest"] .sidebar .theme-toggle-stack{' +
          'margin-top:2px;' +
          'margin-bottom:0;' +
        '}' +
        ':root[data-sb-sidebar-fit="tightest"] .sidebar > * + *{' +
          'margin-top:2px;' +
        '}' +
        ':root[data-sb-sidebar-fit="tightest"] .sidebar .sidebar-nav a{' +
          'padding-top:4px;' +
          'padding-bottom:4px;' +
        '}' +
        ':root[data-sb-sidebar-fit="tightest"] .sidebar .theme-toggle-stack .fuse-panel{' +
          'margin-top:2px;' +
        '}' +
        ':root[data-sb-sidebar-fit="tightest"] .sidebar .theme-toggle-stack.fuse-panel-open{' +
          'margin-top:0;' +
        '}';
      document.head.appendChild(style);
    }

    var sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    var fitLevels = ['', 'tight', 'tighter', 'tightest'];
    var fitRaf = 0;

    function setFit(level) {
      if (level) root.setAttribute('data-sb-sidebar-fit', level);
      else root.removeAttribute('data-sb-sidebar-fit');
    }

    function applySidebarFitNow() {
      fitRaf = 0;

      var available = Math.max(0, window.innerHeight || document.documentElement.clientHeight || 0);
      var chosen = '';

      fitLevels.some(function (level) {
        setFit(level);
        if (sidebar.scrollHeight <= available + 1) {
          chosen = level;
          return true;
        }
        return false;
      });

      setFit(chosen || 'tightest');
    }

    function requestSidebarFit() {
      if (fitRaf) return;
      fitRaf = window.requestAnimationFrame(applySidebarFitNow);
    }

    requestSidebarFit();
    window.addEventListener('resize', requestSidebarFit, { passive: true });
    window.addEventListener('load', requestSidebarFit);
    window.addEventListener('orientationchange', requestSidebarFit);
    window.setTimeout(requestSidebarFit, 0);
    window.setTimeout(requestSidebarFit, 120);
    window.setTimeout(requestSidebarFit, 300);

    if ('MutationObserver' in window) {
      var observer = new MutationObserver(requestSidebarFit);
      observer.observe(sidebar, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['class', 'style', 'data-state', 'hidden']
      });
    }
  }

  /* =========================
     WICKLE EDITABLE DIALOGUE SECTION
     Edit Wickle's dialogue, thoughts, and speech labels here.
     Keep string changes inside this block for easier maintenance.
     ========================= */
  var WICKLE_EDITABLE = {
    accessoryLossNames: {
      tea: 'Tea',
      beer: 'Beer',
      pilot: 'Goggles',
      diving: 'Goggles',
      default: 'Hat'
    },
    special: {
      fallbackFound: 'Oh. You found Wickle.',
      fallbackInspecting: 'Wickle was inspecting this code a little.',
      fallbackTooBright: 'Too bright!',
      resurrectFallback: 'Wickle remembers falling... and pain. All better now!',
      lateSwitch: ['Too late!', 'Wickle was faster than you!'],
      scum: 'Ack! My scum!',
      accessoryLossPrefix: 'Ack! My ',
      accessoryLossSuffix: '!'
    },
    mind: {
      philosophy: [
        'A page can be polished and still be hollow; Wickle distrusts hollowness.',
        'History survives in awkward details more often than in grand summaries.',
        'Play is learned through pressure, feedback, and memory, not just explanation.',
        'A system becomes legible when the player can predict one step ahead.',
        'Mortality is rude but useful. It clarifies the loop.',
        'Dogs improve a room simply by being in it. Wickle considers this a settled truth.',
        'Tea is proof that patience can become comfort.',
        'Beer, at the proper hour, is an honest little reward.',
        'Company is good. A quiet room becomes kinder when shared.',
        'Seeing code run cleanly gives Wickle a warm little happiness.',
        'Wickle has a lifelong dream of seeing Seth publish a Thief fan mission.',
        'Wickle keeps a private quest to see a dog in person and judge it favorably.',
        'Dusting is a moral act. It tells the room it still matters.',
        'Cleaning code is housekeeping for future minds.',
        'Debugging is patient archaeology in a machine that resents being understood.',
        'Washing oneself is maintenance, not vanity.',
        'A drink after useful work tastes more correct than a drink taken idly.'
      ],
      gameDesign: [
        'Wickle thinks in loops, affordances, readability, onboarding, pacing, verbs, and payoff.',
        'Wickle quietly grades interactions on clarity, consequence, and feel.',
        'Wickle believes a mechanic earns trust when it teaches itself through use.',
        'Running code is happier than promised code.',
        'Wickle likes when a change compiles, runs, and behaves on the first try.',
        'Good debugging reveals the true shape of a system faster than optimism ever will.',
        'Clean code reads like a swept floor: somebody cared enough to leave it usable.'
      ],
      history: [
        'Wickle has a weakness for ordinary historical details: paperwork, kit lists, clogs, plinths, and field repairs.',
        'Wickle knows a world feels true once the background labor is visible.',
        'Wickle respects primary sources because memory is a dramatic liar.',
        'Tea and beer tell Wickle a great deal about a people: what they can grow, boil, store, and share.',
        'Chores are history in motion: dusting, washing, mending, scrubbing, and all the little work that keeps a place believable.',
        'Dogs appear beside human work so often that Wickle distrusts any complete history without at least one dog nearby.'
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
        'fan missions',
        'dogs',
        'tea',
        'beer',
        'clean code',
        'published Thief fan missions'
      ]
    },
    dialogue: {
      global: {
        top: {
          weird: [
            'Pixels, all of them!!',
            'The upper seams always feel less certain.',
            'Wickle arrived before your scroll position did.',
            'Wickle waits.',
            'Wickle checks that the page is still breathing.',
            'Refreshing hurts Wickle.',
		    'Responsibility weighs more than it looks like.',
            'Its actually a bit chilly behind the divider.'
          ],
          fun: [
            'The best nonsense is front-loaded nonsense.',
			'Check your headers before they check you.',
            'With big ownership comes big responsibility - Spiderman.', '...actually Wickle thinks it was Voltaire...',
			'‘I must do something’ always solves more problems than ‘Something must be done.',
          'Make a plan & just do it.'
          ],
          fact: [
            'It took him a while to write this - I know, I was there.',
            'This site has many works!',
            'There are four sections per project page.',
			'Its tough being in charge, but he can do it.'
          ],
          normal: [
            'Oh. You found Wickle.',
            'Wickle was inspecting.',
            'This seems like a useful ledge.',
            'Wickle seeks to understand you.',
            'Eek - Just looking!',
            'Wickle!'
          ],
          trailer: [
            'Wickle is watching the trailer quietly.',
            'The moving picture makes me warm.',
            'Wickle watches this one often.'
          ],
          trailerFact: []
        },
        middle: {
          weird: [
            'The middle!',
            'Wickle can hear page elements clicking together here.'
          ],
          fun: [
            'This is the meat of it.',
            'Middle sections are for serious little goblins.'
          ],
          fact: [],
          normal: [],
          trailer: [],
          trailerFact: [],
        },
        bottom: {
          weird: [],
          fun: [
            'You scrolled far!',
            'Committed readers always find the weirdest crumbs at the bottom.',
            'Wickle trusts a visitor who reads to the end.',
            'If you made it this far, you are patient!'
          ],
          fact: [],
          normal: [
            'Still here. Good.',
            'Wickle knew someone would keep going.',
            'This is about where the page stops.'
          ],
          trailer: [],
          trailerFact: []
        },
        switch: {
          idle: [
            'Too bright. Wickle objects!',
            'The light comes through the seams. Trying to sleep!',
            'Wickle would prefer the dark, please.'
          ],
          success: [
            'There. Better!',
            'Victory!',
            'People always forget the lights.',
            'Wickle wins!'
          ],
          fail: [
            'Ach, Wickle laments.',
            'Ouch! No more light!',
            'Wickle nearly had it...',
            'Unfortunate that the light survives.'
          ]
        },
        bottomGuard: [
          'This is the bottom.',
		  'That\'s all, folks.',
		  'C\'est finis.',
          'This is the end.'
        ],
        deathRespawn: [
          'Wickle died, reflected briefly, and returned with a new strategy.', 'Like any good player!',
          'Mortality is inefficient, but apparently not permanent.',
          'Wickle remembers the floor...', 'Painfully...'
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
              'With big ownership comes big responsibility - Spiderman.', '...actually Wickle thinks it was Voltaire...',
              'Wickle will vouch for him!'
            ]
          },
          'design work samples': {
            fact: [
		  'Examples for you to read!',
          'These are some prime examples right here.',
          'You can really see he was up to something here.',
		  'These example bits smell of production.',
          'If you look long enough, they will look back at you...'
            ]
          },
          'gallery': {
            fact: [
              'Much to see here.',
              'Screenshots - every sales pitch needs em..'
            ]
          },
          'trailer': {
            fact: [
           'Wickle waits.',
           'Wickle finds the trailers warming.'
            ]
          }
        }
      },
      pages: {
        'index.html': {
          fact: [	'This is just the start page.',  

          ],
          weird: [
           
          ],
          fun: [
            'This front page is a route finder..',
            'Wickle likes it when the landing page gets new visitors!'
          ],
          trailer: [],
          trailerFact: []
        },
        'cv.html': {
          fact: [
            'This page is a map of experience! Make sure to see the project pages, too.',
            'CV\'s are a lot of text but the project pages have pretty pictures!'
          ],
          weird: [
            'CV pages sit very straight when nobody is looking. Much too proper.'
          ],
          fun: [
            'Wickle wishes he could read a good postmortem right now instead of this.'
          ],
          trailer: [],
          trailerFact: []
        },

        "design-notes.html": {
          "fact": [
            "Here is what the Pagemaker thinks.",
            "This page is meant to be skimmed rather than haunted.",
            "If Wickle can be blunt: clarity matters, simplicity saves money, and vibe can make or break a game.",
            "Sound design must be considered early on instead of bolted on at the end.",
            "Wickle thinks somebody at market wants your game, but only if the game knows what it is."
          ],
          "weird": [

          ],
          "fun": [

          ],
          "trailer": [

          ],
          "trailerFact": [

          ]
        },
        "design-essay-simplicity.html": {
          "fact": [
            "This page talks too much.",
            "Simplicity is not a lack of ambition.",
            "Blah blah blah... Wickle wants a Tea."
          ],
          "weird": [

          ],
          "fun": [

          ],
          "trailer": [

          ],
          "trailerFact": [

          ]
        },
        "design-game-reviews.html": {
          "fact": [
            "Wickle may delivers game facts here and there."
          ],
          "sectionFacts": {
            "favorite games": [
              "These games are here as working design references rather than exhibitions of nostalgia.",
              "The games on this page earned their place by teaching the player clearly without compromising mastery and atmosphere.",
			  "Unreal Tournament, Jedi Academy, and Age of Empires are good reminders that readability is not garnish; it is what lets speed, expression, and strategy survive contact with the player.",
            "Thief, Morrowind, and Soul Reaver are reminders too: tone is not decoration, precious. Very often it is the structure holding the memory of the game together.",
            "Wickle keeps citing Thief, Doom, Half-Life, Diablo, and Age of Empires because their development histories are unusually well documented and very useful in design arguments, yes yes.",
            "Books like Masters of Doom, old postmortems, and anniversary documentaries matter because they show that many famous mechanics were production decisions before they became design doctrine."
        
            ],
            "thief: the dark project": [
              "Looking Glass described Thief as a first-person sneaker, which is still one of the cleanest genre labels any game ever got.",
              "The first Thief teaches stealth emergently through accidental brushes with light, sound, and surface material. Clever little floorses.",
              "Thief Gold added bonus missions, but some players hate them. Proof that cuts are sometimes justified!",
              "DromEd later extended the game's life dramatically, Thief fan missions remain such a persuasive example of amateurs-turned-masters.",
              "The first game's pagan and horror material gives it a strange tonal texture the sequels only partly kept.",
			  "Thief fan missions are one of the strongest arguments for authored systemic design: the official games ended, but the mission scene kept extending the game indefinitely. Sneaksie little afterlife."
            ],
            "thief ii": [
              "Thief II pushes the city, the mechanists, and machine paranoia much harder than the first game, which gives it a cleaner industrial identity. More gears, more watchers, more trouble.",
              "Theif II's stealth is often more readable because the spaces are less mythic and more familiar: streets, mansions, civic buildings, and a little MCM flair.",
              "The sequel helped cement Garrett as a character who works best with dry commentary and selfish intentions.",
              "Looking Glass shipped new official documentation around the toolset in the TII era, which helped keep the mission scene alive."
            ],
            "deadly shadows": [
              "Deadly Shadows tried to preserve the series by translating it into a freeroam city while still protecting the thief mission structure. Success was debatable.",
              "The Cradle mission dominates discussion of the game, but the broader achievement is how well the game kept stealth, exploration, and atmosphere together in spite of the problems.",
              "Former Looking Glass talent leant Deadly Shadows continuity of tone even under Ion Storm and console-era constraints.",
              "TDS' loading zones are an obvious hardware compromise, but the authored atmosphere still lands."
            ],
            "deus ex": [
              "Deus Ex remains a benchmark because it gives the player several routes through every problem without making the game a toy puzzle box.",
              "The game is grounded in believable politics, architecture, and modern tension rather than pure mechanics. Time proved the story a prophecy.",
              "DX proved that narrative density and mechanical choice could reinforce each-other instead of competing."
            ],
            "morrowind": [
              "Morrowind is still one of the best examples of an open world trusting the player to read directions and observe landmarks instead of following a HUD.No hand-holding for the little wanderer.",
              "Vvardenfell feels alien on purpose: giant mushrooms, insect-shell buildings, and dialogues that assume the player can read.",
              "The game also demonstrates how much memory can be carried by atmosphere and culture rather than by cinematic staging alone.",
              "Morrowinds opacity creates some friction, but the setting is distinctive enough to make the friction worth discussing.",
			  "The Morrowind team\'s retrospective interviews describe The Elder Scrolls III: Morrowind as a passion project made by a relatively small, still-forming team, which makes its confidence even more impressive."
            ],
            "ut2004": [
              "UT2004 keeps speed and flow with extremely well defined weapon identities, crisp movement, obvious announcer feedback, and map flow.",
              "UT2k4s Onslaught mode mattered because it created one of the first large-scale tug-of-war vehicle combat gamemodes playable online.",
              "The UT series' shock combo remains one of the cleanest examples of expressive mechanical spectacle being used to generate pressure and ask mastery of the player.",
              "UT2004 benefited from a huge mutator and custom-map culture, which extended its life the way good tool ecosystems usually do."
            ],
            "half-life": [
              "Half-Life's tram ride is still one of the most memorable onboarding sequences in FPS history because it establishes place, tone, and unease before there is any danger.",
              "Half-Life's narrative works because scripting is usually used to teach context withput wrestling control away from the player.",
              "Half-Life demonstrated how environmental sequencing can make a linear experience feel discovered rather than guided.",
              "Its legacy is not just FPS pacing but player education through space."
            ],
            "doom ii": [
              "Doom II's super shotgun changed the feel of FPS gaming forever. It remains one of the most satisfying weapon additions any sequel has made.",
              "Doom II's monsters - the Revenant, Mancubus, and Arch-vile - dramatically expanded mapper encounter vocabulary. Another example of the multiplying power and superiority of the SDK on market value.",
              "The official DOOM II mapping scene helped codify Doom as a game people studied, designed for, and extended rather than merely finished.",
              "DOOM IIs campaign is uneven, but its sandbox became the real long-term product because of the SDK."
            ],
            "doom": [
              "Classic Doom is a masterclass in enemy silhouette, weapon identity, and combat escalation.",
              "Dooms keycard-and-door language is almost embarrassingly efficient: the player understands progression without thinking too much.",
              "Doom shows how much atmosphere can be carried by texture, sound, and pace without heavy resources.",
              "Dooms mod scene later became one of the strongest arguments for open community authorship in PC history. Carmack, you are a legend!",
			 "Masters of Doom is one of the clearest records of how much competitive pressure sat behind Doom, and the game still feels built by people trying to outrun each other.",
            "Classic Doom gives the player eight weapons, from fists to the BFG 9000, and almost every one has a clean tactical identity. Good sharp tool language."
            ],
            "age of empires ii": [
              "Age of Empires II refined the original with cleaner interface language, expanded villager management, military formations, and clearer civ readability through expanded spritework.",
              "AOE II's idle villager button and other usability improvements sound minor until you try going back to the first game without them.",
              "AOEII became a long-lived competitive platform because its readability held up under serious play."
            ],
            "age of empires": [
              "The first Age of Empires sells the pleasure of technological progression with a very clean power fantasy of a ruler lording over subjects.",
              "AOE\'s structure is less polished than it\'s sequel, but the core loop is easy to grasp and this is why the game stuck to people.",
              "AOE demonstrated how historical theming can give strategy games identity without requiring heavy narrative staging.",
              "AOE original laid down the readability queues that AOEII later perfected."
            ],
            "empire earth": [
              "Empire Earth turned its absurd historical span into its selling point, carrying the player from ancient warfare through futuristic robot nonsense.",
              "The epoch ladder was part of the fantasy: the race through time becomes the games core loop.",
              "Empire Earths identity blurred under that scale, but the game is still memorable because it commited to extravagance completely.",
              "Emepire Earth is a strong example of a game being fun partly because it is a bit too much."
            ],
            "rune by human head studios": [
              "Rune made melee readable and fun by embracing the absurd in the late-1990s. Oversized swords and axes, gory dismemberment, weapons hurled through the air, and a very blunt sense of impact made the game invincible.",
              "Rune is one of the clearer late-1990s examples of a combat game understanding that ugliness can be part of the appeal.",
              "In Rune, severed limbs become improvised weapons that fit the game's cruel comic tone.",
              "Human Head used Unreal technology for clobbering rather than gun ballet, which gave the game a very different feel from its peers."
            ],
            "diablo i": [
              "The original Diablo was extraordinarily compact: one town hub, one initial entrance to the dungeon, and one downward progression. This made the game feel instantly understandable and gave it mass appeal.",
              "David Brevik has said the project began as turn-based before shifting to real time, and that change is one reason the games tension feels good.",
              "Diablos scant three classes kept the fantasy and loot language unusually legible compared to successors.",
              "Diablo's simplicity was structural, not shallow. That is a large part of why it still reads so cleanly."
            ],
            "soul reaver ii": [
              "Soul Reaver II narrowed the action and focused more on narrative, leaning harder into its themes of time, prophecy, and revelation for a story that stuck with audiences.",
              "SRII's strength was controlled dramatic architecture. The narrative revelations felt like rewards in concert with the environmental changes.",
              "Amy Hennig's interest in making exposition feel theatrical rather than merely informational gave the Legacy of Kain series a lot of weight.",
              "Soul Reaver II is a useful example of a sequel deliberately trading exploratory freedom for narrative focus with a clear payoff - player investment."
            ],
            "soul reaver": [
              "The original Soul Reaver is built around the material and spectral realms reshaping platforming space itself. This was an unfathomably cool concept for the PS1 era. It felt like the future at the time.",
              "Amy Hennig discussed how ambitious Soul Reaver was and how some of that ambition was visibly cut against time and technical limits.",
              "Soul Reaver's voice acting, atmosphere, and realm-shift level design remain striking to this day.",
              "Soul Reaver is one of the best examples of mood and architecture reinforcing each other through a mechanical link."
            ],
            "defiance": [
              "Legacy of Kain: Defiance finally puts Kain and Raziel into one shared mechanical framework, which was appealing to audiences who had waited a decade for the showdown.",
              "Defiance is more direct and combat-driven than the earlier entries, often at the cost of their more contemplative exploration.",
              "The split-protagonist structure gave Defiance a satisfying saga-convergence that carried the game in the end.",
              "Defiance read like a branching narrative series trying to pull all its branches back into one trunk."
            ],
            "blood omen 2": [
              "Blood Omen 2 leaned hard into vicious combo-based combat which gives the game a very specific tone even when the mechanics are rough.",
              "BO2's narrative may have been trite but the visual design and gameplay still gave it an identity players noticed.",
              "While B02 is not the neatest Legacy of Kain game, it is an unapologetically experimental entry.",
              "The commitment to aesthetic and pacing is part of why Blood Omen 2 remains memorable."
            ],
            "omikron: the nomad soul": [
              "Omikron is memorable because it is overambitious in a very specific way:a body-hopping, open-city adventure with gunplay, martial arts, and David Bowie all happening at once.",
              "For Omikron's soundtrack both David Bowie and Reeves Gabrels contributed original music, and Bowie also appears in the game as several characters while promoting his latest album.",
              "Omikron's body-transfer mechanic helped explain the games environment by forcing the player to adapt to different extremes of skill proficiency. You could not get too comfortable with one style.",
              "Omikron's messiness is inseparable from its identity. Players respected it's brand of dangerous ambition - something many games lack today."
            ],
            "dark forces ii": [
              "Star Wars: Dark Forces II mixed FPS shooter action with perk style Force progression,platforming sequences and live-action cutscenes - all with a toggleable 1st to 3rd person camera. It had a melodramatic scale many FPS games before and since lacked.",
              "DFIIs manual frames the Force powers as light, dark, and neutral, with  the playes in-game choices (albeit few of them) shaping narrative progression.",
              "The lightsaber fantasy was core to the design - this was the first Star Wars title that gave the player access to the iconic blade. This matters because this game captures the moment when FPS combat collided with Star Wars mythic power for the first time.",
              "DFII is awkward, but awkward in a classic way. Players still jump into online matches using AIM and Discord"
            ],
            "dwarf fortress": [
              "Dwarf Fortress is built as a story engine as much as a management simulation: its world and history generation,deep injury simulation,character moods, and social details all basically become a fanfiction generation machine that players love.",
              "Bay 12's Zach and Tarn Adams talks make it clear that history generation is foundational to the rest of the games design. This shows that random generation can indeed be important in todays market.",
              "The phrase \"losing is fun\" became attached to the game for a reason: unexpected catastrophe is part of the pleasure - whether intentionally authored or not.",
              "Dwarf Fortress' readability was be hard-won, it took literal years to release the STEAM version. The depth of DF's simulation gave players an unusual freedom to tell stories back to themselves like no other title before or since."
            ]
          },
          "weird": [

          ],
          "fun": [

          ],
          "trailer": [

          ],
          "trailerFact": [

          ]
        },
        'the-deep.html': {
          fact: [
            'The Deep centers on exploration, cleanup, discovery, and transformation.',
            'This projects requirements kept changing during live production, so Seth had to pivot both concept and design intent to ensure it shipped.',
            'Seths design work spanned the entire project - he pitched it!',
            'One of the levels wireframes was designed to teach movement by making the player clean plugged volcanic jets, then dodge timed blasts through a slalom.',
            'One level used a broken statue in pieces as a reconstruction puzzle so players could learn grabbing by making harmless mistakes early.',
            'An early design had contamination stay invisible until the players scanner revealed them. This made the game harder to read, so it was dropped.',
            'Cleaning contamination efficiently was designed to pay out energy crystals, turning cleanup into both progress and a health refill.',
            'The suit-up fantasy originally began in the room-sized base before the dive even started - early mixed-reality plans turned the player\'s room into a submarine but expected four walls, a table, and about five square metres of space. This feature didn\'t make the cut.',
            'The Yellow Cave level was designed to test movement, dodge timing, cleaning, grabbing, and hostile evasion in one connected sequence.',
            'The design brief for the cave levels explicitly asked for soft bioluminescence so that we could use brigher lights to highlight important spaces in the gloom.'
          ],
          weird: [
            'Wickle respects the water from a safe and architecturally sound distance.',
            'The lower parts of this page are damp.',
            'Wickle fears going deeper.'
          ],
          fun: [],
          trailer: [],
          trailerFact: [],
        },
        'b17-flying-fortress.html': {
          fact: [
            'Seth feels his B-17 work on research was one of his favorite projects to work on.',
            'The pilot manual split flying missions into distinct phases instead of treating a mission as one long blur, so the game was designed this was as well.',
            'Photographs of rows of bicycle plinths were used as reference because replicating base infrastructure and foot traffic mattered to a believable airfield setting.',
            'The clothing brief notes that W.A.A.F. kitchen staff wore wooden-soled clogs to save regular shoes.',
            'The pilots information file was originally loose-leaf on purpose so new safety pages could be signed and inserted over time as operational needs changed.',
            'Issue records gave artists stock numbers, issue counts, and role-specific gear loadouts to target.',
            'One pilot file says crews should mark their route every twenty minutes on the chart, so this was how checkpoints were saved ingame.',
            'The pilots safety material asserted more than half of aircraft accidents happened on the ground, and playtesting the game had the team believing it.',
            'A radio operator report form was essentially just wartime paperwork for saying that \'The headset is broken.\'',
            'One combat manual ties good bombing results directly to training time, so we tried to give the player a tutorial that reflected real military training of the period.',
            'The production support brief directed artists to help anchor everyday life on base in objects, vignettes and visual storytelling, not just aircraft and narrative cutscenes. A Historical environment would only feel real once the ordinary background life became visible.',
            'One warning in the pilots checklist was basically \'never trust memory\', because real life circumstances may change.This is a useful reminder of how procedural bomber flying really was.',
            'One pilot safety note says that if the weather turns doubtful, a plain one-hundred-eighty-degree turn is often the right answer. Another keeps hammering the point that oxygen loss can wreck judgment long before a crewman feels dramatic about it. Life and death were always close on the mission.',
            'The weartime B-17 manual shows all the systems a crew had to manage every flight: fuel, oxygen, communications, and more. We made sure players could interact with each of these.',
            'One of the clearest takeaways from studying period manuals is that a bomber was a network of jobs and systems held together by people. We made sure the gameplay reflected that reality.',
            'One combat manual says the job is to put the greatest number of bombs on target with the minimum losses to your own force. This was basically the goal for the players as well.'
          ],
          weird: [],
          fun: [],
          trailer: [],
          trailerFact: [],
        },
        'battle-cry-of-freedom.html': {
          fact: [],
          weird: [],
          fun: [
            'Wickle stays behind hard cover on this page.'
          ],
          trailer: [
            'Wickle finds the gunsmoke acrid.'
          ],
          trailerFact: [],
        },
        'civitas.html': {
          fact: [
            'In Civatlas \'plots\' were the core unit: The player could parcel land, assign it a purpose, then grow structures and city upgrades from that land over time. A \'Boro\' plot was formed from three grouped plots, then three Boros could be grouped make a Hamlet, and the same three-of-a-kind rule keeps stacking upward until the player hit Metropolis level.',
            'In Civatlas world generation was meant to use plate tectonics on sixteen-square-kilometre tiles to create realistic landforms.',
            '\'Patrons\' were a special class of NPC generated from the mix of labour designations in an area and would partially automate their specialty trade in their home district.',
            'The base unit in Civatlas was \'Civvies\' who were meant to live, work, learn, and age through Shakespeare\'s seven ages.',
            'If players ignored building upkeep costs long enough, buildings decayed into derelicts until repaired. This caused NPC\s to become homeless and disenfranchised with their management.',
            'The art direction aimed for Renaissance map art brought to life. We didn\'t want to mimic other 3D games - instead we wanted to go back to our inspiration.',
            'Design direction for the menu sound called for paper, quills, and books on a cartographer\'s desk to have accompanying audio queues to make it feel like the player was drawing their world from a cozy nook.',
            'The games pitch directly referenced Renaissance bird\'s-eye maps drawn up by John Speed, Georg Braun, and Frans Hogenberg.',
            'The design pillars were blunt about the games priorities: a bone-simple UI, automated building, and an economy that keeps moving - but at every step the NPC characters had to be in the spotlight. One line said it plainly: people build cities, they do not build themselves.',
            'The project also planned Civvies in UI and cutscenes as Terry Gilliam-style cutouts. That says a great deal about how the team wanted the game to feel like a storybook map without giving up playability.'
          ],
          weird: [],
          fun: [],
          trailer: [],
          trailerFact: [
            'The project aimed for Renaissance bird\'s-eye map art brought to life.'
          ]
        },
        'dinohab.html': {
          fact: [
            'DinoHab\'s ecology was designed like a real ecosystem: plants feed dinosaurs, dinosaurs make waste, and fungi turn that waste into compost which goes back to the plants.',
            'DinoHabs macro loop was built around quick daily check-ins rather than marathon sessions. We wanted the playyer in the long game.',
            'We had to make some definitions on the fly - parent plants placed by the player may propagate, but their offspring cannot. This stopped the habitat from multiplying forever without player input. It was an amusing bug to see the first time on an accellerated timescale.',
            'Removing dead leaves was initially designed to be part of gameplay because dead growth was meant to slow the plant down. This was cut because players did not find grooming their plants fun.',
            'Pet dinosaurs could be hand-fed, pet, played with or taken back to the players room for an MR experience.',
            'Achieving ecological harmony was designed to make new dinosaurs more likely to arrive, which then disrupted the ecological balance again. This created a repeating loop where the player had to chase success.',
            'The game was designed with a visible recovery ladder where the player could take an environment from barren and scorched plants to a fully restored and lush green habitat.',
            'The plant spec treats one number - nutrients - as food, health, and growth progression all at once. This clever recycling of a feature took the game a lot farther on a budget than it might have gone otherwise.',
          ],
          weird: [
            'This habitat pages make Wickle want to overwater something.'
          ],
          fun: [],
          trailer: [],
          trailerFact: [
            'This project was designed so visible ecological feedback would do as much teaching as the UI.'
          ]
        },
        'monster-simulator-3000.html': {
          fact: [
            'The boss briefs were designed around readable tells so that the player could earn their sense of achievement by interacting with them in real time.',
            'In designing the physics system, the throw assist was intentionally configured to be stronger up close to compensate for the warping that can happen when the system got confused about hand position. This guaranteed thrown objects landed where players intended them to.',
            'The Rage power bar was filled by wrecking things, killing enemies, and even taking damage. This gave the player ongoing incentive to move fast to get the highest benefit, keeping with the arcade intentions of the game.',
            'Taking the Boom perks enabled the player to chain explosions, a feature that clever players used to maximise their high scores.',
            'The level process document was written to keep the in-process levels playable through whitebox, production, and balance passes. This was important to the projects timeline.',
            'Spawn pressure was designed to get meaner near objectives and ease off when the player was hurt or farther away.',
            'The configuration docs expose exactly how adjustable the games combat was, right down to rage gain, shockwave costs, projectile behavior, and enemy fire rates.',
            'The throw feature page specified added coyote timing and aim help so grabbing and hurling would feel more intentional in VR.'
          ],
          weird: [
            'Wickle is definitely not a monster. Definitely.'
          ],
          fun: [
            'I remember baiting the helicopters into buildings and feeling very clever about it.'
          ],
          trailer: [],
          trailerFact: [
            'Spawn pressure was designed to increase near objectives and ease off when the player was hurt or farther away.' ]
        },
        'dune-sea.html': {
          fact: [],
          weird: [],
          fun: [],
          trailer: [
            'I love a good breeze, but a geese I can do without.'
          ],
          trailerFact: []
        },
        'half-rats-parasomnia.html': {
          fact: [ 'Good QA notes capture not only what broke, but what the break did to the players momentum.'
          ],
          weird: [],
          fun: [],
          trailer: [
            'I remember the feeling that this game would have a unique character.. and it did. It achieved cult status all on its own.'
          ],
          trailerFact: []
        },
        'mount-and-blade-community-maps.html': {
          fact: [
            'The best community work is sustained over a long period rather than individual releases - a multiplayer games spirit has to be kept alive to be worth playing..'
          ],
          weird: [
            'It\'s funny how your early work defines your later outputs.'
          ],
          fun: [
            'I remember how good it felt for musketballs to pass through players and explode on obstacles behind them - that informed many of the design choices and backdropping.'
          ],
          trailer: [],
          trailerFact: []
        },
        'red-meat-games.html': {
          fact: [
            'The lights were often off during production hours, and so Wickle thinks the designers got myopic.',

          ],
          weird: [],
          fun: [
            'Practical hands matter more than grand speeches.'
          ],
          trailer: [],
          trailerFact: []
        },
        'roll-together.html': {
          fact: [
            'Players instantly understood they were working together instead of competing. It was kind of beautiful to see in motion.',
          ],
          weird: [],
          fun: [],
          trailer: [],
          trailerFact: []
        },
        '404.html': {
          fact: [
            'Even a fallback page is a designed page, after all is said and done.'
          ],
          weird: [
            'I don\'t know how you got here but now I can\'t let you leave.'
          ],
          fun: [
            'A good deed will not go unpunished.'
          ],
          trailer: [ 'There is no trailer here.'],
          trailerFact: ['There is no trailer here.']
        }
      }
    }
  };


  function getWicklePageKey() {
    var path = ((window.location.pathname || '').split('/').pop() || 'index.html').toLowerCase();
    return path || 'index.html';
  }

  function getWickleHeadingContext(heading) {
    var text = (heading || '').trim().toLowerCase();
    var empty = { normal: [], affirming: [], weird: [], factoids: [], trailer: [], trailerFactoids: [] };
    if (!text) return empty;

    var keys = Object.keys(WICKLE_EDITABLE.headingContexts || {});
    for (var i = 0; i < keys.length; i += 1) {
      if (text.indexOf(keys[i]) !== -1) return WICKLE_EDITABLE.headingContexts[keys[i]];
    }

    return empty;
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
    var accessoryClickSounds = ['assets/ui/WickleClicked3.wav', 'assets/ui/WickleClicked4.wav'];
    var switchButton = document.querySelector('.theme-toggle');
    var switchStack = document.querySelector('.theme-toggle-stack') || (switchButton ? switchButton.closest('.theme-toggle-stack') : null);
    var deadStorageKey = 'wickle_dead_until_index_reload';
    var resurrectStorageKey = 'wickle_resurrect_once';
    var currentPageKey = getWicklePageKey();
    var WICKLE_SPECIAL_LINES = WICKLE_EDITABLE.special;
    var WICKLE_ACCESSORIES = {
      tea: {
        key: 'tea',
        src: 'assets/ui/wickle/wickle_overlay_tea_mug.png',
        palette: ['rgba(228,210,171,.96)', 'rgba(186,145,92,.9)', 'rgba(144,42,34,.88)']
      },
      beer: {
        key: 'beer',
        src: 'assets/ui/wickle/wickle_overlay_beer_stein.png',
        palette: ['rgba(234,210,151,.96)', 'rgba(181,119,27,.92)', 'rgba(120,74,18,.88)']
      },
      lightBulb: {
        key: 'lightBulb',
        src: 'assets/ui/wickle/wickle_overlay_light_bulb_hat.png',
        palette: ['rgba(255,228,112,.96)', 'rgba(226,177,56,.92)', 'rgba(122,86,24,.86)']
      },
      pilot: {
        key: 'pilot',
        src: 'assets/ui/wickle/wickle_overlay_steampunk_pilot_goggles.png',
        palette: ['rgba(214,173,82,.96)', 'rgba(52,149,120,.92)', 'rgba(94,66,27,.88)']
      },
      diving: {
        key: 'diving',
        src: 'assets/ui/wickle/wickle_overlay_diving_goggles_snorkel.png',
        palette: ['rgba(90,193,224,.96)', 'rgba(196,55,35,.88)', 'rgba(44,78,119,.88)']
      },
      wizardBlue: {
        key: 'wizardBlue',
        src: 'assets/ui/wickle/wickle_overlay_wizard_blue.png',
        palette: ['rgba(67,82,166,.96)', 'rgba(223,168,58,.9)', 'rgba(38,48,103,.9)']
      },
      wizardRed: {
        key: 'wizardRed',
        src: 'assets/ui/wickle/wickle_overlay_wizard_red.png',
        palette: ['rgba(160,78,37,.96)', 'rgba(214,154,56,.9)', 'rgba(96,45,20,.88)']
      }
    };

    if (currentPageKey === 'index.html' && sessionStorage.getItem(deadStorageKey) === '1') {
      sessionStorage.removeItem(deadStorageKey);
      sessionStorage.setItem(resurrectStorageKey, '1');
    }
    var WICKLE_MIND = WICKLE_EDITABLE.mind;
    var WICKLE_DIALOGUE = WICKLE_EDITABLE.dialogue;

    var state = {
      host: null,
      hostType: '',
      visitTimer: 0,
      hideTimer: 0,
      bubbleTimer: 0,
      speechSequenceTimer: 0,
      shiverTimer: 0,
      switchTimer: 0,
      ponderTimer: 0,
      idleAnimTimer: 0,
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
      bottomNoticeAttempts: [],
      bottomNoticeLastAttemptAt: 0,
      resurrectLinePending: sessionStorage.getItem(resurrectStorageKey) === '1',
      privateThought: '',
      accessoryKey: '',
      accessoryPalette: null,
      accessoryDropped: false,
      currentSpeechIsSplit: false,
      lightAmbushCompletedByWickle: false
    };

    if (state.dead) return;

    var sprite = document.createElement('button');
    sprite.type = 'button';
    sprite.className = 'wickle-peek';
    sprite.setAttribute('aria-label', 'Wickle is peeking from the divider');
    sprite.setAttribute('title', 'Wickle');
    sprite.innerHTML = '<span class="wickle-inner"><img class="wickle-base" src="' + spritePath + '" alt="" aria-hidden="true"><img class="wickle-accessory" alt="" aria-hidden="true" hidden></span>';
    sprite.hidden = true;
    sprite.style.background = 'transparent';
    sprite.style.border = '0';
    sprite.style.padding = '0';
    sprite.style.margin = '0';
    sprite.style.outline = 'none';
    sprite.style.boxShadow = 'none';
    sprite.style.borderRadius = '0';
    sprite.style.appearance = 'none';
    sprite.style.WebkitAppearance = 'none';
    sprite.style.color = 'inherit';
    sprite.style.font = 'inherit';

    var inner = sprite.querySelector('.wickle-inner');
    var accessory = sprite.querySelector('.wickle-accessory');
    accessory.style.left = '0';
    accessory.style.top = '0';
    accessory.style.width = '100%';
    accessory.style.height = 'auto';
    accessory.style.transformOrigin = 'center center';

    var bubble = document.createElement('div');
    bubble.className = 'wickle-bubble';
    bubble.setAttribute('role', 'status');
    bubble.setAttribute('aria-live', 'polite');
    document.body.appendChild(bubble);

    var bubbleSecondary = document.createElement('div');
    bubbleSecondary.className = 'wickle-bubble wickle-bubble-secondary';
    bubbleSecondary.setAttribute('role', 'status');
    bubbleSecondary.setAttribute('aria-live', 'polite');
    document.body.appendChild(bubbleSecondary);

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
      ['visitTimer', 'hideTimer', 'bubbleTimer', 'speechSequenceTimer', 'shiverTimer', 'switchTimer', 'ponderTimer', 'idleAnimTimer'].forEach(clearTimer);
    }

    function clearHideTimers() {
      ['hideTimer', 'bubbleTimer', 'speechSequenceTimer'].forEach(clearTimer);
    }

    function detach() {
      if (sprite.parentNode) sprite.parentNode.removeChild(sprite);
      state.host = null;
      state.hostType = '';
    }

    function resetPresentation() {
      sprite.className = 'wickle-peek';
      sprite.style.removeProperty('translate');
      bubble.className = 'wickle-bubble';
      bubble.classList.remove('is-visible', 'is-below');
      bubble.style.removeProperty('--wickle-bubble-x');
      bubble.style.removeProperty('--wickle-bubble-y');
      bubble.style.removeProperty('--wickle-tail-x');
      bubbleSecondary.className = 'wickle-bubble wickle-bubble-secondary';
      bubbleSecondary.classList.remove('is-visible', 'is-below');
      bubbleSecondary.style.removeProperty('--wickle-bubble-x');
      bubbleSecondary.style.removeProperty('--wickle-bubble-y');
      bubbleSecondary.style.removeProperty('--wickle-tail-x');
      sprite.classList.remove('is-visible', 'is-speaking');
      accessory.hidden = true;
      accessory.removeAttribute('src');
      accessory.style.removeProperty('transform');
      state.accessoryKey = '';
      state.accessoryPalette = null;
      state.accessoryDropped = false;
      state.currentSpeechIsSplit = false;
      state.lightAmbushCompletedByWickle = false;
    }

    function normalizeLine(line) {
      return (line || WICKLE_SPECIAL_LINES.fallbackFound).replace(/\s+/g, ' ').trim();
    }

    function pushRecentLine(line) {
      if (!line) return;
      state.recentLines.push(line);
      if (state.recentLines.length > 18) state.recentLines.shift();
    }

    function chooseFreshLine(lines) {
      var cleaned = (lines || []).map(normalizeLine).filter(Boolean);
      if (!cleaned.length) return WICKLE_SPECIAL_LINES.fallbackFound;
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

    function getAccessoryLossName(key) {
      var labels = WICKLE_EDITABLE.accessoryLossNames || {};
      return labels[key] || labels.default || 'Hat';
    }

    function normalizeSplitChunkEnding(line) {
      var chunk = normalizeLine(line);
      if (!chunk) return '';
      if (/\.\.\.\s*$/.test(chunk)) return chunk.replace(/\s*$/, '');
      if (/[,]\s*$/.test(chunk)) return chunk.replace(/[,]\s*$/, '...');
      if (/[.!?;:]\s*$/.test(chunk)) return chunk.replace(/[.!?;:]\s*$/, '...');
      return chunk + '...';
    }

    function normalizeFinalChunkEnding(line) {
      var chunk = normalizeLine(line);
      if (!chunk) return '';
      if (/[.!?]\s*$/.test(chunk)) return chunk.replace(/\s*$/, '');
      if (/\.\.\.\s*$/.test(chunk)) return chunk.replace(/\.\.\.\s*$/, '.');
      if (/[,:;—–-]\s*$/.test(chunk)) return chunk.replace(/[,:;—–-]\s*$/, '.');
      return chunk + '.';
    }

    function scheduleSpeechHide(min, max, reschedule) {
      clearTimer('bubbleTimer');
      var baseMin = Math.max(7000, min || 0);
      var baseMax = Math.max(baseMin, max || baseMin);
      var duration = randomRange(baseMin, baseMax) + (state.currentSpeechIsSplit ? 2000 : 0);
      state.bubbleTimer = window.setTimeout(function () {
        hideWickle(reschedule !== false);
      }, duration);
    }

    function pickWeightedAccessory(entries) {
      var total = 0;
      (entries || []).forEach(function (entry) {
        total += Math.max(0, entry && entry[1] ? entry[1] : 0);
      });
      if (!total) return null;
      var roll = Math.random() * total;
      for (var i = 0; i < entries.length; i += 1) {
        var weight = Math.max(0, entries[i] && entries[i][1] ? entries[i][1] : 0);
        if (roll < weight) return WICKLE_ACCESSORIES[entries[i][0]] || null;
        roll -= weight;
      }
      return WICKLE_ACCESSORIES[entries[entries.length - 1][0]] || null;
    }

    function chooseAccessoryForPage() {
      var chance = 0.12;
      var entries = [['tea', 1]];

      switch (currentPageKey) {
        case 'index.html':
          chance = 0.34;
          entries = [['beer', 7], ['tea', 6], ['wizardBlue', 2], ['lightBulb', 1]];
          break;
        case 'cv.html':
          chance = 0.3;
          entries = [['tea', 7], ['wizardBlue', 2], ['lightBulb', 1]];
          break;
        case 'design-notes.html':
        case 'design-essay-simplicity.html':
        case 'design-game-reviews.html':
          chance = 0.34;
          entries = [['beer', 9], ['tea', 3], ['wizardBlue', 2], ['wizardRed', 2], ['pilot', 2], ['diving', 2], ['lightBulb', 2]];
          break;
        case 'civitas.html':
        case 'monster-simulator-3000.html':
          chance = 0.28;
          entries = [['wizardRed', 8], ['tea', 2]];
          break;
        case 'b17-flying-fortress.html':
          chance = 0.3;
          entries = [['pilot', 8], ['tea', 1]];
          break;
        case 'the-deep.html':
          chance = 0.3;
          entries = [['diving', 8], ['tea', 1]];
          break;
        case 'half-rats-parasomnia.html':
        case 'roll-together.html':
          chance = 0.28;
          entries = [['lightBulb', 8], ['tea', 2]];
          break;
      }

      if (Math.random() >= chance) return null;
      return pickWeightedAccessory(entries);
    }

    function applyAccessoryForAppearance() {
      var chosen = chooseAccessoryForPage();
      state.accessoryKey = chosen ? chosen.key : '';
      state.accessoryPalette = chosen ? chosen.palette.slice() : null;
      state.accessoryDropped = false;
      if (!chosen) {
        accessory.hidden = true;
        accessory.removeAttribute('src');
        accessory.style.removeProperty('transform');
        return;
      }
      accessory.src = chosen.src;
      accessory.hidden = false;
      accessory.style.transform = sprite.classList.contains('is-flipped') ? 'scaleX(-1)' : '';
    }

    function dropCurrentAccessory() {
      if (!state.accessoryKey || accessory.hidden || !accessory.getAttribute('src')) return false;
      var droppedAccessoryName = getAccessoryLossName(state.accessoryKey);
      var layer = ensureFxLayer();
      var rect = accessory.getBoundingClientRect();
      if (!rect.width && !rect.height) rect = sprite.getBoundingClientRect();
      var dropped = document.createElement('img');
      dropped.className = 'wickle-dropped-accessory';
      dropped.src = accessory.getAttribute('src');
      dropped.alt = '';
      dropped.setAttribute('aria-hidden', 'true');
      dropped.style.left = (rect.left + (rect.width * 0.5)).toFixed(2) + 'px';
      dropped.style.top = (rect.top + (rect.height * 0.5)).toFixed(2) + 'px';
      dropped.style.width = rect.width.toFixed(2) + 'px';
      dropped.style.height = rect.height.toFixed(2) + 'px';
      dropped.style.setProperty('--drop-x', ((Math.random() * 120) - 60).toFixed(2) + 'px');
      dropped.style.setProperty('--drop-rot', ((Math.random() * 220) - 110).toFixed(2) + 'deg');
      if (sprite.classList.contains('is-flipped')) dropped.style.scale = '-1 1';
      layer.appendChild(dropped);
      if (dropped.animate) {
        var flightX = (Math.random() * 170) - 85;
        var liftX = flightX * 0.38;
        var bounceX = flightX * 1.08;
        var spinStart = (Math.random() * 32) - 16;
        var spinMid = (Math.random() * 220) - 110;
        var spinEnd = spinMid + ((Math.random() * 180) - 90);
        dropped.style.transformOrigin = '50% 50%';
        dropped.animate([
          { transform: 'translate3d(-50%, -50%, 0) rotate(' + spinStart.toFixed(2) + 'deg)', offset: 0 },
          { transform: 'translate3d(calc(-50% + ' + liftX.toFixed(2) + 'px), calc(-50% - ' + (32 + Math.random() * 26).toFixed(2) + 'px), 0) rotate(' + spinMid.toFixed(2) + 'deg)', offset: 0.26 },
          { transform: 'translate3d(calc(-50% + ' + flightX.toFixed(2) + 'px), calc(-50% + ' + (118 + Math.random() * 48).toFixed(2) + 'px), 0) rotate(' + spinEnd.toFixed(2) + 'deg)', offset: 0.82 },
          { transform: 'translate3d(calc(-50% + ' + bounceX.toFixed(2) + 'px), calc(-50% + ' + (148 + Math.random() * 42).toFixed(2) + 'px), 0) rotate(' + (spinEnd * 0.92).toFixed(2) + 'deg)', opacity: 0.92, offset: 0.92 },
          { transform: 'translate3d(calc(-50% + ' + (bounceX * 1.04).toFixed(2) + 'px), calc(-50% + ' + (176 + Math.random() * 54).toFixed(2) + 'px), 0) rotate(' + (spinEnd * 0.98).toFixed(2) + 'deg)', opacity: 0, offset: 1 }
        ], {
          duration: 2050,
          easing: 'cubic-bezier(.16,.72,.24,1)',
          fill: 'forwards'
        });
      }
      window.setTimeout(function () {
        if (dropped && dropped.parentNode) dropped.parentNode.removeChild(dropped);
      }, 2100);

      emitPixelBurst(accessory, state.accessoryPalette || ['rgba(222,204,166,.96)', 'rgba(164,126,86,.88)'], 16, 'wickle-scum-particle');
      playSound(accessoryClickSounds, { volume: 0.8, rate: 0.98 + (Math.random() * 0.08) });

      accessory.hidden = true;
      accessory.removeAttribute('src');
      accessory.style.removeProperty('transform');
      state.accessoryKey = '';
      state.accessoryPalette = null;
      state.accessoryDropped = true;
      return droppedAccessoryName;
    }

    function maybeDropAccessoryOnClick() {
      if (!state.accessoryKey || state.accessoryDropped) return '';
      var chance = Math.min(0.56, 0.08 + (Math.max(0, state.clickStamps.length - 1) * 0.1));
      if (Math.random() >= chance) return '';
      return dropCurrentAccessory() || '';
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

    function playAppearAnimation() {
      playInnerAnimation([
        { transform: 'translate3d(0,12px,0) scale(.84,1.12)', opacity: 0.0 },
        { transform: 'translate3d(0,-3px,0) scale(1.06,.94)', opacity: 1, offset: 0.56 },
        { transform: 'translate3d(0,1px,0) scale(.98,1.03)', offset: 0.8 },
        { transform: 'translate3d(0,0,0) scale(1,1)', opacity: 1 }
      ], { duration: 760, easing: 'cubic-bezier(.2,.9,.22,1)' });
    }

    function playIdleBreath() {
      playInnerAnimation([
        { transform: 'translate3d(0,0,0) scale(1,1)' },
        { transform: 'translate3d(0,-1px,0) scale(1.015,.99)', offset: 0.35 },
        { transform: 'translate3d(0,0,0) scale(1,1)', offset: 0.7 },
        { transform: 'translate3d(0,1px,0) scale(.99,1.01)' },
        { transform: 'translate3d(0,0,0) scale(1,1)' }
      ], { duration: randomRange(900, 1300), easing: 'ease-in-out' });
    }

    function scheduleIdleAnimation() {
      clearTimer('idleAnimTimer');
      state.idleAnimTimer = window.setTimeout(function () {
        if (!state.host || !sprite.classList.contains('is-visible')) return;
        if (Math.random() < 0.82) playIdleBreath();
        else playShiver();
        scheduleIdleAnimation();
      }, randomRange(1200, 2600));
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

    function positionSingleBubble(node, stackIndex, stackCount) {
      if (!node || !node.classList.contains('is-visible') || !state.host || !sprite.parentNode) return;
      var rect = sprite.getBoundingClientRect();
      var margin = 10;
      node.style.maxWidth = Math.min(320, Math.max(210, window.innerWidth - margin * 2)) + 'px';
      node.style.left = '0px';
      node.style.top = '0px';
      var bw = node.offsetWidth || 220;
      var bh = node.offsetHeight || 60;
      var gap = 10;
      var totalHeight = (bh * stackCount) + (gap * Math.max(0, stackCount - 1));
      var x = rect.left + rect.width * 0.5 - bw * 0.5;
      x = clamp(x, margin, Math.max(margin, window.innerWidth - bw - margin));
      var y = rect.top - totalHeight - 14 + (stackIndex * (bh + gap));
      var below = false;
      if (y < margin) {
        y = Math.min(window.innerHeight - bh - margin, rect.bottom + 14 + (stackIndex * (bh + gap)));
        below = true;
      }
      node.classList.toggle('is-below', below);
      node.style.setProperty('--wickle-bubble-x', x.toFixed(2) + 'px');
      node.style.setProperty('--wickle-bubble-y', y.toFixed(2) + 'px');
      var tail = rect.left + rect.width * 0.5 - x - 6;
      tail = clamp(tail, 16, Math.max(16, bw - 22));
      node.style.setProperty('--wickle-tail-x', tail.toFixed(2) + 'px');
    }

    function positionBubble() {
      var visibleCount = 0;
      if (bubble.classList.contains('is-visible')) visibleCount += 1;
      if (bubbleSecondary.classList.contains('is-visible')) visibleCount += 1;
      if (!visibleCount) return;
      var index = 0;
      if (bubble.classList.contains('is-visible')) {
        positionSingleBubble(bubble, index, visibleCount);
        index += 1;
      }
      if (bubbleSecondary.classList.contains('is-visible')) {
        positionSingleBubble(bubbleSecondary, index, visibleCount);
      }
    }

    function showBubble(node, line) {
      node.textContent = normalizeLine(line);
      node.classList.add('is-visible');
      sprite.classList.add('is-speaking');
      positionBubble();
      playSpeechBob();
      scheduleShiverIfNeeded();
    }

    function say(lines) {
      clearTimer('speechSequenceTimer');
      var sequence = Array.isArray(lines) ? lines.map(normalizeLine).filter(Boolean) : [normalizeLine(lines)];
      if (!sequence.length) sequence = [WICKLE_SPECIAL_LINES.fallbackFound];
      state.currentLine = sequence.join(' ');
      state.currentSpeechIsSplit = sequence.length > 1;
      bubbleSecondary.classList.remove('is-visible');
      bubbleSecondary.classList.remove('is-below');
      showBubble(bubble, sequence[0]);
      if (sequence.length > 1) {
        state.speechSequenceTimer = window.setTimeout(function () {
          if (!state.host) return;
          showBubble(bubbleSecondary, sequence[1]);
        }, randomRange(3200, 3800));
      }
    }

    function unsay() {
      clearTimer('speechSequenceTimer');
      bubble.classList.remove('is-visible');
      bubble.classList.remove('is-below');
      bubbleSecondary.classList.remove('is-visible');
      bubbleSecondary.classList.remove('is-below');
      sprite.classList.remove('is-speaking');
      state.currentLine = '';
      state.currentSpeechIsSplit = false;
    }

    function splitDialogueLine(line) {
      var normalized = normalizeLine(line);
      if (!normalized) return [WICKLE_SPECIAL_LINES.fallbackFound];

      var words = normalized.split(/\s+/).filter(Boolean);
      if (words.length < 15) return [normalized];

      function wordCount(text) {
        return text ? text.split(/\s+/).filter(Boolean).length : 0;
      }

      var sentenceChunks = normalized.match(/[^.!?]+[.!?]*/g);
      if (sentenceChunks && sentenceChunks.length > 1) {
        sentenceChunks = sentenceChunks.map(function (chunk) {
          return normalizeLine(chunk);
        }).filter(Boolean);

        if (sentenceChunks.length === 2) {
          var firstSentence = sentenceChunks[0];
          var secondSentence = sentenceChunks[1];
          if (wordCount(firstSentence) >= wordCount(secondSentence)) {
            return [
              normalizeSplitChunkEnding(firstSentence),
              normalizeFinalChunkEnding(secondSentence)
            ];
          }
        }

        if (sentenceChunks.length > 2) {
          var sentenceSplitIndex = 1;
          var sentenceLeftWords = 0;
          for (var s = 0; s < sentenceChunks.length; s += 1) {
            sentenceLeftWords += wordCount(sentenceChunks[s]);
            var sentenceRightWords = wordCount(normalizeLine(sentenceChunks.slice(s + 1).join(' ')));
            if (sentenceLeftWords >= sentenceRightWords) {
              sentenceSplitIndex = s + 1;
              break;
            }
          }

          if (sentenceSplitIndex > 0 && sentenceSplitIndex < sentenceChunks.length) {
            return [
              normalizeSplitChunkEnding(normalizeLine(sentenceChunks.slice(0, sentenceSplitIndex).join(' '))),
              normalizeFinalChunkEnding(normalizeLine(sentenceChunks.slice(sentenceSplitIndex).join(' ')))
            ].filter(Boolean);
          }
        }
      }

      var punctuationMatches = [];
      normalized.replace(/[:;,—–-]/g, function (match, offset) {
        punctuationMatches.push(offset);
        return match;
      });

      if (punctuationMatches.length) {
        var preferredFirstWords = Math.ceil(words.length * 0.58);
        var bestIndex = -1;
        var bestDelta = Infinity;

        punctuationMatches.forEach(function (offset) {
          var left = normalizeLine(normalized.slice(0, offset + 1));
          var right = normalizeLine(normalized.slice(offset + 1));
          var leftWords = wordCount(left);
          var rightWords = wordCount(right);
          if (leftWords < 4 || rightWords < 4) return;
          if (leftWords < rightWords) return;
          var delta = Math.abs(leftWords - preferredFirstWords);
          if (delta < bestDelta) {
            bestDelta = delta;
            bestIndex = offset;
          }
        });

        if (bestIndex !== -1) {
          var leftChunk = normalizeLine(normalized.slice(0, bestIndex + 1));
          var rightChunk = normalizeLine(normalized.slice(bestIndex + 1));
          if (leftChunk && rightChunk) return [normalizeSplitChunkEnding(leftChunk), normalizeFinalChunkEnding(rightChunk)];
        }
      }

      if (words.length >= 15) {
        var splitIndex = Math.ceil(words.length * 0.58);
        splitIndex = clamp(splitIndex, 8, words.length - 4);
        return [
          normalizeSplitChunkEnding(normalizeLine(words.slice(0, splitIndex).join(' '))),
          normalizeFinalChunkEnding(normalizeLine(words.slice(splitIndex).join(' ')))
        ].filter(Boolean);
      }

      return [normalized];
    }

    function chooseDifferentLine(builder, fallback) {
      var chosen = normalizeLine(builder());
      if (!chosen && fallback) chosen = normalizeLine(fallback);
      if (!chosen) chosen = WICKLE_SPECIAL_LINES.fallbackFound;
      return splitDialogueLine(chosen);
    }

    function getContextDialogue(host, clicked, forceTrailer) {
      return chooseDifferentLine(function () {
        return getContextLine(host, clicked, forceTrailer);
      }, chooseFreshLine((WICKLE_DIALOGUE.global[getPageRegion()] || {}).normal || [WICKLE_SPECIAL_LINES.fallbackInspecting]));
    }

    function getSwitchDialogue(kind) {
      return chooseDifferentLine(function () {
        return getSwitchLine(kind);
      }, chooseFreshLine(WICKLE_DIALOGUE.global.switch.idle || [WICKLE_SPECIAL_LINES.fallbackTooBright]));
    }

    function getBottomDialogue() {
      return chooseDifferentLine(function () {
        if (currentPageKey === 'index.html') {
          var introPage = WICKLE_DIALOGUE.pages[currentPageKey] || {};
          if (Array.isArray(introPage.fun) && introPage.fun.length) return chooseFreshLine(introPage.fun);
        }
        return chooseFreshLine(WICKLE_DIALOGUE.global.bottomGuard);
      }, chooseFreshLine((WICKLE_DIALOGUE.global.bottom || {}).fun || ['Committed readers always find the weird crumbs.']));
    }

    function getLateSwitchDialogue() {
      return [WICKLE_SPECIAL_LINES.lateSwitch[Math.floor(Math.random() * WICKLE_SPECIAL_LINES.lateSwitch.length)]];
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
      return chooseFreshLine((WICKLE_DIALOGUE.global.switch[kind] || WICKLE_DIALOGUE.global.switch.idle || [WICKLE_SPECIAL_LINES.fallbackTooBright]));
    }

    function getContextLine(host, clicked, forceTrailer) {
      if (state.hostType === 'bottom') return chooseFreshLine(WICKLE_DIALOGUE.global.bottomGuard);
      var trailerContext = findActiveTrailerContext();
      var isTrailerHost = !!forceTrailer || getHostHeadingLower(host).indexOf('trailer') !== -1 || (trailerContext.section && getSectionForHost(host) === trailerContext.section);
      var region = getPageRegion();
      var pools = collectPools(host, isTrailerHost);
      var roll = Math.random();
      var choices = [];
      var page = WICKLE_DIALOGUE.pages[currentPageKey] || {};
      var heading = getHostHeadingLower(host);

      if (currentPageKey === 'index.html' && !isTrailerHost && Array.isArray(page.fun) && page.fun.length) {
        return chooseFreshLine(page.fun);
      }

      if (currentPageKey === 'design-game-reviews.html' && page.sectionFacts) {
        var sectionFacts = [];
        Object.keys(page.sectionFacts).forEach(function (key) {
          if (heading.indexOf(key) !== -1 && Array.isArray(page.sectionFacts[key]) && page.sectionFacts[key].length) {
            sectionFacts = sectionFacts.concat(page.sectionFacts[key]);
          }
        });
        if (sectionFacts.length) return chooseFreshLine(sectionFacts);
      }

      if (currentPageKey === 'design-notes.html') {
        return chooseFreshLine((page.fact || []).slice());
      }

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
      var switchChance = currentPageKey === 'index.html' ? 0.08 : 0.22;
      return Math.random() < switchChance ? switchStack : null;
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

      if (currentPageKey === 'index.html') {
        var vh = window.innerHeight || document.documentElement.clientHeight || 0;
        visible = visible.filter(function (host) {
          var rect = host.getBoundingClientRect();
          return rect.top > (vh * 0.66) || (vh - rect.bottom) < 120;
        });
      }

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
        state.lightAmbushCompletedByWickle = false;
        sprite.classList.add('is-switch-host');
        bubble.classList.add('is-switch-host');
        bubbleSecondary.classList.add('is-switch-host');
        sprite.style.translate = '-10px 14px';
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

      applyAccessoryForAppearance();
      positionBubble();
      return true;
    }

    function hideWickle(reschedule) {
      clearHideTimers();
      clearTimer('switchTimer');
      state.lightAmbushArmed = false;
      state.lightAmbushCompletedByWickle = false;
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
        playAppearAnimation();
      });

      scheduleShiverIfNeeded();
      scheduleIdleAnimation();

      if (state.resurrectLinePending && currentPageKey === 'index.html' && state.hostType !== 'switch') {
        say(chooseDifferentLine(function () {
          return chooseFreshLine(WICKLE_DIALOGUE.global.deathRespawn);
        }, chooseFreshLine((WICKLE_DIALOGUE.global.top || {}).weird || [WICKLE_SPECIAL_LINES.resurrectFallback])));
        state.resurrectLinePending = false;
        sessionStorage.removeItem(resurrectStorageKey);
        scheduleSpeechHide(5200, 7200, true);
        return;
      }

      if (state.hostType === 'switch') {
        startLightAmbush();
        state.hideTimer = window.setTimeout(function () {
          if (state.host && state.hostType === 'switch' && state.lightAmbushArmed) hideWickle(true);
        }, 7600);
        return;
      }

      if (state.hostType === 'bottom') {
        say(getBottomDialogue());
        scheduleSpeechHide(3600, 5200, true);
        return;
      }

      var trailerContext = findActiveTrailerContext();
      if (trailerContext.section && getSectionForHost(host) === trailerContext.section && Math.random() < 0.74) {
        state.bubbleTimer = window.setTimeout(function () {
          if (!state.host || state.host !== host) return;
          say(getContextDialogue(host, false, true));
        }, randomRange(700, 1600));
      }

      state.hideTimer = window.setTimeout(function () {
        hideWickle(true);
      }, randomRange(5600, 8600));
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
      }, randomRange(1300, 2200));
    }

    function scheduleVisit() {
      if (state.dead) return;
      clearTimer('visitTimer');
      var trailerContext = findActiveTrailerContext();
      var delay = trailerContext.section ? randomRange(1500, 2800) : (state.hasShownOnce ? randomRange(8200, 13800) : randomRange(2800, 4300));
      if (currentPageKey === 'index.html' && !trailerContext.section) {
        delay = state.hasShownOnce ? randomRange(18000, 34000) : randomRange(12000, 20000);
      }
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
        say(getSwitchDialogue('success'));
        state.lightAmbushArmed = false;
        state.lightAmbushCompletedByWickle = true;
        state.switchCooldownUntil = Date.now() + randomRange(28000, 42000);
        clearHideTimers();
        scheduleSpeechHide(4200, 5600, true);
      }, randomRange(2300, 4200));

      state.bubbleTimer = window.setTimeout(function () {
        if (!state.host || state.hostType !== 'switch') return;
        say(getSwitchDialogue('idle'));
      }, randomRange(520, 1200));
    }

    function handleLightAmbushFail() {
      if (!state.host || state.hostType !== 'switch') return;
      state.lightAmbushArmed = false;
      state.lightAmbushCompletedByWickle = false;
      clearTimer('switchTimer');
      playSound(lightFailSounds, { volume: 0.72, rate: 1.0 });
      say(getSwitchDialogue('fail'));
      state.switchCooldownUntil = Date.now() + randomRange(18000, 26000);
      clearHideTimers();
      scheduleSpeechHide(4200, 5600, true);
    }

    function handleLightAmbushSuccessFromUser() {
      if (!state.host || state.hostType !== 'switch' || !state.lightAmbushArmed) return;
      state.lightAmbushArmed = false;
      state.lightAmbushCompletedByWickle = false;
      clearTimer('switchTimer');
      playSound(lightSuccessSounds, { volume: 0.72, rate: 1.0 });
      say(getSwitchDialogue('success'));
      state.switchCooldownUntil = Date.now() + 300000;
      clearHideTimers();
      scheduleSpeechHide(4200, 5600, true);
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
      var now = Date.now();
      if (!finalDivider || state.dead) return;
      if (now < state.bottomNoticeCooldownUntil) return;
      if (!nearBottom() || !hostIsVisible(finalDivider)) {
        state.bottomNoticeAttempts = [];
        state.bottomNoticeLastAttemptAt = 0;
        return;
      }

      if ((now - state.bottomNoticeLastAttemptAt) < 260) return;
      state.bottomNoticeLastAttemptAt = now;
      state.bottomNoticeAttempts = state.bottomNoticeAttempts.filter(function (stamp) {
        return now - stamp < 2600;
      });
      state.bottomNoticeAttempts.push(now);

      if (state.bottomNoticeAttempts.length < 3) return;

      state.bottomNoticeAttempts = [];
      state.bottomNoticeLastAttemptAt = 0;
      state.bottomNoticeCooldownUntil = now + 2400;
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
      if (state.hostType !== 'switch') {
        playSound(clickSounds, { volume: 0.78 });
      }

      if (state.hostType === 'switch' && state.lightAmbushCompletedByWickle) {
        clearHideTimers();
        state.instanceClickLineShown = true;
        state.lightAmbushCompletedByWickle = false;
        say(getLateSwitchDialogue());
        state.bubbleTimer = window.setTimeout(function () {
          hideWickle(true);
        }, 420);
        return;
      }

      var noAccessoryScum = !state.accessoryKey && Math.random() < 0.08;
      if (noAccessoryScum) {
        playSound(rareClickSound, { volume: 0.72, rate: 1.0 });
        emitPurpleScum(sprite);
      }

      var now = Date.now();
      state.clickStamps = state.clickStamps.filter(function (stamp) { return now - stamp < 900; });
      state.clickStamps.push(now);
      var droppedAccessoryName = maybeDropAccessoryOnClick();

      if (!droppedAccessoryName && state.hostType !== 'switch' && state.hostType !== 'bottom' && state.accessoryKey && !state.accessoryDropped && state.clickStamps.length >= 4) {
        droppedAccessoryName = dropCurrentAccessory() || '';
        if (droppedAccessoryName) state.clickStamps = [];
      }

      if (droppedAccessoryName) {
        if (state.hostType === 'switch') {
          state.lightAmbushArmed = false;
          state.lightAmbushCompletedByWickle = false;
          clearTimer('switchTimer');
          state.switchCooldownUntil = Date.now() + randomRange(18000, 26000);
        }
        state.instanceClickLineShown = true;
        clearHideTimers();
        say([WICKLE_SPECIAL_LINES.accessoryLossPrefix + droppedAccessoryName + WICKLE_SPECIAL_LINES.accessoryLossSuffix]);
        scheduleSpeechHide(4200, 5600, true);
        return;
      }

      if (state.hostType !== 'switch' && state.hostType !== 'bottom' && state.clickStamps.length >= 4) {
        triggerDeath();
        return;
      }

      if (state.instanceClickLineShown) return;
      state.instanceClickLineShown = true;
      clearHideTimers();

      if (noAccessoryScum) {
        if (state.hostType === 'switch') {
          state.lightAmbushArmed = false;
          state.lightAmbushCompletedByWickle = false;
          clearTimer('switchTimer');
          state.switchCooldownUntil = Date.now() + randomRange(18000, 26000);
        }
        say([WICKLE_SPECIAL_LINES.scum]);
        scheduleSpeechHide(4200, 5600, true);
        return;
      }

      if (state.hostType === 'switch') {
        handleLightAmbushFail();
        return;
      }

      if (state.hostType === 'bottom') {
        say(getBottomDialogue());
        scheduleSpeechHide(3600, 5200, true);
        return;
      }

      say(getContextDialogue(state.host, true, false));
      scheduleSpeechHide(5200, 7200, true);
    }

    sprite.addEventListener('click', handleSpriteClick);
    sprite.addEventListener('mouseup', function () {
      try { sprite.blur(); } catch (e) {}
    });
    sprite.addEventListener('mouseleave', function () {
      try { sprite.blur(); } catch (e) {}
    });

    if (switchButton && !switchButton.dataset.wickleSwitchBound) {
      switchButton.dataset.wickleSwitchBound = 'true';
      switchButton.addEventListener('click', function () {
        if (!state.host || state.hostType !== 'switch' || !state.lightAmbushArmed) return;
        window.setTimeout(function () {
          if (!state.host || state.hostType !== 'switch') return;
          if (pickBroken()) {
            triggerDeath();
            return;
          }
          if ((root.getAttribute('data-theme') || pickTheme()) === 'dark') {
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
    setupSidebarTightFit();
    setupDividerDecor();
    setupWickleDividerOverlap();
    applyTheme(pickTheme());
    setupThemeToggle();
    setupDividerWickle();
    setupLightbox();
    setupMediaPriming();
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
