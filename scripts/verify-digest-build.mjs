import { readdir, readFile } from 'node:fs/promises';

const dist = new URL('../dist/digest/', import.meta.url);
const fail = (message) => {
  throw new Error(`Digest build verification failed: ${message}`);
};

const index = JSON.parse(await readFile(new URL('index.json', dist), 'utf8'));
if (index.version !== 1) fail('JSON index version is not 1');
const sourceIssues = (await readdir(new URL('../src/content/digests/', import.meta.url))).filter((name) => name.endsWith('.md'));
if (index.issues.length !== sourceIssues.length) {
  fail(`JSON index has ${index.issues.length} issues for ${sourceIssues.length} source files`);
}

const dates = index.issues.map((issue) => issue.publicationDate);
if (dates.join() !== [...dates].sort().reverse().join()) fail('JSON index is not newest first');

const archiveHtml = await readFile(new URL('index.html', dist), 'utf8');
const rss = await readFile(new URL('rss.xml', dist), 'utf8');
const sitemap = await readFile(new URL('sitemap.xml', dist), 'utf8');
if ((rss.match(/<item>/g) ?? []).length !== index.issues.length) fail('RSS does not list every issue');

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


// Public discovery must cover both the portfolio and every digest URL.
const rootDist = new URL('../dist/', import.meta.url);
const rootSitemap = await readFile(new URL('sitemap.xml', rootDist), 'utf8');
const robots = await readFile(new URL('robots.txt', rootDist), 'utf8');
const caseStudy = await readFile(new URL('work/nuk/index.html', rootDist), 'utf8');
for (const loc of ['https://brentstees.com/', 'https://brentstees.com/work/nuk/',
  ...(sitemap.match(/<loc>[^<]+<\/loc>/g) ?? []).map((tag) => tag.slice(5, -6))]) {
  if (!rootSitemap.includes(`<loc>${loc}</loc>`)) fail(`root sitemap omits ${loc}`);
}
if (!robots.includes('Sitemap: https://brentstees.com/sitemap.xml')) fail('robots does not advertise root sitemap');
if (!caseStudy.includes('href="https://brentstees.com/work/nuk/"')) fail('case study canonical is missing');
for (const heading of ['The problem', 'Decisions and tradeoffs', 'Follow the evidence', 'Scope and verification']) {
  if (!caseStudy.includes(heading)) fail(`static case study omits ${heading}`);
}
console.log('Verified root sitemap, robots discovery, and static nūk case study.');
