import {Component, ComponentConfig} from './component';
import {DOM} from '../dom';

/**
 * Animated analog TV static noise.
 */
export class TvNoiseCanvas extends Component<ComponentConfig> {

  private canvas: DOM;

  private canvasElement: HTMLCanvasElement;
  private canvasContext: CanvasRenderingContext2D;
  private canvasWidth = 160;
  private canvasHeight = 90;
  private interferenceHeight = 50;
  private lastFrameUpdate: number = 0;
  private frameInterval: number = 60;
  private useAnimationFrame: boolean = !!window.requestAnimationFrame;
  private noiseAnimationWindowPos: number;
  private frameUpdateHandlerId: number;

  constructor(config: ComponentConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-tvnoisecanvas'
    }, this.config);
  }

  protected toDomElement(): DOM {
    return this.canvas = new DOM('canvas', { 'class': this.getCssClasses() });
  }

  start(): void {
    this.canvasElement = <HTMLCanvasElement>this.canvas.getElements()[0];
    this.canvasContext = this.canvasElement.getContext('2d');
    this.noiseAnimationWindowPos = -this.canvasHeight;
    this.lastFrameUpdate = 0;

    this.canvasElement.width = this.canvasWidth;
    this.canvasElement.height = this.canvasHeight;

    this.renderFrame();
  }

  stop(): void {
    if (this.useAnimationFrame) {
      cancelAnimationFrame(this.frameUpdateHandlerId);
    } else {
      clearTimeout(this.frameUpdateHandlerId);
    }
  }

  private renderFrame(): void {
    // This code has been copied from the player controls.js and simplified

    if (this.lastFrameUpdate + this.frameInterval > new Date().getTime()) {
      // It's too early to render the next frame
      this.scheduleNextRender();
      return;
    }

    let currentPixelOffset;
    let canvasWidth = this.canvasWidth;
    let canvasHeight = this.canvasHeight;

    // Create texture
    let noiseImage = this.canvasContext.createImageData(canvasWidth, canvasHeight);

    // Fill texture with noise
    for (let y = 0; y < canvasHeight; y++) {
      for (let x = 0; x < canvasWidth; x++) {
        currentPixelOffset = (canvasWidth * y * 4) + x * 4;
        noiseImage.data[currentPixelOffset] = Math.random() * 255;
        if (y < this.noiseAnimationWindowPos || y > this.noiseAnimationWindowPos + this.interferenceHeight) {
          noiseImage.data[currentPixelOffset] *= 0.85;
        }
        noiseImage.data[currentPixelOffset + 1] = noiseImage.data[currentPixelOffset];
        noiseImage.data[currentPixelOffset + 2] = noiseImage.data[currentPixelOffset];
        noiseImage.data[currentPixelOffset + 3] = 50;
      }
    }

    // Put texture onto canvas
    this.canvasContext.putImageData(noiseImage, 0, 0);

    this.lastFrameUpdate = new Date().getTime();
    this.noiseAnimationWindowPos += 7;
    if (this.noiseAnimationWindowPos > canvasHeight) {
      this.noiseAnimationWindowPos = -canvasHeight;
    }

    this.scheduleNextRender();
  }

  private scheduleNextRender(): void {
    if (this.useAnimationFrame) {
      this.frameUpdateHandlerId = window.requestAnimationFrame(this.renderFrame.bind(this));
    } else {
      this.frameUpdateHandlerId = setTimeout(this.renderFrame.bind(this), this.frameInterval);
    }
  }
}