import { AudioTrackSelectBox } from '../../src/ts/components/audiotrackselectbox';

describe('AudioTrackSelectBox', () => {
  let audioListSelector: AudioTrackSelectBox;
  let onItemAddedEventSpy: jest.SpyInstance;

  describe('addItem', () => {
    beforeEach(() => {
      audioListSelector = new AudioTrackSelectBox();
      onItemAddedEventSpy = jest.spyOn(audioListSelector as any, 'onItemAddedEvent').mockImplementation(() => {});
    });

    it('triggers onItemAddedEvent', () => {
      audioListSelector.addItem('itemKeyNew', 'itemLabelNew');

      expect(onItemAddedEventSpy).toHaveBeenCalled();
    });
    
    it('adds items respecting the key order', () => {
      audioListSelector.addItem('A', 'itemA');
      audioListSelector.addItem('C', 'itemC');
      audioListSelector.addItem('B', 'itemB');

      expect(audioListSelector.getItems()).toEqual([
        { key: 'A', label: 'itemA' },
        { key: 'B', label: 'itemB' },
        { key: 'C', label: 'itemC' },
      ]);
    });
  });
});
