import {Container, ContainerConfig} from './container';
import {UIInstanceManager} from '../uimanager';
import SubtitleCueEvent = bitmovin.PlayerAPI.SubtitleCueEvent;
import {Label, LabelConfig} from './label';
import {ComponentConfig, Component} from './component';
import {ControlBar} from './controlbar';
import {ColorUtils} from '../utils';
import {DOM} from '../dom';

/**
 * Overlays the player to display subtitles.
 */
export class SubtitleOverlay extends Container<ComponentConfig> {

  private static readonly CLASS_CONTROLBAR_VISIBLE = 'controlbar-visible';

  private fontColor: ColorUtils.Color = new ColorUtils.Color(255, 255, 255, 1);
  private backgroundColor: ColorUtils.Color = new ColorUtils.Color(0, 0, 0, 0);
  private windowColor: ColorUtils.Color = new ColorUtils.Color(0, 0, 0, 0);
  private family: string = '';
  private fontVariant: string = 'normal';
  private characterEdge: string = '';
  private size: number = 1.2;

  constructor(config: ComponentConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-subtitle-overlay',
    }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let subtitleManager = new ActiveSubtitleManager();

    player.addEventHandler(player.EVENT.ON_CUE_ENTER, (event: SubtitleCueEvent) => {
      let labelToAdd = subtitleManager.cueEnter(event);

      labelToAdd.getDomElement().css('color', this.fontColor.toCSS())
      labelToAdd.getDomElement().css('background', this.backgroundColor.toCSS())
      labelToAdd.getDomElement().css('font-variant', this.fontVariant)
      labelToAdd.getDomElement().css('font-family', this.family)
      labelToAdd.getDomElement().css('text-shadow', this.characterEdge)
      labelToAdd.getDomElement().css('font-size', `${this.size}em`)

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
        this.hide();
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

  getSubtitleLabel(): DOM {
    return this.getDomElement().find('.bmpui-ui-subtitle-label')
  }
  setColor(color: string) {
    this.fontColor = ColorUtils.colorFromName(color);
    this.getSubtitleLabel().css('color', this.fontColor.toCSS());
  }
  setBackgroundColor(color: string) {
    let backgroundColor = ColorUtils.colorFromName(color);
    if (! this.backgroundColor.a || this.backgroundColor.a === 0) {
      // 25%  opacity at least
      backgroundColor.a = 0.25;
    } else {
      backgroundColor.a = this.backgroundColor.a;
    }
    this.backgroundColor = backgroundColor;
    this.getSubtitleLabel().css('background', this.backgroundColor.toCSS());
  }
  setWindowColor(color: string) {
    let windowColor = ColorUtils.colorFromName(color);
    if (! this.windowColor.a || this.windowColor.a === 0) {
      // 25%  opacity at least
      windowColor.a = 0.25;
    } else {
      windowColor.a = this.windowColor.a;
    }
    this.windowColor = windowColor;
    this.getDomElement().css('background', this.windowColor.toCSS());
  }
  setFontOpacity(alpha: number) {
    this.fontColor.a = alpha;
    this.getSubtitleLabel().css('color', this.fontColor.toCSS());
  }
  setBackgroundOpacity(alpha: number) {
    this.windowColor.a = alpha;
    this.getDomElement().css('background', this.windowColor.toCSS());
  }
  setWindowOpacity(alpha: number) {
    this.backgroundColor.a = alpha;
    this.getSubtitleLabel().css('background', this.backgroundColor.toCSS());
  }
  setFontFamily(family: string) {
    // clear previous state, so that switching to small caps doesn' affect further font changes
    this.fontVariant = 'normal';
    this.family = '';
    if (family === 'small-caps') {
      this.getSubtitleLabel().css('font-variant', family);
      this.fontVariant = family;
    } else {
      this.getSubtitleLabel().css('font-family', family);
      this.family = family;
    }
  }
  setCharacterEdge(characterEdge: string) {
    this.characterEdge = characterEdge;
    this.getSubtitleLabel().css('text-shadow', characterEdge);
  }
  setFontSize(coefficient: number) {
    this.size = 1.2 * coefficient;
    this.getSubtitleLabel().css('font-size', `${this.size}em`)
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
