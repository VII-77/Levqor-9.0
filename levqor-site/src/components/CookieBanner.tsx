'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'levqor-cookie-consent-v1';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setShowBanner(true);
      setTimeout(() => setIsVisible(true), 100);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      accepted: true,
      analytics: true,
      functional: true,
      timestamp: new Date().toISOString()
    }));
    closeBanner();
  };

  const handleEssentialOnly = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      accepted: true,
      analytics: false,
      functional: false,
      timestamp: new Date().toISOString()
    }));
    closeBanner();
  };

  const closeBanner = () => {
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
  };

  if (!showBanner) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div className="bg-white border-t-2 border-gray-200 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Cookie icon and message */}
            <div className="flex items-start gap-3 flex-1">
              <div className="text-3xl flex-shrink-0">🍪</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg mb-1">
                  We Value Your Privacy
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We use cookies to enhance your experience, keep you logged in, and understand how you use our platform. 
                  By clicking "Accept All", you consent to optional analytics and functional cookies. 
                  You can choose "Essential Only" to use only required cookies.{' '}
                  <Link href="/cookies" className="text-blue-600 hover:underline font-medium">
                    Learn more
                  </Link>
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={handleEssentialOnly}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all whitespace-nowrap"
              >
                Essential Only
              </button>
              <button
                onClick={handleAccept}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all whitespace-nowrap"
              >
                Accept All Cookies
              </button>
            </div>
          </div>

          {/* Additional links */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
              <Link href="/privacy" className="hover:text-blue-600 hover:underline">
                Privacy Policy
              </Link>
              <Link href="/cookies" className="hover:text-blue-600 hover:underline">
                Cookie Policy
              </Link>
              <Link href="/data-rights" className="hover:text-blue-600 hover:underline">
                Your Data Rights
              </Link>
              <Link href="/gdpr" className="hover:text-blue-600 hover:underline">
                GDPR Info
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
