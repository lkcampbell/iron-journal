import { describe, expect, it, vi } from 'vitest';
import { insertAtCursor, registerJournalInsert, unregisterJournalInsert } from './journalEditor';

describe('journalEditor', () => {
  it('routes insertAtCursor to the fn registered for that index', () => {
    const fn = vi.fn();
    registerJournalInsert(2, fn);

    const handled = insertAtCursor(2, '<div>note</div>');

    expect(handled).toBe(true);
    expect(fn).toHaveBeenCalledWith('<div>note</div>');
    unregisterJournalInsert(2);
  });

  it('returns false and calls nothing when no entry is registered at that index', () => {
    const fn = vi.fn();
    registerJournalInsert(3, fn);
    unregisterJournalInsert(3);

    const handled = insertAtCursor(3, '<div>note</div>');

    expect(handled).toBe(false);
    expect(fn).not.toHaveBeenCalled();
  });

  it('only invokes the fn registered for the matching index', () => {
    const fnA = vi.fn();
    const fnB = vi.fn();
    registerJournalInsert(5, fnA);
    registerJournalInsert(6, fnB);

    insertAtCursor(6, '<div>b</div>');

    expect(fnA).not.toHaveBeenCalled();
    expect(fnB).toHaveBeenCalledWith('<div>b</div>');
    unregisterJournalInsert(5);
    unregisterJournalInsert(6);
  });
});
