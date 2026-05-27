(() => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = [...hero.querySelectorAll('[data-hero-slide]')];
    const dots = [...hero.querySelectorAll('[data-hero-dot]')];
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    const show = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === current));
    };

    const start = () => {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(() => show(current + 1), 5200);
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', () => {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        show(current + 1);
        start();
      });
    }

    start();
  }

  document.querySelectorAll('[data-filter-scope]').forEach((scope) => {
    const input = scope.querySelector('[data-filter-input]');
    const cards = [...scope.querySelectorAll('.movie-card')];
    const chipBox = scope.querySelector('[data-filter-chips]');

    const apply = (value) => {
      const query = String(value || '').trim().toLowerCase();
      cards.forEach((card) => {
        const haystack = [
          card.dataset.title,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.year
        ].join(' ').toLowerCase();
        card.hidden = query && !haystack.includes(query);
      });
    };

    if (input) {
      input.addEventListener('input', () => apply(input.value));
    }

    if (chipBox) {
      chipBox.addEventListener('click', (event) => {
        const button = event.target.closest('[data-filter-value]');
        if (!button) return;
        chipBox.querySelectorAll('button').forEach((item) => item.classList.remove('is-active'));
        button.classList.add('is-active');
        if (input) input.value = button.dataset.filterValue || '';
        apply(button.dataset.filterValue || '');
      });
    }
  });

  document.querySelectorAll('[data-video-player]').forEach((wrap) => {
    const video = wrap.querySelector('video');
    const button = wrap.querySelector('[data-play-toggle]');
    const stream = wrap.dataset.stream;
    let hlsInstance = null;
    let loaded = false;

    const attach = () => {
      if (!video || !stream || loaded) return;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        video.src = stream;
      }
      loaded = true;
    };

    const play = async () => {
      attach();
      try {
        video.controls = true;
        await video.play();
        wrap.classList.add('is-playing');
      } catch (error) {
        wrap.classList.remove('is-playing');
      }
    };

    if (button) {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        play();
      });
    }

    if (video) {
      video.addEventListener('play', () => wrap.classList.add('is-playing'));
      video.addEventListener('pause', () => wrap.classList.remove('is-playing'));
      video.addEventListener('ended', () => wrap.classList.remove('is-playing'));
    }

    window.addEventListener('beforeunload', () => {
      if (hlsInstance) hlsInstance.destroy();
    });
  });

  const searchForm = document.querySelector('[data-search-form]');
  const searchInput = document.querySelector('[data-search-input]');
  const searchResults = document.querySelector('[data-search-results]');
  const searchCats = document.querySelector('[data-search-cats]');

  if (searchForm && searchInput && searchResults && Array.isArray(window.SEARCH_ITEMS)) {
    let activeCategory = '';

    const escapeText = (value) => String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    const render = () => {
      const query = searchInput.value.trim().toLowerCase();
      const items = window.SEARCH_ITEMS.filter((item) => {
        const inCategory = !activeCategory || item.category === activeCategory;
        const haystack = [
          item.title,
          item.region,
          item.year,
          item.genre,
          item.tags,
          item.summary,
          item.category
        ].join(' ').toLowerCase();
        return inCategory && (!query || haystack.includes(query));
      }).slice(0, 96);

      searchResults.innerHTML = items.map((item) => `
        <article class="movie-card" data-title="${escapeText(item.title)}" data-tags="${escapeText(item.tags)}" data-region="${escapeText(item.region)}" data-year="${escapeText(item.year)}">
          <a class="card-cover" href="${escapeText(item.href)}">
            <img src="${escapeText(item.cover)}" alt="${escapeText(item.title)}" loading="lazy">
            <span class="cover-gradient"></span>
            <span class="score-badge">${escapeText(item.rating)}</span>
          </a>
          <div class="card-body">
            <div class="card-meta">
              <span>${escapeText(item.region)}</span>
              <span>${escapeText(item.year)}</span>
              <span>${escapeText(item.type)}</span>
            </div>
            <h2 class="card-title"><a href="${escapeText(item.href)}">${escapeText(item.title)}</a></h2>
            <p class="card-desc">${escapeText(item.summary)}</p>
            <div class="tag-row"><span>${escapeText(item.category)}</span></div>
          </div>
        </article>
      `).join('');
    };

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) searchInput.value = q;

    searchInput.addEventListener('input', render);
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      render();
    });

    if (searchCats) {
      searchCats.addEventListener('click', (event) => {
        const button = event.target.closest('[data-search-category]');
        if (!button) return;
        searchCats.querySelectorAll('button').forEach((item) => item.classList.remove('is-active'));
        button.classList.add('is-active');
        activeCategory = button.dataset.searchCategory || '';
        render();
      });
    }

    render();
  }
})();
