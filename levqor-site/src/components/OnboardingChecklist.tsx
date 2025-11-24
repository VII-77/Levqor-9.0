"use client";
import { useState, useEffect } from "react";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export default function OnboardingChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: "connect_tool",
      title: "Connect one tool",
      description: "Link your first integration (Slack, Gmail, Stripe, etc.)",
      completed: false,
    },
    {
      id: "create_workflow",
      title: "Create workflow",
      description: "Build your first automation workflow",
      completed: false,
    },
    {
      id: "run_workflow",
      title: "Run workflow",
      description: "Test and execute your automation",
      completed: false,
    },
    {
      id: "invite_teammate",
      title: "Invite teammate",
      description: "Add team members to collaborate",
      completed: false,
    },
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkProgress() {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.levqor.ai';
        const res = await fetch(`${API_BASE}/api/usage/summary`, { cache: "no-store" });
        
        if (res.ok) {
          const data = await res.json();
          
          setItems(prev => prev.map(item => {
            switch(item.id) {
              case "connect_tool":
                return { ...item, completed: data.connectors_used > 0 };
              case "create_workflow":
                return { ...item, completed: data.workflows_created > 0 };
              case "run_workflow":
                return { ...item, completed: data.runs_used > 0 };
              case "invite_teammate":
                return { ...item, completed: data.team_members > 1 };
              default:
                return item;
            }
          }));
        }
      } catch (err) {
        console.error("Failed to load onboarding progress", err);
      } finally {
        setLoading(false);
      }
    }

    checkProgress();
  }, []);

  const completed = items.filter(i => i.completed).length;
  const total = items.length;
  const progress = (completed / total) * 100;

  if (completed === total) {
    return null; // Hide checklist once complete
  }

  return (
    <div className="bg-white rounded-lg shadow-md border p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Get Started</h2>
        <span className="text-sm text-gray-600">
          {completed}/{total} completed
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-green-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-start gap-3 p-3 rounded-lg transition ${
              item.completed ? "bg-green-50" : "bg-gray-50"
            }`}
          >
            <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              item.completed
                ? "bg-green-600 border-green-600"
                : "border-gray-300"
            }`}>
              {item.completed && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{item.title}</div>
              <div className="text-xs text-gray-600">{item.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
