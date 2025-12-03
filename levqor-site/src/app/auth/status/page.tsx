import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

interface ProviderStatus {
  name: string;
  envPresent: boolean;
  description: string;
}

function getProviderStatuses(): ProviderStatus[] {
  return [
    {
      name: "Email (Resend Magic Link)",
      envPresent: !!process.env.RESEND_API_KEY,
      description: "Secure passwordless authentication via email magic links powered by Resend.",
    },
  ];
}

export default async function AuthStatusPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/signin?callbackUrl=/auth/status");
  }
  
  const providers = getProviderStatuses();
  const nextAuthUrl = process.env.NEXTAUTH_URL || "Not set";
  const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET ? "Set" : "Not set";
  const resendConfigured = !!process.env.RESEND_API_KEY;
  const authFromEmail = process.env.AUTH_FROM_EMAIL || "login@levqor.ai";
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Auth Configuration Status</h1>
          <p className="text-gray-600 mt-2">
            Magic Link email authentication configuration status.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Core Settings</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-medium text-gray-700">NEXTAUTH_URL</span>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">{nextAuthUrl}</code>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-medium text-gray-700">AUTH_SECRET</span>
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                authSecret === "Set" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                {authSecret}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-medium text-gray-700">AUTH_FROM_EMAIL</span>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">{authFromEmail}</code>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Method</h2>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <h3 className="font-semibold text-blue-900">Magic Link Authentication</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Users sign in by entering their email address and clicking a secure link sent to their inbox.
                  No passwords required.
                </p>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Provider</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((provider) => (
                  <tr key={provider.name} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-900">{provider.name}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-sm font-medium ${
                        provider.envPresent 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {provider.envPresent ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        {provider.envPresent ? "Active" : "Not Configured"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {provider.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {!resendConfigured && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuration Required</h2>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h3 className="font-semibold text-amber-800">Resend API Key</h3>
              <p className="text-sm text-amber-700 mt-1">
                Set the RESEND_API_KEY environment variable with a valid Resend API key to enable magic link emails.
              </p>
              <p className="text-xs text-amber-600 mt-2">
                Get your API key at: <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="underline">resend.com</a>
              </p>
            </div>
          </div>
        )}
        
        {resendConfigured && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800">All Systems Operational</h3>
              <p className="text-sm text-green-700 mt-1">
                Magic link authentication is fully configured and ready to use.
                Users can sign in by entering their email address.
              </p>
            </div>
          </div>
        )}
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Logged in as: {session.user?.email}</p>
        </div>
      </div>
    </main>
  );
}
