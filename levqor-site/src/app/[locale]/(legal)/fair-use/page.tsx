import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Fair Use Policy",
  description: "Levqor's fair use policy - responsible usage guidelines for automation workflows and API access.",
};

export default function FairUsePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 space-y-8">
      <h1 className="text-4xl font-bold text-gray-900">Fair Use Policy</h1>
      
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p className="text-lg">
          Levqor is committed to providing reliable, high-quality automation services to all customers.
          This Fair Use Policy ensures that all users can enjoy consistent performance and availability.
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6">
          <p className="font-semibold text-blue-900 mb-2">Our Philosophy</p>
          <p className="text-blue-800">
            We believe in generous limits and transparent usage. Our fair use policy is designed to
            prevent abuse while giving legitimate users the freedom to build powerful automation workflows.
          </p>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900 mt-8">What is Fair Use?</h2>
        <p>
          Fair use means using Levqor services in a manner consistent with normal business operations
          and automation needs, without degrading service quality for other users or violating our terms.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Acceptable Use</h2>
        <p>Examples of acceptable use include:</p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Automating routine business processes (email notifications, data syncing, reporting)</li>
          <li>Connecting multiple tools and services for workflow automation</li>
          <li>Running scheduled jobs and background tasks</li>
          <li>Processing customer data and generating insights</li>
          <li>Integration testing and development workflows</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Prohibited Activities</h2>
        <p>The following activities are not considered fair use and may result in account suspension:</p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Excessive API requests:</strong> Intentionally overwhelming our API with unnecessary requests</li>
          <li><strong>Resource hogging:</strong> Running workflows designed to consume excessive compute resources</li>
          <li><strong>Reselling or sublicensing:</strong> Using your account to provide automation services to third parties</li>
          <li><strong>Malicious activity:</strong> Using Levqor to spam, scrape, or attack other services</li>
          <li><strong>Circumventing limits:</strong> Creating multiple accounts to bypass usage restrictions</li>
          <li><strong>Unauthorized access:</strong> Attempting to access other users' data or system resources</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Usage Limits</h2>
        <p>
          While we don't impose strict hard limits on most operations, we reserve the right to
          temporarily throttle or suspend accounts exhibiting unusual usage patterns that may impact
          platform performance.
        </p>

        <div className="bg-gray-100 rounded-lg p-6 my-6">
          <h3 className="font-semibold text-gray-900 mb-3">Typical Usage Thresholds</h3>
          <ul className="space-y-2 text-gray-700">
            <li><strong>Workflow executions:</strong> Based on your plan tier</li>
            <li><strong>API rate limits:</strong> 1000 requests per minute (adjustable for Enterprise)</li>
            <li><strong>Data storage:</strong> Reasonable retention based on active workflows</li>
            <li><strong>Concurrent workflows:</strong> Up to 50 simultaneous executions (higher for paid plans)</li>
          </ul>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Monitoring and Enforcement</h2>
        <p>
          We monitor platform usage to ensure fair access for all users. If we detect usage patterns
          that violate this policy, we will:
        </p>

        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li>Contact you to discuss the issue and find a resolution</li>
          <li>Provide guidance on optimizing your workflows for better performance</li>
          <li>Temporarily throttle requests if necessary to protect platform stability</li>
          <li>In severe cases, suspend account access until the issue is resolved</li>
        </ol>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Need Higher Limits?</h2>
        <p>
          If your legitimate business needs exceed our standard limits, we're happy to work with you.
          Contact our sales team at <a href="mailto:sales@levqor.ai" className="text-blue-600 hover:underline">sales@levqor.ai</a> to
          discuss Enterprise plans with custom limits and dedicated resources.
        </p>

        <div className="bg-green-50 rounded-xl p-8 mt-12">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Questions About Fair Use?</h3>
          <p className="text-gray-700 mb-4">
            We're here to help you use Levqor effectively and fairly. Reach out if you're unsure about
            whether your use case complies with this policy.
          </p>
          <Link href="/contact" className="text-blue-600 hover:underline font-medium">
            Contact Support →
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-12 italic">
          This Fair Use Policy is part of our <Link href="/terms" className="underline">Terms of Service</Link>. Last updated: November 2025.
        </p>
      </div>
    </main>
  );
}
