# Color Picker Temperature

A framework-independent Kelvin temperature picker with first-party adapters for React, Vue and Astro.

## Packages

| Package | Description |
| --- | --- |
| [`color-picker-temperature`](./packages/core) | Browser core and vanilla API |
| [`@color-picker-temperature/react`](./packages/react) | React component and imperative ref |
| [`@color-picker-temperature/vue`](./packages/vue) | Vue component with `v-model` |
| [`@color-picker-temperature/astro`](./packages/astro) | SSR-safe Astro component |

## Development

```sh
npm install
npm run check-types
npm test
npm run build
```

Runnable examples live in `examples/vanilla`, `examples/react`, `examples/vue`, and `examples/astro`.
