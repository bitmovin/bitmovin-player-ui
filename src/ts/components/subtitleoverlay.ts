import {Container, ContainerConfig} from './container';
import {UIInstanceManager} from '../uimanager';
import SubtitleCueEvent = bitmovin.PlayerAPI.SubtitleCueEvent;
import {Label, LabelConfig} from './label';
import {ComponentConfig, Component} from './component';
import {ControlBar} from './controlbar';
import {DOM} from '../dom';

/**
 * Overlays the player to display subtitles.
 */
export class SubtitleOverlay extends Container<ContainerConfig> {

  private subtitleManager: ActiveSubtitleManager;
  private previewSubtitleActive: boolean;
  private previewSubtitle: SubtitleLabel;
  private cea608lineHeight: number;
  private isCEA608: boolean = false;

  private static readonly CLASS_CONTROLBAR_VISIBLE = 'controlbar-visible';
  private static readonly CLASS_CEA_608 = 'cea608';
  // The number of columns in a cea608 line
  private static readonly CEA608_NUM_COLUMNS = 32;
  // 80% is the width of the space where CEA608 captions are displayed
  private static readonly CEA608_WIDTH = 0.8;
  // The actual font width is 1 + 0.11 letter-spacing
  private static readonly CEA608_FONT_SPACING = 1.11;
  // 6.25 = 100/16 because there's 15 possible lines
  private static readonly CEA608_LINE_COEF = 6.25;
  // To avoid having the font too big and overlap, while still have the proper width,
  // the font must be sized down, the width is then compensated by letter-spacing
  private static readonly CEA608_LINE_TO_FONT_SIZE = 0.9;

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
    let ratio = 1;
    let updateCEA608FontSize = () => {
      let dummyText = 'aaaaaaaaaa';
      let label = new SubtitleLabel({
        // One letter label used to calculate the height width ratio of the font
        // Works because we are using a monospace font for cea 608
        // Using a longer string increases precision due to width being an integer
        text: dummyText,
      });
      let domElement = label.getDomElement();
      domElement.css({
        'color': 'rgba(0, 0, 0, 0)',
        'font-size': '30px',
        'line-height': '30px',
        'top': '0',
        'left': '0',
      });
      this.addComponent(label);
      this.updateComponents();
      this.show();

      let width = domElement.width() / dummyText.length;
      let height = domElement.height();

      this.removeComponent(label);
      this.updateComponents();
      if (!this.subtitleManager.hasCues) {
        this.hide();
      }

      ratio = height / width;
      this.cea608lineHeight = (new DOM(player.getFigure()).width()) * (SubtitleOverlay.CEA608_WIDTH / SubtitleOverlay.CEA608_NUM_COLUMNS) * ratio * SubtitleOverlay.CEA608_FONT_SPACING;

      if (this.isCEA608) {
        for (let label of this.getComponents()) {
          if (label instanceof SubtitleLabel) {
            // Only element with left property are cea-608
            let domElement = label.getDomElement();
            domElement.css({
              'font-size': `${SubtitleOverlay.CEA608_LINE_TO_FONT_SIZE * this.cea608lineHeight}px`,
            });
          }
        }
      }
    };
    player.addEventHandler(player.EVENT.ON_PLAYER_RESIZE, updateCEA608FontSize);

    player.addEventHandler(player.EVENT.ON_CUE_ENTER, (event: SubtitleCueEvent) => {
      let isCEA608 = event.position != null;
      if (!isCEA608) {
        // Skip all non-CEA608 cues
        return;
      }

      let labels = this.subtitleManager.getCues(event);

      if (!this.isCEA608) {
        this.isCEA608 = true;
        this.getDomElement().addClass(this.prefixCss(SubtitleOverlay.CLASS_CEA_608));
        updateCEA608FontSize();
      }
      for (let label of labels) {
        label.getDomElement().css({
          'left': `${event.position.column / ratio}em`,
          'top': `${event.position.row * SubtitleOverlay.CEA608_LINE_COEF}%`,
          'font-size': `${SubtitleOverlay.CEA608_LINE_TO_FONT_SIZE * this.cea608lineHeight}px`,
        });
      }
    });

    let reset = () => {
      this.getDomElement().removeClass(this.prefixCss(SubtitleOverlay.CLASS_CEA_608));
      this.isCEA608 = false;
    };
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
