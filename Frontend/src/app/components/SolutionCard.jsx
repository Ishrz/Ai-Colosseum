import { useState } from 'react';

export default function SolutionCard({
  number,
  content,
  score,
  reasoning,
  isRecommended
}) {
  const [copied, setCopied] = useState(false);

  // Helper to detect and extract code block content
  const renderContent = (text) => {
    if (!text) return null;
    
    // Look for code blocks: ```lang ... ```
    const codeBlockRegex = /```(?:[a-zA-Z0-9+#-]+)?\n([\s\S]*?)\n```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(
          <p key={`text-${lastIndex}`} className="text-sm leading-relaxed text-text-muted whitespace-pre-line mb-3">
            {text.substring(lastIndex, match.index)}
          </p>
        );
      }

      // Add code block
      const codeText = match[1];
      parts.push(
        <div key={`code-${match.index}`} className="relative group my-4 rounded-lg overflow-hidden border border-border-subtle bg-[#0e0e11] font-mono text-xs">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle bg-[#141416]/50">
            <span className="text-[10px] uppercase font-bold tracking-wider text-text-dim">Source Snippet</span>
            <button
              onClick={() => handleCopy(codeText)}
              className="text-[10px] font-semibold text-text-dim hover:text-accent flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copied ? 'Copied!' : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v1.25c0 .621.504 1.125 1.125 1.125H6.75v-3.5z" />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 overflow-x-auto custom-scrollbar text-[#e4e4e7] leading-relaxed select-all">{codeText}</pre>
        </div>
      );

      lastIndex = codeBlockRegex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <p key={`text-${lastIndex}`} className="text-sm leading-relaxed text-text-muted whitespace-pre-line">
          {text.substring(lastIndex)}
        </p>
      );
    }

    return parts.length > 0 ? parts : (
      <pre className="whitespace-pre-wrap font-sans text-sm text-text-muted">{text}</pre>
    );
  };

  const handleCopy = (codeText) => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Color helper based on score
  const getScoreColor = (val) => {
    if (val >= 9.0) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (val >= 7.5) return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
    if (val >= 5.0) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  const getScoreBarColor = (val) => {
    if (val >= 9.0) return 'bg-emerald-500';
    if (val >= 7.5) return 'bg-indigo-500';
    if (val >= 5.0) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div
      className={`relative flex flex-col justify-between rounded-2xl border bg-bg-surface p-6 md:p-8 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] ${
        isRecommended
          ? 'border-accent shadow-[0_0_15px_rgba(99,102,241,0.1)]'
          : 'border-border-subtle'
      }`}
    >
      {/* Recommended badge */}
      {isRecommended && (
        <span className="absolute -top-3 left-6 flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-main shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
          </svg>
          Recommended
        </span>
      )}

      <div>
        {/* Solution Header Info */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-text-main">Solution {number}</h3>
            <p className="text-xs text-text-dim font-medium uppercase mt-0.5">Approach Analysis</p>
          </div>

          {/* Visual Score bubble */}
          <div className={`flex flex-col items-center justify-center rounded-xl border px-3.5 py-2 font-mono ${getScoreColor(score)}`}>
            <span className="text-xs text-text-muted font-sans font-medium uppercase tracking-wider scale-90">Score</span>
            <span className="text-xl font-bold tracking-tight">{score.toFixed(1)}</span>
          </div>
        </div>

        {/* Content Viewer (Code / Markup) */}
        <div className="space-y-3 mb-8">
          {renderContent(content)}
        </div>
      </div>

      {/* Judge Reasoning block */}
      <div className="mt-auto border-t border-border-subtle/50 pt-5">
        <div className="flex items-center gap-2 mb-2 text-text-muted">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-accent">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
          </svg>
          <span className="text-xs font-bold uppercase tracking-wider text-text-main">Judge's Critique</span>
        </div>

        {/* Score gauge bar */}
        <div className="w-full bg-[#1c1c1f] h-1.5 rounded-full overflow-hidden mb-3.5 border border-border-subtle/30">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(score)}`}
            style={{ width: `${score * 10}%` }}
          />
        </div>

        <p className="text-xs text-text-muted leading-relaxed font-sans italic">
          {reasoning || 'No details reasoning provided for this solution.'}
        </p>
      </div>
    </div>
  );
}
