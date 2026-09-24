/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/webhooks/n8n/route';
import { generateSignature } from '@/lib/n8n/security';

// Mock Firebase Admin SDK
const mockAdd = jest.fn();
const mockDoc = jest.fn();
const mockCollection = jest.fn();

jest.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: (name: string) => {
      mockCollection(name);
      return {
        add: mockAdd,
        doc: (id: string) => {
          mockDoc(id);
          return {
            collection: (subName: string) => {
              mockCollection(`${name}/${subName}`);
              return { add: mockAdd };
            },
          };
        },
      };
    },
  },
}));

describe('n8n Inbound Webhook Endpoint (/api/webhooks/n8n)', () => {
  const TEST_SECRET = 'test_webhook_secret_key_1234567890';
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      N8N_WEBHOOK_SECRET: TEST_SECRET,
    };
    mockAdd.mockResolvedValue({ id: 'mock-doc-id-123' });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  function createSignedRequest(
    body: Record<string, unknown> | string,
    options: {
      secret?: string;
      timestamp?: number | string | null;
      customSignature?: string;
    } = {}
  ): NextRequest {
    const rawBody = typeof body === 'string' ? body : JSON.stringify(body);
    const now = options.timestamp !== undefined ? options.timestamp : Date.now();
    const secret = options.secret !== undefined ? options.secret : TEST_SECRET;
    const signature =
      options.customSignature !== undefined
        ? options.customSignature
        : secret
        ? generateSignature(rawBody, secret)
        : '';

    const headers = new Headers();
    headers.set('content-type', 'application/json');
    if (now !== null) {
      headers.set('x-chemlearn-timestamp', String(now));
    }
    if (signature) {
      headers.set('x-chemlearn-signature', signature);
    }

    return new NextRequest('http://localhost:3000/api/webhooks/n8n', {
      method: 'POST',
      headers,
      body: rawBody,
    });
  }

  it('rejects when server secret is not configured', async () => {
    delete process.env.N8N_WEBHOOK_SECRET;
    const req = createSignedRequest({ action: 'health.ping', timestamp: Date.now(), data: {} });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toMatch(/unconfigured/i);
  });

  it('rejects request with missing timestamp header', async () => {
    const req = createSignedRequest(
      { action: 'health.ping', timestamp: Date.now(), data: {} },
      { timestamp: null }
    );
    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toMatch(/timestamp/i);
  });

  it('rejects request with expired timestamp (> 5 minutes)', async () => {
    const expiredTime = Date.now() - 301000;
    const req = createSignedRequest(
      { action: 'health.ping', timestamp: expiredTime, data: {} },
      { timestamp: expiredTime }
    );
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('rejects request with invalid signature', async () => {
    const req = createSignedRequest(
      { action: 'health.ping', timestamp: Date.now(), data: {} },
      { customSignature: 'sha256=invalidffffffffffffffffffffffffffffffffffffffffffffffffffffffff' }
    );
    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toMatch(/signature/i);
  });

  it('rejects malformed json body', async () => {
    const req = createSignedRequest('{ invalid_json: ', {});
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/malformed/i);
  });

  it('successfully handles health.ping action', async () => {
    const req = createSignedRequest({
      action: 'health.ping',
      timestamp: Date.now(),
      data: {},
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.status).toBe('ok');
  });

  it('handles worksheet.publish with valid Chapter 6 question data', async () => {
    const worksheetPayload = {
      action: 'worksheet.publish',
      timestamp: Date.now(),
      data: {
        title: 'Form 4 Chapter 6: Salt Preparation Drill',
        chapter: 'Acid, Base and Salt',
        chapterNumber: 6,
        questions: [
          {
            id: 'q1',
            text: 'Describe the preparation of lead(II) sulphate salt from aqueous lead(II) nitrate.',
            type: 'structured',
            marks: 3,
            markingScheme: [
              'Add sodium sulphate solution to lead(II) nitrate solution',
              'Filter the white precipitate of lead(II) sulphate',
              'Rinse with distilled water and dry between filter papers',
            ],
            subtopic: '6.9 Preparation of Salts',
          },
        ],
      },
    };

    const req = createSignedRequest(worksheetPayload);
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.quizId).toBe('mock-doc-id-123');
    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Form 4 Chapter 6: Salt Preparation Drill',
        chapterNumber: 6,
        source: 'n8n_generator',
      })
    );
  });

  it('handles remedial.assign with Chapter 8 alloy lattice data', async () => {
    const remedialPayload = {
      action: 'remedial.assign',
      timestamp: Date.now(),
      data: {
        studentId: 'student_ch8_user_01',
        chapter: 'Manufactured Substances in Industry',
        chapterNumber: 8,
        diagnosticSummary: 'Student struggled with alloy hardness explanation in bronze vs copper.',
        actionPlan: [
          'Review arrangement of atoms in pure metals vs alloys',
          'Practice explaining how foreign tin atoms disrupt orderly copper layer arrangement',
        ],
        recommendedPracticeIds: ['alloy-drill-1', 'alloy-drill-2'],
      },
    };

    const req = createSignedRequest(remedialPayload);
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.planId).toBe('mock-doc-id-123');
    expect(mockDoc).toHaveBeenCalledWith('student_ch8_user_01');
  });
});
