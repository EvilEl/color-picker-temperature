# color-picker-temperature-react

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
