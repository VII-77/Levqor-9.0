'use client';

import { useState } from 'react';
import AIDebugAssistant from '@/components/ai/AIDebugAssistant';

interface WorkflowError {
  step: string;
  errorCode: string;
  errorMessage: string;
  timestamp: string;
}

const SAMPLE_ERRORS: WorkflowError[] = [
  {
    step: 'Gmail: New Email',
    errorCode: 'AUTH_FAILED',
    errorMessage: 'Authentication failed: Invalid credentials. Please re-authenticate your Gmail account.',
    timestamp: '2025-11-24T14:30:00Z',
  },
  {
    step: 'Slack: Send Message',
    errorCode: 'RATE_LIMIT',
    errorMessage: 'Rate limit exceeded: Too many requests. Maximum 50 requests per minute.',
    timestamp: '2025-11-24T14:25:00Z',
  },
  {
    step: 'Google Sheets: Add Row',
    errorCode: 'TIMEOUT',
    errorMessage: 'Request timeout after 30 seconds. The API did not respond in time.',
    timestamp: '2025-11-24T14:20:00Z',
  },
  {
    step: 'Salesforce: Create Contact',
    errorCode: '404',
    errorMessage: 'Resource not found: The specified contact ID does not exist.',
    timestamp: '2025-11-24T14:15:00Z',
  },
  {
    step: 'Stripe: Create Customer',
    errorCode: 'PERMISSION_DENIED',
    errorMessage: 'Permission denied: Your account does not have access to create customers.',
    timestamp: '2025-11-24T14:10:00Z',
  },
];

export default function WorkflowErrorsDashboard() {
  const [selectedError, setSelectedError] = useState<WorkflowError | null>(null);
  const [showAllErrors, setShowAllErrors] = useState(false);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="text-sm text-neutral-600 mb-1">Total Errors</div>
          <div className="text-3xl font-bold text-neutral-900">{SAMPLE_ERRORS.length}</div>
        </div>
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="text-sm text-neutral-600 mb-1">Auth Errors</div>
          <div className="text-3xl font-bold text-error-600">1</div>
        </div>
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="text-sm text-neutral-600 mb-1">Rate Limits</div>
          <div className="text-3xl font-bold text-warning-600">1</div>
        </div>
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="text-sm text-neutral-600 mb-1">Other</div>
          <div className="text-3xl font-bold text-neutral-600">3</div>
        </div>
      </div>

      {/* Selected Error with AI Debug */}
      {selectedError ? (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedError(null)}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to all errors
          </button>

          <AIDebugAssistant error={selectedError} />
        </div>
      ) : (
        <>
          {/* Error List */}
          <div className="bg-white rounded-xl shadow border border-neutral-200">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-900">Recent Errors</h2>
                <button
                  onClick={() => setShowAllErrors(!showAllErrors)}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  {showAllErrors ? 'Show Less' : 'Show All'}
                </button>
              </div>
            </div>

            <div className="divide-y divide-neutral-200">
              {(showAllErrors ? SAMPLE_ERRORS : SAMPLE_ERRORS.slice(0, 3)).map((error, index) => (
                <div
                  key={index}
                  className="p-6 hover:bg-neutral-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedError(error)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-error-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-error-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-neutral-900">{error.step}</h3>
                        <span className="text-xs text-neutral-500">
                          {new Date(error.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-700 mb-2">{error.errorMessage}</p>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-mono bg-error-50 text-error-700 px-2 py-1 rounded">
                          {error.errorCode}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedError(error);
                          }}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          Get AI Help
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Help - No Errors State */}
          <div className="bg-gradient-to-br from-success-50 to-primary-50 rounded-xl p-8 border border-success-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-success-500 flex items-center justify-center text-white text-2xl flex-shrink-0">
                💡
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Prevent Future Errors</h3>
                <p className="text-neutral-700 mb-4">
                  Click any error above to get AI-powered debugging help including step-by-step fixes and prevention tips.
                </p>
                <ul className="space-y-2 text-sm text-neutral-700">
                  <li className="flex items-start gap-2">
                    <span className="text-success-600">✓</span>
                    <span>Enable automatic retries for transient errors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success-600">✓</span>
                    <span>Set up error notifications to catch issues early</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success-600">✓</span>
                    <span>Use self-healing workflows to automatically fix common problems</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
