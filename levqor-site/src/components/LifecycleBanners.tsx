"use client";

import { useState, useEffect } from 'react';
import { getApiBase } from '@/lib/api-config';

interface LifecycleBanner {
  day: number;
  type: 'quick_start' | 'workflow_suggestions' | 'upgrade_benefits' | 'trial_ending' | 'dfy_upsell' | 'roi_summary';
  title: string;
  description: string;
  cta: string;
  ctaLink: string;
  variant: 'info' | 'warning' | 'success';
}

const LIFECYCLE_BANNERS: Record<string, LifecycleBanner> = {
  quick_start: {
    day: 1,
    type: 'quick_start',
    title: 'Welcome to Levqor! 🎉',
    description: 'Complete these quick-start tasks to get the most out of your trial: (1) Create your first workflow, (2) Connect an integration, (3) Set up retention policies',
    cta: 'Start Quick Setup',
    ctaLink: '/workflows/new',
    variant: 'success'
  },
  workflow_suggestions: {
    day: 3,
    type: 'workflow_suggestions',
    title: 'Level up your workflows',
    description: 'Based on your setup, we recommend: (1) Add Slack notifications for backup failures, (2) Set up weekly compliance reports, (3) Enable automatic archiving for old data',
    cta: 'View Suggestions',
    ctaLink: '/workflows',
    variant: 'info'
  },
  upgrade_benefits: {
    day: 6,
    type: 'upgrade_benefits',
    title: 'Unlock more with Growth tier',
    description: 'Upgrade to unlock team collaboration, priority support (24h SLA), advanced workflows, and custom integrations. Plus save 16% with annual billing!',
    cta: 'See Pricing',
    ctaLink: '/pricing',
    variant: 'info'
  },
  trial_ending: {
    day: 7,
    type: 'trial_ending',
    title: '⚠️ Trial ending today',
    description: 'Your 7-day free trial ends today. Upgrade now to keep your workflows, data, and settings. Cancel anytime with our 30-day refund policy.',
    cta: 'Upgrade Now',
    ctaLink: '/pricing',
    variant: 'warning'
  },
  dfy_upsell: {
    day: 10,
    type: 'dfy_upsell',
    title: 'Done-For-You Implementation',
    description: 'Let our experts handle your setup! DFY packages include: custom workflow design, integration setup, team training, and ongoing support. From £149.',
    cta: 'Explore DFY Packages',
    ctaLink: '/pricing',
    variant: 'info'
  },
  roi_summary: {
    day: 30,
    type: 'roi_summary',
    title: 'Your Levqor ROI Summary',
    description: 'In 30 days you\'ve: backed up X GB of data, automated Y workflows, saved Z hours of manual work. Export your usage report to share with stakeholders.',
    cta: 'Export Report',
    ctaLink: '/dashboard/v2',
    variant: 'success'
  }
};

export default function LifecycleBanners({ userId }: { userId?: string }) {
  const [banner, setBanner] = useState<LifecycleBanner | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Fetch current lifecycle day from backend
    fetch(`${getApiBase()}/api/marketing/lifecycle/user/${userId}/current_day`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.banner_type && data.banner_type !== 'none') {
          const bannerData = LIFECYCLE_BANNERS[data.banner_type];
          if (bannerData) {
            setBanner(bannerData);
          }
        }
      })
      .catch(err => {
        console.error('Failed to fetch lifecycle banner:', err);
      });
  }, [userId]);

  if (!banner || dismissed) return null;

  const variantStyles = {
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-100',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-100',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100'
  };

  return (
    <div className={`${variantStyles[banner.variant]} border rounded-lg p-4 mb-6 flex items-start gap-4`}>
      <div className="flex-1">
        <h3 className="font-semibold mb-1">{banner.title}</h3>
        <p className="text-sm opacity-90">{banner.description}</p>
      </div>
      <div className="flex items-center gap-2">
        <a
          href={banner.ctaLink}
          className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
        >
          {banner.cta}
        </a>
        <button
          onClick={() => setDismissed(true)}
          className="text-white/50 hover:text-white/80 transition-all"
          aria-label="Dismiss"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
