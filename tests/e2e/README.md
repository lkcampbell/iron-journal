# E2E tests

Playwright specs covering user-facing flows. One file per flow, not per component.

## Running

```bash
yarn test:e2e        # headless, runs against a dev server (starts one if none is running)
yarn test:e2e:ui     # interactive UI mode, good for writing/debugging a spec
```

`playwright.config.ts` sets `reuseExistingServer: true` outside CI, so if you already have
`yarn dev` running on port 8080, Playwright attaches to it instead of starting a new one.

## Coverage

| Spec | Flow | If you touch... |
| --- | --- | --- |
| `move-insertion.spec.ts` | Roll a move outcome and save it to the journal | `src/components/Moves/Move.vue`, `src/lib/moves.ts`, `src/lib/journalNotes.ts` |
| `journal-entry.spec.ts` | Create a journal entry, set its title, type content | `src/components/Journal/Journal.vue`, `src/components/Journal/JournalEntry.vue`, `src/lib/journalEditor.ts` |
| `progress-track.spec.ts` | Mark a progress track box and reload | `src/components/Tracks/ProgressTrack.vue`, `src/lib/tracks.ts` |

Before manually re-verifying a UI change in a browser, check whether one of these already
covers the flow and run it first — extend the matching spec (or add a new one) when you add a
new user-facing flow, rather than only checking by hand.

## Selectors

The app has no `data-testid` attributes beyond what these specs need. Add one to whatever
element a new spec has to target rather than relying on text/CSS selectors, which break on
copy or style changes.

## Notes

- The right drawer (Oracles/Moves/Journal) is open by default at desktop viewport widths
  (`show-if-above` in `MainLayout.vue`) — no need to click the toggle button to reach it.
- `campaign.appendToJournal` always inserts into journal entry index 0, and that entry is
  auto-expanded, so specs can assert on `journal-entry-0` directly.
- Autosave to IndexedDB is debounced 1s (`src/App.vue`) — wait for it before reloading if a
  spec needs to check persistence.
