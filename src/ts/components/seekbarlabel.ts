import {Container, ContainerConfig} from './container';
import {Label, LabelConfig} from './label';
import {Component, ComponentConfig} from './component';
import {UIInstanceManager, SeekPreviewArgs} from '../uimanager';
import {StringUtils} from '../utils';

/**
 * Configuration interface for a {@link SeekBarLabel}.
 */
export interface SeekBarLabelConfig extends ContainerConfig {
  // nothing yet
}

/**
 * A label for a {@link SeekBar} that can display the seek target time and a thumbnail.
 */
export class SeekBarLabel extends Container<SeekBarLabelConfig> {

  private timeLabel: Label<LabelConfig>;
  private titleLabel: Label<LabelConfig>;
  private thumbnail: Component<ComponentConfig>;

  private timeFormat: string;

  constructor(config: SeekBarLabelConfig = {}) {
    super(config);

    this.timeLabel = new Label({ cssClasses: ['seekbar-label-time'] });
    this.titleLabel = new Label({ cssClasses: ['seekbar-label-title'] });
    this.thumbnail = new Component({ cssClasses: ['seekbar-thumbnail'] });

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-seekbar-label',
      components: [new Container({
        components: [
          this.thumbnail,
          new Container({
            components: [this.titleLabel, this.timeLabel],
            cssClass: 'seekbar-label-metadata',
          })],
        cssClass: 'seekbar-label-inner',
      })],
      hidden: true
    }, this.config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let self = this;

    uimanager.onSeekPreview.subscribe(function(sender, args: SeekPreviewArgs) {
      if (player.isLive()) {
        let time = player.getMaxTimeShift() - player.getMaxTimeShift() * (args.position / 100);
        self.setTime(time);
      } else {
        let time = 0;
        if (args.marker) {
          time = args.marker.time;
          self.setTitleText(args.marker.title);
        } else {
          time = args.position;
          self.setTitleText(null);
        }
        self.setTime(player.getDuration() * (time / 100));
        self.setThumbnail(player.getThumb(time));
      }
    });

    let init = function() {
      // Set time format depending on source duration
      self.timeFormat = Math.abs(player.isLive() ? player.getMaxTimeShift() : player.getDuration()) > 3600 * 60 ?
        StringUtils.FORMAT_HHMMSS : StringUtils.FORMAT_MMSS;
    };

    player.addEventHandler(bitmovin.player.EVENT.ON_READY, init);
    init();
  }

  /**
   * Sets arbitrary text on the label.
   * @param text the text to show on the label
   */
  setText(text: string) {
    this.timeLabel.setText(text);
  }

  /**
   * Sets a time to be displayed on the label.
   * @param seconds the time in seconds to display on the label
   */
  setTime(seconds: number) {
    this.setText(StringUtils.secondsToTime(seconds, this.timeFormat));
  }

  /**
   * Sets the text on the title label.
   * @param text the text to show on the label
   */
  setTitleText(text: string) {
    this.titleLabel.setText(text);
  }

  /**
   * Sets or removes a thumbnail on the label.
   * @param thumbnail the thumbnail to display on the label or null to remove a displayed thumbnail
   */
  setThumbnail(thumbnail: bitmovin.player.Thumbnail = null) {
    let thumbnailElement = this.thumbnail.getDomElement();

    if (thumbnail == null) {
      thumbnailElement.css({
        'background-image': null,
        'display': null,
        'width': null,
        'height': null
      });
    }
    else {
      thumbnailElement.css({
        'display': 'inherit',
        'background-image': `url(${thumbnail.url})`,
        'width': thumbnail.w + 'px',
        'height': thumbnail.h + 'px',
        'background-position': `-${thumbnail.x}px -${thumbnail.y}px`
      });
    }
  }
}