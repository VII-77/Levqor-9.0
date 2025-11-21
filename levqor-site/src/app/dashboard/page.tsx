import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardTiles from "@/components/DashboardTiles";
import AnalyticsWidget from "@/components/AnalyticsWidget";

export const dynamic = "force-dynamic";

async function getUsage(){
  const api = process.env.NEXT_PUBLIC_API_URL!;
  try {
    const res = await fetch(`${api}/api/usage/summary`, { cache: "no-store" });
    if(!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function Dashboard(){
  const session = await auth();
  
  if(!session?.user){
    redirect('/signin');
  }
  
  const usage = await getUsage();
  
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {session.user.email}
          </p>
        </div>
        
        <AnalyticsWidget />
        
        {!usage || Object.keys(usage).length === 0 ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 text-center">
              <div className="text-5xl mb-4">🚀</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Welcome to Levqor!</h2>
              <p className="text-lg text-gray-600 mb-6">You're all set. Let's build your first automation.</p>
              
              <div className="max-w-md mx-auto bg-white rounded-xl p-6 shadow-sm mb-6">
                <h3 className="font-semibold text-lg mb-4 text-left">Quick Start Checklist</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5"></div>
                    <div>
                      <div className="font-medium">Connect your Stripe account</div>
                      <div className="text-sm text-gray-600">Set up billing to unlock premium features</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5"></div>
                    <div>
                      <div className="font-medium">Configure your first webhook</div>
                      <div className="text-sm text-gray-600">Receive events from external services</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5"></div>
                    <div>
                      <div className="font-medium">Create your first job</div>
                      <div className="text-sm text-gray-600">Test the automation with a simple workflow</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DashboardTiles />
          </div>
        ) : (
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Usage Summary</h2>
            <pre className="text-sm bg-gray-50 p-4 rounded border overflow-auto">
              {JSON.stringify(usage, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
