'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  totalDocuments: number;
  queriesThisWeek: number;
  avgResponseTime: number;
  activeUsers: number;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  status: string;
  created_at: string;
}

interface Query {
  id: string;
  question: string;
  answer: string;
  sources: string;
  created_at: string;
}

function StatCard({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div style={{
      background: 'var(--bg)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '20px 24px',
      flex: 1,
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-1px' }}>{value}</span>
        {unit && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{unit}</span>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color = status === 'indexed' ? '#22C55E' : status === 'processing' ? '#F59E0B' : '#EF4444';
  const bg = status === 'indexed' ? '#F0FDF4' : status === 'processing' ? '#FFFBEB' : '#FEF2F2';
  return (
    <span style={{ fontSize: 11, fontWeight: 500, color, background: bg, padding: '2px 8px', borderRadius: 4 }}>
      {status}
    </span>
  );
}

function FileIcon({ type }: { type: string }) {
  const ext = type?.toLowerCase();
  const color = ext === 'pdf' ? '#EF4444' : ext === 'docx' ? '#3B82F6' : '#F59E0B';
  return (
    <div style={{
      width: 28, height: 28, borderRadius: 5,
      background: color + '15',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 9, fontWeight: 700, color, flexShrink: 0,
    }}>
      {ext?.toUpperCase().slice(0, 3)}
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ totalDocuments: 0, queriesThisWeek: 0, avgResponseTime: 0, activeUsers: 1 });
  const [documents, setDocuments] = useState<Document[]>([]);
  const [recentQuery, setRecentQuery] = useState<Query | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics').then(r => r.json()),
      fetch('/api/documents').then(r => r.json()),
      fetch('/api/queries?limit=1').then(r => r.json()).catch(() => []),
    ]).then(([statsData, docsData, queriesData]) => {
      setStats(statsData);
      setDocuments(Array.isArray(docsData) ? docsData.slice(0, 5) : []);
      if (Array.isArray(queriesData) && queriesData.length > 0) setRecentQuery(queriesData[0]);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Knowledge Base</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Overview of your consulting knowledge platform</p>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Documents" value={loading ? '—' : stats.totalDocuments} />
        <StatCard label="Queries This Week" value={loading ? '—' : stats.queriesThisWeek} />
        <StatCard label="Avg Response Time" value={loading ? '—' : stats.avgResponseTime.toFixed ? stats.avgResponseTime.toFixed(1) : stats.avgResponseTime} unit="s" />
        <StatCard label="Active Users" value={loading ? '—' : stats.activeUsers} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 500, fontSize: 13 }}>Recent Conversation</span>
            <Link href="/ask" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>View all</Link>
          </div>
          <div style={{ padding: '20px' }}>
            {recentQuery ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: 'var(--surface)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--text-primary)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>USER</div>
                  {recentQuery.question}
                </div>
                <div style={{ background: 'var(--accent-light)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  <div style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 4, fontWeight: 500 }}>NEURALLM</div>
                  {recentQuery.answer?.slice(0, 220)}{recentQuery.answer?.length > 220 ? '...' : ''}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No conversations yet</div>
                <Link href="/ask" style={{ display: 'inline-block', marginTop: 12, fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>Ask your first question</Link>
              </div>
            )}
          </div>
        </div>

        <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 500, fontSize: 13 }}>Recent Documents</span>
            <Link href="/documents" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>Manage</Link>
          </div>
          <div>
            {documents.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No documents uploaded yet</div>
                <Link href="/documents" style={{ display: 'inline-block', marginTop: 12, fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>Upload documents</Link>
              </div>
            ) : (
              documents.map((doc, i) => (
                <div key={doc.id} style={{
                  padding: '12px 20px',
                  borderBottom: i < documents.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}>
                  <FileIcon type={doc.type} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{formatBytes(doc.size)}</div>
                  </div>
                  <StatusBadge status={doc.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <Link href="/documents" style={{
          display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px',
          background: 'var(--accent)', color: '#fff', borderRadius: 7, fontSize: 13, fontWeight: 500,
        }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="6.5" y1="1" x2="6.5" y2="12"/><line x1="1" y1="6.5" x2="12" y2="6.5"/></svg>
          Upload Document
        </Link>
        <Link href="/ask" style={{
          display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px',
          background: 'var(--bg)', color: 'var(--text-primary)', borderRadius: 7, fontSize: 13, fontWeight: 500, border: '1px solid var(--border)',
        }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="5.5" cy="5.5" r="4"/><line x1="9" y1="9" x2="12" y2="12"/></svg>
          Ask a Question
        </Link>
        <Link href="/agents" style={{
          display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px',
          background: 'var(--bg)', color: 'var(--text-primary)', borderRadius: 7, fontSize: 13, fontWeight: 500, border: '1px solid var(--border)',
        }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="6.5" cy="4.5" r="3"/><path d="M1 12c0-3 2.5-5.5 5.5-5.5S12 9 12 12"/></svg>
          Run Agent
        </Link>
      </div>
    </div>
  );
}
