#!/usr/bin/env node
// Weekly intake: turn the Friday brief task's Markdown into the next issue and a pull request.
//
//   npm run brief:new -- draft.md            write, validate, branch, commit, push, print the PR link
//   npm run brief:new -- draft.md --no-git   write and validate only
//   pbpaste | npm run brief:new -- -         read the draft from stdin
//
// The draft follows scripts/brief/issue-template.md. Frontmatter fields the script can work out
// (publicationDate, issueNumber, findingIds, title) are filled in when missing. Validation fails
// closed: a draft that does not pass is removed again and nothing is committed.
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const digests = new URL('../../src/content/digests/', import.meta.url);
const args = process.argv.slice(2);
const input = args.find((arg) => !arg.startsWith('--'));
const useGit = !args.includes('--no-git');
if (!input) {
  console.error('Usage: npm run brief:new -- <draft.md | -> [--no-git]');
  process.exit(2);
}

const run = (command, commandArgs, options = {}) =>
  execFileSync(command, commandArgs, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], ...options }).trim();

const draft = (input === '-' ? readFileSync(0, 'utf8') : await readFile(input, 'utf8')).replace(/\r\n/g, '\n').trim();
const split = draft.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
const body = (split ? split[2] : draft).trim();
const given = Object.fromEntries(
  (split ? split[1] : '').split('\n').flatMap((line) => {
    const match = line.match(/^([A-Za-z]+):\s*(.+)$/);
    return match ? [[match[1], match[2].trim()]] : [];
  }),
);

const existing = (await readdir(digests)).filter((name) => /^\d{4}-\d{2}-\d{2}\.md$/.test(name)).sort();
const previousDate = existing.at(-1).slice(0, 10);
const date = given.publicationDate ?? new Date(Date.parse(`${previousDate}T00:00:00Z`) + 7 * 86_400_000).toISOString().slice(0, 10);
const longDate = new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
  timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric',
});
const findingCount = [...body.matchAll(/^#{2,3} \d+\.\s/gm)].length;
const quote = (value) => JSON.stringify(value);

if (!given.description) {
  console.error('The draft needs a description in its frontmatter (one sentence, 240 characters or fewer).');
  process.exit(1);
}
if (!given.topics) {
  console.error('The draft needs topics in its frontmatter, for example topics: ["agent-memory","verification"].');
  process.exit(1);
}

const frontmatter = [
  `title: ${given.title ?? quote(`Friday AI Engineering Brief — ${longDate}`)}`,
  `description: ${given.description}`,
  `publicationDate: ${date}`,
  `issueNumber: ${given.issueNumber ?? existing.length + 1}`,
  `topics: ${given.topics}`,
  // Provenance: the ids of the run that wrote the draft, or fresh ones when it did not supply any.
  `sourceConversationId: ${given.sourceConversationId ?? quote(randomUUID())}`,
  `sourceMessageId: ${given.sourceMessageId ?? quote(randomUUID())}`,
  `findingIds: ${given.findingIds ?? quote(Array.from({ length: findingCount }, (_, index) => `F-${date}-${String(index + 1).padStart(2, '0')}`))}`,
];

const target = new URL(`${date}.md`, digests);
if (existing.includes(`${date}.md`)) {
  console.error(`src/content/digests/${date}.md already exists.`);
  process.exit(1);
}
await writeFile(target, `---\n${frontmatter.join('\n')}\n---\n${body}\n`);

try {
  execFileSync('npm', ['run', '-s', 'validate:digests'], { cwd: root, stdio: 'inherit' });
} catch {
  await rm(target);
  console.error(`\nThe draft did not pass validation, so src/content/digests/${date}.md was not kept.`);
  process.exit(1);
}
console.log(`Wrote src/content/digests/${date}.md`);
if (!useGit) process.exit(0);

if (run('git', ['status', '--porcelain', '--untracked-files=no'])) {
  console.error('The working tree has other changes. Commit or stash them, or rerun with --no-git.');
  process.exit(1);
}
const branch = `brief/${date}`;
run('git', ['switch', '-c', branch]);
run('git', ['add', `src/content/digests/${date}.md`]);
run('git', ['commit', '-m', `Add Friday AI Engineering Brief for ${longDate}`]);
run('git', ['push', '-u', 'origin', branch]);
const slug = run('git', ['remote', 'get-url', 'origin']).replace(/^.*github\.com[:/]/, '').replace(/\.git$/, '');
console.log(`\nPushed ${branch}. Open the pull request (merging it is the approval):`);
console.log(`https://github.com/${slug}/compare/main...${branch}?expand=1`);
