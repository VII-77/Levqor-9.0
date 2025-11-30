"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { LevqorBrainCanvas, LevqorBrainProvider } from "@/components/brain";

export default function WelcomePage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<{
    plan?: string;
    status?: string;
    email?: string;
  } | null>(null);

  useEffect(() => {
    async function verifySession() {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/billing/verify-session?session_id=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setSubscription(data);
        }
      } catch (err) {
        console.error("Failed to verify session:", err);
      } finally {
        setLoading(false);
      }
    }

    verifySession();
  }, [sessionId]);

  return (
    <LevqorBrainProvider>
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <LevqorBrainCanvas brainState="success" className="w-full h-full" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl w-full text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Welcome to Levqor!
            </h1>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <p className="text-lg text-gray-600 mb-6">
                  {subscription?.plan ? (
                    <>Your <strong className="text-blue-600">{subscription.plan}</strong> subscription is now active.</>
                  ) : (
                    "Your account is now set up and ready to go."
                  )}
                </p>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl">🧠</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Levqor Brain is Your Guide
                    </h2>
                  </div>
                  <p className="text-gray-700 text-sm">
                    Our AI-powered assistant will help you create workflows, 
                    automate tasks, and get the most out of Levqor. Just describe 
                    what you want to achieve in plain English.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">What's next?</h3>
                  <div className="grid gap-3 text-left">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 text-sm font-medium">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Complete your quickstart</p>
                        <p className="text-sm text-gray-600">Tell the Brain what you want to automate</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 text-sm font-medium">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Review your first workflow</p>
                        <p className="text-sm text-gray-600">AI generates the automation steps for you</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 text-sm font-medium">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Connect apps and deploy</p>
                        <p className="text-sm text-gray-600">Link your tools and run your first automation</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/dashboard"
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    Start Quickstart
                    <svg className="inline-block w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link
                    href="/onboarding"
                    className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Take the Tour
                  </Link>
                </div>
              </>
            )}
          </div>

          <p className="text-slate-400 text-sm mt-8">
            Questions?{" "}
            <Link href="/support" className="text-blue-400 hover:underline">
              Contact support
            </Link>
          </p>
        </div>
      </main>
    </LevqorBrainProvider>
  );
}
