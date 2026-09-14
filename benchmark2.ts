import { performance } from 'perf_hooks';

// Mocks
const idempotencyCache = new Map<string, any>();
function getCachedResponse<T>(key: string): T | null {
  const entry = idempotencyCache.get(key);
  if (!entry) return null;
  return entry.data as T;
}

function setCachedResponse<T>(key: string, data: T): void {
  idempotencyCache.set(key, { data, expiresAt: Date.now() + 45000 });
}

// Pub-sub implementation similar to what we'll use
type ResolveFunc = (value: any) => void;
const idempotencyListeners = new Map<string, ResolveFunc[]>();

function subscribeToIdempotency<T>(key: string): Promise<T> {
  return new Promise((resolve) => {
    const listeners = idempotencyListeners.get(key) || [];
    listeners.push(resolve);
    idempotencyListeners.set(key, listeners);
  });
}

function publishIdempotencyCompletion<T>(key: string, data: T) {
  const listeners = idempotencyListeners.get(key);
  if (listeners) {
    listeners.forEach((resolve) => resolve(data));
    idempotencyListeners.delete(key);
  }
}

// Update setCachedResponse to also publish
function setCachedResponsePubSub<T>(key: string, data: T): void {
  setCachedResponse(key, data);
  publishIdempotencyCompletion(key, data);
}

// Polling version
async function testPolling(id: string) {
  for (let i = 0; i < 15; i++) {
    await new Promise((res) => setTimeout(res, 200));
    const cached = getCachedResponse<string>(id);
    if (cached !== null) {
      return cached;
    }
  }
  return null;
}

// Pub-sub version
async function testPubSub(id: string) {
  // Check cache first
  const cached = getCachedResponse(id);
  if (cached) return cached;

  // Await potential resolution (up to 3 seconds)
  return Promise.race([
    subscribeToIdempotency(id),
    new Promise((resolve) => setTimeout(() => resolve(null), 3000))
  ]);
}

async function runBench() {
  console.log("Starting benchmark...");

  // Polling
  let start = performance.now();
  let promises = [];
  for (let i = 0; i < 1000; i++) {
    promises.push(testPolling('key_poll'));
  }
  setTimeout(() => {
    setCachedResponse('key_poll', 'result');
  }, 1000);
  await Promise.all(promises);
  let end = performance.now();
  console.log(`Polling (1000 waiters, 1s delay): ${end - start} ms`);

  idempotencyCache.clear();

  // Pub-sub
  start = performance.now();
  promises = [];
  for (let i = 0; i < 1000; i++) {
    promises.push(testPubSub('key_pubsub'));
  }
  setTimeout(() => {
    setCachedResponsePubSub('key_pubsub', 'result');
  }, 1000);
  await Promise.all(promises);
  end = performance.now();
  console.log(`PubSub (1000 waiters, 1s delay): ${end - start} ms`);
}

runBench();
