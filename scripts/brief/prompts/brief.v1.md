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

Write for a public reader. Do not address the site's author as "you" or refer to their private
projects or earlier conversations.

## Output

One Markdown file at `src/content/digests/YYYY-MM-DD.md` (the issue's Friday), in exactly the shape
of `scripts/brief/issue-template.md`. Then run `npm run validate:digests`; it fails closed, so fix
the issue until it passes. Mark anything you could not verify with `[REVIEW: reason]`; the
validator refuses to publish an issue that still carries a flag, so a person has to resolve it.
