"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const ROLES = [
  "Founder / CEO",
  "Operations Manager",
  "Agency Owner",
  "Marketing Lead",
  "Developer",
  "Other"
];

const USE_CASES = [
  "Client onboarding automation",
  "Internal ops & reporting",
  "Marketing automation",
  "Data backup & retention",
  "Workflow orchestration",
  "Not sure yet"
];

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [useCase, setUseCase] = useState("");
  const [phone, setPhone] = useState("");
  const [urgency, setUrgency] = useState(2);
  const [consent, setConsent] = useState(false);
  
  useEffect(() => {
    if (session?.user?.name) {
      setFullName(session.user.name);
    }
  }, [session]);
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/${locale}/signin`);
    }
  }, [status, router, locale]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!consent) {
      setError("Please agree to the terms to continue.");
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/system/onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user?.email || "",
          full_name: fullName,
          company_name: companyName,
          role,
          use_case: useCase,
          phone,
          urgency,
          consent
        })
      });
      
      if (res.ok) {
        if (session?.user?.email) {
          localStorage.setItem(`levqor_onboarding_${session.user.email}`, "done");
        }
        router.push(`/${locale}/trial`);
      } else {
        const data = await res.json();
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Onboarding error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
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
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-white">Levqor</h1>
          </Link>
          <p className="text-blue-200 mt-2">Let's set up your automation command center</p>
        </div>
        
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-16 h-1 rounded-full transition-colors ${
                s <= step ? "bg-blue-500" : "bg-slate-600"
              }`}
            />
          ))}
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}
          
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-white mb-4">About you</h2>
              
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-1">Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-1">Company name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Acme Inc"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-1">Your role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="" className="bg-slate-800">Select your role</option>
                  {ROLES.map((r) => (
                    <option key={r} value={r} className="bg-slate-800">{r}</option>
                  ))}
                </select>
              </div>
              
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!fullName || !companyName || !role}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                Continue
              </button>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-white mb-4">Your automation goals</h2>
              
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">Primary use case</label>
                <div className="grid grid-cols-2 gap-2">
                  {USE_CASES.map((uc) => (
                    <button
                      key={uc}
                      type="button"
                      onClick={() => setUseCase(uc)}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left ${
                        useCase === uc
                          ? "bg-blue-600 text-white border-2 border-blue-400"
                          : "bg-white/10 text-blue-100 border border-white/20 hover:bg-white/20"
                      }`}
                    >
                      {uc}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">How urgent is automation for you?</label>
                <div className="flex gap-4 items-center">
                  <span className="text-blue-200 text-sm">Not urgent</span>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    value={urgency}
                    onChange={(e) => setUrgency(Number(e.target.value))}
                    className="flex-1 accent-blue-500"
                  />
                  <span className="text-blue-200 text-sm">Critical</span>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg transition-colors border border-white/20"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!useCase}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-white mb-4">Final details</h2>
              
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-1">Phone number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+44 123 456 7890"
                  required
                />
                <p className="text-blue-200/70 text-xs mt-1">We may call to help with setup</p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-4 border border-blue-500/30">
                <h3 className="text-white font-medium mb-2">What happens next?</h3>
                <ul className="text-blue-100 text-sm space-y-1">
                  <li>1. Start your 7-day free trial</li>
                  <li>2. Get AI-powered automation suggestions</li>
                  <li>3. Launch your first workflow in minutes</li>
                </ul>
              </div>
              
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-blue-500"
                />
                <span className="text-sm text-blue-100">
                  I agree to the{" "}
                  <Link href="/terms" className="text-blue-400 hover:underline">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>
                </span>
              </label>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg transition-colors border border-white/20"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !phone || !consent}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Setting up...
                    </>
                  ) : (
                    "Start free trial"
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
        
        <p className="text-center text-blue-200/70 text-xs mt-6">
          Secure onboarding • No credit card required to explore
        </p>
      </div>
    </main>
  );
}
