const { z } = require('zod');
const Anthropic = require('@anthropic-ai/sdk');

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function callAnthropicJSONWithRetry(systemPrompt, userPrompt, schema, model = 'claude-3-haiku-20240307', maxRetries = 1) {
  let attempt = 0;
  
  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    try {
      // Mock call logic for test
      const msg = await anthropic.messages.create({
        model,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }, { signal: controller.signal });
      
      clearTimeout(timeoutId);
      // parse logic...
      return parsedJson;
    } catch (error) {
      clearTimeout(timeoutId);
      
      const isAbort = error.name === 'AbortError';
      const status = error.status;
      
      // Determine if retryable
      const isRateLimit = status === 429;
      const isServerError = status >= 500 && status < 600;
      const isZodError = error instanceof z.ZodError || error.message.includes('Could not find JSON') || error instanceof SyntaxError;
      
      const isRetryable = isAbort || isRateLimit || isServerError || isZodError;
      
      if (!isRetryable || attempt >= maxRetries) {
        throw error;
      }
      
      if (isRateLimit) {
        await delay(1500);
      }
      
      attempt++;
    }
  }
}

