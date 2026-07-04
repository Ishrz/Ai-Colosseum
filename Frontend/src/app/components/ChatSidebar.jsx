import { useState } from 'react';

export default function ChatSidebar({
  threads,
  activeThreadId,
  onSelectThread,
  onNewThread,
  useMock,
  setUseMock,
  apiEndpoint,
  setApiEndpoint,
  isOpen,
  setIsOpen
}) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border-subtle bg-bg-surface py-6 px-4 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand logo & name */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 text-accent border border-accent/30 font-bold text-lg">
            AC
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-text-main font-sans">AI Colosseum</h1>
            <p className="text-xs text-text-dim">Dual solution evaluator</p>
          </div>
        </div>

        {/* New Chat CTA */}
        <button
          onClick={() => {
            onNewThread();
            setIsOpen(false);
          }}
          className="flex w-full items-center justify-between rounded-xl border border-border-subtle bg-[#1c1c1f] p-4 text-sm font-semibold text-text-main hover:bg-bg-surface-elevated active:scale-98 transition-all duration-200 mb-6 cursor-pointer"
        >
          <span>New Battle</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 text-accent"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>

        {/* Scrollable Threads area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-dim px-2 mb-2">History</p>
          
          {threads.length === 0 ? (
            <p className="text-xs text-text-dim italic px-2 py-3">No battles fought yet</p>
          ) : (
            threads.map((t) => {
              const isActive = t.id === activeThreadId;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelectThread(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-150 truncate cursor-pointer ${
                    isActive
                      ? 'bg-accent-dim text-accent font-medium border-l-2 border-accent'
                      : 'text-text-muted hover:bg-bg-surface-elevated hover:text-text-main'
                  }`}
                >
                  {t.title || 'Untitled Battle'}
                </button>
              );
            })
          )}
        </div>

        {/* Settings and Info area */}
       
      </aside>
    </>
  );
}
