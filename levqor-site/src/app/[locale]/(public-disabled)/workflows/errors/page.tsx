import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Metadata } from 'next';
import WorkflowErrorsDashboard from "@/components/WorkflowErrorsDashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'Workflow Errors | Levqor',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function WorkflowErrorsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/signin');
  }
  
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Workflow Errors</h1>
          <p className="text-lg text-gray-600">
            View and debug workflow errors with AI-powered assistance
          </p>
        </div>
        
        <WorkflowErrorsDashboard />
      </div>
    </main>
  );
}
