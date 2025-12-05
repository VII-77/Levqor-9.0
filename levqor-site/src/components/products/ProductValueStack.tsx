"use client";

import type { ProductConfig } from "@/config/products";

interface ProductValueStackProps {
  product: ProductConfig;
}

export default function ProductValueStack({ product }: ProductValueStackProps) {
  const paragraphs = product.longDescription.split("\n\n");

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border">
      <h2 className="text-2xl font-bold mb-4">What You Get</h2>
      <div className="prose prose-gray max-w-none">
        {paragraphs.map((paragraph, i) => (
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
    </div>
  );
}
