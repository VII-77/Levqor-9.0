"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type BannerType = "day1" | "day3" | "day7" | "day10" | "day30" | null;

export default function LifecycleBanner() {
  const [bannerType, setBannerType] = useState<BannerType>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const accountCreatedAt = localStorage.getItem("accountCreatedAt");
    if (!accountCreatedAt) {
      localStorage.setItem("accountCreatedAt", new Date().toISOString());
      setBannerType("day1");
      return;
    }

    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(accountCreatedAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    const dismissed = localStorage.getItem(`lifecycle_banner_${daysSinceCreation}`);
    if (dismissed) {
      setIsVisible(false);
      return;
    }

    if (daysSinceCreation === 1) setBannerType("day1");
    else if (daysSinceCreation === 3) setBannerType("day3");
    else if (daysSinceCreation === 7) setBannerType("day7");
    else if (daysSinceCreation === 10) setBannerType("day10");
    else if (daysSinceCreation === 30) setBannerType("day30");
    else setIsVisible(false);
  }, []);

  const handleDismiss = () => {
    if (bannerType) {
      localStorage.setItem(`lifecycle_banner_${bannerType}`, "true");
    }
    setIsVisible(false);
  };

  if (!isVisible || !bannerType) return null;

  const banners = {
    day1: {
      icon: "🎉",
      title: "Welcome aboard!",
      message: "You're on Day 1 of your 7-day free trial. Create your first workflow to see the magic.",
      cta: "Create Workflow",
      ctaLink: "/workflows/new",
      bg: "from-primary-500 to-primary-600"
    },
    day3: {
      icon: "⚡",
      title: "Quick tip for Day 3",
      message: "Users who build 3+ workflows in their first week are 5x more likely to become paying customers.",
      cta: "Browse Templates",
      ctaLink: "/workflows/library",
      bg: "from-secondary-500 to-secondary-600"
    },
    day7: {
      icon: "⏰",
      title: "Your trial ends tomorrow",
      message: "Don't lose access to your workflows! Review our plans to continue automating.",
      cta: "View Pricing",
      ctaLink: "/pricing",
      bg: "from-warning-500 to-warning-600"
    },
    day10: {
      icon: "💪",
      title: "Still with us?",
      message: "We noticed you haven't upgraded yet. Need help? Book a free consultation with our team.",
      cta: "Book Consultation",
      ctaLink: "/consultation",
      bg: "from-success-500 to-success-600"
    },
    day30: {
      icon: "🎯",
      title: "30-day check-in",
      message: "You've been with us for a month! Share your automation story and get featured in our community.",
      cta: "Share Story",
      ctaLink: "/community",
      bg: "from-error-500 to-error-600"
    }
  };

  const banner = banners[bannerType];

  return (
    <div className={`relative bg-gradient-to-r ${banner.bg} text-white p-6 rounded-xl shadow-lg mb-6 animate-fade-in-up`}>
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex items-start gap-4 pr-8">
        <div className="text-4xl flex-shrink-0">{banner.icon}</div>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">{banner.title}</h3>
          <p className="text-white/90 mb-4">{banner.message}</p>
          <Link
            href={banner.ctaLink}
            className="inline-block px-6 py-3 bg-white text-neutral-900 rounded-lg font-semibold hover:bg-neutral-50 transition-all shadow"
          >
            {banner.cta} →
          </Link>
        </div>
      </div>
    </div>
  );
}
