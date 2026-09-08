import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ColorTemperaturePicker } from '@color-picker-temperature/react';
import '../../shared.css';

function App() {
  const [color, setColor] = useState('rgb(255, 200, 140)');
  return <main className="demo" style={{ '--picked': color } as React.CSSProperties}>
    <p className="eyebrow">React</p><h1>Find the warmth.</h1>
    <ColorTemperaturePicker value={color} onChange={setColor} width="100%" height={64} />
    <output>{color}</output>
  </main>;
}

createRoot(document.querySelector('#root')!).render(<App />);
