"use client";

import { useState } from "react";
import type { ProductConfig } from "@/config/products";

interface ProductFAQProps {
  product: ProductConfig;
}

export default function ProductFAQ({ product }: ProductFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!product.faqs || product.faqs.length === 0) {
    return null;
  }

  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <h2 className="text-2xl font-bold text-center mb-8">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {product.faqs.map((faq, i) => (
          <div key={i} className="bg-white rounded-xl shadow">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full text-left p-5 flex items-center justify-between"
            >
              <span className="font-medium text-gray-900 pr-4">{faq.q}</span>
              <span className="text-gray-400 flex-shrink-0">
                <svg
                  className={`w-5 h-5 transition-transform ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>
            </button>
            {openIndex === i && (
              <div className="px-5 pb-5 text-gray-600 text-sm border-t pt-4">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
