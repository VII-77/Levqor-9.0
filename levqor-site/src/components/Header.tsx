'use client';

import { Link } from '@/i18n/routing';
import Logo from './Logo';
import { LocaleSwitcher } from './LocaleSwitcher';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations('header');

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-sticky shadow-sm backdrop-blur-sm bg-white/95">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link 
            href="/" 
            className="transition-opacity hover:opacity-80"
            aria-label="Levqor Home"
          >
            <Logo size="md" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="/" 
              className="text-neutral-700 hover:text-primary-600 font-medium transition-colors"
            >
              {t('home')}
            </Link>
            <Link 
              href="/workflows/ai-create" 
              className="text-neutral-700 hover:text-primary-600 font-medium transition-colors flex items-center gap-1"
            >
              <span>🤖</span>
              <span>{t('aiBuilder')}</span>
            </Link>
            <Link 
              href="/workflows/library" 
              className="text-neutral-700 hover:text-primary-600 font-medium transition-colors"
            >
              {t('workflows')}
            </Link>
            <Link 
              href="/pricing" 
              className="text-neutral-700 hover:text-primary-600 font-medium transition-colors"
            >
              {t('pricing')}
            </Link>
            <Link 
              href="/docs" 
              className="text-neutral-700 hover:text-primary-600 font-medium transition-colors"
            >
              {t('docs')}
            </Link>
            <Link 
              href="/support" 
              className="text-neutral-700 hover:text-primary-600 font-medium transition-colors"
            >
              {t('support')}
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <LocaleSwitcher />
            <Link 
              href="/signin" 
              className="text-neutral-700 hover:text-primary-600 font-medium transition-colors hidden sm:block"
            >
              {t('signIn')}
            </Link>
            <Link 
              href="/signin" 
              className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md"
            >
              {t('startTrial')}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-4">
              <Link 
                href="/" 
                className="text-neutral-700 hover:text-primary-600 font-medium transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('home')}
              </Link>
              <Link 
                href="/workflows/ai-create" 
                className="text-neutral-700 hover:text-primary-600 font-medium transition-colors py-2 flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>🤖</span>
                <span>{t('aiBuilder')}</span>
              </Link>
              <Link 
                href="/workflows/library" 
                className="text-neutral-700 hover:text-primary-600 font-medium transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('workflows')}
              </Link>
              <Link 
                href="/pricing" 
                className="text-neutral-700 hover:text-primary-600 font-medium transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('pricing')}
              </Link>
              <Link 
                href="/docs" 
                className="text-neutral-700 hover:text-primary-600 font-medium transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('docs')}
              </Link>
              <Link 
                href="/support" 
                className="text-neutral-700 hover:text-primary-600 font-medium transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('support')}
              </Link>
              <Link 
                href="/signin" 
                className="text-neutral-700 hover:text-primary-600 font-medium transition-colors py-2 border-t border-neutral-200 pt-4 mt-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('signIn')}
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
