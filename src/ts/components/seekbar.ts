import { Component, ComponentConfig } from './component';
import { DOM } from '../dom';
import { Event, EventDispatcher, NoArgs } from '../eventdispatcher';
import { SeekBarLabel } from './seekbarlabel';
import { UIInstanceManager, SeekPreviewArgs } from '../uimanager';
import { Timeout } from '../timeout';
import { PlayerUtils } from '../playerutils';
import TimeShiftAvailabilityChangedArgs = PlayerUtils.TimeShiftAvailabilityChangedArgs;
import LiveStreamDetectorEventArgs = PlayerUtils.LiveStreamDetectorEventArgs;
import { TimelineMarker } from '../uiconfig';
import { PlayerAPI, PlayerEventBase } from 'bitmovin-player';
import { StringUtils } from '../stringutils';
import { SeekBarType, SeekBarController } from './seekbarcontroller';
import { i18n } from '../localization/i18n';
import { BrowserUtils } from '../browserutils';
import { TimelineMarkersHandler } from './timelinemarkershandler';
import { getMinBufferLevel } from './seekbarbufferlevel';

/**
 * Configuration interface for the {@link SeekBar} component.
 */
export interface SeekBarConfig extends ComponentConfig {
  /**
   * The label above the seek position.
   */
  label?: SeekBarLabel;
  /**
   * Bar will be vertical instead of horizontal if set to true.
   */
  vertical?: boolean;
  /**
   * The interval in milliseconds in which the playback position on the seek bar will be updated. The shorter the
   * interval, the smoother it looks and the more resource intense it is. The update interval will be kept as steady
   * as possible to avoid jitter.
   * Set to -1 to disable smooth updating and update it on player TimeChanged events instead.
   * Default: 50 (50ms = 20fps).
   */
  smoothPlaybackPositionUpdateIntervalMs?: number;

  /**
   * Used for seekBar control increments and decrements
   */
  keyStepIncrements?: { leftRight: number, upDown: number };

  /**
   * Used for seekBar marker snapping range percentage
   */
  snappingRange?: number;

  /**
   * Used to enable/disable seek preview
   */
  enableSeekPreview?: boolean;
}

/**
 * Event argument interface for a seek preview event.
 */
export interface SeekPreviewEventArgs extends SeekPreviewArgs {
  /**
   * Tells if the seek preview event comes from a scrubbing.
   */
  scrubbing: boolean;
}

export interface SeekBarMarker {
  marker: TimelineMarker;
  position: number;
  duration?: number;
  element?: DOM;
}

/**
 * A seek bar to seek within the player's media. It displays the current playback position, amount of buffed data, seek
 * target, and keeps status about an ongoing seek.
 *
 * The seek bar displays different 'bars':
 *  - the playback position, i.e. the position in the media at which the player current playback pointer is positioned
 *  - the buffer position, which usually is the playback position plus the time span that is already buffered ahead
 *  - the seek position, used to preview to where in the timeline a seek will jump to
 */
export class SeekBar extends Component<SeekBarConfig> {

  public static readonly SMOOTH_PLAYBACK_POSITION_UPDATE_DISABLED = -1;

  /**
   * The CSS class that is added to the DOM element while the seek bar is in 'seeking' state.
   */
  private static readonly CLASS_SEEKING = 'seeking';

  private seekBar: DOM;
  private seekBarPlaybackPosition: DOM;
  private seekBarPlaybackPositionMarker: DOM;
  private seekBarBufferPosition: DOM;
  private seekBarSeekPosition: DOM;
  private seekBarBackdrop: DOM;

  private label: SeekBarLabel;

  private seekBarMarkersContainer: DOM;
  private timelineMarkersHandler: TimelineMarkersHandler;

  private player: PlayerAPI;

  protected seekBarType: SeekBarType;

  protected isUiShown: boolean;

  /**
   * Buffer of the the current playback position. The position must be buffered in case the element
   * needs to be refreshed with {@link #refreshPlaybackPosition}.
   * @type {number}
   */
  private playbackPositionPercentage = 0;

  private smoothPlaybackPositionUpdater: Timeout;
  private pausedTimeshiftUpdater: Timeout;

  private isUserSeeking = false;

  private seekBarEvents = {
    /**
     * Fired when a scrubbing seek operation is started.
     */
    onSeek: new EventDispatcher<SeekBar, NoArgs>(),
    /**
     * Fired during a scrubbing seek to indicate that the seek preview (i.e. the video frame) should be updated.
     */
    onSeekPreview: new EventDispatcher<SeekBar, SeekPreviewEventArgs>(),
    /**
     * Fired when a scrubbing seek has finished or when a direct seek is issued.
     */
    onSeeked: new EventDispatcher<SeekBar, number>(),
  };

  constructor(config: SeekBarConfig = {}) {
    super(config);

    const keyStepIncrements = this.config.keyStepIncrements || {
      leftRight: 1,
      upDown: 5,
    };

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-seekbar',
      vertical: false,
      smoothPlaybackPositionUpdateIntervalMs: 50,
      keyStepIncrements,
      ariaLabel: i18n.getLocalizer('seekBar'),
      tabIndex: 0,
      snappingRange: 1,
      enableSeekPreview: true,
    }, this.config);

    this.label = this.config.label;
  }

  initialize(): void {
    super.initialize();

    if (this.hasLabel()) {
      this.getLabel().initialize();
    }
  }

  protected setAriaSliderMinMax(min: string, max: string) {
    this.getDomElement().attr('aria-valuemin', min);
    this.getDomElement().attr('aria-valuemax', max);
  }

  private setAriaSliderValues() {
    if (this.seekBarType === SeekBarType.Live) {
      const timeshiftValue = Math.ceil(this.player.getTimeShift()).toString();
      this.getDomElement().attr('aria-valuenow', timeshiftValue);
      this.getDomElement().attr('aria-valuetext', `${i18n.performLocalization(i18n.getLocalizer('seekBar.timeshift'))} ${i18n.performLocalization(i18n.getLocalizer('seekBar.value'))}: ${timeshiftValue}`);
    } else if (this.seekBarType === SeekBarType.Vod) {
      const ariaValueText = `${StringUtils.secondsToText(this.player.getCurrentTime())} ${i18n.performLocalization(i18n.getLocalizer('seekBar.durationText'))} ${StringUtils.secondsToText(this.player.getDuration())}`;
      this.getDomElement().attr('aria-valuenow', Math.floor(this.player.getCurrentTime()).toString());
      this.getDomElement().attr('aria-valuetext', ariaValueText);
    }
  }

  private getPlaybackPositionPercentage(): number {
    if (this.player.isLive()) {
      return 100 - (100 / this.player.getMaxTimeShift() * this.player.getTimeShift());
    }

    return 100 / this.player.getDuration() * this.getRelativeCurrentTime();
  }

  private updateBufferLevel(playbackPositionPercentage: number): void {

    let bufferLoadedPercentageLevel: number;
    if (this.player.isLive()) {
      // Always show full buffer for live streams
      bufferLoadedPercentageLevel = 100;
    } else {
      bufferLoadedPercentageLevel = playbackPositionPercentage + getMinBufferLevel(this.player);
    }

    this.setBufferPosition(bufferLoadedPercentageLevel);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager, configureSeek: boolean = true): void {
    super.configure(player, uimanager);

    this.player = player;

    // Apply scaling transform to the backdrop bar to have all bars rendered similarly
    // (the call must be up here to be executed for the volume slider as well)
    this.setPosition(this.seekBarBackdrop, 100);

    // Add seekbar controls to the seekbar
    const seekBarController = new SeekBarController(this.config.keyStepIncrements, player, uimanager.getConfig().volumeController);

    seekBarController.setSeekBarControls(this.getDomElement(), () => this.seekBarType);

    // The configureSeek flag can be used by subclasses to disable configuration as seek bar. E.g. the volume
    // slider is reusing this component but adds its own functionality, and does not need the seek functionality.
    // This is actually a hack, the proper solution would be for both seek bar and volume sliders to extend
    // a common base slider component and implement their functionality there.
    if (!configureSeek) {
      this.seekBarType = SeekBarType.Volume;

      return;
    }

    uimanager.onControlsShow.subscribe(() => {
      this.isUiShown = true;
    });

    uimanager.onControlsHide.subscribe(() => {
      this.isUiShown = false;
    });

    let isPlaying = false;
    let scrubbing = false;
    let isPlayerSeeking = false;

    // Update playback and buffer positions
    let playbackPositionHandler = (event: PlayerEventBase = null, forceUpdate: boolean = false) => {
      if (this.isUserSeeking) {
        // We caught a seek preview seek, do not update the seekbar
        return;
      }

      let playbackPositionPercentage = this.getPlaybackPositionPercentage();

      this.updateBufferLevel(playbackPositionPercentage);

      // The segment request finished is used to help the playback position move, when the smooth playback position is not enabled.
      // At the same time when the user is scrubbing, we also move the position of the seekbar to display a preview during scrubbing.
      // When the user is scrubbing we do not record this as a user seek operation, as the user has yet to finish their seek,
      // but we should not move the playback position to not create a jumping behaviour.
      if (scrubbing && event.type === player.exports.PlayerEvent.SegmentRequestFinished && playbackPositionPercentage !== this.playbackPositionPercentage) {
        playbackPositionPercentage = this.playbackPositionPercentage;
      }

      if (player.isLive()) {
        if (player.getMaxTimeShift() === 0) {
          // This case must be explicitly handled to avoid division by zero
          this.setPlaybackPosition(100);
        } else {
          if (!this.isSeeking()) {
            this.setPlaybackPosition(playbackPositionPercentage);
          }

          this.setAriaSliderMinMax(player.getMaxTimeShift().toString(), '0');
        }
      } else {
        // Update playback position only in paused state or in the initial startup state where player is neither
        // paused nor playing. Playback updates are handled in the Timeout below.
        const isInInitialStartupState = this.config.smoothPlaybackPositionUpdateIntervalMs === SeekBar.SMOOTH_PLAYBACK_POSITION_UPDATE_DISABLED
            || forceUpdate || player.isPaused();
        const isNeitherPausedNorPlaying = player.isPaused() === player.isPlaying();

        if ((isInInitialStartupState || isNeitherPausedNorPlaying) && !this.isSeeking()) {
          this.setPlaybackPosition(playbackPositionPercentage);
        }

        this.setAriaSliderMinMax('0', player.getDuration().toString());
      }

      if (this.isUiShown) {
        this.setAriaSliderValues();
      }
    };

    // Update seekbar upon these events
    // init playback position when the player is ready
    player.on(player.exports.PlayerEvent.Ready, playbackPositionHandler);
    // update playback position when it changes
    player.on(player.exports.PlayerEvent.TimeChanged, playbackPositionHandler);
    // update bufferlevel when buffering is complete
    player.on(player.exports.PlayerEvent.StallEnded, playbackPositionHandler);
    // update playback position when a timeshift has finished
    player.on(player.exports.PlayerEvent.TimeShifted, playbackPositionHandler);
    // update bufferlevel when a segment has been downloaded
    player.on(player.exports.PlayerEvent.SegmentRequestFinished, playbackPositionHandler);

    this.configureLivePausedTimeshiftUpdater(player, uimanager, playbackPositionHandler);

    // Seek handling
    let onPlayerSeek = () => {
      isPlayerSeeking = true;
      this.setSeeking(true);
      scrubbing = false;
    };

    let onPlayerSeeked = (event: PlayerEventBase = null, forceUpdate: boolean = false ) => {
      isPlayerSeeking = false;
      this.setSeeking(false);

      // update playback position when a seek has finished
      playbackPositionHandler(event, forceUpdate);
    };

    let restorePlayingState = function () {
      // Continue playback after seek if player was playing when seek started
      if (isPlaying) {
        // use the same issuer here as in the pause on seek
        player.play('ui-seek');
      }
    };

    player.on(player.exports.PlayerEvent.Seek, onPlayerSeek);
    player.on(player.exports.PlayerEvent.Seeked, onPlayerSeeked);
    player.on(player.exports.PlayerEvent.TimeShift, onPlayerSeek);
    player.on(player.exports.PlayerEvent.TimeShifted, onPlayerSeeked);

    this.onSeek.subscribe((sender) => {
      this.isUserSeeking = true; // track seeking status so we can catch events from seek preview seeks

      // Notify UI manager of started seek
      uimanager.onSeek.dispatch(sender);

      // Save current playback state before performing the seek
      if (!isPlayerSeeking) {
        isPlaying = player.isPlaying();

        // Pause playback while seeking
        if (isPlaying) {
          // use a different issuer here, as play/pause on seek is not "really" triggerd by the user
          player.pause('ui-seek');
        }
      }

    });
    this.onSeekPreview.subscribe((sender: SeekBar, args: SeekPreviewEventArgs) => {
      // Notify UI manager of seek preview
      uimanager.onSeekPreview.dispatch(sender, args);
      scrubbing = args.scrubbing;
    });

    // Set enableSeekPreview if set in the uimanager config
    if (typeof uimanager.getConfig().enableSeekPreview === 'boolean') {
      this.config.enableSeekPreview = uimanager.getConfig().enableSeekPreview;
    }

    // Rate-limited scrubbing seek
    if (this.config.enableSeekPreview) {
      this.onSeekPreview.subscribeRateLimited(this.seekWhileScrubbing, 200);
    }

    this.onSeeked.subscribe((sender, percentage) => {
      this.isUserSeeking = false;

      // Do the seek
      this.seek(percentage);

      // Notify UI manager of finished seek
      uimanager.onSeeked.dispatch(sender);

      // Continue playback after seek if player was playing when seek started
      restorePlayingState();
    });

    if (this.hasLabel()) {
      // Configure a seekbar label that is internal to the seekbar)
      this.getLabel().configure(player, uimanager);
    }

    // Hide seekbar for live sources without timeshift
    let isLive = false;
    let hasTimeShift = false;
    let switchVisibility = (isLive: boolean, hasTimeShift: boolean) => {
      if (isLive && !hasTimeShift) {
        this.hide();
      } else {
        this.show();
      }
      playbackPositionHandler(null, true);
      this.refreshPlaybackPosition();
    };
    let liveStreamDetector = new PlayerUtils.LiveStreamDetector(player, uimanager);
    liveStreamDetector.onLiveChanged.subscribe((sender, args: LiveStreamDetectorEventArgs) => {
      isLive = args.live;
      if (isLive && this.smoothPlaybackPositionUpdater != null) {
        this.smoothPlaybackPositionUpdater.clear();
        this.seekBarType = SeekBarType.Live;
      } else {
        this.seekBarType = SeekBarType.Vod;
      }
      switchVisibility(isLive, hasTimeShift);
    });
    let timeShiftDetector = new PlayerUtils.TimeShiftAvailabilityDetector(player);
    timeShiftDetector.onTimeShiftAvailabilityChanged.subscribe((sender, args: TimeShiftAvailabilityChangedArgs) => {
      hasTimeShift = args.timeShiftAvailable;
      switchVisibility(isLive, hasTimeShift);
    });
    // Initial detection
    liveStreamDetector.detect();
    timeShiftDetector.detect();

    // Refresh the playback position when the player resized or the UI is configured. The playback position marker
    // is positioned absolutely and must therefore be updated when the size of the seekbar changes.
    player.on(player.exports.PlayerEvent.PlayerResized, () => {
      this.refreshPlaybackPosition();
    });
    // Additionally, when this code is called, the seekbar is not part of the UI yet and therefore does not have a size,
    // resulting in a wrong initial position of the marker. Refreshing it once the UI is configured solved this issue.
    uimanager.onConfigured.subscribe(() => {
      this.refreshPlaybackPosition();
    });
    // It can also happen when a new source is loaded
    player.on(player.exports.PlayerEvent.SourceLoaded, () => {
      this.refreshPlaybackPosition();
    });
    // Add markers when a source is loaded or update when a marker is added or removed
    uimanager.getConfig().events.onUpdated.subscribe(() => {
      playbackPositionHandler();
    });

    // Set the snappingRange if set in the uimanager config
    if (typeof uimanager.getConfig().seekbarSnappingRange === 'number') {
      this.config.snappingRange = uimanager.getConfig().seekbarSnappingRange;
    }

    // Initialize seekbar
    playbackPositionHandler(); // Set the playback position
    this.setBufferPosition(0);
    this.setSeekPosition(0);
    if (this.config.smoothPlaybackPositionUpdateIntervalMs !== SeekBar.SMOOTH_PLAYBACK_POSITION_UPDATE_DISABLED) {
      this.configureSmoothPlaybackPositionUpdater(player, uimanager);
    }

    // Initialize markers
    this.initializeTimelineMarkers(player, uimanager);
  }

  private initializeTimelineMarkers(player: PlayerAPI, uimanager: UIInstanceManager): void {
    const timelineMarkerConfig = {
      cssPrefix: this.config.cssPrefix,
      snappingRange: this.config.snappingRange,
    };
    this.timelineMarkersHandler = new TimelineMarkersHandler(timelineMarkerConfig, () => this.seekBar.width(), this.seekBarMarkersContainer);
    this.timelineMarkersHandler.initialize(player, uimanager);
  }

  private seekWhileScrubbing = (sender: SeekBar, args: SeekPreviewEventArgs) => {
    if (args.scrubbing) {
      this.seek(args.position);
    }
  };

  private seek = (percentage: number) => {
    if (this.player.isLive()) {
      const maxTimeShift = this.player.getMaxTimeShift();
      this.player.timeShift(maxTimeShift - (maxTimeShift * (percentage / 100)), 'ui');
    } else {
      const seekableRangeStart = PlayerUtils.getSeekableRangeStart(this.player, 0);
      const relativeSeekTarget = this.player.getDuration() * (percentage / 100);
      const absoluteSeekTarget = relativeSeekTarget + seekableRangeStart;
      this.player.seek(absoluteSeekTarget, 'ui');
    }
  };

  /**
   * Update seekbar while a live stream with DVR window is paused.
   * The playback position stays still and the position indicator visually moves towards the back.
   */
  private configureLivePausedTimeshiftUpdater(
    player: PlayerAPI,
    uimanager: UIInstanceManager,
    playbackPositionHandler: () => void,
  ): void {
    // Regularly update the playback position while the timeout is active
    this.pausedTimeshiftUpdater = new Timeout(1000, playbackPositionHandler, true);

    // Start updater when a live stream with timeshift window is paused
    player.on(player.exports.PlayerEvent.Paused, () => {
      if (player.isLive() && player.getMaxTimeShift() < 0) {
        this.pausedTimeshiftUpdater.start();
      }
    });

    // Stop updater when playback continues (no matter if the updater was started before)
    player.on(player.exports.PlayerEvent.Play, () => this.pausedTimeshiftUpdater.clear());
  }

  private configureSmoothPlaybackPositionUpdater(player: PlayerAPI, uimanager: UIInstanceManager): void {
    /*
     * Playback position update
     *
     * We do not update the position directly from the TimeChanged event, because it arrives very jittery and
     * results in a jittery position indicator since the CSS transition time is statically set.
     * To work around this issue, we maintain a local playback position that is updated in a stable regular interval
     * and kept in sync with the player.
     */
    let currentTimeSeekBar = 0;
    let currentTimePlayer = 0;
    let updateIntervalMs = 50;
    let currentTimeUpdateDeltaSecs = updateIntervalMs / 1000;

    this.smoothPlaybackPositionUpdater = new Timeout(updateIntervalMs, () => {
      if (this.isSeeking()) {
        return;
      }

      currentTimeSeekBar += currentTimeUpdateDeltaSecs;

      try {
        currentTimePlayer = this.getRelativeCurrentTime();
      } catch (error) {
        // Detect if the player has been destroyed and stop updating if so
        if (error instanceof player.exports.PlayerAPINotAvailableError) {
          this.smoothPlaybackPositionUpdater.clear();
        }

        // If the current time cannot be read it makes no sense to continue
        return;
      }

      // Sync currentTime of seekbar to player
      let currentTimeDelta = currentTimeSeekBar - currentTimePlayer;
      // If the delta is larger that 2 secs, directly jump the seekbar to the
      // player time instead of smoothly fast forwarding/rewinding.
      if (Math.abs(currentTimeDelta) > 2) {
        currentTimeSeekBar = currentTimePlayer;
      }
      // If currentTimeDelta is negative and below the adjustment threshold,
      // the player is ahead of the seekbar and we 'fast forward' the seekbar
      else if (currentTimeDelta <= -currentTimeUpdateDeltaSecs) {
        currentTimeSeekBar += currentTimeUpdateDeltaSecs;
      }
      // If currentTimeDelta is positive and above the adjustment threshold,
      // the player is behind the seekbar and we 'rewind' the seekbar
      else if (currentTimeDelta >= currentTimeUpdateDeltaSecs) {
        currentTimeSeekBar -= currentTimeUpdateDeltaSecs;
      }

      let playbackPositionPercentage = 100 / player.getDuration() * currentTimeSeekBar;
      this.setPlaybackPosition(playbackPositionPercentage);
    }, true);

    let startSmoothPlaybackPositionUpdater = () => {
      if (!player.isLive()) {
        currentTimeSeekBar = this.getRelativeCurrentTime();
        this.smoothPlaybackPositionUpdater.start();
      }
    };

    let stopSmoothPlaybackPositionUpdater = () => {
      this.smoothPlaybackPositionUpdater.clear();
    };

    player.on(player.exports.PlayerEvent.Play, startSmoothPlaybackPositionUpdater);
    player.on(player.exports.PlayerEvent.Playing, startSmoothPlaybackPositionUpdater);
    player.on(player.exports.PlayerEvent.Paused, stopSmoothPlaybackPositionUpdater);
    player.on(player.exports.PlayerEvent.PlaybackFinished, stopSmoothPlaybackPositionUpdater);
    player.on(player.exports.PlayerEvent.Seeked, () => {
      currentTimeSeekBar = this.getRelativeCurrentTime();
    });
    player.on(player.exports.PlayerEvent.SourceUnloaded, stopSmoothPlaybackPositionUpdater);

    if (player.isPlaying()) {
      startSmoothPlaybackPositionUpdater();
    }
  }

  private getRelativeCurrentTime(): number {
    return PlayerUtils.getCurrentTimeRelativeToSeekableRange(this.player);
  }

  release(): void {
    super.release();

    if (this.smoothPlaybackPositionUpdater) { // object must not necessarily exist, e.g. in volume slider subclass
      this.smoothPlaybackPositionUpdater.clear();
    }

    if (this.pausedTimeshiftUpdater) {
      this.pausedTimeshiftUpdater.clear();
    }

    if (this.config.enableSeekPreview) {
      this.onSeekPreview.unsubscribe(this.seekWhileScrubbing);
    }
  }

  protected toDomElement(): DOM {
    if (this.config.vertical) {
      this.config.cssClasses.push('vertical');
    }

    let seekBarContainer = new DOM('div', {
      'id': this.config.id,
      'class': this.getCssClasses(),
      'role': 'slider',
      'aria-label': i18n.performLocalization(this.config.ariaLabel),
      'tabindex': this.config.tabIndex.toString(),
    });

    let seekBar = new DOM('div', {
      'class': this.prefixCss('seekbar'),
    });
    this.seekBar = seekBar;

    // Indicator that shows the buffer fill level
    let seekBarBufferLevel = new DOM('div', {
      'class': this.prefixCss('seekbar-bufferlevel'),
    });
    this.seekBarBufferPosition = seekBarBufferLevel;

    // Indicator that shows the current playback position
    let seekBarPlaybackPosition = new DOM('div', {
      'class': this.prefixCss('seekbar-playbackposition'),
    });
    this.seekBarPlaybackPosition = seekBarPlaybackPosition;

    // A marker of the current playback position, e.g. a dot or line
    let seekBarPlaybackPositionMarker = new DOM('div', {
      'class': this.prefixCss('seekbar-playbackposition-marker'),
    });
    this.seekBarPlaybackPositionMarker = seekBarPlaybackPositionMarker;

    // Indicator that show where a seek will go to
    let seekBarSeekPosition = new DOM('div', {
      'class': this.prefixCss('seekbar-seekposition'),
    });
    this.seekBarSeekPosition = seekBarSeekPosition;

    // Indicator that shows the full seekbar
    let seekBarBackdrop = new DOM('div', {
      'class': this.prefixCss('seekbar-backdrop'),
    });
    this.seekBarBackdrop = seekBarBackdrop;

    let seekBarChapterMarkersContainer = new DOM('div', {
      'class': this.prefixCss('seekbar-markers'),
    });
    this.seekBarMarkersContainer = seekBarChapterMarkersContainer;

    seekBar.append(this.seekBarBackdrop, this.seekBarBufferPosition, this.seekBarSeekPosition,
      this.seekBarPlaybackPosition, this.seekBarMarkersContainer, this.seekBarPlaybackPositionMarker);

    let seeking = false;

    // Define handler functions so we can attach/remove them later
    let mouseTouchMoveHandler = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      // Avoid propagation to VR handler
      if (this.player.vr != null) {
        e.stopPropagation();
      }

      let targetPercentage = 100 * this.getOffset(e);
      this.setSeekPosition(targetPercentage);
      this.setPlaybackPosition(targetPercentage);
      this.onSeekPreviewEvent(targetPercentage, true);
    };

    let mouseTouchUpHandler = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();

      // Remove handlers, seek operation is finished
      new DOM(document).off('touchmove mousemove', mouseTouchMoveHandler);
      new DOM(document).off('touchend mouseup', mouseTouchUpHandler);

      let targetPercentage = 100 * this.getOffset(e);
      let snappedChapter = this.timelineMarkersHandler && this.timelineMarkersHandler.getMarkerAtPosition(targetPercentage);

      this.setSeeking(false);
      seeking = false;

      // Fire seeked event
      this.onSeekedEvent(snappedChapter ? snappedChapter.position : targetPercentage);
    };

    // A seek always start with a touchstart or mousedown directly on the seekbar.
    // To track a mouse seek also outside the seekbar (for touch events this works automatically),
    // so the user does not need to take care that the mouse always stays on the seekbar, we attach the mousemove
    // and mouseup handlers to the whole document. A seek is triggered when the user lifts the mouse key.
    // A seek mouse gesture is thus basically a click with a long time frame between down and up events.
    seekBar.on('touchstart mousedown', (e: MouseEvent | TouchEvent) => {
      let isTouchEvent = BrowserUtils.isTouchSupported && this.isTouchEvent(e);

      // Prevent selection of DOM elements (also prevents mousedown if current event is touchstart)
      e.preventDefault();
      // Avoid propagation to VR handler
      if (this.player.vr != null) {
        e.stopPropagation();
      }

      this.setSeeking(true); // Set seeking class on DOM element
      seeking = true; // Set seek tracking flag

      // Fire seeked event
      this.onSeekEvent();

      // Add handler to track the seek operation over the whole document
      new DOM(document).on(isTouchEvent ? 'touchmove' : 'mousemove', mouseTouchMoveHandler);
      new DOM(document).on(isTouchEvent ? 'touchend' : 'mouseup', mouseTouchUpHandler);
    });

    // Display seek target indicator when mouse hovers or finger slides over seekbar
    seekBar.on('touchmove mousemove', (e: MouseEvent | TouchEvent) => {
      e.preventDefault();

      if (seeking) {
        mouseTouchMoveHandler(e);
      }

      let position = 100 * this.getOffset(e);
      this.setSeekPosition(position);

      this.onSeekPreviewEvent(position, false);

      if (this.hasLabel() && this.getLabel().isHidden()) {
        this.getLabel().show();
      }
    });

    // Hide seek target indicator when mouse or finger leaves seekbar
    seekBar.on('touchend mouseleave', (e: MouseEvent | TouchEvent) => {
      e.preventDefault();

      this.setSeekPosition(0);

      if (this.hasLabel()) {
        this.getLabel().hide();
      }
    });

    seekBarContainer.append(seekBar);

    if (this.label) {
      seekBarContainer.append(this.label.getDomElement());
    }

    return seekBarContainer;
  }

  /**
   * Gets the horizontal offset of a mouse/touch event point from the left edge of the seek bar.
   * @param eventPageX the pageX coordinate of an event to calculate the offset from
   * @returns {number} a number in the range of [0, 1], where 0 is the left edge and 1 is the right edge
   */
  private getHorizontalOffset(eventPageX: number): number {
    let elementOffsetPx = this.seekBar.offset().left;
    let widthPx = this.seekBar.width();
    let offsetPx = eventPageX - elementOffsetPx;
    let offset = 1 / widthPx * offsetPx;

    return this.sanitizeOffset(offset);
  }

  /**
   * Gets the vertical offset of a mouse/touch event point from the bottom edge of the seek bar.
   * @param eventPageY the pageX coordinate of an event to calculate the offset from
   * @returns {number} a number in the range of [0, 1], where 0 is the bottom edge and 1 is the top edge
   */
  private getVerticalOffset(eventPageY: number): number {
    let elementOffsetPx = this.seekBar.offset().top;
    let widthPx = this.seekBar.height();
    let offsetPx = eventPageY - elementOffsetPx;
    let offset = 1 / widthPx * offsetPx;

    return 1 - this.sanitizeOffset(offset);
  }

  /**
   * Gets the mouse or touch event offset for the current configuration (horizontal or vertical).
   * @param e the event to calculate the offset from
   * @returns {number} a number in the range of [0, 1]
   * @see #getHorizontalOffset
   * @see #getVerticalOffset
   */
  private getOffset(e: MouseEvent | TouchEvent): number {
    if (BrowserUtils.isTouchSupported && this.isTouchEvent(e)) {
      if (this.config.vertical) {
        return this.getVerticalOffset(e.type === 'touchend' ? e.changedTouches[0].pageY : e.touches[0].pageY);
      } else {
        return this.getHorizontalOffset(e.type === 'touchend' ? e.changedTouches[0].pageX : e.touches[0].pageX);
      }
    }
    else if (e instanceof MouseEvent) {
      if (this.config.vertical) {
        return this.getVerticalOffset(e.pageY);
      } else {
        return this.getHorizontalOffset(e.pageX);
      }
    }
    else {
      if (console) {
        console.warn('invalid event');
      }
      return 0;
    }
  }

  /**
   * Sanitizes the mouse offset to the range of [0, 1].
   *
   * When tracking the mouse outside the seek bar, the offset can be outside the desired range and this method
   * limits it to the desired range. E.g. a mouse event left of the left edge of a seek bar yields an offset below
   * zero, but to display the seek target on the seek bar, we need to limit it to zero.
   *
   * @param offset the offset to sanitize
   * @returns {number} the sanitized offset.
   */
  private sanitizeOffset(offset: number) {
    // Since we track mouse moves over the whole document, the target can be outside the seek range,
    // and we need to limit it to the [0, 1] range.
    if (offset < 0) {
      offset = 0;
    } else if (offset > 1) {
      offset = 1;
    }

    return offset;
  }

  /**
   * Sets the position of the playback position indicator.
   * @param percent a number between 0 and 100 as returned by the player
   */
  setPlaybackPosition(percent: number) {
    this.playbackPositionPercentage = percent;

    // Set position of the bar
    this.setPosition(this.seekBarPlaybackPosition, percent);

    // Set position of the marker
    let totalSize = (this.config.vertical ? (this.seekBar.height() - this.seekBarPlaybackPositionMarker.height()) : this.seekBar.width());
    let px = (totalSize) / 100 * percent;
    if (this.config.vertical) {
      px = this.seekBar.height() - px - this.seekBarPlaybackPositionMarker.height();
    }

    let style = this.config.vertical ?
      // -ms-transform required for IE9
      // -webkit-transform required for Android 4.4 WebView
      {
        'transform': 'translateY(' + px + 'px)',
        '-ms-transform': 'translateY(' + px + 'px)',
        '-webkit-transform': 'translateY(' + px + 'px)',
      } :
      {
        'transform': 'translateX(' + px + 'px)',
        '-ms-transform': 'translateX(' + px + 'px)',
        '-webkit-transform': 'translateX(' + px + 'px)',
      };
    this.seekBarPlaybackPositionMarker.css(style);
  }

  /**
   * Refreshes the playback position. Can be used by subclasses to refresh the position when
   * the size of the component changes.
   */
  protected refreshPlaybackPosition() {
    this.setPlaybackPosition(this.playbackPositionPercentage);
  }

  /**
   * Sets the position until which media is buffered.
   * @param percent a number between 0 and 100
   */
  setBufferPosition(percent: number) {
    this.setPosition(this.seekBarBufferPosition, percent);
  }

  /**
   * Sets the position where a seek, if executed, would jump to.
   * @param percent a number between 0 and 100
   */
  setSeekPosition(percent: number) {
    this.setPosition(this.seekBarSeekPosition, percent);
  }

  /**
   * Set the actual position (width or height) of a DOM element that represent a bar in the seek bar.
   * @param element the element to set the position for
   * @param percent a number between 0 and 100
   */
  private setPosition(element: DOM, percent: number) {
    let scale = percent / 100;

    // When the scale is exactly 1 or very near 1 (and the browser internally rounds it to 1), browsers seem to render
    // the elements differently and the height gets slightly off, leading to mismatching heights when e.g. the buffer
    // level bar has a width of 1 and the playback position bar has a width < 1. A jittering buffer level around 1
    // leads to an even worse flickering effect.
    // Various changes in CSS styling and DOM hierarchy did not solve the issue so the workaround is to avoid a scale
    // of exactly 1.
    if (scale >= 0.99999 && scale <= 1.00001) {
      scale = 0.99999;
    }

    let style = this.config.vertical ?
      // -ms-transform required for IE9
      // -webkit-transform required for Android 4.4 WebView
      {
        'transform': 'scaleY(' + scale + ')',
        '-ms-transform': 'scaleY(' + scale + ')',
        '-webkit-transform': 'scaleY(' + scale + ')',
      } :
      {
        'transform': 'scaleX(' + scale + ')',
        '-ms-transform': 'scaleX(' + scale + ')',
        '-webkit-transform': 'scaleX(' + scale + ')',
      };
    element.css(style);
  }

  /**
   * Puts the seek bar into or out of seeking state by adding/removing a class to the DOM element. This can be used
   * to adjust the styling while seeking.
   *
   * @param seeking should be true when entering seek state, false when exiting the seek state
   */
  setSeeking(seeking: boolean) {
    if (seeking) {
      this.getDomElement().addClass(this.prefixCss(SeekBar.CLASS_SEEKING));
    } else {
      this.getDomElement().removeClass(this.prefixCss(SeekBar.CLASS_SEEKING));
    }
  }

  /**
   * Checks if the seek bar is currently in the seek state.
   * @returns {boolean} true if in seek state, else false
   */
  isSeeking(): boolean {
    return this.getDomElement().hasClass(this.prefixCss(SeekBar.CLASS_SEEKING));
  }

  /**
   * Checks if the seek bar has a {@link SeekBarLabel}.
   * @returns {boolean} true if the seek bar has a label, else false
   */
  hasLabel(): boolean {
    return this.label != null;
  }

  /**
   * Gets the label of this seek bar.
   * @returns {SeekBarLabel} the label if this seek bar has a label, else null
   */
  getLabel(): SeekBarLabel | null {
    return this.label;
  }

  protected onSeekEvent() {
    this.seekBarEvents.onSeek.dispatch(this);
  }

  protected onSeekPreviewEvent(percentage: number, scrubbing: boolean) {
    let snappedMarker = this.timelineMarkersHandler && this.timelineMarkersHandler.getMarkerAtPosition(percentage);

    let seekPositionPercentage = percentage;

    if (snappedMarker) {
      if (snappedMarker.duration > 0) {
        if (percentage < snappedMarker.position) {
          // Snap the position to the start of the interval if the seek is within the left snap margin
          // We know that we are within a snap margin when we are outside the marker interval but still
          // have a snappedMarker
          seekPositionPercentage = snappedMarker.position;
        } else if (percentage > snappedMarker.position + snappedMarker.duration) {
          // Snap the position to the end of the interval if the seek is within the right snap margin
          seekPositionPercentage = snappedMarker.position + snappedMarker.duration;
        }
      } else {
        // Position markers always snap to their marker position
        seekPositionPercentage = snappedMarker.position;
      }
    }

    if (this.label) {
      this.label.getDomElement().css({
        'left': seekPositionPercentage + '%',
      });
    }

    this.seekBarEvents.onSeekPreview.dispatch(this, {
      scrubbing: scrubbing,
      position: seekPositionPercentage,
      marker: snappedMarker,
    });
  }

  protected onSeekedEvent(percentage: number) {
    this.seekBarEvents.onSeeked.dispatch(this, percentage);
  }

  /**
   * Gets the event that is fired when a scrubbing seek operation is started.
   * @returns {Event<SeekBar, NoArgs>}
   */
  get onSeek(): Event<SeekBar, NoArgs> {
    return this.seekBarEvents.onSeek.getEvent();
  }

  /**
   * Gets the event that is fired during a scrubbing seek (to indicate that the seek preview, i.e. the video frame,
   * should be updated), or during a normal seek preview when the seek bar is hovered (and the seek target,
   * i.e. the seek bar label, should be updated).
   * @returns {Event<SeekBar, SeekPreviewEventArgs>}
   */
  get onSeekPreview(): Event<SeekBar, SeekPreviewEventArgs> {
    return this.seekBarEvents.onSeekPreview.getEvent();
  }

  /**
   * Gets the event that is fired when a scrubbing seek has finished or when a direct seek is issued.
   * @returns {Event<SeekBar, number>}
   */
  get onSeeked(): Event<SeekBar, number> {
    return this.seekBarEvents.onSeeked.getEvent();
  }


  protected onShowEvent(): void {
    super.onShowEvent();

    // Refresh the position of the playback position when the seek bar becomes visible. To correctly set the position,
    // the DOM element must be fully initialized an have its size calculated, because the position is set as an absolute
    // value calculated from the size. This required size is not known when it is hidden.
    // For such cases, we refresh the position here in onShow because here it is guaranteed that the component knows
    // its size and can set the position correctly.
    this.refreshPlaybackPosition();
  }

 /**
   * Checks if TouchEvent is supported.
   * @returns {boolean} true if TouchEvent not undefined, else false
   */
  isTouchEvent(e: UIEvent): e is TouchEvent {
    return window.TouchEvent && e instanceof TouchEvent;
  }
}
