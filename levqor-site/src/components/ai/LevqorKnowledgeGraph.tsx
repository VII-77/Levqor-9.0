/**
 * Levqor Knowledge Graph v1 (MEGA-PHASE 1 - STEP 6)
 * 
 * Visual knowledge base showing relationships between workflows, integrations, and concepts
 * Features:
 * - Interactive knowledge browser
 * - Related concepts suggestions
 * - Smart search
 * - Learning paths
 * 
 * SAFETY: Client-side only, additive feature, enhances discovery
 */

'use client';

import { useState } from 'react';

interface KnowledgeNode {
  id: string;
  title: string;
  type: 'concept' | 'integration' | 'workflow' | 'tutorial';
  description: string;
  related: string[];
}

interface LevqorKnowledgeGraphProps {
  initialTopic?: string;
  className?: string;
}

const KNOWLEDGE_NODES: Record<string, KnowledgeNode> = {
  'workflows': {
    id: 'workflows',
    title: 'Workflows',
    type: 'concept',
    description: 'Automated sequences that connect your apps and automate repetitive tasks.',
    related: ['triggers', 'actions', 'conditions', 'self-healing'],
  },
  'triggers': {
    id: 'triggers',
    title: 'Triggers',
    type: 'concept',
    description: 'Events that start a workflow, like receiving an email or a form submission.',
    related: ['workflows', 'webhooks', 'scheduling'],
  },
  'actions': {
    id: 'actions',
    title: 'Actions',
    type: 'concept',
    description: 'Steps that perform tasks, like sending an email or creating a database record.',
    related: ['workflows', 'integrations', 'api-calls'],
  },
  'conditions': {
    id: 'conditions',
    title: 'Conditions',
    type: 'concept',
    description: 'Logic that controls workflow execution based on data or criteria.',
    related: ['workflows', 'filters', 'branching'],
  },
  'self-healing': {
    id: 'self-healing',
    title: 'Self-Healing Workflows',
    type: 'concept',
    description: 'Workflows that automatically detect and fix common errors without manual intervention.',
    related: ['workflows', 'error-handling', 'retries'],
  },
  'integrations': {
    id: 'integrations',
    title: 'Integrations',
    type: 'concept',
    description: 'Connect to 50+ apps and services like Gmail, Slack, Salesforce, and Stripe.',
    related: ['workflows', 'actions', 'api-calls', 'oauth'],
  },
  'webhooks': {
    id: 'webhooks',
    title: 'Webhooks',
    type: 'tutorial',
    description: 'Receive real-time event data from external services to trigger workflows.',
    related: ['triggers', 'integrations', 'api-calls'],
  },
  'api-calls': {
    id: 'api-calls',
    title: 'API Calls',
    type: 'tutorial',
    description: 'Make HTTP requests to external APIs to fetch or send data.',
    related: ['actions', 'integrations', 'webhooks'],
  },
  'error-handling': {
    id: 'error-handling',
    title: 'Error Handling',
    type: 'concept',
    description: 'Strategies to handle failures gracefully and keep workflows running.',
    related: ['self-healing', 'retries', 'notifications'],
  },
  'retries': {
    id: 'retries',
    title: 'Automatic Retries',
    type: 'tutorial',
    description: 'Automatically retry failed steps with exponential backoff for transient errors.',
    related: ['error-handling', 'self-healing', 'rate-limiting'],
  },
  'rate-limiting': {
    id: 'rate-limiting',
    title: 'Rate Limiting',
    type: 'concept',
    description: 'Prevent exceeding API limits by adding delays between requests.',
    related: ['retries', 'api-calls', 'best-practices'],
  },
  'best-practices': {
    id: 'best-practices',
    title: 'Best Practices',
    type: 'tutorial',
    description: 'Learn proven patterns for building reliable, efficient workflows.',
    related: ['workflows', 'error-handling', 'optimization'],
  },
};

export default function LevqorKnowledgeGraph({ 
  initialTopic = 'workflows',
  className = '' 
}: LevqorKnowledgeGraphProps) {
  const [currentNode, setCurrentNode] = useState<string>(initialTopic);
  const [searchQuery, setSearchQuery] = useState('');
  const [visitedNodes, setVisitedNodes] = useState<Set<string>>(new Set([initialTopic]));

  const node = KNOWLEDGE_NODES[currentNode];
  const relatedNodes = node?.related.map(id => KNOWLEDGE_NODES[id]).filter(Boolean) || [];

  const handleNavigate = (nodeId: string) => {
    setCurrentNode(nodeId);
    setVisitedNodes(prev => new Set([...prev, nodeId]));
    setSearchQuery('');
  };

  const getNodeIcon = (type: KnowledgeNode['type']) => {
    switch (type) {
      case 'concept':
        return '💡';
      case 'integration':
        return '🔌';
      case 'workflow':
        return '⚡';
      case 'tutorial':
        return '📚';
    }
  };

  const getNodeColor = (type: KnowledgeNode['type']) => {
    switch (type) {
      case 'concept':
        return 'primary';
      case 'integration':
        return 'success';
      case 'workflow':
        return 'warning';
      case 'tutorial':
        return 'secondary';
    }
  };

  // Simple search
  const searchResults = searchQuery.trim()
    ? Object.values(KNOWLEDGE_NODES).filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  if (!node) {
    return (
      <div className={`bg-error-50 border border-error-200 rounded-xl p-6 ${className}`}>
        <p className="text-error-700">Knowledge node not found.</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Levqor Knowledge Graph</h2>
        <p className="text-primary-100">Explore concepts, integrations, and learn how everything connects</p>
      </div>

      {/* Search */}
      <div className="p-6 border-b border-neutral-200">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search knowledge base..."
            className="w-full px-4 py-3 pl-12 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {searchResults.slice(0, 5).map(result => (
              <button
                key={result.id}
                onClick={() => handleNavigate(result.id)}
                className="w-full text-left p-3 rounded-lg bg-neutral-50 hover:bg-primary-50 border border-neutral-200 hover:border-primary-300 transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getNodeIcon(result.type)}</span>
                  <div className="flex-1">
                    <div className="font-medium text-neutral-900">{result.title}</div>
                    <div className="text-xs text-neutral-600 mt-1">{result.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current Node */}
      {!searchQuery && (
        <div className="p-6">
          <div className="mb-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-neutral-600 mb-4">
              <button
                onClick={() => handleNavigate('workflows')}
                className="hover:text-primary-600 transition-colors"
              >
                Home
              </button>
              {currentNode !== 'workflows' && (
                <>
                  <span>→</span>
                  <span className="text-neutral-900 font-medium">{node.title}</span>
                </>
              )}
            </div>

            {/* Node Content */}
            <div className={`p-6 rounded-xl border-2 border-${getNodeColor(node.type)}-200 bg-${getNodeColor(node.type)}-50`}>
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">{getNodeIcon(node.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-neutral-900">{node.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded bg-${getNodeColor(node.type)}-100 text-${getNodeColor(node.type)}-700 border border-${getNodeColor(node.type)}-200`}>
                      {node.type}
                    </span>
                  </div>
                  <p className="text-neutral-700">{node.description}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors">
                  View Documentation
                </button>
                <button className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors">
                  See Examples
                </button>
              </div>
            </div>
          </div>

          {/* Related Nodes */}
          {relatedNodes.length > 0 && (
            <div>
              <h4 className="font-bold text-neutral-900 mb-4">Related Topics</h4>
              <div className="grid grid-cols-2 gap-3">
                {relatedNodes.map(related => (
                  <button
                    key={related.id}
                    onClick={() => handleNavigate(related.id)}
                    className="text-left p-4 rounded-lg bg-neutral-50 hover:bg-primary-50 border border-neutral-200 hover:border-primary-300 transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getNodeIcon(related.type)}</span>
                      <span className="font-semibold text-neutral-900 group-hover:text-primary-700 transition-colors">
                        {related.title}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 line-clamp-2">{related.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Learning Path */}
          <div className="mt-6 p-4 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border border-primary-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white flex-shrink-0">
                🎓
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-neutral-900 mb-1">Learning Path</h4>
                <p className="text-sm text-neutral-700">
                  You've explored {visitedNodes.size} topic{visitedNodes.size !== 1 ? 's' : ''}. 
                  Keep learning to master Levqor automation!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
