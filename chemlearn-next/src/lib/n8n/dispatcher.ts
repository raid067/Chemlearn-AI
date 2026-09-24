import { randomUUID } from 'crypto';
import { generateSignature } from './security';
import { N8nEventType, N8nOutboundEvent } from './types';

/**
 * Timeout for n8n outbound webhook call (default 5 seconds).
 * Prevents long blocking calls in serverless runtimes.
 */
const DISPATCH_TIMEOUT_MS = 5000;

/**
 * Dispatches an event to the configured n8n webhook instance.
 * Fully fail-open: returns false and logs errors without throwing unhandled exceptions.
 */
export async function dispatchN8nEvent<T extends Record<string, unknown>>(
  event: N8nEventType,
  data: T
): Promise<boolean> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const webhookSecret = process.env.N8N_WEBHOOK_SECRET;

  if (!webhookUrl) {
    // Fail-open: n8n is optional, continue silently or log debug
    return false;
  }

  const now = Date.now();
  const eventPayload: N8nOutboundEvent = {
    eventId: `evt_${randomUUID()}`,
    event,
    timestamp: now,
    data,
  };

  const rawBody = JSON.stringify(eventPayload);
  const signature = webhookSecret ? generateSignature(rawBody, webhookSecret) : '';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DISPATCH_TIMEOUT_MS);

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-ChemLearn-Timestamp': now.toString(),
    };

    if (signature) {
      headers['X-ChemLearn-Signature'] = signature;
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: rawBody,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[n8n Dispatcher] Target returned status ${response.status} for event ${event}`);
      return false;
    }

    return true;
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`[n8n Dispatcher] Failed to dispatch event ${event}:`, (error as Error).message);
    return false;
  }
}
