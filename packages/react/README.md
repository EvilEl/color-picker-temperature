# color-picker-temperature-react

React adapter for [`color-picker-temperature`](https://www.npmjs.com/package/color-picker-temperature). See the other [framework integrations](https://github.com/EvilEl/color-picker-temperature#framework-integrations) and the [React example](https://github.com/EvilEl/color-picker-temperature/tree/main/examples/react).

```sh
npm install color-picker-temperature color-picker-temperature-react
```

```tsx
import { ColorTemperaturePicker } from 'color-picker-temperature-react';

<ColorTemperaturePicker
  value={color}
  onChange={setColor}
  width="100%"
  height={64}
  kelvinStart={1000}
  kelvinEnd={40000}
/>
```

Use `defaultValue` for an uncontrolled picker. The forwarded ref exposes `getColor`, `setColor`, and `destroy`.
