"use client";
import { useState } from "react";

type ReferralInviteProps = {
  context: "dashboard" | "pricing" | "library";
};

export default function ReferralInvite({ context }: ReferralInviteProps) {
  const [invitedEmail, setInvitedEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invitedEmail.trim() || !invitedEmail.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address");
      return;
    }

    setStatus("sending");
    setMessage("");

    const referrerEmail = localStorage.getItem("user_email") || "demo@levqor.ai";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.levqor.ai";

    try {
      const response = await fetch(`${apiUrl}/api/referrals/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          referrer_email: referrerEmail,
          invited_email: invitedEmail,
          source: context,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus("success");
        setMessage("Invite sent! Your teammate will receive our welcome.");
        setInvitedEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to send invite. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Network error. Please check your connection.");
    }
  };

  const getContextText = () => {
    switch (context) {
      case "dashboard":
        return {
          title: "Invite a teammate",
          body: "Grow your automation capacity by bringing colleagues into the Levqor ecosystem.",
        };
      case "pricing":
        return {
          title: "Invite a friend",
          body: "Share Levqor with your network and accelerate your automation journey together.",
        };
      case "library":
        return {
          title: "Share with your team",
          body: "Invite team members to collaborate on workflow automation.",
        };
      default:
        return {
          title: "Invite a teammate",
          body: "Accelerate your automation journey together.",
        };
    }
  };

  const contextText = getContextText();

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 mt-4">
      <h3 className="text-lg font-semibold text-slate-100 mb-2">
        {contextText.title}
      </h3>
      <p className="text-sm text-slate-400 mb-4 leading-relaxed">
        {contextText.body}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="email"
            placeholder="colleague@company.com"
            value={invitedEmail}
            onChange={(e) => setInvitedEmail(e.target.value)}
            disabled={status === "sending"}
            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-md text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={status === "sending"}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "sending" ? "Sending..." : "Send invite"}
        </button>

        {message && (
          <p className={`mt-3 text-sm ${status === "success" ? "text-green-400" : "text-red-400"}`}>
            {message}
          </p>
        )}
      </form>

      <p className="mt-4 text-xs text-slate-500 leading-snug">
        Note: This is a courtesy invitation system. No discounts or credits are automatically applied.
        Pricing and trial terms remain as published on our pricing page.
      </p>
    </div>
  );
}
