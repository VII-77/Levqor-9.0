"use client";

import type { ProductConfig } from "@/config/products";

interface ProductBonusesProps {
  product: ProductConfig;
}

export default function ProductBonuses({ product }: ProductBonusesProps) {
  if (!product.bonuses || product.bonuses.length === 0) {
    return null;
  }

  return (
    <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
      <div className="flex items-center gap-2 mb-3">
        <svg
          className="w-5 h-5 text-amber-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
          />
        </svg>
        <h3 className="font-semibold text-amber-800">
          Limited Time Bonuses
        </h3>
      </div>
      <ul className="space-y-2">
        {product.bonuses.map((bonus, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
            <svg
              className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            {bonus}
          </li>
        ))}
      </ul>
    </div>
  );
}
