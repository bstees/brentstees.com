// Fail-closed checks for every issue of the Friday AI Engineering Brief.
// Runs before each build: one problem anywhere stops the site from publishing.
// The per-item rules come from nuk's retired packages/editorial validator.
import { readdir, readFile } from 'node:fs/promises';
import { classifyFocusAreas, isWithinCoverage } from './brief/relevance.mjs';

const contentDirectory = new URL('../src/content/digests/', import.meta.url);
const DAY = 86_400_000;
const ARCHIVE_ISSUES = 13; // 2026-08-14 … 2026-11-06, imported as a set; none may go missing.
// Archive issues predate the fixed item format. Issues from this date on must follow
// scripts/brief/issue-template.md exactly.
const STRICT_FROM = process.env.BRIEF_STRICT_FROM ?? '2026-11-07';
const MIN_FINDINGS = 3;
const MAX_FINDINGS = 5;
const MAX_QUOTE_WORDS = 20;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SOURCE_MARKUP = /|<\/?(?:box|text|Link|Cite|Entity)\b|\{#(?:each|if)|\{\/(?:each|if)\}/;
const REVIEW_FLAG = /\[REVIEW\b|\bTODO\b|\bTBD\b|\bFIXME\b/;
const PERSONAL_VOICE = /(?:\bI\b(?!\/O)|\b(?:Me|me|My|my|Mine|mine|Myself|myself|We|we|Our|our|Ours|ours|Ourselves|ourselves|You|you|Your|your|Yours|yours|Yourself|yourself|Yourselves|yourselves)\b|\bus\b(?![-_])|\b[Ll]et['’]s\b)/;
const PRIVATE_CONTEXT = /\b(?:Brent|Video Wall)\b|\bAI Native\b|\bLevel-3\b|\bReact\/Vite\b|\bsite (?:owner|author)\b/i;

const errors = [];
const filenames = (await readdir(contentDirectory)).filter((filename) => filename.endsWith('.md')).sort();
if (filenames.length < ARCHIVE_ISSUES) {
  errors.push(`expected at least ${ARCHIVE_ISSUES} dated issues, found ${filenames.length}`);
}

const utc = (date) => new Date(`${date}T00:00:00Z`);
const longDate = (date) =>
  utc(date).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' });
const words = (text) => (text.trim() === '' ? 0 : text.trim().split(/\s+/).length);

/** Split the body into numbered findings: "## 1. Title" or "### 1. Title" up to the next heading. */
function readFindings(body) {
  const headings = [...body.matchAll(/^(#{2,3}) (.+)$/gm)];
  return headings
    .map((heading, index) => ({
      level: heading[1].length,
      number: Number(heading[2].match(/^(\d+)\.\s/)?.[1]),
      title: heading[2].replace(/^\d+\.\s*/, ''),
      text: body.slice(heading.index + heading[0].length, headings[index + 1]?.index ?? body.length),
    }))
    .filter((finding) => Number.isInteger(finding.number));
}

/** "*November 3 · Kind of source*" → ISO date in or just before the issue's year. */
function readDateline(text, issueDate) {
  const match = text.match(/^\*([A-Z][a-z]+ \d{1,2})(?:, (\d{4}))? · [^*\n]+\*$/m);
  if (!match) return null;
  const year = Number(match[2] ?? issueDate.slice(0, 4));
  for (const candidate of [year, year - 1]) {
    const parsed = new Date(`${match[1]}, ${candidate} UTC`);
    if (Number.isNaN(parsed.valueOf())) return null;
    if (parsed.valueOf() <= utc(issueDate).valueOf() || match[2]) return parsed.toISOString().slice(0, 10);
  }
  return null;
}

const records = [];
const messageIds = new Set();
const findingIds = new Set();

for (const filename of filenames) {
  const fail = (message) => errors.push(`${filename}: ${message}`);
  const source = await readFile(new URL(filename, contentDirectory), 'utf8');
  const frontmatterMatch = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!frontmatterMatch) {
    fail('invalid frontmatter boundaries');
    continue;
  }
  const [, frontmatter, body] = frontmatterMatch;
  const readScalar = (key) => frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]?.trim();
  const readJson = (key) => {
    try {
      return JSON.parse(readScalar(key) ?? 'null');
    } catch {
      return null;
    }
  };

  const date = readScalar('publicationDate') ?? '';
  const issueNumber = Number(readScalar('issueNumber'));
  const title = readJson('title');
  const description = readJson('description');
  const sourceConversationId = readJson('sourceConversationId');
  const sourceMessageId = readJson('sourceMessageId');
  const findings = readJson('findingIds');

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(utc(date).valueOf())) {
    fail('invalid publicationDate');
    continue;
  }
  if (filename !== `${date}.md`) fail(`filename does not match publicationDate ${date}`);
  if (utc(date).getUTCDay() !== 5) fail('publicationDate is not a Friday');
  if (typeof title !== 'string' || !title.endsWith(longDate(date))) fail('title must be a quoted string ending in the issue date');
  if (typeof description !== 'string' || description.length < 1 || description.length > 240) {
    fail('description must be a quoted string of 1–240 characters');
  }
  if (!Number.isInteger(issueNumber) || issueNumber < 1) fail('invalid issueNumber');
  if (typeof sourceConversationId !== 'string' || !UUID.test(sourceConversationId)) fail('sourceConversationId is not a UUID');
  if (typeof sourceMessageId !== 'string' || !UUID.test(sourceMessageId)) fail('sourceMessageId is not a UUID');
  else if (messageIds.has(sourceMessageId)) fail(`repeats sourceMessageId ${sourceMessageId}`);
  messageIds.add(sourceMessageId);

  if (!Array.isArray(findings) || findings.length < 1) {
    fail('no findingIds');
    continue;
  }
  findings.forEach((findingId, index) => {
    if (findingId !== `F-${date}-${String(index + 1).padStart(2, '0')}`) fail(`findingId ${findingId} is mismatched or out of order`);
    if (findingIds.has(findingId)) fail(`duplicate findingId ${findingId}`);
    findingIds.add(findingId);
  });
  if (findings.length < MIN_FINDINGS) fail(`an issue needs at least ${MIN_FINDINGS} findings`);
  if (findings.length > MAX_FINDINGS) fail(`an issue cannot have more than ${MAX_FINDINGS} findings`);

  const sourceLinks = [...body.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map((match) => match[1]);
  if (new Set(sourceLinks).size < findings.length) fail('fewer primary-source links than findings');
  if (/\]\(http:\/\//.test(body)) fail('contains a non-HTTPS link');
  if (SOURCE_MARKUP.test(body)) fail('contains ChatGPT-only presentation markup');
  if (REVIEW_FLAG.test(body)) fail('still carries a review flag ([REVIEW …], TODO, TBD or FIXME); a person must resolve it');

  // Public issues must read as standalone research, not as a conversation with the site's author.
  // Exact source-title links are exempt only from the pronoun check. Trailing source-line prose,
  // public metadata, callouts, other link labels and all private-context references remain visible.
  const publicText = `${typeof title === 'string' ? title : ''}\n${typeof description === 'string' ? description : ''}\n${body}`;
  const voiceProse = publicText
    .replace(/^\*\*Sources?:\*\*.*$/gm, (line) => line.replace(/\[[^\]]+\]\([^)]+\)/g, ''))
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`[^`]+`/g, '');
  const contextProse = publicText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  const personalVoice = voiceProse.match(PERSONAL_VOICE);
  if (personalVoice) fail(`uses personal editorial framing ("${personalVoice[0]}")`);
  const privateContext = contextProse.match(PRIVATE_CONTEXT);
  if (privateContext) fail(`refers to private author context ("${privateContext[0]}")`);

  for (const quote of body.matchAll(/^>\s?(.+)$/gm)) {
    if (words(quote[1]) > MAX_QUOTE_WORDS) fail(`quote exceeds the ${MAX_QUOTE_WORDS}-word limit`);
  }

  // Every finding is a numbered heading with its consequence and its takeaway.
  const strict = date >= STRICT_FROM;
  const sections = readFindings(body);
  if (sections.length !== findings.length) {
    fail(`${findings.length} findingIds but ${sections.length} numbered finding headings`);
  }
  if (new Set(sections.map((section) => section.level)).size > 1) fail('finding headings mix ## and ###');
  sections.forEach((section, index) => {
    const failItem = (message) => fail(`finding ${index + 1}: ${message}`);
    if (section.number !== index + 1) failItem(`is numbered ${section.number}`);
    if (section.title.trim() === '') failItem('has no title');
    if (!/^\*\*Why it matters:?\*\*/im.test(section.text)) failItem('missing "Why it matters"');
    if (!/^\*\*Practical takeaway:?\*\*/im.test(section.text)) failItem('missing "Practical takeaway"');
    if (!strict) return;

    if (section.level !== 2) failItem('heading must be "## N. Title"');
    if (!/^\*\*What changed:?\*\*/m.test(section.text)) failItem('missing "What changed"');
    if (!/^\*\*Source:?\*\*:? \[[^\]]+\]\(https:\/\/[^)\s]+\)$/m.test(section.text)) {
      failItem('missing or malformed "**Source:** [title](https://…)" line');
    }
    const itemDate = readDateline(section.text, date);
    const coverageStart = new Date(utc(date).valueOf() - 6 * DAY).toISOString().slice(0, 10);
    if (!itemDate) failItem('missing a "*Month D · Kind of source*" dateline');
    else if (!isWithinCoverage(itemDate, coverageStart, date)) {
      failItem(`dated ${itemDate}, outside the coverage window ${coverageStart} … ${date}`);
    }
    if (classifyFocusAreas(`${section.title} ${section.text}`).length === 0) {
      failItem('out of scope: no software-engineering focus area matches (see scripts/brief/relevance.mjs)');
    }
  });

  records.push({ date, issueNumber });
}

records.sort((a, b) => a.date.localeCompare(b.date));
records.forEach((record, index) => {
  if (record.issueNumber !== index + 1) errors.push(`${record.date}: non-sequential issueNumber ${record.issueNumber}`);
  if (index > 0 && utc(record.date).valueOf() - utc(records[index - 1].date).valueOf() !== 7 * DAY) {
    errors.push(`${record.date}: not seven days after ${records[index - 1].date}`);
  }
});

if (errors.length > 0) {
  console.error(`Digest validation failed:\n${errors.map((error) => `  - ${error}`).join('\n')}`);
  process.exit(1);
}
console.log(`Validated ${records.length} dated digest issues and ${findingIds.size} findings.`);
