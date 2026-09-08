# Color Picker Temperature

A canvas color picker for a Kelvin temperature gradient. Requires a browser with Canvas 2D, Pointer Events and ResizeObserver for automatic resizing, including recovery from a hidden container. Without ResizeObserver, the component redraws on window resize.

![Color Picker Temperature preview](https://raw.githubusercontent.com/EvilEl/color-picker-temperature/main/docs/color-picker-preview.png)

## Install

```sh
npm install color-picker-temperature
# or
pnpm add color-picker-temperature
# or
yarn add color-picker-temperature
```

## Usage

```ts
import { ColorTemperature, type ICanvasOptions } from 'color-picker-temperature';

const options: ICanvasOptions = {
  width: '100%',
  height: 100,
  kelvinStart: 1000,
  kelvinEnd: 40000,
  rgbColor: 'rgb(255, 246, 247)',
};

// The host element must already exist in the document.
const host = document.querySelector('#color-picker');
const picker = new ColorTemperature().create(host, options);

const unsubscribe = picker.onChange(color => {
  console.log('Changed by pointer input:', color);
});

picker.setColor('rgb(255, 200, 140)');
picker.update({ kelvinEnd: 30000, height: 80 });

// Returns the selected RGB string immediately; no callback argument.
console.log(picker.getColor());

// Call when unmounting the host, for example in a framework cleanup callback.
unsubscribe();
picker.destroy();
```

## Options

| Option | Type | Default | Behavior |
| --- | --- | --- | --- |
| `width` | `number \| string` | Required | Pixels for numbers; CSS lengths such as `300px` or `100%` for strings. |
| `height` | `number \| string` | Required | Pixels for numbers; CSS lengths for strings. |
| `kelvinStart` | `number` | `1000` | First temperature of the gradient. |
| `kelvinEnd` | `number` | `4000` | Last temperature of the gradient. |
| `rgbColor` | `string` | First gradient color | Initial selection in `rgb(r, g, b)` format. |

Temperatures must be finite and satisfy `1000 <= kelvinStart <= kelvinEnd <= 40000`. Numeric dimensions must be finite and non-negative. Percentage dimensions require a parent with a resolvable size.

RGB channels must be integers from 0 to 255. Spaces and uppercase `RGB` are accepted; malformed or out-of-range RGB values throw `TypeError`. If an RGB color does not exist in the rendered gradient, the picker chooses the nearest pixel by squared RGB distance, preferring the first pixel on ties. The marker background and `getColor()` report that actual pixel color. An omitted or empty `rgbColor` selects the start of the gradient.

The canvas redraws after its dimensions change and selects the nearest available color to the previous selection. While initially hidden or zero-sized, it defers pixel selection until the canvas becomes measurable; `getColor()` temporarily returns the requested RGB, or the start-temperature RGB when omitted.

Mouse, pen and touch dragging continue outside the component. Values update during pointer events; marker rendering is scheduled for the next animation frame.

## Lifecycle and compatibility

- `create(selectorOrElement, options)` accepts a selector or `HTMLElement` and returns the instance. Creating an already-mounted instance throws without changing its state.
- `getColor()` returns an RGB string. Calling it before creation or after destruction throws.
- `setColor(rgb)` changes the value and marker without emitting a user `change` event.
- `onChange(listener)` observes pointer-driven changes and returns an unsubscribe function.
- `update(options)` updates dimensions, Kelvin bounds, or the selected RGB without replacing the instance.
- `destroy()` releases subscriptions, pointer listeners, resize observation, pending rendering, styles and DOM. Calling it without a live component throws.
- `destroyed()` remains as a deprecated compatibility alias for `destroy()`.
- The same instance can be created again after destruction. `create`, `destroy`, and `destroyed` remain bound when passed as callbacks.
- `deleteLink()` is a deprecated cleanup alias for `destroyed()` and now also removes the DOM.

The previous `BuildCanvas` and `Controllers` exports remain available as deprecated adapters. `BuildCanvas` still accepts `{ hash, kelvinStart, kelvinEnd, rgbColor }` for existing component DOM and exposes `create()`, `getColor()`, `canvas`, `radio`, `container`, and `controllers`. Call its new `destroy()` method before removing that DOM to release resize observation and rendering resources. `Controllers` still attaches automatically and supports `removeAllEventListener()`. Prefer `ColorTemperature` for new integrations; the new `DragController` uses explicit `attach()` and `detach()`.

The new internal extractor/calculator interfaces use a normalized gradient position (`0` to `1`); viewport coordinates are converted explicitly with `clientXToRatio()`. They do not use indices of deduplicated colors.

## Styling

Scope a theme to the host element. The component exposes stable classes (`temperature-picker__container`, `temperature-picker__canvas`, `temperature-picker__radio`) and these optional CSS variables:

```css
#color-picker {
  --temperature-picker-radius: 5px;
  --temperature-picker-marker-width: 16px;
  --temperature-picker-marker-height: 58px;
  --temperature-picker-marker-border: 3px solid #fffdf3;
  --temperature-picker-marker-radius: 6px;
  --temperature-picker-marker-shadow: 0 4px 14px #0007;
}
```

The component has a rounded gradient track with a subtle outline and a larger circular marker with a white ring and soft shadow by default. Styling is contained within the component and does not change the surrounding page. The default track radius is 12px; the marker is 20px with a 3px white border. Keep layout properties such as positioning and transforms intact when overriding the stable classes.
