"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { ProductConfig } from "@/config/products";
import { trackBuyNow, trackSecondaryCTA } from "@/lib/analytics";

interface ProductCardProps {
  product: ProductConfig;
  variant?: "compact" | "full";
}

const IS_DEV = process.env.NODE_ENV === "development";

function hasValidGumroadUrl(url: string | undefined): boolean {
  return !!url && url.startsWith("http");
}

export default function ProductCard({ product, variant = "compact" }: ProductCardProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  
  const isCompact = variant === "compact";
  const hasGumroad = hasValidGumroadUrl(product.gumroadUrl);
  const productPageUrl = `/${locale}/products/${product.slug}`;

  const handleBuyClick = () => {
    if (product.gumroadUrl) {
      trackBuyNow(product.slug, product.gumroadUrl, "dashboard_card");
      window.open(product.gumroadUrl, "_blank");
    }
  };

  const handleViewClick = () => {
    trackSecondaryCTA(product.slug, "view_details");
  };

  if (isCompact) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border border-blue-100 hover:shadow-md transition-shadow">
        {product.thumbnailImage ? (
          <img
            src={product.thumbnailImage}
            alt={product.name}
            className="w-full h-32 object-cover rounded-md mb-3"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        <div className={`w-full h-32 rounded-md mb-3 bg-gradient-to-r from-slate-800 to-slate-700 flex items-center justify-center text-xs text-slate-300 ${product.thumbnailImage ? "hidden" : ""}`}>
          {product.name}
        </div>
        <div className="flex items-start justify-between mb-3">
          <div>
            {product.status === "active" && (
              <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full mb-2">
                Available
              </span>
            )}
            {product.status === "draft" && (
              <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full mb-2">
                Coming Soon
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
            href={productPageUrl}
            onClick={handleViewClick}
            className="flex-1 text-center py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Learn More
          </Link>
          {hasGumroad ? (
            <button
              onClick={handleBuyClick}
              className="py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Buy Now
            </button>
          ) : (
            <span className="py-2 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed">
              {IS_DEV ? "No URL" : "Soon"}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
      {product.thumbnailImage ? (
        <img
          src={product.thumbnailImage}
          alt={product.name}
          className="w-full h-48 object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
            (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
          }}
        />
      ) : null}
      <div className={`w-full h-48 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center ${product.thumbnailImage ? "hidden" : ""}`}>
        <span className="text-white/60 text-sm">{product.name}</span>
      </div>
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            {product.status === "active" && (
              <span className="inline-block bg-white/20 text-white text-xs font-semibold px-2 py-1 rounded-full mb-2">
                Available Now
              </span>
            )}
            {product.status === "draft" && (
              <span className="inline-block bg-yellow-400/30 text-white text-xs font-semibold px-2 py-1 rounded-full mb-2">
                Coming Soon
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
            href={productPageUrl}
            onClick={handleViewClick}
            className="flex-1 text-center py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            View Details
          </Link>
          {hasGumroad ? (
            <button
              onClick={handleBuyClick}
              className="flex-1 text-center py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Buy Now
            </button>
          ) : (
            <span className="flex-1 text-center py-3 border border-gray-200 rounded-lg font-medium text-gray-400 cursor-not-allowed">
              {IS_DEV ? "gumroadUrl missing" : "Coming Soon"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
