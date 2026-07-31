import { defineStore } from 'pinia';

import { EMapItems } from 'components/models';

export interface ISelectedMapItem {
  map: number;
  cell: string;
  type: EMapItems;
  id: number;
}

export const useSelection = defineStore({
  id: 'selection',

  state() {
    return {
      selected: null as ISelectedMapItem | null,
    };
  },

  actions: {
    select(map: number, cell: string, type: EMapItems, id: number) {
      this.selected = { map, cell, type, id };
    },

    clear() {
      this.selected = null;
    },

    isSelected(map: number, cell: string, type: EMapItems, id: number): boolean {
      return (
        this.selected !== null &&
        this.selected.map === map &&
        this.selected.cell === cell &&
        this.selected.type === type &&
        this.selected.id === id
      );
    },

    // Keep the selection pointed at the right item (or clear it) whenever an
    // item is spliced out of a map/cell/type list, regardless of which UI
    // deleted it: later items in the same list shift down an index, and the
    // selected item itself may be the one being removed.
    itemRemoved(type: EMapItems, map: number, cell: string, index: number) {
      if (this.selected === null) return;
      if (this.selected.map !== map || this.selected.cell !== cell || this.selected.type !== type) return;

      if (this.selected.id === index) {
        this.selected = null;
      } else if (this.selected.id > index) {
        this.selected.id -= 1;
      }
    },

    // Keep the selection following the moved item (or adjust its index)
    // when an item is relocated from one map/cell list to another. Mirrors
    // the store's splice-then-unshift order, so it also holds for a move
    // within the same cell.
    itemMoved(type: EMapItems, from: { map: number; cell: string }, to: { map: number; cell: string }, index: number) {
      if (this.selected === null || this.selected.type !== type) return;

      if (this.selected.map === from.map && this.selected.cell === from.cell && this.selected.id === index) {
        this.selected = { map: to.map, cell: to.cell, type, id: 0 };
        return;
      }

      if (this.selected.map === from.map && this.selected.cell === from.cell && this.selected.id > index) {
        this.selected.id -= 1;
      }

      if (this.selected.map === to.map && this.selected.cell === to.cell) {
        this.selected.id += 1;
      }
    },
  },
});
