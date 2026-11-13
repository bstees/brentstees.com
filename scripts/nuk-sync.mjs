#!/usr/bin/env node
// Refresh the vendored nuk packages from the sibling nuk checkout (override with NUK_DIR).
// The site depends on packed tarballs in vendor/ so installs and CI work before nuk is
// published to npm. Switch to versioned prereleases once it is.
import { execFileSync } from 'node:child_process';
import { readdirSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const nuk = resolve(root, process.env.NUK_DIR ?? '../nuk');
const vendor = resolve(root, 'vendor');
const packages = ['tokens', 'elements'];
const run = (command, args, cwd) => execFileSync(command, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();

for (const file of readdirSync(vendor)) if (file.endsWith('.tgz')) rmSync(resolve(vendor, file));
for (const name of packages) {
  const cwd = resolve(nuk, 'packages', name);
  run('pnpm', ['run', 'build'], cwd);
  run('pnpm', ['pack', '--pack-destination', vendor], cwd);
}
const commit = run('git', ['rev-parse', '--short', 'HEAD'], nuk);
const dirty = run('git', ['status', '--porcelain'], nuk) !== '';
writeFileSync(
  resolve(vendor, 'README.md'),
  `# Vendored nuk packages\n\nPacked from nuk commit \`${commit}\`${dirty ? ' plus uncommitted changes' : ''} by \`npm run nuk:sync\`.\nDo not edit by hand.\n`,
);
run('npm', ['install', ...packages.map((name) => `@nuk-ui/${name}@file:vendor/nuk-ui-${name}-0.1.0.tgz`)], root);
console.log(`Vendored @nuk-ui/{${packages.join(',')}} from nuk ${commit}.`);
