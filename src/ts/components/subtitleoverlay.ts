import {Container, ContainerConfig} from './container';
import {UIInstanceManager, UISubtitleConfig} from '../uimanager';
import SubtitleCueEvent = bitmovin.PlayerAPI.SubtitleCueEvent;
import {Label, LabelConfig} from './label';
import {ComponentConfig, Component} from './component';
import {ControlBar} from './controlbar';
import {ColorUtils} from '../colorutils';
import {StorageUtils} from '../storageutils';

export interface SubtitleOverlayConfig extends ContainerConfig {
  subtitleConfig?: UISubtitleConfig;
}

export interface SubtitleStyle {
  fontColor?: ColorUtils.Color;
  backgroundColor?: ColorUtils.Color;
  windowColor?: ColorUtils.Color;
  fontFamily?: string;
  fontStyle?: string;
  fontVariant?: string;
  characterEdge?: string;
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

  /**
   * Carries base styling from the config.
   */
  private baseSubtitleStyle: SubtitleStyle;
  /**
   * Carries user-set styling separately from the base style so we can save only the user-set properties.
   */
  private userSubtitleStyle: SubtitleStyle;

  constructor(config: SubtitleOverlayConfig = {}) {
    super(config);

    this.previewSubtitleActive = false;
    this.previewSubtitle = new SubtitleLabel({ text: 'example subtitle' });

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-subtitle-overlay',
    }, this.config);

    // Define the default subtitles style
    this.baseSubtitleStyle = {
      fontColor: ColorUtils.foreground,
      backgroundColor: ColorUtils.background,
      windowColor: ColorUtils.background,
      fontFamily: '',
      fontStyle: '',
      fontVariant: 'normal',
      characterEdge: '',
      fontSize: 1,
    };
    this.userSubtitleStyle = {};
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.configureSubtitleStyle(player, uimanager);

    let subtitleManager = new ActiveSubtitleManager();
    this.subtitleManager = subtitleManager;

    player.addEventHandler(player.EVENT.ON_CUE_ENTER, (event: SubtitleCueEvent) => {
      let labelToAdd = subtitleManager.cueEnter(event);

      this.applyStyleToLabel(labelToAdd);

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
    this.updateSubtitleOverlayFromUIConfig(config.subtitleConfig, this.baseSubtitleStyle);
    this.updateSubtitleOverlayFromUIConfig(uimanager.getConfig().subtitles, this.baseSubtitleStyle);
    this.updateSubtitleOverlayFromLocalStorage();

    // This css property isn't applied to the subtitle cue
    // and therefore should be applied now
    if (this.style.windowColor) {
      this.getDomElement().css('background', this.style.windowColor.toCSS());
    }
    this.applyStyleToLabels();
  }

  /**
   * Updates the setting used to display subtitles based on config information
   */
  private updateSubtitleOverlayFromUIConfig(subtitlesConfig: UISubtitleConfig, subtitleStyle: SubtitleStyle): void {
    if (subtitlesConfig == null) {
      return;
    }
    if (subtitlesConfig.backgroundColor != null) {
      subtitleStyle.backgroundColor = ColorUtils.colorFromCss(subtitlesConfig.backgroundColor);
    }
    if (subtitlesConfig.fontColor != null) {
      subtitleStyle.fontColor = ColorUtils.colorFromCss(subtitlesConfig.fontColor);
    }
    if (subtitlesConfig.windowColor != null) {
      subtitleStyle.windowColor = ColorUtils.colorFromCss(subtitlesConfig.windowColor);
    }
    if (subtitlesConfig.fontFamily != null) {
      subtitleStyle.fontFamily = subtitlesConfig.fontFamily;
    }
    if (subtitlesConfig.fontVariant != null) {
      subtitleStyle.fontVariant = subtitlesConfig.fontVariant;
    }
    if (subtitlesConfig.fontStyle != null) {
      subtitleStyle.fontStyle = subtitlesConfig.fontStyle;
    }
    if (subtitlesConfig.characterEdge != null) {
      subtitleStyle.characterEdge = subtitlesConfig.characterEdge;
    }
  }

  /**
   * Updates the settings used to display subtitles based on local storage values
   */
  private updateSubtitleOverlayFromLocalStorage(): void {
    let styleConfig = this.loadUserSubtitleStyle();

    if (!styleConfig) {
      this.userSubtitleStyle.fontColor = new ColorUtils.Color(null, null, null, null);
      this.userSubtitleStyle.backgroundColor = new ColorUtils.Color(null, null, null, null);
      this.userSubtitleStyle.windowColor = new ColorUtils.Color(null, null, null, null);
      return;
    }

    if (styleConfig.fontColor != null) {
      this.userSubtitleStyle.fontColor = styleConfig.fontColor;
    } else {
      this.userSubtitleStyle.fontColor = new ColorUtils.Color(null, null, null, null);
    }

    if (styleConfig.backgroundColor != null) {
      this.userSubtitleStyle.backgroundColor = styleConfig.backgroundColor;
    } else {
      this.userSubtitleStyle.backgroundColor = new ColorUtils.Color(null, null, null, null);
    }

    if (styleConfig.windowColor != null) {
      this.userSubtitleStyle.windowColor = styleConfig.windowColor;
    } else {
      this.userSubtitleStyle.windowColor = new ColorUtils.Color(null, null, null, null);
    }

    if (styleConfig.fontFamily != null) {
      this.userSubtitleStyle.fontFamily = styleConfig.fontFamily;
    }

    if (styleConfig.fontStyle != null) {
      this.userSubtitleStyle.fontStyle = styleConfig.fontStyle;
    }

    if (styleConfig.fontVariant != null) {
      this.userSubtitleStyle.fontVariant = styleConfig.fontVariant;
    }

    if (styleConfig.characterEdge != null) {
      this.userSubtitleStyle.characterEdge = styleConfig.characterEdge;
    }
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
    col.a = this.userSubtitleStyle.fontColor.a;
    this.userSubtitleStyle.fontColor = col;
    this.applyStyleToLabels();
    this.saveUserSubtitleStyle();
  }

  setBackgroundColor(color: string): void {
    let backgroundColor = ColorUtils.colorFromCss(color);
    backgroundColor.a = this.userSubtitleStyle.backgroundColor.a;
    this.userSubtitleStyle.backgroundColor = backgroundColor;
    this.applyStyleToLabels();
    this.saveUserSubtitleStyle();
  }

  setWindowColor(color: string): void {
    let windowColor = ColorUtils.colorFromCss(color);
    windowColor.a = this.userSubtitleStyle.windowColor.a;
    this.userSubtitleStyle.windowColor = windowColor;
    this.getDomElement().css('background', this.userSubtitleStyle.windowColor.toCSS());
    this.saveUserSubtitleStyle();
  }

  setFontOpacity(alpha: number): void {
    this.userSubtitleStyle.fontColor.a = alpha;
    this.applyStyleToLabels();
    this.saveUserSubtitleStyle();
  }

  setBackgroundOpacity(alpha: number): void {
    this.userSubtitleStyle.backgroundColor.a = alpha;
    this.applyStyleToLabels();
    this.saveUserSubtitleStyle();
  }

  setWindowOpacity(alpha: number): void {
    this.userSubtitleStyle.windowColor.a = alpha;
    this.getDomElement().css('background', this.userSubtitleStyle.windowColor.toCSS());
    this.saveUserSubtitleStyle();
  }

  setFontFamily(fontFamily: string): void {
    this.userSubtitleStyle.fontFamily = fontFamily;
    this.applyStyleToLabels();
    this.saveUserSubtitleStyle();
  }

  setFontStyle(fontStyle: string): void {
    this.userSubtitleStyle.fontStyle = fontStyle;
    this.applyStyleToLabels();
    this.saveUserSubtitleStyle();
  }

  setFontVariant(fontVariant: string): void {
    this.userSubtitleStyle.fontVariant = fontVariant;
    this.applyStyleToLabels();
    this.saveUserSubtitleStyle();
  }

  /**
   * A helper method to avoid updating the CSS label 3 times in a row
   * since family, style and variant are normally updated together
   */
  setFont(fontFamily: string, fontStyle: string, fontVariant: string): void {
    this.userSubtitleStyle.fontFamily = fontFamily;
    this.userSubtitleStyle.fontStyle = fontStyle;
    this.userSubtitleStyle.fontVariant = fontVariant;
    this.applyStyleToLabels();
    this.saveUserSubtitleStyle();
  }

  setCharacterEdge(characterEdge: string): void {
    this.userSubtitleStyle.characterEdge = characterEdge;
    this.applyStyleToLabels();
    this.saveUserSubtitleStyle();
  }

  setFontSize(size: number): void {
    this.userSubtitleStyle.fontSize = size;
    this.applyStyleToLabels();
    this.saveUserSubtitleStyle();
  }

  get style(): SubtitleStyle {
    let mergedStyle = <SubtitleStyle>Object.assign({}, this.baseSubtitleStyle, this.userSubtitleStyle);
    mergedStyle.backgroundColor = ColorUtils.mergeColor([this.baseSubtitleStyle.backgroundColor, this.userSubtitleStyle.backgroundColor]);
    mergedStyle.fontColor = ColorUtils.mergeColor([this.baseSubtitleStyle.fontColor, this.userSubtitleStyle.fontColor]);
    mergedStyle.windowColor = ColorUtils.mergeColor([this.baseSubtitleStyle.windowColor, this.userSubtitleStyle.windowColor]);
    return mergedStyle;
  }

  private saveUserSubtitleStyle(): void {
    StorageUtils.setObject('subtitleStyle', this.userSubtitleStyle);
  }

  private loadUserSubtitleStyle(): SubtitleStyle {
    return StorageUtils.getObject<SubtitleStyle>('subtitleStyle');
  }

  private applyStyleToLabel(label: SubtitleLabel, subtitleStyle?: SubtitleStyle): void {
    if (!subtitleStyle) {
      // When applying the style to multiple labels, it is better to pass it to this method instead of
      // getting it at every call.
      subtitleStyle = this.style;
    }

    label.getDomElement().css({
      'color': subtitleStyle.fontColor.toCSS(),
      'background': subtitleStyle.backgroundColor.toCSS(),
      'font-variant': subtitleStyle.fontVariant,
      'font-family': subtitleStyle.fontFamily,
      'font-style': subtitleStyle.fontStyle,
      'text-shadow': subtitleStyle.characterEdge,
      'font-size': `${subtitleStyle.fontSize}em`,
    });
  }

  private applyStyleToLabels(): void {
    // Get the merged style that we want to apply to the labels
    let style = this.style;

    for (let component of this.getComponents()) {
      if (component instanceof SubtitleLabel) {
        this.applyStyleToLabel(component, style);
      }
    }
    this.applyStyleToLabel(this.previewSubtitle, style);
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
