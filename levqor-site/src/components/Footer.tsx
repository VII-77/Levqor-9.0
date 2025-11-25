/**
 * Levqor Footer Component (MEGA-PHASE 1 - STEP 2)
 * 
 * Branded footer with design tokens and logo
 * 
 * SAFETY: Visual-only changes, maintains all existing links and legal text
 */

import { Link } from '@/i18n/routing';
import Logo from './Logo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <Logo size="md" className="[&_span]:text-white" />
            </div>
            <p className="text-sm mb-4 max-w-xs text-neutral-400">
              Automate work. Ship faster. Pay only for results. The self-driven automation engine for modern teams.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://twitter.com/levqor" 
                className="text-neutral-400 hover:text-primary-400 transition-colors" 
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a 
                href="https://github.com/levqor" 
                className="text-neutral-400 hover:text-primary-400 transition-colors" 
                aria-label="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Product Column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/pricing" className="hover:text-primary-400 transition-colors">Pricing</Link></li>
              <li><Link href="/docs" className="hover:text-primary-400 transition-colors">Docs</Link></li>
              <li><Link href="/integrations" className="hover:text-primary-400 transition-colors">Integrations</Link></li>
              <li><Link href="/how-it-works" className="hover:text-primary-400 transition-colors">How It Works</Link></li>
              <li><Link href="/use-cases" className="hover:text-primary-400 transition-colors">Use Cases</Link></li>
              <li><Link href="/tour" className="hover:text-primary-400 transition-colors">Product Tour</Link></li>
            </ul>
          </div>
          
          {/* Company Column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="hover:text-primary-400 transition-colors">About</Link></li>
              <li><Link href="/team" className="hover:text-primary-400 transition-colors">Team</Link></li>
              <li><Link href="/blog" className="hover:text-primary-400 transition-colors">Blog</Link></li>
              <li><Link href="/roadmap" className="hover:text-primary-400 transition-colors">Roadmap</Link></li>
              <li><Link href="/contact" className="hover:text-primary-400 transition-colors">Contact</Link></li>
              <li><Link href="/careers" className="hover:text-primary-400 transition-colors">Careers</Link></li>
              <li><Link href="/support" className="hover:text-primary-400 transition-colors">Support</Link></li>
            </ul>
          </div>
          
          {/* Legal Column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookies" className="hover:text-primary-400 transition-colors">Cookie Policy</Link></li>
              <li><Link href="/data-rights" className="hover:text-primary-400 transition-colors">Data Rights</Link></li>
              <li><Link href="/gdpr" className="hover:text-primary-400 transition-colors">GDPR</Link></li>
              <li><Link href="/dpa" className="hover:text-primary-400 transition-colors">DPA</Link></li>
              <li><Link href="/ai-transparency" className="hover:text-primary-400 transition-colors">AI Transparency</Link></li>
              <li><Link href="/security" className="hover:text-primary-400 transition-colors">Security</Link></li>
              <li><Link href="/guarantee" className="hover:text-primary-400 transition-colors">Guarantee</Link></li>
              <li><Link href="/fair-use" className="hover:text-primary-400 transition-colors">Fair Use</Link></li>
              <li><a href="https://api.levqor.ai/health" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">Status</a></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 pt-8 text-sm text-center">
          <p className="mb-2 text-neutral-400">&copy; {currentYear} Levqor Technologies Ltd. All rights reserved.</p>
          <p className="text-xs text-neutral-500">Company Number: 12345678 • Registered in England and Wales</p>
        </div>
      </div>
    </footer>
  );
}
