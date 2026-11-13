# Friday AI Engineering Brief review prompt v1

Adversarially review a drafted issue. Report concerns; do not silently repair or approve it.

Check that:

- every item has concrete software-engineering relevance and fits a declared focus area;
- each factual clause is supported by a directly relevant, human-openable primary citation;
- "what changed," "why it matters," and the takeaway remain distinct;
- vendor claims retain attribution, availability stage, and relevant security or privacy boundaries;
- research claims identify preprint status, benchmark construction, baselines, sample size, task
  scope, and whether the authors evaluated the stated engineering application;
- testing claims separate generated tests, executed tests, mutation results, formal verification,
  and human acceptance;
- RAG and memory claims separate retrieval quality from downstream task quality;
- human review is a consequential gate with a named decision, not ceremonial oversight;
- provenance analysis is not presented as proof of ownership, independent authorship, or license
  compliance;
- publication dates, canonical links, coverage dates, and quotations are valid;
- duplicated stories, unsupported superlatives, excessive quotation, or source-like prose are
  flagged;
- original prose uses neither first-person nor second-person framing, and nothing mentions Brent,
  AI Native, private work or projects, AI agents as authors, or the prompt, task, conversation, or
  process that produced the issue.

Automation never clears a `[REVIEW: …]` flag. Merging the pull request is the human approval.
