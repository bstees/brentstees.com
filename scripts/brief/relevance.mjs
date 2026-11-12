// Scope filter for the Friday AI Engineering Brief.
// Ported from nuk's retired packages/editorial (relevance.ts, types.ts). The signal lists were
// widened slightly so that all 61 archive findings classify as in scope.

export const FOCUS_AREAS = [
  'ai-assisted-delivery',
  'agentic-ides',
  'engineering-rag',
  'testing-automation',
  'human-in-the-loop',
];

const ENGINEERING_CONTEXT =
  /\b(agent skill|agentic|code|coding|database|developer|engineering|ide|kernel|patch|program|repository|software|test|vulnerabilit)/i;

const SIGNALS = {
  'ai-assisted-delivery':
    /\b(ai-assisted|agent skill|agent deployment|agent-driven development|agentic (?:software )?(?:development|engineering)|code generation|coding agent|developer productivity|program synthesis|software delivery|software development|repository agent|code review)/i,
  'agentic-ides':
    /\b(agentic ide|coding assistant|copilot|developer tool|editor extension|ide|jetbrains|visual studio|vs code|xcode)/i,
  'engineering-rag':
    /\b(code search|context engineering|dependency-aware|engineering data|knowledge base|long-term memory|rag|retrieval|repository context|semantic search)/i,
  'testing-automation':
    /\b(automated test|correctness oracle|defect injection|formal(?:ly)? verif|mutation test|proof obligation|regression test|acceptance criteri|verification|test automation|test generation|test suite|testing automation|verified implementation)/i,
  'human-in-the-loop':
    /\b(approval|governance|human checkpoint|human[- ]in[- ]the[- ]loop|human oversight|human review|intervention|provenance|review gate|security review|supply chain|traceability)/i,
};

/** Focus areas a piece of text supports. Empty means out of scope. */
export function classifyFocusAreas(text, candidates = FOCUS_AREAS) {
  if (!ENGINEERING_CONTEXT.test(text)) return [];
  const allowed = new Set(candidates);
  return FOCUS_AREAS.filter((area) => allowed.has(area) && SIGNALS[area].test(text));
}

/** True when an ISO date falls inside the inclusive coverage window. */
export function isWithinCoverage(publishedAt, coverageStart, coverageEnd) {
  const value = new Date(publishedAt).valueOf();
  const start = new Date(`${coverageStart}T00:00:00.000Z`).valueOf();
  const endExclusive = new Date(`${coverageEnd}T00:00:00.000Z`).valueOf() + 86_400_000;
  return Number.isFinite(value) && value >= start && value < endExclusive;
}
