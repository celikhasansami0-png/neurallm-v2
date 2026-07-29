'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  totalDocuments: number;
  queriesThisWeek: number;
  avgResponseTime: number;
  activeUsers: number;
}

interface Query {
  id: string;
  question: string;
  answer: string;
  created_at: string;
}

const SPARK_DATA = [18, 32, 27, 45, 38, 52, 41, 60, 55, 70, 63, 82, 74, 90];

function LineChart({ data }: { data: number[] }) {
  const w = 340, h = 100;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 16) - 8;
    return `${x},${y}`;
  });
  const pathD = `M ${pts.join(' L ')}`;
  const areaD = `M 0,${h} L ${pts.join(' L ')} L ${w},${h} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#chartGrad)" />
      <path d={pathD} fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {(() => {
        const last = pts[pts.length - 1].split(',');
        return <circle cx={last[0]} cy={last[1]} r="4" fill="#000000" />;
      })()}
    </svg>
  );
}

function CircularScore({ score }: { score: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#E8E8E8" strokeWidth="10" />
      <circle cx="70" cy="70" r={r} fill="none" stroke="#000000" strokeWidth="10"
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        transform="rotate(-90 70 70)" />
      <text x="70" y="65" textAnchor="middle" fill="#0A0A0A" fontSize="28" fontWeight="700" fontFamily="Inter,sans-serif">{score}</text>
      <text x="70" y="82" textAnchor="middle" fill="#999999" fontSize="11" fontFamily="Inter,sans-serif">/ 100</text>
    </svg>
  );
}

function timeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ totalDocuments: 0, queriesThisWeek: 0, avgResponseTime: 0, activeUsers: 1 });
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics').then(r => r.json()).catch(() => ({})),
      fetch('/api/queries?limit=5').then(r => r.json()).catch(() => []),
    ]).then(([statsData, queriesData]) => {
      setStats({ totalDocuments: 0, queriesThisWeek: 0, avgResponseTime: 0, activeUsers: 1, ...statsData });
      setQueries(Array.isArray(queriesData) ? queriesData : []);
    }).finally(() => setLoading(false));
  }, []);

  const healthScore = Math.min(100, Math.round(
    (stats.totalDocuments > 0 ? 40 : 10) +
    (stats.queriesThisWeek > 0 ? 30 : 0) +
    (stats.avgResponseTime < 3 ? 30 : 20)
  ));

  return (
    <div style={{ maxWidth: 1140, paddingBottom: 40 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0A0A0A', letterSpacing: '-0.6px' }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: '#777777', marginTop: 5 }}>Here's what's happening with your knowledge base today</p>
      </div>

      {/* Top row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 16, marginBottom: 16 }}>

        {/* Total Documents */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E8E8', borderRadius: 16, padding: '28px 28px 24px' }}>
          <div style={{ fontSize: 12, color: '#888888', fontWeight: 500, marginBottom: 14, letterSpacing: '0.3px' }}>
            Total Documents Indexed
          </div>
          <div style={{ fontSize: 42, fontWeight: 700, color: '#0A0A0A', letterSpacing: '-1.5px', lineHeight: 1, marginBottom: 14 }}>
            {loading ? '—' : stats.totalDocuments.toLocaleString()}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#000000', background: '#F0F0F0', border: '1px solid #DDDDDD', padding: '4px 10px', borderRadius: 6, marginBottom: 20 }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 8V2M2 5l3-3 3 3" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {stats.queriesThisWeek > 0 ? `+${stats.queriesThisWeek} this week` : 'No queries yet'}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/documents" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#F4F4F4', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 12, fontWeight: 500, color: '#0A0A0A' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="6" y1="1" x2="6" y2="11"/><line x1="1" y1="6" x2="11" y2="6"/></svg>
              Upload Docs
            </Link>
            <Link href="/ask" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#000000', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#FFFFFF' }}>
              Ask AI
            </Link>
          </div>
        </div>

        {/* Query Activity */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E8E8', borderRadius: 16, padding: '24px 24px 20px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
            <div>
              <div style={{ fontSize: 12, color: '#888888', fontWeight: 500, marginBottom: 4 }}>Query Activity</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#0A0A0A', letterSpacing: '-0.5px' }}>
                {loading ? '—' : stats.queriesThisWeek} <span style={{ fontSize: 13, color: '#888888', fontWeight: 400 }}>this week</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['7D', '30D'].map((t, i) => (
                <span key={t} style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: i === 0 ? '#000000' : 'transparent', color: i === 0 ? '#FFFFFF' : '#AAAAAA', border: '1px solid #E0E0E0', cursor: 'pointer' }}>{t}</span>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <LineChart data={SPARK_DATA} />
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 16 }}>

        {/* AI Knowledge Health */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E8E8', borderRadius: 16, padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="5" r="3"/><path d="M1 13c0-3 2.5-5 6-5s6 2 6 5"/></svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0A0A0A' }}>AI Knowledge Health</span>
            </div>
          </div>
          <CircularScore score={loading ? 0 : healthScore} />
          <p style={{ fontSize: 12, color: '#888888', textAlign: 'center', marginTop: 12, lineHeight: 1.5, maxWidth: 200 }}>
            {healthScore >= 80 ? 'Excellent coverage. Agents ready.' : healthScore >= 50 ? 'Good. Upload more docs to improve.' : 'Upload documents to activate AI.'}
          </p>
          <div style={{ width: '100%', marginTop: 16, display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, background: '#F8F8F8', borderRadius: 8, padding: '10px 14px', border: '1px solid #EEEEEE' }}>
              <div style={{ fontSize: 10, color: '#AAAAAA', marginBottom: 3, fontWeight: 500 }}>AVG RESPONSE</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0A0A0A' }}>{loading ? '—' : `${(stats.avgResponseTime || 0).toFixed(1)}s`}</div>
            </div>
            <div style={{ flex: 1, background: '#F8F8F8', borderRadius: 8, padding: '10px 14px', border: '1px solid #EEEEEE' }}>
              <div style={{ fontSize: 10, color: '#AAAAAA', marginBottom: 3, fontWeight: 500 }}>ACTIVE USERS</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0A0A0A' }}>{loading ? '—' : stats.activeUsers}</div>
            </div>
          </div>
        </div>

        {/* Recent Queries */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E8E8', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F0F0F0' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#0A0A0A' }}>Recent Queries</span>
            <Link href="/ask" style={{ fontSize: 12, color: '#000000', fontWeight: 500 }}>Ask AI →</Link>
          </div>
          <div>
            {queries.length === 0 ? (
              <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#AAAAAA', marginBottom: 12 }}>No queries yet</div>
                <Link href="/ask" style={{ fontSize: 13, color: '#000000', fontWeight: 500 }}>Ask your first question →</Link>
              </div>
            ) : (
              queries.map((q, i) => (
                <div key={q.id} style={{ padding: '14px 24px', borderTop: i === 0 ? 'none' : '1px solid #F4F4F4', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: '#F0F0F0', border: '1px solid #E8E8E8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round"><circle cx="6" cy="6" r="4"/><line x1="9.5" y1="9.5" x2="13" y2="13"/></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#0A0A0A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.question}</div>
                    <div style={{ fontSize: 11, color: '#AAAAAA', marginTop: 2 }}>{timeAgo(q.created_at)}</div>
                  </div>
                  <div style={{ fontSize: 11, color: '#555555', fontWeight: 600, flexShrink: 0, background: '#F0F0F0', padding: '3px 8px', borderRadius: 4 }}>AI</div>
                </div>
              ))
            )}
          </div>
          <div style={{ padding: '14px 24px', borderTop: '1px solid #F0F0F0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Summarizer', 'Gap Analysis', 'Trend Report', 'Weekly Digest'].map(agent => (
              <Link key={agent} href="/agents" style={{ fontSize: 11, fontWeight: 500, color: '#555555', background: '#F4F4F4', border: '1px solid #E8E8E8', padding: '5px 10px', borderRadius: 6 }}>{agent}</Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
