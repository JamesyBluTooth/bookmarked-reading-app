/**
 * Conditional logging utility that only logs in development mode.
 * This prevents exposing internal error details in production.
 */
export const logError = (message: string, error?: any) => {
  if (import.meta.env.DEV) {
    console.error(message, error);
  }
};

export const logWarning = (message: string, data?: any) => {
  if (import.meta.env.DEV) {
    console.warn(message, data);
  }
};

export const logInfo = (message: string, data?: any) => {
  if (import.meta.env.DEV) {
    console.log(message, data);
  }
};