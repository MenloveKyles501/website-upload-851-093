(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function() {
      panel.classList.toggle("is-open");
    });
  }

  function initForms() {
    document.querySelectorAll("[data-search-form]").forEach(function(form) {
      form.addEventListener("submit", function(event) {
        var input = form.querySelector("input[name='q']");
        if (!input) {
          return;
        }
        var value = input.value.trim();
        if (!value) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function() {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function() {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener("click", function() {
        show(dotIndex);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initCatalog() {
    var grid = document.querySelector("[data-catalog-grid]");
    if (!grid) {
      return;
    }
    var input = document.querySelector("[data-catalog-search]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".video-card"));
    var empty = document.querySelector("[data-empty-state]");
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    var params = new URLSearchParams(window.location.search);
    var activeFilter = "";

    if (input && params.get("q")) {
      input.value = params.get("q");
    }

    function apply() {
      var term = input ? input.value.trim().toLowerCase() : "";
      var visible = 0;
      cards.forEach(function(card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var matchTerm = !term || text.indexOf(term) !== -1;
        var matchFilter = !activeFilter || text.indexOf(activeFilter.toLowerCase()) !== -1;
        var keep = matchTerm && matchFilter;
        card.classList.toggle("is-hidden", !keep);
        if (keep) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    buttons.forEach(function(button) {
      button.addEventListener("click", function() {
        activeFilter = button.getAttribute("data-filter-value") || "";
        buttons.forEach(function(item) {
          item.classList.toggle("is-active", item === button);
        });
        apply();
      });
    });
    apply();
  }

  ready(function() {
    initMenu();
    initForms();
    initHero();
    initCatalog();
  });
})();
