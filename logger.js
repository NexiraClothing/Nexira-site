// logger.js
class Logger {
    constructor() {
        this.logs = [];
    }

    log(level, message, data = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            data: this.sanitizeData(data)
        };

        this.logs.push(logEntry);
        
        // Send to server
        this.sendToServer(logEntry);
    }

    sanitizeData(data) {
        // Remove sensitive data
        const sanitized = { ...data };
        ['password', 'credit_card', 'token'].forEach(key => {
            if (key in sanitized) delete sanitized[key];
        });
        return sanitized;
    }

    async sendToServer(logEntry) {
        try {
            await fetch('/api/logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': sessionStorage.getItem('csrfToken')
                },
                body: JSON.stringify(logEntry)
            });
        } catch (error) {
            console.error('Failed to send log to server:', error);
        }
    }
}

export const logger = new Logger();
