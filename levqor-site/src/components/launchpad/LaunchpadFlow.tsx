"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getApiBase } from '@/lib/api-config';

interface Props {
  userEmail: string;
  userName: string;
}

type BusinessType = "agency" | "ecommerce" | "coaching" | "local" | "other";

interface FormData {
  businessType: BusinessType | null;
  businessName: string;
  mainGoal: string;
  teamSize: string;
}

export default function LaunchpadFlow({ userEmail, userName }: Props) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    businessType: null,
    businessName: "",
    mainGoal: "",
    teamSize: "solo"
  });
  const [loading, setLoading] = useState(false);
  const [workflows, setWorkflows] = useState<Array<{ title: string; description: string }>>([]);
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const businessTypes: Array<{ id: BusinessType; label: string; icon: string; description: string }> = [
    { id: "agency", label: "Agency", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", description: "Marketing, dev, design agency" },
    { id: "ecommerce", label: "E-commerce", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z", description: "Online store or marketplace" },
    { id: "coaching", label: "Coaching", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z", description: "Consulting or coaching" },
    { id: "local", label: "Local Business", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z", description: "Restaurant, salon, service" },
    { id: "other", label: "Other", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z", description: "Something else" }
  ];

  const teamSizes = [
    { id: "solo", label: "Just me" },
    { id: "small", label: "2-5 people" },
    { id: "medium", label: "6-20 people" },
    { id: "large", label: "20+ people" }
  ];

  async function generateWorkflows() {
    setLoading(true);
    
    await new Promise((r) => setTimeout(r, 1500));
    
    const typeWorkflows: Record<BusinessType, Array<{ title: string; description: string }>> = {
      agency: [
        { title: "Client Onboarding Pipeline", description: "Automate intake forms, document collection, and project setup for new clients." },
        { title: "Weekly Client Reporting", description: "Generate and send automated weekly performance reports to all clients." }
      ],
      ecommerce: [
        { title: "Order Fulfillment Tracker", description: "Monitor orders, update customers, and flag delayed shipments automatically." },
        { title: "Review Request Automation", description: "Send follow-up emails requesting reviews after successful deliveries." }
      ],
      coaching: [
        { title: "Session Booking & Reminder", description: "Automate session scheduling, reminders, and follow-up materials." },
        { title: "Client Progress Tracker", description: "Track milestones and send automated check-ins between sessions." }
      ],
      local: [
        { title: "Appointment Reminder System", description: "Send SMS/email reminders for upcoming appointments automatically." },
        { title: "Review Generation Workflow", description: "Request reviews from happy customers post-visit." }
      ],
      other: [
        { title: "Task Automation Pipeline", description: "Automate repetitive tasks based on triggers you define." },
        { title: "Data Sync & Notification", description: "Keep data in sync across tools and notify team of important changes." }
      ]
    };

    setWorkflows(typeWorkflows[formData.businessType || "other"]);
    setLoading(false);
    setStep(4);
  }

  async function handleComplete(mode: "diy" | "dfy") {
    setLoading(true);
    
    try {
      await fetch(`${getApiBase()}/api/system/onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          data: {
            ...formData,
            has_seen_launchpad: true,
            completed_at: new Date().toISOString(),
            preferred_mode: mode
          }
        })
      });

      if (mode === "dfy") {
        await fetch(`${getApiBase()}/api/revenue/dfy-request`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userEmail,
            name: userName || formData.businessName,
            business_type: formData.businessType,
            request_type: "launchpad",
            description: `${formData.mainGoal}. Workflows: ${workflows.map(w => w.title).join(", ")}`
          })
        });
      }

      router.push(`/${locale}/dashboard`);
    } catch (err) {
      console.error("Complete error:", err);
      router.push(`/${locale}/dashboard`);
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to Levqor</h1>
        <p className="text-gray-600 mt-2">Let's set up your AI-powered automation in 2 minutes</p>
      </div>

      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`w-3 h-3 rounded-full transition-colors ${
              s === step ? "bg-blue-600" : s < step ? "bg-blue-300" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">What type of business are you?</h2>
          <p className="text-gray-500 mb-6">This helps us recommend the right workflow templates</p>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {businessTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setFormData({ ...formData, businessType: type.id });
                  setStep(2);
                }}
                className={`p-4 rounded-lg border-2 text-left transition-all hover:border-blue-500 hover:bg-blue-50 ${
                  formData.businessType === type.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={type.icon} />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{type.label}</div>
                    <div className="text-sm text-gray-500">{type.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Tell us more</h2>
          <p className="text-gray-500 mb-6">Help us personalize your experience</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business name</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="Acme Agency"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team size</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {teamSizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setFormData({ ...formData, teamSize: size.id })}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      formData.teamSize === size.id
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">What's your main goal?</h2>
          <p className="text-gray-500 mb-6">What would you like Levqor to help you automate first?</p>
          
          <textarea
            value={formData.mainGoal}
            onChange={(e) => setFormData({ ...formData, mainGoal: e.target.value })}
            placeholder="E.g., I want to automate client onboarding and weekly reporting..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Back
            </button>
            <button
              onClick={generateWorkflows}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
            >
              {loading ? "AI is thinking..." : "Generate Recommendations"}
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Here's what we recommend</h2>
            <p className="text-gray-500">Based on your answers, these workflows would be perfect for you</p>
          </div>

          <div className="space-y-4 mb-8">
            {workflows.map((wf, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-gray-900">{wf.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{wf.description}</p>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleComplete("diy")}
              disabled={loading}
              className="p-4 border-2 border-blue-500 rounded-lg text-left hover:bg-blue-50 transition-colors"
            >
              <div className="font-semibold text-blue-700">Build it myself (DIY)</div>
              <div className="text-sm text-gray-600 mt-1">Use our AI builder to create these workflows step by step</div>
            </button>
            
            <button
              onClick={() => handleComplete("dfy")}
              disabled={loading}
              className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-left text-white hover:from-purple-700 hover:to-blue-700 transition-colors"
            >
              <div className="font-semibold">Done-For-You (DFY)</div>
              <div className="text-sm text-white/80 mt-1">Our team builds these workflows for you. We'll reach out shortly.</div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
