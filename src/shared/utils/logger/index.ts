export const logger = {
  warn: (message: string, error?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(message, error);
    }
  },
  error: (message: string, error?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(message, error);
    }
  },
};
