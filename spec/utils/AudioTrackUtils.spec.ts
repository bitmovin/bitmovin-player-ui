import { AudioTrackSwitchHandler } from '../../src/ts/utils/AudioTrackUtils';
import { MockHelper } from '../helper/MockHelper';
import { ListSelector, ListSelectorConfig } from '../../src/ts/components/lists/ListSelector';

let playerMock = MockHelper.getPlayerMock();
const uiManagerMock = MockHelper.getUiInstanceManagerMock();

const ListSelectorMockClass: jest.Mock<ListSelector<ListSelectorConfig>> = jest.fn().mockImplementation(() => ({
  onItemSelected: MockHelper.getEventDispatcherMock(),
  onItemSelectionChanged: MockHelper.getEventDispatcherMock(),
  hasItem: jest.fn(),
  addItem: jest.fn(),
  removeItem: jest.fn(),
  getItems: jest.fn().mockReturnValue([]),
  getSelectedItem: jest.fn().mockReturnValue(null),
  getConfig: jest.fn().mockReturnValue({}),
  synchronizeItems: jest.fn(),
  selectItem: jest.fn(),
  clearItems: jest.fn(),
}));

let listSelectorMock: ListSelector<ListSelectorConfig>;
class ListSelectorTestClass extends ListSelector<ListSelectorConfig> {}

describe('AudioTrackUtils', () => {
  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    listSelectorMock = new ListSelectorMockClass();

    playerMock.getAvailableAudio = jest.fn().mockReturnValue([
      { id: 'a-1', label: 'English' },
      { id: 'a-2', label: 'Taiwanese' },
      { id: 'a-3', label: 'Vietnamese' },
    ]);

    new AudioTrackSwitchHandler(playerMock, listSelectorMock, uiManagerMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('adds audio tracks to the listSelector', () => {
    it('on initial setup via synchronizeItems', () => {
      expect(listSelectorMock.synchronizeItems).toHaveBeenCalled();
    });

    it('on audioAdded event via addItem when no comparator is configured', () => {
      playerMock.getAvailableAudio = jest.fn().mockReturnValue([
        { id: 'a-1', label: 'English' },
        { id: 'a-4', label: 'French' },
      ]);
      playerMock.eventEmitter.fireAudioAddedEvent('a-4', 'French');
      expect(listSelectorMock.addItem).toHaveBeenCalledWith('a-4', expect.any(Function), true);
      expect(listSelectorMock.synchronizeItems).toHaveBeenCalledTimes(1);
    });

    it('uses the event payload when the getter is stale and no comparator is configured', () => {
      playerMock.getAvailableAudio = jest.fn().mockReturnValue([{ id: 'a-1', label: 'English' }]);

      playerMock.eventEmitter.fireAudioAddedEvent('a-4', 'French');

      expect(listSelectorMock.addItem).toHaveBeenCalledWith('a-4', expect.any(Function), true);
      expect(listSelectorMock.synchronizeItems).toHaveBeenCalledTimes(1);
    });
  });

  describe('removes audio tracks from the listSelector', () => {
    it('on audioRemoved event', () => {
      jest.spyOn(listSelectorMock, 'hasItem').mockReturnValue(true);
      playerMock.eventEmitter.fireAudioRemovedEvent('a-1');
      expect(listSelectorMock.removeItem).toHaveBeenCalledWith('a-1');
    });

    it('does not call removeItem for item that does not exist', () => {
      jest.spyOn(listSelectorMock, 'hasItem').mockReturnValue(false);
      playerMock.eventEmitter.fireAudioRemovedEvent('a-1');
      expect(listSelectorMock.removeItem).not.toHaveBeenCalled();
    });
  });

  describe('list selector comparator', () => {
    it('re-sorts visible items on UI config updates and keeps the current selection', () => {
      const onUpdated = MockHelper.getEventDispatcherMock();
      const uiManagerWithEvents = MockHelper.getUiInstanceManagerMock();
      jest.spyOn(uiManagerWithEvents, 'getConfig').mockReturnValue({
        events: { onUpdated },
      } as any);

      playerMock.getAvailableAudio = jest.fn().mockReturnValue([
        { id: 'a-3', label: 'Vietnamese' },
        { id: 'a-1', label: 'English' },
      ]);
      playerMock.getAudio = jest.fn().mockReturnValue({ id: 'a-3', label: 'Vietnamese' });

      const localListSelector = new ListSelectorTestClass({
        comparator: (itemA, itemB) => String(itemA.label).localeCompare(String(itemB.label)),
      });
      new AudioTrackSwitchHandler(playerMock, localListSelector, uiManagerWithEvents);

      expect(localListSelector.getItems().map(i => i.key)).toEqual(['a-1', 'a-3']);
      expect(localListSelector.getSelectedItem()).toBe('a-3');

      playerMock.getAvailableAudio = jest.fn().mockReturnValue([
        { id: 'a-3', label: 'Vietnamese' },
        { id: 'a-2', label: 'French' },
        { id: 'a-1', label: 'English' },
      ]);
      playerMock.getAudio = jest.fn().mockReturnValue({ id: 'a-2', label: 'French' });

      const refreshAudioTracks = MockHelper.getMockCallArg<(sender: unknown) => void>(onUpdated.subscribe);
      refreshAudioTracks(uiManagerWithEvents);

      expect(localListSelector.getItems().map(i => i.key)).toEqual(['a-1', 'a-2', 'a-3']);
      expect(localListSelector.getSelectedItem()).toBe('a-2');
    });

    it('sorts audio tracks by the comparator defined in the list selector config', () => {
      const uiManagerWithEvents = MockHelper.getUiInstanceManagerMock();
      jest.spyOn(uiManagerWithEvents, 'getConfig').mockReturnValue({
        events: { onUpdated: MockHelper.getEventDispatcherMock() },
      } as any);

      playerMock.getAvailableAudio = jest.fn().mockReturnValue([
        { id: 'a-2', label: 'Taiwanese' },
        { id: 'a-1', label: 'English' },
        { id: 'a-3', label: 'Vietnamese' },
      ]);

      const localListSelector = new ListSelectorTestClass({
        comparator: (itemA, itemB) => String(itemA.label).localeCompare(String(itemB.label)),
      });
      new AudioTrackSwitchHandler(playerMock, localListSelector, uiManagerWithEvents);

      expect(localListSelector.getItems().map(i => i.key)).toEqual(['a-1', 'a-2', 'a-3']);
    });

    it('does not mutate the original array returned by the player', () => {
      const uiManagerWithEvents = MockHelper.getUiInstanceManagerMock();
      jest.spyOn(uiManagerWithEvents, 'getConfig').mockReturnValue({
        events: { onUpdated: MockHelper.getEventDispatcherMock() },
      } as any);

      const originalTracks = [
        { id: 'a-2', label: 'Taiwanese' },
        { id: 'a-1', label: 'English' },
      ];
      playerMock.getAvailableAudio = jest.fn().mockReturnValue(originalTracks);

      const localListSelector = new ListSelectorTestClass({
        comparator: (itemA, itemB) => String(itemA.label).localeCompare(String(itemB.label)),
      });
      new AudioTrackSwitchHandler(playerMock, localListSelector, uiManagerWithEvents);

      expect(originalTracks[0].id).toBe('a-2');
    });

    it('preserves original order when no comparator is set', () => {
      const items: { key: string }[] = (listSelectorMock.synchronizeItems as jest.Mock).mock.calls[0][0];
      expect(items.map(i => i.key)).toEqual(['a-1', 'a-2', 'a-3']);
    });

    it('sorts correctly when AudioAdded events fire incrementally', () => {
      const uiManagerWithEvents = MockHelper.getUiInstanceManagerMock();
      jest.spyOn(uiManagerWithEvents, 'getConfig').mockReturnValue({
        events: { onUpdated: MockHelper.getEventDispatcherMock() },
      } as any);

      playerMock.getAvailableAudio = jest.fn().mockReturnValue([]);
      const localListSelector = new ListSelectorTestClass({
        comparator: (itemA, itemB) => String(itemA.label).localeCompare(String(itemB.label)),
      });
      new AudioTrackSwitchHandler(playerMock, localListSelector, uiManagerWithEvents);

      // First AudioAdded: only Vietnamese available
      playerMock.getAvailableAudio = jest.fn().mockReturnValue([{ id: 'a-3', label: 'Vietnamese' }]);
      playerMock.eventEmitter.fireAudioAddedEvent('a-3', 'Vietnamese');

      // Second AudioAdded: English now also available
      playerMock.getAvailableAudio = jest.fn().mockReturnValue([
        { id: 'a-3', label: 'Vietnamese' },
        { id: 'a-1', label: 'English' },
      ]);
      playerMock.eventEmitter.fireAudioAddedEvent('a-1', 'English');

      expect(localListSelector.getItems().map(i => i.key)).toEqual(['a-1', 'a-3']);
    });

    it('reselects the current audio track after applying the comparator', () => {
      const uiManagerWithEvents = MockHelper.getUiInstanceManagerMock();
      jest.spyOn(uiManagerWithEvents, 'getConfig').mockReturnValue({
        events: { onUpdated: MockHelper.getEventDispatcherMock() },
      } as any);
      playerMock.getAudio = jest.fn().mockReturnValue({ id: 'a-3', label: 'Vietnamese' });

      const localListSelector = new ListSelectorMockClass();
      new AudioTrackSwitchHandler(playerMock, localListSelector, uiManagerWithEvents);

      expect(localListSelector.selectItem).toHaveBeenCalledWith('a-3');
    });

    it('preserves the previous selection on refresh when the player does not expose a current audio track', () => {
      const onUpdated = MockHelper.getEventDispatcherMock();
      const uiManagerWithEvents = MockHelper.getUiInstanceManagerMock();
      jest.spyOn(uiManagerWithEvents, 'getConfig').mockReturnValue({
        events: { onUpdated },
      } as any);

      playerMock.getAvailableAudio = jest.fn().mockReturnValue([
        { id: 'a-2', label: 'Taiwanese' },
        { id: 'a-1', label: 'English' },
      ]);
      playerMock.getAudio = jest.fn().mockReturnValue({ id: 'a-2', label: 'Taiwanese' });

      const localListSelector = new ListSelectorTestClass({
        comparator: (itemA, itemB) => String(itemA.label).localeCompare(String(itemB.label)),
      });
      new AudioTrackSwitchHandler(playerMock, localListSelector, uiManagerWithEvents);

      expect(localListSelector.getSelectedItem()).toBe('a-2');

      playerMock.getAvailableAudio = jest.fn().mockReturnValue([
        { id: 'a-3', label: 'French' },
        { id: 'a-2', label: 'Taiwanese' },
        { id: 'a-1', label: 'English' },
      ]);
      playerMock.getAudio = jest.fn().mockReturnValue(undefined);

      const refreshAudioTracks = MockHelper.getMockCallArg<(sender: unknown) => void>(onUpdated.subscribe);
      refreshAudioTracks(uiManagerWithEvents);

      expect(localListSelector.getItems().map(i => i.key)).toEqual(['a-1', 'a-3', 'a-2']);
      expect(localListSelector.getSelectedItem()).toBe('a-2');
    });
  });
});
