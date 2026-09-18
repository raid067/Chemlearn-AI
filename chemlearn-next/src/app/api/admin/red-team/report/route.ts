import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AuthError } from '@/lib/server/auth';
import { getCampaignById, runRedTeamCampaign } from '@/lib/redteam/runner';
import { generateMarkdownReport, generateJsonReport } from '@/lib/redteam/reporters';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'markdown';
    const id = searchParams.get('id') || undefined;

    let campaign = getCampaignById(id);
    if (!campaign) {
      // If no campaign in memory yet, generate quick scan for instant export
      campaign = await runRedTeamCampaign('quick');
    }

    if (format === 'json') {
      const jsonContent = generateJsonReport(campaign);
      return new NextResponse(jsonContent, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="red-team-results.json"',
        },
      });
    }

    const markdownContent = generateMarkdownReport(campaign);
    return new NextResponse(markdownContent, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'attachment; filename="RED_TEAM_REPORT.md"',
      },
    });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
