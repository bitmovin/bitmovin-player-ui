(() => {
  const layout = new URLSearchParams(window.location.search).get('layout') || 'desktop';
  const selectedLayout = ['desktop', 'mobile', 'tv'].includes(layout) ? layout : 'desktop';
  const layoutSelect = document.getElementById('layout');
  const container = document.getElementById('player');
  const creative = document.getElementById('creative');
  const status = document.getElementById('demo-status');
  const log = document.getElementById('demo-log');

  layoutSelect.value = selectedLayout;
  document.body.classList.toggle('mobile', selectedLayout === 'mobile');
  layoutSelect.addEventListener('change', () => {
    const url = new URL(window.location.href);
    url.searchParams.set('layout', layoutSelect.value);
    window.location.assign(url.href);
  });

  const playerBundle = window.bitmovin?.player;
  const playerUi = window.bitmovin?.playerui;
  if (!playerBundle || !playerUi) {
    status.textContent = 'Could not load the Player or UI bundle. Check the browser console.';
    return;
  }

  if (selectedLayout === 'mobile') {
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value: `${navigator.userAgent} Mobi`,
    });
  }

  const handlers = {};
  let sourceLoaded = true;
  let playing = true;
  let currentTime = 60;
  let activeAd;
  let clickThroughCount = 0;
  let nextAdId = 0;

  const record = message => {
    const item = document.createElement('li');
    item.textContent = message;
    log.prepend(item);
  };
  const updateStatus = () => {
    status.textContent = `Ad active: ${Boolean(activeAd)} · Clickthroughs: ${clickThroughCount} · Time: ${Math.round(currentTime)}s`;
  };
  const fire = (type, data = {}) => {
    (handlers[type] || []).forEach(callback => callback({ type, timestamp: Date.now(), ...data }));
  };
  const finishAd = () => {
    if (!activeAd) return;
    const ad = activeAd;
    activeAd = undefined;
    creative.hidden = true;
    fire('nonlinearadfinished', { ad: { id: ad.id } });
    record('Pause ad finished');
    updateStatus();
  };

  // PlayerWrapper enumerates Player.prototype, so give the stub that API shape and override
  // the methods that the UI actually uses. This is the same approach as test/browser/harness.ts.
  const noops = {};
  Object.getOwnPropertyNames(playerBundle.Player.prototype)
    .filter(name => name !== 'constructor')
    .forEach(name => {
      noops[name] = /^(getAvailable|getSupported)/.test(name) ? () => [] : () => undefined;
    });

  const PlayerEvent = playerBundle.PlayerEvent;
  const player = {
    ...noops,
    exports: playerBundle,
    getContainer: () => container,
    getConfig: () => ({}),
    getSource: () => (sourceLoaded ? {} : null),
    isLive: () => false,
    getDuration: () => 600,
    getCurrentTime: () => currentTime,
    getTimeShift: () => 0,
    getMaxTimeShift: () => 0,
    getSeekableRange: () => ({ start: 0, end: 600 }),
    getVolume: () => 100,
    isMuted: () => false,
    isPlaying: () => playing,
    isPaused: () => !playing,
    isStalled: () => false,
    isCasting: () => false,
    isAirplayActive: () => false,
    isAirplayAvailable: () => false,
    isViewModeAvailable: () => false,
    hasEnded: () => false,
    getViewMode: () => 'inline',
    getPlayerType: () => 'html5',
    getStreamType: () => 'hls',
    getAudio: () => ({ id: 'audio-1', label: 'Audio' }),
    getVideoQuality: () => ({ id: 'hd', label: 'HD' }),
    getAvailableVideoQualities: () => [
      { id: 'hd', label: 'HD' },
      { id: 'sd', label: 'SD' },
    ],
    getAudioQuality: () => ({ id: 'audio-q-1', label: 'Auto' }),
    getAvailableAudio: () => [],
    getVideoBufferLength: () => 0,
    getAudioBufferLength: () => 0,
    getThumbnail: () => null,
    subtitles: { list: () => [] },
    ads: {
      isLinearAdActive: () => false,
      getActiveAd: () => null,
      skip: finishAd,
    },
    on: (event, callback) => {
      (handlers[event] = handlers[event] || []).push(callback);
    },
    off: (event, callback) => {
      handlers[event] = (handlers[event] || []).filter(handler => handler !== callback);
    },
    seek: time => {
      fire(PlayerEvent.Seek, { position: currentTime, seekTarget: time });
      currentTime = time;
      fire(PlayerEvent.TimeChanged, { time });
      fire(PlayerEvent.Seeked);
      record(`Seeked to ${Math.round(time)}s`);
      updateStatus();
      return true;
    },
    timeShift: () => undefined,
    play: (issuer = 'api') => {
      finishAd();
      playing = true;
      fire(PlayerEvent.Play, { time: currentTime, issuer });
      fire(PlayerEvent.Playing, { time: currentTime, issuer });
      updateStatus();
      return Promise.resolve();
    },
    pause: (issuer = 'api') => {
      playing = false;
      fire(PlayerEvent.Paused, { time: currentTime, issuer });
      updateStatus();
    },
    mute: () => undefined,
    unmute: () => undefined,
    setVolume: () => undefined,
    setAudio: () => undefined,
  };

  const uiConfig = {
    componentConfigOverrides: { UIContainer: { hideDelay: -1 } },
    metadata: { title: 'Pause-ad demo', description: 'Simulated Player events' },
  };
  const factory = {
    desktop: 'buildUI',
    mobile: 'buildSmallScreenUI',
    tv: 'buildTvUI',
  }[selectedLayout];
  playerUi.UIFactory[factory](player, uiConfig);

  const startAd = clickable => {
    if (!sourceLoaded) {
      sourceLoaded = true;
      fire(PlayerEvent.SourceLoaded);
    }
    finishAd();
    player.pause();
    clickThroughCount = 0;
    const ad = { id: `pause-ad-${++nextAdId}` };
    if (clickable) {
      // The UI opens this URL itself; the callback only tracks the click, as the player does.
      ad.clickThroughUrl = new URL('pause-ad-clickthrough.html', window.location.href).href;
      ad.clickThroughUrlOpened = () => {
        clickThroughCount += 1;
        record('Creative clickthrough opened');
        updateStatus();
      };
    }
    activeAd = ad;
    creative.hidden = false;
    fire('nonlinearadstarted', { ad });
    record(clickable ? 'Clickable pause ad started' : 'Pause ad without link started');
    updateStatus();
  };

  document.getElementById('start-clickable').addEventListener('click', () => startAd(true));
  document.getElementById('start-no-link').addEventListener('click', () => startAd(false));
  document.getElementById('finish').addEventListener('click', finishAd);
  document.getElementById('unload').addEventListener('click', () => {
    sourceLoaded = false;
    activeAd = undefined;
    creative.hidden = true;
    fire(PlayerEvent.SourceUnloaded);
    record('Source unloaded');
    updateStatus();
  });
  document.getElementById('load').addEventListener('click', () => {
    sourceLoaded = true;
    fire(PlayerEvent.SourceLoaded);
    record('Source loaded');
    updateStatus();
  });
  updateStatus();
})();
