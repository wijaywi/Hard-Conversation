import { z } from 'zod';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function withRetry<T>(
  operation: (controller: AbortController) => Promise<T>,
  logger?: (msg: string) => void,
  testDelayMs?: number,
  timeoutMs: number = 3000
): Promise<T> {
  const MAX_RETRIES = 1;
  let attempt = 0;
  
  while (attempt <= MAX_RETRIES) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const result = await operation(controller);
      clearTimeout(timeoutId);
      return result;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      const isAbort = error.name === 'AbortError' || (error.message && error.message.includes('aborted'));
      const status = error.status || (error.response && error.response.status);
      
      const isRateLimit = status === 429;
      const isServerError = status >= 500 && status < 600;
      const isZodError = error instanceof z.ZodError || (error.message && error.message.includes('JSON'));
      
      const isRetryable = isAbort || isRateLimit || isServerError || isZodError;
      
      if (!isRetryable || attempt >= MAX_RETRIES) {
        throw error;
      }
      
      if (logger) logger('[Retry Engine] Attempt ' + (attempt + 1) + ' failed. Reason: ' + error.message + '. Retrying...');
      
      if (isRateLimit) {
        await delay(testDelayMs ?? 1500);
      }
      
      attempt++;
    }
  }
  throw new Error('Max retries exceeded');
}

