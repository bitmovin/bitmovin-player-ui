import { Container, ContainerConfig } from '../Container';
import { UIInstanceManager } from '../../UIManager';
import { Label, LabelConfig } from '../labels/Label';
import { ComponentConfig, Component } from '../Component';
import { ControlBar } from '../ControlBar';
import { EventDispatcher } from '../../EventDispatcher';
import { DOM, Size } from '../../DOM';
import { PlayerAPI, SubtitleCueEvent } from 'bitmovin-player';
import { i18n } from '../../localization/i18n';
import { VttUtils } from '../../utils/VttUtils';
import { VTTProperties } from 'bitmovin-player/types/subtitles/vtt/API';
import { ListItemFilter } from '../lists/ListSelector';

interface SubtitleCropDetectionResult {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

/**
 * Overlays the player to display subtitles.
 *
 * @category Components
 */
export class SubtitleOverlay extends Container<ContainerConfig> {
  private subtitleManager: ActiveSubtitleManager;
  private previewSubtitleActive: boolean;
  private previewSubtitle: SubtitleLabel;

  private preprocessLabelEventCallback = new EventDispatcher<SubtitleCueEvent, SubtitleLabel>();
  private subtitleContainerManager: SubtitleRegionContainerManager;

  private static readonly CLASS_CONTROLBAR_VISIBLE = 'controlbar-visible';
  private static readonly CLASS_CEA_608 = 'cea608';
  private static readonly CEA608_NUM_ROWS = 15;
  private static readonly CEA608_NUM_COLUMNS = 32;
  private static readonly CEA608_COLUMN_OFFSET = 100 / SubtitleOverlay.CEA608_NUM_COLUMNS;
  private static readonly DEFAULT_CAPTION_LEFT_OFFSET = '0.5%';
  private static readonly CEA608_MIN_FONT_SIZE_RATIO = 0.07;
  /** Players at or below this height (px) are considered small and get the minimum font size floor */
  private static readonly CEA608_SMALL_PLAYER_HEIGHT_THRESHOLD = 240;

  private cea608Enabled = false;
  private cea608FontSizeFactor = 1;
  private ensureCea608GridSizeUpdated: () => void;

  constructor(config: ContainerConfig = {}) {
    super(config);

    this.previewSubtitleActive = false;
    this.previewSubtitle = new SubtitleLabel({ text: i18n.getLocalizer('subtitle.example') });

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-subtitle-overlay',
      },
      this.config,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    const subtitleManager = new ActiveSubtitleManager();
    this.subtitleManager = subtitleManager;

    this.subtitleContainerManager = new SubtitleRegionContainerManager(this);

    player.on(player.exports.PlayerEvent.CueEnter, (event: SubtitleCueEvent) => {
      const label = this.generateLabel(event);
      subtitleManager.cueEnter(event, label);

      this.preprocessLabelEventCallback.dispatch(event, label);

      if (this.previewSubtitleActive) {
        this.subtitleContainerManager.removeLabel(this.previewSubtitle);
      }

      this.show();

      this.subtitleContainerManager.addLabel(label, this.getDomElement().size());
      this.updateComponents();

      if (uimanager.getConfig().forceSubtitlesIntoViewContainer) {
        this.handleSubtitleCropping(label);
      }
    });

    player.on(player.exports.PlayerEvent.CueUpdate, (event: SubtitleCueEvent) => {
      const label = this.generateLabel(event);
      const labelToReplace = subtitleManager.cueUpdate(event, label);

      this.preprocessLabelEventCallback.dispatch(event, label);

      if (labelToReplace) {
        this.subtitleContainerManager.replaceLabel(labelToReplace, label);
      }

      if (uimanager.getConfig().forceSubtitlesIntoViewContainer) {
        this.handleSubtitleCropping(label);
      }
    });

    player.on(player.exports.PlayerEvent.CueExit, (event: SubtitleCueEvent) => {
      const labelToRemove = subtitleManager.cueExit(event);

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

    const subtitleClearHandler = () => {
      this.hide();
      this.subtitleContainerManager.clear();
      subtitleManager.clear();
      this.removeComponents();
      this.updateComponents();
    };

    const clearInactiveCues = () => {
      const removedActiveCues = subtitleManager.clearInactiveCues(player.getCurrentTime());
      removedActiveCues.forEach(toRemove => {
        this.subtitleContainerManager.removeLabel(toRemove.label);
      });
      this.updateComponents();
    };

    player.on(player.exports.PlayerEvent.AudioChanged, subtitleClearHandler);
    player.on(player.exports.PlayerEvent.SubtitleDisabled, subtitleClearHandler);
    player.on(player.exports.PlayerEvent.Seeked, clearInactiveCues);
    player.on(player.exports.PlayerEvent.TimeShifted, clearInactiveCues);
    player.on(player.exports.PlayerEvent.PlaybackFinished, subtitleClearHandler);
    player.on(player.exports.PlayerEvent.SourceUnloaded, subtitleClearHandler);

    uimanager.onComponentShow.subscribe((component: Component<ComponentConfig>) => {
      if (component instanceof ControlBar) {
        this.getDomElement().addClass(this.prefixCss(SubtitleOverlay.CLASS_CONTROLBAR_VISIBLE));

        if (this.cea608Enabled && this.ensureCea608GridSizeUpdated) {
          awaitTransitionEnd(this.getDomElement()).then(this.ensureCea608GridSizeUpdated);
        }
      }
    });

    uimanager.onComponentHide.subscribe((component: Component<ComponentConfig>) => {
      if (component instanceof ControlBar) {
        this.getDomElement().removeClass(this.prefixCss(SubtitleOverlay.CLASS_CONTROLBAR_VISIBLE));

        if (this.cea608Enabled && this.ensureCea608GridSizeUpdated) {
          awaitTransitionEnd(this.getDomElement()).then(this.ensureCea608GridSizeUpdated);
        }
      }
    });

    this.configureCea608Captions(player, uimanager);
    // Init
    subtitleClearHandler();
  }

  setFontSizeFactor(factor: number): void {
    // We only allow range from 50% to 200% as suggested by spec
    // https://www.ecfr.gov/current/title-47/part-79/section-79.103#p-79.103(c)(4)
    this.cea608FontSizeFactor = Math.max(0.5, Math.min(2, factor));
  }

  detectCroppedSubtitleLabel(labelElement: HTMLElement): SubtitleCropDetectionResult {
    const parent = this.getDomElement().get(0);

    const childRect = labelElement.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    return {
      top: childRect.top < parentRect.top,
      right: childRect.right > parentRect.right,
      bottom: childRect.bottom > parentRect.bottom,
      left: childRect.left < parentRect.left,
    };
  }

  handleSubtitleCropping(label: SubtitleLabel) {
    const labelDomElement = label.getDomElement();
    const cropDetection = this.detectCroppedSubtitleLabel(labelDomElement.get(0));

    if (cropDetection.top) {
      labelDomElement.css('top', '0');
      labelDomElement.removeCss('bottom');
    }

    if (cropDetection.right) {
      labelDomElement.css('right', '0');
      labelDomElement.removeCss('left');
    }

    if (cropDetection.bottom) {
      labelDomElement.css('bottom', '0');
      labelDomElement.removeCss('top');
    }

    if (cropDetection.left) {
      labelDomElement.css('left', '0');
      labelDomElement.removeCss('right');
    }
  }

  generateLabel(event: SubtitleCueEvent): SubtitleLabel {
    // Sanitize cue data (must be done before the cue ID is generated in subtitleManager.cueEnter / update)
    let region = event.region;

    // Sometimes the positions are undefined, we assume them to be zero.
    // We need to keep track of the original row position in case of recalculation.
    const originalRowNumber = event.position?.row || 0;

    if (isCea608SubtitleCue(event)) {
      event.position.row = event.position.row || 0;
      event.position.column = event.position.column || 0;

      region = region || `cea608-row-${event.position.row}`;
    }

    const label = new SubtitleLabel({
      // Prefer the HTML subtitle text if set, else try generating a image tag as string from the image attribute,
      // else use the plain text
      text: event.html || ActiveSubtitleManager.generateImageTagText(event.image) || event.text,
      vtt: event.vtt,
      region: region,
      regionStyle: event.regionStyle,
      originalRowPosition: originalRowNumber,
    });

    return label;
  }

  filterFontSizeOptions: ListItemFilter = listItem => {
    if (this.cea608Enabled && listItem.key !== null) {
      const percent = parseInt(listItem.key, 10);
      return !isNaN(percent) && percent <= 200;
    }

    return true;
  };

  resolveFontSizeFactor(value: string): number {
    return parseInt(value) / 100;
  }

  configureCea608Captions(player: PlayerAPI, uimanager: UIInstanceManager): void {
    /** The calculated row height in px */
    let rowHeight = 0;
    /** The calculated font size in px */
    let fontSize = 0;
    /**
     * The ratio of the font size of 100% to the row height.
     * e.g. font size 100% fills up 75% of the available row height
     */
    const fontSize100PercentRatio = 0.75;
    /** The required letter spacing spread the text characters evenly across the grid */
    let fontLetterSpacing = 0;
    /** The ratio of the caption window/row height that is used as margin so that the window encloses the caption */
    const windowMarginRatio = 0.2;
    /** The calculated window margin in px */
    let windowMargin: number;
    /** Flag telling if the CEA-608 rendering mode is currently enabled */
    this.cea608Enabled = false;
    /** Track last known grid params to avoid unnecessary recalculations */
    let lastCeaGridRecalculation = { overlayWidth: 0, overlayHeight: 0, fontSizeFactor: 0 };

    const settingsManager = uimanager.getSubtitleSettingsManager();
    if (settingsManager.fontSize.value != null) {
      const fontSizeFactorSettings = this.resolveFontSizeFactor(settingsManager.fontSize.value);
      this.setFontSizeFactor(fontSizeFactorSettings);
    }

    settingsManager.fontSize.onChanged.subscribe((_sender, property) => {
      if (property.isSet()) {
        // We need to convert from percent
        const factorValue = this.resolveFontSizeFactor(property.value);
        this.setFontSizeFactor(factorValue);
      } else {
        this.setFontSizeFactor(1);
      }

      if (this.cea608Enabled) {
        this.ensureCea608GridSizeUpdated();
      }
    });

    this.onShow?.subscribe(() => {
      // ensure CEA grid is updated whenever the overlay becomes visible
      if (this.cea608Enabled) {
        this.ensureCea608GridSizeUpdated();
      }
    });

    this.ensureCea608GridSizeUpdated = () => {
      const overlayElement = this.getDomElement();
      const currentWidth = overlayElement.width();
      const currentHeight = overlayElement.height();
      const hasOverlaySizeChanged =
        currentWidth !== lastCeaGridRecalculation.overlayWidth ||
        currentHeight !== lastCeaGridRecalculation.overlayHeight;
      const hasFontSizeFactorChanged = this.cea608FontSizeFactor !== lastCeaGridRecalculation.fontSizeFactor;

      if (!hasOverlaySizeChanged && !hasFontSizeFactorChanged) {
        // none of the input variables changed, no need to recalculate
        return;
      }

      lastCeaGridRecalculation = {
        overlayWidth: currentWidth,
        overlayHeight: currentHeight,
        fontSizeFactor: this.cea608FontSizeFactor,
      };

      const dummyLabel = new SubtitleLabel({ text: 'X' });
      dummyLabel.getDomElement().css({
        // By using a large font size we do not need to use multiple letters and can get still an
        // accurate measurement even though the returned size is an integer value
        'font-size': '200px',
        'line-height': '200px',
        visibility: 'hidden',
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
      const subtitleOverlayWidthUsableRatio = 1 - parseFloat(SubtitleOverlay.DEFAULT_CAPTION_LEFT_OFFSET) / 100;
      const subtitleOverlayWidth = Math.floor(subtitleOverlayWidthUsableRatio * currentWidth) - 10;
      const subtitleOverlayHeight = currentHeight;

      // The size ratio of the letter grid
      const fontGridSizeRatio =
        (dummyLabelCharWidth * SubtitleOverlay.CEA608_NUM_COLUMNS) /
        (dummyLabelCharHeight * SubtitleOverlay.CEA608_NUM_ROWS);
      // The size ratio of the available space for the grid
      const subtitleOverlaySizeRatio = subtitleOverlayWidth / subtitleOverlayHeight;

      if (subtitleOverlaySizeRatio > fontGridSizeRatio) {
        // When the available space is wider than the text grid, the font size is simply
        // determined by the height of the available space.
        rowHeight = subtitleOverlayHeight / SubtitleOverlay.CEA608_NUM_ROWS;
        const fontSize100Percent = rowHeight * (1 - windowMarginRatio) * fontSize100PercentRatio;
        fontSize = fontSize100Percent * this.cea608FontSizeFactor;
        // Calculate the additional letter spacing required to evenly spread the text across the grid's width
        const gridSlotWidth = subtitleOverlayWidth / SubtitleOverlay.CEA608_NUM_COLUMNS;
        const fontCharWidth = fontSize * fontSizeRatio;
        fontLetterSpacing = Math.max(gridSlotWidth - fontCharWidth, 0);
      } else {
        // When the available space is not wide enough, texts would vertically overlap if we take
        // the height as a base for the font size, so we need to limit the height. We do that
        // by determining the font size by the width of the available space.
        rowHeight = subtitleOverlayWidth / SubtitleOverlay.CEA608_NUM_COLUMNS / fontSizeRatio;
        const fontSize100Percent = rowHeight * (1 - windowMarginRatio) * fontSize100PercentRatio;
        fontSize = fontSize100Percent * this.cea608FontSizeFactor;
        fontLetterSpacing = 0;
      }

      // Enforce a minimum font size for legibility on small players.
      // Use the player container's full height rather than the overlay height, which may be reduced
      // when the controlbar is visible, so that font size stays stable as the controlbar appears.
      // When the minimum kicks in, rowHeight is increased to match, and the grid is shifted upward
      // via --cea608-grid-offset so that bottom rows (where CEA-608 content typically appears)
      // remain visible while top rows clip above the overlay.
      const playerHeight = new DOM(player.getContainer()).height();
      if (playerHeight <= SubtitleOverlay.CEA608_SMALL_PLAYER_HEIGHT_THRESHOLD) {
        const minFontSize = playerHeight * SubtitleOverlay.CEA608_MIN_FONT_SIZE_RATIO;
        const minRowHeight =
          minFontSize / (fontSize100PercentRatio * (1 - windowMarginRatio) * this.cea608FontSizeFactor);
        if (minRowHeight > rowHeight) {
          rowHeight = minRowHeight;
          fontSize = minFontSize;
          const gridSlotWidth = subtitleOverlayWidth / SubtitleOverlay.CEA608_NUM_COLUMNS;
          fontLetterSpacing = Math.max(gridSlotWidth - fontSize * fontSizeRatio, 0);
        }
      }

      windowMargin = rowHeight * windowMarginRatio;

      // Shift the grid upward when it exceeds the overlay height, keeping bottom rows in view
      const gridOffset = Math.max(0, rowHeight * SubtitleOverlay.CEA608_NUM_ROWS - subtitleOverlayHeight);

      overlayElement.get().forEach(el => {
        el.style.setProperty('--cea608-row-height', `${rowHeight}px`);
        el.style.setProperty('--cea608-grid-offset', `${gridOffset}px`);
      });

      // Update font-size of all active subtitle labels
      const updateLabel = (label: SubtitleLabel) => {
        label.getDomElement().css({
          'font-size': `${fontSize}px`,
          'line-height': `${rowHeight - windowMargin}px`,
          'letter-spacing': `${fontLetterSpacing}px`,
        });

        label.regionStyle = `margin: ${windowMargin / 2}px; height: ${rowHeight}px`;
      };

      for (const childComponent of this.getComponents()) {
        if (childComponent instanceof SubtitleRegionContainer) {
          childComponent.getDomElement().css({
            margin: `${windowMargin / 2}px`,
            height: `${rowHeight}px`,
          });

          childComponent.getComponents().forEach((l: SubtitleLabel) => {
            updateLabel(l);
          });
        }

        if (childComponent instanceof SubtitleLabel) {
          updateLabel(childComponent);
        }
      }
    };

    player.on(player.exports.PlayerEvent.PlayerResized, () => {
      if (this.cea608Enabled) {
        this.ensureCea608GridSizeUpdated();
      }
    });

    this.preprocessLabelEventCallback.subscribe((event: SubtitleCueEvent, label: SubtitleLabel) => {
      if (!isCea608SubtitleCue(event)) {
        // Skip all non-CEA608 cues
        return;
      }

      if (!this.cea608Enabled) {
        this.cea608Enabled = true;
        this.getDomElement().addClass(this.prefixCss(SubtitleOverlay.CLASS_CEA_608));
      }

      let leftOffset = event.position.column * SubtitleOverlay.CEA608_COLUMN_OFFSET + '%';
      if (leftOffset === '0%') {
        // ensure that a little of the window still shows for better readability
        leftOffset = SubtitleOverlay.DEFAULT_CAPTION_LEFT_OFFSET;
      }

      label.getDomElement().css({
        left: leftOffset,
        'font-size': `${fontSize}px`,
        'letter-spacing': `${fontLetterSpacing}px`,
        'line-height': `${rowHeight - windowMargin}px`,
      });

      label.regionStyle = `margin: ${windowMargin / 2}px; height: ${rowHeight}px`;
    });

    const reset = () => {
      this.getDomElement().removeClass(this.prefixCss(SubtitleOverlay.CLASS_CEA_608));
      if (this.cea608Enabled) {
        // Reset the cache so the next CEA-608 session always runs a fresh recalculation.
        // Without this, ensureCea608GridSizeUpdated returns early on unchanged dimensions
        // and --cea608-grid-offset never gets re-applied after a reset.
        lastCeaGridRecalculation = { overlayWidth: 0, overlayHeight: 0, fontSizeFactor: 0 };
        this.getDomElement()
          .get()
          .forEach(el => {
            el.style.removeProperty('--cea608-grid-offset');
          });
      }
      this.cea608Enabled = false;
    };

    player.on(player.exports.PlayerEvent.CueExit, () => {
      if (!this.subtitleManager.hasCues) {
        // Disable CEA-608 mode when all subtitles are gone (to allow correct formatting and
        // display of other types of subtitles, e.g. the formatting preview subtitle)
        reset();
      }
    });

    player.on(player.exports.PlayerEvent.SourceUnloaded, reset);
    player.on(player.exports.PlayerEvent.SubtitleEnable, reset);
    player.on(player.exports.PlayerEvent.SubtitleDisabled, reset);
  }

  enablePreviewSubtitleLabel(): void {
    if (!this.subtitleManager.hasCues) {
      this.previewSubtitleActive = true;
      this.subtitleContainerManager.addLabel(this.previewSubtitle);
      this.updateComponents();
      this.show();
    }
  }

  removePreviewSubtitleLabel(): void {
    if (this.previewSubtitleActive) {
      this.previewSubtitleActive = false;
      this.subtitleContainerManager.removeLabel(this.previewSubtitle);
      this.updateComponents();
    }
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
  originalRowPosition?: number;
}

export class SubtitleLabel extends Label<SubtitleLabelConfig> {
  constructor(config: SubtitleLabelConfig = {}) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-subtitle-label',
      },
      this.config,
    );
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

  get originalRowPosition(): number {
    return this.config.originalRowPosition;
  }

  set regionStyle(style: string) {
    this.config.regionStyle = style;
  }

  set originalRowPosition(row: number) {
    this.config.originalRowPosition = row;
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

  cueEnter(event: SubtitleCueEvent, label: SubtitleLabel): void {
    this.addCueToMap(event, label);
  }

  cueUpdate(event: SubtitleCueEvent, label: SubtitleLabel): SubtitleLabel | undefined {
    const labelToReplace = this.popCueFromMap(event);

    if (labelToReplace) {
      this.addCueToMap(event, label);
      return labelToReplace;
    }

    return undefined;
  }

  private addCueToMap(event: SubtitleCueEvent, label: SubtitleLabel): void {
    const id = ActiveSubtitleManager.calculateId(event);

    // Create array for id if it does not exist
    this.activeSubtitleCueMap[id] = this.activeSubtitleCueMap[id] || [];

    // Add cue
    this.activeSubtitleCueMap[id].push({ event, label });
    this.activeSubtitleCueCount++;
  }

  private popCueFromMap(event: SubtitleCueEvent): SubtitleLabel | undefined {
    const id = ActiveSubtitleManager.calculateId(event);
    const activeSubtitleCues = this.activeSubtitleCueMap[id];

    if (activeSubtitleCues && activeSubtitleCues.length > 0) {
      // Remove cue
      /* We apply the FIFO approach here and remove the oldest cue from the associated id. When there are multiple cues
       * with the same id, there is no way to know which one of the cues is to be deleted, so we just hope that FIFO
       * works fine. Theoretically it can happen that two cues with colliding ids are removed at different times, in
       * the wrong order. This rare case has yet to be observed. If it ever gets an issue, we can take the unstable
       * cue end time (which can change between CueEnter and CueExit IN CueUpdate) and use it as an
       * additional hint to try and remove the correct one of the colliding cues.
       */
      const activeSubtitleCue = activeSubtitleCues.shift();
      this.activeSubtitleCueCount--;

      return activeSubtitleCue.label;
    }
  }

  /**
   * Removes all active cues which don't enclose the given time
   * @param time the time for which subtitles should remain
   */
  public clearInactiveCues(time: number): ActiveSubtitleCue[] {
    const removedCues: ActiveSubtitleCue[] = [];
    Object.keys(this.activeSubtitleCueMap).forEach(key => {
      const activeCues = this.activeSubtitleCueMap[key];
      activeCues.forEach(cue => {
        if (time < cue.event.start || time > cue.event.end) {
          this.popCueFromMap(cue.event);
          removedCues.push(cue);
        }
      });
    });
    return removedCues;
  }

  static generateImageTagText(imageData: string): string | undefined {
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
  getCues(event: SubtitleCueEvent): SubtitleLabel[] | undefined {
    const id = ActiveSubtitleManager.calculateId(event);
    const activeSubtitleCues = this.activeSubtitleCueMap[id];
    if (activeSubtitleCues && activeSubtitleCues.length > 0) {
      return activeSubtitleCues.map(cue => cue.label);
    }
  }

  /**
   * Removes the subtitle cue from the manager and returns the label that should be removed from the subtitle overlay,
   * or null if there is no associated label existing (e.g. because all labels have been {@link #clear cleared}.
   * @param event
   * @return {SubtitleLabel|null}
   */
  cueExit(event: SubtitleCueEvent): SubtitleLabel {
    return this.popCueFromMap(event);
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

  private getRegion(label: SubtitleLabel): { regionContainerId: string; regionName: string } {
    if (label.vtt) {
      return {
        regionContainerId: label.vtt.region && label.vtt.region.id ? label.vtt.region.id : 'vtt',
        regionName: 'vtt',
      };
    }

    return {
      regionContainerId: label.region || 'default',
      regionName: label.region || 'default',
    };
  }

  /**
   * Creates and wraps a subtitle label into a container div based on the subtitle region.
   * If the subtitle has positioning information it is added to the container.
   * @param label The subtitle label to wrap
   */
  addLabel(label: SubtitleLabel, overlaySize?: Size): void {
    const { regionContainerId, regionName } = this.getRegion(label);
    const cssClasses = [`subtitle-position-${regionName}`];

    if (label.vtt && label.vtt.region) {
      cssClasses.push(`vtt-region-${label.vtt.region.id}`);
    }

    if (!this.subtitleRegionContainers[regionContainerId]) {
      const regionContainer = new SubtitleRegionContainer({
        cssClasses,
      });

      this.subtitleRegionContainers[regionContainerId] = regionContainer;

      if (label.regionStyle) {
        regionContainer.getDomElement().attr('style', label.regionStyle);
      }

      if (label.vtt) {
        regionContainer.getDomElement().css('position', 'static');
      }

      // getDomElement needs to be called at least once to ensure the component exists
      regionContainer.getDomElement();

      for (const regionContainerId in this.subtitleRegionContainers) {
        this.subtitleOverlay.addComponent(this.subtitleRegionContainers[regionContainerId]);
      }
    }

    this.subtitleRegionContainers[regionContainerId].addLabel(label, overlaySize);
  }

  replaceLabel(previousLabel: SubtitleLabel, newLabel: SubtitleLabel): void {
    const { regionContainerId } = this.getRegion(previousLabel);

    this.subtitleRegionContainers[regionContainerId].removeLabel(previousLabel);
    this.subtitleRegionContainers[regionContainerId].addLabel(newLabel);
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

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'subtitle-region-container',
      },
      this.config,
    );
  }

  addLabel(labelToAdd: SubtitleLabel, overlaySize?: Size) {
    this.labelCount++;

    if (labelToAdd.vtt) {
      if (labelToAdd.vtt.region && overlaySize) {
        VttUtils.setVttRegionStyles(this, labelToAdd.vtt.region, overlaySize);
      }

      VttUtils.setVttCueBoxStyles(labelToAdd, overlaySize);
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

function isCea608SubtitleCue(cue: SubtitleCueEvent): boolean {
  return cue.position != null;
}

function awaitTransitionEnd(domElement: DOM) {
  const hasTransition = getComputedStyle(domElement.get(0)).transitionProperty !== 'none';

  if (!hasTransition) {
    return Promise.resolve();
  }

  return new Promise<void>(resolve => {
    const transitionHandler = () => {
      domElement.off('transitionend', transitionHandler);
      domElement.off('transitioncancel', transitionHandler);
      resolve();
    };
    domElement.on('transitionend', transitionHandler);
    domElement.on('transitioncancel', transitionHandler);
  });
}
