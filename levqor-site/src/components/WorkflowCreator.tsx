'use client';

import { useState } from 'react';
import NaturalLanguageWorkflowBuilder from '@/components/ai/NaturalLanguageWorkflowBuilder';

interface WorkflowStep {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  app: string;
  action: string;
  description: string;
}

export default function WorkflowCreator() {
  const [mode, setMode] = useState<'choice' | 'natural' | 'visual'>('choice');
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);

  const handleWorkflowCreated = (steps: WorkflowStep[]) => {
    setWorkflowSteps(steps);
    alert('Workflow created! In production, this would save to your backend and redirect to the workflow editor.');
    console.log('Workflow steps:', steps);
  };

  if (mode === 'choice') {
    return (
      <div className="space-y-6">
        {/* Mode Selection */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Natural Language */}
          <button
            onClick={() => setMode('natural')}
            className="text-left bg-white rounded-2xl p-8 border-2 border-neutral-200 hover:border-primary-500 hover:shadow-xl transition-all group"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-2xl flex-shrink-0">
                ✨
              </div>
              <div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">Natural Language</h3>
                <p className="text-neutral-600">
                  Describe what you want to automate in plain English. AI will build it for you.
                </p>
              </div>
            </div>
            <div className="pl-16">
              <div className="bg-neutral-50 rounded-lg p-3 text-sm text-neutral-700 mb-3 italic">
                "When I receive an urgent email, send it to Slack and create a task"
              </div>
              <div className="flex items-center gap-2 text-primary-600 font-semibold group-hover:gap-3 transition-all">
                <span>Start with AI</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          {/* Visual Builder */}
          <button
            onClick={() => setMode('visual')}
            className="text-left bg-white rounded-2xl p-8 border-2 border-neutral-200 hover:border-primary-500 hover:shadow-xl transition-all group"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-white text-2xl flex-shrink-0">
                🎨
              </div>
              <div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">Visual Builder</h3>
                <p className="text-neutral-600">
                  Drag and drop apps, triggers, and actions to build your workflow manually.
                </p>
              </div>
            </div>
            <div className="pl-16">
              <div className="bg-neutral-50 rounded-lg p-3 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 rounded bg-success-500 text-white flex items-center justify-center text-xs">1</div>
                  <span className="text-neutral-700">Gmail trigger →</span>
                  <div className="w-6 h-6 rounded bg-primary-500 text-white flex items-center justify-center text-xs">2</div>
                  <span className="text-neutral-700">Slack action</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-primary-600 font-semibold group-hover:gap-3 transition-all">
                <span>Open Visual Builder</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Quick Templates */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <h3 className="font-bold text-lg mb-4 text-neutral-900">Or start with a template</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: 'Email to Slack', icon: '📧', desc: 'Forward emails to a Slack channel' },
              { name: 'Form to Sheet', icon: '📝', desc: 'Save form responses to Google Sheets' },
              { name: 'CRM Welcome', icon: '👋', desc: 'Send welcome email to new contacts' },
            ].map((template, i) => (
              <button
                key={i}
                className="text-left p-4 rounded-lg bg-neutral-50 hover:bg-primary-50 border border-neutral-200 hover:border-primary-300 transition-all"
              >
                <div className="text-2xl mb-2">{template.icon}</div>
                <div className="font-semibold text-neutral-900 text-sm mb-1">{template.name}</div>
                <div className="text-xs text-neutral-600">{template.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'natural') {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setMode('choice')}
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to options
        </button>

        <NaturalLanguageWorkflowBuilder 
          onWorkflowCreated={handleWorkflowCreated}
          className="max-w-3xl mx-auto"
        />
      </div>
    );
  }

  if (mode === 'visual') {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setMode('choice')}
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to options
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-12 text-center">
          <div className="text-6xl mb-6">🚧</div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-3">Visual Builder Coming Soon</h2>
          <p className="text-lg text-neutral-600 mb-8 max-w-lg mx-auto">
            The drag-and-drop visual builder is currently in development. 
            In the meantime, try our Natural Language builder!
          </p>
          <button
            onClick={() => setMode('natural')}
            className="px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all shadow-lg hover:shadow-xl"
          >
            Try Natural Language Builder
          </button>
        </div>
      </div>
    );
  }

  return null;
}
