

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  multiplier?: number;
  retryableStatuses?: number[];
  retryableErrors?: string[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 5,
  initialDelay: 1000, 
  maxDelay: 30000, 
  multiplier: 2,
  retryableStatuses: [429, 500, 502, 503, 504],
  retryableErrors: ["ECONNABORTED", "ERR_NETWORK", "ETIMEDOUT"],
};


export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;
  let delay = opts.initialDelay;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      
      const isRetryable =
        opts.retryableStatuses.includes(error.response?.status) ||
        opts.retryableErrors.includes(error.code) ||
        (error.response?.status === 429 &&
          attempt < opts.maxRetries); 

      if (!isRetryable || attempt === opts.maxRetries) {
        throw error;
      }

      
      const retryAfter = error.response?.headers?.["retry-after"] ||
                        error.response?.headers?.["Retry-After"] ||
                        error.response?.data?.retryAfter;
      
      if (retryAfter) {
        delay = parseInt(String(retryAfter)) * 1000; 
      } else {
        delay = Math.min(delay * opts.multiplier, opts.maxDelay);
      }

      
      await new Promise((resolve) => setTimeout(resolve, delay));

      if (import.meta.env.DEV) {
        console.log(
          `Retry attempt ${attempt + 1}/${opts.maxRetries} after ${delay}ms`
        );
      }
    }
  }

  throw lastError;
}
