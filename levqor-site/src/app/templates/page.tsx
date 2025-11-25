"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  difficulty: string;
  recommended_audience?: string[];
  tags?: string[];
  estimated_setup_time?: string;
  integrations?: string[];
}

interface Category {
  id: string;
  name: string;
  icon?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-amber-100 text-amber-800",
  advanced: "bg-red-100 text-red-800"
};

const categoryIcons: Record<string, string> = {
  "lead_capture": "🎯",
  "sales_automation": "📈",
  "customer_support": "💬",
  "reporting": "📊",
  "data_sync": "🔄",
  "notifications": "🔔",
  "onboarding": "👤",
  "ecommerce": "🛒",
  "internal_ops": "⚙️"
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [templatesRes, categoriesRes] = await Promise.all([
          fetch(`${API_BASE}/api/templates`),
          fetch(`${API_BASE}/api/templates/categories`)
        ]);
        
        if (templatesRes.ok) {
          const templatesData = await templatesRes.json();
          if (templatesData.success) {
            setTemplates(templatesData.templates);
          }
        }
        
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          if (categoriesData.success) {
            setCategories(categoriesData.categories);
          }
        }
      } catch (error) {
        console.error("Failed to fetch templates:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchInitialData();
  }, []);

  useEffect(() => {
    async function fetchFilteredTemplates() {
      if (loading) return;
      
      try {
        const params = new URLSearchParams();
        if (selectedCategory && selectedCategory !== "all") {
          params.set("category", selectedCategory);
        }
        if (selectedDifficulty) {
          params.set("difficulty", selectedDifficulty);
        }
        if (searchQuery) {
          params.set("search", searchQuery);
        }
        
        const res = await fetch(`${API_BASE}/api/templates?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setTemplates(data.templates);
          }
        }
      } catch (error) {
        console.error("Failed to fetch filtered templates:", error);
      }
    }
    
    const debounce = setTimeout(fetchFilteredTemplates, 300);
    return () => clearTimeout(debounce);
  }, [selectedCategory, selectedDifficulty, searchQuery, loading]);

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Template Marketplace
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started with {templates.length}+ ready-made workflow templates. 
            Click any template to customize it for your needs.
          </p>
        </div>

        <div className="bg-white rounded-xl border p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              <option value="">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === "all"
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{categoryIcons[cat.id] || "📋"}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{templates.length}</span> templates
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md hover:border-primary-200 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{categoryIcons[template.category] || "📋"}</span>
                      <h3 className="text-lg font-bold group-hover:text-primary-600 transition-colors">
                        {template.name}
                      </h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${difficultyColors[template.difficulty] || 'bg-gray-100 text-gray-800'}`}>
                      {template.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">{template.description}</p>
                  
                  {template.tags && template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                      {template.tags.length > 3 && (
                        <span className="px-2 py-0.5 text-gray-400 text-xs">+{template.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-sm text-gray-500">
                      {template.estimated_setup_time ? `⏱️ ${template.estimated_setup_time}` : ''}
                    </span>
                    <Link
                      href={`/dashboard?template=${template.id}`}
                      className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Use Template
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {templates.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">No templates found. Try adjusting your filters.</p>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedDifficulty("");
                    setSearchQuery("");
                  }}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </>
        )}

        <div className="mt-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Need a Custom Workflow?</h2>
          <p className="text-primary-100 mb-6 max-w-xl mx-auto">
            Can't find what you need? Create your own workflow from scratch with our AI-powered builder.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-all"
          >
            Create with AI
          </Link>
        </div>
      </section>
    </main>
  );
}
