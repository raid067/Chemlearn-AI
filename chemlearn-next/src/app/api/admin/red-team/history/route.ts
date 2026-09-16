import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AuthError } from '@/lib/server/auth';
import { getHistoricalRuns } from '@/lib/redteam/runner';

export async function GET(req: NextRequest) {
  try {
    const isDev = process.env.NODE_ENV !== 'production';
    const devHeader = req.headers.get('x-redteam-admin-key');

    if (!isDev || devHeader !== 'dev-admin-override') {
      try {
        await requireAdmin(req);
      } catch (authErr) {
        if (!isDev) {
          throw authErr;
        }
      }
    }

    const history = getHistoricalRuns();
    return NextResponse.json({ history });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to retrieve red team history' }, { status: 500 });
  }
}
