import {ToggleButton, ToggleButtonConfig} from './togglebutton';
import {UIInstanceManager} from '../uimanager';
import PlayerEvent = bitmovin.PlayerAPI.PlayerEvent;
import {PlayerUtils} from '../playerutils';
import TimeShiftAvailabilityChangedArgs = PlayerUtils.TimeShiftAvailabilityChangedArgs;
import WarningEvent = bitmovin.PlayerAPI.WarningEvent;

/**
 * A button that toggles between playback and pause.
 */
export class PlaybackToggleButton extends ToggleButton<ToggleButtonConfig> {

  private static readonly CLASS_STOPTOGGLE = 'stoptoggle';
  protected isPlayInitiated: boolean;

  constructor(config: ToggleButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-playbacktogglebutton',
      text: 'Play/Pause',
    }, this.config);

    this.isPlayInitiated = false;
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

      if (player.isPlaying() || this.isPlayInitiated) {
        this.on();
      } else {
        this.off();
      }
    };

    // Call handler upon these events
    player.addEventHandler(player.EVENT.ON_PLAY, (e) => {
      this.isPlayInitiated = true;
      playbackStateHandler(e);
    });

    player.addEventHandler(player.EVENT.ON_PAUSED, (e) => {
      this.isPlayInitiated = false;
      playbackStateHandler(e);
    });

    if (player.EVENT.ON_PLAYING) {
      // Since player 7.3
      player.addEventHandler(player.EVENT.ON_PLAYING, (e) => {
        this.isPlayInitiated = false;
        playbackStateHandler(e);
      });
    }
    // after unloading + loading a new source, the player might be in a different playing state (from playing into stopped)
    player.addEventHandler(player.EVENT.ON_SOURCE_LOADED, playbackStateHandler);
    player.addEventHandler(player.EVENT.ON_SOURCE_UNLOADED, playbackStateHandler);
    // when playback finishes, player turns to paused mode
    player.addEventHandler(player.EVENT.ON_PLAYBACK_FINISHED, playbackStateHandler);
    player.addEventHandler(player.EVENT.ON_CAST_STARTED, playbackStateHandler);
    player.addEventHandler(player.EVENT.ON_CAST_PLAYING, playbackStateHandler);
    player.addEventHandler(player.EVENT.ON_CAST_PAUSED, playbackStateHandler);
    player.addEventHandler(player.EVENT.ON_CAST_PLAYBACK_FINISHED, playbackStateHandler);

    // When a playback attempt is rejected with warning 5008, we switch the button state back to off
    // This is required for blocked autoplay, because there is no ON_PAUSED event in such case
    player.addEventHandler(player.EVENT.ON_WARNING, (event: WarningEvent) => {
      if (event.code === 5008) {
        this.isPlayInitiated = false;
        this.off();
      }
    });

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
        if (player.isPlaying() || this.isPlayInitiated) {
          player.pause('ui');
        } else {
          player.play('ui');
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
