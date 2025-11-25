import { NextRequest, NextResponse } from "next/server";

const KNOWLEDGE_BASE: Record<string, string> = {
  pricing: "Levqor offers simple, transparent pricing starting at just £9/month for the Starter plan. We also have Growth (£29/month), Business (£59/month), and Scale (£149/month) plans. All plans include a 7-day free trial with no credit card required.",
  trial: "Yes! We offer a 7-day free trial on all plans. No credit card required to start. You can explore all features and decide which plan works best for you.",
  templates: "We have 50+ pre-built workflow templates across categories like Marketing, Sales, Operations, HR, Finance, Customer Success, Data & Analytics, and IT/DevOps. You can start with any template and customize it with AI.",
  builder: "Our AI Workflow Builder lets you describe what you want to automate in plain English. Just tell us what triggers your workflow and what actions you want, and our AI generates the complete workflow for you.",
  support: "Support varies by plan:\n• Starter: Email support (48h response)\n• Growth: Email support (24h response)\n• Business: Priority email + chat (12h response)\n• Scale: Dedicated support (4h response, phone access)",
  integrations: "Levqor integrates with 100+ apps including Gmail, Slack, Google Sheets, Salesforce, HubSpot, Stripe, Zapier, and more. We're constantly adding new integrations based on customer requests.",
  security: "Security is our top priority. We offer enterprise-grade encryption, SOC 2 Type II compliance, GDPR compliance, and optional SSO/SAML for business plans. All data is encrypted at rest and in transit.",
  "self-healing": "Self-healing means your workflows automatically recover from failures. Levqor monitors every execution, retries failed steps with exponential backoff, and alerts you only when human intervention is needed.",
  workflows: "A workflow is an automated sequence of actions triggered by an event. For example: 'When I receive an email with an invoice, extract the data and log it in my spreadsheet.' Levqor runs these 24/7 without you having to do anything.",
  started: "Getting started is easy:\n1. Sign up for a free 7-day trial\n2. Browse our template gallery or describe what you want to automate\n3. Our AI builds your workflow\n4. Deploy with one click\n\nNo coding required!",
};

function findBestMatch(message: string): string | null {
  const lower = message.toLowerCase();
  
  const keywordMap: Record<string, string[]> = {
    pricing: ["price", "cost", "pricing", "how much", "pay", "£", "$", "dollar", "pound", "plans"],
    trial: ["trial", "free", "try", "test", "demo"],
    templates: ["template", "pre-built", "example", "gallery", "browse"],
    builder: ["builder", "create", "build", "make", "ai", "generate"],
    support: ["support", "help", "contact", "response time", "sla"],
    integrations: ["integration", "connect", "app", "tool", "slack", "email", "salesforce"],
    security: ["security", "secure", "safe", "gdpr", "soc", "compliance", "encrypt"],
    "self-healing": ["self-healing", "retry", "fail", "error", "recover", "monitor"],
    workflows: ["workflow", "automation", "automate", "what is"],
    started: ["start", "begin", "getting started", "how to", "sign up"],
  };

  for (const [topic, keywords] of Object.entries(keywordMap)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return KNOWLEDGE_BASE[topic];
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 500));

    const match = findBestMatch(message);
    
    if (match) {
      return NextResponse.json({ reply: match });
    }

    const defaultReplies = [
      "I'm here to help you with Levqor! You can ask me about:\n\n• Pricing and plans\n• How to get started\n• Template gallery\n• AI workflow builder\n• Integrations\n• Security & compliance\n\nWhat would you like to know more about?",
      "Great question! I specialize in helping you understand Levqor's automation platform. Try asking about our pricing, templates, or how to build your first workflow.",
      "I'd be happy to help! I can explain our features, pricing, or help you find the right template. What's on your mind?",
    ];

    const randomReply = defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
    return NextResponse.json({ reply: randomReply });
  } catch (error) {
    console.error("Concierge error:", error);
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
  }
}
