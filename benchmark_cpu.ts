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

function setCachedResponsePubSub<T>(key: string, data: T): void {
  setCachedResponse(key, data);
  publishIdempotencyCompletion(key, data);
}

// Emulate busy CPU
function simulateWork() {
  let v = 0;
  for (let i = 0; i < 1e5; i++) v += i;
  return v;
}

async function testPolling(id: string) {
  for (let i = 0; i < 15; i++) {
    simulateWork(); // Add cpu load
    await new Promise((res) => setTimeout(res, 200));
    const cached = getCachedResponse<string>(id);
    if (cached !== null) {
      return cached;
    }
  }
  return null;
}

async function testPubSub(id: string) {
  const cached = getCachedResponse(id);
  if (cached) return cached;

  return Promise.race([
    subscribeToIdempotency(id).then(res => { simulateWork(); return res; }),
    new Promise((resolve) => setTimeout(() => resolve(null), 3000))
  ]);
}

async function runBench() {
  console.log("Starting CPU-bound benchmark...");

  // Polling
  let start = performance.now();
  let startCpu = process.cpuUsage();
  let promises = [];
  for (let i = 0; i < 5000; i++) {
    promises.push(testPolling('key_poll'));
  }
  setTimeout(() => {
    setCachedResponse('key_poll', 'result');
  }, 1000);
  await Promise.all(promises);
  let endCpu = process.cpuUsage(startCpu);
  let end = performance.now();
  console.log(`Polling (5000 waiters, 1s delay):`);
  console.log(`  Real time: ${end - start} ms`);
  console.log(`  User CPU: ${endCpu.user / 1000} ms`);
  console.log(`  Sys CPU: ${endCpu.system / 1000} ms`);

  idempotencyCache.clear();

  // Pub-sub
  start = performance.now();
  startCpu = process.cpuUsage();
  promises = [];
  for (let i = 0; i < 5000; i++) {
    promises.push(testPubSub('key_pubsub'));
  }
  setTimeout(() => {
    setCachedResponsePubSub('key_pubsub', 'result');
  }, 1000);
  await Promise.all(promises);
  endCpu = process.cpuUsage(startCpu);
  end = performance.now();
  console.log(`PubSub (5000 waiters, 1s delay):`);
  console.log(`  Real time: ${end - start} ms`);
  console.log(`  User CPU: ${endCpu.user / 1000} ms`);
  console.log(`  Sys CPU: ${endCpu.system / 1000} ms`);
}

runBench();
