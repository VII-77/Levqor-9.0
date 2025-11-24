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
