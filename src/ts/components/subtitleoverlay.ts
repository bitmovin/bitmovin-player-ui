import {Container, ContainerConfig} from './container';
import {UIInstanceManager} from '../uimanager';
import SubtitleCueEvent = bitmovin.PlayerAPI.SubtitleCueEvent;
import {Label, LabelConfig} from './label';
import {ComponentConfig, Component} from './component';
import {ControlBar} from './controlbar';

/**
 * Overlays the player to display subtitles.
 */
export class SubtitleOverlay extends Container<ContainerConfig> {

  private subtitleManager: ActiveSubtitleManager;
  private previewSubtitleActive: boolean;
  private previewSubtitle: SubtitleLabel;

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
    this.previewSubtitle = new SubtitleLabel({ text: 'example subtitle' });

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-subtitle-overlay',
    }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let subtitleManager = new ActiveSubtitleManager();
    this.subtitleManager = subtitleManager;

    player.addEventHandler(player.EVENT.ON_CUE_ENTER, (event: SubtitleCueEvent) => {
      // Sanitize cue data (must be done before the cue ID is generated in subtitleManager.cueEnter)
      if (event.position) {
        // Sometimes the positions are undefined, we assume them to be zero
        event.position.row = event.position.row || 0;
        event.position.column = event.position.column || 0;
      }

      let labelToAdd = subtitleManager.cueEnter(event);

      if (this.previewSubtitleActive) {
        this.removeComponent(this.previewSubtitle);
      }
      this.addComponent(labelToAdd);
      this.updateComponents();

      this.show();
    });
    player.addEventHandler(player.EVENT.ON_CUE_EXIT, (event: SubtitleCueEvent) => {
      let labelToRemove = subtitleManager.cueExit(event);

      if (labelToRemove) {
        this.removeComponent(labelToRemove);
        this.updateComponents();
      }

      if (!subtitleManager.hasCues) {
        if (!this.previewSubtitleActive) {
          this.hide();
        } else {
          this.addComponent(this.previewSubtitle);
          this.updateComponents();
        }
      }
    });

    let subtitleClearHandler = () => {
      this.hide();
      subtitleManager.clear();
      this.removeComponents();
      this.updateComponents();
    };

    player.addEventHandler(player.EVENT.ON_AUDIO_CHANGED, subtitleClearHandler);
    player.addEventHandler(player.EVENT.ON_SUBTITLE_CHANGED, subtitleClearHandler);
    player.addEventHandler(player.EVENT.ON_SEEK, subtitleClearHandler);
    player.addEventHandler(player.EVENT.ON_TIME_SHIFT, subtitleClearHandler);
    player.addEventHandler(player.EVENT.ON_PLAYBACK_FINISHED, subtitleClearHandler);
    player.addEventHandler(player.EVENT.ON_SOURCE_UNLOADED, subtitleClearHandler);

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

  configureCea608Captions(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
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

      // The size ratio of the letter grid
      const fontGridSizeRatio = (dummyLabelCharWidth * SubtitleOverlay.CEA608_NUM_COLUMNS) /
        (dummyLabelCharHeight * SubtitleOverlay.CEA608_NUM_ROWS);
      // The size ratio of the available space for the grid
      const subtitleOverlaySizeRatio = this.getDomElement().width() / this.getDomElement().height();

      if (subtitleOverlaySizeRatio > fontGridSizeRatio) {
        // When the available space is wider than the text grid, the font size is simply
        // determined by the height of the available space.
        fontSize = this.getDomElement().height() / SubtitleOverlay.CEA608_NUM_ROWS;

        // Calculate the additional letter spacing required to evenly spread the text across the grid's width
        const gridSlotWidth = this.getDomElement().width() / SubtitleOverlay.CEA608_NUM_COLUMNS;
        const fontCharWidth = fontSize * fontSizeRatio;
        fontLetterSpacing = gridSlotWidth - fontCharWidth;
      } else {
        // When the available space is not wide enough, texts would vertically overlap if we take
        // the height as a base for the font size, so we need to limit the height. We do that
        // by determining the font size by the width of the available space.
        fontSize = this.getDomElement().width() / SubtitleOverlay.CEA608_NUM_COLUMNS / fontSizeRatio;
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

    player.addEventHandler(player.EVENT.ON_PLAYER_RESIZE, () => {
      if (enabled) {
        updateCEA608FontSize();
      } else {
        fontSizeCalculationRequired = true;
      }
    });

    player.addEventHandler(player.EVENT.ON_CUE_ENTER, (event: SubtitleCueEvent) => {
      const isCEA608 = event.position != null;
      if (!isCEA608) {
        // Skip all non-CEA608 cues
        return;
      }

      const labels = this.subtitleManager.getCues(event);

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
      for (let label of labels) {
        label.getDomElement().css({
          'left': `${event.position.column * SubtitleOverlay.CEA608_COLUMN_OFFSET}%`,
          'top': `${event.position.row * SubtitleOverlay.CEA608_ROW_OFFSET}%`,
          'font-size': `${fontSize}px`,
          'letter-spacing': `${fontLetterSpacing}px`,
        });
      }
    });

    const reset = () => {
      this.getDomElement().removeClass(this.prefixCss(SubtitleOverlay.CLASS_CEA_608));
      enabled = false;
    };

    player.addEventHandler(player.EVENT.ON_CUE_EXIT, () => {
      if (!this.subtitleManager.hasCues) {
        // Disable CEA-608 mode when all subtitles are gone (to allow correct formatting and
        // display of other types of subtitles, e.g. the formatting preview subtitle)
        reset();
      }
    });

    player.addEventHandler(player.EVENT.ON_SOURCE_UNLOADED, reset);
    player.addEventHandler(player.EVENT.ON_SUBTITLE_CHANGED, reset);
  }

  enablePreviewSubtitleLabel(): void {
    this.previewSubtitleActive = true;
    if (!this.subtitleManager.hasCues) {
      this.addComponent(this.previewSubtitle);
      this.updateComponents();
      this.show();
    }
  }

  removePreviewSubtitleLabel(): void {
    this.previewSubtitleActive = false;
    this.removeComponent(this.previewSubtitle);
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

class SubtitleLabel extends Label<LabelConfig> {

  constructor(config: LabelConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-subtitle-label',
    }, this.config);
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
   * Calculates a unique ID for a subtitle cue, which is needed to associate an ON_CUE_ENTER with its ON_CUE_EXIT
   * event so we can remove the correct subtitle in ON_CUE_EXIT when multiple subtitles are active at the same time.
   * The start time plus the text should make a unique identifier, and in the only case where a collision
   * can happen, two similar texts will be displayed at a similar time and a similar position (or without position).
   * The start time should always be known, because it is required to schedule the ON_CUE_ENTER event. The end time
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
      // Prefer the HTML subtitle text if set, else use the plain text
      text: event.html || event.text,
    });

    // Create array for id if it does not exist
    this.activeSubtitleCueMap[id] = this.activeSubtitleCueMap[id] || [];

    // Add cue
    this.activeSubtitleCueMap[id].push({ event, label });
    this.activeSubtitleCueCount++;

    return label;
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
       * cue end time (which can change between ON_CUE_ENTER and ON_CUE_EXIT IN ON_CUE_UPDATE) and use it as an
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
