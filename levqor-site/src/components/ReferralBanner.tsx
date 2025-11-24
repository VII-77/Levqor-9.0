"use client";

import React, { useState } from "react";

export default function ReferralBanner() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [referralUrl, setReferralUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://api.levqor.ai";

  async function handleGenerate() {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setError(null);
    setLoading(true);
    setCopied(false);

    try {
      const res = await fetch(`${apiBase}/api/referrals/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to generate referral link");
      } else {
        setReferralUrl(data.referral_url);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (referralUrl) {
      navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 mt-6">
      <h3 className="text-lg font-semibold mb-2">🎁 Invite Friends, Earn Perks</h3>
      <p className="text-sm text-gray-700 mb-4">
        Share Levqor with friends and unlock rewards when they sign up.
      </p>

      {!referralUrl ? (
        <div>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? "Generating..." : "Generate Link"}
            </button>
          </div>
          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}
        </div>
      ) : (
        <div>
          <div className="flex gap-2">
            <input
              type="text"
              value={referralUrl}
              readOnly
              className="flex-1 px-3 py-2 border rounded-lg bg-white text-sm"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              {copied ? "✓ Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Share this link with friends. You'll earn rewards when they sign up!
          </p>
        </div>
      )}
    </div>
  );
}
