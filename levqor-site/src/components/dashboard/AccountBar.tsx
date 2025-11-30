"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getApiBase } from "@/lib/api-config";

interface AccountStatus {
  subscription_status: string;
  trial_ends_at: string | null;
  plan_name: string | null;
}

export default function AccountBar() {
  const { data: session } = useSession();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const email = session?.user?.email ?? "Guest";
  const [status, setStatus] = useState<AccountStatus | null>(null);
  
  useEffect(() => {
    async function fetchStatus() {
      if (!session?.user?.email) return;
      
      try {
        const res = await fetch(
          `${getApiBase()}/api/system/account-status?email=${encodeURIComponent(session.user.email)}`
        );
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
        }
      } catch (err) {
        console.error("Failed to fetch account status:", err);
      }
    }
    
    fetchStatus();
  }, [session?.user?.email]);
  
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };
  
  const getDaysRemaining = () => {
    if (!status?.trial_ends_at) return null;
    const endDate = new Date(status.trial_ends_at);
    const now = new Date();
    const diff = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };
  
  const daysRemaining = getDaysRemaining();
  const isTrialing = status?.subscription_status === "trialing";
  const isUrgent = isTrialing && daysRemaining !== null && daysRemaining <= 2;
  
  const getPlanBadge = () => {
    if (!status) return null;
    
    if (isTrialing) {
      return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          isUrgent 
            ? "bg-orange-100 text-orange-700 animate-pulse" 
            : "bg-blue-100 text-blue-700"
        }`}>
          Trial{daysRemaining !== null ? ` – ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} left` : ""}
        </span>
      );
    }
    
    if (status.subscription_status === "active") {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
          {status.plan_name || "Pro"}
        </span>
      );
    }
    
    if (["canceled", "expired", "past_due"].includes(status.subscription_status)) {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
          {status.subscription_status === "past_due" ? "Payment due" : "Expired"}
        </span>
      );
    }
    
    return null;
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {email.charAt(0).toUpperCase()}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              <span className="font-medium">{email}</span>
            </span>
            {getPlanBadge()}
          </div>
          
          {isUrgent && (
            <Link
              href={`/${locale}/billing`}
              className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Keep automations running
            </Link>
          )}
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <Link 
            href={`/${locale}/billing`}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Billing
          </Link>
          <Link 
            href={`/${locale}/revenue`}
            className="hidden sm:inline-flex px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Revenue
          </Link>
          <button 
            onClick={handleSignOut}
            className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
