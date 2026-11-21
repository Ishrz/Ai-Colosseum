import { useEffect, useRef, useState } from "react";
import { useArena } from "./state/useArena.js";
import ChatSidebar from "./components/ChatSidebar.jsx";
import ResponseBlock from "./components/ResponseBlock.jsx";
import { WELCOME_PRESETS } from "./features/presets.js";

export default function App() {
  const arena = useArena();

  const { threads, activeThread, activeThreadId, input, loading, sidebarOpen } = arena;

  const userMsgRef = useRef(null);
  const lastUserMsgId = [...(activeThread?.messages || [])].reverse().find((m) => m.role === "user")?.id;

  // When the response arrives from the backend, bring the user's message into
  // view (message start) instead of jumping to the end of the response.
  useEffect(() => {
    if (loading || !activeThread) return;
    const el = userMsgRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    window.scrollTo({ top: window.scrollY + top - 88, behavior: "smooth" });
  }, [loading, activeThread]);

  // Theme: persisted to localStorage; applied to <html data-theme>.
  const [theme, setTheme] = useState(() => localStorage.getItem("colosseum_theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("colosseum_theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      arena.sendMessage();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg-base font-sans text-text-main">
      <ChatSidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={arena.selectThread}
        onNewThread={arena.newThread}
        isOpen={sidebarOpen}
        setIsOpen={arena.setSidebarOpen}
      />

      <div className="flex flex-1 flex-col h-full md:pl-80 relative bg-bg-base">
        <header className="flex h-16 items-center justify-between border-b border-border-subtle px-8 md:px-12 sticky top-0 z-30 bg-bg-base">
          <div className="flex items-center gap-4">
            <button
              onClick={() => arena.setSidebarOpen(true)}
              className="p-2 rounded text-text-muted hover:bg-bg-surface-elevated hover:text-text-main transition-colors cursor-pointer md:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <h2 className="text-base font-semibold tracking-tight text-text-main">
              {activeThread?.title || "AI Colosseum"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded text-text-muted hover:bg-bg-surface-elevated hover:text-text-main transition-colors cursor-pointer"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>
            {activeThreadId && (
              <button
                onClick={() => arena.deleteThread(activeThreadId)}
                className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-danger transition-colors cursor-pointer px-4 py-2 rounded"
                title="Delete Battle"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-8 md:px-12 py-12">
          <div className="mx-auto max-w-4xl space-y-12">
            {(!activeThread || activeThread.messages.length === 0) && (
              <div className="flex flex-col items-center justify-center text-center py-24">
                <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-bg-surface border border-border-subtle mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-9 h-9 text-accent">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
                  </svg>
                </div>
                <h3 className="text-6xl font-semibold tracking-tight text-text-main mb-5">Welcome to AI Colosseum</h3>
                <p className="text-base text-text-muted max-w-md leading-relaxed mb-10">
                  Submit a coding problem. Two AI models compete. A judge picks the winner.
                </p>

                <div className="w-full max-w-lg space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-dim block mb-2">Try an example</span>
                  {WELCOME_PRESETS.map((preset) => (
                    <button
                      key={preset.send}
                      onClick={() => arena.sendMessage(preset.send)}
                      className="w-full text-left px-6 py-4 rounded border border-border-subtle bg-bg-surface hover:bg-bg-surface-elevated text-sm font-medium flex items-center justify-between group transition-colors cursor-pointer"
                    >
                      <span className="text-text-main">{preset.label}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-text-dim group-hover:text-accent transition-colors">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeThread && activeThread.messages.map((msg) => {
              if (msg.role === "user") {
                return (
                  <div key={msg.id} ref={msg.id === lastUserMsgId ? userMsgRef : null} className="flex justify-end">
                    <div className="max-w-[80%] bg-bg-surface border border-border-subtle px-6 py-4 rounded-lg">
                      <p className="text-sm font-medium leading-relaxed text-text-main">{msg.content}</p>
                    </div>
                  </div>
                );
              }

              if (msg.role === "assistant") {
                return <ResponseBlock key={msg.id} responseData={msg.data} />;
              }

              if (msg.role === "error") {
                return (
                  <div key={msg.id} className="flex justify-start">
                    <div className="max-w-[80%] bg-danger/10 border border-danger/15 px-6 py-5 rounded-lg flex items-start gap-4">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-danger/20 text-danger font-bold text-xs">!</div>
                      <div>
                        <h4 className="text-xs font-semibold text-danger uppercase tracking-widest mb-1">Error</h4>
                        <p className="text-sm text-text-muted leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })}

            {loading && (
              <div className="flex flex-col gap-8 items-stretch py-12">
                <div className="bg-bg-surface rounded-xl p-6 border border-border-subtle flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-sm font-medium text-text-muted">Generating competing solutions...</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-bg-surface rounded-lg p-8 border border-border-subtle h-80" />
                  <div className="bg-bg-surface rounded-lg p-8 border border-border-subtle h-80" />
                </div>
              </div>
            )}

          </div>
        </div>

        <footer className="px-8 md:px-12 py-5 bg-bg-base sticky bottom-0 border-t border-border-subtle">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-end gap-4 rounded-xl border border-border-subtle bg-bg-surface px-4 py-3 focus-within:border-muted transition-colors duration-200">
              <textarea
                value={input}
                onChange={(e) => arena.setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe a coding problem to pit against two AI models..."
                rows={1}
                className="flex-1 bg-transparent resize-none border-none text-sm text-text-main placeholder:text-text-dim focus:outline-none focus:ring-0 leading-relaxed max-h-32 custom-scrollbar py-1"
                style={{ height: "auto" }}
              />
              <button
                disabled={loading || !input.trim()}
                onClick={() => arena.sendMessage()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent hover:bg-accent-hover active:bg-accent-active text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                </svg>
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
