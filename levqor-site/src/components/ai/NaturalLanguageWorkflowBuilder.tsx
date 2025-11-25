/**
 * Natural Language Workflow Builder (MEGA-PHASE 1 - STEP 3)
 * 
 * AI-powered workflow creation using natural language input
 * Users describe what they want to automate, AI suggests the workflow
 * 
 * SAFETY: Client-side only, additive feature, no backend changes required
 */

'use client';

import { useState } from 'react';
import { getCurrentLanguageCode, hasFullTranslations } from '@/config/languages';

interface WorkflowStep {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  app: string;
  action: string;
  description: string;
}

interface NLWBuilderProps {
  onWorkflowCreated?: (steps: WorkflowStep[]) => void;
  className?: string;
}

export default function NaturalLanguageWorkflowBuilder({ onWorkflowCreated, className = '' }: NLWBuilderProps) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestedWorkflow, setSuggestedWorkflow] = useState<WorkflowStep[] | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);

  // Call real AI backend endpoint
  const processNaturalLanguage = async (text: string): Promise<WorkflowStep[]> => {
    try {
      const currentLanguage = getCurrentLanguageCode();
      // Use proxy route to avoid CORS issues
      const response = await fetch("/api/ai/workflow", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: text,
          language: currentLanguage,
          context: {
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('AI workflow request failed');
      }

      const data = await response.json();

      if (data.success && data.steps) {
        // Convert backend response to WorkflowStep format
        return data.steps.map((step: any, index: number) => ({
          id: (index + 1).toString(),
          type: step.type as 'trigger' | 'action' | 'condition' | 'notification',
          app: step.label,
          action: step.label,
          description: step.description,
        }));
      } else {
        throw new Error('Invalid AI response');
      }
    } catch (error) {
      console.error('AI workflow error:', error);
      // Fallback workflow on error
      return [
        {
          id: '1',
          type: 'trigger',
          app: 'Your App',
          action: 'Event Occurs',
          description: 'When something happens in your app',
        },
        {
          id: '2',
          type: 'action',
          app: 'Target App',
          action: 'Perform Action',
          description: 'Do something automatically',
        },
      ];
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setIsProcessing(true);
    const workflow = await processNaturalLanguage(input);
    setSuggestedWorkflow(workflow);
    setIsProcessing(false);
  };

  const handleAcceptWorkflow = () => {
    if (suggestedWorkflow && onWorkflowCreated) {
      onWorkflowCreated(suggestedWorkflow);
    }
    // Reset
    setInput('');
    setSuggestedWorkflow(null);
  };

  return (
    <div className={`${className}`}>
      {!showBuilder ? (
        <button
          onClick={() => setShowBuilder(true)}
          className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Build with Natural Language
        </button>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-6 max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-1">Natural Language Builder</h3>
              <p className="text-sm text-neutral-600">Describe what you want to automate, we'll build it for you</p>
            </div>
            <button
              onClick={() => setShowBuilder(false)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Input Section */}
          {!suggestedWorkflow && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Describe your automation
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Example: When I receive an email with 'urgent' in the subject, send a message to my Slack team channel"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows={4}
                  disabled={isProcessing}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!input.trim() || isProcessing}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    AI is building your workflow...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Workflow
                  </>
                )}
              </button>

              {/* Examples */}
              <div className="border-t border-neutral-200 pt-4 mt-6">
                <p className="text-xs font-medium text-neutral-600 mb-3">Try these examples:</p>
                <div className="space-y-2">
                  {[
                    'When a form is submitted, add it to a Google Sheet and send a confirmation email',
                    'Send urgent emails from my boss to Slack immediately',
                    'When a new contact is added to my CRM, send them a welcome email',
                  ].map((example, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(example)}
                      className="text-left w-full p-2 text-xs text-primary-600 hover:bg-primary-50 rounded-lg transition"
                    >
                      "{example}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Suggested Workflow */}
          {suggestedWorkflow && (
            <div className="space-y-4">
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-primary-900 mb-1">Workflow Generated!</h4>
                    <p className="text-sm text-primary-700">Here's what your automation will do:</p>
                  </div>
                </div>
              </div>

              {/* Workflow Steps */}
              <div className="space-y-3">
                {suggestedWorkflow.map((step, index) => (
                  <div key={step.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                        step.type === 'trigger' ? 'bg-success-500' : 
                        step.type === 'condition' ? 'bg-warning-500' : 
                        'bg-primary-500'
                      }`}>
                        {index + 1}
                      </div>
                      {index < suggestedWorkflow.length - 1 && (
                        <div className="w-0.5 h-full bg-neutral-300 my-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-neutral-500 uppercase">{step.type}</span>
                        <span className="text-sm font-bold text-neutral-900">{step.app}</span>
                      </div>
                      <p className="text-sm text-neutral-700 font-medium">{step.action}</p>
                      <p className="text-xs text-neutral-600 mt-1">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAcceptWorkflow}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                >
                  Create This Workflow
                </button>
                <button
                  onClick={() => {
                    setSuggestedWorkflow(null);
                    setInput('');
                  }}
                  className="px-6 py-3 border-2 border-neutral-300 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-50 transition-colors"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
