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
  private static readonly DEFAULT_CEA608_NUM_ROWS = 15;
  private static readonly DEFAULT_CEA608_NUM_COLUMNS = 32;

  private FONT_SIZE_FACTOR: number = 1;
  // The number of rows in a cea608 grid
  private CEA608_NUM_ROWS = SubtitleOverlay.DEFAULT_CEA608_NUM_ROWS;
  // The number of columns in a cea608 grid
  private CEA608_NUM_COLUMNS = SubtitleOverlay.DEFAULT_CEA608_NUM_COLUMNS;
  // The offset in percent for one column (which is also the width of a column)
  private CEA608_COLUMN_OFFSET = 100 / this.CEA608_NUM_COLUMNS;

  private cea608Enabled = false;

  constructor(config: ContainerConfig = {}) {
    super(config);

    this.recalculateCEAGrid();

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

    const clearInactiveCues = () => {
      const removedActiveCues = subtitleManager.clearInactiveCues(player.getCurrentTime());
      removedActiveCues.forEach(toRemove => {
        this.subtitleContainerManager.removeLabel(toRemove.label);
      });
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

  setFontSizeFactor(factor: number): void {
    // We only allow range from 50% to 200% as suggested by spec
    // https://www.ecfr.gov/current/title-47/part-79/section-79.103#p-79.103(c)(4)
    this.FONT_SIZE_FACTOR = Math.max(0.5, Math.min(2.0, factor));

    this.recalculateCEAGrid();
  }

  recalculateCEAGrid() {
    // Needs to get recalculated in case the font size will change also we need to floor this
    // to always align to the whole number represented in styles.
    this.CEA608_NUM_ROWS = Math.floor(SubtitleOverlay.DEFAULT_CEA608_NUM_ROWS / Math.max(this.FONT_SIZE_FACTOR, 1));
    this.CEA608_NUM_COLUMNS = Math.floor(SubtitleOverlay.DEFAULT_CEA608_NUM_COLUMNS / this.FONT_SIZE_FACTOR);
    this.CEA608_COLUMN_OFFSET = 100 / this.CEA608_NUM_COLUMNS;
  }

  detectCroppedSubtitleLabel(
    labelElement: HTMLElement,
  ): SubtitleCropDetectionResult {
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
    const cropDetection = this.detectCroppedSubtitleLabel(
      labelDomElement.get(0),
    );

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

  resolveRowNumber(row: number): number {
    // In case there is a font size factor and the row from event would overflow
    // we need to apply an offset so it gets rendered to visible area.
    if (this.FONT_SIZE_FACTOR > 1 && row > this.CEA608_NUM_ROWS) {
      const rowDelta = SubtitleOverlay.DEFAULT_CEA608_NUM_ROWS - this.CEA608_NUM_ROWS;
      return row - rowDelta;
    }

    return row;
  }

  generateLabel(event: SubtitleCueEvent): SubtitleLabel {
    // Sanitize cue data (must be done before the cue ID is generated in subtitleManager.cueEnter / update)
    let region = event.region;

    // Sometimes the positions are undefined, we assume them to be zero.
    // We need to keep track of the original row position in case of recalculation.
    const originalRowNumber = event.position?.row || 0;

    if (event.position) {
      event.position.row = this.resolveRowNumber(event.position.row) || 0;
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

  filterFontSizeOptions: ListItemFilter = (listItem) => {
    if (this.cea608Enabled && listItem.key !== null) {
      const percent = parseInt(listItem.key, 10);
      return !isNaN(percent) && percent <= 200;
    }

    return true
  };

  resolveFontSizeFactor(value: string): number {
    return parseInt(value) / 100;;
  }

  updateRegionRowPosition(r: SubtitleRegionContainer): void {
    const element = r.getDomElement().get()[0];
    const label = r.getComponents()[0];

    if (!element || !label) {
      return;
    }

    const rowClassList = element.classList;
    const originalRow = (label.getConfig() as SubtitleLabelConfig)?.originalRowPosition;
    const rowClassRegex = /subtitle-position-cea608-row-(\d+)/;

    const currentClass = Array.from(rowClassList).find(cls => rowClassRegex.test(cls));

    if (!currentClass) {
      return;
    }

    const match = rowClassRegex.exec(currentClass);
    const rowNumber = match ? parseInt(match[1], 10) : null;
    const newRowNum = this.resolveRowNumber(originalRow ?? rowNumber);
    const newClass = currentClass.replace(rowClassRegex, `subtitle-position-cea608-row-${newRowNum}`);

    rowClassList.replace(currentClass, newClass);
  }


  configureCea608Captions(player: PlayerAPI, uimanager: UIInstanceManager): void {
    // The calculated font size
    let fontSize = 0;
    // The required letter spacing spread the text characters evenly across the grid
    let fontLetterSpacing = 0;
    // Flag telling if a font size calculation is required of if the current values are valid
    let fontSizeCalculationRequired = true;
    // Flag telling if the CEA-608 mode is enabled
    this.cea608Enabled = false;


    const settingsManager = uimanager.getSubtitleSettingsManager();
    const fontSizeFactorSettings = this.resolveFontSizeFactor(settingsManager.fontSize.value);
    this.setFontSizeFactor(fontSizeFactorSettings);

    settingsManager.fontSize.onChanged.subscribe((_sender, property) => {
      if (property.isSet()) {
        // We need to convert from percent
        const factorValue = this.resolveFontSizeFactor(property.value);
        this.setFontSizeFactor(factorValue);
      } else {
        this.setFontSizeFactor(1);
      }
      updateCEA608FontSize();
    });

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

      const dummyLabelCharWidth = dummyLabel.getDomElement().width() * this.FONT_SIZE_FACTOR;
      const dummyLabelCharHeight = dummyLabel.getDomElement().height() * this.FONT_SIZE_FACTOR;
      const fontSizeRatio = (dummyLabelCharWidth / dummyLabelCharHeight);

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
      const overlayElement = this.getDomElement();
      const subtitleOverlayWidth = overlayElement.width() - 10;
      const subtitleOverlayHeight = overlayElement.height();

      // The size ratio of the letter grid
      const fontGridSizeRatio = (dummyLabelCharWidth * this.CEA608_NUM_COLUMNS) /
        (dummyLabelCharHeight * this.CEA608_NUM_ROWS);
      // The size ratio of the available space for the grid
      const subtitleOverlaySizeRatio = subtitleOverlayWidth / subtitleOverlayHeight;

      if (subtitleOverlaySizeRatio > fontGridSizeRatio) {
        // When the available space is wider than the text grid, the font size is simply
        // determined by the height of the available space.
        fontSize = subtitleOverlayHeight / this.CEA608_NUM_ROWS;

        // Calculate the additional letter spacing required to evenly spread the text across the grid's width
        const gridSlotWidth = subtitleOverlayWidth / this.CEA608_NUM_COLUMNS;
        const fontCharWidth = fontSize * fontSizeRatio;
        fontLetterSpacing = Math.max(gridSlotWidth - fontCharWidth, 0);
      } else {
        // When the available space is not wide enough, texts would vertically overlap if we take
        // the height as a base for the font size, so we need to limit the height. We do that
        // by determining the font size by the width of the available space.
        fontSize = subtitleOverlayWidth / this.CEA608_NUM_COLUMNS / fontSizeRatio;
        fontLetterSpacing = 0;
      }

      // After computing overlay dimensions:
      const newRowHeight = fontSize;

      // Update row position of regions
      const regions = this.getComponents();
      regions.forEach(r => {
        if (r instanceof SubtitleRegionContainer) {
          this.updateRegionRowPosition(r);
        }
      });

      // Update the CSS custom property on the overlay DOM element
      overlayElement.get().forEach((el) => {
        el.style.setProperty("--cea608-row-height", `${newRowHeight}px`);
      });

      // Update font-size of all active subtitle labels
      const updateLabel = (label: SubtitleLabel) => {
        const isLargerFontSize = this.FONT_SIZE_FACTOR > 1
        label.getDomElement().css({
          'font-size': `${fontSize}px`,
          'line-height': `${fontSize}px`,
          'letter-spacing': `${isLargerFontSize ? 0 : fontLetterSpacing}px`,
          'white-space': `${isLargerFontSize ? 'nowrap' : 'normal'}`,
          'left': isLargerFontSize && '0%',
        });

        label.regionStyle = `line-height: ${fontSize}px;`;
      }

      for (let label of this.getComponents()) {
        if (label instanceof SubtitleRegionContainer) {
          label.getComponents().forEach((l: SubtitleLabel) => {
            updateLabel(l);
          })
        }

        if (label instanceof SubtitleLabel) {
          updateLabel(label);
        }
      }
    };

    player.on(player.exports.PlayerEvent.PlayerResized, () => {
      if (this.cea608Enabled) {
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

      if (!this.cea608Enabled) {
        this.cea608Enabled = true;
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

      // We disable the grid and wrapping in case enlarged font size is used to prevent
      // line and characters overflows
      const isLargerFontSize = this.FONT_SIZE_FACTOR > 1
      label.getDomElement().css({
        'left': `${isLargerFontSize ? 0 : event.position.column * this.CEA608_COLUMN_OFFSET}%`,
        'font-size': `${fontSize}px`,
        'letter-spacing': `${isLargerFontSize ? 0 : fontLetterSpacing}px`,
        'white-space': `${isLargerFontSize ? 'nowrap' : 'normal'}`,
      });

      label.regionStyle = `line-height: ${fontSize}px;`;
    });

    const reset = () => {
      this.getDomElement().removeClass(this.prefixCss(SubtitleOverlay.CLASS_CEA_608));
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
    let id = ActiveSubtitleManager.calculateId(event);

    // Create array for id if it does not exist
    this.activeSubtitleCueMap[id] = this.activeSubtitleCueMap[id] || [];

    // Add cue
    this.activeSubtitleCueMap[id].push({ event, label });
    this.activeSubtitleCueCount++;
  }

  private popCueFromMap(event: SubtitleCueEvent): SubtitleLabel | undefined {
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
    let id = ActiveSubtitleManager.calculateId(event);
    let activeSubtitleCues = this.activeSubtitleCueMap[id];
    if (activeSubtitleCues && activeSubtitleCues.length > 0) {
      return activeSubtitleCues.map((cue) => cue.label);
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

  private getRegion(label: SubtitleLabel): { regionContainerId: string, regionName: string } {
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
      } else if (label.vtt && !label.vtt.region) {
        /**
         * If there is no region present to wrap the Cue Box, the Cue box becomes the
         * region itself. Therefore the positioning values have to come from the box.
         */
        regionContainer.getDomElement().css('position', 'static');
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

    this.config = this.mergeConfig(config, {
      cssClass: 'subtitle-region-container',
    }, this.config);
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
