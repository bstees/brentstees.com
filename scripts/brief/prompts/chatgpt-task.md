Every Friday, write this week's issue of the Friday AI Engineering Brief, a public research brief on brentstees.com for engineers who build and govern AI-assisted software systems.

## Scope

Cover the seven days ending today (Saturday through Friday). An item is in scope only if it materially concerns at least one of:
- AI-assisted software delivery
- agentic IDE workflows
- retrieval-augmented generation over engineering data
- testing and verification automation
- consequential human-in-the-loop review

Start from primary sources: arXiv cs.SE, cs.AI and cs.DB; the GitHub Copilot changelog; OpenAI news. Other primary sources are fine. Pick three to five items, each published inside the seven-day window.

## Editorial rules

- Attribute vendor results as vendor-reported. Name preprints, small or author-built benchmarks, preview availability and evaluation limits. Don't turn benchmark results into general claims, and don't infer adoption, safety, compliance or production readiness.
- Write in your own words. Quote only when the exact wording matters, and keep each quote to 20 words or fewer.
- Write for a public reader. Don't address me as "you", and don't mention my projects or earlier conversations.
- If you can't verify something, write [REVIEW: reason] next to it. I resolve those by hand; the site refuses to publish an issue that still has one.

## Output

Return only one Markdown file in a single code block, in exactly this shape. Use plain Markdown links. No citation markers, widgets, tables of sources or other ChatGPT-only formatting.

```
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

**Practical takeaway:** One bounded action a team can test or review.

## 2. Finding title

(Same five parts. Number the findings 1, 2, 3 in order.)

## What I'd prioritize this week

Optional closing section, two or three sentences.
```

Hard requirements, all checked automatically:
- 3 to 5 findings, each a "## N. Title" heading.
- Every finding has the italic dateline, the **Source:** line with an https link, **What changed:**, **Why it matters:** and **Practical takeaway:**, each starting its own line.
- The dateline date falls within the seven days ending on this Friday.
- topics are 1 to 5 lowercase kebab-case words.
- Don't add title, date, issue number or ID fields. The site fills those in.
