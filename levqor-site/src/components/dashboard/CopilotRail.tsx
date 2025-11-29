"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function CopilotRail() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";

  const quickActions = [
    { label: "What should I do next?", action: "ask-brain" },
    { label: "Show my health score", action: "health-score" },
    { label: "Recent leads", action: "recent-leads" }
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    
    setIsLoading(true);
    router.push(`/${locale}/brain?q=${encodeURIComponent(input)}`);
  }

  function handleQuickAction(action: string) {
    switch (action) {
      case "ask-brain":
        router.push(`/${locale}/brain?action=ask`);
        break;
      case "health-score":
        router.push(`/${locale}/brain#health`);
        break;
      case "recent-leads":
        router.push(`/${locale}/revenue`);
        break;
    }
  }

  return (
    <div className="hidden xl:block xl:w-80 xl:fixed xl:right-0 xl:top-16 xl:bottom-0 xl:overflow-y-auto bg-gray-50 border-l border-gray-200 p-4">
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Levqor Copilot</h3>
              <p className="text-xs text-gray-500">AI-powered assistant</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your workflows, revenue, or system health..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? "Thinking..." : "Ask Brain"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Quick Actions
          </h4>
          <div className="space-y-2">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickAction(action.action)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
          <h4 className="text-xs font-semibold text-blue-900 uppercase tracking-wider mb-2">
            Brain Status
          </h4>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-700">Active & Monitoring</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Guardian is watching your workflows and revenue pipeline.
          </p>
        </div>
      </div>
    </div>
  );
}
