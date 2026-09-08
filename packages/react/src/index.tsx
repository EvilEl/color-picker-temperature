import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import {
  ColorTemperature,
  type ICanvasOptions,
} from 'color-picker-temperature';

export interface ColorTemperaturePickerHandle {
  getColor(): string;
  setColor(color: string): void;
  destroy(): void;
}

export interface ColorTemperaturePickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'>,
    Omit<ICanvasOptions, 'rgbColor'> {
  value?: string;
  defaultValue?: string;
  onChange?: (color: string) => void;
}

export const ColorTemperaturePicker = forwardRef<
  ColorTemperaturePickerHandle,
  ColorTemperaturePickerProps
>(function ColorTemperaturePicker(
  {
    value,
    defaultValue,
    onChange,
    width,
    height,
    kelvinStart = 1000,
    kelvinEnd = 40000,
    style,
    ...hostProps
  },
  forwardedRef,
) {
  const hostRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<ColorTemperature | null>(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  onChangeRef.current = onChange;
  valueRef.current = value;

  useImperativeHandle(forwardedRef, () => ({
    getColor: () => {
      if (!pickerRef.current) throw new Error('ColorTemperaturePicker is not mounted');
      return pickerRef.current.getColor();
    },
    setColor: color => { pickerRef.current?.setColor(color); },
    destroy: () => {
      const picker = pickerRef.current;
      pickerRef.current = null;
      picker?.destroy();
    },
  }), []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const picker = new ColorTemperature().create(host, {
      width,
      height,
      kelvinStart,
      kelvinEnd,
      rgbColor: value ?? defaultValue,
    });
    pickerRef.current = picker;
    const unsubscribe = picker.onChange(color => {
      onChangeRef.current?.(color);
      const controlledValue = valueRef.current;
      if (controlledValue !== undefined && controlledValue !== color) picker.setColor(controlledValue);
    });
    return () => {
      unsubscribe();
      if (pickerRef.current === picker) {
        pickerRef.current = null;
        picker.destroy();
      }
    };
  }, []);

  useEffect(() => {
    pickerRef.current?.update({ width, height, kelvinStart, kelvinEnd });
  }, [width, height, kelvinStart, kelvinEnd]);

  useEffect(() => {
    if (value !== undefined) pickerRef.current?.setColor(value);
  }, [value]);

  const hostStyle: CSSProperties = { minWidth: 0, ...style };
  return <div {...hostProps} ref={hostRef} style={hostStyle} />;
});
