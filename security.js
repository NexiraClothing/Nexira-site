// security.js
class SecurityManager {
    constructor() {
        this.csrfToken = this.generateCSRFToken();
        this.rateLimiter = new RateLimiter(100, 3600000); // 100 requests per hour
    }

    // CSRF Protection
    generateCSRFToken() {
        return Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    // XSS Protection
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        return input.replace(/[<>"/'/`]/g, '');
    }

    // Rate Limiting
    checkRateLimit(ip) {
        return this.rateLimiter.checkLimit(ip);
    }

    // Input Validation
    validateForm(data) {
        const errors = [];
        
        // Email validation
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.push('Invalid email format');
        }

        // Phone validation
        if (data.phone && !/^\+?[\d\s-]{10,}$/.test(data.phone)) {
            errors.push('Invalid phone number');
        }

        return errors;
    }

    // Error Handler
    handleError(error, showTechnical = false) {
        const errorId = this.generateErrorId();
        console.error(`Error ID: ${errorId}`, error);

        return {
            status: 'error',
            message: showTechnical ? error.message : 'An unexpected error occurred',
            errorId: errorId
        };
    }

    generateErrorId() {
        return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

class RateLimiter {
    constructor(maxRequests, timeWindow) {
        this.maxRequests = maxRequests;
        this.timeWindow = timeWindow;
        this.requests = new Map();
    }

    checkLimit(ip) {
        const now = Date.now();
        const userRequests = this.requests.get(ip) || [];
        const recentRequests = userRequests.filter(time => now - time < this.timeWindow);
        
        if (recentRequests.length >= this.maxRequests) {
            return false;
        }
        
        recentRequests.push(now);
        this.requests.set(ip, recentRequests);
        return true;
    }
}

// Export the SecurityManager
export const securityManager = new SecurityManager();
