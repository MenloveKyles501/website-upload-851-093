(function () {
    var video = document.getElementById('movie-player');
    var cover = document.getElementById('player-cover');
    var status = document.querySelector('[data-player-status]');
    var hls = null;
    var attached = false;

    if (!video) {
        return;
    }

    function setStatus(text) {
        if (status) {
            status.textContent = text || '';
        }
    }

    function attachStream() {
        var stream = video.getAttribute('data-stream');
        if (!stream || attached) {
            return;
        }
        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (_, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    setStatus('播放失败，请稍后再试');
                    hls.destroy();
                }
            });
            return;
        }

        setStatus('播放失败，请稍后再试');
    }

    function hideCover() {
        if (cover) {
            cover.classList.add('is-hidden');
        }
    }

    function showCover() {
        if (cover) {
            cover.classList.remove('is-hidden');
        }
    }

    function startPlay() {
        attachStream();
        hideCover();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                showCover();
                setStatus('点击画面继续播放');
            });
        }
    }

    if (cover) {
        cover.addEventListener('click', startPlay);
    }

    video.addEventListener('play', function () {
        hideCover();
        setStatus('');
    });

    video.addEventListener('ended', function () {
        showCover();
    });

    video.addEventListener('click', function () {
        if (!attached || video.paused) {
            startPlay();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
})();
