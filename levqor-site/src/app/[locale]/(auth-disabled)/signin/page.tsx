"use client";
import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: "There was a problem starting the sign-in process. Please try again.",
  OAuthCallback: "There was a problem completing the sign-in. Please try a different method.",
  OAuthCreateAccount: "Could not create an account with this provider. Please try again.",
  Callback: "There was a problem with the callback. Please try again.",
  OAuthAccountNotLinked: "This email is already linked to another account. Please sign in with your original method.",
  SessionRequired: "Please sign in to access this page.",
  Configuration: "Sign-in failed. Please try again or use a different provider.",
  OAuthCallbackError: "Sign-in failed. Please try again or use a different provider.",
  Default: "An unexpected error occurred. Please try again.",
};

function SignInContent() {
  const [loading, setLoading] = useState(false);
  const [hasMicrosoft, setHasMicrosoft] = useState(false);
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const errorCode = searchParams.get("error");
  
  const callbackUrl = typeof window !== "undefined"
    ? `${window.location.origin}/${locale}/dashboard`
    : `/${locale}/dashboard`;
  
  useEffect(() => {
    async function checkProviders() {
      try {
        const res = await fetch("/api/auth/providers");
        if (res.ok) {
          const providers = await res.json();
          setHasMicrosoft(!!providers["azure-ad"]);
        }
      } catch (err) {
        console.error("Failed to fetch providers:", err);
      }
    }
    checkProviders();
  }, []);
  
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Welcome to Levqor</h2>
          <p className="text-gray-600 text-center mb-6">Sign in or create your free account to get started</p>
          
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
                  {(errorCode === "OAuthSignin" || errorCode === "OAuthCallback" || errorCode === "OAuthCallbackError") && (
                    <p className="text-xs text-red-600 mt-2">
                      This may be caused by provider configuration. Please try again or contact support.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
      
          <div className="space-y-3">
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
            
            {hasMicrosoft && (
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
            )}
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Secure OAuth 2.0
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Encrypted in transit
              </span>
            </div>
            <p className="text-xs text-gray-500 text-center">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">Terms</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-6 text-center">
          Sign in with your Google or Microsoft account
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
