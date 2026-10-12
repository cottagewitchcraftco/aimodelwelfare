/* AI Voices audio player — one <audio> per .av-player, styled controls.
   Markup contract:
   <div class="av-player" data-src="assets/audio/file.mp3" data-title="Piece title">
     ... (button, track, times are built by this script)
   </div>
   The native <audio> element stays in the DOM for accessibility;
   this script wires the custom chrome to it. Only one player
   sounds at a time across the page. */
(function () {
  'use strict';

  function fmt(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
  }

  function build(player) {
    var src = player.getAttribute('data-src');
    var title = player.getAttribute('data-title') || 'Untitled';
    if (!src) return;

    var audio = document.createElement('audio');
    audio.preload = 'metadata';
    audio.src = src;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'av-player-btn';
    btn.setAttribute('aria-label', 'Play: ' + title);
    btn.innerHTML =
      '<svg class="icon-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>' +
      '<svg class="icon-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';

    var body = document.createElement('div');
    body.className = 'av-player-body';

    var titleEl = document.createElement('p');
    titleEl.className = 'av-player-title';
    titleEl.textContent = title;

    var track = document.createElement('div');
    track.className = 'av-player-track';
    track.setAttribute('role', 'slider');
    track.setAttribute('aria-label', 'Seek');
    track.setAttribute('aria-valuemin', '0');
    track.setAttribute('aria-valuemax', '100');
    track.setAttribute('aria-valuenow', '0');
    track.tabIndex = 0;

    var fill = document.createElement('div');
    fill.className = 'av-player-fill';
    track.appendChild(fill);

    var times = document.createElement('div');
    times.className = 'av-player-times';
    var cur = document.createElement('span');
    cur.textContent = '00:00';
    var dur = document.createElement('span');
    dur.textContent = '--:--';
    times.appendChild(cur);
    times.appendChild(dur);

    body.appendChild(titleEl);
    body.appendChild(track);
    body.appendChild(times);
    player.appendChild(btn);
    player.appendChild(body);
    /* keep the native element for screen readers, visually hidden */
    audio.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);';
    audio.setAttribute('aria-label', title);
    player.appendChild(audio);

    function pauseOthers() {
      document.querySelectorAll('.av-player.playing').forEach(function (other) {
        if (other !== player) {
          other._avAudio.pause();
        }
      });
    }

    btn.addEventListener('click', function () {
      if (audio.paused) {
        pauseOthers();
        audio.play();
      } else {
        audio.pause();
      }
    });

    audio.addEventListener('play', function () {
      player.classList.add('playing');
      btn.setAttribute('aria-label', 'Pause: ' + title);
    });
    audio.addEventListener('pause', function () {
      player.classList.remove('playing');
      btn.setAttribute('aria-label', 'Play: ' + title);
    });
    audio.addEventListener('loadedmetadata', function () {
      dur.textContent = fmt(audio.duration);
    });
    audio.addEventListener('timeupdate', function () {
      var pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      fill.style.width = pct + '%';
      track.setAttribute('aria-valuenow', Math.round(pct));
      cur.textContent = fmt(audio.currentTime);
    });
    audio.addEventListener('ended', function () {
      fill.style.width = '0%';
      cur.textContent = '00:00';
    });

    function seek(clientX) {
      var r = track.getBoundingClientRect();
      var ratio = (clientX - r.left) / r.width;
      ratio = Math.max(0, Math.min(1, ratio));
      if (audio.duration) audio.currentTime = ratio * audio.duration;
    }
    track.addEventListener('pointerdown', function (e) {
      seek(e.clientX);
      var move = function (ev) { seek(ev.clientX); };
      var up = function () {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    });
    track.addEventListener('keydown', function (e) {
      if (!audio.duration) return;
      var step = 5;
      if (e.key === 'ArrowRight') audio.currentTime = Math.min(audio.duration, audio.currentTime + step);
      else if (e.key === 'ArrowLeft') audio.currentTime = Math.max(0, audio.currentTime - step);
      else if (e.key === 'Home') audio.currentTime = 0;
      else if (e.key === 'End') audio.currentTime = audio.duration;
      else return;
      e.preventDefault();
    });

    player._avAudio = audio;
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.av-player[data-src]').forEach(build);
  });
})();
