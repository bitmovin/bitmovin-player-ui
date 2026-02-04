import { Container, ContainerConfig } from '../Container';
import { Label, LabelConfig } from '../labels/Label';
import { Component, ComponentConfig } from '../Component';
import { UIInstanceManager } from '../../UIManager';
import { StringUtils } from '../../utils/StringUtils';
import { ImageLoader } from '../../utils/ImageLoader';
import { CssProperties } from '../../DOM';
import { PlayerAPI, PlayerEvent, Thumbnail } from 'bitmovin-player';
import { SeekBar, SeekPreviewEventArgs } from './SeekBar';
import { PlayerUtils } from '../../utils/PlayerUtils';

/**
 * Configuration interface for a {@link SeekBarLabel}.
 *
 * @category Configs
 */
export interface SeekBarLabelConfig extends ContainerConfig {
  // nothing yet
}

/**
 * A label for a {@link SeekBar} that can display the seek target time, a thumbnail, and title (e.g. chapter title).
 *
 * @category Components
 */
export class SeekBarLabel extends Container<SeekBarLabelConfig> {
  private timeLabel: Label<LabelConfig>;
  private titleLabel: Label<LabelConfig>;
  private thumbnail: Component<ComponentConfig>;

  private thumbnailImageLoader: ImageLoader;

  private timeFormat: string;

  private appliedMarkerCssClasses: string[] = [];
  private player: PlayerAPI;
  private uiManager: UIInstanceManager;
  private readonly container: Container<ContainerConfig>;

  constructor(config: SeekBarLabelConfig = {}) {
    super(config);

    this.timeLabel = new Label({ cssClasses: ['seekbar-label-metadata', 'seekbar-label-time'] });
    this.titleLabel = new Label({ cssClasses: ['seekbar-label-metadata', 'seekbar-label-title'] });
    this.thumbnail = new Component({ cssClasses: ['seekbar-thumbnail'], role: 'img' });
    this.thumbnailImageLoader = new ImageLoader();

    this.container = new Container({
      components: [this.titleLabel, this.thumbnail, this.timeLabel],
      cssClass: 'seekbar-label-inner',
    });

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-seekbar-label',
        components: [this.container],
        hidden: true,
      },
      this.config,
    );
  }

  private init = () => {
    // Set time format depending on source duration
    const player = this.player;
    if (player == null) {
      return;
    }
    this.timeFormat =
      Math.abs(player.isLive() ? player.getMaxTimeShift() : player.getDuration()) >= 3600
        ? StringUtils.FORMAT_HHMMSS
        : StringUtils.FORMAT_MMSS;
    // Set initial state of title and thumbnail to handle sourceLoaded when switching to a live-stream
    this.setTitleText(null);
    this.setThumbnail(null);
  };

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.player = player;
    this.uiManager = uimanager;
    uimanager.onSeekPreview.subscribeRateLimited(this.handleSeekPreview, 100);

    uimanager.getConfig().events.onUpdated.subscribe(this.init);
    player.on(PlayerEvent.DurationChanged, this.init);
    this.init();
  }

  private handleSeekPreview = (sender: SeekBar, args: SeekPreviewEventArgs) => {
    if (this.player.isLive()) {
      const maxTimeShift = this.player.getMaxTimeShift();
      const timeShiftPreview = maxTimeShift - maxTimeShift * (args.position / 100);

      this.setTime(timeShiftPreview);

      // In case of a live stream the player expects the time passed into the getThumbnail as a wallClockTime and not
      // as a relative timeShift value.
      const convertTimeShiftPreviewToWallClockTime = (targetTimeShift: number): number => {
        const currentTimeShift = this.player.getTimeShift();
        const currentTime = this.player.getCurrentTime();

        const wallClockTimeOfLiveEdge = currentTime - currentTimeShift;
        return wallClockTimeOfLiveEdge + targetTimeShift;
      };

      const wallClockTime = convertTimeShiftPreviewToWallClockTime(timeShiftPreview);
      this.setThumbnail(this.player.getThumbnail(wallClockTime));
    } else {
      const time = this.player.getDuration() * (args.position / 100);
      this.setTime(time);

      const seekableRangeStart = PlayerUtils.getSeekableRangeStart(this.player, 0);
      const absoluteSeekTarget = time + seekableRangeStart;
      this.setThumbnail(this.player.getThumbnail(absoluteSeekTarget));
    }

    if (args.marker) {
      this.setTitleText(args.marker.marker.title);
    } else {
      this.setTitleText(null);
    }

    // Remove CSS classes from previous marker
    if (this.appliedMarkerCssClasses.length > 0) {
      this.getDomElement().removeClass(this.appliedMarkerCssClasses.join(' '));
      this.appliedMarkerCssClasses = [];
    }

    // Add CSS classes of current marker
    if (args.marker) {
      const cssClasses = (args.marker.marker.cssClasses || []).map(cssClass => this.prefixCss(cssClass));
      this.getDomElement().addClass(cssClasses.join(' '));
      this.appliedMarkerCssClasses = cssClasses;
    }
  };

  public setPositionInBounds(seekPositionPx: number, bounds: DOMRect) {
    this.getDomElement().css('left', seekPositionPx + 'px');

    // Check parent container as it has a padding that needs to be considered
    const labelBounding = this.container.getDomElement().get(0).parentElement.getBoundingClientRect();

    let preventOverflowOffset = 0;
    if (labelBounding.right > bounds.right) {
      preventOverflowOffset = labelBounding.right - bounds.right;
    } else if (labelBounding.left < bounds.left) {
      preventOverflowOffset = labelBounding.left - bounds.left;
    }

    if (preventOverflowOffset !== 0) {
      this.getDomElement().css('left', seekPositionPx - preventOverflowOffset + 'px');
    }
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
  setTitleText(text?: string) {
    this.titleLabel.setText(text);

    if (text == null) {
      this.titleLabel.hide();
    } else {
      this.titleLabel.show();
    }
  }

  /**
   * Sets or removes a thumbnail on the label.
   * @param thumbnail the thumbnail to display on the label or null to remove a displayed thumbnail
   */
  setThumbnail(thumbnail: Thumbnail = null) {
    const thumbnailElement = this.thumbnail.getDomElement();

    if (thumbnail == null) {
      thumbnailElement.css({
        'background-image': null,
        display: 'none',
        width: null,
        height: null,
      });
    } else {
      // We use the thumbnail image loader to make sure the thumbnail is loaded and it's size is known before be can
      // calculate the CSS properties and set them on the element.
      this.thumbnailImageLoader.load(thumbnail.url, (url, width, height) => {
        // can be checked like that because x/y/w/h are either all present or none
        // https://www.w3.org/TR/media-frags/#naming-space
        if (thumbnail.x !== undefined) {
          thumbnailElement.css(this.thumbnailCssSprite(thumbnail, width, height));
        } else {
          thumbnailElement.css(this.thumbnailCssSingleImage(thumbnail, width, height));
        }
      });
    }
  }

  private thumbnailCssSprite(thumbnail: Thumbnail, width: number, height: number): CssProperties {
    const thumbnailCountX = width / thumbnail.width;
    const thumbnailCountY = height / thumbnail.height;

    const thumbnailIndexX = thumbnail.x / thumbnail.width;
    const thumbnailIndexY = thumbnail.y / thumbnail.height;

    const sizeX = 100 * thumbnailCountX;
    const sizeY = 100 * thumbnailCountY;

    const offsetX = 100 * thumbnailIndexX;
    const offsetY = 100 * thumbnailIndexY;

    const aspectRatio = (1 / thumbnail.width) * thumbnail.height;

    // The thumbnail size is set by setting the CSS 'width' and 'padding-bottom' properties. 'padding-bottom' is
    // used because it is relative to the width and can be used to set the aspect ratio of the thumbnail.
    // A default value for width is set in the stylesheet and can be overwritten from there or anywhere else.
    return {
      display: 'inherit',
      'background-image': `url("${thumbnail.url}")`,
      'padding-bottom': `${100 * aspectRatio}%`,
      'background-size': `${sizeX}% ${sizeY}%`,
      'background-position': `-${offsetX}% -${offsetY}%`,
    };
  }

  private thumbnailCssSingleImage(thumbnail: Thumbnail, width: number, height: number): CssProperties {
    const aspectRatio = (1 / width) * height;

    return {
      display: 'inherit',
      'background-image': `url("${thumbnail.url}")`,
      'padding-bottom': `${100 * aspectRatio}%`,
      'background-size': `100% 100%`,
      'background-position': `0 0`,
    };
  }

  release(): void {
    super.release();

    this.uiManager.onSeekPreview.unsubscribe(this.handleSeekPreview);
    this.player.on(PlayerEvent.DurationChanged, this.init);
  }
}
