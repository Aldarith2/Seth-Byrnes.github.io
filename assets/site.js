(function () {
  function renderContacts() {
    document.querySelectorAll('[data-email-user]').forEach(function (el) {
      var email = el.getAttribute('data-email-user') + '@' + el.getAttribute('data-email-domain');
      el.textContent = email;
      if (el.tagName.toLowerCase() === 'a') el.setAttribute('href', 'mailto:' + email);
    });
    document.querySelectorAll('[data-phone]').forEach(function (el) {
      el.textContent = el.getAttribute('data-phone');
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
  renderContacts();
  setupLightbox();
})();