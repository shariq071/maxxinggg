import { NextResponse } from 'next/server';
import { getAllSubmissions } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const submissions = await getAllSubmissions();
    return NextResponse.json(
      { submissions },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
        },
      }
    );
  } catch (err: any) {
    console.error('[ADMIN API ERROR]:', err);
    return NextResponse.json({ submissions: [], error: err.message }, { status: 200 });
  }
}
