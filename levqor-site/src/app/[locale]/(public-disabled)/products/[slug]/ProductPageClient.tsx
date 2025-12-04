"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProductConfig } from "@/config/products";

interface ProductPageClientProps {
  product: ProductConfig;
}

export default function ProductPageClient({ product }: ProductPageClientProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleBuyClick = () => {
    window.open(product.gumroadUrl, "_blank");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12">
        <div className="text-center mb-8">
          {product.status === "active" && (
            <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              Available Now
            </span>
          )}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {product.name}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
            {product.shortDescription}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 border">
              <h2 className="text-2xl font-bold mb-4">What You Get</h2>
              <div className="prose prose-gray max-w-none">
                {product.longDescription.split("\n\n").map((paragraph, i) => (
                  <p key={i} className="text-gray-600 mb-4 whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>

              {product.tags && product.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {product.bonuses && product.bonuses.length > 0 && (
                <div className="mt-6 bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <h3 className="font-semibold text-amber-800 mb-2">
                    Limited Time Bonuses:
                  </h3>
                  <ul className="space-y-1 text-sm text-amber-700">
                    {product.bonuses.map((bonus, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span>🎁</span>
                        {bonus}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="w-full md:w-80 sticky top-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl p-6 text-white">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold mb-1">
                  ${product.priceUsd}
                </div>
                <div className="text-blue-100 text-sm">One-time payment</div>
              </div>

              <button
                onClick={handleBuyClick}
                className="w-full bg-white text-blue-600 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg"
              >
                Get Instant Access
              </button>

              <div className="mt-4 text-center text-sm text-blue-100">
                30-day money-back guarantee
              </div>

              <div className="mt-6 pt-4 border-t border-blue-500 space-y-2 text-sm text-blue-100">
                <div className="flex items-center gap-2">
                  <span>⚡</span>
                  <span>Instant download</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🔒</span>
                  <span>Secure checkout via Gumroad</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>♻️</span>
                  <span>Lifetime updates included</span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/pricing"
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Looking for Levqor subscriptions?
              </Link>
            </div>
          </div>
        </div>
      </section>

      {product.testimonials && product.testimonials.length > 0 && (
        <section className="bg-gray-100 py-16">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-center mb-10">
              What Customers Say
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {product.testimonials.map((t, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow">
                  <div className="text-yellow-400 mb-3">★★★★★</div>
                  <p className="text-gray-700 mb-4 italic">"{t.quote}"</p>
                  <div className="text-sm">
                    <div className="font-semibold text-gray-900">{t.author}</div>
                    <div className="text-gray-500">{t.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {product.faqs && product.faqs.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {product.faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl shadow">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left p-5 flex items-center justify-between"
                >
                  <span className="font-medium text-gray-900">{faq.q}</span>
                  <span className="text-gray-400">
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-gray-600 text-sm">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Stop building from scratch. Start with what works.
          </p>
          <button
            onClick={handleBuyClick}
            className="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            Get the Pack — ${product.priceUsd}
          </button>
          <p className="mt-4 text-sm text-blue-200">
            Join hundreds of founders who shipped faster with Levqor
          </p>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-gray-500">
        <div className="max-w-5xl mx-auto px-6">
          <p>
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
            {" · "}
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
            {" · "}
            <Link href="/refunds" className="hover:underline">
              Refund Policy
            </Link>
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} Levqor. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
