"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Workflow {
  id: string;
  created_at: number;
  prompt: string;
  yaml: string;
  summary: string;
}

export default function BuilderHistoryPage() {
  const { data: session } = useSession();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Workflow | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!session?.user?.email) return;

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await fetch(
          `${API_URL}/api/builder/history?email=${encodeURIComponent(session.user.email)}`
        );
        const data = await res.json();

        if (data.ok) {
          setWorkflows(data.workflows);
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [session]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workflow History</h1>
            <p className="text-gray-600">Your previously generated workflows</p>
          </div>
          <Link
            href={`/${locale}/builder`}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : workflows.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows yet</h3>
            <p className="text-gray-600 mb-4">Create your first workflow with the AI builder</p>
            <Link
              href={`/${locale}/builder`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-3">
              {workflows.map((wf) => (
                <button
                  key={wf.id}
                  onClick={() => setSelected(wf)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selected?.id === wf.id
                      ? "bg-blue-50 border-blue-200"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-medium text-gray-900 truncate">{wf.prompt}</p>
                  <p className="text-sm text-gray-500 mt-1">{formatDate(wf.created_at)}</p>
                </button>
              ))}
            </div>

            <div className="lg:col-span-2">
              {selected ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="font-semibold text-gray-900 mb-2">{selected.prompt}</h2>
                  <p className="text-sm text-gray-500 mb-4">{formatDate(selected.created_at)}</p>

                  <div className="prose prose-sm max-w-none mb-6">
                    <div dangerouslySetInnerHTML={{ __html: selected.summary.replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">YAML Configuration</h3>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-auto max-h-64">
                      {selected.yaml}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <p className="text-gray-500">Select a workflow to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
