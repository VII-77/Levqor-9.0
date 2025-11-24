"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { designTokens } from "@/config/design-tokens";

type DailyWorkflow = {
  date: string;
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  aiPrompt: string;
  steps: string[];
  benefits: string[];
  useCases: string[];
  shareCount: number;
  likeCount: number;
};

const getDailyWorkflow = (): DailyWorkflow => {
  const workflows: Omit<DailyWorkflow, 'date' | 'shareCount' | 'likeCount'>[] = [
    {
      id: "daily-001",
      name: "Smart Email Triage & Auto-Response",
      description: "Automatically categorize incoming emails and send smart auto-replies based on content",
      longDescription: "This workflow uses AI to analyze incoming emails, categorize them by urgency and topic, and automatically send contextual responses to common queries. It saves hours of manual email sorting and ensures timely responses to important messages.",
      category: "Productivity",
      difficulty: "Intermediate",
      estimatedTime: "15 mins to set up",
      aiPrompt: "When an email arrives in my inbox, analyze the subject and content to determine if it's urgent, informational, or actionable. If it matches common queries (pricing, support, general info), send an appropriate auto-response. Otherwise, categorize it and add a label.",
      steps: [
        "Connect your Gmail or Outlook account",
        "Define email categories (Urgent, Sales, Support, General)",
        "Create auto-response templates for common queries",
        "Set up AI classification rules",
        "Configure notification preferences",
        "Test with sample emails"
      ],
      benefits: [
        "Save 2-3 hours per day on email management",
        "Never miss urgent messages",
        "Instant responses to common questions",
        "Clean, organized inbox automatically"
      ],
      useCases: [
        "Customer support teams handling high email volume",
        "Sales teams managing inbound leads",
        "Executives with overflowing inboxes",
        "Anyone wanting better email work-life balance"
      ]
    },
    {
      id: "daily-002",
      name: "Weekly Team Performance Dashboard",
      description: "Aggregate team metrics from multiple tools into a beautiful weekly summary",
      longDescription: "Pull data from project management tools, CRM, support systems, and analytics platforms to create a comprehensive weekly performance dashboard. Automatically generated and sent every Monday morning.",
      category: "Reporting",
      difficulty: "Advanced",
      estimatedTime: "30 mins to set up",
      aiPrompt: "Every Monday at 9am, collect data from Jira (tickets closed), Salesforce (deals won), Intercom (support volume), and Google Analytics (website traffic). Generate a visual dashboard PDF and email it to all managers.",
      steps: [
        "Connect data sources (Jira, Salesforce, Intercom, Analytics)",
        "Define key performance metrics to track",
        "Design dashboard layout and visualizations",
        "Set up automated weekly schedule",
        "Configure email distribution list",
        "Review first report and refine"
      ],
      benefits: [
        "Complete team visibility in one place",
        "No more manual report compilation",
        "Data-driven decision making",
        "Celebrate wins automatically"
      ],
      useCases: [
        "Team leads needing weekly status updates",
        "C-suite executives tracking company KPIs",
        "Department managers coordinating across teams",
        "Remote teams staying aligned"
      ]
    },
    {
      id: "daily-003",
      name: "Social Proof Notification System",
      description: "Display real-time customer activity notifications on your website",
      longDescription: "Show subtle notifications when customers sign up, make purchases, or complete actions on your site. Creates FOMO and social proof to boost conversions. All data is real and pulled from your actual systems.",
      category: "Marketing",
      difficulty: "Beginner",
      estimatedTime: "20 mins to set up",
      aiPrompt: "When a customer signs up or makes a purchase in Stripe, send the event to my website widget to display 'Sarah from London just signed up' style notifications. Limit to 1 per minute to avoid spam.",
      steps: [
        "Connect Stripe or your payment platform",
        "Install notification widget on your website",
        "Define trigger events (signups, purchases, trials)",
        "Customize notification templates",
        "Set display frequency and position",
        "Test with sample events"
      ],
      benefits: [
        "Increase conversion rates by 15-25%",
        "Build trust with real social proof",
        "No coding required for setup",
        "Works on any website platform"
      ],
      useCases: [
        "E-commerce stores showing recent purchases",
        "SaaS products highlighting new signups",
        "Course platforms showing enrollments",
        "Service businesses displaying bookings"
      ]
    }
  ];

  const dayIndex = new Date().getDate() % workflows.length;
  const selectedWorkflow = workflows[dayIndex];
  
  return {
    ...selectedWorkflow,
    date: new Date().toISOString().split('T')[0],
    shareCount: Math.floor(Math.random() * 200) + 50,
    likeCount: Math.floor(Math.random() * 500) + 100
  };
};

export default function WorkflowOfTheDayPage() {
  const [workflow, setWorkflow] = useState<DailyWorkflow | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setWorkflow(getDailyWorkflow());
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Workflow of the Day: ${workflow?.name}`,
        text: workflow?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!workflow) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-success-100 text-success-700";
      case "Intermediate": return "bg-warning-100 text-warning-700";
      case "Advanced": return "bg-error-100 text-error-700";
      default: return "bg-neutral-100 text-neutral-700";
    }
  };

  return (
    <main className="min-h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-secondary-50/30 -z-10" />
      
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-6 text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Featured Today
          </div>
          <h1 className="text-5xl font-bold mb-4">
            Workflow of the Day
          </h1>
          <p className="text-xl opacity-90">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        {/* Workflow Header */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="p-8">
            {/* Title & Metadata */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(workflow.difficulty)}`}>
                  {workflow.difficulty}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
                  {workflow.category}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-neutral-100 text-neutral-700">
                  ⏱ {workflow.estimatedTime}
                </span>
              </div>
              
              <h2 className="text-4xl font-bold text-neutral-900 mb-4">
                {workflow.name}
              </h2>
              
              <p className="text-xl text-neutral-600 leading-relaxed">
                {workflow.description}
              </p>
            </div>

            {/* Social Stats */}
            <div className="flex items-center gap-6 pb-6 border-b border-neutral-200">
              <button className="flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors">
                <span className="text-2xl">❤️</span>
                <span className="font-medium">{workflow.likeCount}</span>
              </button>
              <button onClick={handleShare} className="flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors">
                <span className="text-2xl">📤</span>
                <span className="font-medium">{workflow.shareCount} {copied ? "(Copied!)" : ""}</span>
              </button>
              <span className="flex items-center gap-2 text-neutral-600">
                <span className="text-2xl">👁️</span>
                <span className="font-medium">{Math.floor(workflow.likeCount * 3.2)} views</span>
              </span>
            </div>

            {/* Long Description */}
            <div className="py-6">
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">How It Works</h3>
              <p className="text-neutral-700 leading-relaxed text-lg">
                {workflow.longDescription}
              </p>
            </div>

            {/* AI Prompt */}
            <div className="bg-gradient-to-br from-secondary-50 to-primary-50 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🤖</span>
                <h3 className="text-xl font-bold text-neutral-900">Natural Language Prompt</h3>
              </div>
              <p className="text-neutral-700 leading-relaxed italic">
                "{workflow.aiPrompt}"
              </p>
              <button className="mt-4 px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all">
                Use This Prompt →
              </button>
            </div>

            {/* Setup Steps */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">Setup Steps</h3>
              <ol className="space-y-3">
                {workflow.steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="text-neutral-700 pt-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Benefits */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">Key Benefits</h3>
              <ul className="grid md:grid-cols-2 gap-3">
                {workflow.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-success-500 text-xl">✓</span>
                    <span className="text-neutral-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Use Cases */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">Perfect For</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {workflow.useCases.map((useCase, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-neutral-50 rounded-lg">
                    <span className="text-primary-500">→</span>
                    <span className="text-neutral-700">{useCase}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link href="/workflows/library" className="px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all">
                Build This Workflow
              </Link>
              <Link href="/workflows/ai-create" className="px-8 py-4 border-2 border-primary-600 text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-all">
                Customize with AI
              </Link>
              <button onClick={handleShare} className="px-8 py-4 border-2 border-neutral-300 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-50 transition-all">
                Share This Workflow
              </button>
            </div>
          </div>
        </div>

        {/* Challenge Banner */}
        <div className="mt-8 bg-gradient-to-r from-warning-500 to-warning-600 rounded-2xl p-8 text-white text-center animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-3xl font-bold mb-3">100 Workflow Challenge</h3>
          <p className="text-lg mb-6 opacity-90">
            Build 100 workflows and earn your Automation Master badge!
          </p>
          <Link href="/workflows/library" className="inline-block px-8 py-4 bg-white text-warning-600 rounded-xl font-semibold hover:bg-neutral-50 transition-all shadow-lg">
            Start Challenge
          </Link>
        </div>

        {/* Archive Link */}
        <div className="mt-8 text-center">
          <Link href="/workflows/library" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Browse All Workflows
          </Link>
        </div>
      </section>
    </main>
  );
}
