"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface FounderBriefing {
  summary?: {
    headline?: string;
    health_score?: number;
    health_status?: string;
    key_signals?: string[];
  };
  revenue?: {
    leads_24h?: number;
    dfy_24h?: number;
    leads_7d?: number;
    dfy_7d?: number;
  };
  strategy?: {
    today?: Array<{ title: string; category: string; priority: string }>;
  };
  safe_mode?: boolean;
}

export default function AIBriefingCard() {
  const [briefing, setBriefing] = useState<FounderBriefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  useEffect(() => {
    async function fetchBriefing() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/guardian/founder-briefing`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          setBriefing(data);
        } else {
          setError("Could not load briefing");
        }
      } catch (err) {
        console.error("Briefing fetch error:", err);
        setError("Connection error");
      } finally {
        setLoading(false);
      }
    }
    fetchBriefing();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-white/20 rounded w-1/3" />
          <div className="h-4 bg-white/20 rounded w-2/3" />
          <div className="h-4 bg-white/20 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (error || !briefing) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">Today's AI Briefing</h3>
        <p className="text-white/80 text-sm">
          {error || "Your AI briefing will appear here once the system is fully initialized."}
        </p>
        <Link
          href={`/${locale}/brain`}
          className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-white/90 hover:text-white"
        >
          Open Brain
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    );
  }

  const healthScore = briefing.summary?.health_score ?? 0;
  const headline = briefing.summary?.headline || "System is running normally.";
  const keySignals = briefing.summary?.key_signals || [];
  const leads24h = briefing.revenue?.leads_24h ?? 0;
  const dfy24h = briefing.revenue?.dfy_24h ?? 0;
  const todayActions = briefing.strategy?.today || [];

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Today's AI Briefing</h3>
          <p className="text-white/80 text-sm mt-1">{headline}</p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1">
          <div className={`w-2 h-2 rounded-full ${
            healthScore >= 80 ? "bg-green-400" : 
            healthScore >= 60 ? "bg-yellow-400" : "bg-red-400"
          }`} />
          <span className="text-sm font-medium">{healthScore}/100</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/10 rounded-lg p-3">
          <div className="text-2xl font-bold">{leads24h}</div>
          <div className="text-xs text-white/70">New leads today</div>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <div className="text-2xl font-bold">{dfy24h}</div>
          <div className="text-xs text-white/70">DFY requests today</div>
        </div>
      </div>

      {keySignals.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
            Key Signals
          </h4>
          <ul className="space-y-1">
            {keySignals.slice(0, 3).map((signal, idx) => (
              <li key={idx} className="text-sm text-white/90 flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {signal}
              </li>
            ))}
          </ul>
        </div>
      )}

      {todayActions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
            Priority Actions
          </h4>
          <ul className="space-y-1">
            {todayActions.slice(0, 2).map((action, idx) => (
              <li key={idx} className="text-sm text-white/90 flex items-start gap-2">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  action.priority === "high" ? "bg-red-500" : "bg-yellow-500 text-yellow-900"
                }`}>
                  {action.priority?.toUpperCase() || "MED"}
                </span>
                {action.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        href={`/${locale}/brain`}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        Open Brain for full analysis
      </Link>
    </div>
  );
}
