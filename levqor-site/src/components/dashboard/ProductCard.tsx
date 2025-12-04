"use client";

import Link from "next/link";
import type { DigitalProduct } from "@/config/products";

interface ProductCardProps {
  product: DigitalProduct;
  variant?: "compact" | "full";
}

export default function ProductCard({ product, variant = "compact" }: ProductCardProps) {
  const isCompact = variant === "compact";

  if (isCompact) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border border-blue-100 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div>
            {product.badge && (
              <span className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full mb-2">
                {product.badge}
              </span>
            )}
            <h3 className="font-semibold text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{product.tagline}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">${product.price}</div>
            <div className="text-xs text-gray-500">one-time</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/products/automation-pack"
            className="flex-1 text-center py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Learn More
          </Link>
          <a
            href={product.gumroadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Buy Now
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            {product.badge && (
              <span className="inline-block bg-white/20 text-white text-xs font-semibold px-2 py-1 rounded-full mb-2">
                {product.badge}
              </span>
            )}
            <h3 className="text-xl font-bold">{product.name}</h3>
            <p className="text-blue-100 mt-1">{product.tagline}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">${product.price}</div>
            <div className="text-sm text-blue-200">one-time</div>
          </div>
        </div>
      </div>
      <div className="p-6">
        <p className="text-gray-600 mb-4">{product.description}</p>
        <div className="space-y-2 mb-6">
          {product.features.slice(0, 4).map((feature, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span className="text-green-600">✓</span>
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
          {product.features.length > 4 && (
            <div className="text-sm text-gray-500">
              + {product.features.length - 4} more features
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <Link
            href="/products/automation-pack"
            className="flex-1 text-center py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            View Details
          </Link>
          <a
            href={product.gumroadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Buy Now
          </a>
        </div>
      </div>
    </div>
  );
}
