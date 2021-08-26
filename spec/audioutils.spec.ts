import { MockHelper } from './helper/MockHelper';
import { ListSelector, ListSelectorConfig } from '../src/ts/components/listselector';
import { AudioTrackSwitchHandler } from '../src/ts/audiotrackutils';
import { AudioTrack } from 'bitmovin-player';

let playerMock = MockHelper.getPlayerMock();
let audioTrackSwitchHandler: AudioTrackSwitchHandler;
let uiManagerMock = MockHelper.getUiInstanceManagerMock();

let ListSelectorMockClass: jest.Mock<ListSelector<ListSelectorConfig>> = jest.fn().mockImplementation(() => ({
  onItemSelected: MockHelper.getEventDispatcherMock(),
  hasItem: jest.fn(),
  addItem: jest.fn(),
  removeItem: jest.fn(),
  getItems: jest.fn().mockReturnValue([]),
  synchronizeItems: jest.fn(),
  selectItem: jest.fn(),
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

    it('on audioAdded event', () => {
      playerMock.eventEmitter.fireAudioAddedEvent('a-3', 'A3');
      expect(listSelectorMock.addItem).toHaveBeenCalledWith('a-3', expect.any(Function), true);
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
});
