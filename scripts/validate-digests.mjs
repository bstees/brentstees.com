import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const contentDirectory = new URL('../src/content/digests/', import.meta.url);
const filenames = (await readdir(contentDirectory))
  .filter((filename) => filename.endsWith('.md'))
  .sort();

const fail = (message) => {
  throw new Error(`Digest validation failed: ${message}`);
};

if (filenames.length !== 13) fail(`expected 13 dated issues, found ${filenames.length}`);

const records = [];
const messageIds = new Set();
const findingIds = new Set();

for (const filename of filenames) {
  const source = await readFile(new URL(filename, contentDirectory), 'utf8');
  const frontmatterMatch = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!frontmatterMatch) fail(`${filename} has invalid frontmatter boundaries`);
  const [, frontmatter, body] = frontmatterMatch;

  const readScalar = (key) => frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]?.trim();
  const date = readScalar('publicationDate');
  const issueNumber = Number(readScalar('issueNumber'));
  const title = JSON.parse(readScalar('title'));
  const sourceMessageId = JSON.parse(readScalar('sourceMessageId'));
  const findings = JSON.parse(readScalar('findingIds'));

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) fail(`${filename} has an invalid publicationDate`);
  if (filename !== `${date}.md`) fail(`${filename} does not match publicationDate ${date}`);
  if (!title.endsWith(new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric',
  }))) fail(`${filename} title does not preserve its source date`);
  if (new Date(`${date}T00:00:00Z`).getUTCDay() !== 5) fail(`${filename} is not a Friday`);
  if (!Number.isInteger(issueNumber) || issueNumber < 1) fail(`${filename} has an invalid issueNumber`);
  if (messageIds.has(sourceMessageId)) fail(`${filename} repeats sourceMessageId ${sourceMessageId}`);
  messageIds.add(sourceMessageId);

  if (!Array.isArray(findings) || findings.length < 1) fail(`${filename} has no findingIds`);
  for (const findingId of findings) {
    if (!findingId.startsWith(`F-${date}-`)) fail(`${filename} has mismatched findingId ${findingId}`);
    if (findingIds.has(findingId)) fail(`duplicate findingId ${findingId}`);
    findingIds.add(findingId);
  }

  const sourceLinks = [...body.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map((match) => match[1]);
  if (new Set(sourceLinks).size < findings.length) {
    fail(`${filename} has fewer primary-source links than findings`);
  }
  if (/\]\(http:\/\//.test(body)) fail(`${filename} contains a non-HTTPS source link`);
  if (/|<\/?(?:box|text|Link|Cite|Entity)\b|\{#(?:each|if)|\{\/(?:each|if)\}/.test(body)) {
    fail(`${filename} contains ChatGPT-only presentation markup`);
  }

  records.push({ date, issueNumber });
}

records.sort((a, b) => a.date.localeCompare(b.date));
for (let index = 0; index < records.length; index += 1) {
  const record = records[index];
  if (record.issueNumber !== index + 1) fail(`${record.date} has non-sequential issueNumber ${record.issueNumber}`);
  if (index > 0) {
    const previous = new Date(`${records[index - 1].date}T00:00:00Z`);
    const current = new Date(`${record.date}T00:00:00Z`);
    if (current.valueOf() - previous.valueOf() !== 7 * 24 * 60 * 60 * 1000) {
      fail(`${record.date} is not seven days after ${records[index - 1].date}`);
    }
  }
}

if (findingIds.size !== 61) fail(`expected 61 findings, found ${findingIds.size}`);

console.log(`Validated ${records.length} dated digest issues and ${findingIds.size} findings.`);

