import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../../../UIManager';
import { i18n } from '../../../localization/i18n';
import { Button, ButtonConfig, ButtonStyle } from '../../buttons/Button';
import { Container } from '../../Container';
import { Label, LabelConfig } from '../../labels/Label';
import { SettingsPanelItem, SettingsPanelItemConfig } from '../../settings/SettingsPanelItem';
import type { PlayerGraphsSnapshot } from './PlayerGraphsRecorder';

interface PlayerGraphsPanelTitleTarget {
  hide(): void;
  isPaused(): boolean;
  isShowingSnapshot(): boolean;
  pause(): void;
  resume(): void;
  exportSnapshot(): PlayerGraphsSnapshot;
  loadSnapshot(snapshot: PlayerGraphsSnapshot): void;
}

export class PlayerGraphsPanelTitleItem extends SettingsPanelItem<SettingsPanelItemConfig> {
  private readonly pauseButton: Button<ButtonConfig>;
  private readonly exportButton: Button<ButtonConfig>;
  private readonly importButton: Button<ButtonConfig>;
  private readonly closeButton: Button<ButtonConfig>;
  private target: PlayerGraphsPanelTitleTarget | null = null;

  constructor(config: SettingsPanelItemConfig = {}) {
    super(config);

    const titleLabel = new Label<LabelConfig>({
      text: 'Player Graphs',
      cssClasses: ['ui-player-graphs-panel-title-label'],
    });
    const pauseButton = buildActionButton('Pause', 'Pause the graphs and scrub through what was recorded');
    const exportButton = buildActionButton('Export', 'Export the player graphs data as a file');
    const importButton = buildActionButton('Import', 'Load player graphs data from a file');
    const closeButton = new Button<ButtonConfig>({
      cssClass: 'ui-closebutton',
      cssClasses: ['ui-player-graphs-panel-close-button'],
      text: i18n.getLocalizer('close'),
    });

    this.config = this.mergeConfig(
      config,
      {
        cssClasses: ['title-item', 'ui-player-graphs-panel-title-item'],
        isSetting: false,
        role: 'group',
        tabIndex: -1,
      },
      this.config,
    );

    this.pauseButton = pauseButton;
    this.exportButton = exportButton;
    this.importButton = importButton;
    this.closeButton = closeButton;
    this.addComponent(titleLabel);
    this.addComponent(
      new Container({
        components: [pauseButton, exportButton, importButton, closeButton],
        cssClasses: ['ui-player-graphs-panel-actions'],
      }),
    );
  }

  setTarget(target: PlayerGraphsPanelTitleTarget): void {
    this.target = target;
  }

  /** Updates the pause button to the state of the target. A snapshot is not paused, it already stands still. */
  refresh(): void {
    this.pauseButton.setText(this.target?.isPaused() ? 'Resume' : 'Pause');
    if (this.target?.isShowingSnapshot()) {
      this.pauseButton.hide();
    } else {
      this.pauseButton.show();
    }
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.pauseButton.onClick.subscribe(() => {
      if (this.target?.isPaused()) {
        this.target.resume();
      } else {
        this.target?.pause();
      }
    });
    this.exportButton.onClick.subscribe(() => {
      const snapshot = this.target?.exportSnapshot();
      if (snapshot) {
        downloadJson(`player-graphs-${snapshot.exportedAt.replace(/[:.]/g, '-')}.json`, JSON.stringify(snapshot));
      }
    });
    this.importButton.onClick.subscribe(() => pickJsonFile(json => this.target?.loadSnapshot(json)));
    this.closeButton.onClick.subscribe(() => this.target?.hide());
  }
}

function buildActionButton(text: string, ariaLabel: string): Button<ButtonConfig> {
  return new Button<ButtonConfig>({
    text,
    ariaLabel,
    buttonStyle: ButtonStyle.Text,
    cssClasses: ['ui-player-graphs-panel-action-button'],
  });
}

function downloadJson(fileName: string, json: string): void {
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  // Revoking synchronously would cancel the download.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Lets the user pick a JSON file and hands on its parsed contents. Failures go to the console. */
function pickJsonFile(onJson: (json: PlayerGraphsSnapshot) => void): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json,.json';
  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        onJson(JSON.parse(reader.result as string));
      } catch (error) {
        console.warn('Could not load the player graphs snapshot:', error);
      }
    };
    reader.readAsText(file);
  });
  input.click();
}
