import { getCollection } from 'astro:content';

const escapeXml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

export async function GET({ site }: { site?: URL }) {
  const base = site ?? new URL('https://brentstees.com');
  const issues = await getCollection('digests');
  const topics = [...new Set(issues.flatMap((issue) => issue.data.topics))];
  const paths = [
    '/digest/',
    ...issues.map((issue) => `/digest/${issue.id}/`),
    ...topics.map((topic) => `/digest/topic/${topic}/`),
  ];
  const urls = paths.map((path) => `<url><loc>${escapeXml(new URL(path, base).href)}</loc></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}

