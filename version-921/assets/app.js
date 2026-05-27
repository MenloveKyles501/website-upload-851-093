(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var previous = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 6200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    showSlide(0);
    start();
  }

  var searchInput = document.querySelector('[data-search-input]');
  var typeFilter = document.querySelector('[data-filter-type]');
  var regionFilter = document.querySelector('[data-filter-region]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    var query = normalize(searchInput && searchInput.value);
    var typeValue = normalize(typeFilter && typeFilter.value);
    var regionValue = normalize(regionFilter && regionFilter.value);

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' '));
      var typeText = normalize(card.getAttribute('data-type'));
      var regionText = normalize(card.getAttribute('data-region'));
      var matched = true;

      if (query && haystack.indexOf(query) === -1) {
        matched = false;
      }

      if (typeValue && typeText.indexOf(typeValue) === -1) {
        matched = false;
      }

      if (regionValue && regionText.indexOf(regionValue) === -1) {
        matched = false;
      }

      card.classList.toggle('is-hidden', !matched);
    });
  }

  [searchInput, typeFilter, regionFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  var player = document.querySelector('[data-video-player]');
  var playButton = document.querySelector('[data-play-button]');
  var playerLoaded = false;
  var hlsInstance = null;

  function loadPlayer(autoplay) {
    if (!player) {
      return;
    }

    var source = player.getAttribute('data-src');

    if (!source) {
      return;
    }

    if (!playerLoaded) {
      if (player.canPlayType('application/vnd.apple.mpegurl')) {
        player.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(player);
      } else {
        player.src = source;
      }

      playerLoaded = true;
    }

    if (playButton) {
      playButton.classList.add('hidden');
    }

    if (autoplay) {
      var playPromise = player.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }
  }

  if (playButton) {
    playButton.addEventListener('click', function () {
      loadPlayer(true);
    });
  }

  if (player) {
    player.addEventListener('click', function () {
      if (!playerLoaded) {
        loadPlayer(true);
      }
    });

    player.addEventListener('play', function () {
      if (playButton) {
        playButton.classList.add('hidden');
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
