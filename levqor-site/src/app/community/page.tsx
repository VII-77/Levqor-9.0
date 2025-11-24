"use client";
import { useState } from "react";
import Link from "next/link";
import { designTokens } from "@/config/design-tokens";

type Badge = {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  requirement: string;
};

const badges: Badge[] = [
  { id: "badge-001", name: "First Workflow", icon: "🎯", description: "Created your first workflow", rarity: "Common", requirement: "Create 1 workflow" },
  { id: "badge-002", name: "10 Workflows", icon: "⚡", description: "Built 10 workflows", rarity: "Common", requirement: "Create 10 workflows" },
  { id: "badge-003", name: "Automation Master", icon: "🏆", description: "Completed 100 workflows", rarity: "Legendary", requirement: "Create 100 workflows" },
  { id: "badge-004", name: "Early Adopter", icon: "🚀", description: "Joined in the first month", rarity: "Epic", requirement: "Sign up in November 2025" },
  { id: "badge-005", name: "Community Helper", icon: "💬", description: "Helped 10+ community members", rarity: "Rare", requirement: "10 helpful answers" },
  { id: "badge-006", name: "Template Creator", icon: "📝", description: "Shared 5 workflow templates", rarity: "Rare", requirement: "Submit 5 templates" },
  { id: "badge-007", name: "Bug Hunter", icon: "🐛", description: "Reported 3 valid bugs", rarity: "Epic", requirement: "Report 3 bugs" },
  { id: "badge-008", name: "AI Pioneer", icon: "🤖", description: "Used AI workflow builder 50 times", rarity: "Epic", requirement: "50 AI-generated workflows" },
];

const discussions = [
  { id: 1, title: "How to automate complex multi-step approval flows?", author: "Sarah K.", replies: 12, likes: 24, category: "Q&A", timestamp: "2 hours ago" },
  { id: 2, title: "Sharing my customer onboarding workflow template", author: "Mike R.", replies: 8, likes: 45, category: "Templates", timestamp: "5 hours ago" },
  { id: 3, title: "Best practices for error handling in production workflows", author: "Alex T.", replies: 15, likes: 38, category: "Best Practices", timestamp: "1 day ago" },
  { id: 4, title: "Feature Request: Stripe to QuickBooks integration", author: "Emma L.", replies: 6, likes: 19, category: "Feature Requests", timestamp: "1 day ago" },
  { id: 5, title: "How I automated our entire sales pipeline (case study)", author: "David M.", replies: 23, likes: 67, category: "Success Stories", timestamp: "2 days ago" },
];

export default function CommunityPage() {
  const [selectedTab, setSelectedTab] = useState<"discussions" | "badges" | "submit">("discussions");

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common": return "bg-neutral-100 text-neutral-700 border-neutral-300";
      case "Rare": return "bg-primary-100 text-primary-700 border-primary-300";
      case "Epic": return "bg-secondary-100 text-secondary-700 border-secondary-300";
      case "Legendary": return "bg-warning-100 text-warning-700 border-warning-300";
      default: return "bg-neutral-100 text-neutral-700";
    }
  };

  return (
    <main className="min-h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-secondary-50/30 -z-10" />
      
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-6 text-center animate-fade-in-up">
          <div className="text-6xl mb-4">🌐</div>
          <h1 className="text-5xl font-bold mb-4">
            AI Operators Network
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Join thousands of automation experts sharing workflows, best practices, and success stories.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="max-w-6xl mx-auto px-6 -mt-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 grid md:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">2,547</div>
            <div className="text-sm text-neutral-600">Active Members</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-secondary-600 mb-2">843</div>
            <div className="text-sm text-neutral-600">Shared Workflows</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-success-600 mb-2">1,239</div>
            <div className="text-sm text-neutral-600">Discussions</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-warning-600 mb-2">156</div>
            <div className="text-sm text-neutral-600">Countries</div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-neutral-200">
          <button
            onClick={() => setSelectedTab("discussions")}
            className={`px-6 py-3 font-semibold transition-all ${
              selectedTab === "discussions"
                ? "text-primary-600 border-b-2 border-primary-600"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            💬 Discussions
          </button>
          <button
            onClick={() => setSelectedTab("badges")}
            className={`px-6 py-3 font-semibold transition-all ${
              selectedTab === "badges"
                ? "text-primary-600 border-b-2 border-primary-600"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            🏆 Badges & Achievements
          </button>
          <button
            onClick={() => setSelectedTab("submit")}
            className={`px-6 py-3 font-semibold transition-all ${
              selectedTab === "submit"
                ? "text-primary-600 border-b-2 border-primary-600"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            📤 Submit Workflow
          </button>
        </div>

        {/* Discussions Tab */}
        {selectedTab === "discussions" && (
          <div className="space-y-4 animate-fade-in-up">
            {discussions.map((discussion, index) => (
              <div
                key={discussion.id}
                className="bg-white rounded-xl p-6 border border-neutral-200 hover:shadow-lg transition-all group cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                        {discussion.category}
                      </span>
                      <span className="text-sm text-neutral-500">{discussion.timestamp}</span>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {discussion.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-neutral-600">
                      <span className="flex items-center gap-1">
                        <span>👤</span>
                        {discussion.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <span>💬</span>
                        {discussion.replies} replies
                      </span>
                      <span className="flex items-center gap-1">
                        <span>❤️</span>
                        {discussion.likes} likes
                      </span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-neutral-100 hover:bg-primary-100 text-neutral-700 hover:text-primary-700 rounded-lg text-sm font-medium transition-colors">
                    View →
                  </button>
                </div>
              </div>
            ))}

            <div className="text-center pt-8">
              <button className="px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all">
                Load More Discussions
              </button>
            </div>
          </div>
        )}

        {/* Badges Tab */}
        {selectedTab === "badges" && (
          <div className="animate-fade-in-up">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">Earn Badges & Level Up</h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Complete challenges, contribute to the community, and unlock exclusive badges.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {badges.map((badge, index) => (
                <div
                  key={badge.id}
                  className={`bg-white rounded-xl p-6 border-2 text-center hover:shadow-xl transition-all hover:-translate-y-1 ${getRarityColor(badge.rarity)}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="text-6xl mb-4">{badge.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{badge.name}</h3>
                  <div className="text-xs font-semibold mb-3 uppercase tracking-wide">
                    {badge.rarity}
                  </div>
                  <p className="text-sm mb-4">{badge.description}</p>
                  <p className="text-xs text-neutral-600 bg-white/50 rounded-lg p-2">
                    {badge.requirement}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Workflow Tab */}
        {selectedTab === "submit" && (
          <div className="animate-fade-in-up">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-neutral-200">
                <h2 className="text-3xl font-bold text-neutral-900 mb-6 text-center">
                  Share Your Workflow
                </h2>
                
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Workflow Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Lead Capture to CRM Automation"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describe what your workflow does and how it helps..."
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Category *
                      </label>
                      <select className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option>Sales</option>
                        <option>Marketing</option>
                        <option>Support</option>
                        <option>Operations</option>
                        <option>Finance</option>
                        <option>HR</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Difficulty *
                      </label>
                      <select className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Workflow JSON (optional)
                    </label>
                    <textarea
                      rows={6}
                      placeholder="Paste your workflow configuration here..."
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                    />
                  </div>

                  <div className="flex items-start gap-3">
                    <input type="checkbox" className="mt-1" />
                    <label className="text-sm text-neutral-600">
                      I confirm this is my original work and I grant Levqor permission to share it with the community
                    </label>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
                    >
                      Submit Workflow
                    </button>
                    <button
                      type="button"
                      className="px-8 py-4 border-2 border-neutral-300 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-50 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Join the Network</h2>
          <p className="text-xl mb-8 opacity-90">
            Connect with automation experts, share knowledge, and level up your skills.
          </p>
          <Link href="/signin" className="inline-block px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-neutral-50 transition-all shadow-lg">
            Get Started Free
          </Link>
        </div>
      </section>
    </main>
  );
}
