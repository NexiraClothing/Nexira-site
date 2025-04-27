// session.js
class SessionManager {
    constructor() {
        this.checkHttps();
        this.setupSessionTimeout();
    }

    checkHttps() {
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
            location.replace(`https:${location.href.substring(location.protocol.length)}`);
        }
    }

    setupSessionTimeout() {
        const timeout = 3600000; // 1 hour
        let timeoutId;

        const resetTimeout = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(this.logout, timeout);
        };

        // Reset timeout on user activity
        ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetTimeout);
        });

        resetTimeout();
    }

    logout() {
        // Implement logout logic
        sessionStorage.clear();
        location.href = '/login';
    }
}

export const sessionManager = new SessionManager();
