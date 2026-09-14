import { performance } from 'perf_hooks';
import { EventEmitter } from 'events';

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
const emitter = new EventEmitter();
function setCachedResponsePubSub<T>(key: string, data: T): void {
  idempotencyCache.set(key, { data, expiresAt: Date.now() + 45000 });
  emitter.emit(key, data);
}
async function testPubSub(id: string) {
  return new Promise((resolve) => {
    const cached = getCachedResponse(id);
    if (cached) return resolve(cached);

    const timeout = setTimeout(() => {
      emitter.off(id, listener);
      resolve(null);
    }, 3000);
    const listener = (data: any) => {
      clearTimeout(timeout);
      resolve(data);
    };
    emitter.once(id, listener);
  });
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
