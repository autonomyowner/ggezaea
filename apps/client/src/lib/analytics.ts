// Google Analytics 4 Event Tracking Utility
// Measurement ID: G-X3NN5L7W36

type GtagEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'js',
      targetId: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config?: Record<string, any>
    ) => void;
  }
}

// Check if gtag is available
const isGtagAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

// Generic event tracker
export const trackEvent = ({ action, category, label, value, ...rest }: GtagEvent): void => {
  if (!isGtagAvailable()) return;

  window.gtag?.('event', action, {
    event_category: category,
    event_label: label,
    value,
    ...rest,
  });
};

// ============================================
// CONVERSION EVENTS
// ============================================

// Track when a user signs up successfully
export const trackSignup = (method: 'email' | 'google' | 'apple' = 'email'): void => {
  trackEvent({
    action: 'sign_up',
    category: 'engagement',
    method,
  });
};

// Track Pro upgrade initiation (checkout started)
export const trackBeginCheckout = (billing: 'monthly' | 'yearly', value: number): void => {
  trackEvent({
    action: 'begin_checkout',
    category: 'ecommerce',
    label: billing,
    value,
    currency: 'USD',
    items: [
      {
        item_id: 'pro_subscription',
        item_name: 'WA3i Pro',
        item_category: 'subscription',
        price: value,
        quantity: 1,
      },
    ],
  });
};

// Track successful Pro upgrade (purchase complete)
export const trackPurchase = (
  billing: 'monthly' | 'yearly',
  value: number,
  transactionId?: string
): void => {
  trackEvent({
    action: 'purchase',
    category: 'ecommerce',
    label: billing,
    value,
    currency: 'USD',
    transaction_id: transactionId || `wa3i_${Date.now()}`,
    items: [
      {
        item_id: 'pro_subscription',
        item_name: 'WA3i Pro',
        item_category: 'subscription',
        price: value,
        quantity: 1,
      },
    ],
  });
};

// ============================================
// SESSION EVENTS
// ============================================

// Track voice session start
export const trackVoiceSessionStart = (
  sessionType: 'general-therapy' | 'flash-technique' | 'crisis-support' = 'general-therapy'
): void => {
  trackEvent({
    action: 'voice_session_start',
    category: 'engagement',
    label: sessionType,
    session_type: sessionType,
  });
};

// Track voice session end
export const trackVoiceSessionEnd = (
  sessionType: string,
  durationSeconds: number
): void => {
  trackEvent({
    action: 'voice_session_end',
    category: 'engagement',
    label: sessionType,
    value: durationSeconds,
    duration_seconds: durationSeconds,
  });
};

// Track chat session start (first message sent)
export const trackChatSessionStart = (): void => {
  trackEvent({
    action: 'chat_session_start',
    category: 'engagement',
    label: 'new_conversation',
  });
};

// Track message sent
export const trackMessageSent = (conversationLength: number): void => {
  trackEvent({
    action: 'message_sent',
    category: 'engagement',
    value: conversationLength,
    message_count: conversationLength,
  });
};

// Track EMDR/Flash session start
export const trackFlashSessionStart = (): void => {
  trackEvent({
    action: 'flash_session_start',
    category: 'engagement',
    label: 'emdr_flash_technique',
  });
};

// Track Flash session completion
export const trackFlashSessionComplete = (
  distressReduction: number,
  durationMinutes: number
): void => {
  trackEvent({
    action: 'flash_session_complete',
    category: 'engagement',
    label: 'emdr_flash_technique',
    value: distressReduction,
    distress_reduction: distressReduction,
    duration_minutes: durationMinutes,
  });
};

// ============================================
// PAGE VIEW EVENTS
// ============================================

// Track page view (useful for SPAs)
export const trackPageView = (pagePath: string, pageTitle?: string): void => {
  if (!isGtagAvailable()) return;

  window.gtag?.('event', 'page_view', {
    page_path: pagePath,
    page_title: pageTitle,
  });
};

// ============================================
// FEATURE USAGE EVENTS
// ============================================

// Track when analysis panel is viewed
export const trackAnalysisPanelView = (): void => {
  trackEvent({
    action: 'view_analysis',
    category: 'feature_usage',
    label: 'real_time_analysis',
  });
};

// Track demo interaction on landing page
export const trackDemoInteraction = (interactionType: string): void => {
  trackEvent({
    action: 'demo_interaction',
    category: 'engagement',
    label: interactionType,
  });
};

// Track pricing page view
export const trackPricingView = (): void => {
  trackEvent({
    action: 'view_pricing',
    category: 'funnel',
    label: 'pricing_page',
  });
};

// Track CTA clicks
export const trackCTAClick = (ctaName: string, location: string): void => {
  trackEvent({
    action: 'cta_click',
    category: 'engagement',
    label: ctaName,
    click_location: location,
  });
};
