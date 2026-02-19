/**
 * Clawdet Error Tracker
 * 
 * Lightweight client-side error monitoring
 * Captures JS errors, WebSocket failures, API errors
 * Sends to backend for logging and alerting
 */

class ErrorTracker {
  constructor(config = {}) {
    this.endpoint = config.endpoint || '/api/errors/report';
    this.userId = config.userId || null;
    this.instanceId = config.instanceId || null;
    this.enabled = config.enabled !== false;
    this.errors = [];
    
    if (this.enabled) {
      this.init();
    }
  }
  
  init() {
    // Capture unhandled errors
    window.addEventListener('error', (event) => {
      this.captureError({
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });
    
    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        type: 'unhandled_rejection',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack
      });
    });
    
    // Capture console errors
    const originalError = console.error;
    console.error = (...args) => {
      this.captureError({
        type: 'console_error',
        message: args.join(' ')
      });
      originalError.apply(console, args);
    };
  }
  
  captureError(error) {
    const errorData = {
      ...error,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.userId,
      instanceId: this.instanceId,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
    
    this.errors.push(errorData);
    
    // Send to backend
    this.sendError(errorData);
    
    // Keep only last 50 errors in memory
    if (this.errors.length > 50) {
      this.errors.shift();
    }
  }
  
  async sendError(error) {
    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error)
      });
    } catch (e) {
      // Failed to send error (ironically)
      console.warn('Failed to send error report:', e);
    }
  }
  
  captureWebSocketError(error) {
    this.captureError({
      type: 'websocket_error',
      message: error.message || 'WebSocket connection failed',
      code: error.code,
      reason: error.reason
    });
  }
  
  captureAPIError(error) {
    this.captureError({
      type: 'api_error',
      message: error.message || 'API call failed',
      endpoint: error.endpoint,
      status: error.status,
      response: error.response
    });
  }
  
  getErrors() {
    return this.errors;
  }
  
  clearErrors() {
    this.errors = [];
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorTracker;
}
