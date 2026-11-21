import { useCallback, useEffect, useMemo, useState } from "react";
import { invoke } from "../../api/invoke.js";
import { threadTitle } from "../features/threads.js";

const STORAGE_KEY_THREADS = "colosseum_threads";
const STORAGE_KEY_ACTIVE_ID = "colosseum_active_id";

export function useArena() {
  const [threads, setThreads] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THREADS);
    return saved ? JSON.parse(saved) : [];
  });

  const [activeThreadId, setActiveThreadId] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    return saved || null;
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_THREADS, JSON.stringify(threads));
  }, [threads]);

  useEffect(() => {
    if (activeThreadId) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeThreadId);
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
    }
  }, [activeThreadId]);

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId) || null,
    [threads, activeThreadId]
  );

  const appendMessage = useCallback((threadId, message) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, messages: [...t.messages, message] } : t))
    );
  }, []);

  const newThread = useCallback((title = "") => {
    const id = Date.now().toString();
    const thread = { id, title, messages: [] };
    setThreads((prev) => [thread, ...prev]);
    setActiveThreadId(id);
    return id;
  }, []);

  const sendMessage = useCallback(
    async (text) => {
      const message = (text ?? input).trim();
      if (!message) return;

      let threadId = activeThreadId;
      if (!threadId || threads.length === 0) {
        threadId = newThread(threadTitle(message) || "");
      }

      appendMessage(threadId, { id: Date.now().toString(), role: "user", content: message });
      if (text == null) setInput("");
      setLoading(true);

      try {
        const response = await invoke(message);
        // Backend wraps the payload as { message, success, result } — unwrap it.
        const result = response?.result ?? response;
        appendMessage(threadId, {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          data: result,
        });
      } catch (error) {
        console.error(error);
        appendMessage(threadId, {
          id: (Date.now() + 1).toString(),
          role: "error",
          content: error?.message || "Unknown network error. Failed to establish connection.",
        });
      } finally {
        setLoading(false);
      }
    },
    [input, activeThreadId, threads.length, newThread, appendMessage]
  );

  const selectThread = useCallback((id) => setActiveThreadId(id), []);

  const deleteThread = useCallback(
    (id) => {
      if (!id) return;
      const remaining = threads.filter((t) => t.id !== id);
      setThreads(remaining);
      if (activeThreadId === id) {
        setActiveThreadId(remaining[0]?.id || null);
      }
    },
    [threads, activeThreadId]
  );

  return {
    threads,
    activeThread,
    activeThreadId,
    input,
    setInput,
    loading,
    sidebarOpen,
    setSidebarOpen,
    sendMessage,
    selectThread,
    deleteThread,
    newThread,
  };
}
