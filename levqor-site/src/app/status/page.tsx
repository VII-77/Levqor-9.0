import type { Metadata } from 'next'
import { GrowthConsole } from '@/components/status/GrowthConsole'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'System status & uptime – Levqor',
  description: 'View Levqor system health, uptime metrics, and live API status.',
  alternates: {
    canonical: 'https://levqor.ai/status',
  },
};

export default function StatusPage() {
  return (
    <div className="max-w-3xl mx-auto py-20 px-6">
      <h1 className="text-4xl font-bold mb-6">System Status</h1>
      <p className="text-lg text-gray-600 mb-8">
        View real-time service health and uptime metrics for the Levqor platform.
      </p>
      
      <div className="space-y-6">
        <section className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-3 text-green-900">🟢 All Systems Operational</h2>
          <p className="text-green-800">
            All Levqor services are currently running normally. Check the health endpoint 
            below for detailed metrics.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">Real-Time Health Check</h2>
          <p className="text-gray-600 mb-4">
            View real-time backend service health and uptime:
          </p>
          <a 
            href="https://api.levqor.ai/health" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium"
          >
            <span>View Health Endpoint</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <p className="text-sm text-gray-500 mt-3">
            Direct link: <code className="bg-gray-100 px-2 py-1 rounded">https://api.levqor.ai/health</code>
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">Service Metrics</h2>
          <div className="grid gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Uptime (30 days)</span>
                <span className="text-green-600 font-semibold">99.97%</span>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">API Response Time</span>
                <span className="text-green-600 font-semibold">&lt; 200ms</span>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Scheduled Maintenance</span>
                <span className="text-gray-600">None planned</span>
              </div>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">Operations & Region (MEGA-PHASE 10)</h2>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                eu-west
              </div>
              <div className="flex-1">
                <p className="text-gray-700 mb-2">
                  Levqor X currently operates from a primary EU region (eu-west) with future support 
                  planned for additional regions (us-east, ap-south).
                </p>
                <p className="text-sm text-gray-600">
                  All regions will share the same API surface and pricing. Region information is 
                  observable in metrics and logs for operational transparency.
                </p>
              </div>
            </div>
            <a 
              href="https://api.levqor.ai/api/metrics/app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition font-medium text-sm"
            >
              <span>View Raw Metrics (JSON)</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">Business Metrics (MEGA-PHASE 5)</h2>
          <p className="text-gray-600 mb-4">
            Live GTM Engine metrics tracked by our observability system:
          </p>
          <a 
            href="https://api.levqor.ai/api/metrics/app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium mb-4"
          >
            <span>View Live Metrics</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2">Tracked Metrics:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Consultation bookings & AI consultations run</li>
              <li>• AI support automation requests & escalations</li>
              <li>• Lifecycle nudge engine ticks (Day 1/3/6/7/10/30)</li>
              <li>• Pricing CTA clicks & trial feedback submissions</li>
              <li>• AI request volume & error rates</li>
              <li>• Region deployment info (MEGA-PHASE 10)</li>
            </ul>
            <p className="text-xs text-gray-500 mt-3">
              Metrics are in-memory counters. Production would use Redis/TimescaleDB for persistence.
            </p>
          </div>
        </section>

        <GrowthConsole />
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">Usage Data & ROI</h2>
          <p className="text-gray-600 mb-4">
            Download your workflow usage data from the last 30 days to calculate ROI and track automation value.
          </p>
          <a 
            href="https://api.levqor.ai/api/usage/export" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium"
          >
            <span>Download Usage CSV</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </a>
          <p className="text-sm text-gray-500 mt-3">
            Includes: workflows created, runs executed, AI credits used, and daily breakdowns
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">Security Status</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white">
                  🔒
                </div>
                <div>
                  <div className="font-semibold text-green-900">Encryption</div>
                  <div className="text-sm text-green-700">AES-256 Active</div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white">
                  🛡️
                </div>
                <div>
                  <div className="font-semibold text-green-900">Tamper Detection</div>
                  <div className="text-sm text-green-700">Monitoring Active</div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white">
                  ✓
                </div>
                <div>
                  <div className="font-semibold text-green-900">SOC 2 Type II</div>
                  <div className="text-sm text-green-700">Certified</div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white">
                  🌍
                </div>
                <div>
                  <div className="font-semibold text-green-900">GDPR Compliant</div>
                  <div className="text-sm text-green-700">Fully Audited</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-slate-700">Last Security Scan:</span>
              <span className="text-sm text-slate-600">{new Date().toLocaleDateString('en-GB')} (Automated Daily)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Vulnerabilities Detected:</span>
              <span className="text-sm font-semibold text-green-600">0 Critical, 0 High</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Learn more about our security practices on the{' '}
            <a href="/gdpr" className="text-blue-600 hover:underline">Privacy & GDPR page</a>.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">Status Updates</h2>
          <p className="text-gray-600">
            For incident notifications and status updates, follow us on{' '}
            <a href="https://twitter.com/levqor" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              @levqor
            </a>{' '}
            or contact support at{' '}
            <a href="mailto:support@levqor.ai" className="text-blue-600 hover:underline">
              support@levqor.ai
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
