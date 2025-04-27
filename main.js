// main.js
import { securityManager } from './security.js';
import { sessionManager } from './session.js';
import { logger } from './logger.js';

// Initialize security features when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Set CSRF token
    const csrfToken = securityManager.generateCSRFToken();
    sessionStorage.setItem('csrfToken', csrfToken);

    // Add CSRF token to all forms
    document.querySelectorAll('form').forEach(form => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'csrf';
        input.value = csrfToken;
        form.appendChild(input);
    });

    // Start logging
    logger.log('info', 'Application started');
});

// Export these if you need to use them in other files
export { securityManager, sessionManager, logger };
