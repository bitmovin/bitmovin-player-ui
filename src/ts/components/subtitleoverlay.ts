import {Container, ContainerConfig} from './container';
import {UIInstanceManager, UISubtitleConfig} from '../uimanager';
import SubtitleCueEvent = bitmovin.PlayerAPI.SubtitleCueEvent;
import {Label, LabelConfig} from './label';
import {ComponentConfig, Component} from './component';
import {ControlBar} from './controlbar';
import {ColorUtils, StorageUtils} from '../utils';
import {DOM} from '../dom';

export interface SubtitleOverlayConfig extends ContainerConfig {
  subtitleConfig?: UISubtitleConfig;
}

/**
 * Overlays the player to display subtitles.
 */
export class SubtitleOverlay extends Container<SubtitleOverlayConfig> {

  public config: SubtitleOverlayConfig;

  private subtitleManager: ActiveSubtitleManager;
  private previewSubtitleActive: boolean = false;
  private previewSubtitle: SubtitleLabel = new SubtitleLabel({text: 'example subtitle'});

  private static readonly CLASS_CONTROLBAR_VISIBLE = 'controlbar-visible';

  private fontColor?: ColorUtils.Color;
  private backgroundColor?: ColorUtils.Color;
  private windowColor?: ColorUtils.Color;
  private fontFamily?: string;
  private fontStyle?: string;
  private fontVariant?: string;
  private characterEdge?: string;
  /**
   * Font size is defined by a base size
   * and a multiplicating coefficient depending
   * on user preferences
   **/
  private fontCoefficient?: number;
  private fontSize?: number;

  constructor(config: SubtitleOverlayConfig = {}) {
    super(config);

    this.config = this.mergeConfig( config, {
        cssClass: 'ui-subtitle-overlay',
      }, this.config);

    config = this.config;
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = <SubtitleOverlayConfig>this.config;

    this.fontColor = ColorUtils.foreground;
    this.backgroundColor = ColorUtils.background;
    this.windowColor = ColorUtils.background;
    this.fontFamily = '';
    this.fontStyle = '';
    this.fontVariant = 'normal';
    this.characterEdge = '';
    this.fontCoefficient = 1;
    this.fontSize = 1.2;

    // Update the config first loading info from UImanager config
    // then overwrites it with config given to the component if it applies
    // finally loads user preferences from local storage
    this.updateSubtitleOverlayFromUIconfig(config.subtitleConfig);
    this.updateSubtitleOverlayFromUIconfig(uimanager.getConfig().subtitles);
    this.updateSubtitleOverlayFromLocalStorage();

    // This css property isn't applied to the subtitle cue
    // and therefore shoud be applied now
    this.getDomElement().css('background', this.windowColor.toCSS());
    this.updateSubtitleLabelCss();

    let subtitleManager = new ActiveSubtitleManager();
    this.subtitleManager = subtitleManager;

    player.addEventHandler(player.EVENT.ON_CUE_ENTER, (event: SubtitleCueEvent) => {
      let labelToAdd = subtitleManager.cueEnter(event);

      this.applyConfToDom(labelToAdd.getDomElement());

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

    // Init
    subtitleClearHandler();
  }

  /**
   * Updates the setting used to display subtitles based on config information
   **/
  private updateSubtitleOverlayFromUIconfig(subtitlesConfig: UISubtitleConfig): void {
    if (subtitlesConfig == null) {
      return;
    }
    if (subtitlesConfig.backgroundColor != null) {
      this.backgroundColor = ColorUtils.colorFromCss(subtitlesConfig.backgroundColor);
    }
    if (subtitlesConfig.fontColor != null) {
      this.fontColor = ColorUtils.colorFromCss(subtitlesConfig.fontColor);
    }
    if (subtitlesConfig.windowColor != null) {
      this.windowColor = ColorUtils.colorFromCss(subtitlesConfig.windowColor);
    }
    if (this.fontFamily != null) {
      this.fontFamily = subtitlesConfig.fontFamily;
    }
    if (this.fontVariant != null) {
      this.fontVariant = subtitlesConfig.fontVariant;
    }
    if (this.fontStyle != null) {
      this.fontStyle = subtitlesConfig.fontStyle;
    }
    if (this.fontCoefficient != null) {
      this.fontCoefficient = subtitlesConfig.fontCoefficient;
    }
    if (this.characterEdge != null) {
      this.characterEdge = subtitlesConfig.characterEdge;
    }
    if (this.characterEdge != null) {
      this.characterEdge = subtitlesConfig.characterEdge;
    }
  }

  /**
   *  update the settings used to diplay subtitles based on local storage values
   **/
  private updateSubtitleOverlayFromLocalStorage(): void {
    if (StorageUtils.hasLocalStorage()) {
      let store = window.localStorage;

      let fontColor = store.getItem('fontColor');
      if (fontColor != null) {
        this.fontColor = ColorUtils.colorFromCss(fontColor, ColorUtils.foreground);
      }
      let backgroundColor = store.getItem('backgroundColor');
      if (backgroundColor != null) {
        this.backgroundColor = ColorUtils.colorFromCss(backgroundColor, ColorUtils.background);
      }
      let windowColor = store.getItem('windowColor');
      if (windowColor != null) {
        this.windowColor = ColorUtils.colorFromCss(windowColor, ColorUtils.background);
      }
      let fontFamily = store.getItem('fontFamily');
      if (fontFamily != null) {
        this.fontFamily = fontFamily;
      }
      let fontStyle = store.getItem('fontStyle');
      if (fontStyle != null) {
        this.fontStyle = fontStyle;
      }
      let fontVariant = store.getItem('fontVariant');
      if (fontVariant != null) {
        this.fontVariant = fontVariant;
      }
      let characterEdge = store.getItem('characterEdge');
      if (characterEdge != null) {
        this.characterEdge = characterEdge;
      }
      let fontCoefficient = store.getItem('fontCoefficient');
      if (fontCoefficient != null) {
        this.fontCoefficient = Number(fontCoefficient);
      }
    }
  }

  private updateSubtitleLabelCss(): void {
    this.applyConfToDom(this.getDomElement().find('.bmpui-ui-subtitle-label'));
    this.applyConfToDom(this.previewSubtitle.getDomElement());
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

  // Methods used to define custom styling on subtitles labels
  setColor(color: string): void {
    let col = ColorUtils.colorFromCss(color);
    col.a = this.fontColor.a;
    this.fontColor = col;
    this.updateSubtitleLabelCss();
    this.setItem('fontColor', this.fontColor.toCSS());
  }

  setBackgroundColor(color: string): void {
    let backgroundColor = ColorUtils.colorFromCss(color);
    if (! this.backgroundColor.a || this.backgroundColor.a === 0) {
      // 25%  opacity at least
      backgroundColor.a = 0.25;
    } else {
      backgroundColor.a = this.backgroundColor.a;
    }
    this.backgroundColor = backgroundColor;
    this.updateSubtitleLabelCss();
    this.setItem('backgroundColor', this.backgroundColor.toCSS());
  }

  setWindowColor(color: string): void {
    let windowColor = ColorUtils.colorFromCss(color);
    if (! this.windowColor.a || this.windowColor.a === 0) {
      // 25%  opacity at least
      windowColor.a = 0.25;
    } else {
      windowColor.a = this.windowColor.a;
    }
    this.windowColor = windowColor;
    this.getDomElement().css('background', this.windowColor.toCSS());
    this.setItem('windowColor', this.windowColor.toCSS());
  }

  setFontOpacity(alpha: number): void {
    this.fontColor.a = alpha;
    this.updateSubtitleLabelCss();
    this.setItem('fontColor', this.fontColor.toCSS());
  }

  setBackgroundOpacity(alpha: number): void {
    this.backgroundColor.a = alpha;
    this.updateSubtitleLabelCss();
    this.setItem('backgroundColor', this.backgroundColor.toCSS());
  }

  setWindowOpacity(alpha: number): void {
    this.windowColor.a = alpha;
    this.getDomElement().css('background', this.windowColor.toCSS());
    this.setItem('windowColor', this.windowColor.toCSS());
  }

  setFontFamily(fontFamily: string): void {
    this.fontFamily = fontFamily;
    this.setItem('fontFamily', this.fontFamily);
    this.updateSubtitleLabelCss();
  }

  setFontStyle(fontStyle: string): void {
    this.fontStyle = fontStyle;
    this.setItem('fontStyle', this.fontStyle);
    this.updateSubtitleLabelCss();
  }

  setFontVariant(fontVariant: string): void {
    this.fontVariant = fontVariant;
    this.setItem('fontVariant', this.fontVariant);
    this.updateSubtitleLabelCss();
  }

  /**
   * A helper method to avoid updating the CSS label 3 times in a row
   * since family, style and variant are normally updated together
   **/
  setFont(fontFamily: string, fontStyle: string, fontVariant: string): void {
    this.fontFamily = fontFamily;
    this.setItem('fontFamily', this.fontFamily);
    this.fontStyle = fontStyle;
    this.setItem('fontStyle', this.fontStyle);
    this.fontVariant = fontVariant;
    this.setItem('fontVariant', this.fontVariant);
    this.updateSubtitleLabelCss();
  }

  setCharacterEdge(characterEdge: string): void {
    this.characterEdge = characterEdge;
    this.updateSubtitleLabelCss();
    this.setItem('characterEdge', this.characterEdge);
  }

  setFontSize(coefficient: number): void {
    this.fontCoefficient = coefficient;
    this.updateSubtitleLabelCss();
    this.setItem('fontCoefficient', this.fontCoefficient.toString());
  }

  private applyConfToDom(dom: DOM): void {
    dom.css('color', this.fontColor.toCSS());
    dom.css('background', this.backgroundColor.toCSS());
    dom.css('font-variant', this.fontVariant);
    dom.css('font-family', this.fontFamily);
    dom.css('font-style', this.fontStyle);
    dom.css('text-shadow', this.characterEdge);
    dom.css('font-size', `${this.fontSize * this.fontCoefficient}em`);
  }

  private setItem(item: string, value: string): void {
    if (StorageUtils.hasLocalStorage()) {
      window.localStorage.setItem(item, value);
    }
  }
}

interface ActiveSubtitleCue {
  event: SubtitleCueEvent;
  label: SubtitleLabel;
}

interface ActiveSubtitleCueMap {
  [id: string]: ActiveSubtitleCue;
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

  constructor() {
    this.activeSubtitleCueMap = {};
  }

  /**
   * Calculates a unique ID for a subtitle cue, which is needed to associate an ON_CUE_ENTER with its ON_CUE_EXIT
   * event so we can remove the correct subtitle in ON_CUE_EXIT when multiple subtitles are active at the same time.
   * The start time plus the text should make a unique identifier, and in the only case where a collision
   * can happen, two similar texts will displayed at a similar time so it does not matter which one we delete.
   * The start time should always be known, because it is required to schedule the ON_CUE_ENTER event. The end time
   * must not necessarily be known and therefore cannot be used for the ID.
   * @param event
   * @return {string}
   */
  private static calculateId(event: SubtitleCueEvent): string {
    return event.start + event.text;
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

    this.activeSubtitleCueMap[id] = { event, label };

    return label;
  }

  /**
   * Removes the subtitle cue from the manager and returns the label that should be removed from the subtitle overlay,
   * or null if there is no associated label existing (e.g. because all labels have been {@link #clear cleared}.
   * @param event
   * @return {SubtitleLabel|null}
   */
  cueExit(event: SubtitleCueEvent): SubtitleLabel {
    let id = ActiveSubtitleManager.calculateId(event);
    let activeSubtitleCue = this.activeSubtitleCueMap[id];

    if (activeSubtitleCue) {
      delete this.activeSubtitleCueMap[id];
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
    return Object.keys(this.activeSubtitleCueMap).length;
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
  }
}
