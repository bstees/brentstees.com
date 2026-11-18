import { GET as getDigestSitemap } from './digest/sitemap.xml';

// Keep the existing digest endpoint and derive the complete site map from it.
export async function GET(context: { site?: URL }) {
  const base = context.site ?? new URL('https://brentstees.com');
  const escapeXml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const pages = ['/', '/work/nuk/'].map((path) =>
    `<url><loc>${escapeXml(new URL(path, base).href)}</loc></url>`).join('');
  const digest = await getDigestSitemap(context);
  const xml = (await digest.text()).replace('</urlset>', `${pages}</urlset>`);
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
