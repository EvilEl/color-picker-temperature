# Contributing

## Development

Development checks use Node.js 22 or newer. The library itself runs in the browser.

```sh
npm ci
npm run check-types
npm test
npm run build
npm run test:browser
npm run pack:check
```

The repository uses npm workspaces. The original package lives in `packages/core`; framework adapters live in `packages/react`, `packages/vue`, and `packages/astro`. Runnable consumers live under `examples`.

`npm test` builds the publishable packages, runs core regressions, and exercises React/Vue lifecycle and SSR behavior. `npm run build` also creates production builds of all four examples.

`npm run test:browser` uses installed Google Chrome in headless mode and a temporary profile. On other installations, set `CHROME_PATH` to the Chrome executable. It exercises real canvas rendering, mouse/touch input, resizing, hidden initialization, legacy adapters, the new core API, Astro multi-instance initialization, and cleanup.

`npm run pack:check` packs all four publishable workspaces into a temporary directory, installs those tarballs into an isolated consumer, checks their entry points, and removes the temporary files without publishing.
