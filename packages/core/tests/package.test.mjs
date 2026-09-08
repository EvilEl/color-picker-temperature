import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, readFileSync, mkdirSync, writeFileSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const workspaceRoot = resolve(root, '../..');

test('packed files contain entry points and work for an isolated JS and TS consumer', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'color-picker-package-'));
  try {
    const packed = JSON.parse(execFileSync('npm', ['pack', '--dry-run', '--ignore-scripts', '--json', '--cache', join(temporary, 'cache')], { cwd: root, encoding: 'utf8' }))[0];
    const paths = packed.files.map(file => file.path);
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    assert.ok(paths.includes(pkg.main.replace('./', '')));
    assert.ok(paths.includes(pkg.types.replace('./', '')));
    assert.ok(paths.every(path => !path.startsWith('src/') && !path.startsWith('tests/') && !path.includes('.DS_Store')));
    assert.ok(!paths.includes('dist/classes/CreateHtmlElement.js'));
    const installed = join(temporary, 'node_modules', pkg.name);
    mkdirSync(installed, { recursive: true });
    for (const path of paths) {
      const destination = join(installed, path);
      mkdirSync(resolve(destination, '..'), { recursive: true });
      cpSync(join(root, path), destination);
    }
    writeFileSync(join(temporary, 'package.json'), JSON.stringify({ type: 'module' }));
    const consumer = `import { ColorTemperature, BuildCanvas, Controllers, DragController } from 'color-picker-temperature';\nconst picker = new ColorTemperature();\nconst create = picker.create;\nconst setColor = picker.setColor.bind(picker);\nconst update = picker.update.bind(picker);\nconst subscribe = picker.onChange.bind(picker);\nconst destroy = picker.destroy;\nif (![create, setColor, update, subscribe, destroy, BuildCanvas, Controllers, DragController].every(value => typeof value === 'function')) throw new Error('Missing public export');\n`;
    writeFileSync(join(temporary, 'consumer.mjs'), consumer);
    execFileSync(process.execPath, [join(temporary, 'consumer.mjs')], { cwd: temporary });
    writeFileSync(join(temporary, 'consumer.ts'), consumer + `import type { ICanvasOptions, IColorExtractor } from 'color-picker-temperature';\nconst options: ICanvasOptions = { width: '100%', height: 100 };\nconst extractor: IColorExtractor = { getColorAtRatio: () => null, findClosestColor: () => null };\nvoid options; void extractor;\n`);
    execFileSync(process.execPath, [join(workspaceRoot, 'node_modules/typescript/bin/tsc'), '--noEmit', '--strict', '--target', 'ES2016', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', join(temporary, 'consumer.ts')], { cwd: temporary, stdio: 'pipe' });
    console.log(`Verified ${paths.length} packed files and isolated JS/TS consumers`);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});
