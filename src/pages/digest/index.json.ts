import { getCollection } from 'astro:content';

export async function GET() {
  const issues = (await getCollection('digests'))
    .sort((a, b) => b.data.publicationDate.valueOf() - a.data.publicationDate.valueOf())
    .map((issue) => ({
      id: `digest-${issue.data.publicationDate.toISOString().slice(0, 10)}`,
      issueNumber: issue.data.issueNumber,
      title: issue.data.title,
      description: issue.data.description,
      publicationDate: issue.data.publicationDate.toISOString().slice(0, 10),
      url: `/digest/${issue.id}/`,
      topics: issue.data.topics,
      findingIds: issue.data.findingIds,
    }));

  return new Response(JSON.stringify({ version: 1, issues }, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

