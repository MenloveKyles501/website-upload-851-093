function ready(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}
function qs(sel, root = document) {
  return root.querySelector(sel);
}
function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}
function initMenu() {
  const btn = qs('.menu-toggle');
  const nav = qs('.site-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
}
function initHeroCarousel() {
  const root = qs('[data-hero-carousel]');
  if (!root) return;
  const slides = qsa('.hero-slide', root);
  if (!slides.length) return;
  let index = 0;
  let timer = null;
  const show = (next) => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
  };
  const next = () => show(index + 1);
  const start = () => {
    stop();
    timer = window.setInterval(next, 5000);
  };
  const stop = () => {
    if (timer) window.clearInterval(timer);
    timer = null;
  };
  qsa('[data-hero-prev]', root).forEach(btn => btn.addEventListener('click', () => { show(index - 1); start(); }));
  qsa('[data-hero-next]', root).forEach(btn => btn.addEventListener('click', () => { show(index + 1); start(); }));
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  show(0);
  start();
}
function initPosterFallbacks() {
  qsa('img[data-poster]').forEach(img => {
    img.addEventListener('error', () => {
      const fb = img.parentElement && img.parentElement.querySelector('.poster-fallback');
      if (fb) fb.hidden = false;
      img.style.display = 'none';
    }, { once: true });
  });
}
function initSearchFilter() {
  const form = qs('[data-site-search]');
  const input = qs('[data-search-input]');
  const grid = qs('[data-search-grid]');
  const countEl = qs('[data-search-count]');
  if (!input || !grid) return;
  const cards = qsa('[data-search-item]', grid);
  const apply = () => {
    const raw = input.value.trim().toLowerCase();
    const region = qs('[data-filter-region]')?.value || '';
    const type = qs('[data-filter-type]')?.value || '';
    const year = qs('[data-filter-year]')?.value || '';
    let visible = 0;
    cards.forEach(card => {
      const text = card.dataset.text || '';
      const matches = (!raw || text.includes(raw)) && (!region || card.dataset.region === region) && (!type || card.dataset.type === type) && (!year || card.dataset.year === year);
      card.hidden = !matches;
      if (matches) visible += 1;
    });
    if (countEl) countEl.textContent = String(visible);
  };
  input.addEventListener('input', apply);
  qsa('[data-filter-region], [data-filter-type], [data-filter-year]').forEach(el => el.addEventListener('change', apply));
  if (form) {
    form.addEventListener('submit', (e) => { e.preventDefault(); apply(); });
  }
  apply();
}
function initCategoryFilter() {
  const input = qs('[data-page-filter]');
  const grid = qs('[data-page-grid]');
  if (!input || !grid) return;
  const cards = qsa('.movie-card', grid);
  const countEl = qs('[data-page-count]');
  const apply = () => {
    const q = input.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const text = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.genre].join(' ').toLowerCase();
      const show = !q || text.includes(q);
      card.hidden = !show;
      if (show) visible += 1;
    });
    if (countEl) countEl.textContent = String(visible);
  };
  input.addEventListener('input', apply);
  apply();
}
function initPlayer() {
  const player = qs('[data-player]');
  if (!player) return;
  const video = qs('video', player);
  const playBtn = qs('[data-play-toggle]', player);
  const note = qs('[data-player-note]', player);
  if (!video) return;
  const hlsSrc = player.dataset.hlsSrc;
  const mp4Src = player.dataset.mp4Src;
  const canNativeHls = video.canPlayType('application/vnd.apple.mpegurl');
  if (window.Hls && window.Hls.isSupported()) {
    const hls = new window.Hls({ enableWorker: true });
    hls.loadSource(hlsSrc);
    hls.attachMedia(video);
    hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
      if (note) note.textContent = 'HLS 已就绪，点击播放即可开始观看。';
    });
  } else if (canNativeHls) {
    video.src = hlsSrc;
    if (note) note.textContent = '浏览器原生支持 HLS，已连接播放源。';
  } else {
    video.src = mp4Src;
    if (note) note.textContent = '当前浏览器使用 MP4 兼容源播放。';
  }
  const syncLabel = () => {
    if (!playBtn) return;
    playBtn.textContent = video.paused ? '播放' : '暂停';
  };
  if (playBtn) {
    playBtn.addEventListener('click', async () => {
      if (video.paused) {
        try { await video.play(); } catch (err) {}
      } else {
        video.pause();
      }
      syncLabel();
    });
  }
  video.addEventListener('play', syncLabel);
  video.addEventListener('pause', syncLabel);
  video.addEventListener('ended', syncLabel);
  syncLabel();
}
function initSearchPage() {
  const data = window.MOVIES_DATA;
  const root = qs('[data-live-search]');
  if (!root || !Array.isArray(data)) return;
  const input = qs('[data-live-input]', root);
  const region = qs('[data-live-region]', root);
  const type = qs('[data-live-type]', root);
  const year = qs('[data-live-year]', root);
  const sort = qs('[data-live-sort]', root);
  const grid = qs('[data-live-grid]', root);
  const countEl = qs('[data-live-count]', root);
  const q = new URLSearchParams(location.search).get('q') || '';
  if (input && q) input.value = q;
  const optionsFrom = (items, key) => [''].concat([...new Set(items.map(i => String(i[key])))]);
  const render = () => {
    const kw = (input?.value || '').trim().toLowerCase();
    const rf = region?.value || '';
    const tf = type?.value || '';
    const yf = year?.value || '';
    let rows = data.filter(item => {
      const text = [item.title, item.region, item.type, item.genre, item.tags.join(' '), item.one_line, item.summary, item.review].join(' ').toLowerCase();
      return (!kw || text.includes(kw)) && (!rf || item.region === rf) && (!tf || item.type === tf) && (!yf || String(item.year) === yf);
    });
    if (sort && sort.value === 'year') rows.sort((a,b) => b.year - a.year || a.id - b.id);
    else if (sort && sort.value === 'title') rows.sort((a,b) => a.title.localeCompare(b.title, 'zh-Hans-CN'));
    else rows.sort((a,b) => (b.score - a.score) || (a.id - b.id));
    if (countEl) countEl.textContent = String(rows.length);
    if (!grid) return;
    grid.innerHTML = rows.map(movie => `
      <article class="movie-card" data-search-item data-text="${escapeHtml([movie.title,movie.region,movie.type,movie.genre,movie.tags.join(' '),movie.one_line,movie.summary,movie.review].join(' '))}" data-region="${escapeHtml(movie.region)}" data-type="${escapeHtml(movie.type)}" data-year="${movie.year}">
        <a class="movie-card__link" href="./${movie.slug}">
          <div class="movie-card__poster">
            <img data-poster src="./${movie.poster_num}.jpg" alt="${escapeHtml(movie.title)} 海报" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.hidden=false;">
            <div class="poster-fallback" hidden>
              <span class="poster-fallback__year">${movie.year}</span>
              <span class="poster-fallback__title">${escapeHtml(movie.title)}</span>
            </div>
            <span class="movie-card__badge">${escapeHtml(movie.type)}</span>
          </div>
          <div class="movie-card__body">
            <div class="movie-card__meta"><span>${escapeHtml(movie.region)}</span><span>${movie.year}</span></div>
            <h3 class="movie-card__title">${escapeHtml(movie.title)}</h3>
            <p class="movie-card__text">${escapeHtml(movie.one_line || movie.summary.slice(0, 80))}</p>
            <div class="chip-row">${movie.tags.slice(0,3).map(t => `<span class="chip">${escapeHtml(t)}</span>`).join('')}</div>
          </div>
        </a>
      </article>
    `).join('');
    initPosterFallbacks();
  };
  const fillSelect = (sel, items, label) => {
    if (!sel || sel.options.length > 1) return;
    const unique = [...new Set(items)];
    unique.sort((a,b) => String(a).localeCompare(String(b), 'zh-Hans-CN'));
    unique.forEach(v => {
      const opt = document.createElement('option');
      opt.value = String(v);
      opt.textContent = String(v);
      sel.appendChild(opt);
    });
  };
  fillSelect(region, data.map(i => i.region));
  fillSelect(type, data.map(i => i.type));
  fillSelect(year, data.map(i => i.year));
  [input, region, type, year, sort].forEach(el => el && el.addEventListener('input', render));
  [region, type, year, sort].forEach(el => el && el.addEventListener('change', render));
  render();
}
function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
ready(() => {
  initMenu();
  initHeroCarousel();
  initPosterFallbacks();
  initSearchFilter();
  initCategoryFilter();
  initPlayer();
  initSearchPage();
});
