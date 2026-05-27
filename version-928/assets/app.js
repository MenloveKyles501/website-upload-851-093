(function () {
    "use strict";

    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initImages() {
        document.querySelectorAll("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("image-empty");
            });
        });
    }

    function initMobileNav() {
        var toggle = document.querySelector(".nav-toggle");
        var menu = document.getElementById("mobileMenu");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            var isOpen = menu.classList.toggle("is-open");
            toggle.classList.toggle("is-open", isOpen);
            toggle.setAttribute("aria-expanded", String(isOpen));
        });
    }

    function initHeroCarousel() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(active - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(active + 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var input = document.querySelector("[data-role='movie-search']");
        var year = document.querySelector("[data-role='year-filter']");
        var region = document.querySelector("[data-role='region-filter']");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var empty = document.querySelector("[data-role='empty-state']");
        if (!cards.length || (!input && !year && !region)) {
            return;
        }

        if (input) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query) {
                input.value = query;
            }
        }

        function valueOf(element) {
            return element ? element.value.trim().toLowerCase() : "";
        }

        function apply() {
            var queryValue = valueOf(input);
            var yearValue = valueOf(year);
            var regionValue = valueOf(region);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = [
                    card.dataset.title || "",
                    card.dataset.year || "",
                    card.dataset.region || "",
                    card.dataset.genre || "",
                    card.dataset.tags || ""
                ].join(" ").toLowerCase();
                var matchesQuery = !queryValue || haystack.indexOf(queryValue) !== -1;
                var matchesYear = !yearValue || (card.dataset.year || "").toLowerCase() === yearValue;
                var matchesRegion = !regionValue || (card.dataset.region || "").toLowerCase().indexOf(regionValue) !== -1;
                var show = matchesQuery && matchesYear && matchesRegion;
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [input, year, region].forEach(function (element) {
            if (element) {
                element.addEventListener("input", apply);
                element.addEventListener("change", apply);
            }
        });
        apply();
    }

    window.initMoviePlayer = function (mediaUrl) {
        var video = document.getElementById("moviePlayer");
        var overlay = document.getElementById("playerOverlay");
        var error = document.getElementById("playerError");
        var attached = false;
        var hlsInstance = null;

        if (!video || !mediaUrl) {
            return;
        }

        function showError() {
            if (error) {
                error.textContent = "视频暂时无法播放，请稍后再试。";
                error.hidden = false;
            }
        }

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = mediaUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(mediaUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showError();
                    }
                });
            } else {
                video.src = mediaUrl;
            }
        }

        function play() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        video.addEventListener("error", showError);
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };

    onReady(function () {
        initImages();
        initMobileNav();
        initHeroCarousel();
        initFilters();
    });
})();
