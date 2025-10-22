import * as Sentry from '@sentry/nextjs';

// Track registration attempts and success
export function trackRegistration(success: boolean, error?: string) {
  if (success) {
    Sentry.captureMessage('Registration Success', {
      level: 'info',
      tags: { event_type: 'registration', status: 'success' }
    });
  } else {
    Sentry.captureMessage(`Registration Failed: ${error || 'Unknown error'}`, {
      level: 'warning',
      tags: { event_type: 'registration', status: 'failure' }
    });
  }
}

// Track GHL sync attempts and success
export function trackGHLSync(type: 'registration' | 'phone' | 'tag', success: boolean, email: string, error?: string) {
  if (success) {
    Sentry.captureMessage(`GHL ${type} sync success`, {
      level: 'info',
      tags: { 
        event_type: 'ghl_sync', 
        sync_type: type, 
        status: 'success' 
      },
      extra: { email }
    });
  } else {
    Sentry.captureException(new Error(`GHL ${type} sync failed: ${error}`), {
      tags: {
        event_type: 'ghl_sync',
        sync_type: type,
        status: 'failure'
      },
      extra: { email }
    });
  }
}

// Track payment conversion funnel
export function trackPaymentFunnel(step: 'page_view' | 'initiated' | 'success' | 'failed', userId: string, error?: string) {
  if (step === 'failed' && error) {
    Sentry.captureMessage(`Payment failed for user ${userId}: ${error}`, {
      level: 'error',
      tags: { event_type: 'payment', step, status: 'failed' },
      extra: { userId }
    });
  } else {
    Sentry.captureMessage(`Payment ${step}`, {
      level: 'info',
      tags: { event_type: 'payment', step },
      extra: { userId }
    });
  }
}

// Track API response times
export function trackAPITiming(endpoint: string, durationMs: number, success: boolean) {
  // Only log if slow (over 2 seconds)
  if (durationMs > 2000) {
    Sentry.captureMessage(`Slow API: ${endpoint} took ${durationMs}ms`, {
      level: 'warning',
      tags: {
        event_type: 'api_timing',
        endpoint,
        success: success.toString()
      },
      extra: { durationMs }
    });
  }
  
  // For very slow responses, capture as error
  if (durationMs > 5000) {
    Sentry.captureException(new Error(`Very slow API response: ${endpoint}`), {
      tags: {
        event_type: 'api_timing',
        endpoint,
        success: success.toString()
      },
      extra: { durationMs }
    });
  }
}
