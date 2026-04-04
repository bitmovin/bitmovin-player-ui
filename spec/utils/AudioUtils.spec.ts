import { MockHelper } from '../helper/MockHelper';
import { ListSelector, ListSelectorConfig } from '../../src/ts/components/lists/ListSelector';
import { AudioTrackSwitchHandler } from '../../src/ts/utils/AudioTrackUtils';
import { AudioTrack } from 'bitmovin-player';

const playerMock = MockHelper.getPlayerMock();
let audioTrackSwitchHandler: AudioTrackSwitchHandler;
const uiManagerMock = MockHelper.getUiInstanceManagerMock();

const ListSelectorMockClass: jest.Mock<ListSelector<ListSelectorConfig>> = jest.fn().mockImplementation(() => ({
  onItemSelected: MockHelper.getEventDispatcherMock(),
  onItemSelectionChanged: MockHelper.getEventDispatcherMock(),
  hasItem: jest.fn(),
  addItem: jest.fn(),
  removeItem: jest.fn(),
  getItems: jest.fn().mockReturnValue([]),
  getSelectedItem: jest.fn().mockReturnValue(null),
  synchronizeItems: jest.fn(),
  selectItem: jest.fn(),
  clearItems: jest.fn(),
}));

let listSelectorMock: ListSelector<ListSelectorConfig>;

describe('AudioUtils', () => {
  beforeEach(() => {
    listSelectorMock = new ListSelectorMockClass();

    jest.spyOn(playerMock, 'getAvailableAudio').mockReturnValue([
      {
        id: 'a-1',
        label: 'A1',
        lang: 'en',
      } as AudioTrack,
      {
        id: 'a-2',
        label: 'A2',
        lang: 'de',
      } as AudioTrack,
    ]);

    jest.spyOn(playerMock, 'getAudio').mockReturnValue({
      id: 'a-1',
      label: 'A1',
      lang: 'en',
    } as AudioTrack);

    audioTrackSwitchHandler = new AudioTrackSwitchHandler(playerMock, listSelectorMock, uiManagerMock);
  });

  describe('adds audio tracks to the listSelector', () => {
    it('on initial setup via synchronizeItems', () => {
      expect(listSelectorMock.synchronizeItems).toHaveBeenCalled();
    });

    it('on audioAdded event via synchronizeItems', () => {
      playerMock.eventEmitter.fireAudioAddedEvent('a-3', 'A3');
      expect(listSelectorMock.synchronizeItems).toHaveBeenCalledTimes(2);
    });
  });

  describe('removes audio tracks off the listSelector', () => {
    it('on audioRemoved event', () => {
      jest.spyOn(listSelectorMock, 'hasItem').mockReturnValue(true);
      playerMock.eventEmitter.fireAudioRemovedEvent('a-1');
      expect(listSelectorMock.removeItem).toHaveBeenCalledWith('a-1');
    });
  });

  it('does not call removeItem for item that does not exist', () => {
    jest.spyOn(listSelectorMock, 'hasItem').mockReturnValue(false);
    playerMock.eventEmitter.fireAudioRemovedEvent('s-2');
    expect(listSelectorMock.removeItem).not.toHaveBeenCalledWith('s-2');
  });

  describe('refresh audio tracks', () => {
    it('on period switch', () => {
      jest.spyOn(listSelectorMock, 'getItems').mockReturnValue([
        {
          key: 'a-1',
          label: 'A1',
        },
        {
          key: 'a-2',
          label: 'A2',
        },
      ]);

      jest.spyOn(playerMock, 'getAvailableAudio').mockReturnValue([
        {
          id: 'a-1',
          label: 'A1',
          lang: 'en',
        } as AudioTrack,
        {
          id: 'a-3',
          label: 'A3',
          lang: 'fr',
        } as AudioTrack,
      ]);
      playerMock.eventEmitter.firePeriodSwitchedEvent();

      expect(listSelectorMock.synchronizeItems).toHaveBeenCalled();
    });
  });

  describe('update selected audio track', () => {
    it('initial according to player', () => {
      expect(listSelectorMock.selectItem).toHaveBeenCalledWith('a-1');
    });

    it('on audioChanged event', () => {
      jest.spyOn(playerMock, 'getAudio').mockReturnValue({
        id: 'a-2',
        label: 'A1',
        lang: 'en',
      } as AudioTrack);
      playerMock.eventEmitter.fireAudioChangedEvent();
      expect(listSelectorMock.selectItem).toHaveBeenCalledWith('a-2');
    });
  });

  describe('selection change intent', () => {
    it('sets audio track on selection change', () => {
      const subscribeMock = listSelectorMock.onItemSelectionChanged.subscribe as jest.Mock;
      const firstCall = MockHelper.getMockCall(subscribeMock, { call: 0 });
      const handler = firstCall[0] as (sender: ListSelector<ListSelectorConfig>, value: string) => void;

      handler(listSelectorMock, 'a-2');

      expect(playerMock.setAudio).toHaveBeenCalledWith('a-2');
    });
  });
});
