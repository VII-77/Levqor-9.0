/**
 * Exit Intent Modal - Revenue Optimization
 * 
 * Triggers when user shows intent to leave pricing page
 * Reminds them of free trial benefits without changing pricing
 * 
 * SAFETY: Client-side only, non-intrusive, respects user intent
 */

'use client';

import { useState, useEffect } from 'react';
import { designTokens } from '@/config/design-tokens';

interface ExitIntentModalProps {
  onClose?: () => void;
}

export default function ExitIntentModal({ onClose }: ExitIntentModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Only show once per session
    if (hasShown) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse leaves at top of page (typical exit behavior)
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
      }
    };

    // Mobile: Show after inactivity
    let inactivityTimer: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        if (!hasShown) {
          setIsVisible(true);
          setHasShown(true);
        }
      }, 30000); // 30 seconds of inactivity
    };

    // Desktop: Mouse leave detection
    document.addEventListener('mouseleave', handleMouseLeave);
    
    // Mobile: Inactivity detection
    document.addEventListener('touchstart', resetTimer);
    document.addEventListener('scroll', resetTimer);
    resetTimer();

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('touchstart', resetTimer);
      document.removeEventListener('scroll', resetTimer);
      clearTimeout(inactivityTimer);
    };
  }, [hasShown]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleStartTrial = () => {
    // Scroll to plans section
    const plansSection = document.getElementById('plans') || document.querySelector('[data-plans]');
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: 'smooth' });
    }
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 pointer-events-auto transform transition-all duration-300 scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-neutral-100 rounded-lg transition"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Icon */}
          <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-neutral-900 mb-3">
              Not ready yet?
            </h3>
            <p className="text-neutral-600 text-lg mb-4">
              Start your 7-day free trial now and let Levqor's AI set up your first workflow.
            </p>
            <ul className="text-left space-y-2 text-sm text-neutral-700">
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Full access to all features for 7 days
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Card required, no charge if you cancel before Day 7
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                AI-powered setup, ready in minutes
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleStartTrial}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all shadow-md hover:shadow-lg"
            >
              Start Free Trial
            </button>
            <button
              onClick={handleClose}
              className="w-full px-6 py-3 text-neutral-600 hover:text-neutral-900 font-medium transition"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
