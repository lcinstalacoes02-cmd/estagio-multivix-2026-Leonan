import { cp, mkdir, readFile, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'dist');
const files = ['index.html', 'styles.css', 'site.config.js', 'ordem.js', 'app.js'];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of files) {
  await cp(resolve(root, file), resolve(output, file));
}
await cp(resolve(root, 'assets'), resolve(output, 'assets'), { recursive: true });
const html = await readFile(resolve(output, 'index.html'), 'utf8');
if (!html.includes('id="titulo-abertura"') || !html.includes('app.js')) {
  throw new Error('A página principal está incompleta.');
}
console.log('LC Conecta: arquivos do site preparados em dist/.');
