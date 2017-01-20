import {ToggleButton, ToggleButtonConfig} from './togglebutton';
import {UIInstanceManager} from '../uimanager';
import PlayerEvent = bitmovin.player.PlayerEvent;

/**
 * A button that toggles between playback and pause.
 */
export class PlaybackToggleButton extends ToggleButton<ToggleButtonConfig> {

  constructor(config: ToggleButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-playbacktogglebutton',
      text: 'Play/Pause'
    }, this.config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager, handleClickEvent: boolean = true): void {
    super.configure(player, uimanager);

    let self = this;
    let isSeeking = false;

    // Handler to update button state based on player state
    let playbackStateHandler = function(event: PlayerEvent) {
      // If the UI is currently seeking, playback is temporarily stopped but the buttons should
      // not reflect that and stay as-is (e.g indicate playback while seeking).
      if (isSeeking) {
        return;
      }

      if (player.isPlaying()) {
        self.on();
      } else {
        self.off();
      }
    };

    // Call handler upon these events
    player.addEventHandler(bitmovin.player.EVENT.ON_PLAY, playbackStateHandler);
    player.addEventHandler(bitmovin.player.EVENT.ON_PAUSED, playbackStateHandler);
    // when playback finishes, player turns to paused mode
    player.addEventHandler(bitmovin.player.EVENT.ON_PLAYBACK_FINISHED, playbackStateHandler);
    player.addEventHandler(bitmovin.player.EVENT.ON_CAST_STARTED, playbackStateHandler);
    player.addEventHandler(bitmovin.player.EVENT.ON_CAST_PLAYING, playbackStateHandler);
    player.addEventHandler(bitmovin.player.EVENT.ON_CAST_PAUSED, playbackStateHandler);
    player.addEventHandler(bitmovin.player.EVENT.ON_CAST_PLAYBACK_FINISHED, playbackStateHandler);

    if (handleClickEvent) {
      // Control player by button events
      // When a button event triggers a player API call, events are fired which in turn call the event handler
      // above that updated the button state.
      self.onClick.subscribe(function() {
        if (player.isPlaying()) {
          player.pause('ui-button');
        } else {
          player.play('ui-button');
        }
      });
    }

    // Track UI seeking status
    uimanager.onSeek.subscribe(function() {
      isSeeking = true;
    });
    uimanager.onSeeked.subscribe(function() {
      isSeeking = false;
    });

    // Startup init
    playbackStateHandler(null);
  }
}