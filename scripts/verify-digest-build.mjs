import { readFile } from 'node:fs/promises';

const dist = new URL('../dist/digest/', import.meta.url);
const fail = (message) => {
  throw new Error(`Digest build verification failed: ${message}`);
};

const index = JSON.parse(await readFile(new URL('index.json', dist), 'utf8'));
if (index.version !== 1) fail('JSON index version is not 1');
if (index.issues.length !== 13) fail(`JSON index has ${index.issues.length} issues`);
if (index.issues.reduce((count, issue) => count + issue.findingIds.length, 0) !== 61) {
  fail('JSON index does not contain 61 findings');
}

const dates = index.issues.map((issue) => issue.publicationDate);
if (dates.join() !== [...dates].sort().reverse().join()) fail('JSON index is not newest first');

const archiveHtml = await readFile(new URL('index.html', dist), 'utf8');
const rss = await readFile(new URL('rss.xml', dist), 'utf8');
const sitemap = await readFile(new URL('sitemap.xml', dist), 'utf8');
if ((rss.match(/<item>/g) ?? []).length !== 13) fail('RSS does not contain 13 items');

for (const issue of index.issues) {
  const path = issue.url.replace(/^\/digest\//, '');
  const html = await readFile(new URL(`${path}index.html`, dist), 'utf8');
  const canonical = `https://brentstees.com${issue.url}`;
  if (!archiveHtml.includes(`href="${issue.url}"`)) fail(`archive does not link ${issue.url}`);
  if (!html.includes(`href="${canonical}"`)) fail(`${issue.url} has the wrong canonical URL`);
  if (!html.includes(`article:published_time`) || !html.includes(issue.publicationDate)) {
    fail(`${issue.url} is missing its historical publication metadata`);
  }
  if (!sitemap.includes(`<loc>${canonical}</loc>`)) fail(`sitemap does not include ${canonical}`);
  if (/|<box|\{#each/.test(html)) fail(`${issue.url} leaked source presentation markup`);
}

console.log('Verified digest archive, article metadata, JSON index, RSS, and sitemap output.');

