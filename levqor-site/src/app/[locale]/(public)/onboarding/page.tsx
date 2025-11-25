"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { templates } from "@/data/templates";

type GoalType = "solo" | "team" | "agency" | null;

const goals = [
  {
    id: "solo" as GoalType,
    title: "Solo Creator / Freelancer",
    description: "Automate my personal workflows and client work",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    recommended: ["email-to-slack", "meeting-notes", "social-scheduler"],
  },
  {
    id: "team" as GoalType,
    title: "Growing Business",
    description: "Scale operations and connect team tools",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    recommended: ["lead-capture-crm", "customer-feedback", "invoice-processor"],
  },
  {
    id: "agency" as GoalType,
    title: "Agency / Enterprise",
    description: "Manage client workflows at scale",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    recommended: ["employee-onboarding", "data-sync", "incident-response"],
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState<GoalType>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const router = useRouter();

  const recommendedTemplates = selectedGoal
    ? templates.filter((t) =>
        goals.find((g) => g.id === selectedGoal)?.recommended.includes(t.id)
      )
    : [];

  const allRelevantTemplates = selectedGoal
    ? templates.filter((t) => {
        const goal = goals.find((g) => g.id === selectedGoal);
        if (!goal) return false;
        if (selectedGoal === "solo") return t.track === "individual";
        if (selectedGoal === "team") return t.track === "business";
        if (selectedGoal === "agency") return t.track === "enterprise" || t.track === "business";
        return true;
      })
    : [];

  const handleComplete = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("levqor_onboarded", "true");
      localStorage.setItem("levqor_goal", selectedGoal || "");
    }
    
    if (selectedTemplate) {
      router.push(`/builder?templateId=${selectedTemplate}`);
    } else {
      router.push("/builder");
    }
  };

  const handleSkip = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("levqor_onboarded", "true");
    }
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold text-white">Levqor</h1>
          </Link>
          
          <div className="flex items-center justify-center gap-3 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex items-center ${s < 3 ? "flex-1 max-w-[100px]" : ""}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    s === step
                      ? "bg-blue-500 text-white"
                      : s < step
                      ? "bg-green-500 text-white"
                      : "bg-slate-700 text-slate-400"
                  }`}
                >
                  {s < step ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s
                  )}
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded ${
                      s < step ? "bg-green-500" : "bg-slate-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          {step === 1 && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Welcome to Levqor
                </h2>
                <p className="text-lg text-gray-600">
                  Let's set up your automation workspace. What best describes you?
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {goals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`p-6 rounded-xl border-2 text-left transition-all hover:shadow-lg ${
                      selectedGoal === goal.id
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div
                      className={`mb-4 ${
                        selectedGoal === goal.id ? "text-blue-600" : "text-gray-400"
                      }`}
                    >
                      {goal.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{goal.title}</h3>
                    <p className="text-sm text-gray-600">{goal.description}</p>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={handleSkip}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Skip for now
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedGoal}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Pick a Starting Template
                </h2>
                <p className="text-lg text-gray-600">
                  Choose a template to customize, or start from scratch.
                </p>
              </div>

              {recommendedTemplates.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Recommended for you
                  </h3>
                  <div className="grid gap-3">
                    {recommendedTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          selectedTemplate === template.id
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{template.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {template.shortDescription}
                            </p>
                          </div>
                          {selectedTemplate === template.id && (
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {allRelevantTemplates.length > recommendedTemplates.length && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    More templates
                  </h3>
                  <div className="grid gap-2 md:grid-cols-2">
                    {allRelevantTemplates
                      .filter((t) => !recommendedTemplates.find((r) => r.id === t.id))
                      .slice(0, 6)
                      .map((template) => (
                        <button
                          key={template.id}
                          onClick={() => setSelectedTemplate(template.id)}
                          className={`p-3 rounded-lg border text-left transition-all text-sm ${
                            selectedTemplate === template.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <span className="font-medium text-gray-900">{template.name}</span>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelectedTemplate(null)}
                className={`w-full p-4 rounded-xl border-2 border-dashed text-center transition-all ${
                  selectedTemplate === null
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 text-gray-500 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                Start from scratch - describe your own workflow
              </button>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  You're All Set!
                </h2>
                <p className="text-lg text-gray-600 max-w-md mx-auto">
                  {selectedTemplate
                    ? `Great choice! Let's customize the "${templates.find((t) => t.id === selectedTemplate)?.name}" template.`
                    : "Let's build your first automation from scratch."}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 max-w-md mx-auto text-left">
                <h3 className="font-semibold text-gray-900 mb-3">What's next:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">1.</span>
                    <span>Describe your workflow in plain English</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">2.</span>
                    <span>Our AI generates the automation steps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">3.</span>
                    <span>Connect your apps and deploy</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Open Builder
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-slate-400 text-sm mt-8">
          Questions?{" "}
          <Link href="/support" className="text-blue-400 hover:underline">
            Contact support
          </Link>{" "}
          or browse our{" "}
          <Link href="/templates" className="text-blue-400 hover:underline">
            template gallery
          </Link>
        </p>
      </div>
    </main>
  );
}
