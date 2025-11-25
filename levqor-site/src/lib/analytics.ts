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
