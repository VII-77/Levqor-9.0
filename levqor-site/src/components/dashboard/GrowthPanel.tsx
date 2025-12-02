"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  difficulty: string;
}

interface ReferralStats {
  code: string | null;
  total_referrals: number;
  referral_url: string | null;
}

const DIFFICULTY_COLORS = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-purple-100 text-purple-700"
};

const STARTER_TEMPLATES: Template[] = [
  {
    id: "tpl_lead_capture_form",
    name: "Lead Capture Form",
    category: "lead_capture",
    description: "Automatically capture leads from web forms and add to CRM.",
    difficulty: "beginner"
  },
  {
    id: "tpl_email_responder",
    name: "Smart Email Responder",
    category: "customer_support",
    description: "AI-powered email responder that categorizes and replies.",
    difficulty: "intermediate"
  },
  {
    id: "tpl_weekly_analytics",
    name: "Weekly Analytics Report",
    category: "reporting",
    description: "Generate and send weekly analytics summaries.",
    difficulty: "beginner"
  }
];

export default function GrowthPanel({ className = "" }: { className?: string }) {
  const [templates] = useState<Template[]>(STARTER_TEMPLATES);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const referralUrl = referralCode 
    ? `https://www.levqor.ai/?ref=${referralCode}` 
    : "https://www.levqor.ai/?ref=YOURCODE";

  const handleCopyReferral = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy referral link");
    }
  }, [referralUrl]);

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900">Growth Tools</h3>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Start Templates</h4>
          <div className="space-y-2">
            {templates.map((template) => (
              <div 
                key={template.id}
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {template.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                      {template.description}
                    </p>
                  </div>
                  <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${DIFFICULTY_COLORS[template.difficulty as keyof typeof DIFFICULTY_COLORS] || 'bg-gray-100 text-gray-600'}`}>
                    {template.difficulty}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <Link 
            href="/templates"
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            View All Templates
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Refer a Friend</h4>
          <p className="text-xs text-gray-500 mb-3">
            Share Levqor with friends and earn rewards when they sign up.
          </p>
          
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-400 truncate">
                {referralUrl}
              </p>
            </div>
            <button
              onClick={handleCopyReferral}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                copied 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          
          <p className="text-xs text-gray-400 mt-2 text-center">
            Referral tracking coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
