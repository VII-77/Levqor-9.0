"use client";

import { useEffect } from "react";
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
  useEffect(() => {
    trackProductView(product.slug, product.name);
  }, [product.slug, product.name]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12">
        <ProductHero product={product} />

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 space-y-6">
            <ProductValueStack product={product} />
            <ProductBonuses product={product} />
          </div>

          <ProductCTA product={product} variant="sidebar" />
        </div>
      </section>

      <ProductTestimonials product={product} />

      <ProductFAQ product={product} />

      <ProductCTA product={product} variant="footer" />

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
