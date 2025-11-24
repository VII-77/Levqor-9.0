import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Metadata } from 'next';
import OnboardingChecklist from "@/components/OnboardingChecklist";
import HelpPanel from "@/components/HelpPanel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardV2() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/signin');
  }
  
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard V2</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {session.user.email}
          </p>
        </div>
        
        <OnboardingChecklist />
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">
            🚧 Dashboard V2 (Development)
          </h2>
          <p className="text-blue-700">
            This is the development version of the dashboard. New features are tested here before going live.
          </p>
        </div>
      </div>
      
      <HelpPanel />
    </main>
  );
}
