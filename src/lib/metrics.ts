import * as Sentry from '@sentry/nextjs';

// Track registration attempts and success
export function trackRegistration(success: boolean, error?: string) {
  if (success) {
    Sentry.metrics.increment('registration.success', 1);
  } else {
    Sentry.metrics.increment('registration.failure', 1);
    if (error) {
      Sentry.captureMessage(`Registration failed: ${error}`, 'warning');
    }
  }
}

// Track GHL sync attempts and success
export function trackGHLSync(type: 'registration' | 'phone' | 'tag', success: boolean, email: string, error?: string) {
  const metricName = `ghl.${type}.${success ? 'success' : 'failure'}`;
  
  Sentry.metrics.increment(metricName, 1);
  
  if (!success && error) {
    Sentry.captureException(new Error(`GHL ${type} sync failed for ${email}: ${error}`), {
      tags: {
        sync_type: type,
        email: email,
      }
    });
  }
}

// Track payment conversion funnel
export function trackPaymentFunnel(step: 'page_view' | 'initiated' | 'success' | 'failed', userId: string, error?: string) {
  Sentry.metrics.increment(`payment.${step}`, 1);
  
  if (step === 'failed' && error) {
    Sentry.captureMessage(`Payment failed for user ${userId}: ${error}`, 'error');
  }
}

// Track API response times
export function trackAPITiming(endpoint: string, durationMs: number, success: boolean) {
  Sentry.metrics.distribution(`api.${endpoint}.duration`, durationMs, {
    unit: 'millisecond',
    tags: {
      success: success.toString(),
    }
  });
  
  // Alert if API is slow
  if (durationMs > 3000) {
    Sentry.captureMessage(`Slow API response: ${endpoint} took ${durationMs}ms`, 'warning');
  }
}
