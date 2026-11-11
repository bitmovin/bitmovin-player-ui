import { Component, ComponentConfig } from './Component';
import { DOM } from '../DOM';

/**
 * Animated analog TV static noise.
 *
 * To avoid indefinitely moving content (WCAG 2.2.2 Pause, Stop, Hide), the animation stops after
 * {@link TvNoiseCanvas.MAX_ANIMATION_DURATION_MS} and leaves the last frame visible. When the user prefers reduced motion,
 * only a single static frame is rendered.
 *
 * @category Components
 */
export class TvNoiseCanvas extends Component<ComponentConfig> {
  /**
   * The maximum duration of the animation in milliseconds, after which the last rendered frame stays visible.
   */
  static readonly MAX_ANIMATION_DURATION_MS = 5000;

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
  private animationEndTime: number;

  constructor(config: ComponentConfig = {}) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-tvnoisecanvas',
      },
      this.config,
    );
  }

  protected toDomElement(): DOM {
    return (this.canvas = new DOM('canvas', { class: this.getCssClasses() }, this));
  }

  start(): void {
    // Make sure an animation from a previous start does not keep running in parallel
    this.stop();

    this.canvasElement = <HTMLCanvasElement>this.canvas.get(0);
    this.canvasContext = this.canvasElement.getContext('2d');
    this.noiseAnimationWindowPos = -this.canvasHeight;
    this.lastFrameUpdate = 0;

    this.canvasElement.width = this.canvasWidth;
    this.canvasElement.height = this.canvasHeight;

    // With reduced motion, the animation ends right after the first frame has been rendered
    const animationDuration = this.prefersReducedMotion() ? 0 : TvNoiseCanvas.MAX_ANIMATION_DURATION_MS;
    this.animationEndTime = new Date().getTime() + animationDuration;

    this.renderFrame();
  }

  stop(): void {
    if (this.useAnimationFrame) {
      cancelAnimationFrame(this.frameUpdateHandlerId);
    } else {
      clearTimeout(this.frameUpdateHandlerId);
    }
    this.frameUpdateHandlerId = undefined;
  }

  release(): void {
    super.release();
    this.stop();
  }

  private prefersReducedMotion(): boolean {
    // matchMedia is not available on some legacy platforms
    return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private renderFrame(): void {
    // This code has been copied from the player controls.js and simplified

    // The first frame is always rendered. Later frames are only rendered before the animation has ended, also when
    // their callback was scheduled before but runs after the end (e.g. when the browser delayed it).
    const isFirstFrame = this.lastFrameUpdate === 0;
    if (!isFirstFrame && this.hasAnimationEnded()) {
      this.frameUpdateHandlerId = undefined;
      return;
    }

    if (this.lastFrameUpdate + this.frameInterval > new Date().getTime()) {
      // It's too early to render the next frame
      this.scheduleNextRender();
      return;
    }

    let currentPixelOffset;
    const canvasWidth = this.canvasWidth;
    const canvasHeight = this.canvasHeight;

    // Create texture
    const noiseImage = this.canvasContext.createImageData(canvasWidth, canvasHeight);

    // Fill texture with noise
    for (let y = 0; y < canvasHeight; y++) {
      for (let x = 0; x < canvasWidth; x++) {
        currentPixelOffset = canvasWidth * y * 4 + x * 4;
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

  private hasAnimationEnded(): boolean {
    return new Date().getTime() >= this.animationEndTime;
  }

  private scheduleNextRender(): void {
    if (this.hasAnimationEnded()) {
      // Stop animating and leave the last rendered frame visible
      this.frameUpdateHandlerId = undefined;
      return;
    }

    if (this.useAnimationFrame) {
      this.frameUpdateHandlerId = window.requestAnimationFrame(this.renderFrame.bind(this));
    } else {
      this.frameUpdateHandlerId = window.setTimeout(this.renderFrame.bind(this), this.frameInterval);
    }
  }
}
