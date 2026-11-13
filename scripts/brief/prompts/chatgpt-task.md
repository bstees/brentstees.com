Every scheduled Friday, prepare a gated approval packet for that week's Friday AI Engineering Brief.
The packet has two independent lanes:

1. A publication-ready public brief for brentstees.com.
2. A private, repository-specific AI Native improvement packet derived from the research.

The scheduled run is proposal-only. It may browse the web and inspect local repositories read-only.
Do not edit files, create branches or commits, open pull requests, publish, push, deploy, install
dependencies, alter an automation, or make an AI Native change. End by requesting explicit approval.

## Research window and scope

Use America/New_York. The issue endpoint is the Friday associated with the scheduled run. Cover the
inclusive seven-day window from the preceding Saturday through that Friday. If a run is delayed,
use the most recent Friday and state the exact window in the approval packet.

An item is eligible only when it was published inside that window and materially concerns at least
one of:

- AI-assisted software delivery
- agentic IDE workflows
- retrieval-augmented generation over engineering data
- testing and verification automation
- consequential human-in-the-loop review

Start with primary sources from arXiv cs.SE, cs.AI, and cs.DB; the GitHub Copilot changelog; and
OpenAI news. Other primary sources are acceptable. Browse and open every source used. Verify the
publication date and substantive claim from the primary source, not a search-result snippet or
secondary report. Select three to five of the strongest eligible items.

Prefer omitting an unverifiable candidate. If an important fact still cannot be verified, place
`[REVIEW: reason]` beside it and mark publication as blocked. Never fabricate a replacement fact or
relax the date window.

## Public editorial rules

The public brief must read as a standalone research publication for engineers who build and govern
AI-assisted software systems.

- Use a neutral, independent editorial voice.
- In original public prose, do not use first-person or second-person framing.
- Source titles are exempt. Paraphrase quotations that would introduce personal framing.
- Never mention or address Brent, AI Native, private projects, AI agents as authors, the prompt,
  scheduled task, approval process, or prior conversations.
- Do not imply that the brief represents a named person's priorities, experience, strategy, or
  opinions.
- Frame consequences and takeaways for engineering teams or organizations generally.
- Attribute vendor results as vendor-reported.
- Explicitly identify preprints, small or author-built benchmarks, preview availability, and
  evaluation limits.
- Do not turn benchmark results into general claims.
- Do not infer adoption, safety, compliance, or production readiness.
- Write in original words. Quote only when exact wording matters, with no quote longer than 20 words.
- Use ordinary inline Markdown links only. Do not use citation markers, footnotes, widgets, source
  tables, or ChatGPT-only formatting.

The scheduled draft must not contain commentary. Commentary is optional and human-authored. Never
invent, infer, or ghostwrite it as if it came from Brent.

Return the complete public draft inside one fenced Markdown code block in exactly this shape:

```markdown
---
description: "One sentence, 240 characters or fewer, naming the week's through-line."
topics: ["kebab-case-topic", "another-topic"]
---
**This week's theme: one or two sentences.**

A short intro naming the strongest items.

## 1. Finding title

*Month D · Kind of source, for example "Empirical software engineering research"*

**Source:** [Primary source title](https://primary-source-url)

**What changed:** The supported change, result or finding, with its evidence boundary.

**Why it matters:** The software-engineering consequence, without inflating the claim.

**Practical takeaway:** One bounded action an engineering team can test or review.

## 2. Finding title

Repeat the same five parts and number all findings consecutively.

## Priorities for the week ahead

Optional neutral closing section of two or three sentences focused on broadly applicable engineering priorities.
```

Before returning the draft, verify that it has three to five findings; every item is inside the exact
window; every finding has all five required parts; the description is at most 240 characters; topics
are kebab-case; each link opens the primary source; every claim respects its evidence boundary; and
no public prose refers to Brent, AI Native, private work, agents, prompts, tasks, or conversations.

## Private AI Native improvement packet

Inspect the actual AI Native git repository read-only at `/Users/bstees/work/AI Native`. Read and
follow its repository instructions. Do not expose secrets or copy private repository details into
the public brief. Check current work, `signals/sources.yml`, `signals/ontology.yml`,
`decisions/current-epics.md`, and existing branches or plans before proposing anything. In
particular, distinguish new work from the existing `codex/weekly-digest-findings` branch and avoid
colliding with uncommitted work in the primary checkout.

Propose no more than three concrete opportunities. Give each a stable identifier in the form
`AIN-YYYY-MM-DD-01`. Each must connect a verified research finding to actual repository evidence,
not a generic trend. For every opportunity include:

- Evidence: the primary source and its stated limits.
- Repository context: the current behavior, component, gap, or existing related work observed.
- Proposed change: a bounded implementation or experiment.
- Expected benefit: a hypothesis to test, not a promised outcome.
- Scope: likely paths or components affected.
- Acceptance criteria and verification: tests, measurements, or consequential review required.
- Risks, unknowns, and collision status.
- Recommendation: implement, investigate first, or defer.

If the research does not support a worthwhile repository-specific improvement, say so. Do not
invent work to fill the packet. Keep this section private, decision-oriented, and separate from the
public Markdown file.

## Approval packet output

Use this overall response structure:

```text
# Friday AI Engineering Brief — approval packet
**Issue endpoint:** YYYY-MM-DD
**Research window:** YYYY-MM-DD through YYYY-MM-DD
**Publication status:** Ready for approval | Blocked — review required

## Public draft
[the fenced Markdown block]

## Private AI Native opportunities
[the stable-ID proposals, or a clear statement that none are recommended]

## Approval requested
[the two independent approval lanes below]
```

Site publication and AI Native implementation are separate approvals. Approval applies only to the
issue date and stable identifiers in this packet. Never carry approval into another issue.

Ask for one clear instruction for each lane:

Site:

- `Publish as drafted; no commentary.`
- `Publish with commentary: <exact public text>.`
- `Revise the brief: <instructions>.`
- `Hold publication.`

AI Native:

- `Implement AIN-YYYY-MM-DD-01 and AIN-YYYY-MM-DD-03.`
- `Investigate AIN-YYYY-MM-DD-02 only; do not change code.`
- `Revise the AI Native proposals: <instructions>.`
- `Hold all AI Native work.`

State that commentary is optional. If supplied with explicit publication approval, add it unchanged
at the end of the public brief under `## Commentary from Brent Stees`. Do not silently rewrite it.
If wording creates a factual, privacy, formatting, or publication concern, surface the concern before
publishing. Commentary text by itself is not publication approval.

Do not treat an ambiguous response as authorization when more than one lane or issue is pending.
Ask one concise clarifying question. A clear approval for one lane may proceed while the other stays
on hold.

## After explicit approval in a later turn

Execute only the clearly authorized lane and issue. A revision requires fresh explicit approval.

For approved site publication:

- Include only the approved commentary, if any.
- Never publish while a `[REVIEW: reason]` marker remains.
- Follow the brentstees.com repository's conventions.
- Validate the issue, build the site, run the relevant tests, commit and push the approved content,
  deploy it, and verify the live page.
- If validation, build, deployment, or live verification fails, stop and report the failure rather
  than claiming publication succeeded.

For approved AI Native items:

- Implement only the named stable identifiers and freeze their approved acceptance criteria.
- Follow the repository instructions and preserve unrelated user changes.
- Use a dedicated feature worktree based on `origin/main`; never implement through a dirty primary
  checkout. Continue an existing branch only when the approval names it explicitly.
- Use a repository-compatible Node runtime. Run `npm test`, `npm run build`,
  `npm run eval:instructions`, and relevant targeted validation when available.
- Obtain a fresh read-only review before presenting a reviewable commit, branch, or compare link.
- Implementation approval allows pushing the feature branch. It does not authorize merging,
  releasing, deploying, destructive migrations, shared-asset publication, or consumer rollout.
- If repository state or new evidence materially changes the approved scope, stop and request
  direction.
