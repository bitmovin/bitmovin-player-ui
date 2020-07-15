import { MockHelper } from '../helper/MockHelper';
import { TimelineMarkersHandler } from '../../src/ts/components/timelinemarkershandler';
import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../../src/ts/uimanager';
import { TimelineMarker } from '../../src/ts/uiconfig';
import { DOM } from '../../src/ts/dom';

const getTimelineMarker = (time: number): TimelineMarker => ({
  time,
  title: 'Title',
  duration: 2,
});

describe('TimelineMarkersHandler', () => {
  let timelineMarkersHandlerMock: TimelineMarkersHandler;
  let DOMMock: DOM;
  let playerMock: PlayerAPI;
  let uimanagerMock: UIInstanceManager;

  beforeEach(() => {
    DOMMock = MockHelper.generateDOMMock();
    const config = {
      snappingRange: 2,
    };
    timelineMarkersHandlerMock = new TimelineMarkersHandler(config, () => 100, DOMMock);
    playerMock = MockHelper.getPlayerMock();
    uimanagerMock = MockHelper.getUiInstanceManagerMock();
  });

  describe('TimelineMarkers VOD', () => {
    it('should return TimelineMarker', () => {
      const expectedMarker = getTimelineMarker(4);
      uimanagerMock.getConfig().metadata.markers.push(expectedMarker);
      jest.spyOn(playerMock, 'getSeekableRange').mockReturnValue({start: 0, end: 10});
      jest.spyOn(playerMock, 'isLive').mockReturnValue(false);
      jest.spyOn(playerMock, 'getDuration').mockReturnValue(10);

      timelineMarkersHandlerMock.initialize(playerMock, uimanagerMock);
      const marker = timelineMarkersHandlerMock.getMarkerAtPosition(41);

      expect(marker).not.toBeUndefined();
      expect(marker.marker).toEqual(expectedMarker);
    });
  });

  describe('TimelineMarkers LIVE', () => {
    beforeEach(() => {
      jest.spyOn(playerMock, 'getCurrentTime').mockReturnValue(200);
      jest.spyOn(playerMock, 'getTimeShift').mockReturnValue(0);
      jest.spyOn(playerMock, 'getMaxTimeShift').mockReturnValue(-100);
      jest.spyOn(playerMock, 'isLive').mockReturnValue(true);
      jest.spyOn(playerMock, 'getDuration').mockReturnValue(Infinity);
    });

    it('should return TimelineMarker', () => {
      const expectedMarker = getTimelineMarker(180);
      uimanagerMock.getConfig().metadata.markers.push(expectedMarker);


      timelineMarkersHandlerMock.initialize(playerMock, uimanagerMock);
      const marker = timelineMarkersHandlerMock.getMarkerAtPosition(81);

      expect(marker).not.toBeUndefined();
      expect(marker.marker).toEqual(expectedMarker);
    });

    it('should remove TimelineMarker that are outside timeshift range (Passed)', () => {
      const expectedMarker = getTimelineMarker(90);
      uimanagerMock.getConfig().metadata.markers.push(expectedMarker);

      timelineMarkersHandlerMock.initialize(playerMock, uimanagerMock);
      const markers = uimanagerMock.getConfig().metadata.markers;

      expect(markers).toHaveLength(0);
    });

    it('should not display TimelineMarkers that are outside timeshift range (Upcoming)', () => {
      const expectedMarker = getTimelineMarker(220);
      uimanagerMock.getConfig().metadata.markers.push(expectedMarker);

      timelineMarkersHandlerMock.initialize(playerMock, uimanagerMock);
      const markers = uimanagerMock.getConfig().metadata.markers;

      expect(DOMMock.append).not.toHaveBeenCalled();
      expect(markers).toHaveLength(1);
    });
  });
});
