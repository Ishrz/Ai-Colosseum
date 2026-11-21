import { useState } from 'react';
import Markdown from './Markdown.jsx';

export default function SolutionCard({
  number,
  content,
  score,
  reasoning,
  isRecommended
}) {
  const [copied, setCopied] = useState(false);

  // Chamber: winner card gets a flat accent border (Rose for S1, Sky for S2).
  const borderClass = isRecommended
    ? (number === 2 ? 'border-accent-b' : 'border-accent')
    : 'border-border-subtle';
  const gaugeFillClass = isRecommended
    ? (number === 2 ? 'bg-accent-b' : 'bg-accent')
    : 'bg-text-dim';

  // Extract code blocks from text (Chamber: Geist Mono code blocks inside flat panels).
  const renderContent = (text) => {
    if (!text) return null;

    const codeBlockRegex = /```(?:[a-zA-Z0-9+#-]+)?\n([\s\S]*?)\n```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <Markdown key={`md-${lastIndex}`} text={text.substring(lastIndex, match.index)} />
        );
      }

      const codeText = match[1];
      parts.push(
        <div key={`code-${match.index}`} className="relative group my-4 rounded-lg overflow-hidden border border-border-subtle bg-bg-base">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-bg-surface">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-dim">Source Snippet</span>
            <button
              onClick={() => handleCopy(codeText)}
              className="text-[10px] font-semibold text-text-dim hover:text-text-main flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="p-4 overflow-x-auto text-xs md:text-sm leading-relaxed select-all text-text-main">{codeText}</pre>
        </div>
      );

      lastIndex = codeBlockRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(
        <Markdown key={`md-${lastIndex}`} text={text.substring(lastIndex)} />
      );
    }

    return parts.length > 0 ? parts : <Markdown text={text} />;
  };

  const handleCopy = (codeText) => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Chamber: verdict-success on winners, warning-accent on strong scores.
  const getScoreColor = (val, winner) => {
    if (winner) return 'text-verdict-success border-verdict-success';
    if (val >= 5.0) return 'text-warning-accent border-warning-accent';
    return 'text-text-muted border-border-subtle';
  };

  return (
    <div
      className={`relative flex flex-col justify-between rounded-lg border ${borderClass} bg-bg-surface p-8 transition-all duration-200`}
    >
      {isRecommended && (
        <span className={`absolute -top-3 left-6 flex items-center gap-1.5 rounded-sm border bg-bg-surface-elevated px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
          number === 2 ? 'text-accent-b border-accent-b' : 'text-accent border-accent'
        }`}>
          Recommended
        </span>
      )}

      <div>
        {/* Solution header — Chamber: headline + score bubble */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm md:text-base font-semibold tracking-tight text-text-main">Solution {number}</h3>
            <p className="text-[11px] font-semibold uppercase mt-0.5 text-text-dim">Approach Analysis</p>
          </div>

          <div className={`flex flex-col items-center justify-center rounded-lg border px-4 py-3 font-mono ${getScoreColor(score, isRecommended)}`}>
            <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider scale-90">Score</span>
            <span className="text-2xl font-mono font-bold tracking-tight">{score.toFixed(1)}</span>
          </div>
        </div>

        {/* Content viewer (code blocks) */}
        <div className="space-y-3 mb-8">
          {renderContent(content)}
        </div>
      </div>

      {/* Judge reasoning block — Chamber: flat */}
      <div className="mt-auto border-t border-border-subtle pt-5 space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider font-mono text-text-muted">Judge's Critique</span>

        <div className="w-full bg-bg-surface-elevated h-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${gaugeFillClass}`}
            style={{ width: `${score * 10}%` }}
          />
        </div>

        {reasoning ? (
          <Markdown text={reasoning} className="italic" />
        ) : (
          <p className="text-xs text-text-muted leading-relaxed font-sans italic">
            No details reasoning provided for this solution.
          </p>
        )}
      </div>
    </div>
  );
}
