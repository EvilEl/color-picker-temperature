import { ColorTemperature } from 'color-picker-temperature';
import '../../shared.css';

const host = document.querySelector<HTMLElement>('#picker');
const output = document.querySelector<HTMLOutputElement>('#color');
if (!host || !output) throw new Error('Demo host is missing');
const picker = new ColorTemperature().create(host, { width: '100%', height: 64, kelvinEnd: 40000 });
const show = (color: string) => { output.value = color; document.body.style.setProperty('--picked', color); };
show(picker.getColor());
picker.onChange(show);
