"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { getApiBase } from '@/lib/api-config';

interface Step {
  id: number;
  title: string;
  description: string;
  action: string;
  completed: boolean;
}

const ONBOARDING_STEPS: Step[] = [
  {
    id: 0,
    title: "Welcome to Levqor",
    description: "Let's get you set up with your AI-powered data operations platform",
    action: "Continue",
    completed: false
  },
  {
    id: 1,
    title: "Explore the Dashboard",
    description: "Your central command center for monitoring and managing all operations",
    action: "Got it",
    completed: false
  },
  {
    id: 2,
    title: "Meet Your AI Brain",
    description: "Guardian AI monitors your systems 24/7 and provides actionable insights",
    action: "See the Brain",
    completed: false
  },
  {
    id: 3,
    title: "Create Your First Workflow",
    description: "Use natural language to describe what you want to automate",
    action: "Try the Builder",
    completed: false
  },
  {
    id: 4,
    title: "You're All Set!",
    description: "Start protecting and automating your data operations",
    action: "Go to Dashboard",
    completed: false
  }
];

export default function OnboardingFlow() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";
  
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState(ONBOARDING_STEPS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchState = async () => {
      if (!session?.user?.email) return;

      try {
        const API_URL = getApiBase();
        const res = await fetch(
          `${API_URL}/api/wow/brain/state?email=${encodeURIComponent(session.user.email)}`
        );
        const data = await res.json();

        if (data.ok && data.state) {
          const savedStep = data.state.onboarding_step || 0;
          setCurrentStep(savedStep);
          
          setSteps(prev => prev.map(s => ({
            ...s,
            completed: s.id < savedStep
          })));
        }
      } catch (err) {
        console.error("Failed to fetch onboarding state");
      } finally {
        setLoading(false);
      }
    };

    fetchState();
  }, [session]);

  const handleNext = async () => {
    if (!session?.user?.email) return;

    const nextStep = currentStep + 1;

    try {
      const API_URL = getApiBase();
      await fetch(`${API_URL}/api/wow/brain/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          event_type: "onboarding_step_complete",
          data: { step: currentStep }
        })
      });

      if (nextStep >= steps.length) {
        await fetch(`${API_URL}/api/wow/brain/event`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: session.user.email,
            event_type: "onboarding_complete",
            data: {}
          })
        });

        router.push(`/${locale}/dashboard`);
        return;
      }

      setSteps(prev => prev.map(s => ({
        ...s,
        completed: s.id <= currentStep
      })));
      setCurrentStep(nextStep);

    } catch (err) {
      console.error("Failed to save progress");
    }
  };

  const handleSkipToBuilder = () => {
    router.push(`/${locale}/builder`);
  };

  const handleSkipToBrain = () => {
    router.push(`/${locale}/brain`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const step = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <div
                key={s.id}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentStep
                    ? "bg-blue-400 w-4"
                    : s.completed
                    ? "bg-green-400"
                    : "bg-white/20"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => router.push(`/${locale}/dashboard`)}
            className="text-sm text-white/60 hover:text-white"
          >
            Skip for now
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              {currentStep === 0 && (
                <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              )}
              {currentStep === 1 && (
                <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )}
              {currentStep === 2 && (
                <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              )}
              {currentStep === 3 && (
                <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
              {currentStep === 4 && (
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">{step.title}</h1>
            <p className="text-blue-200">{step.description}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleNext}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all"
            >
              {step.action}
            </button>

            {currentStep === 2 && (
              <button
                onClick={handleSkipToBrain}
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors"
              >
                Open AI Brain
              </button>
            )}

            {currentStep === 3 && (
              <button
                onClick={handleSkipToBuilder}
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors"
              >
                Try the Builder Now
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-white/40 text-sm mt-6">
          Step {currentStep + 1} of {steps.length}
        </p>
      </div>
    </div>
  );
}
