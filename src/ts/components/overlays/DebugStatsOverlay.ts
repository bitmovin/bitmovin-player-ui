import { Container, ContainerConfig } from '../Container';
import { Label, LabelConfig } from '../labels/Label';
import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../../UIManager';
import { Component, ComponentConfig } from '../Component';

/**
 * Overlays the player and displays debug stats data.
 *
 * @category Components
 */
export class DebugStatsOverlay extends Container<ContainerConfig> {
  private static createNewline() {
    return new Component<ComponentConfig>({
      tag: 'br',
      cssClass: 'ui-debug-stats-overlay-label',
    });
  }

  private static createLabel(text: string) {
    return new Label<LabelConfig>({
      cssClass: 'ui-debug-stats-overlay-label',
      text: text,
    });
  }

  private title = DebugStatsOverlay.createLabel('N/A');
  private bufferVideo = DebugStatsOverlay.createLabel('N/A');
  private bufferAudio = DebugStatsOverlay.createLabel('N/A');
  private droppedFrames = DebugStatsOverlay.createLabel('N/A');

  constructor(config: ContainerConfig = {}) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-debug-stats-overlay',
        components: [
          DebugStatsOverlay.createLabel('Source: '),
          this.title,
          DebugStatsOverlay.createNewline(),

          DebugStatsOverlay.createLabel('Buffer video seconds: '),
          this.bufferVideo,
          DebugStatsOverlay.createNewline(),

          DebugStatsOverlay.createLabel('Buffer audio seconds: '),
          this.bufferAudio,
          DebugStatsOverlay.createNewline(),

          DebugStatsOverlay.createLabel('Dropped frames: '),
          this.droppedFrames,
          DebugStatsOverlay.createNewline(),
        ],
      },
      this.config,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager) {
    super.configure(player, uimanager);

    // if (!uimanager.getConfig().showDebugStats) {
    //     this.hide();
    //     return;
    // }
    this.show();
    // subscribe for events

    player.on(player.exports.PlayerEvent.Ready, () => {
      this.title.setText(player.getSource().title);
    });
    const updateBuffer = () => {
      this.bufferVideo.setText(
        player.buffer
          .getLevel(player.exports.BufferType.ForwardDuration, player.exports.MediaType.Video)
          .level.toFixed(2),
      );
      this.bufferAudio.setText(
        player.buffer
          .getLevel(player.exports.BufferType.ForwardDuration, player.exports.MediaType.Audio)
          .level.toFixed(2),
      );
    };
    player.on(player.exports.PlayerEvent.DownloadFinished, updateBuffer);
    player.on(player.exports.PlayerEvent.TimeChanged, updateBuffer);
    player.on(player.exports.PlayerEvent.TimeChanged, () => {
      this.droppedFrames.setText(player.getDroppedVideoFrames().toString());
    });
  }
}
