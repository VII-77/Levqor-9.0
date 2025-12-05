type EventProperties = Record<string, string | number | boolean | undefined>;

const isDev = process.env.NODE_ENV === 'development';

export function trackEvent(name: string, properties?: EventProperties) {
  if (typeof window === 'undefined') return;
  
  const eventData = {
    event: name,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    ...properties,
  };

  if (isDev) {
    console.log('[Analytics]', name, properties || {});
  }

  try {
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', name, properties);
    }
  } catch (e) {
  }

  sendToBackend(name, eventData).catch(() => {});
}

async function sendToBackend(eventName: string, eventData: Record<string, unknown>): Promise<void> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl || isDev) return;

  try {
    await fetch(`${apiUrl}/api/telemetry/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventName, ...eventData }),
    });
  } catch {
  }
}

export function trackPageView(page: string) {
  trackEvent('page_view', { page });
}

export function trackCTAClick(ctaName: string, location?: string) {
  trackEvent('cta_click', { cta_name: ctaName, location });
}

export function trackTemplateClick(templateId: string, templateName: string) {
  trackEvent('template_click', { template_id: templateId, template_name: templateName });
}

export function trackBuilderAction(action: string, details?: EventProperties) {
  trackEvent('builder_action', { action, ...details });
}

export function trackAuth(action: 'login' | 'signup' | 'logout', method?: string) {
  trackEvent('auth', { action, method });
}

export function trackOnboarding(step: number, completed: boolean) {
  trackEvent('onboarding', { step, completed });
}

export function trackConversion(type: 'trial_start' | 'upgrade' | 'checkout_start', planId?: string) {
  trackEvent('conversion', { type, plan_id: planId });
}

export function trackProductView(slug: string, productName: string) {
  trackEvent('view_product_page', { slug, product_name: productName });
}

export function trackPrimaryCTA(slug: string, gumroadUrl: string) {
  trackEvent('click_primary_cta', { slug, gumroad_url: gumroadUrl });
}

export function trackBuyNow(slug: string, gumroadUrl: string, source: string) {
  trackEvent('click_buy_now', { slug, gumroad_url: gumroadUrl, source });
}

export function trackSecondaryCTA(slug: string, action: string) {
  trackEvent('click_secondary_cta', { slug, action });
}
