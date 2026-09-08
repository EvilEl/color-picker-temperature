<script setup lang="ts">
import { ref } from 'vue';
import { ColorTemperaturePicker } from 'color-picker-temperature-vue';
const color = ref('rgb(255, 200, 140)');
</script>

<template>
  <main class="demo" :style="{ '--picked': color }">
    <p class="eyebrow">Vue</p><h1>Find the warmth.</h1>
    <ColorTemperaturePicker v-model="color" width="100%" :height="64" />
    <output>{{ color }}</output>
  </main>
</template>
