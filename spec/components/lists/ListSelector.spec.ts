import { ListItem, ListSelector, ListSelectorConfig } from '../../../src/ts/components/lists/ListSelector';
import { i18n } from '../../../src/ts/localization/i18n';

class ListSelectorTestClass extends ListSelector<ListSelectorConfig> {}

let listSelector: ListSelectorTestClass;

describe('ListSelector', () => {
  beforeEach(() => {
    listSelector = new ListSelectorTestClass();
  });

  describe('addItem', () => {
    beforeEach(() => {});

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

    it('adds items respecting comparator order when a comparator is configured', () => {
      listSelector = new ListSelectorTestClass({
        comparator: (itemA, itemB) => String(itemA.label).localeCompare(String(itemB.label)),
      });

      listSelector.addItem('I-3', 'L-3');
      listSelector.addItem('I-1', 'L-1');
      listSelector.addItem('I-2', 'L-2');

      expect(listSelector.getItems()).toEqual([
        { key: 'I-1', label: 'L-1' },
        { key: 'I-2', label: 'L-2' },
        { key: 'I-3', label: 'L-3' },
      ]);
    });

    it('produces the same order via addItem as synchronizeItems when a comparator is configured', () => {
      const comparator = (itemA: ListItem, itemB: ListItem) => String(itemA.label).localeCompare(String(itemB.label));
      const items = [
        { key: 'I-3', label: 'L-3' },
        { key: 'I-1', label: 'L-1' },
        { key: 'I-2', label: 'L-2' },
      ];

      const byAddItem = new ListSelectorTestClass({ comparator });
      items.forEach(item => byAddItem.addItem(item.key, item.label));

      const bySynchronize = new ListSelectorTestClass({ comparator });
      bySynchronize.synchronizeItems(items);

      expect(byAddItem.getItems()).toEqual(bySynchronize.getItems());
    });

    it('triggers onItemAddedEvent', () => {
      const spy = jest.fn();
      listSelector.onItemAdded.subscribe(spy);
      listSelector.addItem('itemKeyNew', 'itemLabelNew');

      expect(spy).toHaveBeenCalled();
    });

    it('triggers onItemsChangedEvent', () => {
      const spy = jest.fn();
      listSelector.onItemsChanged.subscribe(spy);

      listSelector.addItem('itemKeyNew', 'itemLabelNew');

      expect(spy).toHaveBeenCalledWith(listSelector, null);
    });
  });

  describe('addItem with custom aria label', () => {
    it('adds a new item with custom aria label', () => {
      listSelector.addItem('itemKey', 'itemLabel', false, 'itemAriaLabel');

      expect(listSelector.getItems()).toEqual([{ key: 'itemKey', label: 'itemLabel', ariaLabel: 'itemAriaLabel' }]);
    });

    it('adds new items to the end of the list with custom aria label', () => {
      listSelector.addItem('A', 'itemA', false, 'itemAriaLabelA');
      listSelector.addItem('C', 'itemC', false, 'itemAriaLabelB');
      listSelector.addItem('B', 'itemB', false, 'itemAriaLabelC');

      expect(listSelector.getItems()).toEqual([
        { key: 'A', label: 'itemA', ariaLabel: 'itemAriaLabelA' },
        { key: 'C', label: 'itemC', ariaLabel: 'itemAriaLabelB' },
        { key: 'B', label: 'itemB', ariaLabel: 'itemAriaLabelC' },
      ]);
    });

    it('adds items respecting the key order if sortedInsert is true and with custom aria label', () => {
      const sortedInsert = true;
      listSelector.addItem('A', 'itemA', sortedInsert, 'itemAriaLabelA');
      listSelector.addItem('C', 'itemC', sortedInsert, 'itemAriaLabelC');
      listSelector.addItem('B', 'itemB', sortedInsert, 'itemAriaLabelB');

      expect(listSelector.getItems()).toEqual([
        { key: 'A', label: 'itemA', ariaLabel: 'itemAriaLabelA' },
        { key: 'B', label: 'itemB', ariaLabel: 'itemAriaLabelB' },
        { key: 'C', label: 'itemC', ariaLabel: 'itemAriaLabelC' },
      ]);
    });

    it('overrides existing value with custom aria label', () => {
      listSelector.addItem('itemKey', 'itemLabelOld', false, 'itemAriaLabelOld');
      listSelector.addItem('itemKey', 'itemLabelNew', false, 'itemAriaLabelNew');

      expect(listSelector.getItems()).toEqual([
        { key: 'itemKey', label: 'itemLabelNew', ariaLabel: 'itemAriaLabelNew' },
      ]);
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

    it('triggers onItemsChangedEvent when removal succeeds', () => {
      const spy = jest.fn();
      listSelector.onItemsChanged.subscribe(spy);

      listSelector.removeItem('itemKey');

      expect(spy).toHaveBeenCalledWith(listSelector, null);
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

    it('triggers onItemsChangedEvent', () => {
      const spy = jest.fn();
      listSelector.onItemsChanged.subscribe(spy);

      listSelector.clearItems();

      expect(spy).toHaveBeenCalledWith(listSelector, null);
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
      expect(listSelector.getSelectedItem()).toBeNull();
      expect(result).toBeFalsy();
    });

    it('triggers onItemSelectedEvent', () => {
      const spy = jest.fn();
      listSelector.onItemSelected.subscribe(spy);

      listSelector.selectItem('itemKey');
      expect(spy).toHaveBeenCalled();
    });

    it("does not trigger onItemSelectedEvent when we don't change the selected item", () => {
      const spy = jest.fn();
      listSelector.onItemSelected.subscribe(spy);

      listSelector.selectItem('notExistingKey');
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('dispatchItemSelectionChanged', () => {
    beforeEach(() => {
      listSelector.addItem('itemKey', 'itemLabel');
      listSelector.addItem('itemKey2', 'itemLabel2');
    });

    it('updates selected item by default and dispatches selection change event', () => {
      const selectionChangedSpy = jest.fn();
      const itemSelectedSpy = jest.fn();
      listSelector.onItemSelectionChanged.subscribe(selectionChangedSpy);
      listSelector.onItemSelected.subscribe(itemSelectedSpy);

      listSelector.dispatchItemSelectionChanged('itemKey');

      expect(listSelector.getSelectedItem()).toEqual('itemKey');
      expect(selectionChangedSpy).toHaveBeenCalledWith(listSelector, 'itemKey');
      expect(itemSelectedSpy).toHaveBeenCalledWith(listSelector, 'itemKey');
    });

    it('does not update selected item when updateSelectedItem is false but still dispatches event', () => {
      const selectionChangedSpy = jest.fn();
      const itemSelectedSpy = jest.fn();
      listSelector.onItemSelectionChanged.subscribe(selectionChangedSpy);
      listSelector.onItemSelected.subscribe(itemSelectedSpy);

      listSelector.selectItem('itemKey');
      listSelector.dispatchItemSelectionChanged('itemKey2', false);

      expect(listSelector.getSelectedItem()).toEqual('itemKey');
      expect(selectionChangedSpy).toHaveBeenCalledWith(listSelector, 'itemKey2');
      expect(itemSelectedSpy).not.toHaveBeenCalledWith(listSelector, 'itemKey2');
    });
  });

  describe('getItemForKey', () => {
    it('returns requested item', () => {
      listSelector.addItem('I-1', 'L-1');
      expect(listSelector.getItemForKey('I-1')).toEqual({ key: 'I-1', label: 'L-1' });
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

    it('triggers onItemsChangedEvent when the effective list changes', () => {
      const spy = jest.fn();
      listSelector.onItemsChanged.subscribe(spy);

      listSelector.synchronizeItems(newItems);

      expect(spy).toHaveBeenCalledWith(listSelector, null);
    });

    it('does not trigger onItemsChangedEvent when the effective list stays the same', () => {
      const spy = jest.fn();
      listSelector.onItemsChanged.subscribe(spy);

      listSelector.synchronizeItems([
        {
          key: 'I-1',
          label: 'L-1',
        },
        {
          key: 'I-2',
          label: 'L-2',
        },
        {
          key: 'I-3',
          label: 'L-3',
        },
      ]);

      expect(spy).not.toHaveBeenCalled();
    });

    it('does not trigger onItemsChangedEvent when localized labels are recreated but unchanged', () => {
      listSelector = new ListSelectorTestClass();
      listSelector.addItem('null', i18n.getLocalizer('off'));

      const spy = jest.fn();
      listSelector.onItemsChanged.subscribe(spy);

      listSelector.synchronizeItems([
        {
          key: 'null',
          label: i18n.getLocalizer('off'),
        },
      ]);

      expect(spy).not.toHaveBeenCalled();
    });

    it('reorders synchronized items when a comparator is configured', () => {
      listSelector = new ListSelectorTestClass({
        comparator: (itemA, itemB) => String(itemA.label).localeCompare(String(itemB.label)),
      });
      listSelector.addItem('I-3', 'L-3');
      listSelector.addItem('I-1', 'L-1');
      listSelector.addItem('I-2', 'L-2');

      listSelector.synchronizeItems([
        {
          key: 'I-3',
          label: 'L-3',
        },
        {
          key: 'I-1',
          label: 'L-1',
        },
        {
          key: 'I-2',
          label: 'L-2',
        },
      ]);

      expect(listSelector.getItems()).toEqual([
        {
          key: 'I-1',
          label: 'L-1',
        },
        {
          key: 'I-2',
          label: 'L-2',
        },
        {
          key: 'I-3',
          label: 'L-3',
        },
      ]);
    });

    it('triggers onItemsChangedEvent when only the order changes', () => {
      listSelector = new ListSelectorTestClass({
        items: [
          {
            key: 'I-3',
            label: 'L-3',
          },
          {
            key: 'I-1',
            label: 'L-1',
          },
          {
            key: 'I-2',
            label: 'L-2',
          },
        ],
        comparator: (itemA, itemB) => String(itemA.label).localeCompare(String(itemB.label)),
      });

      const itemsChangedSpy = jest.fn();
      const itemAddedSpy = jest.fn();
      const itemRemovedSpy = jest.fn();
      listSelector.onItemsChanged.subscribe(itemsChangedSpy);
      listSelector.onItemAdded.subscribe(itemAddedSpy);
      listSelector.onItemRemoved.subscribe(itemRemovedSpy);

      listSelector.synchronizeItems([
        {
          key: 'I-3',
          label: 'L-3',
        },
        {
          key: 'I-1',
          label: 'L-1',
        },
        {
          key: 'I-2',
          label: 'L-2',
        },
      ]);

      expect(itemsChangedSpy).toHaveBeenCalledWith(listSelector, null);
      expect(itemAddedSpy).not.toHaveBeenCalled();
      expect(itemRemovedSpy).not.toHaveBeenCalled();
    });
  });
});
