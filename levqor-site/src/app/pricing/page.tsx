"use client";
import { useState } from "react";

type Term = "monthly" | "yearly";
type Tier = "starter" | "launch" | "growth" | "agency";

const plans = {
  starter: {
    monthly: 9,
    yearly: 90,
    workflows: 5,
    runs: "2,000",
    speed: "Standard",
    users: 1,
    connectors: "Core only",
    aiCredits: "1,000",
    support: "Email",
    features: ["5 workflows", "2,000 runs/mo", "1 user", "Core connectors", "1,000 AI credits", "Email support"]
  },
  launch: {
    monthly: 29,
    yearly: 290,
    workflows: 20,
    runs: "10,000",
    speed: "Fast",
    users: 3,
    connectors: "Core + Beta",
    aiCredits: "5,000",
    support: "Priority Email",
    features: ["20 workflows", "10,000 runs/mo", "3 users", "Core + Beta connectors", "5,000 AI credits", "Priority email support"]
  },
  growth: {
    monthly: 59,
    yearly: 590,
    workflows: 100,
    runs: "50,000",
    speed: "Faster",
    users: 5,
    connectors: "All (incl. Beta)",
    aiCredits: "20,000",
    support: "Priority",
    trial: true,
    features: ["100 workflows", "50,000 runs/mo", "5 users", "All connectors", "20,000 AI credits", "Priority support", "7-day free trial"]
  },
  agency: {
    monthly: 149,
    yearly: 1490,
    workflows: 500,
    runs: "250,000",
    speed: "Fastest",
    users: 15,
    connectors: "All + SSO",
    aiCredits: "100,000",
    support: "4-hr SLA",
    trial: true,
    features: ["500 workflows", "250,000 runs/mo", "15 users", "All connectors + SSO", "100,000 AI credits", "4-hour SLA", "7-day free trial"]
  }
};

const availableConnectors = ["Gmail", "Google Sheets", "Slack", "Discord", "Notion", "Webhooks", "Stripe"];
const comingSoonConnectors = [
  { name: "Salesforce", eta: "Q4 2025" },
  { name: "HubSpot", eta: "Q4 2025" },
  { name: "Shopify", eta: "Q1 2026" },
  { name: "Xero", eta: "Q1 2026" },
  { name: "QuickBooks", eta: "Q1 2026" },
  { name: "Zendesk", eta: "Q1 2026" },
  { name: "MS Teams", eta: "Q1 2026" }
];

function DFYCard({
  pack, title, price, features, badge
}: { pack: string; title: string; price: number; features: string[]; badge?: string }) {
  
  const handleClick = async () => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ 
          purchase_type: "dfy",
          dfy_pack: pack
        })
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        console.error("DFY Checkout error:", data.error);
        alert("Checkout failed. Please try again or contact support.");
      }
    } catch (err) {
      console.error("DFY Checkout error:", err);
      alert("Checkout failed. Please try again or contact support.");
    }
  };

  return (
    <div className="rounded-2xl border p-6 shadow grid gap-4 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{title}</h3>
        {badge && <span className="text-xs rounded-full px-3 py-1 bg-blue-600 text-white font-medium">{badge}</span>}
      </div>
      <div className="text-3xl font-bold text-blue-600">
        £{price}
        <span className="text-base font-normal text-gray-600"> one-time</span>
      </div>
      <ul className="text-sm space-y-2 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-blue-600">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={handleClick}
        className="rounded-xl border border-blue-600 bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition-colors font-medium"
      >
        Purchase Now
      </button>
    </div>
  );
}

function Card({
  tier, title, price, per, features, badge, trial, term
}: { tier: Tier; title: string; price: number; per: string; features: string[]; badge?: string; trial?: boolean; term: Term }) {
  
  const handleClick = async () => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ 
          purchase_type: "subscription",
          tier: tier, 
          billing_interval: term === "yearly" ? "year" : "month"
        })
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        console.error("Checkout error:", data.error);
        alert("Checkout failed. Please try again or contact support.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Checkout failed. Please try again or contact support.");
    }
  };

  return (
    <div className="rounded-2xl border p-6 shadow grid gap-4 bg-white hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{title}</h3>
        {badge && <span className="text-xs rounded-full px-3 py-1 bg-black text-white font-medium">{badge}</span>}
      </div>
      <div className="text-3xl font-bold">
        £{price}
        <span className="text-base font-normal text-gray-600">/{per}</span>
      </div>
      {trial && <div className="text-sm text-green-600 font-medium">✓ 7-day free trial</div>}
      <ul className="text-sm space-y-2 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={handleClick}
        className="rounded-xl border border-black bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors font-medium"
      >
        {trial ? "Start 7-Day Trial" : "Get Started"}
      </button>
    </div>
  );
}

function NotifyModal({ connector, eta, onClose }: { connector: string; eta: string; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/notify-coming-soon", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, connector })
      });
      setSubmitted(true);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      console.error("Notify error:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        {submitted ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">✓</div>
            <p className="font-medium">Thanks! We'll notify you when {connector} is ready.</p>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-semibold mb-2">Notify me: {connector}</h3>
            <p className="text-sm text-gray-600 mb-4">Expected: {eta}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800"
                >
                  Notify Me
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [term, setTerm] = useState<Term>("monthly");
  const [notifyModal, setNotifyModal] = useState<{ connector: string; eta: string } | null>(null);

  return (
    <main className="mx-auto max-w-6xl p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3">Simple, transparent pricing</h1>
        <p className="text-gray-600 mb-2">Choose the plan that fits your automation needs</p>
        <p className="text-sm">
          <span className="text-gray-500">7-day free trial on Growth & Agency. Cancel anytime. </span>
          <a href="#faqs" className="text-blue-600 hover:underline">Jump to FAQs →</a>
        </p>
      </div>

      {/* Monthly/Yearly Toggle */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <button
          className={"px-6 py-2 rounded-xl border font-medium transition-colors " + (term === "monthly" ? "bg-black text-white" : "hover:bg-gray-50")}
          onClick={() => setTerm("monthly")}
        >
          Monthly
        </button>
        <button
          className={"px-6 py-2 rounded-xl border font-medium transition-colors " + (term === "yearly" ? "bg-black text-white" : "hover:bg-gray-50")}
          onClick={() => setTerm("yearly")}
        >
          Yearly
        </button>
        {term === "yearly" && (
          <span className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
            Save 2 months
          </span>
        )}
      </div>

      {/* Subscription Pricing Cards */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Subscription Plans</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card
            tier="starter"
            title="Starter"
            price={term === "yearly" ? plans.starter.yearly : plans.starter.monthly}
            per={term === "yearly" ? "yr" : "mo"}
            features={plans.starter.features}
            term={term}
          />
          <Card
            tier="launch"
            title="Launch"
            price={term === "yearly" ? plans.launch.yearly : plans.launch.monthly}
            per={term === "yearly" ? "yr" : "mo"}
            features={plans.launch.features}
            badge="Most Popular"
            term={term}
          />
          <Card
            tier="growth"
            title="Growth"
            price={term === "yearly" ? plans.growth.yearly : plans.growth.monthly}
            per={term === "yearly" ? "yr" : "mo"}
            features={plans.growth.features}
            trial={plans.growth.trial}
            term={term}
          />
          <Card
            tier="agency"
            title="Agency"
            price={term === "yearly" ? plans.agency.yearly : plans.agency.monthly}
            per={term === "yearly" ? "yr" : "mo"}
            features={plans.agency.features}
            badge="Best Value"
            trial={plans.agency.trial}
            term={term}
          />
        </div>
      </div>

      {/* Done-For-You Packages */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-center">Done-For-You Packages</h2>
        <p className="text-center text-gray-600 mb-6">One-time payment for complete setup and configuration</p>
        <div className="grid gap-6 md:grid-cols-3">
          <DFYCard
            pack="dfy_starter"
            title="DFY Starter"
            price={149}
            features={[
              "Complete workflow setup",
              "Basic automation templates",
              "Email integration",
              "1-hour consultation",
              "2 weeks support"
            ]}
          />
          <DFYCard
            pack="dfy_professional"
            title="DFY Professional"
            price={299}
            badge="Popular"
            features={[
              "Advanced workflow setup",
              "Custom automation design",
              "Multiple integrations",
              "2-hour consultation",
              "1 month priority support",
              "Documentation included"
            ]}
          />
          <DFYCard
            pack="dfy_enterprise"
            title="DFY Enterprise"
            price={499}
            features={[
              "Enterprise workflow setup",
              "Complex automation systems",
              "Unlimited integrations",
              "4-hour consultation",
              "3 months premium support",
              "Full documentation & training",
              "Dedicated account manager"
            ]}
          />
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="mb-12 overflow-x-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Compare Plans</h2>
        <table className="w-full border-collapse bg-white rounded-2xl overflow-hidden shadow">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 font-semibold">Feature</th>
              <th className="text-center p-4 font-semibold">Starter</th>
              <th className="text-center p-4 font-semibold">Launch</th>
              <th className="text-center p-4 font-semibold">Growth</th>
              <th className="text-center p-4 font-semibold">Agency</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="p-4">Workflows</td>
              <td className="text-center p-4">{plans.starter.workflows}</td>
              <td className="text-center p-4">{plans.launch.workflows}</td>
              <td className="text-center p-4">{plans.growth.workflows}</td>
              <td className="text-center p-4">{plans.agency.workflows}</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="p-4">Runs per month</td>
              <td className="text-center p-4">{plans.starter.runs}</td>
              <td className="text-center p-4">{plans.launch.runs}</td>
              <td className="text-center p-4">{plans.growth.runs}</td>
              <td className="text-center p-4">{plans.agency.runs}</td>
            </tr>
            <tr>
              <td className="p-4">Speed</td>
              <td className="text-center p-4">{plans.starter.speed}</td>
              <td className="text-center p-4">{plans.launch.speed}</td>
              <td className="text-center p-4">{plans.growth.speed}</td>
              <td className="text-center p-4">{plans.agency.speed}</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="p-4">Users</td>
              <td className="text-center p-4">{plans.starter.users}</td>
              <td className="text-center p-4">{plans.launch.users}</td>
              <td className="text-center p-4">{plans.growth.users}</td>
              <td className="text-center p-4">{plans.agency.users}</td>
            </tr>
            <tr>
              <td className="p-4">Connectors</td>
              <td className="text-center p-4 text-sm">{plans.starter.connectors}</td>
              <td className="text-center p-4 text-sm">{plans.launch.connectors}</td>
              <td className="text-center p-4 text-sm">{plans.growth.connectors}</td>
              <td className="text-center p-4 text-sm">{plans.agency.connectors}</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="p-4">AI Credits</td>
              <td className="text-center p-4">{plans.starter.aiCredits}</td>
              <td className="text-center p-4">{plans.launch.aiCredits}</td>
              <td className="text-center p-4">{plans.growth.aiCredits}</td>
              <td className="text-center p-4">{plans.agency.aiCredits}</td>
            </tr>
            <tr>
              <td className="p-4">Support</td>
              <td className="text-center p-4">{plans.starter.support}</td>
              <td className="text-center p-4">{plans.launch.support}</td>
              <td className="text-center p-4">{plans.growth.support}</td>
              <td className="text-center p-4">{plans.agency.support}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Connectors Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Connectors</h2>
        <div className="bg-white rounded-2xl p-6 shadow mb-6">
          <h3 className="font-semibold mb-3 text-green-600">✓ Available Now</h3>
          <div className="flex flex-wrap gap-2">
            {availableConnectors.map((c) => (
              <span key={c} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                {c}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow">
          <h3 className="font-semibold mb-3 text-orange-600">⏳ Coming Soon</h3>
          <div className="flex flex-wrap gap-2">
            {comingSoonConnectors.map((c) => (
              <button
                key={c.name}
                onClick={() => setNotifyModal({ connector: c.name, eta: c.eta })}
                className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-100 transition-colors"
              >
                {c.name} • {c.eta}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3">Click any connector to get notified when it's ready</p>
        </div>
      </div>

      {/* Trust Strip */}
      <div className="bg-blue-50 rounded-2xl p-6 mb-12 text-center">
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-blue-600">✓</span>
            <span>Cancel anytime, prorated</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600">✓</span>
            <span>7-day trial on Growth & Agency</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600">✓</span>
            <span>GDPR compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600">✓</span>
            <span>Encryption at rest</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600">✓</span>
            <span>SLA on Agency plan</span>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div id="faqs" className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4 max-w-3xl mx-auto">
          <details className="bg-white rounded-xl p-4 shadow">
            <summary className="cursor-pointer font-medium">What happens after the trial?</summary>
            <p className="mt-2 text-sm text-gray-600">
              Growth and Agency plans include a 7-day free trial. You won't be charged until the trial ends. Cancel anytime during the trial with no charge.
            </p>
          </details>
          <details className="bg-white rounded-xl p-4 shadow">
            <summary className="cursor-pointer font-medium">Can I cancel anytime?</summary>
            <p className="mt-2 text-sm text-gray-600">
              Yes! Cancel anytime from your billing dashboard. You'll continue to have access until the end of your billing period, and we'll prorate any unused time to month-end.
            </p>
          </details>
          <details className="bg-white rounded-xl p-4 shadow">
            <summary className="cursor-pointer font-medium">Do you provide VAT invoices?</summary>
            <p className="mt-2 text-sm text-gray-600">
              Yes, VAT-compliant invoices are automatically generated and downloadable in your Billing portal. VAT is calculated automatically at checkout based on your location.
            </p>
          </details>
          <details className="bg-white rounded-xl p-4 shadow">
            <summary className="cursor-pointer font-medium">Where is my data stored?</summary>
            <p className="mt-2 text-sm text-gray-600">
              Data is stored in EU/UK regions by default for GDPR compliance. US region hosting is available on request for Agency plans.
            </p>
          </details>
          <details className="bg-white rounded-xl p-4 shadow">
            <summary className="cursor-pointer font-medium">Can I see the integrations roadmap?</summary>
            <p className="mt-2 text-sm text-gray-600">
              Yes! Check our <a href="/docs/integrations" className="text-blue-600 hover:underline">integrations documentation</a>. You can request early access to upcoming connectors from the "Coming Soon" section on this page.
            </p>
          </details>
          <details className="bg-white rounded-xl p-4 shadow">
            <summary className="cursor-pointer font-medium">Can I switch plans later?</summary>
            <p className="mt-2 text-sm text-gray-600">
              Yes! You can upgrade or downgrade at any time. Changes are prorated automatically.
            </p>
          </details>
          <details className="bg-white rounded-xl p-4 shadow">
            <summary className="cursor-pointer font-medium">What are add-ons?</summary>
            <p className="mt-2 text-sm text-gray-600">
              Add-ons let you extend your plan: Extra Runs Pack (+25k runs, £29), AI Credits Pack (+10k tokens, £9), Priority SLA for Pro (+£39). Contact us to add them to your subscription.
            </p>
          </details>
        </div>
      </div>

      {/* Notify Modal */}
      {notifyModal && (
        <NotifyModal
          connector={notifyModal.connector}
          eta={notifyModal.eta}
          onClose={() => setNotifyModal(null)}
        />
      )}

      {/* VAT Notice */}
      <div className="mt-8 text-xs text-center text-gray-500">
        <p>Prices exclude VAT where applicable. VAT is calculated automatically at checkout.</p>
        <p className="mt-1">Have a promo code? Enter it on the Stripe checkout page.</p>
      </div>
    </main>
  );
}
