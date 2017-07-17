import {Container, ContainerConfig} from './container';
import {UIInstanceManager, UISubtitleConfig} from '../uimanager';
import SubtitleCueEvent = bitmovin.PlayerAPI.SubtitleCueEvent;
import {Label, LabelConfig} from './label';
import {ComponentConfig, Component} from './component';
import {ControlBar} from './controlbar';
import {DOM} from '../dom';
import {ColorUtils} from '../colorutils';
import {StorageUtils} from '../storageutils';

export interface SubtitleOverlayConfig extends ContainerConfig {
  subtitleConfig?: UISubtitleConfig;
}

interface SubtitleStyleSetting {
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
   */
  fontCoefficient?: number;
  fontSize?: number;
}

/**
 * Overlays the player to display subtitles.
 */
export class SubtitleOverlay extends Container<SubtitleOverlayConfig> {

  public config: SubtitleOverlayConfig;

  private subtitleManager: ActiveSubtitleManager;
  private previewSubtitleActive: boolean;
  private previewSubtitle: SubtitleLabel;

  private static readonly CLASS_CONTROLBAR_VISIBLE = 'controlbar-visible';

  private subtitleStyleSetting: SubtitleStyleSetting;

  constructor(config: SubtitleOverlayConfig = {}) {
    super(config);

    this.previewSubtitleActive = false;
    this.previewSubtitle = new SubtitleLabel({text: 'example subtitle'});

    this.config = this.mergeConfig( config, {
        cssClass: 'ui-subtitle-overlay',
      }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = <SubtitleOverlayConfig>this.config;

    this.subtitleStyleSetting = {
      fontColor: ColorUtils.foreground,
      backgroundColor: ColorUtils.background,
      windowColor: ColorUtils.background,
      fontFamily: '',
      fontStyle: '',
      fontVariant: 'normal',
      characterEdge: '',
      fontCoefficient: 1,
      fontSize: 1.2,
    };

    // Update the config first loading info from UImanager config
    // then overwrites it with config given to the component if it applies
    // finally loads user preferences from local storage
    this.updateSubtitleOverlayFromUIConfig(config.subtitleConfig);
    this.updateSubtitleOverlayFromUIConfig(uimanager.getConfig().subtitles);
    this.updateSubtitleOverlayFromLocalStorage();

    // This css property isn't applied to the subtitle cue
    // and therefore shoud be applied now
    this.getDomElement().css('background', this.subtitleStyleSetting.windowColor.toCSS());
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

  private configureSubtitleStyle(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    let config = <SubtitleOverlayConfig>this.config;

    // Update the config first loading info from UImanager config
    // then overwrites it with config given to the component if it applies
    // finally loads user preferences from local storage
    this.updateSubtitleOverlayFromUIConfig(config.subtitleConfig);
    this.updateSubtitleOverlayFromUIConfig(uimanager.getConfig().subtitles);
    this.updateSubtitleOverlayFromLocalStorage();

    // This css property isn't applied to the subtitle cue
    // and therefore should be applied now
    this.getDomElement().css('background', this.subtitleStyleSetting.windowColor.toCSS());
    this.updateSubtitleLabelCss();
  }

  /**
   * Updates the setting used to display subtitles based on config information
   */
  private updateSubtitleOverlayFromUIConfig(subtitlesConfig: UISubtitleConfig): void {
    if (subtitlesConfig == null) {
      return;
    }
    if (subtitlesConfig.backgroundColor != null) {
      this.subtitleStyleSetting.backgroundColor = ColorUtils.colorFromCss(subtitlesConfig.backgroundColor);
    }
    if (subtitlesConfig.fontColor != null) {
      this.subtitleStyleSetting.fontColor = ColorUtils.colorFromCss(subtitlesConfig.fontColor);
    }
    if (subtitlesConfig.windowColor != null) {
      this.subtitleStyleSetting.windowColor = ColorUtils.colorFromCss(subtitlesConfig.windowColor);
    }
    if (subtitlesConfig.fontFamily != null) {
      this.subtitleStyleSetting.fontFamily = subtitlesConfig.fontFamily;
    }
    if (subtitlesConfig.fontVariant != null) {
      this.subtitleStyleSetting.fontVariant = subtitlesConfig.fontVariant;
    }
    if (subtitlesConfig.fontStyle != null) {
      this.subtitleStyleSetting.fontStyle = subtitlesConfig.fontStyle;
    }
    if (subtitlesConfig.fontCoefficient != null) {
      this.subtitleStyleSetting.fontCoefficient = subtitlesConfig.fontCoefficient;
    }
    if (subtitlesConfig.characterEdge != null) {
      this.subtitleStyleSetting.characterEdge = subtitlesConfig.characterEdge;
    }
  }

  /**
   * Updates the settings used to display subtitles based on local storage values
   */
  private updateSubtitleOverlayFromLocalStorage(): void {
    let fontColor = StorageUtils.getItem('fontColor');
    if (fontColor != null) {
      this.subtitleStyleSetting.fontColor = ColorUtils.colorFromCss(fontColor, ColorUtils.foreground);
    }
    let backgroundColor = StorageUtils.getItem('backgroundColor');
    if (backgroundColor != null) {
      this.subtitleStyleSetting.backgroundColor = ColorUtils.colorFromCss(backgroundColor, ColorUtils.background);
    }
    let windowColor = StorageUtils.getItem('windowColor');
    if (windowColor != null) {
      this.subtitleStyleSetting.windowColor = ColorUtils.colorFromCss(windowColor, ColorUtils.background);
    }
    let fontFamily = StorageUtils.getItem('fontFamily');
    if (fontFamily != null) {
      this.subtitleStyleSetting.fontFamily = fontFamily;
    }
    let fontStyle = StorageUtils.getItem('fontStyle');
    if (fontStyle != null) {
      this.subtitleStyleSetting.fontStyle = fontStyle;
    }
    let fontVariant = StorageUtils.getItem('fontVariant');
    if (fontVariant != null) {
      this.subtitleStyleSetting.fontVariant = fontVariant;
    }
    let characterEdge = StorageUtils.getItem('characterEdge');
    if (characterEdge != null) {
      this.subtitleStyleSetting.characterEdge = characterEdge;
    }
    let fontCoefficient = StorageUtils.getItem('fontCoefficient');
    if (fontCoefficient != null) {
      this.subtitleStyleSetting.fontCoefficient = Number(fontCoefficient);
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
    col.a = this.subtitleStyleSetting.fontColor.a;
    this.subtitleStyleSetting.fontColor = col;
    this.updateSubtitleLabelCss();
    StorageUtils.setItem('fontColor', this.subtitleStyleSetting.fontColor.toCSS());
  }

  setBackgroundColor(color: string): void {
    let backgroundColor = ColorUtils.colorFromCss(color);
    backgroundColor.a = this.subtitleStyleSetting.backgroundColor.a;
    this.subtitleStyleSetting.backgroundColor = backgroundColor;
    this.updateSubtitleLabelCss();
    StorageUtils.setItem('backgroundColor', this.subtitleStyleSetting.backgroundColor.toCSS());
  }

  setWindowColor(color: string): void {
    let windowColor = ColorUtils.colorFromCss(color);
    windowColor.a = this.subtitleStyleSetting.windowColor.a;
    this.subtitleStyleSetting.windowColor = windowColor;
    this.getDomElement().css('background', this.subtitleStyleSetting.windowColor.toCSS());
    StorageUtils.setItem('windowColor', this.subtitleStyleSetting.windowColor.toCSS());
  }

  setFontOpacity(alpha: number): void {
    this.subtitleStyleSetting.fontColor.a = alpha;
    this.updateSubtitleLabelCss();
    StorageUtils.setItem('fontColor', this.subtitleStyleSetting.fontColor.toCSS());
  }

  setBackgroundOpacity(alpha: number): void {
    this.subtitleStyleSetting.backgroundColor.a = alpha;
    this.updateSubtitleLabelCss();
    StorageUtils.setItem('backgroundColor', this.subtitleStyleSetting.backgroundColor.toCSS());
  }

  setWindowOpacity(alpha: number): void {
    this.subtitleStyleSetting.windowColor.a = alpha;
    this.getDomElement().css('background', this.subtitleStyleSetting.windowColor.toCSS());
    StorageUtils.setItem('windowColor', this.subtitleStyleSetting.windowColor.toCSS());
  }

  setFontFamily(fontFamily: string): void {
    this.subtitleStyleSetting.fontFamily = fontFamily;
    StorageUtils.setItem('fontFamily', this.subtitleStyleSetting.fontFamily);
    this.updateSubtitleLabelCss();
  }

  setFontStyle(fontStyle: string): void {
    this.subtitleStyleSetting.fontStyle = fontStyle;
    StorageUtils.setItem('fontStyle', this.subtitleStyleSetting.fontStyle);
    this.updateSubtitleLabelCss();
  }

  setFontVariant(fontVariant: string): void {
    this.subtitleStyleSetting.fontVariant = fontVariant;
    StorageUtils.setItem('fontVariant', this.subtitleStyleSetting.fontVariant);
    this.updateSubtitleLabelCss();
  }

  /**
   * A helper method to avoid updating the CSS label 3 times in a row
   * since family, style and variant are normally updated together
   */
  setFont(fontFamily: string, fontStyle: string, fontVariant: string): void {
    this.subtitleStyleSetting.fontFamily = fontFamily;
    StorageUtils.setItem('fontFamily', this.subtitleStyleSetting.fontFamily);
    this.subtitleStyleSetting.fontStyle = fontStyle;
    StorageUtils.setItem('fontStyle', this.subtitleStyleSetting.fontStyle);
    this.subtitleStyleSetting.fontVariant = fontVariant;
    StorageUtils.setItem('fontVariant', this.subtitleStyleSetting.fontVariant);
    this.updateSubtitleLabelCss();
  }

  setCharacterEdge(characterEdge: string): void {
    this.subtitleStyleSetting.characterEdge = characterEdge;
    this.updateSubtitleLabelCss();
    StorageUtils.setItem('characterEdge', this.subtitleStyleSetting.characterEdge);
  }

  setFontSize(coefficient: number): void {
    this.subtitleStyleSetting.fontCoefficient = coefficient;
    this.updateSubtitleLabelCss();
    StorageUtils.setItem('fontCoefficient', this.subtitleStyleSetting.fontCoefficient.toString());
  }

  private applyConfToDom(dom: DOM): void {
    dom.css('color', this.subtitleStyleSetting.fontColor.toCSS());
    dom.css('background', this.subtitleStyleSetting.backgroundColor.toCSS());
    dom.css('font-variant', this.subtitleStyleSetting.fontVariant);
    dom.css('font-family', this.subtitleStyleSetting.fontFamily);
    dom.css('font-style', this.subtitleStyleSetting.fontStyle);
    dom.css('text-shadow', this.subtitleStyleSetting.characterEdge);
    dom.css('font-size', `${this.subtitleStyleSetting.fontSize * this.subtitleStyleSetting.fontCoefficient}em`);
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
   * can happen, two similar texts will be displayed at a similar time so it does not matter which one we delete.
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
