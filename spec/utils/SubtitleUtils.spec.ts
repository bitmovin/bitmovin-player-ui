import { SubtitleSwitchHandler } from '../../src/ts/utils/SubtitleUtils';
import { MockHelper } from '../helper/MockHelper';
import { ListSelector, ListSelectorConfig } from '../../src/ts/components/lists/ListSelector';
import { i18n } from '../../src/ts/localization/i18n';

let playerMock = MockHelper.getPlayerMock();
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
    playerMock = MockHelper.getPlayerMock();
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('adds subtitles to the listSelector', () => {
    it('on initial setup via synchronizeItems', () => {
      expect(listSelectorMock.synchronizeItems).toHaveBeenCalled();
    });

    it('on subtitleAdded event via synchronizeItems', () => {
      playerMock.subtitles.list = jest.fn().mockReturnValue([
        { id: 's-1', label: 'S1', enabled: true },
        { id: 's-3', label: 'S3', enabled: false },
      ]);
      playerMock.eventEmitter.fireSubtitleAddedEvent('s-3', 'S3');
      expect(listSelectorMock.synchronizeItems).toHaveBeenCalledTimes(2);
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

  describe('subtitleComparator', () => {
    it('re-sorts visible subtitles on UI config updates, keeps off first, and preserves selection', () => {
      const onUpdated = MockHelper.getEventDispatcherMock();
      const uiManagerWithComparator = MockHelper.getUiInstanceManagerMock();
      jest.spyOn(uiManagerWithComparator, 'getConfig').mockReturnValue({
        events: { onUpdated },
        subtitleComparator: (a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label),
      } as any);

      playerMock.subtitles.list = jest.fn().mockReturnValue([
        { id: 's-3', label: 'Vietnamese', enabled: true },
        { id: 's-1', label: 'English', enabled: false },
      ]);

      const localListSelector = new ListSelectorTestClass();
      new SubtitleSwitchHandler(playerMock, localListSelector, uiManagerWithComparator);

      expect(localListSelector.getItems().map(i => i.key)).toEqual(['null', 's-1', 's-3']);
      expect(localListSelector.getSelectedItem()).toBe('s-3');

      playerMock.subtitles.list = jest.fn().mockReturnValue([
        { id: 's-3', label: 'Vietnamese', enabled: false },
        { id: 's-2', label: 'French', enabled: true },
        { id: 's-1', label: 'English', enabled: false },
      ]);

      const refreshSubtitles = MockHelper.getMockCallArg<(sender: unknown) => void>(onUpdated.subscribe);
      refreshSubtitles(uiManagerWithComparator);

      expect(localListSelector.getItems().map(i => i.key)).toEqual(['null', 's-1', 's-2', 's-3']);
      expect(localListSelector.getSelectedItem()).toBe('s-2');
    });

    it('sorts subtitles by the comparator defined in UIConfig', () => {
      const uiManagerWithComparator = MockHelper.getUiInstanceManagerMock();
      jest.spyOn(uiManagerWithComparator, 'getConfig').mockReturnValue({
        events: { onUpdated: MockHelper.getEventDispatcherMock() },
        subtitleComparator: (a: { label: string }, b: { label: string }) => b.label.localeCompare(a.label),
      } as any);

      playerMock.subtitles.list = jest.fn().mockReturnValue([
        { id: 's-1', label: 'English', enabled: false },
        { id: 's-2', label: 'Vietnamese', enabled: false },
        { id: 's-3', label: 'Taiwanese', enabled: false },
      ]);

      const localListSelector = new ListSelectorMockClass();
      new SubtitleSwitchHandler(playerMock, localListSelector, uiManagerWithComparator);

      const items: { key: string }[] = (localListSelector.synchronizeItems as jest.Mock).mock.calls[0][0];
      // off item is always first, then tracks in comparator order (descending: Vietnamese, Taiwanese, English)
      expect(items.map(i => i.key)).toEqual(['null', 's-2', 's-3', 's-1']);
    });

    it('does not mutate the original array returned by the player', () => {
      const uiManagerWithComparator = MockHelper.getUiInstanceManagerMock();
      jest.spyOn(uiManagerWithComparator, 'getConfig').mockReturnValue({
        events: { onUpdated: MockHelper.getEventDispatcherMock() },
        subtitleComparator: (a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label),
      } as any);

      const originalSubtitles = [
        { id: 's-3', label: 'Vietnamese', enabled: false },
        { id: 's-1', label: 'English', enabled: false },
      ];
      playerMock.subtitles.list = jest.fn().mockReturnValue(originalSubtitles);

      const localListSelector = new ListSelectorMockClass();
      new SubtitleSwitchHandler(playerMock, localListSelector, uiManagerWithComparator);

      expect(originalSubtitles[0].id).toBe('s-3');
    });

    it('preserves original order when no comparator is set', () => {
      const items: { key: string }[] = (listSelectorMock.synchronizeItems as jest.Mock).mock.calls[0][0];
      expect(items.map(i => i.key)).toEqual(['null', 's-1', 's-2']);
    });

    it('sorts correctly when SubtitleAdded events fire incrementally', () => {
      const uiManagerWithComparator = MockHelper.getUiInstanceManagerMock();
      jest.spyOn(uiManagerWithComparator, 'getConfig').mockReturnValue({
        events: { onUpdated: MockHelper.getEventDispatcherMock() },
        subtitleComparator: (a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label),
      } as any);

      playerMock.subtitles.list = jest.fn().mockReturnValue([]);
      const localListSelector = new ListSelectorMockClass();
      new SubtitleSwitchHandler(playerMock, localListSelector, uiManagerWithComparator);

      // First SubtitleAdded: only Vietnamese available
      playerMock.subtitles.list = jest.fn().mockReturnValue([{ id: 's-3', label: 'Vietnamese', enabled: false }]);
      playerMock.eventEmitter.fireSubtitleAddedEvent('s-3', 'Vietnamese');

      // Second SubtitleAdded: English now also available
      playerMock.subtitles.list = jest.fn().mockReturnValue([
        { id: 's-3', label: 'Vietnamese', enabled: false },
        { id: 's-1', label: 'English', enabled: false },
      ]);
      playerMock.eventEmitter.fireSubtitleAddedEvent('s-1', 'English');

      const lastCall: { key: string }[] = (localListSelector.synchronizeItems as jest.Mock).mock.calls.slice(-1)[0][0];
      // off item always first, then tracks in comparator order
      expect(lastCall.map(i => i.key)).toEqual(['null', 's-1', 's-3']);
    });

    it('reselects the current subtitle after applying the comparator', () => {
      const uiManagerWithComparator = MockHelper.getUiInstanceManagerMock();
      jest.spyOn(uiManagerWithComparator, 'getConfig').mockReturnValue({
        events: { onUpdated: MockHelper.getEventDispatcherMock() },
        subtitleComparator: (a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label),
      } as any);

      playerMock.subtitles.list = jest.fn().mockReturnValue([
        { id: 's-2', label: 'Vietnamese', enabled: false },
        { id: 's-1', label: 'English', enabled: true },
      ]);

      const localListSelector = new ListSelectorMockClass();
      new SubtitleSwitchHandler(playerMock, localListSelector, uiManagerWithComparator);

      expect(localListSelector.selectItem).toHaveBeenCalledWith('s-1');
    });
  });

  describe('adapts localization to subtitle language', () => {
    let getConfigSpy: jest.SpyInstance;

    afterEach(() => {
      getConfigSpy?.mockRestore();
    });

    it('triggers language change when enabled', () => {
      getConfigSpy = jest.spyOn(i18n, 'getConfig').mockReturnValue({
        adaptLocalizationToSubtitleLanguage: true,
      });

      const setLanguageSpy = jest.spyOn(i18n, 'setLanguage');
      playerMock.eventEmitter.fireSubtitleEnabled({ id: 's-1', lang: 'es' });

      expect(setLanguageSpy).toHaveBeenCalledWith('es');
    });

    it('does not trigger language change when disabled', () => {
      getConfigSpy = jest.spyOn(i18n, 'getConfig').mockReturnValue({
        adaptLocalizationToSubtitleLanguage: false,
      });

      const setLanguageSpy = jest.spyOn(i18n, 'setLanguage');
      playerMock.eventEmitter.fireSubtitleEnabled({ id: 's-1', lang: 'es' });

      expect(setLanguageSpy).not.toHaveBeenCalled();
    });

    it('ignores missing or empty language codes', () => {
      getConfigSpy = jest.spyOn(i18n, 'getConfig').mockReturnValue({
        adaptLocalizationToSubtitleLanguage: true,
      });

      const setLanguageSpy = jest.spyOn(i18n, 'setLanguage');
      playerMock.eventEmitter.fireSubtitleEnabled({ id: 's-1', lang: ' ' });
      playerMock.eventEmitter.fireSubtitleEnabled({ id: 's-2' });

      expect(setLanguageSpy).not.toHaveBeenCalled();
    });

    it('trims language codes before applying', () => {
      getConfigSpy = jest.spyOn(i18n, 'getConfig').mockReturnValue({
        adaptLocalizationToSubtitleLanguage: true,
      });

      const setLanguageSpy = jest.spyOn(i18n, 'setLanguage');
      playerMock.eventEmitter.fireSubtitleEnabled({ id: 's-1', lang: ' es ' });

      expect(setLanguageSpy).toHaveBeenCalledWith('es');
    });
  });
});
