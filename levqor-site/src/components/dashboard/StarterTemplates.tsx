"use client";
import { useParams, useRouter } from "next/navigation";

const TEMPLATES = [
  {
    id: "agency-onboarding",
    title: "Agency onboarding pipeline",
    description: "Automate client intake, document collection, and project setup for new agency clients.",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    color: "blue",
  },
  {
    id: "client-reporting",
    title: "Client weekly reporting",
    description: "Generate and send automated weekly performance reports to your clients.",
    icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    color: "purple",
  },
  {
    id: "ops-health-check",
    title: "Internal ops health check",
    description: "Monitor key operational metrics and get alerts when things need attention.",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "green",
  },
];

const colorClasses: Record<string, { bg: string; text: string; hover: string }> = {
  blue: { bg: "bg-blue-100", text: "text-blue-600", hover: "hover:bg-blue-50" },
  purple: { bg: "bg-purple-100", text: "text-purple-600", hover: "hover:bg-purple-50" },
  green: { bg: "bg-green-100", text: "text-green-600", hover: "hover:bg-green-50" },
};

export default function StarterTemplates() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";

  const handleUseTemplate = (templateId: string) => {
    router.push(`/${locale}/builder?template=${templateId}`);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Starter templates</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {TEMPLATES.map((template) => {
          const colors = colorClasses[template.color] || colorClasses.blue;
          return (
            <div
              key={template.id}
              className={`border border-gray-200 rounded-lg p-4 ${colors.hover} transition-colors cursor-pointer group`}
              onClick={() => handleUseTemplate(template.id)}
            >
              <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center mb-3`}>
                <svg className={`w-5 h-5 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={template.icon} />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {template.title}
              </h3>
              <p className="text-sm text-gray-600">{template.description}</p>
              <button className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700">
                Use template &rarr;
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
