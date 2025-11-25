// levqor-site/src/app/status/page.tsx
export const dynamic = "force-dynamic";

export default function StatusPage() {
  return (
    <main className="px-6 py-20 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">System Status</h1>
      <p className="text-gray-600 mb-4">
        All core Levqor systems are operational. This page is primarily for
        internal observability and does not change any pricing, trial, or SLA terms.
      </p>
      <p className="text-gray-500 text-sm">
        Growth metrics and advanced analytics will be shown here when the
        metrics API is reachable. If it is temporarily unavailable, the rest
        of the product continues to function normally.
      </p>
    </main>
  );
}
