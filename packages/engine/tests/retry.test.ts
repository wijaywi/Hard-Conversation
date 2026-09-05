import test from 'node:test';
import assert from 'node:assert';
import { z } from 'zod';
import { withRetry } from '../src/retry';

test('Retry Engine: Simulates Timeout and successfully retries', async () => {
  let callCount = 0;
  const logs: string[] = [];
  
  const mockCreate = async (controller: AbortController) => {
    callCount++;
    if (callCount === 1) {
      const err: any = new Error('The operation was aborted');
      err.name = 'AbortError';
      throw err;
    }
    return { intent: 'deflect' };
  };

  const result = await withRetry(mockCreate, (m) => logs.push(m), 10);
  
  assert.strictEqual(callCount, 2, 'Should have called exactly twice');
  assert.strictEqual(logs.length, 1, 'Should log one retry');
  assert.match(logs[0], /aborted/, 'Log should contain reason');
  assert.strictEqual(result.intent, 'deflect');
});

test('Retry Engine: Simulates 429 Rate Limit and successfully retries', async () => {
  let callCount = 0;
  const logs: string[] = [];
  
  const mockCreate = async (controller: AbortController) => {
    callCount++;
    if (callCount === 1) {
      const err: any = new Error('Rate limit exceeded');
      err.status = 429;
      throw err;
    }
    return { success: true };
  };

  const result = await withRetry(mockCreate, (m) => logs.push(m), 10);
  
  assert.strictEqual(callCount, 2, 'Should have called exactly twice');
  assert.match(logs[0], /Rate limit/, 'Log should contain reason');
});

test('Retry Engine: Aborts on 401 Unauthorized without retrying', async () => {
  let callCount = 0;
  
  const mockCreate = async (controller: AbortController) => {
    callCount++;
    const err: any = new Error('Invalid API Key');
    err.status = 401;
    throw err;
  };

  try {
    await withRetry(mockCreate, undefined, 10);
    assert.fail('Should have thrown');
  } catch (err: any) {
    assert.strictEqual(callCount, 1, 'Should not have retried on 401');
    assert.strictEqual(err.status, 401);
  }
});

test('Retry Engine: Retries on JSON missing error', async () => {
  let callCount = 0;
  
  const mockCreate = async (controller: AbortController) => {
    callCount++;
    if (callCount === 1) {
      throw new Error('Could not find JSON in LLM response');
    }
    return { fixed: true };
  };

  const result = await withRetry(mockCreate, undefined, 10);
  assert.strictEqual(callCount, 2, 'Should retry after JSON error');
  assert.strictEqual(result.fixed, true);
});

