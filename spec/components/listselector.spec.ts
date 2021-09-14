import { ListItem, ListSelector, ListSelectorConfig } from '../../src/ts/components/listselector';

class ListSelectorTestClass extends ListSelector<ListSelectorConfig> {
}

let listSelector: ListSelectorTestClass;

describe('ListSelector', () => {
  beforeEach(() => {
    listSelector = new ListSelectorTestClass();
  });

  describe('addItem', () => {
    beforeEach(() => {
    });

    it('adds a new item', () => {
      listSelector.addItem('itemKey', 'itemLabel');

      expect(listSelector.getItems()).toEqual([{ key: 'itemKey', label: 'itemLabel' }]);
    });

    it('adds new items to the end of the list', () => {
      listSelector.addItem('A', 'itemA');
      listSelector.addItem('C', 'itemC');
      listSelector.addItem('B', 'itemB');

      expect(listSelector.getItems()).toEqual([
        { key: 'A', label: 'itemA' },
        { key: 'C', label: 'itemC' },
        { key: 'B', label: 'itemB' },
      ]);
    });

    it('adds items respecting the key order if sortedInsert is true', () => {
      const sortedInsert = true;
      listSelector.addItem('A', 'itemA', sortedInsert);
      listSelector.addItem('C', 'itemC', sortedInsert);
      listSelector.addItem('B', 'itemB', sortedInsert);

      expect(listSelector.getItems()).toEqual([
        { key: 'A', label: 'itemA' },
        { key: 'B', label: 'itemB' },
        { key: 'C', label: 'itemC' },
      ]);
    });

    it('overrides existing value', () => {
      listSelector.addItem('itemKey', 'itemLabelOld');
      listSelector.addItem('itemKey', 'itemLabelNew');

      expect(listSelector.getItems()).toEqual([{ key: 'itemKey', label: 'itemLabelNew' }]);
    });

    it('triggers onItemAddedEvent', () => {
      const spy = jest.fn();
      listSelector.onItemAdded.subscribe(spy);
      listSelector.addItem('itemKeyNew', 'itemLabelNew');

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('removeItem', () => {
    beforeEach(() => {
      listSelector.addItem('itemKey', 'itemLabel');
    });

    it('removes existing element', () => {
      const result = listSelector.removeItem('itemKey');
      expect(listSelector.getItems()).toEqual([]);
      expect(result).toBeTruthy();
    });

    it('returns false if element does not exist', () => {
      const result = listSelector.removeItem('itemKeyA');
      expect(listSelector.getItems()).toEqual([{ key: 'itemKey', label: 'itemLabel' }]);
      expect(result).toBeFalsy();
    });

    it('triggers onItemRemovedEvent', () => {
      const spy = jest.fn();
      listSelector.onItemRemoved.subscribe(spy);
      listSelector.removeItem('itemKey');

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('clearItems', () => {
    beforeEach(() => {
      listSelector.addItem('I-1', 'L-1');
      listSelector.addItem('I-2', 'L-2');
      listSelector.addItem('I-3', 'L-3');
    });

    it('removes all items', () => {
      listSelector.clearItems();
      expect(listSelector.getItems()).toEqual([]);
    });

    it('clears selected item', () => {
      listSelector.clearItems();
      expect(listSelector.getSelectedItem()).toBeNull();
    });

    it('send onItemRemovedEvent for all items', () => {
      const spy = jest.fn();
      listSelector.onItemRemoved.subscribe(spy);

      listSelector.clearItems();
      expect(spy).toHaveBeenCalledTimes(3);
    });
  });

  describe('selectItem', () => {
    beforeEach(() => {
      listSelector.addItem('itemKey', 'itemLabel');
    });

    it('update selected item', () => {
      listSelector.selectItem('itemKey');
      expect(listSelector.getSelectedItem()).toEqual('itemKey');
    });

    it('returns false if selected item does not exist', () => {
      const result = listSelector.selectItem('notExistingKey');
      expect(listSelector.getSelectedItem()).toBeUndefined();
      expect(result).toBeFalsy();
    });

    it('triggers onItemSelectedEvent', () => {
      const spy = jest.fn();
      listSelector.onItemSelected.subscribe(spy);

      listSelector.selectItem('itemKey');
      expect(spy).toHaveBeenCalled();
    });

    it('does not trigger onItemSelectedEvent when we don\'t change the selected item', () => {
      const spy = jest.fn();
      listSelector.onItemSelected.subscribe(spy);

      listSelector.selectItem('notExistingKey');
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('getItemForKey', () => {
    it('returns requested item', () => {
      listSelector.addItem('I-1', 'L-1');
      expect(listSelector.getItemForKey('I-1')).toEqual({ key: 'I-1', label: 'L-1'});
    });

    it('returns undefined if key not found', () => {
      expect(listSelector.getItemForKey('I-1')).toBeUndefined();
    });
  });

  describe('synchronizeItems', () => {
    const newItems: ListItem[] = [
      {
        key: 'I-1',
        label: 'L-1',
      },
      {
        key: 'I-3',
        label: 'L-3',
      },
      {
        key: 'I-4',
        label: 'L-4',
      },
    ];

    beforeEach(() => {
      listSelector.addItem('I-1', 'L-1');
      listSelector.addItem('I-2', 'L-2');
      listSelector.addItem('I-3', 'L-3');
    });

    it('match new items', () => {
      listSelector.synchronizeItems(newItems);

      expect(listSelector.getItems()).toEqual([
        {
          key: 'I-1',
          label: 'L-1',
        },
        {
          key: 'I-3',
          label: 'L-3',
        },
        {
          key: 'I-4',
          label: 'L-4',
        },
      ]);
    });

    it('triggers onItemRemovedEvent only for really removed items', () => {
      const spy = jest.fn();
      listSelector.onItemRemoved.subscribe(spy);

      listSelector.synchronizeItems(newItems);
      expect(spy).toHaveBeenCalledWith(expect.anything(), 'I-2');
      expect(spy).not.toHaveBeenCalledWith(expect.anything(), 'I-1');
      expect(spy).not.toHaveBeenCalledWith(expect.anything(), 'I-3');
    });

    it('triggers onItemAddedEvent only for really added items', () => {
      const spy = jest.fn();
      listSelector.onItemAdded.subscribe(spy);

      listSelector.synchronizeItems(newItems);
      expect(spy).toHaveBeenCalledWith(expect.anything(), 'I-4');
      expect(spy).not.toHaveBeenCalledWith(expect.anything(), 'I-1');
      expect(spy).not.toHaveBeenCalledWith(expect.anything(), 'I-2');
      expect(spy).not.toHaveBeenCalledWith(expect.anything(), 'I-3');
    });
  });
});
