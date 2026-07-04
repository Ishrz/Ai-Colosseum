import { useState, useEffect, useRef } from 'react';
import ChatSidebar from './components/ChatSidebar';
import ResponseBlock from './components/ResponseBlock';
import { generateMockResponse } from './mockData';
import axios from "axios"

export default function App() {
  const [threads, setThreads] = useState(() => {
    const saved = localStorage.getItem('colosseum_threads');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeThreadId, setActiveThreadId] = useState(() => {
    const saved = localStorage.getItem('colosseum_active_id');
    return saved || null;
  });

  const [input, setInput] = useState('');
  const [useMock, setUseMock] = useState(true);
  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:8000/api/chat');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);

  // Sync threads to localStorage
  useEffect(() => {
    localStorage.setItem('colosseum_threads', JSON.stringify(threads));
  }, [threads]);

  // Sync active thread ID
  useEffect(() => {
    if (activeThreadId) {
      localStorage.setItem('colosseum_active_id', activeThreadId);
    } else {
      localStorage.removeItem('colosseum_active_id');
    }
  }, [activeThreadId]);

  // Auto-scroll to bottom of chat feed
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threads, activeThreadId, loading]);

  const activeThread = threads.find((t) => t.id === activeThreadId);

  const handleNewThread = () => {
    const newId = Date.now().toString();
    const newT = {
      id: newId,
      title: '',
      messages: []
    };
    setThreads((prev) => [newT, ...prev]);
    setActiveThreadId(newId);
  };

  const handleSendMessage = async (textToSend) => {
    const queryText = textToSend || input;
    if (!queryText.trim()) return;

    let currentThreadId = activeThreadId;

    // Create new thread automatically if none exists or active is empty
    if (!currentThreadId || threads.length === 0) {
      const newId = Date.now().toString();
      const newT = {
        id: newId,
        title: queryText.substring(0, 30) + (queryText.length > 30 ? '...' : ''),
        messages: []
      };
      setThreads((prev) => [newT, ...prev]);
      setActiveThreadId(newId);
      currentThreadId = newId;
    }

    // Add user message
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: queryText
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === currentThreadId) {
          const updatedMessages = [...t.messages, userMsg];
          const updatedTitle = t.title ? t.title : (queryText.substring(0, 30) + (queryText.length > 30 ? '...' : ''));
          return { ...t, title: updatedTitle, messages: updatedMessages };
        }
        return t;
      })
    );

    if (!textToSend) setInput('');
    setLoading(true);

    try {
      let aiResponseData;

      // if (useMock) {
      //   // Simulate response latency
      //   await new Promise((resolve) => setTimeout(resolve, 2200));
      //   aiResponseData = generateMockResponse(queryText);
      // } else {
      //   // const response = await fetch(apiEndpoint, {
      //   //   method: 'POST',
      //   //   headers: { 'Content-Type': 'application/json' },
      //   //   body: JSON.stringify({ problem: queryText })
      //   // });

      //   // if (!response.ok) {
      //   //   throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      //   // }

      //   // aiResponseData = await response.json();

      // }

      // await new Promise((resolve) => setTimeout(resolve, 2200));
      console.log(queryText)
      const response = await axios.post("http://localhost:3000/api/v1/invoke", { message: queryText });
      console.log(response)
      aiResponseData = response.data.result;

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        data: aiResponseData
      };

      setThreads((prev) =>
        prev.map((t) => {
          if (t.id === currentThreadId) {
            return { ...t, messages: [...t.messages, assistantMsg] };
          }
          return t;
        })
      );
    } catch (error) {
      console.error(error);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'error',
        content: error.message || 'Unknown network error. Failed to establish connection.'
      };
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id === currentThreadId) {
            return { ...t, messages: [...t.messages, errorMsg] };
          }
          return t;
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Click handler for suggestion chips
  const handleSelectPreset = (text) => {
    handleSendMessage(text);
  };

  // Remove thread handler
  const handleDeleteThread = (id, event) => {
    event.stopPropagation();
    setThreads((prev) => prev.filter((t) => t.id !== id));
    if (activeThreadId === id) {
      const remaining = threads.filter((t) => t.id !== id);
      setActiveThreadId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg-base font-sans selection:bg-accent/30 text-text-main">

      {/* Sidebar Component */}
      <ChatSidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={setActiveThreadId}
        onNewThread={handleNewThread}
        useMock={useMock}
        setUseMock={setUseMock}
        apiEndpoint={apiEndpoint}
        setApiEndpoint={setApiEndpoint}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main chat window container */}
      <div className="flex flex-1 flex-col h-full md:pl-72 relative bg-bg-base">

        {/* Header bar */}
        <header className="flex h-16 items-center justify-between border-b border-border-subtle bg-bg-base/80 px-6 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-text-muted hover:bg-bg-surface-elevated hover:text-text-main md:hidden transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            <h2 className="text-sm font-semibold tracking-tight text-text-main">
              {activeThread?.title ? activeThread.title : 'New Battle Arena'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {activeThreadId && (
              <button
                onClick={(e) => handleDeleteThread(activeThreadId, e)}
                className="text-xs font-semibold text-text-dim hover:text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-red-500/10"
                title="Delete Battle"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                <span className="hidden sm:inline">Discard Battle</span>
              </button>
            )}
          </div>
        </header>

        {/* Scrollable feed */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-8">
          <div className="mx-auto max-w-4xl space-y-8">

            {/* Empty state view */}
            {(!activeThread || activeThread.messages.length === 0) && (
              <div className="flex flex-col items-center justify-center text-center py-20 animate-in fade-in duration-300">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-dim text-accent border border-accent/25 font-bold text-2xl shadow-xl mb-6">
                  ⚖️
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-text-main mb-2">Welcome to the AI Colosseum</h3>
                <p className="text-sm text-text-muted max-w-md leading-relaxed mb-10">
                  Submit a coding query, performance constraint, or logical puzzle. The Colosseum generates two viable responses and judges the superior solution.
                </p>

                {/* Preset suggestion chips */}
                <div className="w-full max-w-xl space-y-3.5">
                  <span className="text-[15px] font-bold  pb-3 tracking-widest text-text-dim block mb-1">Select a Battle Preset Or Start New Battle By Entering Prompt in Below Box.</span>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleSelectPreset('reverse a string in javascript')}
                      className="text-left px-5 py-3.5 rounded-xl border border-border-subtle bg-bg-surface hover:bg-bg-surface-elevated hover:border-accent text-sm font-semibold flex items-center justify-between group transition-all duration-200 cursor-pointer"
                    >
                      <span className="text-text-main">String Reversal in JavaScript</span>
                      <span className="text-text-dim group-hover:text-accent font-mono text-xs">Arrays vs Loops →</span>
                    </button>
                    <button
                      onClick={() => handleSelectPreset('sql query to find second highest salary')}
                      className="text-left px-5 py-3.5 rounded-xl border border-border-subtle bg-bg-surface hover:bg-bg-surface-elevated hover:border-accent text-sm font-semibold flex items-center justify-between group transition-all duration-200 cursor-pointer"
                    >
                      <span className="text-text-main">Second Highest Salary Query</span>
                      <span className="text-text-dim group-hover:text-accent font-mono text-xs">Subqueries vs Limits →</span>
                    </button>
                    <button
                      onClick={() => handleSelectPreset('react fetch data on mount')}
                      className="text-left px-5 py-3.5 rounded-xl border border-border-subtle bg-bg-surface hover:bg-bg-surface-elevated hover:border-accent text-sm font-semibold flex items-center justify-between group transition-all duration-200 cursor-pointer"
                    >
                      <span className="text-text-main">React Data Fetching Lifecycle</span>
                      <span className="text-text-dim group-hover:text-accent font-mono text-xs">Hooks vs Fetch-Inline →</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Chat message rendering */}
            {activeThread && activeThread.messages.map((msg) => {
              if (msg.role === 'user') {
                return (
                  <div key={msg.id} className="flex justify-end animate-in fade-in duration-150">
                    <div className="max-w-[85%] bg-accent-dim border border-accent/20 px-5 py-3.5 rounded-2xl">
                      <p className="text-sm font-semibold leading-relaxed text-[#eeefff]">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                );
              }

              if (msg.role === 'assistant') {
                return (
                  <ResponseBlock key={msg.id} responseData={msg.data} />
                );
              }

              if (msg.role === 'error') {
                return (
                  <div key={msg.id} className="flex justify-start animate-in shake duration-200">
                    <div className="max-w-[85%] bg-red-500/10 border border-red-500/20 px-5 py-4 rounded-xl flex items-start gap-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-black font-extrabold text-[10px]">
                        !
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-0.5">Connection Error</h4>
                        <p className="text-xs text-text-muted leading-relaxed mb-3">{msg.content}</p>
                        <span
                          className="text-[10px] font-bold text-accent  uppercase tracking-wider"
                        >
                          Please try again or try after some time.
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex flex-col gap-6 md:gap-8 items-stretch my-10 animate-pulse">
                <div className="bg-[#141416]/50 rounded-xl p-5 border border-border-subtle flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-4.5 w-4.5 rounded-full bg-accent/30 animate-ping" />
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider font-mono">
                      Summoning Gladiators... Writing Competing Code Snippets
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                  <div className="bg-bg-surface/50 border border-border-subtle/50 h-96 rounded-2xl" />
                  <div className="bg-bg-surface/50 border border-border-subtle/50 h-96 rounded-2xl" />
                </div>
              </div>
            )}

            {/* Bottom scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Sticky Input Bar at Bottom */}
        <footer className="p-6 bg-linear-to-t from-bg-base via-bg-base/90 to-transparent sticky bottom-0 right-0 left-0">
          <div className="mx-auto max-w-4xl">
            <div className="relative flex items-center rounded-2xl border border-border-subtle bg-bg-surface px-4.5 py-3.5 focus-within:border-accent/60 focus-within:shadow-[0_0_20px_rgba(99,102,241,0.05)] transition-all duration-200">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask Colosseum to evaluate two approaches..."
                rows={1}
                className="flex-1 bg-transparent resize-none border-none text-sm text-text-main placeholder:text-text-dim focus:outline-none focus:ring-0 leading-relaxed max-h-24 custom-scrollbar"
                style={{ height: 'auto' }}
              />

              <div className="flex items-center gap-3.5 ml-4">
                

                <button
                  disabled={loading || !input.trim()}
                  onClick={() => handleSendMessage()}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-white hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:hover:opacity-40 disabled:active:scale-100 disabled:cursor-not-allowed`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}