"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "£9",
    period: "/month",
    description: "For individuals getting started",
    features: [
      "5 automated workflows",
      "1,000 executions/month",
      "Email support",
      "Basic analytics"
    ],
    popular: false
  },
  {
    id: "launch",
    name: "Launch",
    price: "£29",
    period: "/month",
    description: "For growing teams",
    features: [
      "25 automated workflows",
      "10,000 executions/month",
      "Priority support",
      "Advanced analytics",
      "Team collaboration"
    ],
    popular: true
  }
];

export default function TrialPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";
  
  const [selectedPlan, setSelectedPlan] = useState("launch");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleStartTrial = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchase_type: "subscription",
          tier: selectedPlan,
          billing_interval: "month",
          customer_email: session?.user?.email || ""
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      }
      
      const data = await res.json();
      setError(data.error || data.message || "Failed to start checkout. Please try again.");
    } catch (err) {
      console.error("Trial checkout error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSkipTrial = () => {
    router.push(`/${locale}/dashboard`);
  };
  
  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="animate-pulse text-white">Loading...</div>
      </main>
    );
  }
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-white">Levqor</h1>
          </Link>
          <h2 className="text-2xl font-bold text-white mt-6">Start your 7-day free trial</h2>
          <p className="text-blue-200 mt-2">Card required • Cancel anytime • No charge during trial</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
            {error}
          </div>
        )}
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border-2 cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? "border-blue-500 bg-white/15 scale-[1.02]"
                  : "border-white/20 hover:border-white/40"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </span>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === plan.id ? "border-blue-500 bg-blue-500" : "border-white/40"
                }`}>
                  {selectedPlan === plan.id && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-blue-200">{plan.period}</span>
              </div>
              
              <p className="text-blue-200 text-sm mb-4">{plan.description}</p>
              
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-blue-100">
                    <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="text-center space-y-4">
          <button
            onClick={handleStartTrial}
            disabled={loading}
            className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Starting checkout...
              </>
            ) : (
              <>
                Start 7-day free trial
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
          
          <button
            onClick={handleSkipTrial}
            className="text-blue-300 hover:text-white text-sm transition-colors underline"
          >
            Skip for now and explore
          </button>
        </div>
        
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-6 text-blue-200/70 text-xs">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure checkout
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Cancel anytime
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Stripe powered
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
