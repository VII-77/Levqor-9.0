"use client";

import ProductCard from "./ProductCard";
import { getActiveProducts } from "@/config/products";

export default function ResourcesPanel() {
  const products = getActiveProducts();

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Resources & Tools</h2>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
          New
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Premium resources to accelerate your automation journey
      </p>
      <div className="space-y-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} variant="compact" />
        ))}
      </div>
    </div>
  );
}
