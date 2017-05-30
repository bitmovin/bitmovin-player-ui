import {Container, ContainerConfig} from './container';
import {UIInstanceManager} from '../uimanager';
import SubtitleCueEvent = bitmovin.PlayerAPI.SubtitleCueEvent;
import {Label, LabelConfig} from './label';
import {ComponentConfig, Component} from './component';
import {ControlBar} from './controlbar';
import {ColorUtils, Storage} from '../utils';
import {DOM} from '../dom';

export interface SubtitleOverlayConfig extends ContainerConfig {
  fontColor?: ColorUtils.Color;
  backgroundColor?: ColorUtils.Color;
  windowColor?: ColorUtils.Color;
  family?: string;
  fontVariant?: string;
  characterEdge?: string;
  coef?: number;
  size?: number;
  hasLocalStorage?: boolean;
}

/**
 * Overlays the player to display subtitles.
 */
export class SubtitleOverlay extends Container<SubtitleOverlayConfig> {

  public config: SubtitleOverlayConfig;

  private subtitleManager: ActiveSubtitleManager;
  private forceCue: boolean = false;
  private forcedCue: SubtitleLabel = new SubtitleLabel({text: 'exemple cue'});

  private static readonly CLASS_CONTROLBAR_VISIBLE = 'controlbar-visible';

  constructor(config: SubtitleOverlayConfig = {}) {
    super(config);

    this.config = this.mergeConfig( config, <SubtitleOverlayConfig>{
        cssClass: 'ui-subtitle-overlay',
        fontColor: ColorUtils.foreground,
        backgroundColor: ColorUtils.background,
        windowColor: ColorUtils.background,
        family: '',
        fontVariant: 'normal',
        characterEdge: '',
        coef: 1,
        size: 1.2,
      }, this.config);

    config = this.config;
    if (Storage.hasLocalStorage()) {
      this.config.hasLocalStorage = true;
      let store = window.localStorage;
      let fontColor = store.getItem('fontColor');
      let forcedCueDom = this.forcedCue.getDomElement()
      if (fontColor != null) {
        this.config.fontColor = ColorUtils.colorFromCss(fontColor, ColorUtils.foreground);
        forcedCueDom.css('color', this.config.fontColor.toCSS());
      }
      let backgroundColor = store.getItem('backgroundColor');
      if (backgroundColor != null) {
        this.config.backgroundColor = ColorUtils.colorFromCss(backgroundColor, ColorUtils.background);
        forcedCueDom.css('background', this.config.backgroundColor.toCSS());
      }
      let windowColor = store.getItem('windowColor');
      if (windowColor != null) {
        this.config.windowColor = ColorUtils.colorFromCss(windowColor, ColorUtils.background);
      }
      let family = store.getItem('family');
      if (family != null) {
        this.config.family = family;
        forcedCueDom.css('font-family', family);
      }
      let fontVariant = store.getItem('fontVariant');
      if (fontVariant != null) {
        this.config.fontVariant = fontVariant;
        forcedCueDom.css('font-variant', fontVariant);
      }
      let characterEdge = store.getItem('characterEdge');
      if (characterEdge != null) {
        this.config.characterEdge = characterEdge;
        forcedCueDom.css('text-shadow', characterEdge);
      }
      let coef = store.getItem('coef');
      if (coef != null) {
        this.config.coef = Number(coef);
        forcedCueDom.css('font-size', `${config.size * config.coef}em`);
      }
    }
    // This css property isn't applied to the subtitle cue
    // and therefore shoud be applied now
    if (this.config.windowColor != null) {
        this.getDomElement().css('background', this.config.windowColor.toCSS());
    }
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let subtitleManager = new ActiveSubtitleManager();
    this.subtitleManager = subtitleManager;
    let config = <SubtitleOverlayConfig>this.config;

    player.addEventHandler(player.EVENT.ON_CUE_ENTER, (event: SubtitleCueEvent) => {
      let labelToAdd = subtitleManager.cueEnter(event);

      labelToAdd.getDomElement().css('color', config.fontColor.toCSS())
      labelToAdd.getDomElement().css('background', config.backgroundColor.toCSS())
      labelToAdd.getDomElement().css('font-variant', config.fontVariant)
      labelToAdd.getDomElement().css('font-family', config.family)
      labelToAdd.getDomElement().css('text-shadow', config.characterEdge)
      labelToAdd.getDomElement().css('font-size', `${config.size * config.coef}em`)

      if (this.forceCue) {
        this.removeComponent(this.forcedCue);
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
        if (!this.forceCue) {
          this.hide();
        } else {
          this.addComponent(this.forcedCue);
          this.updateComponents()
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

  updateSubtitleLabelCss(propertyName: string, value: string) {
    this.getDomElement().find('.bmpui-ui-subtitle-label').css(propertyName, value)
    this.forcedCue.getDomElement().css(propertyName, value)
  }

  enforceSubtitleLabel() {
    this.forceCue = true;
    if (!this.subtitleManager.hasCues) {
      this.addComponent(this.forcedCue);
      this.updateComponents();
      this.show();
    }
  }
  removeEnforcedSubtitleLabel() {
    this.forceCue = false;
    this.removeComponent(this.forcedCue);
    this.updateComponents();
  }
  // Methods used to define custom styling on subtitles labels
  setColor(color: string) {
    let col = ColorUtils.colorFromCss(color);
    col.a = this.config.fontColor.a
    this.config.fontColor = col
    this.updateSubtitleLabelCss('color', this.config.fontColor.toCSS());
    if (this.config.hasLocalStorage) {
      window.localStorage.setItem('fontColor', this.config.fontColor.toCSS());
    }
  }
  setBackgroundColor(color: string) {
    let backgroundColor = ColorUtils.colorFromCss(color);
    if (! this.config.backgroundColor.a || this.config.backgroundColor.a === 0) {
      // 25%  opacity at least
      backgroundColor.a = 0.25;
    } else {
      backgroundColor.a = this.config.backgroundColor.a;
    }
    this.config.backgroundColor = backgroundColor;
    this.updateSubtitleLabelCss('background', this.config.backgroundColor.toCSS());
    if (this.config.hasLocalStorage) {
      window.localStorage.setItem('backgroundColor', this.config.backgroundColor.toCSS());
    }
  }
  setWindowColor(color: string) {
    let windowColor = ColorUtils.colorFromCss(color);
    if (! this.config.windowColor.a || this.config.windowColor.a === 0) {
      // 25%  opacity at least
      windowColor.a = 0.25;
    } else {
      windowColor.a = this.config.windowColor.a;
    }
    this.config.windowColor = windowColor;
    this.getDomElement().css('background', this.config.windowColor.toCSS());
    if (this.config.hasLocalStorage) {
      window.localStorage.setItem('windowColor', this.config.windowColor.toCSS());
    }
  }
  setFontOpacity(alpha: number) {
    this.config.fontColor.a = alpha;
    this.updateSubtitleLabelCss('color', this.config.fontColor.toCSS());
    if (this.config.hasLocalStorage) {
      window.localStorage.setItem('fontColor', this.config.fontColor.toCSS());
    }
  }
  setBackgroundOpacity(alpha: number) {
    this.config.backgroundColor.a = alpha;
    this.getDomElement().css('background', this.config.backgroundColor.toCSS());
    if (this.config.hasLocalStorage) {
      window.localStorage.setItem('backgroundColor', this.config.backgroundColor.toCSS());
    }
  }
  setWindowOpacity(alpha: number) {
    this.config.windowColor.a = alpha;
    this.updateSubtitleLabelCss('background', this.config.windowColor.toCSS());
    if (this.config.hasLocalStorage) {
      window.localStorage.setItem('windowColor', this.config.windowColor.toCSS());
    }
  }
  setFontFamily(family: string) {
    // clear previous state, so that switching to small caps doesn' affect further font changes
    this.config.fontVariant = 'normal';
    this.config.family = '';
    if (family === 'small-caps') {
      this.updateSubtitleLabelCss('font-variant', family);
      this.config.fontVariant = family;
    } else {
      this.updateSubtitleLabelCss('font-family', family);
      this.config.family = family;
    }
    if (this.config.hasLocalStorage) {
      window.localStorage.setItem('family', this.config.family);
      window.localStorage.setItem('font-variant', this.config.fontVariant);
    }
  }
  setCharacterEdge(characterEdge: string) {
    this.config.characterEdge = characterEdge;
    this.updateSubtitleLabelCss('text-shadow', characterEdge);
    if (this.config.hasLocalStorage) {
      window.localStorage.setItem('characterEdge', this.config.characterEdge);
    }
  }
  setFontSize(coefficient: number) {
    this.config.coef = coefficient;
    console.log(`${this.config.size * this.config.coef}em`)
    this.updateSubtitleLabelCss('font-size', `${this.config.size * this.config.coef}em`)
    if (this.config.hasLocalStorage) {
      window.localStorage.setItem('coef', this.config.coef.toString());
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
      cssClass: 'ui-subtitle-label'
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
      text: event.html || event.text
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
