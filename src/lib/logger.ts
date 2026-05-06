type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private formatMessage(level: LogLevel, message: string, data?: unknown) {
    const timestamp = new Date().toISOString();
    
    if (process.env.NODE_ENV === 'production') {
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...(data ? { data } : {}),
      });
    }

    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${data ? JSON.stringify(data) : ''}`;
  }

  info(message: string, data?: unknown) {
    // eslint-disable-next-line no-console
    console.info(this.formatMessage('info', message, data));
  }

  warn(message: string, data?: unknown) {
    // eslint-disable-next-line no-console
    console.warn(this.formatMessage('warn', message, data));
  }

  error(message: string, error?: unknown) {
    // eslint-disable-next-line no-console
    console.error(this.formatMessage('error', message, error));
  }

  debug(message: string, data?: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug(this.formatMessage('debug', message, data));
    }
  }
}

export const logger = new Logger();
