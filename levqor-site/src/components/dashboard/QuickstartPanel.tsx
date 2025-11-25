"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLevqorBrainOptional } from "@/components/brain/LevqorBrainContext";

interface QuickstartPanelProps {
  className?: string;
}

export default function QuickstartPanel({ className = "" }: QuickstartPanelProps) {
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const brain = useLevqorBrainOptional();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const onboarded = localStorage.getItem("levqor_onboarded");
      const quickstartDismissed = localStorage.getItem("levqor_quickstart_dismissed");
      setIsFirstTime(!onboarded || onboarded !== "true");
      setDismissed(quickstartDismissed === "true");
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("levqor_quickstart_dismissed", "true");
    }
  };

  const handleAskBrain = async () => {
    if (!prompt.trim()) return;

    setIsSubmitting(true);
    brain?.setNeural();

    try {
      const res = await fetch("/api/ai/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (res.ok) {
        brain?.setSuccess();
        setTimeout(() => {
          window.location.href = `/builder?prompt=${encodeURIComponent(prompt.trim())}`;
        }, 500);
      } else {
        brain?.setError();
        setTimeout(() => brain?.setOrganic(), 2000);
      }
    } catch (err) {
      console.error("Failed to create workflow:", err);
      brain?.setError();
      setTimeout(() => brain?.setOrganic(), 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (dismissed && !isFirstTime) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 border border-blue-200 rounded-xl p-6 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">🧠</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isFirstTime ? "Welcome! Let's create your first workflow" : "Quickstart with Levqor Brain"}
            </h2>
            <p className="text-sm text-gray-600">
              Describe what you want to automate in plain English
            </p>
          </div>
        </div>
        {!isFirstTime && (
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="mt-6 space-y-4">
        <div className="grid gap-3 sm:grid-cols-3 text-center">
          <div className="bg-white/60 rounded-lg p-3">
            <div className="text-blue-600 font-medium text-sm mb-1">Step 1</div>
            <p className="text-xs text-gray-600">Describe your automation</p>
          </div>
          <div className="bg-white/60 rounded-lg p-3">
            <div className="text-blue-600 font-medium text-sm mb-1">Step 2</div>
            <p className="text-xs text-gray-600">Review the workflow</p>
          </div>
          <div className="bg-white/60 rounded-lg p-3">
            <div className="text-blue-600 font-medium text-sm mb-1">Step 3</div>
            <p className="text-xs text-gray-600">Run it once</p>
          </div>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Send me a Slack message when I get a new email from a client"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isSubmitting) {
                handleAskBrain();
              }
            }}
          />
          <button
            onClick={handleAskBrain}
            disabled={isSubmitting || !prompt.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <span>Ask Brain</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex gap-4">
            <Link href="/templates" className="text-blue-600 hover:underline">
              Browse templates
            </Link>
            <Link href="/how-it-works" className="text-gray-500 hover:underline">
              How it works
            </Link>
          </div>
          <Link href="/support" className="text-gray-500 hover:underline">
            Need help?
          </Link>
        </div>
      </div>
    </div>
  );
}
