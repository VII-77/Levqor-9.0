"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { getApiBase } from "@/lib/api-config";

const TEMPLATES = [
  {
    id: "ai-guardian-fragile",
    title: "AI Guardian for Fragile Workflows",
    description: "Auto-monitors workflow health and self-heals failures before they impact operations.",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    color: "blue",
    aiPowered: true,
    outcome: "Reduce downtime by 90%"
  },
  {
    id: "ai-revenue-radar",
    title: "AI Revenue Radar for Agencies",
    description: "Track leads, conversions, and DFY pipeline with AI-powered insights and predictions.",
    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    color: "green",
    aiPowered: true,
    outcome: "Never miss a lead"
  },
  {
    id: "ai-incident-storyboard",
    title: "AI Post-Incident Storyboard",
    description: "Auto-generate detailed incident reports with AI narrative and root cause analysis.",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    color: "purple",
    aiPowered: true,
    outcome: "Cut report time by 80%"
  },
  {
    id: "agency-onboarding",
    title: "Client Onboarding Pipeline",
    description: "Automate intake forms, document collection, and project setup for new clients.",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    color: "orange",
    aiPowered: false,
    outcome: "Onboard 3x faster"
  },
];

const colorClasses: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  blue: { bg: "bg-blue-100", text: "text-blue-600", border: "border-blue-200", gradient: "from-blue-500 to-blue-700" },
  purple: { bg: "bg-purple-100", text: "text-purple-600", border: "border-purple-200", gradient: "from-purple-500 to-purple-700" },
  green: { bg: "bg-green-100", text: "text-green-600", border: "border-green-200", gradient: "from-green-500 to-green-700" },
  orange: { bg: "bg-orange-100", text: "text-orange-600", border: "border-orange-200", gradient: "from-orange-500 to-orange-700" },
};

export default function StarterTemplates() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";
  const [launching, setLaunching] = useState<string | null>(null);
  const [launchStatus, setLaunchStatus] = useState<string | null>(null);

  const handleLaunchTemplate = async (templateId: string) => {
    setLaunching(templateId);
    setLaunchStatus("AI is wiring this template now...");
    
    try {
      const res = await fetch(`${getApiBase()}/api/system/templates/launch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_id: templateId,
          email: session?.user?.email || ""
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setLaunchStatus(`Template configured! ${data.next_steps?.length || 0} steps ready.`);
        
        setTimeout(() => {
          router.push(`/${locale}/builder?template=${templateId}`);
        }, 1500);
      } else {
        setLaunchStatus("Configuration started. Redirecting...");
        setTimeout(() => {
          router.push(`/${locale}/builder?template=${templateId}`);
        }, 1000);
      }
    } catch (err) {
      console.error("Template launch error:", err);
      router.push(`/${locale}/builder?template=${templateId}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">AI Template Gallery</h2>
          <p className="text-sm text-gray-500">One-click launch for AI-powered automation patterns</p>
        </div>
        <span className="px-2 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full">
          AI POWERED
        </span>
      </div>
      
      {launchStatus && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-sm text-blue-700">{launchStatus}</span>
        </div>
      )}
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TEMPLATES.map((template) => {
          const colors = colorClasses[template.color] || colorClasses.blue;
          const isLaunching = launching === template.id;
          
          return (
            <div
              key={template.id}
              className={`relative border ${colors.border} rounded-lg p-4 hover:shadow-md transition-all cursor-pointer group ${
                isLaunching ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => !launching && handleLaunchTemplate(template.id)}
            >
              {template.aiPowered && (
                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-bold rounded-full">
                  AI
                </span>
              )}
              
              <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center mb-3`}>
                <svg className={`w-5 h-5 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={template.icon} />
                </svg>
              </div>
              
              <h3 className="font-medium text-gray-900 mb-1 group-hover:text-blue-600 transition-colors text-sm">
                {template.title}
              </h3>
              
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{template.description}</p>
              
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${colors.text}`}>{template.outcome}</span>
                <button 
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    isLaunching 
                      ? "bg-blue-100 text-blue-600" 
                      : "bg-gray-100 text-gray-700 group-hover:bg-blue-600 group-hover:text-white"
                  } transition-colors`}
                  disabled={!!launching}
                >
                  {isLaunching ? "Launching..." : "Launch"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
