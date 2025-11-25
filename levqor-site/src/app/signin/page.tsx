"use client";
import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: "There was a problem starting the sign-in process. Please try again.",
  OAuthCallback: "There was a problem completing the sign-in. Please try a different method.",
  OAuthCreateAccount: "Could not create an account with this provider. Please try email instead.",
  EmailCreateAccount: "Could not create an account with this email. Please try again.",
  Callback: "There was a problem with the callback. Please try again.",
  OAuthAccountNotLinked: "This email is already linked to another account. Please sign in with your original method.",
  EmailSignin: "The email could not be sent. Please try again or use a different method.",
  CredentialsSignin: "Invalid email or password. Please check your credentials.",
  SessionRequired: "Please sign in to access this page.",
  Default: "An unexpected error occurred. Please try again.",
};

function SignInContent() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  
  useEffect(() => {
    const ref = searchParams.get("ref");
    const campaign = searchParams.get("campaign");
    const medium = searchParams.get("medium");
    
    if (ref) {
      sessionStorage.setItem("levqor_ref_source", ref);
      if (campaign) sessionStorage.setItem("levqor_ref_campaign", campaign);
      if (medium) sessionStorage.setItem("levqor_ref_medium", medium);
    }
  }, [searchParams]);
  
  async function trackReferral(userEmail: string) {
    const source = sessionStorage.getItem("levqor_ref_source") || "direct";
    const campaign = sessionStorage.getItem("levqor_ref_campaign") || "";
    const medium = sessionStorage.getItem("levqor_ref_medium") || "";
    
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/referrals/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, source, campaign, medium })
      });
      sessionStorage.removeItem("levqor_ref_source");
      sessionStorage.removeItem("levqor_ref_campaign");
      sessionStorage.removeItem("levqor_ref_medium");
    } catch (err) {
      console.error("Failed to track referral:", err);
    }
  }
  
  async function submit(e: React.FormEvent){
    e.preventDefault();
    setLoading(true);
    try {
      await trackReferral(email);
      await signIn("resend", { email, callbackUrl });
      setSubmitted(true);
    } catch (err) {
      console.error("Sign-in error:", err);
    } finally {
      setLoading(false);
    }
  }
  
  async function handleOAuthSignIn(provider: string) {
    setLoading(true);
    try {
      await signIn(provider, { callbackUrl });
    } catch (err) {
      console.error("OAuth sign-in error:", err);
      setLoading(false);
    }
  }
  
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Levqor
            </h1>
          </Link>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Sign in to Levqor</h2>
          <p className="text-gray-600 text-center mb-6">Access your automation dashboard</p>
          
          {errorCode && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-800">Sign-in failed</p>
                  <p className="text-sm text-red-700 mt-1">
                    {ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.Default}
                  </p>
                  {(errorCode === "OAuthSignin" || errorCode === "OAuthCallback") && (
                    <p className="text-xs text-red-600 mt-2">
                      This may be caused by provider configuration. Try email sign-in below.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
      
          {!submitted ? (
            <>
              <div className="space-y-3 mb-6">
                <button 
                  onClick={() => handleOAuthSignIn("google")}
                  disabled={loading}
                  className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-4 rounded-lg border border-gray-300 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
                
                <button 
                  onClick={() => handleOAuthSignIn("azure-ad")}
                  disabled={loading}
                  className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-4 rounded-lg border border-gray-300 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 23 23">
                    <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                    <path fill="#f35325" d="M1 1h10v10H1z"/>
                    <path fill="#81bc06" d="M12 1h10v10H12z"/>
                    <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                    <path fill="#ffba08" d="M12 12h10v10H12z"/>
                  </svg>
                  Continue with Microsoft
                </button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500">Or continue with email</span>
                </div>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <input 
                    id="email"
                    type="email" 
                    className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="you@example.com" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required
                    disabled={loading}
                  />
                </div>
                <button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    "Send magic link"
                  )}
                </button>
              </form>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                  By signing in, you agree to our{" "}
                  <Link href="/terms" className="text-blue-600 hover:underline">Terms</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h3>
              <p className="text-gray-600 mb-4">
                We sent a sign-in link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Click the link in the email to sign in. It expires in 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 text-sm text-blue-600 hover:underline"
              >
                Use a different email
              </button>
            </div>
          )}
        </div>
        
        <p className="text-xs text-gray-500 mt-6 text-center">
          Secure sign-in • AES-256 encryption • GDPR compliant
        </p>
      </div>
    </main>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </main>
    }>
      <SignInContent />
    </Suspense>
  );
}
