"use client";

import Link from "next/link";
import type { ProductConfig } from "@/config/products";

interface ProductCardProps {
  product: ProductConfig;
  variant?: "compact" | "full";
}

export default function ProductCard({ product, variant = "compact" }: ProductCardProps) {
  const isCompact = variant === "compact";

  if (isCompact) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border border-blue-100 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div>
            {product.status === "active" && (
              <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full mb-2">
                Available
              </span>
            )}
            <h3 className="font-semibold text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {product.shortDescription}
            </p>
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            <div className="text-2xl font-bold text-blue-600">
              ${product.priceUsd}
            </div>
            <div className="text-xs text-gray-500">one-time</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/products/${product.slug}`}
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
            {product.status === "active" && (
              <span className="inline-block bg-white/20 text-white text-xs font-semibold px-2 py-1 rounded-full mb-2">
                Available Now
              </span>
            )}
            <h3 className="text-xl font-bold">{product.name}</h3>
            <p className="text-blue-100 mt-1">{product.shortDescription}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">${product.priceUsd}</div>
            <div className="text-sm text-blue-200">one-time</div>
          </div>
        </div>
      </div>
      <div className="p-6">
        <p className="text-gray-600 mb-4 line-clamp-3">
          {product.longDescription.split("\n")[0]}
        </p>
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {product.tags.slice(0, 4).map((tag, i) => (
              <span
                key={i}
                className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
            {product.tags.length > 4 && (
              <span className="text-xs text-gray-500">
                +{product.tags.length - 4} more
              </span>
            )}
          </div>
        )}
        <div className="flex gap-3">
          <Link
            href={`/products/${product.slug}`}
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
