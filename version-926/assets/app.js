(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function htmlEscape(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function setupMobileMenu() {
        var toggle = qs('[data-mobile-toggle]');
        var panel = qs('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function setupHeaderSearch() {
        qsa('[data-header-search]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = qs('input', form);
                var query = input ? input.value.trim() : '';
                if (query) {
                    window.location.href = './search.html?q=' + encodeURIComponent(query);
                }
            });
        });
    }

    function setupHero() {
        var slider = qs('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = qsa('[data-hero-slide]', slider);
        var dots = qsa('[data-hero-dot]');
        var prev = qs('[data-hero-prev]');
        var next = qs('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        function start() {
            stop();
            timer = setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupCardFilters() {
        qsa('[data-filter-root]').forEach(function (root) {
            var input = qs('[data-filter-input]', root);
            var year = qs('[data-filter-year]', root);
            var region = qs('[data-filter-region]', root);
            var cards = qsa('[data-movie-card]', root);
            var empty = qs('[data-empty-state]', root);

            function apply() {
                var keyword = normalize(input && input.value);
                var yearValue = normalize(year && year.value);
                var regionValue = normalize(region && region.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var cardRegion = normalize(card.getAttribute('data-region'));
                    var matched = true;

                    if (keyword && text.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (yearValue && cardYear !== yearValue) {
                        matched = false;
                    }
                    if (regionValue && cardRegion.indexOf(regionValue) === -1) {
                        matched = false;
                    }
                    card.style.display = matched ? '' : 'none';
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('show', visible === 0);
                }
            }

            [input, year, region].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    function createMovieCard(movie) {
        var tags = (movie.tags || []).slice(0, 2).map(function (tag) {
            return '<span class="tag-pill">' + htmlEscape(tag) + '</span>';
        }).join('');
        return [
            '<a class="movie-card" href="./' + htmlEscape(movie.url) + '">',
            '  <div class="poster-wrap">',
            '    <img src="./' + htmlEscape(movie.cover) + '" alt="' + htmlEscape(movie.title) + '" loading="lazy">',
            '    <span class="poster-shade"></span>',
            '    <span class="play-float">▶</span>',
            '  </div>',
            '  <div class="card-body">',
            '    <h3 class="card-title">' + htmlEscape(movie.title) + '</h3>',
            '    <p class="card-desc">' + htmlEscape(movie.oneLine) + '</p>',
            '    <div class="tag-row">' + tags + '</div>',
            '    <div class="card-meta">',
            '      <span>' + htmlEscape(movie.year) + '</span>',
            '      <span>' + htmlEscape(movie.category) + '</span>',
            '    </div>',
            '  </div>',
            '</a>'
        ].join('');
    }

    function setupSearchPage() {
        var root = qs('[data-search-page]');
        if (!root || !window.SEARCH_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var input = qs('[data-search-input]', root);
        var category = qs('[data-search-category]', root);
        var year = qs('[data-search-year]', root);
        var result = qs('[data-search-results]', root);
        var empty = qs('[data-search-empty]', root);
        var form = qs('[data-search-form]', root);
        if (input && params.get('q')) {
            input.value = params.get('q');
        }

        function render() {
            var keyword = normalize(input && input.value);
            var categoryValue = normalize(category && category.value);
            var yearValue = normalize(year && year.value);
            var list = window.SEARCH_MOVIES.filter(function (movie) {
                var text = normalize(movie.title + ' ' + movie.category + ' ' + movie.year + ' ' + movie.region + ' ' + movie.genre + ' ' + (movie.tags || []).join(' ') + ' ' + movie.oneLine);
                if (keyword && text.indexOf(keyword) === -1) {
                    return false;
                }
                if (categoryValue && normalize(movie.category) !== categoryValue) {
                    return false;
                }
                if (yearValue && normalize(movie.year) !== yearValue) {
                    return false;
                }
                return true;
            }).slice(0, 120);

            result.innerHTML = list.map(createMovieCard).join('');
            empty.classList.toggle('show', list.length === 0);
        }

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                render();
            });
        }
        [input, category, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', render);
                control.addEventListener('change', render);
            }
        });
        render();
    }

    window.initMoviePlayer = function (source) {
        var video = qs('[data-player-video]');
        var overlay = qs('[data-player-overlay]');
        var button = qs('[data-player-button]');
        if (!video || !source) {
            return;
        }
        var attached = false;

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            attach();
            video.controls = true;
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }
        if (button) {
            button.addEventListener('click', function (event) {
                event.stopPropagation();
                play();
            });
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHeaderSearch();
        setupHero();
        setupCardFilters();
        setupSearchPage();
    });
})();
