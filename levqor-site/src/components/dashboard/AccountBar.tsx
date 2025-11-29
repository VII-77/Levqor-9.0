"use client";
import { useSession, signOut } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function AccountBar() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";
  const email = session?.user?.email ?? "Guest";

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {email.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-gray-700">
            Welcome, <span className="font-medium">{email}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link 
            href={`/${locale}/billing`}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Billing
          </Link>
          <Link 
            href={`/${locale}/revenue`}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Revenue Inbox
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
