
(function(){
  const on = (sel, fn, root=document) => Array.from(root.querySelectorAll(sel)).forEach(fn);

  function filterCards(input){
    const targetSel = input.dataset.filterTarget || '.cards-grid';
    const scope = input.closest('main') || document;
    const targets = scope.querySelectorAll('.movie-card');
    const term = input.value.trim().toLowerCase();
    targets.forEach(card => {
      const text = (card.dataset.keywords || card.textContent || '').toLowerCase();
      const show = !term || text.includes(term);
      card.style.display = show ? '' : 'none';
    });
  }

  on('.js-filter-input', input => {
    input.addEventListener('input', () => filterCards(input));
  });

  on('[data-play-target]', btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.playTarget;
      const video = document.getElementById(id);
      if (!video) return;
      const hls = video.dataset.hls;
      const mp4 = video.dataset.mp4;
      try {
        if (video.canPlayType && video.canPlayType('application/vnd.apple.mpegurl') && hls) {
          if (video.src.indexOf(hls) === -1) video.src = hls;
        } else if (mp4 && video.src.indexOf(mp4) === -1) {
          video.src = mp4;
        }
        video.play().catch(() => {});
      } catch (e) {}
    });
  });

  on('[data-carousel]', carousel => {
    carousel.style.scrollBehavior = 'smooth';
    const step = () => Math.max(260, carousel.clientWidth * 0.75);
    const parent = carousel.parentElement;
    if (!parent) return;
    const left = document.createElement('button');
    const right = document.createElement('button');
    left.className = right.className = 'btn btn-ghost btn-sm carousel-btn';
    left.textContent = '←';
    right.textContent = '→';
    left.setAttribute('aria-label', '向左滚动');
    right.setAttribute('aria-label', '向右滚动');
    const box = document.createElement('div');
    box.className = 'carousel-controls';
    box.append(left, right);
    parent.insertBefore(box, carousel);
    left.addEventListener('click', () => carousel.scrollBy({left: -step(), behavior: 'smooth'}));
    right.addEventListener('click', () => carousel.scrollBy({left: step(), behavior: 'smooth'}));
  });

  // hero cards fade in
  requestAnimationFrame(() => document.body.classList.add('is-ready'));
})();
