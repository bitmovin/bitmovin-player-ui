import { RootNavigationGroup } from '../../src/ts/spatialnavigation/rootnavigationgroup';
import { SeekBarHandler } from '../../src/ts/spatialnavigation/seekbarhandler';
import { NodeEventSubscriber } from '../../src/ts/spatialnavigation/nodeeventsubscriber';
import { Action, Direction } from '../../src/ts/spatialnavigation/types';

jest.mock('../../src/ts/spatialnavigation/nodeeventsubscriber');

describe('SeekBarHandler', () => {
  let seekBarHandler: SeekBarHandler;
  let seekBarMock: jest.Mocked<Element>;
  let eventSubscriberOnSpy: jest.SpyInstance;
  let eventSubscriberOffSpy: jest.SpyInstance;
  let documentDispatchEventSpy: jest.SpyInstance;
  let rootNavigationGroupMock: RootNavigationGroup;
  let seekBarWrapperMock: jest.Mocked<HTMLElement>;
  let playbackPositionMarkerMock: jest.Mocked<HTMLElement>;

  beforeAll(() => jest.useFakeTimers());

  beforeEach(() => {
    seekBarWrapperMock = createSeekBarWrapperMock();
    rootNavigationGroupMock = {} as RootNavigationGroup;
    seekBarHandler = new SeekBarHandler(rootNavigationGroupMock);
    documentDispatchEventSpy = jest.spyOn(document, 'dispatchEvent');
    playbackPositionMarkerMock = getPlaybackPositionMarker(seekBarWrapperMock);
    seekBarMock = getSeekBar(seekBarWrapperMock);
    eventSubscriberOnSpy = jest.spyOn(NodeEventSubscriber.prototype, 'on');
    eventSubscriberOffSpy = jest.spyOn(NodeEventSubscriber.prototype, 'off');
  });

  afterEach(() => documentDispatchEventSpy.mockRestore());

  afterAll(() => jest.useRealTimers());

  it('should overwrite the onAction and onNavigation callbacks on the RootNavigationGroup', () => {
    expect(rootNavigationGroupMock.onAction).toEqual(expect.any(Function));
    expect(rootNavigationGroupMock.onNavigation).toEqual(expect.any(Function));
  });

  describe('onNavigation', () => {
    let preventDefaultSpy: jest.Mock;

    beforeEach(() => (preventDefaultSpy = jest.fn()));

    test.each`
      direction
      ${Direction.DOWN}
      ${Direction.UP}
      ${Direction.LEFT}
      ${Direction.RIGHT}
    `("should not prevent default if the event target isn't the seekbar with direction=$direction", ({ direction }) => {
      rootNavigationGroupMock.onNavigation!(direction, document.createElement('div'), preventDefaultSpy);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    test.each`
      direction
      ${Direction.DOWN}
      ${Direction.UP}
    `('should stop scrubbing when onDirection is called with direction=$direction', ({ direction }) => {
      rootNavigationGroupMock.onNavigation!(direction, seekBarWrapperMock, preventDefaultSpy);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
      expect(seekBarMock.dispatchEvent).toHaveBeenCalledWith(new MouseEvent('mouseleave'));
      expect(eventSubscriberOnSpy).not.toHaveBeenCalled();
    });

    it('should increase scrubSpeedPercentage', () => {
      for(let i = 0; i < 20; i++) {
        rootNavigationGroupMock.onNavigation!(Direction.RIGHT, seekBarWrapperMock, preventDefaultSpy);
      }
      const mousePositions = scrubbingPositionsFromMouseEventMock(seekBarMock.dispatchEvent);

      expect(getScrubbingSpeeds(mousePositions)).toBeTruthy();
    });

    test.each`
      direction
      ${Direction.RIGHT}
      ${Direction.LEFT}
    `('should reset scrubSpeedPercentage when stop scrubbing with direction=$direction', ({ direction }) => {
      for(let i = 0; i < 20; i++) {
        rootNavigationGroupMock.onNavigation!(direction, seekBarWrapperMock, preventDefaultSpy);
      }

      const mousePositions = scrubbingPositionsFromMouseEventMock(seekBarMock.dispatchEvent);
      const initialScrubbingSpeeds = getScrubbingSpeeds(mousePositions);
      const initialMinDelta = initialScrubbingSpeeds[0];

      seekBarMock.dispatchEvent.mockReset();
      jest.advanceTimersByTime(1000);

      rootNavigationGroupMock.onNavigation!(direction, seekBarWrapperMock, preventDefaultSpy);
      rootNavigationGroupMock.onNavigation!(direction, seekBarWrapperMock, preventDefaultSpy);

      const mousePositionsAfterReset = scrubbingPositionsFromMouseEventMock(seekBarMock.dispatchEvent);
      const afterResetScrubbingSpeeds = getScrubbingSpeeds(mousePositionsAfterReset);
      const afterResetMinDelta = afterResetScrubbingSpeeds[0];

      expect(initialMinDelta).toEqual(afterResetMinDelta);
    })
  });

  describe('onAction', () => {
    let preventDefaultSpy: jest.Mock;

    beforeEach(() => (preventDefaultSpy = jest.fn()));

    test.each`
      action
      ${Action.SELECT}
      ${Action.BACK}
    `('should not prevent default if the event target is not the seek bar with action=$action', ({ action }) => {
      rootNavigationGroupMock.onAction!(action, document.createElement('div'), preventDefaultSpy);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it('should ignore SELECT actions when not actively scrubbing', () => {
      rootNavigationGroupMock.onAction!(Action.SELECT, seekBarWrapperMock, preventDefaultSpy)

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it('should dispatch a mouse click event when the SELECT action is triggered while scrubbing', () => {
      eventSubscriberOnSpy.mockImplementation((_, __, handler: EventListener) => handler(null as any));
      rootNavigationGroupMock.onNavigation!(Direction.RIGHT, seekBarWrapperMock, preventDefaultSpy);
      preventDefaultSpy.mockReset();
      rootNavigationGroupMock.onAction!(Action.SELECT, seekBarWrapperMock, preventDefaultSpy);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(seekBarMock.dispatchEvent).toHaveBeenCalledWith(new MouseEvent('mousedown'));
      expect(seekBarMock.dispatchEvent).toHaveBeenCalledWith(new MouseEvent('mouseleave'));
      expect(eventSubscriberOnSpy).toHaveBeenCalledWith(seekBarMock, 'mousedown', expect.any(Function));
      expect(eventSubscriberOffSpy).toHaveBeenCalledWith(seekBarMock, 'mousedown', expect.any(Function));
      expect(documentDispatchEventSpy).toHaveBeenCalledWith(
        new MouseEvent('mouseup', expect.anything() as MouseEventInit),
      );
    });

    it('should stop seeking when the BACK action is triggered', () => {
      rootNavigationGroupMock.onAction!(Action.BACK, seekBarWrapperMock, preventDefaultSpy);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(seekBarMock.dispatchEvent).toHaveBeenCalledWith(new MouseEvent('mouseleave'));
      expect(eventSubscriberOnSpy).not.toHaveBeenCalled();
    });
  });

  describe('release', () => {
    it('should release the NodeEventSubscriber', () => {
      const nodeEventSubscriberReleaseSpy = jest.spyOn(NodeEventSubscriber.prototype, 'release');

      seekBarHandler.release();

      expect(nodeEventSubscriberReleaseSpy).toHaveBeenCalled();
    });

    it('should reset the onAction and onNavigation callbacks on the RootNavigationGroup', () => {
      seekBarHandler.release();

      expect(rootNavigationGroupMock.onAction).not.toBeDefined();
      expect(rootNavigationGroupMock.onNavigation).not.toBeDefined();
    });
  });
});

function createSeekBarMock(): jest.Mocked<Element> {
  return { dispatchEvent: jest.fn() } as unknown as jest.Mocked<Element>;
}

function createPlaybackPositionMarkerMock(): jest.Mocked<HTMLElement> {
  const boundingRect = { x: 0, y: 0, width: 100, height: 10 } as DOMRect;

  return { getBoundingClientRect: jest.fn().mockReturnValue(boundingRect) } as unknown as jest.Mocked<HTMLElement>;
}

function createSeekBarWrapperMock(): jest.Mocked<HTMLElement> {
  const seekBarMock = createSeekBarMock();
  const playbackPositionMarkerMock = createPlaybackPositionMarkerMock();
  const boundingRect = { x: 0, y: 0, width: 100, height: 10 } as DOMRect;

  return {
    children: { item: () => seekBarMock },
    querySelector: () => playbackPositionMarkerMock,
    classList: ['-ui-seekbar'],
    getBoundingClientRect: jest.fn().mockReturnValue(boundingRect),
  } as unknown as jest.Mocked<HTMLElement>;
}

function getSeekBar(seekBarWrapperMock: jest.Mocked<HTMLElement>): jest.Mocked<Element> {
  return seekBarWrapperMock.children.item(0) as jest.Mocked<Element>;
}

function getPlaybackPositionMarker(seekBarWrapperMock: jest.Mocked<HTMLElement>): jest.Mocked<HTMLElement> {
  return seekBarWrapperMock.querySelector('') as jest.Mocked<HTMLElement>;
}

function scrubbingPositionsFromMouseEventMock(spy: jest.MockInstance<any, any>): number[] {
  return spy.mock.calls.map(([event]) => Math.abs((event as MouseEvent).clientX));
}

function getScrubbingSpeeds(scrubbingPositions: number[]): number[] {
  const speeds = [0];

  for (let idx = 1; idx < scrubbingPositions.length; idx++) {
    speeds.push(scrubbingPositions[idx] - scrubbingPositions[idx - 1]);
  }

  return speeds;
}
