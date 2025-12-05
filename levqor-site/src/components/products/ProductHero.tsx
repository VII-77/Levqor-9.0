"use client";

import type { ProductConfig } from "@/config/products";

interface ProductHeroProps {
  product: ProductConfig;
}

export default function ProductHero({ product }: ProductHeroProps) {
  return (
    <div className="text-center mb-8">
      {product.status === "active" && (
        <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          Available Now
        </span>
      )}
      {product.status === "draft" && (
        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          Coming Soon
        </span>
      )}
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
        {product.name}
      </h1>
      <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
        {product.shortDescription}
      </p>
      {product.tags && product.tags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {product.tags.slice(0, 6).map((tag, i) => (
            <span
              key={i}
              className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
