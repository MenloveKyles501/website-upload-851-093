(function() {
  function playVideo(video, overlay, streamUrl) {
    var started = video.getAttribute("data-ready") === "1";
    var hls;

    function play() {
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function() {});
      }
    }

    if (!started) {
      video.setAttribute("data-ready", "1");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        play();
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        video._hls = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
          play();
        });
      } else {
        video.src = streamUrl;
        play();
      }
    } else {
      play();
    }

    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  }

  function init(videoId, buttonId, overlayId, streamUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var button = document.getElementById(buttonId);

    if (!video) {
      return;
    }

    function start(event) {
      if (event) {
        event.preventDefault();
      }
      playVideo(video, overlay, streamUrl);
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    if (button) {
      button.addEventListener("click", start);
    }
    video.addEventListener("play", function() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
  }

  window.MoviePlayer = {
    init: init
  };
})();
