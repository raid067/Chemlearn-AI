import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AuthError } from '@/lib/server/auth';
import { getHistoricalRuns } from '@/lib/redteam/runner';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const history = getHistoricalRuns();
    return NextResponse.json({ history });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to retrieve red team history' }, { status: 500 });
  }
}
