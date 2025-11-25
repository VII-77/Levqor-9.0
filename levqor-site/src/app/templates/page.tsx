"use client";
import { useState } from "react";
import Link from "next/link";
import { templates, categories, difficulties, getTemplatesByCategory } from "@/data/templates";

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredTemplates = getTemplatesByCategory(selectedCategory).filter(
    t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         t.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDifficultyStyle = (difficulty: string) => {
    return difficulties.find(d => d.id === difficulty)?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Template Gallery
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start with pre-built workflows for common use cases. Click any template to customize it with AI.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Link
              key={template.id}
              href={`/builder?templateId=${template.id}`}
              className="block bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md hover:border-primary-200 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold group-hover:text-primary-600 transition-colors">
                  {template.name}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyStyle(template.difficulty)}`}>
                  {template.difficulty}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{template.shortDescription}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 capitalize">{template.category.replace('-', ' ')}</span>
                <span className="text-primary-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                  Use template →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No templates found. Try adjusting your search or filters.</p>
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Don't see what you need?</p>
          <Link
            href="/builder"
            className="inline-block px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all"
          >
            Start from scratch with AI
          </Link>
        </div>
      </section>
    </main>
  );
}
