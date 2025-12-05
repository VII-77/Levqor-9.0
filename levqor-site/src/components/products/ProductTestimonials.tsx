"use client";

import type { ProductConfig } from "@/config/products";

interface ProductTestimonialsProps {
  product: ProductConfig;
}

export default function ProductTestimonials({ product }: ProductTestimonialsProps) {
  if (!product.testimonials || product.testimonials.length === 0) {
    return null;
  }

  return (
    <section className="bg-gray-100 py-16">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-center mb-10">
          What Customers Say
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {product.testimonials.map((t, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, j) => (
                  <svg
                    key={j}
                    className="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
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
  );
}
