# Color Picker Temperature

![Kelvin](https://user-images.githubusercontent.com/65889370/215314129-451ecb11-b9b4-4f89-a991-bfa5eca30ac0.png "Орк")

### Installing

#### npm

```
npm i color-picker-temperature
```

#### yarn

```
yarn color-picker-temperature
```

### Usage

```

instance - selector id or class  (required)

optionsCanvas : {
  width:number|string;  (required) if string '100px' or '100%'
  height:number|string;  (required) if string '100px' or '100%'
  rgbColor?:string; color that need set
  kelvinStart?:number; from 1000
  kelvinEnd?:number;   to 40000
}

rgbColor:string; color that need set

### Methods ColorTemperature

cretate - create your own instance

getColor => getColor(callback)

destroyed - deletes a component
```

### Example

```ts
import { ColorTemperature } from "color-picker-temperature";

function getColor(color) {
  console.log(color);
}
const instance = "#dd";
const optionsCanvas = {
  width: "100%",
  height: 100,
  kelvinStart: 1000,
  kelvinEnd: 40000,
  rgbColor: "rgb(255, 246, 247)",
};

const colorTemperature = new ColorTemperature();
colorTemperature.create(instance, optionsCanvas);
colorTemperature.getColor(getColor);

// if
setTimeout(() => {
  colorTemperature.destroyed();
}, 10000);
```
