// Minimal Markdown renderer — no new dependencies.
// Supports: headings, bold/italic/inline-code/links, unordered & ordered lists,
// blockquotes, horizontal rules, tables, and paragraphs.

function parseInline(text) {
  const nodes = [];
  const re = /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push({ type: "text", value: text.slice(last, m.index) });
    if (m[1] !== undefined) nodes.push({ type: "code", value: m[1] });
    else if (m[2] !== undefined) nodes.push({ type: "strong", value: m[2] });
    else if (m[3] !== undefined) nodes.push({ type: "em", value: m[3] });
    else if (m[4] !== undefined) nodes.push({ type: "em", value: m[4] });
    else if (m[5] !== undefined) nodes.push({ type: "link", text: m[5], url: m[6] });
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push({ type: "text", value: text.slice(last) });
  return nodes;
}

function renderInlineNodes(nodes) {
  return nodes.map((n, i) => {
    const key = `inline-${i}`;
    if (n.type === "text") return <span key={key}>{n.value}</span>;
    if (n.type === "code")
      return (
        <code key={key} className="font-mono text-[13px] bg-bg-base border border-border-subtle rounded px-1.5 py-0.5 text-text-main">
          {n.value}
        </code>
      );
    if (n.type === "strong")
      return <strong key={key} className="font-semibold text-text-main">{renderInlineNodes(parseInline(n.value))}</strong>;
    if (n.type === "em")
      return <em key={key} className="italic">{renderInlineNodes(parseInline(n.value))}</em>;
    if (n.type === "link")
      return (
        <a key={key} href={n.url} target="_blank" rel="noopener noreferrer" className="text-accent underline hover:opacity-80">
          {n.text}
        </a>
      );
    return null;
  });
}

function parseCells(line) {
  return line
    .replace(/^\s*\|/, "")
    .replace(/\|\s*$/, "")
    .split("|")
    .map((c) => c.trim());
}

function isTableSeparator(line) {
  const t = line.trim();
  if (!t.includes("|")) return false;
  const cells = t.replace(/^\|/, "").replace(/\|$/, "").split("|");
  if (cells.length < 2) return false;
  return cells.every((c) => /^:?-+:?$/.test(c.trim()));
}

function isSpecial(line, nextLine) {
  if (/^#{1,6}\s/.test(line)) return true;
  if (/^\s*[-*+]\s/.test(line)) return true;
  if (/^\s*\d+\.\s/.test(line)) return true;
  if (line.startsWith(">")) return true;
  if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) return true;
  if (nextLine && line.includes("|") && isTableSeparator(nextLine)) return true;
  return false;
}

function parseBlocks(md) {
  const blocks = [];
  const lines = md.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") {
      i++;
      continue;
    }

    const hm = line.match(/^(#{1,6})\s+(.*)$/);
    if (hm) {
      blocks.push({ type: "heading", level: hm[1].length, text: hm[2].trim() });
      i++;
      continue;
    }

    if (line.includes("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const headers = parseCells(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim() !== "" && lines[i].includes("|")) {
        rows.push(parseCells(lines[i]));
        i++;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    const lm = line.match(/^\s*[-*+]\s+(.*)$/);
    const olm = line.match(/^\s*\d+\.\s+(.*)$/);
    if (lm || olm) {
      const ordered = !!olm;
      const items = [];
      while (i < lines.length) {
        const m = ordered ? lines[i].match(/^\s*\d+\.\s+(.*)$/) : lines[i].match(/^\s*[-*+]\s+(.*)$/);
        if (!m) break;
        items.push(m[1].trim());
        i++;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    if (line.startsWith(">")) {
      const quote = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        quote.push(lines[i].slice(1).replace(/^\s?/, "").trim());
        i++;
      }
      blocks.push({ type: "quote", text: quote.join(" ") });
      continue;
    }

    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    const para = [];
    while (i < lines.length) {
      const l = lines[i];
      if (l.trim() === "") break;
      if (isSpecial(l, lines[i + 1])) break;
      para.push(l);
      i++;
    }
    blocks.push({ type: "paragraph", text: para.join(" ").trim() });
  }
  return blocks;
}

function renderBlocks(blocks) {
  return blocks.map((b, i) => {
    const key = `block-${i}`;
    switch (b.type) {
      case "heading": {
        const level = Math.min(Math.max(b.level, 1), 6);
        const Tag = level <= 2 ? "h2" : level === 3 ? "h3" : "h4";
        const classes =
          level <= 2
            ? "text-xl md:text-2xl font-semibold tracking-tight"
            : level === 3
              ? "text-base md:text-xl font-semibold tracking-tight"
              : "text-sm font-semibold tracking-tight";
        return (
          <Tag key={key} className={`${classes} text-text-main mt-6 first:mt-0 mb-3`}>
            {renderInlineNodes(parseInline(b.text))}
          </Tag>
        );
      }
      case "table":
        return (
          <div key={key} className="overflow-x-auto rounded-lg border border-border-subtle bg-bg-base my-5">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border-subtle">
                  {b.headers.map((h, ci) => (
                    <th key={ci} className="h-10 px-4 text-[11px] uppercase font-semibold font-mono text-text-dim">
                      {renderInlineNodes(parseInline(h))}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.rows.map((row, ri) => (
                  <tr key={ri} className="bg-bg-surface border-b border-border-subtle last:border-b-0">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-4 py-3 text-sm leading-relaxed text-text-main">
                        {renderInlineNodes(parseInline(cell))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "list": {
        const ListTag = b.ordered ? "ol" : "ul";
        return (
          <ListTag key={key} className={`${b.ordered ? "list-decimal" : "list-disc"} space-y-1.5 pl-6 my-4 text-sm text-text-muted`}>
            {b.items.map((item, i) => (
              <li key={i} className="leading-relaxed">{renderInlineNodes(parseInline(item))}</li>
            ))}
          </ListTag>
        );
      }
      case "quote":
        return (
          <blockquote key={key} className="border-l-2 border-accent pl-4 my-4 text-sm text-text-muted italic leading-relaxed">
            {renderInlineNodes(parseInline(b.text))}
          </blockquote>
        );
      case "hr":
        return <hr key={key} className="border-border-subtle my-6" />;
      case "paragraph":
      default:
        return (
          <p key={key} className="text-sm leading-relaxed text-text-muted mb-3">
            {renderInlineNodes(parseInline(b.text))}
          </p>
        );
    }
  });
}

export default function Markdown({ text, className }) {
  if (!text) return null;
  return <div className={className}>{renderBlocks(parseBlocks(text))}</div>;
}
