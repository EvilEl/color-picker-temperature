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
  width:number;  (required)
  height:number; (required)
  rgbColor?:string;
  kelvinStart?:number; from 1000
  kelvinEnd?:number;   to 40000
}

controllerEventOptions:{
  getColor: callback return current color
}


rgbColor:string; color that need set


### Methods ColorTemperature

cretate - create your own instance

get - get the color of the current

```

### Example

```ts

import { ColorTemperature } from "color-picker-temperature";

function currentColor(color){
    ....
    console.log(color)
}
const instance = "#dd";
const optionsCanvas = {
    width: 300,
    height: 50,
    kelvinStart: 1000,
    kelvinEnd: 9500,
}
const controllerEventOptions = {
   getColor:currentColor
}
const colorTemperatrue = new ColorTemperature(instance,optionsCanvas,controllerEventOptions);
colorTemperatrue.create()
```
