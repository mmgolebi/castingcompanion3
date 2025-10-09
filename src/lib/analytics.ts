// Meta Pixel tracking functions
declare global {
  interface Window {
    fbq: any;
  }
}

export const trackEvent = (eventName: string, data?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, data);
  }
};

// Track user registration
export const trackCompleteRegistration = () => {
  trackEvent('CompleteRegistration');
};

// Track when user starts payment process
export const trackInitiateCheckout = (value?: number) => {
  trackEvent('InitiateCheckout', {
    currency: 'USD',
    value: value || 1.00,
  });
};

// Track successful payment
export const trackPurchase = (value: number, currency: string = 'USD') => {
  trackEvent('Purchase', {
    currency,
    value,
  });
};

// Track lead (for apply page)
export const trackLead = () => {
  trackEvent('Lead');
};

// Track view content (for specific pages)
export const trackViewContent = (contentName: string) => {
  trackEvent('ViewContent', {
    content_name: contentName,
  });
};
