import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

interface ProviderStatus {
  name: string;
  envPresent: boolean;
  callbackUrl: string;
  instructions: string;
}

function getProviderStatuses(): ProviderStatus[] {
  const baseUrl = process.env.NEXTAUTH_URL || "https://www.levqor.ai";
  
  return [
    {
      name: "Google",
      envPresent: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      callbackUrl: `${baseUrl}/api/auth/callback/google`,
      instructions: "In Google Cloud Console, add the callback URL to OAuth 2.0 authorized redirect URIs.",
    },
    {
      name: "Microsoft (Azure AD)",
      envPresent: !!(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET),
      callbackUrl: `${baseUrl}/api/auth/callback/azure-ad`,
      instructions: "In Azure Portal, add the callback URL to Authentication > Platform configurations > Web.",
    },
    {
      name: "Email (Resend)",
      envPresent: !!process.env.RESEND_API_KEY,
      callbackUrl: "N/A - Email verification",
      instructions: "Ensure RESEND_API_KEY is set with a valid Resend API key.",
    },
    {
      name: "Credentials (Admin)",
      envPresent: !!(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD),
      callbackUrl: "N/A - Direct login",
      instructions: "Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables for admin access.",
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
  const nextAuthSecret = process.env.NEXTAUTH_SECRET ? "Set" : "Not set";
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Auth Configuration Status</h1>
          <p className="text-gray-600 mt-2">
            This page shows the configuration status of authentication providers.
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
              <span className="font-medium text-gray-700">NEXTAUTH_SECRET</span>
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                nextAuthSecret === "Set" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                {nextAuthSecret}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Provider Status</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Provider</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ENV Present</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Callback URL</th>
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
                        {provider.envPresent ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all">
                        {provider.callbackUrl}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Fix</h2>
          <div className="space-y-4">
            {providers.filter(p => !p.envPresent).map((provider) => (
              <div key={provider.name} className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h3 className="font-semibold text-amber-800">{provider.name}</h3>
                <p className="text-sm text-amber-700 mt-1">{provider.instructions}</p>
                {provider.callbackUrl !== "N/A - Email verification" && provider.callbackUrl !== "N/A - Direct login" && (
                  <div className="mt-2">
                    <span className="text-xs text-amber-600">Required callback URL:</span>
                    <code className="block mt-1 text-xs bg-amber-100 p-2 rounded break-all">
                      {provider.callbackUrl}
                    </code>
                  </div>
                )}
              </div>
            ))}
            
            {providers.every(p => p.envPresent) && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800">All providers configured</h3>
                <p className="text-sm text-green-700 mt-1">
                  All authentication providers have their environment variables set.
                  If you still experience issues, verify the callback URLs are correctly registered.
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Logged in as: {session.user?.email}</p>
        </div>
      </div>
    </main>
  );
}
