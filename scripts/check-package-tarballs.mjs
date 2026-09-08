import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const temporary = mkdtempSync(join(tmpdir(), 'color-temperature-packs-'));
const workspaces = ['core', 'react', 'vue', 'astro'];

try {
  const tarballs = workspaces.map(workspace => {
    const cwd = join(root, 'packages', workspace);
    const result = JSON.parse(execFileSync('npm', [
      'pack', '--json', '--ignore-scripts', '--pack-destination', temporary,
      '--cache', join(root, '.npm-cache'),
    ], { cwd, encoding: 'utf8' }))[0];
    const manifest = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'));
    for (const entry of [manifest.main, manifest.types]) {
      if (entry && !result.files.some(file => file.path === entry.replace(/^\.\//, ''))) {
        throw new Error(`${manifest.name}: packed tarball is missing ${entry}`);
      }
    }
    return join(temporary, result.filename);
  });

  writeFileSync(join(temporary, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
  execFileSync('npm', [
    'install', '--ignore-scripts', '--legacy-peer-deps', '--offline', '--package-lock=false',
    '--cache', join(root, '.npm-cache'), ...tarballs,
  ], { cwd: temporary, stdio: 'pipe' });

  for (const dependency of ['react', 'vue']) {
    const destination = join(temporary, 'node_modules', dependency);
    if (!existsSync(destination)) symlinkSync(join(root, 'node_modules', dependency), destination, 'dir');
  }

  const consumer = join(temporary, 'consumer.mjs');
  writeFileSync(consumer, [
    "import { ColorTemperature } from 'color-picker-temperature';",
    "import { ColorTemperaturePicker as ReactPicker } from 'color-picker-temperature-react';",
    "import { ColorTemperaturePicker as VuePicker } from 'color-picker-temperature-vue';",
    "if (![ColorTemperature, ReactPicker, VuePicker].every(value => typeof value === 'function' || typeof value === 'object')) throw new Error('Invalid adapter export');",
  ].join('\n'));
  execFileSync(process.execPath, [consumer], { cwd: temporary, stdio: 'pipe' });

  const astroComponent = join(temporary, 'node_modules/color-picker-temperature-astro/src/ColorTemperaturePicker.astro');
  if (!existsSync(astroComponent)) throw new Error('Astro tarball is missing its component entry point');
  console.log(`Packed, installed, and checked ${tarballs.length} publishable workspaces.`);
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
