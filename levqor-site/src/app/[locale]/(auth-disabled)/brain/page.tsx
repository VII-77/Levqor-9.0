import { auth } from "@/auth";
import { redirect } from "next/navigation";
import BrainDashboard from "@/components/brain/BrainDashboard";
import AccountBar from "@/components/dashboard/AccountBar";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Brain - AI Control Center",
  robots: { index: false, follow: false }
};

export default async function BrainPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <>
      <AccountBar />
      <main className="min-h-screen bg-gray-50 pt-4 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BrainDashboard userEmail={session.user.email || ""} />
        </div>
      </main>
    </>
  );
}
