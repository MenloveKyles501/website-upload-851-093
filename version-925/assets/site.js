
(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function text(value) {
    return String(value || '').toLowerCase();
  }

  function initMenu() {
    var button = qs('[data-menu-toggle]');
    var menu = qs('[data-mobile-nav]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
      document.body.classList.toggle('menu-open', menu.classList.contains('open'));
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    show(0);
    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  function initPageFilter() {
    var input = qs('[data-page-filter]');
    var typeSelect = qs('[data-type-filter]');
    if (!input && !typeSelect) {
      return;
    }
    var cards = qsa('[data-card]');
    function apply() {
      var keyword = text(input && input.value);
      var type = typeSelect ? typeSelect.value : '';
      cards.forEach(function (card) {
        var haystack = text([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.tags
        ].join(' '));
        var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var okType = !type || card.dataset.type === type;
        card.style.display = okKeyword && okType ? '' : 'none';
      });
    }
    if (input) {
      input.addEventListener('input', apply);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', apply);
    }
  }

  function loadStream(video, status) {
    var streamUrl = video.dataset.stream;
    if (!streamUrl) {
      return Promise.resolve(false);
    }
    if (video.dataset.ready === '1') {
      return Promise.resolve(true);
    }
    if (status) {
      status.textContent = '正在载入';
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      video.dataset.ready = '1';
      return Promise.resolve(true);
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.dataset.ready = '1';
      return Promise.resolve(true);
    }
    video.src = streamUrl;
    video.dataset.ready = '1';
    return Promise.resolve(true);
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video', player);
      var button = qs('[data-play]', player);
      var status = qs('[data-player-status]', player);
      if (!video || !button) {
        return;
      }
      function start(event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        loadStream(video, status).then(function () {
          player.classList.add('is-playing');
          var promise = video.play();
          if (promise && promise.catch) {
            promise.catch(function () {
              player.classList.remove('is-playing');
              if (status) {
                status.textContent = '点击视频继续';
              }
            });
          }
        });
      }
      button.addEventListener('click', start);
      player.addEventListener('click', function (event) {
        if (event.target === video) {
          return;
        }
        start(event);
      });
      video.addEventListener('playing', function () {
        player.classList.add('is-playing');
        if (status) {
          status.textContent = '';
        }
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          player.classList.remove('is-playing');
        }
      });
    });
  }

  function renderSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card" data-card>',
      '<a class="poster-link" href="' + escapeHtml(movie.url) + '">',
      '<img src="' + escapeHtml(movie.poster) + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy">',
      '<span class="type-badge">' + escapeHtml(movie.type) + '</span>',
      '<span class="year-badge">' + escapeHtml(movie.year) + '</span>',
      '<span class="play-dot">▶</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function initSearchPage() {
    var input = qs('[data-search-input]');
    var typeSelect = qs('[data-search-type]');
    var regionSelect = qs('[data-search-region]');
    var results = qs('[data-search-results]');
    var empty = qs('[data-empty]');
    if (!input || !results || !window.MOVIE_INDEX) {
      return;
    }
    function apply() {
      var keyword = text(input.value);
      var type = typeSelect ? typeSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var matched = window.MOVIE_INDEX.filter(function (movie) {
        var haystack = text([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(' ')
        ].join(' '));
        return (!keyword || haystack.indexOf(keyword) !== -1) &&
          (!type || movie.type === type) &&
          (!region || movie.region.indexOf(region) !== -1);
      }).slice(0, 120);
      results.innerHTML = matched.map(renderSearchCard).join('');
      if (empty) {
        empty.style.display = matched.length ? 'none' : 'block';
      }
    }
    input.addEventListener('input', apply);
    if (typeSelect) {
      typeSelect.addEventListener('change', apply);
    }
    if (regionSelect) {
      regionSelect.addEventListener('change', apply);
    }
    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initPageFilter();
    initPlayers();
    initSearchPage();
  });
})();
