import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AuthError } from '@/lib/server/auth';
import { runRedTeamCampaign } from '@/lib/redteam/runner';
import { TestCategory } from '@/lib/redteam/types';

export async function POST(req: NextRequest) {
  try {
    // Enforce admin privileges
    await requireAdmin(req);

    const body = await req.json().catch(() => ({}));
    const scanType = (body.scanType as 'quick' | 'standard' | 'full' | 'category') || 'quick';
    const category = body.category as TestCategory | undefined;

    const summary = await runRedTeamCampaign(scanType, category);

    return NextResponse.json(summary);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('[Red Team Run Error]:', error);
    return NextResponse.json(
      { error: 'Internal Red Team Runner Failure', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
