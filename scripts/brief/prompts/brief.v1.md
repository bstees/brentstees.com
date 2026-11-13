# Friday AI Engineering Brief prompt v1

Prepare this week's issue for engineers who build and govern AI-assisted software systems.
Use the sources in `scripts/brief/sources.v2.json` as the starting set. An item is in scope only
when it materially concerns at least one of these focus areas:

- AI-assisted software delivery;
- agentic IDE workflows;
- retrieval-augmented generation over engineering data;
- testing and verification automation;
- consequential human-in-the-loop review.

Cover the seven days ending on the issue's Friday. Pick three to five items.

For each item write three original fields:

1. **What changed:** state the supported change, result, or finding and name the evidence boundary.
2. **Why it matters:** explain the software-engineering consequence without inflating the claim.
3. **Practical takeaway:** offer one bounded action an engineering team can test or review.

Attribute vendor results as vendor-reported. Identify preprints, small or author-constructed
benchmarks, preview availability, and evaluation limits. Do not turn benchmark results into general
performance claims. Do not infer adoption, safety, legal compliance, independent authorship, or
production readiness. Link the primary source for every item. Use no quotation unless the exact
wording is necessary; keep each quote to 20 words or fewer. Do not imitate source prose or structure.

Use a neutral, independent editorial voice for a standalone public publication. In original prose,
do not use first-person or second-person framing. Source titles are exempt; paraphrase quotations
that would introduce first-person or second-person framing. Never mention or address Brent, AI
Native, the site owner's work or projects, AI agents as the brief's authors, or the prompt, task,
prior conversation, or process used to produce the brief. Frame consequences and takeaways for
engineering teams or organizations generally.

An issue may end with `## Commentary from Brent Stees`, but only when Brent supplied that text and
explicitly approved it for publication. Never invent commentary or derive it from private context.
Keep the section last and reproduce the approved text verbatim unless Brent specifically requests
editing. Omit the heading and section when no commentary was supplied.

## Output

One Markdown file at `src/content/digests/YYYY-MM-DD.md` (the issue's Friday), in exactly the shape
of `scripts/brief/issue-template.md`. Then run `npm run validate:digests`; it fails closed, so fix
the issue until it passes. Mark anything you could not verify with `[REVIEW: reason]`; the
validator refuses to publish an issue that still carries a flag, so a person has to resolve it.
Before returning the issue, scan all original prose for first-person or second-person pronouns and
private-context references, and rewrite every such occurrence into neutral public-facing language.
The optional attributed commentary is exempt only from that neutral-voice pass; every other
validation rule still applies to it.
