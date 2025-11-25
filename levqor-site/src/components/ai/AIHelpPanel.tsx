/**
 * AI Help Panel v2 (MEGA-PHASE 1 - STEP 3)
 * 
 * Contextual AI assistant that provides help based on user's current page/action
 * Features:
 * - Contextual suggestions
 * - Natural language Q&A
 * - Smart tooltips
 * - Learning mode
 * 
 * SAFETY: Client-side only, loads after hydration, additive feature
 */

'use client';

import { useState, useEffect } from 'react';
import { designTokens } from '@/config/design-tokens';
import { getCurrentLanguageCode, LANGUAGE_MAP, hasFullTranslations } from '@/config/languages';

interface AIHelpPanelProps {
  context?: string;
  className?: string;
}

interface HelpSuggestion {
  id: string;
  title: string;
  description: string;
  action?: () => void;
}

export default function AIHelpPanel({ context = 'general', className = '' }: AIHelpPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [suggestions, setSuggestions] = useState<HelpSuggestion[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load contextual suggestions based on current page/context
  useEffect(() => {
    const contextualSuggestions: Record<string, HelpSuggestion[]> = {
      general: [
        {
          id: 'getting-started',
          title: 'Getting Started',
          description: 'Learn how to create your first workflow in 2 minutes',
        },
        {
          id: 'best-practices',
          title: 'Best Practices',
          description: 'Tips for building reliable, efficient workflows',
        },
        {
          id: 'troubleshooting',
          title: 'Common Issues',
          description: 'Quick fixes for the most common workflow problems',
        },
      ],
      dashboard: [
        {
          id: 'create-workflow',
          title: 'Create Your First Workflow',
          description: 'Connect apps and automate tasks in minutes',
        },
        {
          id: 'monitor-runs',
          title: 'Monitor Workflow Runs',
          description: 'Track execution history and performance',
        },
        {
          id: 'optimize-usage',
          title: 'Optimize Your Usage',
          description: 'Get the most out of your plan limits',
        },
      ],
      pricing: [
        {
          id: 'choose-plan',
          title: 'Which Plan is Right for Me?',
          description: 'Compare features and find your perfect fit',
        },
        {
          id: 'trial-info',
          title: '7-Day Free Trial',
          description: 'Everything you need to know about the trial',
        },
        {
          id: 'upgrade-path',
          title: 'Upgrading Plans',
          description: 'How to scale as your needs grow',
        },
      ],
    };

    setSuggestions(contextualSuggestions[context] || contextualSuggestions.general);
  }, [context]);

  // Call real AI backend endpoint
  const handleAskQuestion = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    
    try {
      const currentLanguage = getCurrentLanguageCode();
      // Use proxy route to avoid CORS issues
      const response = await fetch("/api/ai/chat", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          language: currentLanguage,
          context: {
            page: context,
            timestamp: new Date().toISOString(),
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error('AI request failed');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Display the AI response
        alert(`AI Assistant: ${data.answer}`);
        
        // If there are steps, could display them in a better UI
        if (data.steps && data.steps.length > 0) {
          console.log('AI suggested steps:', data.steps);
        }
      } else {
        alert(`AI Assistant: ${data.error || 'Sorry, I couldn\'t process that question.'}`);
      }
    } catch (error) {
      console.error('AI chat error:', error);
      alert('AI Assistant: Sorry, I\'m having trouble right now. Please try again later.');
    } finally {
      setIsLoading(false);
      setQuery('');
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-popover bg-gradient-to-br from-primary-500 to-secondary-500 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-110 ${className}`}
        aria-label="Open AI Help"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-success-500 rounded-full animate-pulse"></span>
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className={`fixed bottom-6 right-6 z-popover ${className}`}>
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-white rounded-full shadow-xl p-3 hover:shadow-2xl transition-all border border-neutral-200"
          aria-label="Expand AI Help"
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full"></div>
            <span className="text-sm font-medium text-neutral-700">AI Help</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-popover w-96 bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="font-semibold">AI Assistant</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 hover:bg-white/20 rounded transition"
              aria-label="Minimize"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded transition"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {/* Quick Suggestions */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-neutral-700 mb-2">Quick Help</h4>
          <div className="space-y-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={suggestion.action}
                className="w-full text-left p-3 rounded-lg bg-neutral-50 hover:bg-primary-50 border border-neutral-200 hover:border-primary-300 transition-all group"
              >
                <div className="font-medium text-sm text-neutral-900 group-hover:text-primary-700">
                  {suggestion.title}
                </div>
                <div className="text-xs text-neutral-600 mt-1">
                  {suggestion.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Ask Question */}
        <div className="border-t border-neutral-200 pt-4">
          <h4 className="text-sm font-semibold text-neutral-700 mb-2">Ask me anything</h4>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
              placeholder="How do I...?"
              className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleAskQuestion}
              disabled={isLoading || !query.trim()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Ask'
              )}
            </button>
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Get instant answers about workflows, pricing, and features
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-200 p-3 bg-neutral-50">
        {!hasFullTranslations(getCurrentLanguageCode()) && (
          <p className="text-xs text-neutral-600 mb-2 text-center">
            AI answers are currently in English while we add full {LANGUAGE_MAP[getCurrentLanguageCode()]?.nativeLabel || 'language'} support.
          </p>
        )}
        <div className="text-center">
          <a
            href="/docs"
            className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            View Full Documentation →
          </a>
        </div>
      </div>
    </div>
  );
}
