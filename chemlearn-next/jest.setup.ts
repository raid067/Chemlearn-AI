import '@testing-library/jest-dom';

// Polyfill Web APIs in JSDOM from Node globalThis
if (typeof globalThis.fetch !== 'undefined') {
  if (typeof global.fetch === 'undefined') {
    global.fetch = globalThis.fetch;
  }
  if (typeof global.Headers === 'undefined') {
    global.Headers = globalThis.Headers;
  }
  if (typeof global.Request === 'undefined') {
    global.Request = globalThis.Request;
  }
  if (typeof global.Response === 'undefined') {
    global.Response = globalThis.Response;
  }
}
