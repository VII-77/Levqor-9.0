"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useLevqorBrainOptional } from "@/components/brain/LevqorBrainContext";

interface GetStartedPanelProps {
  className?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export default function GetStartedPanel({ className = "" }: GetStartedPanelProps) {
  const [hasWorkflows, setHasWorkflows] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const brain = useLevqorBrainOptional();

  const checkUserData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/workflows?limit=1`);
      if (res.ok) {
        const data = await res.json();
        setHasWorkflows((data.workflows?.length || 0) > 0);
      } else {
        setHasWorkflows(false);
      }
    } catch {
      setHasWorkflows(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const dismissedKey = localStorage.getItem("levqor_getstarted_dismissed");
    if (dismissedKey === "true") {
      setDismissed(true);
      setLoading(false);
      return;
    }
    checkUserData();
  }, [checkUserData]);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("levqor_getstarted_dismissed", "true");
  };

  const handleMouseEnter = () => {
    brain?.setNeural();
  };

  const handleMouseLeave = () => {
    brain?.setOrganic();
  };

  if (dismissed || loading || hasWorkflows) {
    return null;
  }

  const quickActions = [
    {
      title: "Browse Templates",
      description: "Start with a pre-built workflow template",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      href: "/templates",
      color: "blue"
    },
    {
      title: "Create with AI",
      description: "Describe your workflow in plain English",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      href: "/builder?mode=ai",
      color: "purple"
    },
    {
      title: "Build Manually",
      description: "Create a workflow step by step",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
      ),
      href: "/builder",
      color: "green"
    }
  ];

  const colorClasses: Record<string, { bg: string; border: string; icon: string; hover: string }> = {
    blue: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600", hover: "hover:border-blue-400 hover:bg-blue-100" },
    purple: { bg: "bg-purple-50", border: "border-purple-200", icon: "text-purple-600", hover: "hover:border-purple-400 hover:bg-purple-100" },
    green: { bg: "bg-green-50", border: "border-green-200", icon: "text-green-600", hover: "hover:border-green-400 hover:bg-green-100" }
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Get Started</h2>
          <p className="text-gray-600 mt-1">
            Choose how you want to create your first workflow
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 p-1 -mt-1 -mr-1"
          aria-label="Dismiss panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {quickActions.map((action) => {
          const colors = colorClasses[action.color];
          return (
            <Link
              key={action.title}
              href={action.href}
              className={`block p-4 rounded-lg border-2 transition-all duration-200 ${colors.bg} ${colors.border} ${colors.hover}`}
            >
              <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center mb-3 ${colors.icon}`}>
                {action.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
        <span className="text-gray-500">
          Need help? Check our{" "}
          <Link href="/docs" className="text-blue-600 hover:underline">
            documentation
          </Link>
        </span>
        <Link 
          href="/support"
          className="text-blue-600 hover:underline"
        >
          Contact support
        </Link>
      </div>
    </div>
  );
}
