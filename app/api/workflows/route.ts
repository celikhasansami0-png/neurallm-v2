import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await query('SELECT * FROM workflows ORDER BY created_at DESC');
    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, trigger, action } = await request.json();
    const result = await query(
      'INSERT INTO workflows (name, trigger, action, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, trigger, action, 'active']
    );
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error('Create workflow error:', err);
    return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 });
  }
}
