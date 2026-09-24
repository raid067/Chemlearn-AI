import { dispatchN8nEvent } from '@/lib/n8n/dispatcher';

describe('n8n Outbound Event Dispatcher', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      N8N_WEBHOOK_URL: 'https://n8n.chemlearn.local/webhook/chemlearn-events',
      N8N_WEBHOOK_SECRET: 'test-dispatcher-secret-key-12345',
    };
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('dispatches an event with valid headers and payload when configured', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    const success = await dispatchN8nEvent('quiz.completed', {
      studentId: 'student_789',
      chapter: 'chapter-6',
      chapterNumber: 6,
      score: 35,
      incorrectSubtopics: ['6.8 SPA Salt Solubility'],
    });

    expect(success).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('https://n8n.chemlearn.local/webhook/chemlearn-events');
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(options.headers['X-ChemLearn-Signature']).toMatch(/^sha256=[a-f0-9]{64}$/);
    expect(options.headers['X-ChemLearn-Timestamp']).toBeDefined();

    const parsedBody = JSON.parse(options.body);
    expect(parsedBody.event).toBe('quiz.completed');
    expect(parsedBody.data.score).toBe(35);
    expect(parsedBody.data.chapterNumber).toBe(6);
  });

  it('fails open gracefully when N8N_WEBHOOK_URL is not set without throwing error', async () => {
    delete process.env.N8N_WEBHOOK_URL;

    const success = await dispatchN8nEvent('quiz.completed', {
      studentId: 'student_999',
      score: 40,
    });

    expect(success).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('fails open gracefully when n8n instance returns 500 or network error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Connection refused'));

    const success = await dispatchN8nEvent('quiz.completed', {
      studentId: 'student_failed_network',
      score: 20,
    });

    expect(success).toBe(false);
    // Crucially: it does not throw an unhandled exception to protect caller request lifecycle
  });
});
