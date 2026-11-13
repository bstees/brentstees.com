import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const script = new URL('../scripts/verify-deployment.mjs', import.meta.url).href;
function check(mode, sha = 'a'.repeat(40)) {
  return spawnSync(process.execPath, ['--input-type=module', '-e', `
    process.env.EXPECTED_SHA = ${JSON.stringify(sha)};
    const mode = ${JSON.stringify(mode)};
    globalThis.setTimeout = callback => { callback(); return 0; };
    globalThis.fetch = async (url, options = {}) => {
      if (options.headers) throw new Error('Unexpected credentials/headers');
      const path = new URL(url).pathname;
      if (mode === 'network') throw new Error('Network failure');
      if (path === '/deployment.json') return {ok: true, json: async () => ({commit: mode === 'stale' ? 'b'.repeat(40) : process.env.EXPECTED_SHA})};
      if (path.startsWith('/__deployment-missing-')) return {status: mode === 'soft404' ? 200 : 404};
      if (new URL(url).hostname === 'www.brentstees.com') return {status: 301, headers: new Headers({location: mode === 'redirect' ? 'https://elsewhere.invalid/' : 'https://brentstees.com/'})};
      return {status: mode === 'home' ? 500 : 200, text: async () => 'Brent Stees'};
    };
    await import(${JSON.stringify(script)});
  `], { encoding: 'utf8' });
}
test('accepts matching deployment and healthy public routes', () => assert.equal(check('ok').status, 0));
for (const mode of ['stale', 'network', 'soft404', 'redirect', 'home']) {
  test(`fails closed for ${mode}`, () => assert.notEqual(check(mode).status, 0));
}
test('rejects missing or malformed commit SHA', () => assert.notEqual(check('ok', 'invalid').status, 0));
