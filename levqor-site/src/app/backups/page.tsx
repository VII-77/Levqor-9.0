import Link from "next/link";

export default function BackupsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <div className="mb-8">
          <Link href="/" className="text-sm text-slate-400 hover:text-white transition">
            ← Back to home
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-white mb-2">Backup & Data Retention Policy</h1>
        <p className="text-slate-400 mb-12">
          Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </p>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Backup Frequency</h2>
          <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
            <li>Daily backups of all customer data</li>
            <li>Incremental backups every 6 hours</li>
            <li>Full system snapshots weekly</li>
          </ul>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-2xl font-bold text-white">Backup Storage</h2>
          <p className="text-slate-300 leading-relaxed">
            Backups stored in EU-based data centers.
          </p>
          <p className="text-slate-300 leading-relaxed">
            Redundant infrastructure across multiple availability zones.
          </p>
          <p className="text-slate-300 leading-relaxed">
            Encrypted at rest with AES-256.
          </p>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-2xl font-bold text-white">Retention Periods</h2>
          <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
            <li>Daily backups: 30 days</li>
            <li>Weekly backups: 90 days</li>
            <li>Monthly backups: 365 days</li>
            <li>Billing records: 6 years (legal requirement)</li>
          </ul>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-2xl font-bold text-white">Recovery</h2>
          <p className="text-slate-300 leading-relaxed">
            Recovery window target: &lt;12 hours
          </p>
          <p className="text-slate-300 leading-relaxed">
            Disaster recovery plan tested quarterly.
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex gap-4 text-sm">
            <Link href="/dpa" className="text-emerald-400 hover:underline">Data Processing Agreement</Link>
            <Link href="/security" className="text-emerald-400 hover:underline">Security</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
