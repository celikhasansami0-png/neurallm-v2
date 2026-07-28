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

// Fake sparkline data for the activity chart
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
          <stop offset="0%" stopColor="#00D4A8" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#00D4A8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#chartGrad)" />
      <path d={pathD} fill="none" stroke="#00D4A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Last point dot */}
      {(() => {
        const last = pts[pts.length - 1].split(',');
        return <circle cx={last[0]} cy={last[1]} r="4" fill="#00D4A8" />;
      })()}
    </svg>
  );
}

function CircularScore({ score, label }: { score: number; label: string }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16 }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={r}
          fill="none"
          stroke="#00D4A8"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          style={{ filter: 'drop-shadow(0 0 8px rgba(0,212,168,0.6))' }}
        />
        <text x="70" y="65" textAnchor="middle" fill="#F0F4FF" fontSize="28" fontWeight="700" fontFamily="Inter,sans-serif">{score}</text>
        <text x="70" y="82" textAnchor="middle" fill="#4A5468" fontSize="11" fontFamily="Inter,sans-serif">/ 100</text>
      </svg>
      <p style={{ fontSize: 13, color: '#8A94A8', textAlign: 'center', lineHeight: 1.5, maxWidth: 200 }}>{label}</p>
    </div>
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

const AGENT_ICONS = ['📊', '🔍', '📝', '🤝', '👤', '📈', '🗓️', '⚡'];

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
    (stats.avgResponseTime < 3 ? 30 : stats.avgResponseTime < 6 ? 20 : 10)
  ));

  const weekChange = stats.queriesThisWeek > 0
    ? `+${stats.queriesThisWeek} this week`
    : 'No queries yet';

  return (
    <div style={{ maxWidth: 1140, paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontSize: 28, fontWeight: 700, color: '#F0F4FF',
          letterSpacing: '-0.6px', lineHeight: 1.2,
        }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: '#8A94A8', marginTop: 5 }}>
          Here's what's happening with your knowledge base today
        </p>
      </div>

      {/* Top row — 2 big cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 16, marginBottom: 16 }}>

        {/* Total Knowledge card */}
        <div style={{
          background: '#141820',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '28px 28px 24px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 60% 40% at 10% 10%, rgba(0,212,168,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{ fontSize: 12, color: '#8A94A8', fontWeight: 500, letterSpacing: '0.3px', marginBottom: 14 }}>
            Total Documents Indexed
          </div>
          <div style={{ fontSize: 42, fontWeight: 700, color: '#F0F4FF', letterSpacing: '-1.5px', lineHeight: 1, marginBottom: 14 }}>
            {loading ? '—' : stats.totalDocuments.toLocaleString()}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#00D4A8', background: 'rgba(0,212,168,0.12)', border: '1px solid rgba(0,212,168,0.2)', padding: '4px 10px', borderRadius: 6, marginBottom: 20 }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 8V2M2 5l3-3 3 3" stroke="#00D4A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {weekChange}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/documents" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, fontSize: 12, fontWeight: 500, color: '#F0F4FF',
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="6" y1="1" x2="6" y2="11"/><line x1="1" y1="6" x2="11" y2="6"/></svg>
              Upload Docs
            </Link>
            <Link href="/ask" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              background: '#00D4A8', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#000',
            }}>
              Ask AI
            </Link>
          </div>
        </div>

        {/* Query Activity chart card */}
        <div style={{
          background: '#141820',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '24px 24px 20px',
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
            <div>
              <div style={{ fontSize: 12, color: '#8A94A8', fontWeight: 500, marginBottom: 4 }}>Query Activity</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#F0F4FF', letterSpacing: '-0.5px' }}>
                {loading ? '—' : stats.queriesThisWeek} <span style={{ fontSize: 13, color: '#8A94A8', fontWeight: 400 }}>this week</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['7D', '30D'].map((t, i) => (
                <span key={t} style={{
                  fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                  background: i === 0 ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: i === 0 ? '#F0F4FF' : '#4A5468',
                  border: '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                }}>{t}</span>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 16, marginLeft: -4, marginRight: -4 }}>
            <LineChart data={SPARK_DATA} />
          </div>
        </div>
      </div>

      {/* Bottom row — circular score + recent queries */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 16 }}>

        {/* AI Knowledge Health */}
        <div style={{
          background: '#141820',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
        }}>
          <div style={{ width: '100%', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#00D4A8" strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="5" r="3"/><path d="M1 13c0-3 2.5-5 6-5s6 2 6 5"/><path d="M5 5h4M7 3v4"/></svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#F0F4FF' }}>AI Knowledge Health</span>
            </div>
          </div>

          <CircularScore
            score={loading ? 0 : healthScore}
            label={
              healthScore >= 80
                ? 'Excellent knowledge base coverage. Agents ready.'
                : healthScore >= 50
                ? 'Good coverage. Upload more docs to improve.'
                : 'Upload documents to activate AI capabilities.'
            }
          />

          <div style={{ width: '100%', marginTop: 16, display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 10, color: '#4A5468', marginBottom: 3, fontWeight: 500 }}>AVG RESPONSE</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#F0F4FF' }}>{loading ? '—' : `${(stats.avgResponseTime || 0).toFixed(1)}s`}</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 10, color: '#4A5468', marginBottom: 3, fontWeight: 500 }}>ACTIVE USERS</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#F0F4FF' }}>{loading ? '—' : stats.activeUsers}</div>
            </div>
          </div>
        </div>

        {/* Recent Queries */}
        <div style={{
          background: '#141820',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          overflow: 'hidden',
        }}>
          <div style={{ padding: '20px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#F0F4FF' }}>Recent Queries</span>
            <Link href="/ask" style={{ fontSize: 12, color: '#00D4A8', fontWeight: 500 }}>Ask AI →</Link>
          </div>

          <div>
            {loading ? (
              [1,2,3,4].map(i => (
                <div key={i} style={{ padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.04)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ width: '60%', height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginBottom: 6 }} />
                    <div style={{ width: '30%', height: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 4 }} />
                  </div>
                </div>
              ))
            ) : queries.length === 0 ? (
              <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#4A5468', marginBottom: 12 }}>No queries yet</div>
                <Link href="/ask" style={{ fontSize: 13, color: '#00D4A8', fontWeight: 500 }}>Ask your first question →</Link>
              </div>
            ) : (
              queries.map((q, i) => {
                const icon = AGENT_ICONS[i % AGENT_ICONS.length];
                return (
                  <div key={q.id} style={{
                    padding: '14px 24px',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    transition: 'background 0.15s',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: 9,
                      background: 'rgba(0,212,168,0.1)',
                      border: '1px solid rgba(0,212,168,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 15, flexShrink: 0,
                    }}>{icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#F0F4FF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {q.question}
                      </div>
                      <div style={{ fontSize: 11, color: '#4A5468', marginTop: 2 }}>
                        {timeAgo(q.created_at)}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#00D4A8', fontWeight: 600, flexShrink: 0 }}>
                      AI
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick agents */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Summarizer', 'Gap Analysis', 'Trend Report', 'Weekly Digest'].map(agent => (
              <Link key={agent} href={`/agents`} style={{
                fontSize: 11, fontWeight: 500, color: '#8A94A8',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                padding: '5px 10px', borderRadius: 6,
              }}>{agent}</Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
