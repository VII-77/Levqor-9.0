/**
 * AI Onboarding Tutor (MEGA-PHASE 1 - STEP 4)
 * 
 * Interactive onboarding guide for first-time users
 * Features:
 * - Step-by-step tutorials
 * - Contextual tips
 * - Progress tracking
 * - Personalized guidance
 * 
 * SAFETY: Client-side only, additive feature, enhances onboarding UX
 */

'use client';

import { useState, useEffect } from 'react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  action?: string;
  completed?: boolean;
}

interface AIOnboardingTutorProps {
  userName?: string;
  onComplete?: () => void;
  className?: string;
}

const ONBOARDING_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Levqor!',
    description: 'Let me show you around. I\'ll guide you through creating your first automation in just a few minutes.',
  },
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    description: 'This is your command center. Here you can see all your workflows, monitor performance, and track usage.',
    action: 'Explore Dashboard',
  },
  {
    id: 'create-workflow',
    title: 'Create Your First Workflow',
    description: 'Workflows automate repetitive tasks. You can use natural language or our visual builder to create them.',
    action: 'Create Workflow',
  },
  {
    id: 'connect-apps',
    title: 'Connect Your Apps',
    description: 'Connect the apps and services you use daily. We support 50+ integrations including Gmail, Slack, Salesforce, and more.',
    action: 'View Integrations',
  },
  {
    id: 'test-workflow',
    title: 'Test and Deploy',
    description: 'Always test your workflows before deploying. You can see execution logs and fix issues with AI assistance.',
    action: 'Learn More',
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'You now know the basics. Explore our templates, check out advanced features, or start building!',
  },
];

export default function AIOnboardingTutor({ 
  userName = 'there', 
  onComplete,
  className = '' 
}: AIOnboardingTutorProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  // Check if onboarding was previously completed
  useEffect(() => {
    const completed = localStorage.getItem('levqor_onboarding_completed');
    if (completed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleNext = () => {
    const step = ONBOARDING_STEPS[currentStep];
    setCompletedSteps(prev => new Set([...prev, step.id]));
    
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsDismissed(true);
    localStorage.setItem('levqor_onboarding_skipped', 'true');
  };

  const handleComplete = () => {
    setIsDismissed(true);
    localStorage.setItem('levqor_onboarding_completed', 'true');
    if (onComplete) {
      onComplete();
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setIsDismissed(false);
    localStorage.removeItem('levqor_onboarding_completed');
    localStorage.removeItem('levqor_onboarding_skipped');
  };

  if (isDismissed) {
    return (
      <button
        onClick={handleRestart}
        className={`fixed bottom-24 right-6 z-popover bg-white border-2 border-primary-300 text-primary-700 px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all text-sm font-medium hover:scale-105 ${className}`}
        aria-label="Restart Tutorial"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Restart Tutorial
        </div>
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className={`fixed bottom-6 right-6 z-popover ${className}`}>
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-white rounded-full shadow-xl p-3 hover:shadow-2xl transition-all border-2 border-primary-500"
          aria-label="Expand Tutorial"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
              {currentStep + 1}/{ONBOARDING_STEPS.length}
            </div>
            <span className="text-sm font-semibold text-neutral-700 pr-2">Tutorial in Progress</span>
          </div>
        </button>
      </div>
    );
  }

  const step = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <div className={`fixed bottom-6 right-6 z-popover w-96 bg-white rounded-2xl shadow-2xl border-2 border-primary-200 overflow-hidden ${className}`}>
      {/* Progress Bar */}
      <div className="h-2 bg-neutral-100">
        <div 
          className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
              {currentStep + 1}
            </div>
            <h3 className="font-bold">AI Tutor</h3>
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
              onClick={handleSkip}
              className="p-1 hover:bg-white/20 rounded transition"
              aria-label="Skip Tutorial"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="text-sm opacity-90">
          Step {currentStep + 1} of {ONBOARDING_STEPS.length}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Avatar */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center text-2xl flex-shrink-0">
            🤖
          </div>
          <div className="flex-1">
            {currentStep === 0 && (
              <p className="text-sm text-neutral-600 mb-4">
                Hi {userName}! 👋
              </p>
            )}
            <h4 className="font-bold text-xl text-neutral-900 mb-2">{step.title}</h4>
            <p className="text-neutral-700">{step.description}</p>
          </div>
        </div>

        {/* Action Button */}
        {step.action && (
          <button
            className="w-full mb-4 px-4 py-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 rounded-lg text-neutral-700 font-medium transition-colors flex items-center justify-between"
          >
            <span>{step.action}</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-4 py-2 border-2 border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            {currentStep === ONBOARDING_STEPS.length - 1 ? 'Complete' : 'Next'}
          </button>
        </div>

        {/* Skip Option */}
        <button
          onClick={handleSkip}
          className="w-full mt-3 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          Skip tutorial
        </button>
      </div>

      {/* Step Indicators */}
      <div className="px-6 pb-4">
        <div className="flex gap-1.5 justify-center">
          {ONBOARDING_STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentStep
                  ? 'w-8 bg-primary-600'
                  : i < currentStep
                  ? 'w-2 bg-success-500'
                  : 'w-2 bg-neutral-300'
              }`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
