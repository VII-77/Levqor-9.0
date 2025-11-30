import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LaunchpadFlow from "@/components/launchpad/LaunchpadFlow";
import AccountBar from "@/components/dashboard/AccountBar";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Launchpad - Get Started with Levqor",
  robots: { index: false, follow: false }
};

export default async function LaunchpadPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <>
      <AccountBar />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-8 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <LaunchpadFlow userEmail={session.user.email || ""} userName={session.user.name || ""} />
        </div>
      </main>
    </>
  );
}
