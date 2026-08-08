# Iron Journal

Quasar Framework (Vue 3 + Pinia) app for journalling solo Ironsworn RPG campaigns. Built with
`@quasar/app-webpack` (webpack, not Vite). Uses Yarn Berry — run `yarn`, not `npm`.

## Testing

```bash
yarn test:unit         # Vitest, runs once
yarn test:unit:watch   # Vitest, watch mode
yarn test:e2e          # Playwright, headless
yarn test:e2e:ui       # Playwright, interactive UI mode
yarn test              # unit + e2e
```

- **Unit specs** live colocated next to the code they test: `src/lib/moves.spec.ts` beside
  `src/lib/moves.ts`. They cover the framework-agnostic logic in `src/lib/` (moves, journal
  insertion, progress tracks, dice rolling). Pinia stores and Vue components aren't
  unit-tested — that surface is covered by the e2e suite instead.
- **E2E specs** live in `tests/e2e/*.spec.ts`, one file per user-facing flow. See
  [tests/e2e/README.md](tests/e2e/README.md) for what's covered and which source files map to
  which spec.

Before reconstructing manual browser verification for a change, check whether an existing
Playwright spec already covers the flow and run it. When adding a new user-facing flow, extend
the matching spec or add a new one rather than only checking by hand — that's what keeps
verification cheap on the next change instead of being rebuilt from scratch every time.

Quasar's official Vitest/Playwright app-extensions don't work with this project's webpack-based
build (see `vitest.config.ts`'s comments and `tests/e2e/README.md`), so both are configured
directly rather than via `quasar ext add`.
