export const COMMENTARY_HEADING = '## Commentary from Brent Stees';

/** Read rendered Markdown headings, ignoring fenced code and HTML comments. */
function readHeadings(body) {
  const headings = [];
  const lines = body.split('\n');
  let offset = 0;
  let fence = null;
  let inComment = false;
  let rawHtml = false;
  let setextCandidate = null;

  for (const line of lines) {
    const lineStart = offset;
    offset += line.length + 1;

    const fenceMarker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence) {
      if (
        fenceMarker
        && fenceMarker[1][0] === fence.character
        && fenceMarker[1].length >= fence.length
        && fenceMarker[2].trim() === ''
      ) fence = null;
      setextCandidate = null;
      continue;
    }
    if (inComment) {
      if (line.includes('-->')) inComment = false;
      setextCandidate = null;
      continue;
    }
    if (fenceMarker) {
      fence = { character: fenceMarker[1][0], length: fenceMarker[1].length };
      setextCandidate = null;
      continue;
    }
    if (line.includes('<!--')) {
      rawHtml = true;
      if (!line.slice(line.indexOf('<!--') + 4).includes('-->')) inComment = true;
      setextCandidate = null;
      continue;
    }
    // Plain Markdown is required. Treat even multiline or unclosed HTML openers as raw HTML so
    // they cannot swallow a later attribution heading in the rendered document.
    if (/<(?:\/?[A-Za-z]|!|\?)/.test(line)) rawHtml = true;

    const atx = line.match(/^ {0,3}(#{1,6})(?:[ \t]+|$)(.*)$/);
    if (atx) {
      headings.push({
        depth: atx[1].length,
        text: atx[2].replace(/[ \t]+#+[ \t]*$/, '').trim(),
        index: lineStart,
        endIndex: lineStart + line.length,
      });
      setextCandidate = null;
      continue;
    }

    const setext = line.match(/^ {0,3}(=+|-+)[ \t]*$/);
    if (setext && setextCandidate) {
      headings.push({
        depth: setext[1][0] === '=' ? 1 : 2,
        text: setextCandidate.text.trim(),
        index: setextCandidate.index,
        endIndex: lineStart + line.length,
      });
      setextCandidate = null;
      continue;
    }

    setextCandidate = line.trim() === '' || /^ {4}/.test(line)
      ? null
      : { text: line, index: lineStart };
  }

  return { headings, rawHtml };
}

/**
 * Separate the neutral research brief from Brent's optional, explicitly attributed commentary.
 * The commentary must be the final H2 section so its personal voice cannot blur into the brief.
 */
export function splitCommentary(body) {
  const { headings, rawHtml } = readHeadings(body);
  const exactHeadings = headings.filter(
    (heading) => heading.depth === 2 && heading.text === 'Commentary from Brent Stees',
  );
  const commentaryHeadings = headings.filter((heading) => /^Commentary\b/i.test(heading.text));
  const errors = [];

  if (rawHtml) errors.push('contains raw HTML; use plain Markdown');
  if (commentaryHeadings.some((heading) => heading.depth !== 2 || heading.text !== 'Commentary from Brent Stees')) {
    errors.push(`commentary heading must be exactly "${COMMENTARY_HEADING}"`);
  }
  if (exactHeadings.length > 1) errors.push('commentary section appears more than once');
  if (exactHeadings.length !== 1) return { researchBody: body, commentary: null, errors };

  const [heading] = exactHeadings;
  const researchBody = body.slice(0, heading.index).trimEnd();
  const commentary = body.slice(heading.endIndex).trim();
  const laterHeadings = headings.filter((candidate) => candidate.index > heading.index);

  if (commentary === '') errors.push('commentary section is empty');
  if (laterHeadings.some((candidate) => candidate.depth <= 2)) {
    errors.push('commentary must be the final top-level section');
  }
  if (laterHeadings.some((candidate) => candidate.depth <= 3 && /^\d+\.\s/.test(candidate.text))) {
    errors.push('commentary cannot contain a numbered finding heading');
  }

  return { researchBody, commentary, errors };
}
