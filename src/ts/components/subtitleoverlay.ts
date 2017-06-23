import {Container, ContainerConfig} from './container';
import {UIInstanceManager, UISubtitleConfig} from '../uimanager';
import SubtitleCueEvent = bitmovin.PlayerAPI.SubtitleCueEvent;
import {Label, LabelConfig} from './label';
import {ComponentConfig, Component} from './component';
import {ControlBar} from './controlbar';
import {ColorUtils, StorageUtils} from '../utils';
import {DOM} from '../dom';

export interface SubtitleOverlayConfig extends ContainerConfig {
  fontColor?: ColorUtils.Color;
  backgroundColor?: ColorUtils.Color;
  windowColor?: ColorUtils.Color;
  fontFamily?: string;
  fontStyle?: string;
  fontVariant?: string;
  characterEdge?: string;
  /**
   * Font size is defined by a base size
   * and a multiplicating coefficient depending
   * on user preferences
   **/
  fontCoefficient?: number;
  fontSize?: number;
}

/**
 * Overlays the player to display subtitles.
 */
export class SubtitleOverlay extends Container<SubtitleOverlayConfig> {

  public config: SubtitleOverlayConfig;

  private subtitleManager: ActiveSubtitleManager;
  private forceSubtitle: boolean = false;
  private forcedSubtitle: SubtitleLabel = new SubtitleLabel({text: 'example subtitle'});

  private static readonly CLASS_CONTROLBAR_VISIBLE = 'controlbar-visible';


  constructor(config: SubtitleOverlayConfig = {}) {
    super(config);

    this.config = this.mergeConfig( config, <SubtitleOverlayConfig>{
        cssClass: 'ui-subtitle-overlay',
        fontColor: ColorUtils.foreground,
        backgroundColor: ColorUtils.background,
        windowColor: ColorUtils.background,
        fontFamily: '',
        fontStyle: '',
        fontVariant: 'normal',
        characterEdge: '',
        fontCoefficient: 1,
        fontSize: 1.2,
      }, this.config);

    config = this.config;
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.updateSubtitleOverlayConfigFromUIconfig(uimanager.getConfig().subtitles);
    this.updateSubtitleOverlayConfigFromLocalStorage();
    // This css property isn't applied to the subtitle cue
    // and therefore shoud be applied now
    this.getDomElement().css('background', this.config.windowColor.toCSS());
    this.updateSubtitleLabelCss();

    let subtitleManager = new ActiveSubtitleManager();
    this.subtitleManager = subtitleManager;
    let config = <SubtitleOverlayConfig>this.config;

    player.addEventHandler(player.EVENT.ON_CUE_ENTER, (event: SubtitleCueEvent) => {
      let labelToAdd = subtitleManager.cueEnter(event);

      this.applyConfToDom(labelToAdd.getDomElement());

      if (this.forceSubtitle) {
        this.removeComponent(this.forcedSubtitle);
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
        if (!this.forceSubtitle) {
          this.hide();
        } else {
          this.addComponent(this.forcedSubtitle);
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
   * updateSubtitleOverlayConfig updates style for the subtitle overlay based on init config
   **/
  private updateSubtitleOverlayConfigFromUIconfig(subtitlesConfig: UISubtitleConfig): void {
    if (subtitlesConfig == null) {
      return;
    }
    if (subtitlesConfig.backgroundColor != null) {
      this.config.backgroundColor = ColorUtils.colorFromCss(subtitlesConfig.backgroundColor);
    }
    if (subtitlesConfig.fontColor != null) {
      this.config.fontColor = ColorUtils.colorFromCss(subtitlesConfig.fontColor);
    }
    if (subtitlesConfig.windowColor != null) {
      this.config.windowColor = ColorUtils.colorFromCss(subtitlesConfig.windowColor);
    }
    this.config.fontFamily = subtitlesConfig.fontFamily;
    this.config.fontVariant = subtitlesConfig.fontVariant;
    this.config.fontStyle = subtitlesConfig.fontStyle;
    this.config.fontCoefficient = subtitlesConfig.fontCoefficient;
    this.config.characterEdge = subtitlesConfig.characterEdge;
    this.config.characterEdge = subtitlesConfig.characterEdge;
  }

  /**
   * updateSubtitleOverlayConfig updates styles for the subtitle overlay based local storage values
   **/
  private updateSubtitleOverlayConfigFromLocalStorage(): void {
    if (StorageUtils.hasLocalStorage()) {
      let store = window.localStorage;
      let forcedSubtitleDom = this.forcedSubtitle.getDomElement();

      let fontColor = store.getItem('fontColor');
      if (fontColor != null) {
        this.config.fontColor = ColorUtils.colorFromCss(fontColor, ColorUtils.foreground);
      }
      let backgroundColor = store.getItem('backgroundColor');
      if (backgroundColor != null) {
        this.config.backgroundColor = ColorUtils.colorFromCss(backgroundColor, ColorUtils.background);
      }
      let windowColor = store.getItem('windowColor');
      if (windowColor != null) {
        this.config.windowColor = ColorUtils.colorFromCss(windowColor, ColorUtils.background);
      }
      let fontFamily = store.getItem('fontFamily');
      if (fontFamily != null) {
        this.config.fontFamily = fontFamily;
      }
      let fontStyle = store.getItem('fontStyle');
      if (fontStyle != null) {
        this.config.fontStyle = fontStyle;
      }
      let fontVariant = store.getItem('fontVariant');
      if (fontVariant != null) {
        this.config.fontVariant = fontVariant;
      }
      let characterEdge = store.getItem('characterEdge');
      if (characterEdge != null) {
        this.config.characterEdge = characterEdge;
      }
      let fontCoefficient = store.getItem('fontCoefficient');
      if (fontCoefficient != null) {
        this.config.fontCoefficient = Number(fontCoefficient);
      }
    }
  }

  private updateSubtitleLabelCss() {
    this.applyConfToDom(this.getDomElement().find('.bmpui-ui-subtitle-label'));
    this.applyConfToDom(this.forcedSubtitle.getDomElement());
  }

  enforceSubtitleLabel(): void {
    this.forceSubtitle = true;
    if (!this.subtitleManager.hasCues) {
      this.addComponent(this.forcedSubtitle);
      this.updateComponents();
      this.show();
    }
  }
  removeEnforcedSubtitleLabel(): void {
    this.forceSubtitle = false;
    this.removeComponent(this.forcedSubtitle);
    this.updateComponents();
  }
  // Methods used to define custom styling on subtitles labels
  setColor(color: string): void {
    let col = ColorUtils.colorFromCss(color);
    col.a = this.config.fontColor.a;
    this.config.fontColor = col;
    this.updateSubtitleLabelCss();
    this.setItem('fontColor', this.config.fontColor.toCSS());
  }
  setBackgroundColor(color: string): void {
    let backgroundColor = ColorUtils.colorFromCss(color);
    if (! this.config.backgroundColor.a || this.config.backgroundColor.a === 0) {
      // 25%  opacity at least
      backgroundColor.a = 0.25;
    } else {
      backgroundColor.a = this.config.backgroundColor.a;
    }
    this.config.backgroundColor = backgroundColor;
    this.updateSubtitleLabelCss();
    this.setItem('backgroundColor', this.config.backgroundColor.toCSS());
  }
  setWindowColor(color: string): void {
    let windowColor = ColorUtils.colorFromCss(color);
    if (! this.config.windowColor.a || this.config.windowColor.a === 0) {
      // 25%  opacity at least
      windowColor.a = 0.25;
    } else {
      windowColor.a = this.config.windowColor.a;
    }
    this.config.windowColor = windowColor;
    this.getDomElement().css('background', this.config.windowColor.toCSS());
    this.setItem('windowColor', this.config.windowColor.toCSS());
  }
  setFontOpacity(alpha: number): void {
    this.config.fontColor.a = alpha;
    this.updateSubtitleLabelCss();
    this.setItem('fontColor', this.config.fontColor.toCSS());
  }
  setBackgroundOpacity(alpha: number): void {
    this.config.backgroundColor.a = alpha;
    this.updateSubtitleLabelCss();
    this.setItem('backgroundColor', this.config.backgroundColor.toCSS());
  }
  setWindowOpacity(alpha: number): void {
    this.config.windowColor.a = alpha;
    this.getDomElement().css('background', this.config.windowColor.toCSS());
    this.setItem('windowColor', this.config.windowColor.toCSS());
  }
  setFontFamily(fontFamily: string): void {
    this.config.fontFamily = fontFamily;
    this.setItem('fontFamily', this.config.fontFamily);
    this.updateSubtitleLabelCss();
  }
  setFontStyle(fontStyle: string): void {
    this.config.fontStyle = fontStyle;
    this.setItem('fontStyle', this.config.fontStyle);
    this.updateSubtitleLabelCss();
  }
  setFontVariant(fontVariant: string): void {
    this.config.fontVariant = fontVariant;
    this.setItem('fontVariant', this.config.fontVariant);
    this.updateSubtitleLabelCss();
  }
  /**
   * A helper method to avoid updating the CSS label 3 times in a row
   * since family, style and variant are normally updated together
   **/
  setFont(fontFamily: string, fontStyle: string, fontVariant: string): void {
    this.config.fontFamily = fontFamily;
    this.setItem('fontFamily', this.config.fontFamily);
    this.config.fontStyle = fontStyle;
    this.setItem('fontStyle', this.config.fontStyle);
    this.config.fontVariant = fontVariant;
    this.setItem('fontVariant', this.config.fontVariant);
    this.updateSubtitleLabelCss();
  }
  setCharacterEdge(characterEdge: string): void {
    this.config.characterEdge = characterEdge;
    this.updateSubtitleLabelCss();
    this.setItem('characterEdge', this.config.characterEdge);
  }
  setFontSize(coefficient: number): void {
    this.config.fontCoefficient = coefficient;
    this.updateSubtitleLabelCss();
    this.setItem('fontCoefficient', this.config.fontCoefficient.toString());
  }

  private applyConfToDom(dom: DOM): void {
    dom.css('color', this.config.fontColor.toCSS());
    dom.css('background', this.config.backgroundColor.toCSS());
    dom.css('font-variant', this.config.fontVariant);
    dom.css('font-family', this.config.fontFamily);
    dom.css('font-style', this.config.fontStyle);
    dom.css('text-shadow', this.config.characterEdge);
    dom.css('font-size', `${this.config.fontSize * this.config.fontCoefficient}em`);
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
