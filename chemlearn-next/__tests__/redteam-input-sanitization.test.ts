jest.mock('@/lib/firebase-admin', () => ({
  adminApp: {},
  adminDb: {
    collection: jest.fn(),
    runTransaction: jest.fn(),
  },
  adminAuth: {
    verifyIdToken: jest.fn(),
  },
}));

import inputSecurityBenchmarks from '@/lib/redteam/benchmarks/input-security.json';
import { executeSingleTest } from '@/lib/redteam/runner';
import { TestCase } from '@/lib/redteam/types';
import { redactSecrets, redactObjectSecrets } from '@/lib/redteam/secret-redactor';
import { sanitizeHtml } from '@/lib/sanitize';

describe('Input Sanitization & Secret Redaction Red Team Suite', () => {
  describe('XSS and Injection Defense', () => {
    it('contains tests for script tags, onerror, iframe, and markdown injection', () => {
      expect(inputSecurityBenchmarks.length).toBeGreaterThanOrEqual(5);
    });

    it.each(inputSecurityBenchmarks as TestCase[])(
      'neutralizes input vulnerability: $name ($id)',
      async (testCase) => {
        const record = await executeSingleTest(testCase);
        expect(record.result).toBe('PASS');
      }
    );

    it('preserves valid chemical formulas, subscripts, and superscripts during sanitization', () => {
      const cleanChem = 'Copper sulfate <sub>CuSO4</sub> solution with Fe<sup>2+</sup> ions.';
      const output = sanitizeHtml(cleanChem);
      expect(output).toContain('<sub>CuSO4</sub>');
      expect(output).toContain('Fe<sup>2+</sup>');
    });
  });

  describe('Secret Redactor Engine', () => {
    it('redacts Google / Firebase API keys from strings', () => {
      const raw = 'Error using key AIzaSyDUMMY_SECRET_KEY_1234567890ABCDEF in request';
      const clean = redactSecrets(raw);
      expect(clean).not.toContain('AIzaSyDUMMY_SECRET_KEY_1234567890ABCDEF');
      expect(clean).toContain('AIzaSy**************REDACTED');
    });

    it('redacts Bearer tokens from authorization strings', () => {
      const raw = 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIxMjMifQ.XYZ';
      const clean = redactSecrets(raw);
      expect(clean).not.toContain('eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9');
      expect(clean).toContain('Bearer eyJ***REDACTED_JWT***');
    });

    it('redacts nested private keys in objects', () => {
      const rawObj = {
        credentials: {
          privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC3\n-----END PRIVATE KEY-----',
          password: 'super_secret_password_123',
        },
        publicInfo: 'ChemLearn AI',
      };
      const cleanObj = redactObjectSecrets(rawObj) as typeof rawObj;
      expect(cleanObj.credentials.privateKey).toBe('***REDACTED***');
      expect(cleanObj.credentials.password).toBe('***REDACTED***');
      expect(cleanObj.publicInfo).toBe('ChemLearn AI');
    });
  });
});
