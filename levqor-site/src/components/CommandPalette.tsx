"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

interface Command {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  category: "navigation" | "brain" | "action";
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const navigate = useCallback((path: string) => {
    router.push(`/${locale}${path}`);
    setIsOpen(false);
  }, [router, locale]);

  const commands: Command[] = [
    {
      id: "dashboard",
      title: "Open Dashboard",
      description: "Go to your main control center",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
      action: () => navigate("/dashboard"),
      category: "navigation"
    },
    {
      id: "brain",
      title: "Open Brain",
      description: "View AI health, insights, and strategy",
      icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
      action: () => navigate("/brain"),
      category: "navigation"
    },
    {
      id: "revenue",
      title: "Open Revenue",
      description: "View leads, DFY requests, and pipeline",
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      action: () => navigate("/revenue"),
      category: "navigation"
    },
    {
      id: "billing",
      title: "Open Billing",
      description: "Manage your subscription and payments",
      icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
      action: () => navigate("/billing"),
      category: "navigation"
    },
    {
      id: "templates",
      title: "Open Templates",
      description: "Browse AI workflow templates",
      icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
      action: () => navigate("/templates"),
      category: "navigation"
    },
    {
      id: "launchpad",
      title: "Open Launchpad",
      description: "Start your first workflow with AI guidance",
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
      action: () => navigate("/launchpad"),
      category: "navigation"
    },
    {
      id: "ask-brain",
      title: "Ask Brain: What should I do next?",
      description: "Get AI-powered strategic recommendations",
      icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      action: () => navigate("/brain?action=ask"),
      category: "brain"
    },
    {
      id: "new-workflow",
      title: "Create New Workflow",
      description: "Build an AI-powered automation",
      icon: "M12 6v6m0 0v6m0-6h6m-6 0H6",
      action: () => navigate("/builder"),
      category: "action"
    },
    {
      id: "dfy-request",
      title: "Request Done-For-You Build",
      description: "Get our team to build your workflow",
      icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
      action: () => navigate("/launchpad?mode=dfy"),
      category: "action"
    }
  ];

  const filteredCommands = query
    ? commands.filter(
        (cmd) =>
          cmd.title.toLowerCase().includes(query.toLowerCase()) ||
          cmd.description.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  function handleKeyNavigation(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
      e.preventDefault();
      filteredCommands[selectedIndex].action();
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors"
        title="Command Palette (Cmd+K)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="hidden sm:inline text-sm font-medium">Cmd+K</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      
      <div className="relative min-h-screen flex items-start justify-center pt-[15vh]">
        <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex items-center px-4 py-3 gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyNavigation}
                placeholder="Type a command or search..."
                className="flex-1 outline-none text-gray-900 placeholder-gray-400"
              />
              <kbd className="hidden sm:inline-flex px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded">
                ESC
              </kbd>
            </div>
          </div>

          <div className="max-h-[50vh] overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No commands found
              </div>
            ) : (
              <div className="space-y-1">
                {filteredCommands.map((cmd, index) => (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      index === selectedIndex
                        ? "bg-blue-50 text-blue-900"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      cmd.category === "brain" 
                        ? "bg-purple-100" 
                        : cmd.category === "action"
                        ? "bg-green-100"
                        : "bg-gray-100"
                    }`}>
                      <svg className={`w-5 h-5 ${
                        cmd.category === "brain"
                          ? "text-purple-600"
                          : cmd.category === "action"
                          ? "text-green-600"
                          : "text-gray-600"
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={cmd.icon} />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{cmd.title}</div>
                      <div className="text-sm text-gray-500 truncate">{cmd.description}</div>
                    </div>
                    {index === selectedIndex && (
                      <kbd className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded">
                        Enter
                      </kbd>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span>Navigate with</span>
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">↓</kbd>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline">Powered by</span>
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Levqor Brain
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
