import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardTiles from "@/components/DashboardTiles";
import AnalyticsWidget from "@/components/AnalyticsWidget";
import AIHelpPanel from "@/components/ai/AIHelpPanel";
import LevqorPilotPanel from "@/components/ai/LevqorPilotPanel";
import LifecycleBanner from "@/components/LifecycleBanner";
import DashboardOnboarding from "@/components/DashboardOnboarding";
import QuickstartPanel from "@/components/dashboard/QuickstartPanel";
import HealthOverview from "@/components/dashboard/HealthOverview";
import GrowthPanel from "@/components/dashboard/GrowthPanel";
import { DashboardBrainCanvas } from "@/components/brain";
import DashboardClientWrapper from "@/components/dashboard/DashboardClientWrapper";
import AccountBar from "@/components/dashboard/AccountBar";
import GettingStarted from "@/components/dashboard/GettingStarted";
import StarterTemplates from "@/components/dashboard/StarterTemplates";
import AIFounderStrip from "@/components/dashboard/AIFounderStrip";
import AIBriefingCard from "@/components/dashboard/AIBriefingCard";
import CommandPalette from "@/components/CommandPalette";
import SuggestionChips from "@/components/dashboard/SuggestionChips";
import ResourcesPanel from "@/components/dashboard/ResourcesPanel";
import type { Metadata } from 'next'

export const dynamic = "force-dynamic";

const SHOW_AUTH_DEBUG = process.env.NEXT_PUBLIC_SHOW_AUTH_DEBUG === "1";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

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

interface AuthDebugSession {
  user?: {
    email?: string | null;
    id?: string;
  } | null;
}

function AuthDebugPanel({ session }: { session: AuthDebugSession | null }) {
  if (!SHOW_AUTH_DEBUG) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-100 border-b-2 border-yellow-400 p-3 z-50 text-sm font-mono">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        <span className="font-bold text-yellow-800">AUTH DEBUG:</span>
        {session?.user ? (
          <span className="text-green-700">
            Logged in as: {session.user.email}
          </span>
        ) : (
          <span className="text-red-700">
            No session detected - auth() returned null
          </span>
        )}
        <a 
          href="/api/auth/debug" 
          target="_blank" 
          className="ml-auto text-blue-600 hover:underline"
        >
          Full Debug Info &rarr;
        </a>
      </div>
    </div>
  );
}

export default async function Dashboard(){
  const session = await auth();
  
  if(!session?.user){
    if (!SHOW_AUTH_DEBUG) {
      redirect('/signin');
    }
  }
  
  const usage = await getUsage();
  
  return (
    <DashboardClientWrapper>
    <AuthDebugPanel session={session} />
    <AccountBar />
    <main className="min-h-screen bg-gray-50 p-4 md:p-8" style={SHOW_AUTH_DEBUG ? { paddingTop: '60px' } : undefined}>
      <div className="max-w-6xl mx-auto space-y-6">
        <AIFounderStrip />
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-stretch">
            <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Welcome back, {session?.user?.email || "Guest"}
                </p>
              </div>
              <div className="flex gap-3">
                <Link 
                  href="/builder"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Workflow
                </Link>
                <Link 
                  href="/templates"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Templates
                </Link>
              </div>
            </div>
            
            <div className="hidden md:block w-48 lg:w-64">
              <DashboardBrainCanvas className="w-full h-full min-h-[100px]" />
            </div>
          </div>
        </div>
        
        <AIBriefingCard />
        
        <GettingStarted />
        
        <StarterTemplates />
        
        <QuickstartPanel className="mb-6" />
        
        <DashboardOnboarding />
        
        <LifecycleBanner />
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Your Workflows</h2>
                <Link href="/builder" className="text-sm text-blue-600 hover:underline">
                  Create new
                </Link>
              </div>
              
              {!usage || Object.keys(usage).length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-3">No workflows yet</p>
                  <Link 
                    href="/builder"
                    className="text-blue-600 font-medium hover:underline"
                  >
                    Create your first workflow
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <pre className="text-sm bg-gray-50 p-4 rounded border overflow-auto">
                    {JSON.stringify(usage, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            
            <DashboardTiles />
          </div>
          
          <div className="space-y-6">
            <HealthOverview />
            
            <AnalyticsWidget />
            
            <GrowthPanel />
            
            <ResourcesPanel />
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link 
                  href="/builder"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Build with AI</span>
                </Link>
                <Link 
                  href="/templates"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Browse Templates</span>
                </Link>
                <Link 
                  href="/pricing"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Upgrade Plan</span>
                </Link>
                <Link 
                  href="/support"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Get Help</span>
                </Link>
                <Link 
                  href="/auth/status"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Auth Status</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <AIHelpPanel context="dashboard" />
      <LevqorPilotPanel />
      <CommandPalette />
      <SuggestionChips />
    </main>
    </DashboardClientWrapper>
  );
}
