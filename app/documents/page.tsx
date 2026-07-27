'use client';

import { useEffect, useRef, useState } from 'react';

interface Document {
  id: string; name: string; type: string; size: number; status: string; created_at: string;
}

function formatBytes(b: number) {
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1024 / 1024).toFixed(1) + ' MB';
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { color: string; bg: string }> = {
    indexed: { color: '#22C55E', bg: '#F0FDF4' },
    processing: { color: '#F59E0B', bg: '#FFFBEB' },
    failed: { color: '#EF4444', bg: '#FEF2F2' },
  };
  const s = styles[status] || styles.indexed;
  return <span style={{ fontSize: 11, fontWeight: 500, color: s.color, background: s.bg, padding: '2px 8px', borderRadius: 4 }}>{status}</span>;
}

function FileTypeIcon({ type }: { type: string }) {
  const t = type?.toLowerCase();
  const color = t === 'pdf' ? '#EF4444' : t === 'docx' ? '#3B82F6' : '#F59E0B';
  return (
    <div style={{ width: 32, height: 32, borderRadius: 6, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color, flexShrink: 0 }}>
      {t?.toUpperCase().slice(0, 4)}
    </div>
  );
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    fetch('/api/documents').then(r => r.json()).then(data => {
      setDocs(Array.isArray(data) ? data : []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const uploadFiles = async (files: File[]) => {
    const valid = files.filter(f => ['pdf', 'docx', 'pptx'].some(ext => f.name.toLowerCase().endsWith(ext)));
    if (!valid.length) return;
    setUploading(true);
    for (const file of valid) {
      const fd = new FormData();
      fd.append('file', file);
      await fetch('/api/documents/upload', { method: 'POST', body: fd }).catch(() => {});
    }
    setUploading(false);
    load();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(Array.from(e.dataTransfer.files));
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    setDeleteId(null);
    load();
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px' }}>Documents</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Upload and manage your knowledge base documents</p>
      </div>

      {/* Upload area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 12,
          padding: '40px 32px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? 'var(--accent-light)' : 'var(--surface)',
          marginBottom: 28,
          transition: 'all 0.15s',
        }}
      >
        <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.pptx" style={{ display: 'none' }} onChange={(e) => uploadFiles(Array.from(e.target.files || []))} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          {uploading ? (
            <>
              <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>Uploading and indexing...</div>
            </>
          ) : (
            <>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke={dragOver ? 'var(--accent)' : 'var(--text-muted)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 22v4a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2v-4"/>
                <polyline points="10,12 16,6 22,12"/>
                <line x1="16" y1="6" x2="16" y2="22"/>
              </svg>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>Drop files here or click to upload</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Supports PDF, DOCX, PPTX — multiple files allowed</div>
            </>
          )}
        </div>
      </div>

      {/* Documents table */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 500, fontSize: 13 }}>All Documents</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{docs.length} file{docs.length !== 1 ? 's' : ''}</span>
        </div>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Loading...</div>
        ) : docs.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No documents yet. Upload your first document above.</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                {['Name', 'Type', 'Size', 'Uploaded', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {docs.map((doc, i) => (
                <tr key={doc.id} style={{ borderBottom: i < docs.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '13px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <FileTypeIcon type={doc.type} />
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{doc.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '13px 20px', fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{doc.type}</td>
                  <td style={{ padding: '13px 20px', fontSize: 12, color: 'var(--text-secondary)' }}>{formatBytes(doc.size)}</td>
                  <td style={{ padding: '13px 20px', fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(doc.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '13px 20px' }}><StatusBadge status={doc.status} /></td>
                  <td style={{ padding: '13px 20px' }}>
                    <button onClick={() => setDeleteId(doc.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center' }}>
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <polyline points="1,3 12,3"/><path d="M4 3V2h5v1"/><path d="M2 3l.8 8a1 1 0 0 0 1 .9h5.4a1 1 0 0 0 1-.9L11 3"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 28, width: 380 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Delete document?</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>This will remove the document and all its indexed chunks permanently.</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteId(null)} style={{ padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 7, background: 'var(--bg)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleDelete(deleteId)} style={{ padding: '8px 16px', border: 'none', borderRadius: 7, background: '#EF4444', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
