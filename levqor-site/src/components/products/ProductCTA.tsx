"use client";

import Link from "next/link";
import type { ProductConfig } from "@/config/products";
import { trackPrimaryCTA, trackBuyNow } from "@/lib/analytics";

interface ProductCTAProps {
  product: ProductConfig;
  variant?: "sidebar" | "footer";
  refParam?: string | null;
}

const IS_DEV = process.env.NODE_ENV === "development";

function hasValidDownloadUrl(url: string | undefined): boolean {
  return !!url && !url.includes("ERROR_") && !url.includes("PENDING_") && !url.includes("DRY_RUN_");
}

function buildGumroadUrlWithRef(baseUrl: string, refParam?: string | null): string {
  if (!refParam) return baseUrl;
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}ref=${encodeURIComponent(refParam)}`;
}

export default function ProductCTA({ product, variant = "sidebar", refParam }: ProductCTAProps) {
  const gumroadUrl = product.gumroadUrl;
  const hasGumroadUrl = !!gumroadUrl;
  const hasDownload = hasValidDownloadUrl(product.driveDownloadUrl);
  const finalGumroadUrl = gumroadUrl ? buildGumroadUrlWithRef(gumroadUrl, refParam) : null;

  const handleBuyClick = () => {
    if (finalGumroadUrl) {
      trackPrimaryCTA(product.slug, finalGumroadUrl);
      window.open(finalGumroadUrl, "_blank");
    }
  };

  if (variant === "footer") {
    return (
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Stop building from scratch. Start with what works.
          </p>
          {hasGumroadUrl ? (
            <button
              onClick={handleBuyClick}
              className="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              Get the Pack — ${product.priceUsd}
            </button>
          ) : (
            <div className="inline-block bg-white/20 text-white px-10 py-4 rounded-xl font-bold text-lg">
              {IS_DEV ? "gumroadUrl missing" : "Coming Soon"}
            </div>
          )}
          <p className="mt-4 text-sm text-blue-200">
            Join hundreds of founders who shipped faster with Levqor
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="w-full md:w-80 sticky top-8">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl p-6 text-white">
        <div className="text-center mb-6">
          <div className="text-5xl font-bold mb-1">
            ${product.priceUsd}
          </div>
          <div className="text-blue-100 text-sm">One-time payment</div>
        </div>

        {hasGumroadUrl ? (
          <button
            onClick={handleBuyClick}
            className="w-full bg-white text-blue-600 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            Get Instant Access
          </button>
        ) : (
          <div className="w-full bg-white/20 text-white py-4 rounded-xl font-bold text-lg text-center">
            {IS_DEV ? "gumroadUrl missing for this product" : "Coming Soon"}
          </div>
        )}

        <div className="mt-4 text-center text-sm text-blue-100">
          30-day money-back guarantee
        </div>

        <div className="mt-6 pt-4 border-t border-blue-500 space-y-2 text-sm text-blue-100">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Instant download</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secure checkout</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Lifetime updates included</span>
          </div>
        </div>
      </div>

      {hasDownload && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <p className="text-sm text-green-700">
            Already purchased? Check your email for the download link.
          </p>
        </div>
      )}

      <div className="mt-4 text-center">
        <Link
          href="/pricing"
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Looking for Levqor subscriptions?
        </Link>
      </div>
    </div>
  );
}
