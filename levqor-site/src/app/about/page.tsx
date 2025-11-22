import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Levqor",
  description: "Learn more about Levqor and our mission to automate work and ship faster.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 space-y-8">
      <h1 className="text-4xl font-bold text-gray-900">About Levqor</h1>
      
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p className="text-lg">
          Levqor is an automation platform focused on helping teams ship safer, faster releases
          with built-in governance, monitoring, and AI-assisted workflows.
        </p>
        
        <p>
          We believe that modern teams shouldn&apos;t waste time on repetitive tasks or manual processes.
          Our platform combines the power of workflow automation with intelligent monitoring and self-healing
          capabilities, allowing you to focus on what matters most—building great products.
        </p>
        
        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Our Mission</h2>
        <p>
          To empower teams worldwide with automation tools that are reliable, secure, and simple to use.
          We&apos;re building the infrastructure that lets businesses scale without the operational overhead.
        </p>
        
        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Why Levqor?</h2>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Self-healing workflows that detect and recover from failures automatically</li>
          <li>Enterprise-grade security with 99.9% SLA guarantees</li>
          <li>Deep integrations with 50+ popular tools and services</li>
          <li>AI-powered insights and optimization recommendations</li>
          <li>Pay only for what you use—no hidden fees or surprises</li>
        </ul>
        
        <p className="text-sm text-gray-500 mt-12 italic">
          This page is an early version. We&apos;ll continue expanding it with our story, team details, and product roadmap.
        </p>
      </div>
    </main>
  );
}
