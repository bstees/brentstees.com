import { getCollection } from 'astro:content';

const escapeXml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

export async function GET({ site }: { site?: URL }) {
  const base = site ?? new URL('https://brentstees.com');
  const issues = (await getCollection('digests')).sort(
    (a, b) => b.data.publicationDate.valueOf() - a.data.publicationDate.valueOf(),
  );
  const items = issues.map((issue) => {
    const url = new URL(`/digest/${issue.id}/`, base).href;
    // Source records prove a calendar date, not a clock time. Midnight UTC is
    // used only as RSS's required serialization of that date.
    const pubDate = new Date(`${issue.data.publicationDate.toISOString().slice(0, 10)}T00:00:00.000Z`).toUTCString();
    return [
      '<item>',
      `<title>${escapeXml(issue.data.title)}</title>`,
      `<link>${escapeXml(url)}</link>`,
      `<guid isPermaLink="true">${escapeXml(url)}</guid>`,
      `<pubDate>${pubDate}</pubDate>`,
      `<description>${escapeXml(issue.data.description)}</description>`,
      '</item>',
    ].join('');
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Friday AI Engineering Brief</title><link>${escapeXml(new URL('/digest/', base).href)}</link><description>Weekly research notes on AI-assisted software delivery and verification.</description><language>en-us</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}

