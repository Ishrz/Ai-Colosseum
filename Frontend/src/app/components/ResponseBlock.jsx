import SolutionCard from './SolutionCard';

export default function ResponseBlock({ responseData }) {
  if (!responseData) return null;

  const { problem, solution_1, solution_2, judge } = responseData;
  const score1 = judge?.solution_1_score || 0;
  const score2 = judge?.solution_2_score || 0;

  const rec1 = score1 > score2;
  const rec2 = score2 > score1;
  const isTie = score1 === score2;

  // Verdict summary text
  const getVerdictText = () => {
    if (isTie) return "It's a complete draw. Both solutions are equally viable depending on implementation contexts.";
    const margin = Math.abs(score1 - score2).toFixed(1);
    const winner = score1 > score2 ? 'Solution 1' : 'Solution 2';
    return `${winner} recommended by a margin of ${margin} points. See the critiques below for detailed reasoning.`;
  };

  return (
    <div className="space-y-8 md:space-y-10 my-10 animate-in fade-in slide-in-from-bottom-6 duration-300">

      {/* Problem context — Chamber: Surface panel, no alpha */}
      <div className="bg-bg-surface rounded-lg p-6 border border-border-subtle">
        <h4 className="text-xs font-bold text-accent uppercase tracking-widest mb-1.5 font-mono">Arena Question</h4>
        <p className="text-sm font-medium text-text-main leading-relaxed">
          {problem || 'Evaluating problem...'}
        </p>
      </div>

      {/* Verdict banner — Chamber: flat banner, S1/S2 badges */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border border-border-subtle bg-bg-surface px-6 py-5 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-bg-surface-elevated border border-border-muted text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 01-3.296 1.043C14.635 3.63 15.75 4.268 15.75 5z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-main">Judge's Final Verdict</h4>
            <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{getVerdictText()}</p>
          </div>
        </div>

        {/* Quick summary badges — Chamber: verdict-success on the winner */}
        <div className="flex gap-2 font-mono text-[10px] font-bold uppercase tracking-widest mt-3 lg:mt-0">
          <span className={`px-2.5 py-1 rounded-sm border ${
            rec1 ? 'bg-bg-surface border-verdict-success text-verdict-success' : 'bg-bg-surface border-border-subtle text-text-muted'
          }`}>
            S1: {score1.toFixed(1)}
          </span>
          <span className={`px-2.5 py-1 rounded-sm border ${
            rec2 ? 'bg-bg-surface border-verdict-success text-verdict-success' : 'bg-bg-surface border-border-subtle text-text-muted'
          }`}>
            S2: {score2.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Side-by-side — Chamber: Dual-Colosseum Split Grid (6/6 on desktop), stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <SolutionCard
          number={1}
          content={solution_1}
          score={score1}
          reasoning={judge?.solution_1_reasoning}
          isRecommended={rec1}
        />
        <SolutionCard
          number={2}
          content={solution_2}
          score={score2}
          reasoning={judge?.solution_2_reasoning}
          isRecommended={rec2}
        />
      </div>
    </div>
  );
}
