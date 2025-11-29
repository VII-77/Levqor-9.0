export interface BillingStatus {
  safe_mode: boolean;
  has_active_subscription: boolean;
  is_on_trial: boolean;
  trial_days_remaining: number;
  plan: string | null;
  status: string;
  onboarding_completed: boolean;
  has_seen_launchpad: boolean;
  can_access_dashboard: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function fetchBillingStatus(email: string): Promise<BillingStatus | null> {
  if (!email) return null;
  
  try {
    const res = await fetch(
      `${API_URL}/api/billing/status?email=${encodeURIComponent(email)}`,
      { 
        credentials: "include",
        cache: "no-store"
      }
    );
    
    if (!res.ok) {
      console.warn("Billing status fetch failed:", res.status);
      return null;
    }
    
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch billing status:", err);
    return null;
  }
}

export async function startTrial(email: string, name?: string): Promise<{ ok: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/api/billing/start-trial`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
      credentials: "include"
    });
    
    return await res.json();
  } catch (err) {
    console.error("Failed to start trial:", err);
    return { ok: false, error: "network_error" };
  }
}

export function shouldShowPaywall(status: BillingStatus | null): boolean {
  if (!status) return false;
  return !status.can_access_dashboard;
}

export function shouldRedirectToLaunchpad(status: BillingStatus | null): boolean {
  if (!status) return false;
  return status.can_access_dashboard && !status.has_seen_launchpad && !status.onboarding_completed;
}

export function getPlanDisplayName(status: BillingStatus | null): string {
  if (!status || !status.plan) return "Free";
  return status.plan;
}

export function getTrialBadge(status: BillingStatus | null): { text: string; urgent: boolean } | null {
  if (!status || !status.is_on_trial) return null;
  
  const days = status.trial_days_remaining;
  const urgent = days <= 2;
  
  return {
    text: days <= 0 ? "Trial expired" : `Trial - ${days} day${days !== 1 ? "s" : ""} left`,
    urgent
  };
}
