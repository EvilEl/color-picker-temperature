# color-picker-temperature-astro

Astro adapter for [`color-picker-temperature`](https://www.npmjs.com/package/color-picker-temperature). See the other [framework integrations](https://github.com/EvilEl/color-picker-temperature#framework-integrations) and the [Astro example](https://github.com/EvilEl/color-picker-temperature/tree/main/examples/astro).

```sh
npm install color-picker-temperature color-picker-temperature-astro
```

```astro
---
import ColorTemperaturePicker from 'color-picker-temperature-astro';
---

<ColorTemperaturePicker width="100%" height={64} value="rgb(255, 200, 140)" />

<script>
  document.addEventListener('color-temperature-change', (event) => {
    console.log((event as CustomEvent<{ color: string }>).detail.color);
  });
</script>
```

The component renders a stable host during SSR, initializes each picker independently in the browser, and cleans up before Astro view transitions.
