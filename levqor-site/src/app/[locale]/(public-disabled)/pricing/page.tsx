"use client";
import { useState } from "react";
import LeadCaptureInline from "@/components/LeadCaptureInline";
import PageViewTracker from "@/components/PageViewTracker";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import ExitIntentModal from "@/components/ExitIntentModal";
import ReferralInvite from "@/components/referrals/ReferralInvite";
import { type Currency, formatPrice } from "@/config/currency";
import { captureLead, captureDFYRequest, logPricingClick } from "@/lib/telemetry";
import {
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_PLANS_ARRAY,
  DFY_PACKS,
  DFY_PACKS_ARRAY,
  ADDONS,
  ADDONS_ARRAY,
  type SubscriptionTier,
  type DFYPackId,
  type AddonId,
} from "@/config/pricing";

type Term = "monthly" | "yearly";
type DisplayCurrency = Currency;

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
  packId, currency
}: { packId: DFYPackId; currency: DisplayCurrency }) {
  const pack = DFY_PACKS[packId];
  
  const handleClick = async () => {
    captureDFYRequest({
      email: null,
      useCase: pack.name,
      detail: `${pack.name} - ${pack.features.join(", ")}`,
      source: "pricing_dfy",
      planIntent: packId,
    }).catch(() => {});
    
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ 
          purchase_type: "dfy",
          dfy_pack: packId
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
        <h3 className="text-xl font-semibold">{pack.name}</h3>
        {pack.badge && <span className="text-xs rounded-full px-3 py-1 bg-blue-600 text-white font-medium">{pack.badge}</span>}
      </div>
      <div className="text-3xl font-bold text-blue-600">
        {formatPrice(pack.price, currency)}
        <span className="text-base font-normal text-gray-600"> one-time</span>
      </div>
      <ul className="text-sm space-y-2 flex-1">
        {pack.features.map((f, i) => (
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

function AddonCard({
  addonId, currency
}: { addonId: AddonId; currency: DisplayCurrency }) {
  const addon = ADDONS[addonId];
  
  const handleClick = async () => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ 
          purchase_type: "addons",
          addons: addonId
        })
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        console.error("Add-on Checkout error:", data.error);
        alert("Checkout failed. Please try again or contact support.");
      }
    } catch (err) {
      console.error("Add-on Checkout error:", err);
      alert("Checkout failed. Please try again or contact support.");
    }
  };

  return (
    <div className="rounded-xl border p-5 shadow hover:shadow-md transition-shadow bg-white">
      <div className="mb-3">
        <h4 className="text-lg font-semibold">{addon.name}</h4>
        <p className="text-sm text-gray-600 mt-1">{addon.description}</p>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold">
          {formatPrice(addon.price, currency)}<span className="text-sm font-normal text-gray-600">/month</span>
        </div>
        <button
          onClick={handleClick}
          className="rounded-lg border border-gray-900 bg-gray-900 text-white px-4 py-2 hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          Add to Plan
        </button>
      </div>
    </div>
  );
}

function SubscriptionCard({
  tier, term, currency
}: { tier: SubscriptionTier; term: Term; currency: DisplayCurrency }) {
  const plan = SUBSCRIPTION_PLANS[tier];
  const interval = term === "yearly" ? "year" : "month";
  const price = plan.prices[interval];
  
  const handleClick = async () => {
    logPricingClick(tier, term, currency);
    captureLead({
      email: null,
      source: "pricing",
      planIntent: tier,
      metadata: { term, currency, trial: plan.trial },
    }).catch(() => {});
    
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ 
          purchase_type: "subscription",
          tier: tier, 
          billing_interval: interval
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
    <div className="relative rounded-2xl border p-6 shadow grid gap-4 bg-white hover:shadow-lg transition-shadow">
      {plan.trial && (
        <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
          7-day free trial
        </div>
      )}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{plan.name}</h3>
        {plan.badge && <span className="text-xs rounded-full px-3 py-1 bg-black text-white font-medium">{plan.badge}</span>}
      </div>
      <div className="text-3xl font-bold">
        {formatPrice(price, currency)}
        <span className="text-base font-normal text-gray-600">/{term === "yearly" ? "yr" : "mo"}</span>
      </div>
      {plan.trial && (
        <div className="text-xs text-green-700 font-medium bg-green-50 rounded-lg px-3 py-2">
          ✓ Card required • Cancel before Day 7 to avoid charges
        </div>
      )}
      <ul className="text-sm space-y-2 flex-1">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={handleClick}
        className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition font-medium"
      >
        {plan.trial ? "Start 7-Day Trial" : "Get Started"}
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
            <p className="font-medium">Thanks! We&apos;ll notify you when {connector} is ready.</p>
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
  const [displayCurrency, setDisplayCurrency] = useState<DisplayCurrency>("GBP");

  const growthPlan = SUBSCRIPTION_PLANS.growth;
  const agencyPlan = SUBSCRIPTION_PLANS.agency;
  const dfyProfessional = DFY_PACKS.dfy_professional;
  const whiteLabel = ADDONS.addon_white_label;

  return (
    <main className="mx-auto max-w-6xl p-6">
      <ExitIntentModal />
      <PageViewTracker page="/pricing" />
      
      <div className="mb-6 flex items-center justify-end gap-3">
        <span className="text-xs text-gray-500 hidden sm:inline">Display:</span>
        <CurrencySwitcher onCurrencyChange={setDisplayCurrency} />
      </div>
      
      {displayCurrency !== "GBP" && (
        <div className="mb-4 text-center">
          <p className="text-xs text-neutral-500">
            All subscriptions are billed in GBP (£). {displayCurrency} values shown are approximate for your convenience.
          </p>
        </div>
      )}
      
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3">Simple, transparent pricing</h1>
        <p className="text-gray-600 mb-4">Choose the plan that fits your automation needs</p>
        
        <div className="max-w-2xl mx-auto bg-green-50 border border-green-200 rounded-xl p-6 mb-4">
          <p className="text-sm text-green-900 leading-relaxed">
            <strong>Start a 7-day free trial on any plan.</strong> A valid card is required to activate your trial, but you won&apos;t be charged during the 7 days. If you cancel before the trial ends, you pay £0. If you stay past Day 7, your plan renews automatically at the standard monthly price.
          </p>
        </div>
        
        <p className="text-sm text-gray-500">
          <a href="#faqs" className="text-blue-600 hover:underline">Jump to FAQs →</a>
        </p>
      </div>

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

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Subscription Plans</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {SUBSCRIPTION_PLANS_ARRAY.map((plan) => (
            <SubscriptionCard
              key={plan.id}
              tier={plan.id}
              term={term}
              currency={displayCurrency}
            />
          ))}
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-center">Done-For-You Packages</h2>
        <p className="text-center text-gray-600 mb-6">One-time payment for complete setup and configuration</p>
        <div className="grid gap-6 md:grid-cols-3">
          {DFY_PACKS_ARRAY.map((pack) => (
            <DFYCard
              key={pack.id}
              packId={pack.id}
              currency={displayCurrency}
            />
          ))}
        </div>
      </div>

      <div className="mb-12">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-3 text-center">Bundle & Save</h2>
          <p className="text-center text-gray-700 mb-4">
            Combine subscription plans with DFY packages or add-ons for maximum value
          </p>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-lg mb-2">Growth + DFY Professional</h3>
              <p className="text-sm text-gray-600 mb-3">
                Perfect for scaling teams: Get the Growth tier ({formatPrice(growthPlan.prices.month, displayCurrency)}/mo) plus expert DFY setup ({formatPrice(dfyProfessional.price, displayCurrency)} one-time) for a complete turnkey solution with advanced workflows and priority support.
              </p>
              <p className="text-xs text-blue-600 font-medium">Recommended for teams of 3-5 users</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-lg mb-2">Scale + White Label</h3>
              <p className="text-sm text-gray-600 mb-3">
                Built for agencies: Combine the Agency tier ({formatPrice(agencyPlan.prices.month, displayCurrency)}/mo) with White Label add-on ({formatPrice(whiteLabel.price, displayCurrency)}/mo) to manage client workflows under your own brand with enterprise-grade support.
              </p>
              <p className="text-xs text-blue-600 font-medium">Ideal for agencies managing 10+ clients</p>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            All bundles include our 7-day free trial and 30-day refund policy
          </p>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-center">Add-Ons</h2>
        <p className="text-center text-gray-600 mb-6">Enhance your plan with recurring add-ons</p>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {ADDONS_ARRAY.map((addon) => (
            <AddonCard
              key={addon.id}
              addonId={addon.id}
              currency={displayCurrency}
            />
          ))}
        </div>
      </div>

      <div className="mb-12 overflow-x-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Compare Plans</h2>
        <table className="w-full border-collapse bg-white rounded-2xl overflow-hidden shadow">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 font-semibold">Feature</th>
              {SUBSCRIPTION_PLANS_ARRAY.map((plan) => (
                <th key={plan.id} className="text-center p-4 font-semibold">{plan.name}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="p-4">Workflows</td>
              {SUBSCRIPTION_PLANS_ARRAY.map((plan) => (
                <td key={plan.id} className="text-center p-4">{plan.limits.workflows}</td>
              ))}
            </tr>
            <tr className="bg-gray-50">
              <td className="p-4">Runs per month</td>
              {SUBSCRIPTION_PLANS_ARRAY.map((plan) => (
                <td key={plan.id} className="text-center p-4">{plan.limits.runs}</td>
              ))}
            </tr>
            <tr>
              <td className="p-4">Speed</td>
              {SUBSCRIPTION_PLANS_ARRAY.map((plan) => (
                <td key={plan.id} className="text-center p-4">{plan.limits.speed}</td>
              ))}
            </tr>
            <tr className="bg-gray-50">
              <td className="p-4">Users</td>
              {SUBSCRIPTION_PLANS_ARRAY.map((plan) => (
                <td key={plan.id} className="text-center p-4">{plan.limits.users}</td>
              ))}
            </tr>
            <tr>
              <td className="p-4">Connectors</td>
              {SUBSCRIPTION_PLANS_ARRAY.map((plan) => (
                <td key={plan.id} className="text-center p-4 text-sm">{plan.limits.connectors}</td>
              ))}
            </tr>
            <tr className="bg-gray-50">
              <td className="p-4">AI Credits</td>
              {SUBSCRIPTION_PLANS_ARRAY.map((plan) => (
                <td key={plan.id} className="text-center p-4">{plan.limits.aiCredits}</td>
              ))}
            </tr>
            <tr>
              <td className="p-4">Support</td>
              {SUBSCRIPTION_PLANS_ARRAY.map((plan) => (
                <td key={plan.id} className="text-center p-4">{plan.limits.support}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

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
          <p className="text-sm text-gray-600 mt-3">Click any connector to get notified when it&apos;s ready</p>
        </div>
      </div>

      <div className="bg-blue-50 rounded-2xl p-6 mb-12 text-center">
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-blue-600">✓</span>
            <span>Cancel anytime, prorated</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600">✓</span>
            <span>7-day trial (card required, no charge)</span>
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

      <div className="max-w-2xl mx-auto mb-12">
        <ReferralInvite context="pricing" />
      </div>

      <div id="faqs" className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4 max-w-3xl mx-auto">
          <details className="bg-white rounded-xl p-4 shadow">
            <summary className="cursor-pointer font-medium">What happens after the trial?</summary>
            <p className="mt-2 text-sm text-gray-600">
              All subscription plans include a 7-day free trial. A valid credit card is required to start your trial, but you won&apos;t be charged during the 7 days. If you cancel before Day 7 ends, you pay £0. If you stay, your subscription starts automatically on Day 8.
            </p>
          </details>
          <details className="bg-white rounded-xl p-4 shadow">
            <summary className="cursor-pointer font-medium">Can I cancel anytime?</summary>
            <p className="mt-2 text-sm text-gray-600">
              Yes! Cancel anytime from your billing dashboard. You&apos;ll continue to have access until the end of your billing period, and we&apos;ll prorate any unused time to month-end.
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
              Yes! Check our <a href="/docs/integrations" className="text-blue-600 hover:underline">integrations documentation</a>. You can request early access to upcoming connectors from the &quot;Coming Soon&quot; section on this page.
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

      {notifyModal && (
        <NotifyModal
          connector={notifyModal.connector}
          eta={notifyModal.eta}
          onClose={() => setNotifyModal(null)}
        />
      )}

      <div className="mt-16">
        <LeadCaptureInline source="pricing" />
      </div>

      <div className="mt-8 text-xs text-center text-gray-500">
        <p>Prices exclude VAT where applicable. VAT is calculated automatically at checkout.</p>
        <p className="mt-1">Have a promo code? Enter it on the Stripe checkout page.</p>
      </div>
    </main>
  );
}
