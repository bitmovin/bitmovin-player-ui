import {ToggleButton, ToggleButtonConfig} from './togglebutton';
import {UIInstanceManager} from '../uimanager';
import PlayerEvent = bitmovin.PlayerAPI.PlayerEvent;
import {PlayerUtils} from '../utils';
import TimeShiftAvailabilityChangedArgs = PlayerUtils.TimeShiftAvailabilityChangedArgs;
import WarningEvent = bitmovin.PlayerAPI.WarningEvent;

/**
 * A button that toggles between playback and pause.
 */
export class PlaybackToggleButton extends ToggleButton<ToggleButtonConfig> {

  private static readonly CLASS_STOPTOGGLE = 'stoptoggle';

  constructor(config: ToggleButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-playbacktogglebutton',
      text: 'Play/Pause',
    }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager, handleClickEvent: boolean = true): void {
    super.configure(player, uimanager);

    let isSeeking = false;

    // Handler to update button state based on player state
    let playbackStateHandler = (event: PlayerEvent) => {
      // If the UI is currently seeking, playback is temporarily stopped but the buttons should
      // not reflect that and stay as-is (e.g indicate playback while seeking).
      if (isSeeking) {
        return;
      }

      // always hide the button on the onPlay Event as the user should get feedback on the press of the play button
      if (player.isPlaying() || (event && event.type === player.EVENT.ON_PLAY)) {
        this.on();
      } else {
        this.off();
      }
    };

    let playbackWarningHandler = (event: WarningEvent) => {
      if (event && event.code === 5008) {
        // Warnings[5008] === 'Playback could not be started, user interaction required'
        // if playback did not start although the buffer was full pause the video (might not have any effect) and display
        // the play button again as the most probable explanation is disabled autoplay on mobile devices
        player.pause();
        this.off();
      }
    };

    // Call handler upon these events
    player.addEventHandler(player.EVENT.ON_PLAY, playbackStateHandler);
    player.addEventHandler(player.EVENT.ON_PLAYING, playbackStateHandler);
    player.addEventHandler(player.EVENT.ON_PAUSED, playbackStateHandler);

    player.addEventHandler(player.EVENT.ON_WARNING, playbackWarningHandler);

    // when playback finishes, player turns to paused mode
    player.addEventHandler(player.EVENT.ON_PLAYBACK_FINISHED, playbackStateHandler);
    player.addEventHandler(player.EVENT.ON_CAST_STARTED, playbackStateHandler);
    player.addEventHandler(player.EVENT.ON_CAST_PLAYING, playbackStateHandler);
    player.addEventHandler(player.EVENT.ON_CAST_PAUSED, playbackStateHandler);
    player.addEventHandler(player.EVENT.ON_CAST_PLAYBACK_FINISHED, playbackStateHandler);

    // Detect absence of timeshifting on live streams and add tagging class to convert button icons to play/stop
    let timeShiftDetector = new PlayerUtils.TimeShiftAvailabilityDetector(player);
    timeShiftDetector.onTimeShiftAvailabilityChanged.subscribe(
      (sender, args: TimeShiftAvailabilityChangedArgs) => {
        if (!args.timeShiftAvailable) {
          this.getDomElement().addClass(this.prefixCss(PlaybackToggleButton.CLASS_STOPTOGGLE));
        } else {
          this.getDomElement().removeClass(this.prefixCss(PlaybackToggleButton.CLASS_STOPTOGGLE));
        }
      }
    );
    timeShiftDetector.detect(); // Initial detection

    if (handleClickEvent) {
      // Control player by button events
      // When a button event triggers a player API call, events are fired which in turn call the event handler
      // above that updated the button state.
      this.onClick.subscribe(() => {
        if (player.isPlaying()) {
          player.pause('ui-button');
        } else {
          player.play('ui-button');
        }
      });
    }

    // Track UI seeking status
    uimanager.onSeek.subscribe(() => {
      isSeeking = true;
    });
    uimanager.onSeeked.subscribe(() => {
      isSeeking = false;
    });

    // Startup init
    playbackStateHandler(null);
  }
}