"use client";
import { useState, useEffect } from "react";

interface BriefingData {
  headline?: string;
  health_status?: string;
  leads_24h?: number;
  dfy_24h?: number;
  errors_24h?: number;
  summary?: string;
  recommendations?: string[];
}

export default function AIFounderStrip() {
  const [data, setData] = useState<BriefingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  
  useEffect(() => {
    async function fetchBriefing() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/guardian/founder-briefing`, {
          cache: "no-store"
        });
        
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          setData({
            headline: "Welcome to your AI command center",
            health_status: "operational",
            leads_24h: 0,
            dfy_24h: 0,
            errors_24h: 0,
            summary: "Levqor is monitoring your operations. Start a workflow to see insights."
          });
        }
      } catch (err) {
        console.error("Failed to fetch founder briefing:", err);
        setData({
          headline: "Your AI Guardian is active",
          health_status: "monitoring",
          summary: "Levqor is ready to automate your operations."
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchBriefing();
  }, []);
  
  const getHealthColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "healthy":
      case "operational":
      case "green":
        return "text-green-400";
      case "warning":
      case "degraded":
      case "yellow":
        return "text-yellow-400";
      case "critical":
      case "red":
        return "text-red-400";
      default:
        return "text-blue-400";
    }
  };
  
  const getHealthIcon = (status?: string) => {
    const color = getHealthColor(status);
    switch (status?.toLowerCase()) {
      case "healthy":
      case "operational":
      case "green":
        return (
          <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "warning":
      case "degraded":
      case "yellow":
        return (
          <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };
  
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-4 animate-pulse">
        <div className="h-5 bg-slate-700 rounded w-3/4"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-r from-slate-800 via-blue-900 to-slate-800 rounded-lg overflow-hidden border border-slate-700">
      <div 
        className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-blue-300 uppercase tracking-wider">AI Guardian</span>
                {getHealthIcon(data?.health_status)}
              </div>
              <p className="text-white font-medium">
                {data?.headline || data?.summary || "Your AI is monitoring operations"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {(data?.leads_24h !== undefined && data.leads_24h > 0) && (
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{data.leads_24h}</div>
                <div className="text-xs text-slate-400">Leads (24h)</div>
              </div>
            )}
            {(data?.errors_24h !== undefined && data.errors_24h > 0) && (
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{data.errors_24h}</div>
                <div className="text-xs text-slate-400">Errors (24h)</div>
              </div>
            )}
            <svg 
              className={`w-5 h-5 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      
      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-700/50">
          <div className="pt-4">
            {data?.summary && (
              <p className="text-slate-300 text-sm mb-4">
                {data.summary}
              </p>
            )}
            
            {data?.recommendations && data.recommendations.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-blue-300 uppercase tracking-wider mb-2">Recommendations</h4>
                <ul className="space-y-2">
                  {data.recommendations.slice(0, 3).map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <svg className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {!data?.recommendations?.length && !data?.summary && (
              <p className="text-slate-400 text-sm italic">
                No specific recommendations right now. Your operations are running smoothly.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
