export type InsertHtmlFn = (html: string) => void;

// JournalEntry.vue instances register themselves here by journal index while mounted, so
// campaign.appendToJournal can insert at the last-known cursor position via the editor's
// own insertHTML command - undoable through QEditor's native undo/redo, since it goes
// through the same document.execCommand path as typing - instead of blindly appending to
// the end. Falls back to a raw append when the target entry isn't currently mounted (e.g.
// filtered out of view by search).
const registry: { [index: number]: InsertHtmlFn } = {};

export const registerJournalInsert = (index: number, fn: InsertHtmlFn) => {
  registry[index] = fn;
};

export const unregisterJournalInsert = (index: number) => {
  delete registry[index];
};

export const insertAtCursor = (index: number, html: string): boolean => {
  const fn = registry[index];
  if (!fn) return false;
  fn(html);
  return true;
};
