// Read-only smoke check. Never sends deployment credentials to the public site.
const expected = process.env.EXPECTED_SHA;
if (!/^[a-f0-9]{40}$/.test(expected ?? '')) throw new Error('EXPECTED_SHA must be a full commit SHA');
const base = 'https://brentstees.com';
let verified = false;
for (let attempt = 0; attempt < 12; attempt++) {
  try {
    const response = await fetch(`${base}/deployment.json?commit=${expected}&attempt=${attempt}`, {
      cache: 'no-store', signal: AbortSignal.timeout(15000),
    });
    if (response.ok && (await response.json()).commit === expected) {
      verified = true;
      break;
    }
  } catch { /* Retry transient network/propagation failures without leaking responses. */ }
  if (attempt < 11) await new Promise(resolve => setTimeout(resolve, 5000));
}
if (!verified) throw new Error('Production did not serve the expected commit; inspect the Cloudflare deployment before retrying.');
const home = await fetch(base, { signal: AbortSignal.timeout(15000) });
if (home.status !== 200 || !(await home.text()).includes('Brent Stees')) throw new Error('Production homepage check failed');
const missing = await fetch(`${base}/__deployment-missing-${expected}`, { signal: AbortSignal.timeout(15000) });
if (missing.status !== 404) throw new Error('Production missing-page check failed');
const www = await fetch('https://www.brentstees.com/', { redirect: 'manual', signal: AbortSignal.timeout(15000) });
if (www.status !== 301 || www.headers.get('location') !== `${base}/`) throw new Error('Production canonical redirect check failed');
console.log('Production commit, homepage, 404 and canonical redirect verified.');
