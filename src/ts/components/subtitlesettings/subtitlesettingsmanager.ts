import {StorageUtils} from '../../storageutils';
import {Component, ComponentConfig} from '../component';
import {SubtitleOverlay} from '../subtitleoverlay';
import {EventDispatcher, Event} from '../../eventdispatcher';

interface SubtitleSettings {
  fontColor?: string;
  fontOpacity?: string;
  fontFamily?: string;
  fontSize?: string;
  characterEdge?: string;
  backgroundColor?: string;
  backgroundOpacity?: string;
  windowColor?: string;
  windowOpacity?: string;
}

interface Properties {
  [name: string]: SubtitleSettingsProperty<string>;
}

export class SubtitleSettingsManager {

  private overlay: SubtitleOverlay;
  private userSettings: SubtitleSettings;
  private localStorageKey: string;

  private _properties: Properties = {
    fontColor: new SubtitleSettingsProperty<string>(this),
    fontOpacity: new SubtitleSettingsProperty<string>(this),
    fontFamily: new SubtitleSettingsProperty<string>(this),
    fontSize: new SubtitleSettingsProperty<string>(this),
    characterEdge: new SubtitleSettingsProperty<string>(this),
    backgroundColor: new SubtitleSettingsProperty<string>(this),
    backgroundOpacity: new SubtitleSettingsProperty<string>(this),
    windowColor: new SubtitleSettingsProperty<string>(this),
    windowOpacity: new SubtitleSettingsProperty<string>(this),
  };

  constructor(overlay: SubtitleOverlay) {
    this.overlay = overlay;
    this.userSettings = {};
    this.localStorageKey = DummyComponent.instance().prefixCss('subtitlesettings');

    for (let propertyName in this._properties) {
      this._properties[propertyName].onChanged.subscribe((sender, property) => {
        if (property.isSet()) {
          (<any>this.userSettings)[propertyName] = property.value;
        } else {
          delete (<any>this.userSettings)[propertyName];
        }

        this.save();
      });
    }

    this.load();
  }

  public reset(): void {
    for (let propertyName in this._properties) {
      this._properties[propertyName].clear();
    }
  }

  public get fontColor(): SubtitleSettingsProperty<string> {
    return this._properties.fontColor;
  }

  public get fontOpacity(): SubtitleSettingsProperty<string> {
    return this._properties.fontOpacity;
  }

  public get fontFamily(): SubtitleSettingsProperty<string> {
    return this._properties.fontFamily;
  }

  public get fontSize(): SubtitleSettingsProperty<string> {
    return this._properties.fontSize;
  }

  public get characterEdge(): SubtitleSettingsProperty<string> {
    return this._properties.characterEdge;
  }

  public get backgroundColor(): SubtitleSettingsProperty<string> {
    return this._properties.backgroundColor;
  }

  public get backgroundOpacity(): SubtitleSettingsProperty<string> {
    return this._properties.backgroundOpacity;
  }

  public get windowColor(): SubtitleSettingsProperty<string> {
    return this._properties.windowColor;
  }

  public get windowOpacity(): SubtitleSettingsProperty<string> {
    return this._properties.windowOpacity;
  }

  /**
   * Saves the settings to local storage.
   */
  public save(): void {
    StorageUtils.setObject(this.localStorageKey, this.userSettings);
  }

  /**
   * Loads the settings from local storage
   */
  public load(): void {
    this.userSettings = StorageUtils.getObject<SubtitleSettings>(this.localStorageKey) || {};

    // Apply the loaded settings
    for (let property in this.userSettings) {
      this._properties[property].value = (<any>this.userSettings)[property];
    }
  }
}

/**
 * A dummy component whose sole purpose is to expose the {@link #prefixCss} method to the
 * {@link SubtitleSettingsManager}.
 */
class DummyComponent extends Component<ComponentConfig> {

  private static _instance: DummyComponent;

  public static instance(): DummyComponent {
    if (!DummyComponent._instance) {
      DummyComponent._instance = new DummyComponent();
    }

    return DummyComponent._instance;
  }

  public prefixCss(cssClassOrId: string): string {
    return super.prefixCss(cssClassOrId);
  }
}

export class SubtitleSettingsProperty<T> {

  private _manager: SubtitleSettingsManager;
  private _onChanged: EventDispatcher<SubtitleSettingsManager, SubtitleSettingsProperty<T>>;
  private _value: T;

  constructor(manager: SubtitleSettingsManager) {
    this._manager = manager;
    this._onChanged = new EventDispatcher<SubtitleSettingsManager, SubtitleSettingsProperty<T>>();
  }

  public isSet(): boolean {
    return this._value != null;
  }

  public clear(): void {
    this._value = null;
    this.onChangedEvent(null);
  }

  public get value(): T {
    return this._value;
  }

  public set value(value: T) {
    if (typeof value === 'string' && value === 'null') {
      value = null;
    }

    this._value = value;
    this.onChangedEvent(value);
  }

  protected onChangedEvent(value: T) {
    this._onChanged.dispatch(this._manager, this);
  }

  public get onChanged(): Event<SubtitleSettingsManager, SubtitleSettingsProperty<T>> {
    return this._onChanged.getEvent();
  }
}