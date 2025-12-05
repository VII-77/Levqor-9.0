"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { ProductConfig } from "@/config/products";
import {
  ProductHero,
  ProductValueStack,
  ProductBonuses,
  ProductCTA,
  ProductTestimonials,
  ProductFAQ,
} from "@/components/products";
import { trackProductView } from "@/lib/analytics";

interface ProductPageClientProps {
  product: ProductConfig;
}

export default function ProductPageClient({ product }: ProductPageClientProps) {
  const searchParams = useSearchParams();
  const refParam = searchParams.get("ref");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    trackProductView(product.slug, product.name);
  }, [product.slug, product.name]);

  const referralTemplate = `https://levqor.ai/products/${product.slug}?ref=YOURNAME`;

  const handleCopyReferral = async () => {
    try {
      await navigator.clipboard.writeText(referralTemplate);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12">
        <ProductHero product={product} />

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 space-y-6">
            <ProductValueStack product={product} />
            <ProductBonuses product={product} />
          </div>

          <ProductCTA product={product} variant="sidebar" refParam={refParam} />
        </div>
      </section>

      <ProductTestimonials product={product} />

      <ProductFAQ product={product} />

      <ProductCTA product={product} variant="footer" refParam={refParam} />

      <section className="bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Share &amp; Earn
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Share this page with your friends. If they buy using your link, 
              you&apos;ll be first in line for future rewards and bonuses.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 font-mono text-xs text-gray-700 overflow-x-auto whitespace-nowrap">
                {referralTemplate}
              </div>
              <button
                onClick={handleCopyReferral}
                className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Replace <code className="bg-gray-100 px-1 rounded">YOURNAME</code> with your handle so you can recognize your referrals.
            </p>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-gray-500">
        <div className="max-w-5xl mx-auto px-6">
          <p>
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
            {" | "}
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
            {" | "}
            <Link href="/refunds" className="hover:underline">
              Refund Policy
            </Link>
          </p>
          <p className="mt-2">
            &copy; {new Date().getFullYear()} Levqor. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
