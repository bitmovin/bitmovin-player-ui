import { Container, ContainerConfig } from './container';
import { UIInstanceManager } from '../uimanager';
import { Label, LabelConfig } from './label';
import { ComponentConfig, Component } from './component';
import { ControlBar } from './controlbar';
import { EventDispatcher } from '../eventdispatcher';
import { DOM } from '../dom';
import { PlayerAPI, SubtitleCueEvent } from 'bitmovin-player';
import { i18n } from '../localization/i18n';
import { VttUtils } from '../vttutils';
import { VTTProperties } from 'bitmovin-player/types/subtitles/vtt/API';

/**
 * Overlays the player to display subtitles.
 */
export class SubtitleOverlay extends Container<ContainerConfig> {

  private subtitleManager: ActiveSubtitleManager;
  private previewSubtitleActive: boolean;
  private previewSubtitle: SubtitleLabel;

  private preprocessLabelEventCallback = new EventDispatcher<SubtitleCueEvent, SubtitleLabel>();
  private subtitleContainerManager: SubtitleRegionContainerManager;

  private static readonly CLASS_CONTROLBAR_VISIBLE = 'controlbar-visible';
  private static readonly CLASS_CEA_608 = 'cea608';

  // The number of rows in a cea608 grid
  private static readonly CEA608_NUM_ROWS = 15;
  // The number of columns in a cea608 grid
  private static readonly CEA608_NUM_COLUMNS = 32;
  // The offset in percent for one row (which is also the height of a row)
  private static readonly CEA608_ROW_OFFSET = 100 / SubtitleOverlay.CEA608_NUM_ROWS;
  // The offset in percent for one column (which is also the width of a column)
  private static readonly CEA608_COLUMN_OFFSET = 100 / SubtitleOverlay.CEA608_NUM_COLUMNS;

  constructor(config: ContainerConfig = {}) {
    super(config);

    this.previewSubtitleActive = false;
    this.previewSubtitle = new SubtitleLabel({ text: i18n.getLocalizer('subtitle.example') });

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-subtitle-overlay',
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let subtitleManager = new ActiveSubtitleManager();
    this.subtitleManager = subtitleManager;

    this.subtitleContainerManager = new SubtitleRegionContainerManager(this);

    player.on(player.exports.PlayerEvent.CueEnter, (event: SubtitleCueEvent) => {
      // Sanitize cue data (must be done before the cue ID is generated in subtitleManager.cueEnter)
      if (event.position) {
        // Sometimes the positions are undefined, we assume them to be zero
        event.position.row = event.position.row || 0;
        event.position.column = event.position.column || 0;
      }

      let labelToAdd = subtitleManager.cueEnter(event);

      this.preprocessLabelEventCallback.dispatch(event, labelToAdd);

      if (this.previewSubtitleActive) {
        this.subtitleContainerManager.removeLabel(this.previewSubtitle);
      }

      this.show();

      const overlaySize = {
        width: this.getDomElement().width(),
        height: this.getDomElement().height(),
      };
      this.subtitleContainerManager.addLabel(labelToAdd, overlaySize);
      this.updateComponents();
    });

    player.on(player.exports.PlayerEvent.CueExit, (event: SubtitleCueEvent) => {
      let labelToRemove = subtitleManager.cueExit(event);

      if (labelToRemove) {
        this.subtitleContainerManager.removeLabel(labelToRemove);
        this.updateComponents();
      }

      if (!subtitleManager.hasCues) {
        if (!this.previewSubtitleActive) {
          this.hide();
        } else {
          this.subtitleContainerManager.addLabel(this.previewSubtitle);
          this.updateComponents();
        }
      }
    });

    let subtitleClearHandler = () => {
      this.hide();
      this.subtitleContainerManager.clear();
      subtitleManager.clear();
      this.removeComponents();
      this.updateComponents();
    };

    player.on(player.exports.PlayerEvent.AudioChanged, subtitleClearHandler);
    player.on(player.exports.PlayerEvent.SubtitleEnabled, subtitleClearHandler);
    player.on(player.exports.PlayerEvent.SubtitleDisabled, subtitleClearHandler);
    player.on(player.exports.PlayerEvent.Seek, subtitleClearHandler);
    player.on(player.exports.PlayerEvent.TimeShift, subtitleClearHandler);
    player.on(player.exports.PlayerEvent.PlaybackFinished, subtitleClearHandler);
    player.on(player.exports.PlayerEvent.SourceUnloaded, subtitleClearHandler);

    uimanager.onComponentShow.subscribe((component: Component<ComponentConfig>) => {
      if (component instanceof ControlBar) {
        this.getDomElement().addClass(this.prefixCss(SubtitleOverlay.CLASS_CONTROLBAR_VISIBLE));
      }
    });
    uimanager.onComponentHide.subscribe((component: Component<ComponentConfig>) => {
      if (component instanceof ControlBar) {
        this.getDomElement().removeClass(this.prefixCss(SubtitleOverlay.CLASS_CONTROLBAR_VISIBLE));
      }
    });

    this.configureCea608Captions(player, uimanager);
    // Init
    subtitleClearHandler();
  }

  configureCea608Captions(player: PlayerAPI, uimanager: UIInstanceManager): void {
    // The calculated font size
    let fontSize = 0;
    // The required letter spacing spread the text characters evenly across the grid
    let fontLetterSpacing = 0;
    // Flag telling if a font size calculation is required of if the current values are valid
    let fontSizeCalculationRequired = true;
    // Flag telling if the CEA-608 mode is enabled
    let enabled = false;

    const updateCEA608FontSize = () => {
      const dummyLabel = new SubtitleLabel({ text: 'X' });
      dummyLabel.getDomElement().css({
        // By using a large font size we do not need to use multiple letters and can get still an
        // accurate measurement even though the returned size is an integer value
        'font-size': '200px',
        'line-height': '200px',
        'visibility': 'hidden',
      });
      this.addComponent(dummyLabel);
      this.updateComponents();
      this.show();

      const dummyLabelCharWidth = dummyLabel.getDomElement().width();
      const dummyLabelCharHeight = dummyLabel.getDomElement().height();
      const fontSizeRatio = dummyLabelCharWidth / dummyLabelCharHeight;

      this.removeComponent(dummyLabel);
      this.updateComponents();
      if (!this.subtitleManager.hasCues) {
        this.hide();
      }

      // We subtract 1px here to avoid line breaks at the right border of the subtitle overlay that can happen
      // when texts contain whitespaces. It's probably some kind of pixel rounding issue in the browser's
      // layouting, but the actual reason could not be determined. Aiming for a target width - 1px would work in
      // most browsers, but Safari has a "quantized" font size rendering with huge steps in between so we need
      // to subtract some more pixels to avoid line breaks there as well.
      const subtitleOverlayWidth = this.getDomElement().width() - 10;
      const subtitleOverlayHeight = this.getDomElement().height();

      // The size ratio of the letter grid
      const fontGridSizeRatio = (dummyLabelCharWidth * SubtitleOverlay.CEA608_NUM_COLUMNS) /
        (dummyLabelCharHeight * SubtitleOverlay.CEA608_NUM_ROWS);
      // The size ratio of the available space for the grid
      const subtitleOverlaySizeRatio = subtitleOverlayWidth / subtitleOverlayHeight;

      if (subtitleOverlaySizeRatio > fontGridSizeRatio) {
        // When the available space is wider than the text grid, the font size is simply
        // determined by the height of the available space.
        fontSize = subtitleOverlayHeight / SubtitleOverlay.CEA608_NUM_ROWS;

        // Calculate the additional letter spacing required to evenly spread the text across the grid's width
        const gridSlotWidth = subtitleOverlayWidth / SubtitleOverlay.CEA608_NUM_COLUMNS;
        const fontCharWidth = fontSize * fontSizeRatio;
        fontLetterSpacing = gridSlotWidth - fontCharWidth;
      } else {
        // When the available space is not wide enough, texts would vertically overlap if we take
        // the height as a base for the font size, so we need to limit the height. We do that
        // by determining the font size by the width of the available space.
        fontSize = subtitleOverlayWidth / SubtitleOverlay.CEA608_NUM_COLUMNS / fontSizeRatio;
        fontLetterSpacing = 0;
      }

      // Update font-size of all active subtitle labels
      for (let label of this.getComponents()) {
        if (label instanceof SubtitleLabel) {
          label.getDomElement().css({
            'font-size': `${fontSize}px`,
            'letter-spacing': `${fontLetterSpacing}px`,
          });
        }
      }
    };

    player.on(player.exports.PlayerEvent.PlayerResized, () => {
      if (enabled) {
        updateCEA608FontSize();
      } else {
        fontSizeCalculationRequired = true;
      }
    });

    this.preprocessLabelEventCallback.subscribe((event: SubtitleCueEvent, label: SubtitleLabel) => {
      const isCEA608 = event.position != null;
      if (!isCEA608) {
        // Skip all non-CEA608 cues
        return;
      }

      if (!enabled) {
        enabled = true;
        this.getDomElement().addClass(this.prefixCss(SubtitleOverlay.CLASS_CEA_608));

        // We conditionally update the font size by this flag here to avoid updating every time a subtitle
        // is added into an empty overlay. Because we reset the overlay when all subtitles are gone, this
        // would trigger an unnecessary update every time, but it's only required under certain conditions,
        // e.g. after the player size has changed.
        if (fontSizeCalculationRequired) {
          updateCEA608FontSize();
          fontSizeCalculationRequired = false;
        }
      }

      label.getDomElement().css({
        'left': `${event.position.column * SubtitleOverlay.CEA608_COLUMN_OFFSET}%`,
        'top': `${event.position.row * SubtitleOverlay.CEA608_ROW_OFFSET}%`,
        'font-size': `${fontSize}px`,
        'letter-spacing': `${fontLetterSpacing}px`,
      });
    });

    const reset = () => {
      this.getDomElement().removeClass(this.prefixCss(SubtitleOverlay.CLASS_CEA_608));
      enabled = false;
    };

    player.on(player.exports.PlayerEvent.CueExit, () => {
      if (!this.subtitleManager.hasCues) {
        // Disable CEA-608 mode when all subtitles are gone (to allow correct formatting and
        // display of other types of subtitles, e.g. the formatting preview subtitle)
        reset();
      }
    });

    player.on(player.exports.PlayerEvent.SourceUnloaded, reset);
    player.on(player.exports.PlayerEvent.SubtitleEnabled, reset);
    player.on(player.exports.PlayerEvent.SubtitleDisabled, reset);
  }

  enablePreviewSubtitleLabel(): void {
    this.previewSubtitleActive = true;
    if (!this.subtitleManager.hasCues) {
      this.subtitleContainerManager.addLabel(this.previewSubtitle);
      this.updateComponents();
      this.show();
    }
  }

  removePreviewSubtitleLabel(): void {
    this.previewSubtitleActive = false;
    this.subtitleContainerManager.removeLabel(this.previewSubtitle);
    this.updateComponents();
  }
}

interface ActiveSubtitleCue {
  event: SubtitleCueEvent;
  label: SubtitleLabel;
}

interface ActiveSubtitleCueMap {
  [id: string]: ActiveSubtitleCue[];
}

interface SubtitleLabelConfig extends LabelConfig {
  vtt?: VTTProperties;
  region?: string;
  regionStyle?: string;
}

export class SubtitleLabel extends Label<SubtitleLabelConfig> {

  constructor(config: SubtitleLabelConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-subtitle-label',
    }, this.config);
  }

  get vtt(): VTTProperties {
    return this.config.vtt;
  }

  get region(): string {
    return this.config.region;
  }

  get regionStyle(): string {
    return this.config.regionStyle;
  }
}

class ActiveSubtitleManager {

  private activeSubtitleCueMap: ActiveSubtitleCueMap;
  private activeSubtitleCueCount: number;

  constructor() {
    this.activeSubtitleCueMap = {};
    this.activeSubtitleCueCount = 0;
  }

  /**
   * Calculates a unique ID for a subtitle cue, which is needed to associate an CueEnter with its CueExit
   * event so we can remove the correct subtitle in CueExit when multiple subtitles are active at the same time.
   * The start time plus the text should make a unique identifier, and in the only case where a collision
   * can happen, two similar texts will be displayed at a similar time and a similar position (or without position).
   * The start time should always be known, because it is required to schedule the CueEnter event. The end time
   * must not necessarily be known and therefore cannot be used for the ID.
   * @param event
   * @return {string}
   */
  private static calculateId(event: SubtitleCueEvent): string {
    let id = event.start + '-' + event.text;

    if (event.position) {
      id += '-' + event.position.row + '-' + event.position.column;
    }

    return id;
  }

  /**
   * Adds a subtitle cue to the manager and returns the label that should be added to the subtitle overlay.
   * @param event
   * @return {SubtitleLabel}
   */
  cueEnter(event: SubtitleCueEvent): SubtitleLabel {
    let id = ActiveSubtitleManager.calculateId(event);

    let label = new SubtitleLabel({
      // Prefer the HTML subtitle text if set, else try generating a image tag as string from the image attribute,
      // else use the plain text
      text: event.html || ActiveSubtitleManager.generateImageTagText(event.image) || event.text,
      vtt: event.vtt,
      region: event.region,
      regionStyle: event.regionStyle,
    });

    // Create array for id if it does not exist
    this.activeSubtitleCueMap[id] = this.activeSubtitleCueMap[id] || [];

    // Add cue
    this.activeSubtitleCueMap[id].push({ event, label });
    this.activeSubtitleCueCount++;

    return label;
  }

  private static generateImageTagText(imageData: string): string {
    if (!imageData) {
      return;
    }

    const imgTag = new DOM('img', {
      src: imageData,
    });
    imgTag.css('width', '100%');
    return imgTag.get(0).outerHTML; // return the html as string
  }

  /**
   * Returns the label associated with an already added cue.
   * @param event
   * @return {SubtitleLabel}
   */
  getCues(event: SubtitleCueEvent): SubtitleLabel[] {
    let id = ActiveSubtitleManager.calculateId(event);
    let activeSubtitleCues = this.activeSubtitleCueMap[id];
    if (activeSubtitleCues && activeSubtitleCues.length > 0) {
      return activeSubtitleCues.map((cue) => cue.label);
    } else {
      return null;
    }
  }

  /**
   * Removes the subtitle cue from the manager and returns the label that should be removed from the subtitle overlay,
   * or null if there is no associated label existing (e.g. because all labels have been {@link #clear cleared}.
   * @param event
   * @return {SubtitleLabel|null}
   */
  cueExit(event: SubtitleCueEvent): SubtitleLabel {
    let id = ActiveSubtitleManager.calculateId(event);
    let activeSubtitleCues = this.activeSubtitleCueMap[id];

    if (activeSubtitleCues && activeSubtitleCues.length > 0) {
      // Remove cue
      /* We apply the FIFO approach here and remove the oldest cue from the associated id. When there are multiple cues
       * with the same id, there is no way to know which one of the cues is to be deleted, so we just hope that FIFO
       * works fine. Theoretically it can happen that two cues with colliding ids are removed at different times, in
       * the wrong order. This rare case has yet to be observed. If it ever gets an issue, we can take the unstable
       * cue end time (which can change between CueEnter and CueExit IN CueUpdate) and use it as an
       * additional hint to try and remove the correct one of the colliding cues.
       */
      let activeSubtitleCue = activeSubtitleCues.shift();
      this.activeSubtitleCueCount--;

      return activeSubtitleCue.label;
    } else {
      return null;
    }
  }

  /**
   * Returns the number of active subtitle cues.
   * @return {number}
   */
  get cueCount(): number {
    // We explicitly count the cues to save an Array.reduce on every cueCount call (which can happen frequently)
    return this.activeSubtitleCueCount;
  }

  /**
   * Returns true if there are active subtitle cues, else false.
   * @return {boolean}
   */
  get hasCues(): boolean {
    return this.cueCount > 0;
  }

  /**
   * Removes all subtitle cues from the manager.
   */
  clear(): void {
    this.activeSubtitleCueMap = {};
    this.activeSubtitleCueCount = 0;
  }
}

export class SubtitleRegionContainerManager {
  private subtitleRegionContainers: { [regionName: string]: SubtitleRegionContainer } = {};

  /**
   * @param subtitleOverlay Reference to the subtitle overlay for adding and removing the containers.
   */
  constructor(private subtitleOverlay: SubtitleOverlay) {
    this.subtitleOverlay = subtitleOverlay;
  }

  /**
   * Creates and wraps a subtitle label into a container div based on the subtitle region.
   * If the subtitle has positioning information it is added to the container.
   * @param label The subtitle label to wrap
   */
  addLabel(label: SubtitleLabel, overlaySize?: { width: number, height: number }): void {
    let regionContainerId;
    let regionName;

    if (label.vtt) {
      regionContainerId = label.vtt.region && label.vtt.region.id ? label.vtt.region.id : 'vtt';
      regionName = 'vtt';
    } else {
      regionContainerId = regionName = label.region || 'default';
    }

    const cssClasses = [`subtitle-position-${regionName}`];

    if (label.vtt && label.vtt.region) {
      cssClasses.push(`vtt-region-${label.vtt.region.id}`);
    }

    if (!this.subtitleRegionContainers[regionContainerId]) {
      const regionContainer = new SubtitleRegionContainer({
        cssClasses: [...cssClasses, 'subtitle-region-container'],
      });

      this.subtitleRegionContainers[regionContainerId] = regionContainer;

      if (label.regionStyle) {
        regionContainer.getDomElement().attr('style', label.regionStyle);
      } else if (label.vtt && !label.vtt.region) {
        /**
         * If there is no region present to wrap the Cue Box, the Cue box becomes the
         * region itself. Therefore the positioning values have to come from the box.
         */
        regionContainer.getDomElement().css('position', 'unset');
      } else {
        // getDomElement needs to be called at least once to ensure the component exists
        regionContainer.getDomElement();
      }

      for (const regionContainerId in this.subtitleRegionContainers) {
        this.subtitleOverlay.addComponent(this.subtitleRegionContainers[regionContainerId]);
      }
    }

    this.subtitleRegionContainers[regionContainerId].addLabel(label, overlaySize);
  }

  /**
   * Removes a subtitle label from a container.
   */
  removeLabel(label: SubtitleLabel): void {
    let regionContainerId;

    if (label.vtt) {
      regionContainerId = label.vtt.region && label.vtt.region.id ? label.vtt.region.id : 'vtt';
    } else {
      regionContainerId = label.region || 'default';
    }

    this.subtitleRegionContainers[regionContainerId].removeLabel(label);

    // Remove container if no more labels are displayed
    if (this.subtitleRegionContainers[regionContainerId].isEmpty()) {
      this.subtitleOverlay.removeComponent(this.subtitleRegionContainers[regionContainerId]);
      delete this.subtitleRegionContainers[regionContainerId];
    }
  }

  /**
   * Removes all subtitle containers.
   */
  clear(): void {
    for (const regionName in this.subtitleRegionContainers) {
      this.subtitleOverlay.removeComponent(this.subtitleRegionContainers[regionName]);
    }

    this.subtitleRegionContainers = {};
  }
}

export class SubtitleRegionContainer extends Container<ContainerConfig> {
  private labelCount = 0;

  constructor(config: ContainerConfig = {}) {
    super(config);
  }

  addLabel(labelToAdd: SubtitleLabel, overlaySize?: { width: number, height: number }) {
    this.labelCount++;

    if (labelToAdd.vtt) {
      if (labelToAdd.vtt.region && overlaySize) {
        VttUtils.setVttRegionStyles(this, labelToAdd.vtt.region, overlaySize);
      }

      VttUtils.setVttCueBoxStyles(labelToAdd);
    }

    this.addComponent(labelToAdd);
    this.updateComponents();
  }

  removeLabel(labelToRemove: SubtitleLabel): void {
    this.labelCount--;
    this.removeComponent(labelToRemove);
    this.updateComponents();
  }

  public isEmpty(): boolean {
    return this.labelCount === 0;
  }
}
