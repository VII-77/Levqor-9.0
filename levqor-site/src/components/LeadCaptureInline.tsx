"use client";
import { useState } from "react";
import { getApiBase } from '@/lib/api-config';

const API_BASE = getApiBase();

type LeadCaptureInlineProps = {
  source?: string;
};

export default function LeadCaptureInline({ source = "inline_capture" }: LeadCaptureInlineProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await fetch(`${API_BASE}/api/marketing/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source,
          timestamp: new Date().toISOString()
        })
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Lead capture failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-3xl mb-2">✓</div>
        <p className="text-green-800 font-medium">Thanks! We'll be in touch soon.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
      <h3 className="text-xl font-bold mb-2">Ready to automate your workflows?</h3>
      <p className="text-gray-700 mb-4">Get started with a free trial or speak to our team.</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          placeholder="Enter your work email"
          required
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium disabled:opacity-50"
        >
          {loading ? "..." : "Get Started"}
        </button>
      </form>
      <p className="text-xs text-gray-500 mt-2">
        7-day free trial · No credit card required for inquiry
      </p>
    </div>
  );
}
