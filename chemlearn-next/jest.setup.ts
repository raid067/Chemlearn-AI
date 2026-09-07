import '@testing-library/jest-dom';

// Polyfill Web APIs in JSDOM
if (typeof global.fetch === 'undefined') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nf = require('google-auth-library/node_modules/node-fetch');
    const fetchImpl = nf.default || nf;
    global.fetch = fetchImpl;
    global.Headers = nf.Headers || global.Headers;
    global.Request = nf.Request || global.Request;
    global.Response = nf.Response || global.Response;
  } catch {
    // Fallback stub if module not found
    global.fetch = jest.fn().mockImplementation(() => new Promise(() => {})) as unknown as typeof fetch;
  }
}
