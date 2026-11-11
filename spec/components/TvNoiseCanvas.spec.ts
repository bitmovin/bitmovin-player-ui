import { TvNoiseCanvas } from '../../src/ts/components/TvNoiseCanvas';

describe('TvNoiseCanvas', () => {
  let tvNoiseCanvas: TvNoiseCanvas;
  let putImageDataMock: jest.Mock;
  let originalMatchMedia: typeof window.matchMedia;

  const mockMatchMedia = (prefersReducedMotion: boolean) => {
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: prefersReducedMotion && query === '(prefers-reduced-motion: reduce)',
      media: query,
    }));
  };

  const renderedFrameCount = () => putImageDataMock.mock.calls.length;

  beforeEach(() => {
    jest.useFakeTimers();
    originalMatchMedia = window.matchMedia;
    mockMatchMedia(false);

    putImageDataMock = jest.fn();
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      createImageData: (width: number, height: number) => ({ data: new Uint8ClampedArray(width * height * 4) }),
      putImageData: putImageDataMock,
    } as unknown as CanvasRenderingContext2D);

    tvNoiseCanvas = new TvNoiseCanvas();
    tvNoiseCanvas.getDomElement();
  });

  afterEach(() => {
    tvNoiseCanvas.stop();
    window.matchMedia = originalMatchMedia;
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe.each([
    ['requestAnimationFrame', true],
    ['setTimeout', false],
  ])('when scheduling frames with %s', (_, useAnimationFrame) => {
    beforeEach(() => {
      tvNoiseCanvas['useAnimationFrame'] = useAnimationFrame;
    });

    it('should animate until the maximum animation duration has passed', () => {
      tvNoiseCanvas.start();
      jest.advanceTimersByTime(TvNoiseCanvas.MAX_ANIMATION_DURATION_MS - 1000);

      const framesBeforeEnd = renderedFrameCount();
      jest.advanceTimersByTime(500);

      expect(framesBeforeEnd).toBeGreaterThan(1);
      expect(renderedFrameCount()).toBeGreaterThan(framesBeforeEnd);
    });

    it('should stop animating after the maximum animation duration and keep the last frame', () => {
      tvNoiseCanvas.start();
      jest.advanceTimersByTime(TvNoiseCanvas.MAX_ANIMATION_DURATION_MS + 500);

      const framesAtEnd = renderedFrameCount();
      jest.advanceTimersByTime(TvNoiseCanvas.MAX_ANIMATION_DURATION_MS * 2);

      expect(renderedFrameCount()).toBe(framesAtEnd);
      expect(jest.getTimerCount()).toBe(0);
    });

    it('should render a single static frame when the user prefers reduced motion', () => {
      mockMatchMedia(true);

      tvNoiseCanvas.start();
      jest.advanceTimersByTime(TvNoiseCanvas.MAX_ANIMATION_DURATION_MS * 2);

      expect(renderedFrameCount()).toBe(1);
      expect(jest.getTimerCount()).toBe(0);
    });

    it('should stop rendering frames when stopped', () => {
      tvNoiseCanvas.start();
      tvNoiseCanvas.stop();
      jest.advanceTimersByTime(TvNoiseCanvas.MAX_ANIMATION_DURATION_MS);

      expect(renderedFrameCount()).toBe(1);
      expect(jest.getTimerCount()).toBe(0);
    });

    it('should not keep a previous animation running when started again', () => {
      tvNoiseCanvas.start();
      tvNoiseCanvas.start();
      tvNoiseCanvas.stop();
      jest.advanceTimersByTime(TvNoiseCanvas.MAX_ANIMATION_DURATION_MS);

      expect(renderedFrameCount()).toBe(2);
      expect(jest.getTimerCount()).toBe(0);
    });

    it('should restart the animation for the full duration when started again after it ended', () => {
      tvNoiseCanvas.start();
      jest.advanceTimersByTime(TvNoiseCanvas.MAX_ANIMATION_DURATION_MS + 500);
      const framesOfFirstAnimation = renderedFrameCount();

      tvNoiseCanvas.start();
      jest.advanceTimersByTime(TvNoiseCanvas.MAX_ANIMATION_DURATION_MS - 1000);

      expect(renderedFrameCount()).toBeGreaterThan(framesOfFirstAnimation + 1);
    });

    it('should stop rendering frames when released', () => {
      tvNoiseCanvas.start();
      tvNoiseCanvas.release();
      jest.advanceTimersByTime(TvNoiseCanvas.MAX_ANIMATION_DURATION_MS);

      expect(renderedFrameCount()).toBe(1);
      expect(jest.getTimerCount()).toBe(0);
    });
  });

  it('should animate when matchMedia is not available', () => {
    window.matchMedia = undefined;

    tvNoiseCanvas.start();
    jest.advanceTimersByTime(1000);

    expect(renderedFrameCount()).toBeGreaterThan(1);
  });
});
