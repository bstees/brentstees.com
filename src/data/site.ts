// Single source of truth for page copy, system maps, and the console's knowledge base.
// Facts are limited to what Brent has stated and what his public repos show.

// Feature flags: flip on when a section is ready to ship.
export const features = {
  console: false, // agent console: on hold until the real version is designed
  brief: true, // AI engineering brief teaser, nav entry, and footer link
};

export const links = {
  github: 'https://github.com/bstees',
  codepen: 'https://codepen.io/bstees',
  linkedin: 'https://www.linkedin.com/in/brent-stees',
  email: '', // TODO: add preferred public address
};

export type MapNode = {
  id: string;
  label: string;
  x: number; // percent of map width
  y: number; // percent of map height
  hub?: boolean;
  detail: string;
};

export type Project = {
  id: string;
  index: string;
  title: string;
  kind: string;
  summary: string;
  lead: string;
  build: string;
  stack: string[];
  href: string;
  nodes: MapNode[];
  edges: [string, string][];
};

export const projects: Project[] = [
  {
    id: 'ai-native',
    index: '01',
    title: 'AI Native',
    kind: 'Engineering operating system',
    summary:
      'The central standards, workflows, skills, and governance layer for a hybrid human-and-agent development model. Product work happens in product repos; this repo improves how those repos work.',
    lead:
      'Makes AI-assisted delivery repeatable without removing human judgment. Teams inherit a shared operating surface, decisions are written down with their reasoning, and risky work routes through explicit human review.',
    build:
      'A versioned asset pipeline: shared standards and skills sync into consumer repos as a managed overlay, with drift triage, calver releases, a deterministic repo-surface index, and an instruction-evaluation harness for AI-facing Markdown.',
    stack: ['Node', 'React', 'Vite', 'Express', 'D3', 'Docker', 'MySQL'],
    href: 'https://github.com/bstees/ai-native',
    nodes: [
      { id: 'signals', label: 'Signals', x: 11, y: 22, detail: 'Monitored sources and evidence inputs. Changes to the system start from observed friction, not opinion.' },
      { id: 'decisions', label: 'Decisions', x: 11, y: 78, detail: 'What we believe and why. Decision records make the reasoning behind every standard inspectable.' },
      { id: 'core', label: 'Shared assets', x: 46, y: 50, hub: true, detail: 'Standards, workflows, skills, sub-agent profiles, context policy, routing, and provider adapters — the operating surface every repo inherits.' },
      { id: 'evals', label: 'Instruction evals', x: 46, y: 12, detail: 'Cases, run contracts, and comparison guidance for AI-facing Markdown. Agent instructions get tested like code.' },
      { id: 'review', label: 'Human review', x: 46, y: 88, detail: 'A review queue and approval surfaces. Large, risky, or cross-cutting changes plan first and pass a human gate.' },
      { id: 'sync', label: 'Versioned sync', x: 76, y: 50, detail: 'Triage per target: install if missing, update and prune if drifted, report if current. Releases follow calver (YY.MM.patch).' },
      { id: 'repos', label: 'Product repos', x: 93, y: 22, detail: 'Consumers own their instruction files and receive a local .ai-native/ overlay refreshed from the source.' },
      { id: 'index', label: 'Surface index', x: 93, y: 78, detail: 'A deterministic, Git-private index of exported contracts, routes, and schemas — so agents query before they explore.' },
    ],
    edges: [
      ['signals', 'core'], ['decisions', 'core'], ['evals', 'core'], ['core', 'review'],
      ['core', 'sync'], ['sync', 'repos'], ['sync', 'index'],
    ],
  },
  {
    id: 'orca',
    index: '02',
    title: 'Orca',
    kind: 'AI workstream orchestration',
    summary:
      'Track many parallel AI coding sessions from one dashboard, and get a push notification the moment one needs a decision.',
    lead:
      'Parallel agents only scale if the human stays the bottleneck by choice, not by accident. Orca keeps every session legible and turns “is it blocked?” into a notification instead of a polling habit.',
    build:
      'A Fastify hub exposing MCP tools and a WebSocket feed. A VS Code extension registers each window and reports idle state; sessions call orca_request_input, which raises a dashboard banner and an ntfy push. State lives in SQLite; an Electron shell bundles server and UI.',
    stack: ['MCP', 'Fastify', 'WebSockets', 'React', 'VS Code API', 'SQLite', 'Electron'],
    href: 'https://github.com/bstees/Orca',
    nodes: [
      { id: 'agent', label: 'AI session', x: 11, y: 22, detail: 'Each coding agent talks to Orca through MCP tools. When it needs a human, it calls orca_request_input.' },
      { id: 'ext', label: 'VS Code ext.', x: 11, y: 78, detail: 'Registers each editor window with the server on startup and reports status plus idle detection.' },
      { id: 'server', label: 'Orca server', x: 48, y: 50, hub: true, detail: 'The central hub on :7337 — tracks sessions, serves the dashboard, and exposes MCP tools over a WebSocket channel.' },
      { id: 'db', label: 'SQLite registry', x: 48, y: 88, detail: 'Durable session state, so the picture survives restarts. Rebuilt natively for the Electron desktop shell.' },
      { id: 'dash', label: 'Live dashboard', x: 88, y: 22, detail: 'A real-time React UI showing every session at a glance, with a built-in demo mode that replays realistic data.' },
      { id: 'push', label: 'ntfy push', x: 88, y: 78, detail: 'Input requests fire a push notification to your phone. Self-hosted ntfy servers are supported.' },
    ],
    edges: [['agent', 'server'], ['ext', 'server'], ['server', 'db'], ['server', 'dash'], ['server', 'push']],
  },
];

export const capabilities = [
  {
    title: 'Agentic workflows',
    lead: 'Operating models, governance, and human decision gates that make AI-assisted delivery trustworthy at team scale.',
    build: 'Multi-agent orchestration, MCP servers and tools, context policy, routing, and evaluation harnesses for prompts and instructions.',
  },
  {
    title: 'CSS & UX architecture',
    lead: 'Hundreds of sites designed, built, and shipped. Clear hierarchy, reusable patterns, and critical flows treated as one system.',
    build: 'Token-driven design systems, fluid type, container queries, :has()-driven state, and motion that respects reduced-motion users.',
  },
  {
    title: 'Creative direction',
    lead: 'Setting the bar for craft across a team — a point of view on quality that people can recognize and repeat.',
    build: 'Turning a direction into constraints: type scales, spacing systems, component contracts, and review criteria.',
  },
  {
    title: 'Scaling web apps',
    lead: 'Leading engineering teams through growth — paved paths, onboarding, and standards that make the right work easier.',
    build: 'CI/CD, repeatable environments, sync and rollout pipelines, and automation that removes avoidable toil.',
  },
  {
    title: 'Observability & feedback',
    lead: 'Shortening the distance between intent, implementation, and evidence so decisions happen sooner.',
    build: 'Session state, health signals, review queues, live dashboards, and fast test harnesses that keep work legible.',
  },
];

export const principles = [
  ['Context before prescription', 'Understand the system, its constraints, and the people inside it before choosing the mechanism.'],
  ['Make the right path easier', 'Good enablement turns quality into the path of least resistance, not another checklist.'],
  ['Feedback is a product surface', 'The speed and clarity of learning shape the quality of every decision that follows.'],
];

// ---- Console knowledge base -------------------------------------------------
export type KbEntry = { id: string; keys: string[]; answer: string; cite: string; citeLabel: string };

export const kb: KbEntry[] = [
  {
    id: 'overview',
    keys: ['who', 'brent', 'about', 'summary', 'background', 'overview', 'introduce', 'tldr', 'yourself'],
    answer: 'Brent is a software engineering manager who retooled as an agentic product and automation engineer. He pairs team leadership and creative direction with hands-on work: CSS and UX architecture, and the AI workflows that help web apps scale.',
    cite: '#about', citeLabel: 'About',
  },
  {
    id: 'build',
    keys: ['build', 'builds', 'building', 'automation', 'automate', 'agents', 'agent', 'agentic', 'workflow', 'workflows', 'ai', 'llm', 'mcp', 'engineer', 'technical', 'code'],
    answer: 'He builds agentic systems around the work itself: an operating layer that syncs standards, skills, and evals into product repos (AI Native), and an MCP-based hub that orchestrates parallel AI coding sessions with human-in-the-loop alerts (Orca).',
    cite: '#work', citeLabel: 'Selected work',
  },
  {
    id: 'lead',
    keys: ['lead', 'leader', 'leadership', 'manage', 'manager', 'management', 'team', 'teams', 'style', 'people', 'hire', 'culture'],
    answer: 'His leadership stays close to the work: understand the system before prescribing, make the right path the easy one, and treat feedback speed as a product surface. The goal is not more process; it is better judgment, exercised sooner.',
    cite: '#about', citeLabel: 'Leadership',
  },
  {
    id: 'ai-native',
    keys: ['ai-native', 'native', 'standards', 'governance', 'sync', 'operating', 'calver', 'skills'],
    answer: 'AI Native is a central standards, workflows, skills, and governance repo for hybrid human-and-agent development. It syncs a versioned overlay into consumer repos, triages drift, indexes repo surfaces deterministically, and evaluates AI-facing instructions.',
    cite: '#ai-native', citeLabel: 'AI Native',
  },
  {
    id: 'orca',
    keys: ['orca', 'orchestration', 'orchestrate', 'parallel', 'sessions', 'dashboard', 'notification', 'ntfy', 'vscode', 'websocket'],
    answer: 'Orca tracks multiple AI coding sessions from one dashboard. Sessions call an MCP tool when they need input, which raises a dashboard banner and a push notification. Fastify, WebSockets, React, SQLite, a VS Code extension, and an Electron shell.',
    cite: '#orca', citeLabel: 'Orca',
  },
  {
    id: 'css',
    keys: ['css', 'ux', 'ui', 'design', 'designer', 'frontend', 'front-end', 'interface', 'sites', 'websites', 'typography', 'accessibility', 'a11y'],
    answer: 'CSS and UX are his home turf: hundreds of sites designed, built, and shipped. This page is a sample: vanilla CSS, light-dark() theming, :has()-driven state that works without JavaScript, container queries, and fluid type.',
    cite: '#capabilities', citeLabel: 'Capabilities',
  },
  {
    id: 'creative',
    keys: ['creative', 'direction', 'director', 'brand', 'craft', 'quality', 'taste', 'art'],
    answer: 'As a creative director he sets the bar for craft across a team, then turns that direction into constraints others can apply: type scales, spacing systems, component contracts, and review criteria.',
    cite: '#capabilities', citeLabel: 'Capabilities',
  },
  {
    id: 'stack',
    keys: ['stack', 'tools', 'tech', 'technologies', 'languages', 'react', 'node', 'typescript', 'framework', 'frameworks'],
    answer: 'Recent public work uses Node, React, Vite, Express, Fastify, WebSockets, MCP, SQLite and MySQL, Docker, D3, the VS Code extension API, and Electron. This site is Astro with zero client framework.',
    cite: '#work', citeLabel: 'Selected work',
  },
  {
    id: 'scale',
    keys: ['scale', 'scaling', 'scaled', 'devops', 'ci', 'cd', 'pipeline', 'pipelines', 'deploy', 'release', 'enablement'],
    answer: 'He scales web apps by automating the path to production: repeatable environments, CI/CD, sync and rollout pipelines, and shared standards that let teams onboard faster and ship with less friction.',
    cite: '#capabilities', citeLabel: 'Capabilities',
  },
  {
    id: 'evals',
    keys: ['eval', 'evals', 'evaluation', 'test', 'testing', 'human', 'loop', 'review', 'safety', 'risk', 'trust'],
    answer: 'He treats agent instructions like code: evaluation cases and run contracts for AI-facing Markdown, human review gates for risky changes, and governance for data handling and escalation.',
    cite: '#ai-native', citeLabel: 'AI Native',
  },
  {
    id: 'site',
    keys: ['site', 'page', 'website', 'console', 'works', 'how', 'made', 'built', 'this', 'retrieval'],
    answer: 'This console is a small deterministic agent: it parses your question, scores it against a knowledge base of this page’s content, ranks the results, and composes a cited answer. It runs entirely in your browser, with no network calls.',
    cite: '#console', citeLabel: 'Console',
  },
  {
    id: 'contact',
    keys: ['contact', 'reach', 'email', 'hire', 'hiring', 'available', 'availability', 'work', 'together', 'connect', 'linkedin', 'talk'],
    answer: 'The best route is LinkedIn. He’s interested in conversations about agentic product engineering, AI-native development, developer experience, and hands-on product systems work.',
    cite: '#contact', citeLabel: 'Contact',
  },
];

export const suggestions = [
  'What does Brent build?',
  'How does he lead teams?',
  'What is Orca?',
  'How deep is his CSS?',
  'How does this console work?',
];
