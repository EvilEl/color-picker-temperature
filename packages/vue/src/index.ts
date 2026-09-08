import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
} from 'vue';
import { ColorTemperature } from 'color-picker-temperature';

type Dimension = number | string;

export const ColorTemperaturePicker = defineComponent({
  name: 'ColorTemperaturePicker',
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: undefined },
    defaultValue: { type: String, default: undefined },
    width: { type: [Number, String] as PropType<Dimension>, required: true },
    height: { type: [Number, String] as PropType<Dimension>, required: true },
    kelvinStart: { type: Number, default: 1000 },
    kelvinEnd: { type: Number, default: 40000 },
  },
  emits: {
    'update:modelValue': (color: string) => typeof color === 'string',
    change: (color: string) => typeof color === 'string',
  },
  setup(props, { attrs, emit, expose }) {
    const host = ref<HTMLElement | null>(null);
    let picker: ColorTemperature | null = null;
    let unsubscribe: (() => void) | null = null;

    onMounted(() => {
      if (!host.value) return;
      picker = new ColorTemperature().create(host.value, {
        width: props.width,
        height: props.height,
        kelvinStart: props.kelvinStart,
        kelvinEnd: props.kelvinEnd,
        rgbColor: props.modelValue ?? props.defaultValue,
      });
      unsubscribe = picker.onChange(color => {
        emit('update:modelValue', color);
        emit('change', color);
      });
    });

    watch(
      () => [props.width, props.height, props.kelvinStart, props.kelvinEnd] as const,
      ([width, height, kelvinStart, kelvinEnd]) => {
        picker?.update({ width, height, kelvinStart, kelvinEnd });
      },
    );

    watch(() => props.modelValue, color => {
      if (color !== undefined && picker?.getColor() !== color) picker?.setColor(color);
    });

    onBeforeUnmount(() => {
      unsubscribe?.();
      unsubscribe = null;
      const mountedPicker = picker;
      picker = null;
      mountedPicker?.destroy();
    });

    expose({
      getColor: () => picker?.getColor(),
      setColor: (color: string) => picker?.setColor(color),
      destroy: () => {
        const mountedPicker = picker;
        picker = null;
        mountedPicker?.destroy();
      },
    });

    return () => h('div', { ...attrs, ref: host });
  },
});

export default ColorTemperaturePicker;
