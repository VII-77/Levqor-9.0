"use client";
import { useState } from "react";
import Link from "next/link";

const FAQ_ITEMS = [
  {
    q: "How do I create my first workflow?",
    a: "Click 'Create Workflow' in your dashboard, choose a template or start from scratch, and connect your apps."
  },
  {
    q: "What are workflow runs?",
    a: "A run is each time your workflow executes. Your plan includes a monthly limit of runs."
  },
  {
    q: "How do AI credits work?",
    a: "AI credits are consumed when using AI-powered features like smart routing or content generation."
  },
  {
    q: "Can I upgrade or downgrade my plan?",
    a: "Yes! Change plans anytime from your billing settings. Changes take effect immediately."
  },
];

export default function HelpPanel() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-black text-white p-4 rounded-full shadow-lg hover:bg-gray-800 transition z-40"
        aria-label="Help"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Help & Support</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  {FAQ_ITEMS.map((item, idx) => (
                    <div key={idx} className="border-b pb-3">
                      <div className="font-medium text-sm mb-1">{item.q}</div>
                      <div className="text-sm text-gray-600">{item.a}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Need More Help?</h3>
                <div className="space-y-2 text-sm">
                  <Link href="/support" className="block text-blue-600 hover:underline">
                    → Contact Support
                  </Link>
                  <Link href="/docs" className="block text-blue-600 hover:underline">
                    → View Documentation
                  </Link>
                  <a
                    href="https://api.levqor.ai/health"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-600 hover:underline"
                  >
                    → System Status
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
