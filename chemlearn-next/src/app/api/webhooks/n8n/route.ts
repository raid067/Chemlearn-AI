import { NextRequest, NextResponse } from 'next/server';
import { verifySignature, verifyTimestamp } from '@/lib/n8n/security';
import {
  N8nInboundPayloadSchema,
  WorksheetPublishDataSchema,
  RemedialAssignDataSchema,
} from '@/lib/n8n/types';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-chemlearn-signature') || req.headers.get('X-ChemLearn-Signature');
    const timestamp = req.headers.get('x-chemlearn-timestamp') || req.headers.get('X-ChemLearn-Timestamp');
    const secret = process.env.N8N_WEBHOOK_SECRET;

    if (!secret) {
      console.error('[n8n Webhook Error] N8N_WEBHOOK_SECRET is not configured on server');
      return NextResponse.json(
        { error: 'Webhook service unconfigured' },
        { status: 500 }
      );
    }

    if (!timestamp || !verifyTimestamp(timestamp)) {
      return NextResponse.json(
        { error: 'Invalid or expired timestamp' },
        { status: 401 }
      );
    }

    const rawBody = await req.text();

    if (!signature || !verifySignature(rawBody, signature, secret)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    let jsonBody: unknown;
    try {
      jsonBody = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: 'Malformed JSON payload' },
        { status: 400 }
      );
    }

    const parsedEnvelope = N8nInboundPayloadSchema.safeParse(jsonBody);
    if (!parsedEnvelope.success) {
      return NextResponse.json(
        { error: 'Invalid payload structure', details: parsedEnvelope.error.format() },
        { status: 400 }
      );
    }

    const { action, data } = parsedEnvelope.data;

    switch (action) {
      case 'health.ping': {
        return NextResponse.json({
          success: true,
          status: 'ok',
          timestamp: Date.now(),
        });
      }

      case 'worksheet.publish': {
        const parsedWorksheet = WorksheetPublishDataSchema.safeParse(data);
        if (!parsedWorksheet.success) {
          return NextResponse.json(
            { error: 'Invalid worksheet data', details: parsedWorksheet.error.format() },
            { status: 400 }
          );
        }

        const docRef = await adminDb.collection('server_quizzes').add({
          ...parsedWorksheet.data,
          source: 'n8n_generator',
          createdAt: new Date().toISOString(),
        });

        return NextResponse.json({
          success: true,
          quizId: docRef.id,
          message: 'Worksheet successfully published to server_quizzes',
        });
      }

      case 'remedial.assign': {
        const parsedRemedial = RemedialAssignDataSchema.safeParse(data);
        if (!parsedRemedial.success) {
          return NextResponse.json(
            { error: 'Invalid remedial plan data', details: parsedRemedial.error.format() },
            { status: 400 }
          );
        }

        const { studentId, ...plan } = parsedRemedial.data;
        const remedialRef = await adminDb
          .collection('students')
          .doc(studentId)
          .collection('remedial_plans')
          .add({
            ...plan,
            assignedAt: new Date().toISOString(),
            status: 'assigned',
          });

        return NextResponse.json({
          success: true,
          planId: remedialRef.id,
          message: 'Remedial plan assigned to student',
        });
      }

      case 'redteam.report': {
        const reportRef = await adminDb.collection('redteam_reports').add({
          ...data,
          receivedAt: new Date().toISOString(),
          source: 'n8n_sentinel',
        });

        return NextResponse.json({
          success: true,
          reportId: reportRef.id,
          message: 'Red team report archived',
        });
      }

      default: {
        return NextResponse.json(
          { error: `Unhandled action: ${action}` },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    console.error('[n8n Inbound Webhook Error]:', error);
    return NextResponse.json(
      { error: 'Internal server error processing n8n webhook' },
      { status: 500 }
    );
  }
}
