-- Add integration columns to documents table
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS user_id TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'upload',
  ADD COLUMN IF NOT EXISTS external_id TEXT;

-- Unique constraint for external documents (notion/github)
CREATE UNIQUE INDEX IF NOT EXISTS documents_user_external_idx
  ON documents(user_id, external_id)
  WHERE external_id IS NOT NULL;

-- Add unique constraint to chunks to prevent duplicates on re-sync
ALTER TABLE chunks
  ADD COLUMN IF NOT EXISTS chunk_index_v2 INT DEFAULT 0;

-- Index for faster queries per user
CREATE INDEX IF NOT EXISTS documents_user_idx ON documents(user_id);
CREATE INDEX IF NOT EXISTS documents_source_idx ON documents(source);
