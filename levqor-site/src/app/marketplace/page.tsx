'use client';

import { useEffect, useState } from 'react';

interface Listing {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  partner_name: string;
  downloads: number;
  rating: number | null;
  is_verified: boolean;
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchListings();
  }, [filter]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('category', filter);
      }
      
      const response = await fetch(`/api/marketplace/listings?${params}`);
      const data = await response.json();
      
      if (data.ok) {
        setListings(data.listings);
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'automation', label: 'Automation' },
    { value: 'template', label: 'Templates' },
    { value: 'integration', label: 'Integrations' },
    { value: 'module', label: 'Modules' },
    { value: 'workflow', label: 'Workflows' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Levqor Marketplace
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover partner-built integrations, templates, and modules to supercharge your automation workflows
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setFilter(cat.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === cat.value
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading marketplace...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No listings yet
            </h3>
            <p className="text-gray-600">
              Check back soon for new partner integrations!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                {/* Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {listing.category}
                  </span>
                  {listing.is_verified && (
                    <span className="text-green-500 text-sm">✓ Verified</span>
                  )}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {listing.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {listing.description || 'No description available'}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span>📥 {listing.downloads.toLocaleString()} downloads</span>
                  {listing.rating && (
                    <span>⭐ {listing.rating.toFixed(1)}</span>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      ${listing.price.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      by {listing.partner_name}
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                    Get Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Partner CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">
            Build for Levqor
          </h2>
          <p className="text-blue-100 mb-4">
            Create integrations, earn 70% revenue share, and reach thousands of users
          </p>
          <a
            href="/partners"
            className="inline-block px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-lg transition-shadow"
          >
            Become a Partner
          </a>
        </div>
      </div>
    </div>
  );
}
