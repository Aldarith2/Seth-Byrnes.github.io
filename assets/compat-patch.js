(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function ensureMeta(name, content) {
    var meta = document.querySelector('meta[name="' + name + '"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
    return meta;
  }

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  function themeColor(theme) {
    return theme === 'light' ? '#f8f8f3' : '#4f5d3f';
  }

  function applyBrowserChromeTheme(theme) {
    ensureMeta('color-scheme', 'light dark');
    ensureMeta('theme-color', themeColor(theme));
    document.documentElement.style.colorScheme = theme;
  }

  function applyBodyBackground(theme) {
    var body = document.body;
    if (!body) return;
    var image = theme === 'light' ? 'assets/ui/light_tile.png' : 'assets/ui/site-bg-herringbone.png';
    body.style.backgroundImage = 'url("' + image + '")';
    body.style.backgroundRepeat = 'repeat';
    body.style.backgroundPosition = '0 0';
    body.style.backgroundSize = theme === 'light' ? '192px 192px' : '256px 256px';
  }

  function watchThemeChanges() {
    var lastTheme = currentTheme();
    applyBrowserChromeTheme(lastTheme);
    applyBodyBackground(lastTheme);

    if (!('MutationObserver' in window)) return;

    var observer = new MutationObserver(function () {
      var nextTheme = currentTheme();
      if (nextTheme === lastTheme) return;
      lastTheme = nextTheme;
      applyBrowserChromeTheme(nextTheme);
      applyBodyBackground(nextTheme);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }

  function isUiImage(img) {
    var src = img.getAttribute('src') || '';
    return !!(
      /assets\/ui\//.test(src) ||
      img.closest('.theme-toggle') ||
      img.closest('.theme-toggle-stack') ||
      img.closest('.sidebar-linkedin-button') ||
      img.closest('.hero-linkedin-button') ||
      img.closest('.fuse-panel')
    );
  }

  function escapeXml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function placeholderSvg(label) {
    var text = escapeXml((label || 'Image unavailable').trim().slice(0, 72));
    var svg = '' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" role="img" aria-label="' + text + '">' +
      '<rect width="1200" height="675" fill="#2f3727"/>' +
      '<rect x="20" y="20" width="1160" height="635" rx="18" ry="18" fill="#343a2f" stroke="#56634a" stroke-width="4"/>' +
      '<text x="600" y="320" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="42" fill="#eef2e9">Media unavailable</text>' +
      '<text x="600" y="382" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="26" fill="#ccd5c2">' + text + '</text>' +
      '</svg>';
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }

  function enhanceImages() {
    document.querySelectorAll('img').forEach(function (img) {
      if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
      if (!isUiImage(img) && !img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
      if (img.dataset.compatImageBound === 'true') return;
      img.dataset.compatImageBound = 'true';

      function applyFallback() {
        if (img.dataset.compatFallbackApplied === 'true') return;
        img.dataset.compatFallbackApplied = 'true';
        if (isUiImage(img)) return;
        img.classList.add('broken-media-image');
        img.src = placeholderSvg(img.getAttribute('alt') || 'Image unavailable');
      }

      img.addEventListener('error', applyFallback, { passive: true });

      if (img.complete && typeof img.naturalWidth === 'number' && img.naturalWidth === 0) {
        applyFallback();
      }
    });
  }

  function replaceVideoWithFallback(video, message) {
    if (!video || video.dataset.compatVideoFallbackApplied === 'true') return;
    video.dataset.compatVideoFallbackApplied = 'true';
    var frame = video.closest('.video-frame') || video.parentNode;
    if (!frame) return;
    frame.classList.add('media-unavailable');
    video.style.display = 'none';

    var card = document.createElement('div');
    card.className = 'media-unavailable-card';
    card.innerHTML = '<strong>Trailer unavailable in this build</strong><span>' + message + '</span>';
    frame.appendChild(card);
  }

  function enhanceVideos() {
    document.querySelectorAll('video').forEach(function (video) {
      if (video.dataset.compatVideoBound === 'true') return;
      video.dataset.compatVideoBound = 'true';
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      if (!video.getAttribute('preload')) video.setAttribute('preload', 'metadata');

      var fallbackMessage = 'The local media file could not be loaded. Use the external trailer link on this page when available.';
      video.addEventListener('error', function () {
        replaceVideoWithFallback(video, fallbackMessage);
      }, { passive: true });

      video.querySelectorAll('source').forEach(function (source) {
        source.addEventListener('error', function () {
          replaceVideoWithFallback(video, fallbackMessage);
        }, { passive: true });
      });

      window.setTimeout(function () {
        if (video.dataset.compatVideoFallbackApplied === 'true') return;
        if (video.error || (video.networkState === 3 && video.readyState === 0)) {
          replaceVideoWithFallback(video, fallbackMessage);
        }
      }, 1200);
    });
  }

  function markUnavailable(link) {
    if (!link || link.dataset.compatUnavailable === 'true') return;
    link.dataset.compatUnavailable = 'true';
    link.classList.add('resource-unavailable');
    link.setAttribute('aria-disabled', 'true');
    link.setAttribute('tabindex', '-1');
    link.setAttribute('title', 'Unavailable in this build');
  }

  function auditLocalAssetLinks() {
    if (!/^https?:$/i.test(window.location.protocol)) return;

    var selector = [
      'a[href^="assets/docs/"]',
      'a[href^="assets/media/"]'
    ].join(',');

    document.querySelectorAll(selector).forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || link.dataset.compatLinkAudit === 'true') return;
      link.dataset.compatLinkAudit = 'true';

      fetch(href, {
        method: 'HEAD',
        cache: 'no-store'
      }).then(function (response) {
        if (!response.ok) markUnavailable(link);
      }).catch(function () {
        markUnavailable(link);
      });
    });
  }

  ready(function () {
    watchThemeChanges();
    enhanceImages();
    enhanceVideos();
    auditLocalAssetLinks();
  });
})();
