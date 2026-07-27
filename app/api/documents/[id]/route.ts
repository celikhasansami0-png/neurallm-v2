import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await query('DELETE FROM chunks WHERE document_id = $1', [id]);
    await query('DELETE FROM documents WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE document error:', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
