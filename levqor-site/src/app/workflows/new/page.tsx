import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Metadata } from 'next';
import WorkflowCreator from "@/components/WorkflowCreator";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'Create Workflow | Levqor',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewWorkflowPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/signin');
  }
  
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Workflow</h1>
          <p className="text-lg text-gray-600">
            Build powerful automations in minutes with natural language or visual builder
          </p>
        </div>
        
        <WorkflowCreator />
      </div>
    </main>
  );
}
