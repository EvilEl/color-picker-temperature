# color-picker-temperature-vue

Vue adapter for [`color-picker-temperature`](https://www.npmjs.com/package/color-picker-temperature). See the other [framework integrations](https://github.com/EvilEl/color-picker-temperature#framework-integrations) and the [Vue example](https://github.com/EvilEl/color-picker-temperature/tree/main/examples/vue).

```sh
npm install color-picker-temperature color-picker-temperature-vue
```

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { ColorTemperaturePicker } from 'color-picker-temperature-vue';
const color = ref('rgb(255, 200, 140)');
</script>

<template>
  <ColorTemperaturePicker v-model="color" width="100%" :height="64" />
</template>
```
