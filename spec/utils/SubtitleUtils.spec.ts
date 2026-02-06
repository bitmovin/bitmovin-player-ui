import { SubtitleSwitchHandler } from '../../src/ts/utils/SubtitleUtils';
import { MockHelper } from '../helper/MockHelper';
import { ListSelector, ListSelectorConfig } from '../../src/ts/components/lists/ListSelector';
import { PlayerSubtitlesAPI } from 'bitmovin-player';

const playerMock = MockHelper.getPlayerMock();
let subtitleSwitchHandler: SubtitleSwitchHandler;
const uiManagerMock = MockHelper.getUiInstanceManagerMock();

const ListSelectorMockClass: jest.Mock<ListSelector<ListSelectorConfig>> = jest.fn().mockImplementation(() => ({
  onItemSelected: MockHelper.getEventDispatcherMock(),
  onItemSelectionChanged: MockHelper.getEventDispatcherMock(),
  hasItem: jest.fn(),
  addItem: jest.fn(),
  removeItem: jest.fn(),
  getItems: jest.fn().mockReturnValue([]),
  synchronizeItems: jest.fn(),
  selectItem: jest.fn(),
  clearItems: jest.fn(),
}));

let listSelectorMock: ListSelector<ListSelectorConfig>;
class ListSelectorTestClass extends ListSelector<ListSelectorConfig> {}

describe('SubtitleUtils', () => {
  beforeEach(() => {
    listSelectorMock = new ListSelectorMockClass();

    playerMock.subtitles.list = jest.fn().mockReturnValue([
      {
        id: 's-1',
        label: 'S1',
        enabled: true,
      },
      {
        id: 's-2',
        label: 'S2',
        enabled: false,
      },
    ]);

    subtitleSwitchHandler = new SubtitleSwitchHandler(playerMock, listSelectorMock, uiManagerMock);
  });

  describe('adds subtitles to the listSelector', () => {
    it('on initial setup via synchronizeItems', () => {
      expect(listSelectorMock.synchronizeItems).toHaveBeenCalled();
    });

    it('on subtitleAdded event', () => {
      playerMock.eventEmitter.fireSubtitleAddedEvent('s-3', 'S3');
      expect(listSelectorMock.addItem).toHaveBeenCalledWith('s-3', 'S3');
    });
  });

  describe('removes subtitles off the listSelector', () => {
    it('on subtitleRemoved event', () => {
      jest.spyOn(listSelectorMock, 'hasItem').mockReturnValue(true);
      playerMock.eventEmitter.fireSubtitleRemovedEvent('s-1');
      expect(listSelectorMock.removeItem).toHaveBeenCalledWith('s-1');
    });
  });

  it('does not call removeItem for item that does not exist', () => {
    jest.spyOn(listSelectorMock, 'hasItem').mockReturnValue(false);
    playerMock.eventEmitter.fireSubtitleRemovedEvent('s-2');
    expect(listSelectorMock.removeItem).not.toHaveBeenCalledWith('s-2');
  });

  describe('refresh subtitles', () => {
    it('on period switch', () => {
      jest.spyOn(listSelectorMock, 'getItems').mockReturnValue([
        {
          key: 's-1',
          label: 'S1',
        },
        {
          key: 's-2',
          label: 'S2',
        },
      ]);

      playerMock.subtitles.list = jest.fn().mockReturnValue([
        {
          id: 's-1',
          label: 'S1',
        },
        {
          id: 's-3',
          label: 'S3',
        },
      ]);
      playerMock.eventEmitter.firePeriodSwitchedEvent();

      expect(listSelectorMock.synchronizeItems).toHaveBeenCalled();
    });
  });

  describe('update selected subtitle', () => {
    it('initial according to player', () => {
      expect(listSelectorMock.selectItem).toHaveBeenCalledWith('s-1');
    });

    it('on subtitleEnabled event', () => {
      playerMock.subtitles.list = jest.fn().mockReturnValue([
        {
          id: 's-1',
          label: 'S1',
          enabled: false,
        },
        {
          id: 's-3',
          label: 'S3',
          enabled: true,
        },
      ]);
      playerMock.eventEmitter.fireSubtitleEnabled();
      expect(listSelectorMock.selectItem).toHaveBeenCalledWith('s-3');
    });

    it('on SubtitleDisabled event', () => {
      playerMock.subtitles.list = jest.fn().mockReturnValue([
        {
          id: 's-1',
          label: 'S1',
          enabled: false,
        },
        {
          id: 's-3',
          label: 'S3',
          enabled: false,
        },
      ]);
      playerMock.eventEmitter.fireSubtitleDisabled();
      expect(listSelectorMock.selectItem).toHaveBeenCalledWith('null');
    });
  });

  describe('selection change intent', () => {
    it('enables subtitle on selection change', () => {
      playerMock.subtitles.enable = jest.fn();
      const subscribeMock = listSelectorMock.onItemSelectionChanged.subscribe as jest.Mock;
      const firstCall = MockHelper.getMockCall(subscribeMock, { call: 0 });
      const handler = firstCall[0] as (sender: ListSelector<ListSelectorConfig>, value: string) => void;

      handler(listSelectorMock, 's-2');

      expect(playerMock.subtitles.enable).toHaveBeenCalledWith('s-2', true);
    });

    it('disables current subtitle on selection change to off', () => {
      playerMock.subtitles.disable = jest.fn();
      playerMock.subtitles.list = jest.fn().mockReturnValue([
        {
          id: 's-1',
          label: 'S1',
          enabled: true,
        },
      ]);
      const subscribeMock = listSelectorMock.onItemSelectionChanged.subscribe as jest.Mock;
      const firstCall = MockHelper.getMockCall(subscribeMock, { call: 0 });
      const handler = firstCall[0] as (sender: ListSelector<ListSelectorConfig>, value: string) => void;

      handler(listSelectorMock, 'null');

      expect(playerMock.subtitles.disable).toHaveBeenCalledWith('s-1');
    });
  });

  describe('clears subtitle list', () => {
    it('on sourceUnloaded event', () => {
      playerMock.eventEmitter.fireSourceUnloadedEvent();

      expect(listSelectorMock.clearItems).toHaveBeenCalled();
    });
  });

  it('checks if the subtitle API is available on initialization', () => {
    const originalSubtitles = (playerMock as any).subtitles;
    (playerMock as any).subtitles = undefined;
    listSelectorMock = new ListSelectorMockClass();
    subtitleSwitchHandler = new SubtitleSwitchHandler(playerMock, listSelectorMock, uiManagerMock);

    expect(listSelectorMock.synchronizeItems).not.toHaveBeenCalled();

    (playerMock as any).subtitles = originalSubtitles;
  });

  describe('player-driven subtitle changes', () => {
    it('does not call back into the player when subtitles are changed by player events', () => {
      const player = MockHelper.getPlayerMock();
      const uiManager = MockHelper.getUiInstanceManagerMock();
      const listSelector = new ListSelectorTestClass();

      player.subtitles.list = jest.fn().mockReturnValue([
        {
          id: 's-1',
          label: 'S1',
          enabled: true,
        },
      ]);
      player.subtitles.enable = jest.fn();
      player.subtitles.disable = jest.fn();

      new SubtitleSwitchHandler(player, listSelector, uiManager);

      (player.subtitles.enable as jest.Mock).mockClear();
      (player.subtitles.disable as jest.Mock).mockClear();

      player.subtitles.list = jest.fn().mockReturnValue([
        {
          id: 's-2',
          label: 'S2',
          enabled: true,
        },
      ]);
      player.eventEmitter.fireSubtitleEnabled();

      expect(player.subtitles.enable).not.toHaveBeenCalled();
      expect(player.subtitles.disable).not.toHaveBeenCalled();
    });
  });
});
