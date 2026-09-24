import { generateSignature, verifySignature, verifyTimestamp } from '@/lib/n8n/security';
import { N8nInboundPayloadSchema, N8nOutboundEventSchema } from '@/lib/n8n/types';

describe('n8n Security & Verification Module', () => {
  const secret = 'super-secret-chemlearn-n8n-key-2026';
  const payload = JSON.stringify({
    event: 'quiz.completed',
    timestamp: Date.now(),
    data: {
      studentId: 'student_123',
      chapter: 'chapter-6',
      score: 45,
    },
  });

  describe('generateSignature and verifySignature', () => {
    it('generates a valid sha256 hex signature matching verifySignature', () => {
      const signature = generateSignature(payload, secret);
      expect(signature).toMatch(/^sha256=[a-f0-9]{64}$/);

      const isValid = verifySignature(payload, signature, secret);
      expect(isValid).toBe(true);
    });

    it('rejects an altered payload with the same signature', () => {
      const signature = generateSignature(payload, secret);
      const tamperedPayload = payload.replace('45', '95');

      const isValid = verifySignature(tamperedPayload, signature, secret);
      expect(isValid).toBe(false);
    });

    it('rejects signatures generated with a different secret', () => {
      const signature = generateSignature(payload, 'wrong-secret');
      const isValid = verifySignature(payload, signature, secret);
      expect(isValid).toBe(false);
    });

    it('rejects malformed or empty signatures gracefully', () => {
      expect(verifySignature(payload, '', secret)).toBe(false);
      expect(verifySignature(payload, 'invalid-signature-format', secret)).toBe(false);
      expect(verifySignature(payload, 'sha256=12345', secret)).toBe(false);
    });
  });

  describe('verifyTimestamp', () => {
    it('accepts current timestamp within 300 seconds', () => {
      const now = Date.now().toString();
      expect(verifyTimestamp(now, 300000)).toBe(true);
    });

    it('rejects timestamps older than maxAgeMs (replay attack prevention)', () => {
      const tenMinutesAgo = (Date.now() - 600000).toString();
      expect(verifyTimestamp(tenMinutesAgo, 300000)).toBe(false);
    });

    it('rejects future timestamps exceeding clock skew allowance', () => {
      const farFuture = (Date.now() + 600000).toString();
      expect(verifyTimestamp(farFuture, 300000)).toBe(false);
    });

    it('rejects null, empty, or non-numeric timestamps', () => {
      expect(verifyTimestamp(null)).toBe(false);
      expect(verifyTimestamp('')).toBe(false);
      expect(verifyTimestamp('not-a-number')).toBe(false);
    });
  });

  describe('Schema Validations', () => {
    it('validates a valid outbound event payload', () => {
      const parsed = N8nOutboundEventSchema.safeParse({
        eventId: 'evt_123',
        event: 'quiz.completed',
        timestamp: Date.now(),
        data: {
          studentId: 'stud_456',
          chapter: 'chapter-6',
          chapterNumber: 6,
          chapterTitle: 'Acid, Base and Salt',
          score: 40,
          totalQuestions: 10,
          incorrectSubtopics: ['6.11 Qualitative Analysis'],
        },
      });

      expect(parsed.success).toBe(true);
    });

    it('validates an inbound worksheet publish callback', () => {
      const parsed = N8nInboundPayloadSchema.safeParse({
        action: 'worksheet.publish',
        timestamp: Date.now(),
        data: {
          title: 'SPM Form 4 Chapter 6 Mastery Set',
          chapter: 'chapter-6',
          chapterNumber: 6,
          questions: [
            {
              id: 'q1',
              text: 'A salt X decomposes upon heating to produce brown gas Y and a residue Z which is yellow when hot and white when cold. Identify X, Y, and Z.',
              type: 'structured',
              marks: 3,
              markingScheme: [
                'X is Zinc nitrate / Zn(NO3)2 (1m)',
                'Y is Nitrogen dioxide gas / NO2 (1m)',
                'Z is Zinc oxide / ZnO (1m)',
              ],
            },
          ],
        },
      });

      expect(parsed.success).toBe(true);
    });
  });
});
