# Iron Journal (iron-journal)

App for journalling solo Ironsworn campaigns

## Install the dependencies
```bash
yarn
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```

### Lint the files
```bash
yarn run lint
```

### Run the tests
```bash
yarn test:unit         # Vitest unit tests (src/lib/*.spec.ts)
yarn test:unit:watch   # same, in watch mode
yarn test:e2e          # Playwright end-to-end tests (tests/e2e/*.spec.ts)
yarn test:e2e:ui       # same, in interactive UI mode
yarn test              # unit + e2e
```
`yarn test:e2e` starts a dev server automatically if one isn't already running on port 8080. See
[tests/e2e/README.md](tests/e2e/README.md) for what each e2e spec covers.

### Build the app for production
```bash
quasar build
```

### Customize the configuration
See [Configuring quasar.conf.js](https://v2.quasar.dev/quasar-cli/quasar-conf-js).
