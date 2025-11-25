import Link from 'next/link';

export const metadata = {
  title: 'API Documentation | Levqor',
  description: 'Complete API reference for the Levqor platform',
};

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/developer" className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block">
            ← Back to Developer Portal
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            API Documentation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete reference for integrating with Levqor
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <a
            href="#authentication"
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              🔐 Authentication
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Learn how to authenticate API requests
            </p>
          </a>
          <a
            href="#sandbox"
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              🧪 Sandbox API
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Test with mock data safely
            </p>
          </a>
          <a
            href="#production"
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              🚀 Production API
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Real job processing endpoints
            </p>
          </a>
        </div>

        {/* Authentication */}
        <section id="authentication" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            All API requests must include your API key in the <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">x-api-key</code> header.
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Example Request</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
{`curl https://api.levqor.ai/api/sandbox/metrics \\
  -H "x-api-key: YOUR_API_KEY"`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Using JavaScript</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
{`const response = await fetch('https://api.levqor.ai/api/sandbox/metrics', {
  headers: {
    'x-api-key': process.env.LEVQOR_API_KEY
  }
});

const data = await response.json();
console.log(data);`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Using Python</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
{`import os
import requests

response = requests.get(
    'https://api.levqor.ai/api/sandbox/metrics',
    headers={'x-api-key': os.environ['LEVQOR_API_KEY']}
)

data = response.json()
print(data)`}
              </pre>
            </div>
          </div>
        </section>

        {/* Sandbox API */}
        <section id="sandbox" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Sandbox API
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Test your integration safely with mock data. All sandbox endpoints return fake responses.
          </p>

          <div className="space-y-8">
            {/* Get Metrics */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded font-mono text-sm">
                  GET
                </span>
                <code className="text-gray-900 dark:text-white font-mono">/api/sandbox/metrics</code>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                Get mock platform metrics
              </p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "ok": true,
  "metrics": {
    "jobs_completed": 1234,
    "jobs_queued": 5,
    "uptime_7d": 99.99,
    "uptime_30d": 99.95,
    "avg_response_time_ms": 120,
    "total_users": 567,
    "active_users_today": 89,
    "sandbox_mode": true
  }
}`}
              </pre>
            </div>

            {/* Create Job */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded font-mono text-sm">
                  POST
                </span>
                <code className="text-gray-900 dark:text-white font-mono">/api/sandbox/jobs</code>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                Create a mock job (no actual processing)
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Request Body:</p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "workflow": "data-enrichment",
  "payload": {
    "data": "your data here"
  }
}`}
                  </pre>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Response:</p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "ok": true,
  "job_id": "sandbox_550e8400-e29b-41d4-a716-446655440000",
  "status": "queued",
  "workflow": "data-enrichment",
  "message": "Sandbox job created (no actual processing)",
  "sandbox_mode": true
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Get Job */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded font-mono text-sm">
                  GET
                </span>
                <code className="text-gray-900 dark:text-white font-mono">/api/sandbox/jobs/:job_id</code>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                Get mock job status (always returns completed)
              </p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "ok": true,
  "job_id": "sandbox_550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "created_at": "2025-11-11T13:00:00Z",
  "completed_at": "2025-11-11T13:00:01Z",
  "result": {
    "message": "Sandbox job completed successfully",
    "data": {
      "processed": true,
      "items_enriched": 42,
      "cost_saved": 12.50
    }
  },
  "sandbox_mode": true
}`}
              </pre>
            </div>
          </div>
        </section>

        {/* Rate Limits */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Rate Limits
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Monthly Limit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Reset Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Sandbox
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    1,000 calls
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    1st of each month
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Pro
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    10,000 calls
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    1st of each month
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Enterprise
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    Unlimited
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    N/A
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> When you exceed your quota, you'll receive a 429 error with details about when your limit resets.
            </p>
          </div>
        </section>

        {/* Error Responses */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Error Responses
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">401 Unauthorized</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "error": "invalid_api_key"
}`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">429 Quota Exceeded</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "error": "quota_exceeded",
  "reset_at": "2025-12-01T00:00:00Z"
}`}
              </pre>
            </div>
          </div>
        </section>

        {/* OpenAPI Link */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Interactive API Explorer
          </h3>
          <p className="text-blue-800 dark:text-blue-200 mb-4">
            View the complete OpenAPI specification with interactive examples
          </p>
          <a
            href="https://api.levqor.ai/public/openapi.json"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            View OpenAPI Spec →
          </a>
        </div>
      </div>
    </div>
  );
}
