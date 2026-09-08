import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const workspaceRoot = dirname(dirname(root));
const temporary = mkdtempSync(join(tmpdir(), 'color-picker-build-'));
const output = join(root, 'dist');

function removeCompilerOutputs(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) removeCompilerOutputs(path);
    else if (/\.(?:js|d\.ts)(?:\.map)?$/.test(entry.name)) rmSync(path);
  }
}

try {
  execFileSync(process.execPath, [join(workspaceRoot, 'node_modules/typescript/bin/tsc'),
    '--project', join(root, 'tsconfig.json'), '--outDir', join(temporary, 'dist'),
    '--declarationDir', join(temporary, 'dist/types')], { stdio: 'inherit' });
  // Replace compiler outputs only after a successful clean build; preserve other assets.
  try { removeCompilerOutputs(output); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  cpSync(join(temporary, 'dist'), output, { recursive: true });
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
