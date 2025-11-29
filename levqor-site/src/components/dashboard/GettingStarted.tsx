"use client";
import { useParams } from "next/navigation";
import Link from "next/link";

const STEPS = [
  {
    number: 1,
    title: "Pick a workflow template",
    description: "Browse our starter templates or build from scratch with AI assistance.",
    link: "/templates",
    linkText: "Browse templates",
  },
  {
    number: 2,
    title: "Capture your first lead or DFY request",
    description: "Track sales leads and Done-For-You service requests in your Revenue Inbox.",
    link: "/revenue",
    linkText: "Open Revenue Inbox",
  },
  {
    number: 3,
    title: "Review Guardian health",
    description: "Check your system health score and get AI-powered operational insights.",
    link: "/auth/status",
    linkText: "View system status",
  },
];

export default function GettingStarted() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Getting started</h2>
      <div className="space-y-4">
        {STEPS.map((step) => (
          <div key={step.number} className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
              {step.number}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{step.title}</h3>
              <p className="text-sm text-gray-600 mt-0.5">{step.description}</p>
              <Link 
                href={`/${locale}${step.link}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-1 inline-block"
              >
                {step.linkText} &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
