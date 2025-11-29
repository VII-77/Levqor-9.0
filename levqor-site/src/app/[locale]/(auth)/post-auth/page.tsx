import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function getAccountStatus(email: string): Promise<{
  has_active_subscription: boolean;
  subscription_status: string;
  onboarding_completed: boolean;
}> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.levqor.ai";
  
  try {
    const res = await fetch(`${apiUrl}/api/system/account-status?email=${encodeURIComponent(email)}`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json"
      }
    });
    
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error("[post-auth] Failed to fetch account status:", err);
  }
  
  return {
    has_active_subscription: false,
    subscription_status: "none",
    onboarding_completed: false
  };
}

interface PostAuthPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PostAuthPage({ params }: PostAuthPageProps) {
  const { locale } = await params;
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect(`/${locale}/signin`);
  }
  
  const email = session.user.email;
  const accountStatus = await getAccountStatus(email);
  
  const onboardingDone = 
    accountStatus.onboarding_completed || 
    typeof window !== "undefined" && localStorage.getItem(`levqor_onboarding_${email}`) === "done";
  
  if (!onboardingDone && accountStatus.subscription_status === "none") {
    redirect(`/${locale}/onboarding`);
  }
  
  const needsSubscription = ["none", "expired", "canceled"].includes(accountStatus.subscription_status);
  
  if (needsSubscription && !accountStatus.has_active_subscription) {
    redirect(`/${locale}/trial`);
  }
  
  redirect(`/${locale}/dashboard`);
}
