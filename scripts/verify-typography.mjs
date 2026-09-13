import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const css = await readFile(resolve(root, 'assets/css/main.css'), 'utf8');
const manifest = await readFile(resolve(root, 'assets/css/entry.css'), 'utf8');
const type = await readFile(resolve(root, 'assets/css/base/typography.css'), 'utf8');
assert(!/@import\b/.test(css), 'Published CSS must not trigger nested stylesheet requests');
assert(!/font-(?:size|weight|family):[^;]*!important/.test(css), 'Typography must not depend on !important');
assert(!/font-weight:\s*[789]\d\d/.test(css), 'Ordinary text must not use heavy 700–900 weights');
const definitions = new Set([...type.matchAll(/(--(?:text|weight|leading)-[\w-]+):/g)].map(m => m[1]));
for (const [, token] of css.matchAll(/var\((--(?:text|weight|leading)-[\w-]+)\)/g)) {
  assert(definitions.has(token), `Undefined typography token: ${token}`);
}
for (const [role, sizes] of Object.entries({h1:[64,48,40],h2:[44,36,30],h3:[26,24,22],price:[40,36,32]})) {
  const actual = [...type.matchAll(new RegExp(`--text-${role}: (\\d+)px`, 'g'))].map(m => Number(m[1]));
  assert.deepEqual(actual, sizes, `${role}: desktop/tablet/mobile scale`);
}
for (const [, name] of manifest.matchAll(/@import url\("([^"?]+)"\);/g)) {
  const module = await readFile(resolve(root, 'assets/css', name), 'utf8');
  assert(css.includes(`/* Source: ${name} */`), `Missing stylesheet ${name}`);
  // Heading declarations and their breakpoint overrides must share role tokens.
  for (const [, selector, block] of module.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (/\bh[123]\b/.test(selector) && !selector.trim().startsWith('@')) {
      for (const [, value] of block.matchAll(/font-size:\s*([^;]+);/g)) {
        assert(/^var\(--text-(?:h[123]|caption)\)$/.test(value), `Unscoped heading size: ${selector}: ${value}`);
      }
    }
  }
}
for (const [, url] of css.matchAll(/url\(["']?([^"')]+\.woff2)["']?\)/g)) {
  await access(resolve(root, 'assets/css', url));
}
assert.equal((css.match(/@font-face/g) || []).length, 4, 'Preserve Inter Latin/Cyrillic normal/italic faces');
console.log('Typography verified: responsive scales, role tokens, heading overrides, bundle modules and local fonts.');
