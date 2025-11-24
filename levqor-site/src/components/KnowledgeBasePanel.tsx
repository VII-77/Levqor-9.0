"use client";

import React, { useState } from "react";

interface Article {
  id: string;
  title: string;
  category: string;
  snippet: string;
}

export default function KnowledgeBasePanel() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Article[]>([]);
  const [error, setError] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://api.levqor.ai";

  async function handleSearch() {
    if (!query || query.length < 2) {
      setError("Please enter at least 2 characters");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch(
        `${apiBase}/api/knowledge/search?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Search failed");
        setResults([]);
      } else {
        setResults(data.results || []);
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  return (
    <div className="bg-white border rounded-xl p-6">
      <h3 className="text-xl font-semibold mb-3">📚 Quick Answers</h3>
      <p className="text-sm text-gray-600 mb-4">
        Search our knowledge base for instant help with common questions.
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search for help... (e.g., 'workflows', 'billing', 'security')"
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          onClick={handleSearch}
          disabled={loading || query.length < 2}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 mb-3">{error}</div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Found {results.length} article{results.length === 1 ? "" : "s"}</p>
          {results.map((article) => (
            <div
              key={article.id}
              className="border rounded-lg p-4 hover:border-blue-300 transition"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-semibold text-blue-900">{article.title}</h4>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded whitespace-nowrap">
                  {article.category}
                </span>
              </div>
              <p className="text-sm text-gray-700">{article.snippet}</p>
            </div>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && query.length >= 2 && (
        <div className="text-sm text-gray-500 text-center py-4">
          No articles found for "{query}". Try different keywords or contact support.
        </div>
      )}
    </div>
  );
}
