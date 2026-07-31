import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

// One-time setup endpoint. Protected by SETUP_SECRET env var.
// Call: POST /api/setup with header X-Setup-Secret: <value>
export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-setup-secret');
  if (!secret || secret !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: { step: string; ok: boolean; error?: string }[] = [];

  const steps = [
    {
      name: 'pgvector extension',
      sql: 'CREATE EXTENSION IF NOT EXISTS vector;',
    },
    {
      name: 'documents table',
      sql: `CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        size BIGINT NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'indexed', 'failed')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );`,
    },
    {
      name: 'chunks table',
      sql: `CREATE TABLE IF NOT EXISTS chunks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        embedding vector(384),
        page_number INT NOT NULL DEFAULT 1,
        chunk_index INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );`,
    },
    {
      name: 'chunks embedding index',
      sql: `CREATE INDEX IF NOT EXISTS chunks_embedding_idx ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);`,
    },
    {
      name: 'queries table',
      sql: `CREATE TABLE IF NOT EXISTS queries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT,
        question TEXT NOT NULL,
        answer TEXT,
        sources JSONB DEFAULT '[]',
        feedback TEXT CHECK (feedback IN ('up', 'down', NULL)),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );`,
    },
    {
      name: 'workflows table',
      sql: `CREATE TABLE IF NOT EXISTS workflows (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT,
        name TEXT NOT NULL,
        description TEXT,
        trigger TEXT NOT NULL,
        action TEXT NOT NULL,
        nodes JSONB DEFAULT '[]',
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'running')),
        last_run TIMESTAMPTZ,
        run_count INT DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );`,
    },
    {
      name: 'subscriptions table',
      sql: `CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL UNIQUE,
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        status TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'cancelled', 'past_due')),
        plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'team', 'enterprise')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );`,
    },
    {
      name: 'integrations table',
      sql: `CREATE TABLE IF NOT EXISTS integrations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        access_token TEXT,
        refresh_token TEXT,
        workspace_id TEXT,
        workspace_name TEXT,
        metadata JSONB DEFAULT '{}',
        connected_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, type)
      );`,
    },
    {
      name: 'audit_logs table',
      sql: `CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        action TEXT NOT NULL,
        resource_type TEXT,
        resource_id TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );`,
    },
    {
      name: 'audit_logs indexes',
      sql: `CREATE INDEX IF NOT EXISTS audit_logs_user_idx ON audit_logs(user_id);
            CREATE INDEX IF NOT EXISTS audit_logs_created_idx ON audit_logs(created_at DESC);`,
    },
    {
      name: 'updated_at trigger function',
      sql: `CREATE OR REPLACE FUNCTION update_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
              NEW.updated_at = NOW();
              RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;`,
    },
    {
      name: 'documents trigger',
      sql: `DROP TRIGGER IF EXISTS documents_updated_at ON documents;
            CREATE TRIGGER documents_updated_at
              BEFORE UPDATE ON documents
              FOR EACH ROW EXECUTE FUNCTION update_updated_at();`,
    },
    {
      name: 'workflows trigger',
      sql: `DROP TRIGGER IF EXISTS workflows_updated_at ON workflows;
            CREATE TRIGGER workflows_updated_at
              BEFORE UPDATE ON workflows
              FOR EACH ROW EXECUTE FUNCTION update_updated_at();`,
    },
    {
      name: 'integrations trigger',
      sql: `DROP TRIGGER IF EXISTS integrations_updated_at ON integrations;
            CREATE TRIGGER integrations_updated_at
              BEFORE UPDATE ON integrations
              FOR EACH ROW EXECUTE FUNCTION update_updated_at();`,
    },
  ];

  for (const step of steps) {
    try {
      await query(step.sql);
      results.push({ step: step.name, ok: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ step: step.name, ok: false, error: msg });
    }
  }

  const allOk = results.every(r => r.ok);
  return NextResponse.json({ success: allOk, results }, { status: allOk ? 200 : 207 });
}
