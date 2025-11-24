/**
 * AI Debug Assistant (MEGA-PHASE 1 - STEP 3)
 * 
 * Intelligent error explanation and debugging suggestions
 * Analyzes workflow errors and provides human-friendly explanations
 * 
 * SAFETY: Client-side only, helps users understand errors, additive feature
 */

'use client';

import { useState } from 'react';

interface WorkflowError {
  step: string;
  errorCode: string;
  errorMessage: string;
  timestamp: string;
}

interface AIDebugAssistantProps {
  error?: WorkflowError;
  onFixSuggested?: (fix: string) => void;
  className?: string;
}

interface DebugSuggestion {
  title: string;
  explanation: string;
  fixes: string[];
  preventionTips?: string[];
}

export default function AIDebugAssistant({ error, onFixSuggested, className = '' }: AIDebugAssistantProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState<DebugSuggestion | null>(null);

  // Simulate AI error analysis (in production, calls AI backend)
  const analyzeError = async (err: WorkflowError): Promise<DebugSuggestion> => {
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Pattern matching for common errors (production uses AI/LLM)
    const errorPatterns: Record<string, DebugSuggestion> = {
      'auth': {
        title: 'Authentication Failed',
        explanation: 'The app couldn\'t connect because the authentication credentials are invalid or expired. This usually happens when you change your password or revoke app access.',
        fixes: [
          'Re-authenticate the app in your integrations settings',
          'Check if you recently changed your password',
          'Verify the app still has permission to access your account',
          'Try disconnecting and reconnecting the integration',
        ],
        preventionTips: [
          'Use app-specific passwords when available',
          'Enable automatic token refresh',
          'Set up auth expiration alerts',
        ],
      },
      'rate': {
        title: 'Rate Limit Exceeded',
        explanation: 'You\'ve made too many requests to this app in a short time. Most apps have limits to prevent abuse and ensure fair usage for all users.',
        fixes: [
          'Add a delay between workflow steps (recommended: 2-5 seconds)',
          'Reduce the workflow trigger frequency',
          'Check if you can upgrade your API plan with the provider',
          'Batch operations instead of individual requests',
        ],
        preventionTips: [
          'Always include delays between API calls',
          'Use batch endpoints when available',
          'Monitor your usage against provider limits',
        ],
      },
      'timeout': {
        title: 'Request Timeout',
        explanation: 'The app took too long to respond. This could be due to slow internet, the app being overloaded, or processing a large amount of data.',
        fixes: [
          'Increase the timeout setting for this step (Settings → Timeout)',
          'Process smaller batches of data at a time',
          'Check if the target app is experiencing issues',
          'Try running the workflow during off-peak hours',
        ],
        preventionTips: [
          'Set realistic timeout values (30-60s for most operations)',
          'Process data in smaller chunks',
          'Add retry logic for timeout-prone steps',
        ],
      },
      'not.*found|404': {
        title: 'Resource Not Found',
        explanation: 'The workflow tried to access data that doesn\'t exist or has been deleted. This often happens when an item is removed between when the workflow starts and when it tries to use it.',
        fixes: [
          'Verify the item still exists in the source app',
          'Update any hardcoded IDs in your workflow',
          'Add a condition to check if the item exists before using it',
          'Use dynamic references instead of fixed IDs',
        ],
        preventionTips: [
          'Always check if items exist before operating on them',
          'Use filters to handle missing data gracefully',
          'Avoid hardcoding IDs - use dynamic lookups',
        ],
      },
      'permission|forbidden|403': {
        title: 'Permission Denied',
        explanation: 'You don\'t have the required permissions to perform this action. The app or user account may not have sufficient access rights.',
        fixes: [
          'Check your permissions in the target app',
          'Verify you\'re using an account with admin/write access',
          'Re-authenticate with the correct user account',
          'Contact your admin to grant the necessary permissions',
        ],
        preventionTips: [
          'Use service accounts with appropriate permissions',
          'Document required permissions for each integration',
          'Test workflows with the actual user account permissions',
        ],
      },
    };

    // Find matching error pattern
    const pattern = Object.keys(errorPatterns).find(p => 
      new RegExp(p, 'i').test(err.errorMessage) || new RegExp(p, 'i').test(err.errorCode)
    );

    if (pattern) {
      return errorPatterns[pattern];
    }

    // Default fallback suggestion
    return {
      title: 'Workflow Error Detected',
      explanation: `The workflow encountered an error: "${err.errorMessage}". This error occurred at step "${err.step}".`,
      fixes: [
        'Check the error details in the workflow logs',
        'Verify all app connections are active',
        'Test the failing step in isolation',
        'Review recent changes to this workflow',
        'Contact support if the issue persists',
      ],
      preventionTips: [
        'Enable error notifications for this workflow',
        'Add error handling steps',
        'Test thoroughly before deploying to production',
      ],
    };
  };

  const handleAnalyze = async () => {
    if (!error) return;
    
    setIsAnalyzing(true);
    const result = await analyzeError(error);
    setSuggestion(result);
    setIsAnalyzing(false);
  };

  if (!error) {
    return (
      <div className={`bg-success-50 border border-success-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-success-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-success-900 mb-1">All Systems Running</h4>
            <p className="text-sm text-success-700">No errors detected. Your workflows are running smoothly!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-error-200 ${className}`}>
      {/* Error Header */}
      <div className="bg-error-50 border-b border-error-200 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <svg className="w-6 h-6 text-error-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-error-900 mb-1">Workflow Error Detected</h3>
            <p className="text-sm text-error-700 mb-2">
              <span className="font-medium">Step:</span> {error.step}
            </p>
            <div className="bg-white rounded-lg p-3 border border-error-200">
              <p className="text-xs font-mono text-error-800">{error.errorMessage}</p>
              <p className="text-xs text-error-600 mt-1">Code: {error.errorCode}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Section */}
      <div className="p-4">
        {!suggestion ? (
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full px-4 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-secondary-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                AI is analyzing the error...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Get AI Debug Assistance
              </>
            )}
          </button>
        ) : (
          <div className="space-y-4">
            {/* Explanation */}
            <div>
              <h4 className="font-bold text-neutral-900 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {suggestion.title}
              </h4>
              <p className="text-sm text-neutral-700 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                {suggestion.explanation}
              </p>
            </div>

            {/* Suggested Fixes */}
            <div>
              <h4 className="font-bold text-neutral-900 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Suggested Fixes
              </h4>
              <ol className="space-y-2">
                {suggestion.fixes.map((fix, index) => (
                  <li key={index} className="flex gap-3 text-sm">
                    <span className="font-bold text-primary-600 min-w-[1.5rem]">{index + 1}.</span>
                    <span className="text-neutral-700">{fix}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Prevention Tips */}
            {suggestion.preventionTips && suggestion.preventionTips.length > 0 && (
              <div className="border-t border-neutral-200 pt-4">
                <h4 className="font-bold text-neutral-900 mb-2 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Prevent This in the Future
                </h4>
                <ul className="space-y-1.5">
                  {suggestion.preventionTips.map((tip, index) => (
                    <li key={index} className="flex gap-2 text-xs text-neutral-600">
                      <span className="text-warning-500">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSuggestion(null)}
                className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors text-sm"
              >
                Analyze Again
              </button>
              <button
                onClick={() => window.open('/docs/troubleshooting', '_blank')}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors text-sm"
              >
                View Docs
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
