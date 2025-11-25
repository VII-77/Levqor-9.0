"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getTemplateById } from "@/data/templates";

interface WorkflowStep {
  step: number;
  action: string;
  description: string;
  service?: string;
}

function BuilderContent() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");
  
  const [description, setDescription] = useState("");
  const [userType, setUserType] = useState<"individual" | "business">("individual");
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (templateId) {
      const template = getTemplateById(templateId);
      if (template) {
        setDescription(template.examplePrompt);
        setUserType(template.track === "individual" ? "individual" : "business");
      }
    }
  }, [templateId]);

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError("Please describe what you want to automate");
      return;
    }

    setLoading(true);
    setError(null);
    setSteps([]);

    try {
      const res = await fetch("/api/autogen-mvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, userType }),
      });

      if (!res.ok) throw new Error("Failed to generate workflow");

      const data = await res.json();
      setSteps(data.steps || []);
    } catch (err) {
      setError("Failed to generate workflow. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            AI Workflow Builder
          </h1>
          <p className="text-xl text-gray-600">
            Describe what you want to automate in plain English
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What would you like to automate?
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Example: When I receive an email with 'urgent' in the subject, forward it to Slack and text me..."
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none h-32"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I am using this for:
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setUserType("individual")}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                  userType === "individual"
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Individual
              </button>
              <button
                onClick={() => setUserType("business")}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                  userType === "business"
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Business
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⚙️</span>
                Generating workflow...
              </>
            ) : (
              <>
                <span>🤖</span>
                Generate with AI
              </>
            )}
          </button>
        </div>

        {steps.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Your Workflow</h2>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"
                >
                  <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{step.action}</h3>
                    <p className="text-gray-600">{step.description}</p>
                    {step.service && (
                      <span className="inline-block mt-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                        {step.service}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-4">
              <Link
                href="/signin"
                className="flex-1 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold text-center hover:from-primary-700 hover:to-secondary-700 transition-all"
              >
                Save & Deploy
              </Link>
              <button
                onClick={() => setSteps([])}
                className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Start Over
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/templates" className="text-primary-600 hover:underline">
            ← Browse template gallery
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">⚙️</div>
      </div>
    }>
      <BuilderContent />
    </Suspense>
  );
}
