'use client';

import { useState } from 'react';

const COLORS = ['#6D28D9', '#1D4ED8', '#0891B2', '#059669', '#D97706', '#DC2626', '#7C3AED', '#DB2777'];

const BAR_DATA = [
  { label: 'Jan', queries: 320, docs: 140 },
  { label: 'Feb', queries: 480, docs: 190 },
  { label: 'Mar', queries: 390, docs: 210 },
  { label: 'Apr', queries: 620, docs: 280 },
  { label: 'May', queries: 540, docs: 320 },
  { label: 'Jun', queries: 710, docs: 400 },
  { label: 'Jul', queries: 880, docs: 460 },
];

const PIE_SEGMENTS = [
  { label: 'Research', value: 35, color: '#6D28D9' },
  { label: 'Strategy', value: 25, color: '#1D4ED8' },
  { label: 'Reports', value: 20, color: '#0891B2' },
  { label: 'Workflows', value: 12, color: '#059669' },
  { label: 'Other', value: 8, color: '#D97706' },
];

const AGENT_PERF = [
  { name: 'Analyst',     queries: 342, accuracy: 97, color: '#6D28D9' },
  { name: 'Researcher',  queries: 289, accuracy: 94, color: '#1D4ED8' },
  { name: 'Strategist',  queries: 211, accuracy: 96, color: '#0891B2' },
  { name: 'Coordinator', queries: 178, accuracy: 98, color: '#059669' },
  { name: 'Reporter',    queries: 143, accuracy: 93, color: '#D97706' },
  { name: 'Auditor',     queries: 97,  accuracy: 99, color: '#DC2626' },
];

const LINE_POINTS = [120, 180, 140, 260, 320, 280, 410, 480, 520, 490, 610, 680];

function MiniBarChart({ data }: { data: typeof BAR_DATA }) {
  const maxVal = Math.max(...data.map(d => d.queries));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140, padding: '0 4px' }}>
      {data.map((d, i) => (
        <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'flex-end' }}>
            <div style={{ width: '60%', background: '#EDE9FE', borderRadius: '4px 4px 0 0', height: `${(d.docs / maxVal) * 110}px`, transition: 'height 0.3s' }}/>
            <div style={{ width: '100%', background: `linear-gradient(180deg, #7C3AED, #6D28D9)`, borderRadius: '4px 4px 0 0', height: `${(d.queries / maxVal) * 110}px`, transition: 'height 0.3s' }}/>
          </div>
          <span style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function PieChart({ segments }: { segments: typeof PIE_SEGMENTS }) {
  const total = segments.reduce((s, g) => s + g.value, 0);
  let offset = 0;
  const r = 70, cx = 90, cy = 90;
  const circ = 2 * Math.PI * r;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth="28"/>
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dash = pct * circ;
          const gap = circ - dash;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={seg.color} strokeWidth="28"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset * circ}
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ transition: 'stroke-dasharray 0.4s' }}
            />
          );
          offset += pct;
          return el;
        })}
        <circle cx={cx} cy={cy} r={r - 22} fill="white"/>
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="20" fontWeight="700" fill="#0A0A14">{total}%</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#9CA3AF">Activity</text>
      </svg>
      <div style={{ flex: 1 }}>
        {segments.map(seg => (
          <div key={seg.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: seg.color, flexShrink: 0 }}/>
              <span style={{ fontSize: 12.5, color: '#374151' }}>{seg.label}</span>
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#111827' }}>{seg.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChart({ points }: { points: number[] }) {
  const max = Math.max(...points), min = Math.min(...points);
  const w = 400, h = 100;
  const xStep = w / (points.length - 1);
  const yRange = max - min || 1;
  const toY = (v: number) => h - ((v - min) / yRange) * (h - 10) - 5;
  const pts = points.map((v, i) => `${i * xStep},${toY(v)}`).join(' ');
  const area = `0,${h} ` + points.map((v, i) => `${i * xStep},${toY(v)}`).join(' ') + ` ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 100 }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6D28D9" stopOpacity="0.15"/>
          <stop offset="100%" stopColor="#6D28D9" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#areaGrad)"/>
      <polyline points={pts} fill="none" stroke="#6D28D9" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      {points.map((v, i) => (
        <circle key={i} cx={i * xStep} cy={toY(v)} r="3.5" fill="#6D28D9" stroke="#fff" strokeWidth="2"/>
      ))}
    </svg>
  );
}

export default function ROIPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const STAT_CARDS = [
    { label: 'Total Queries', value: '2,891', delta: '+18%', color: '#6D28D9', bg: '#F5F3FF' },
    { label: 'Docs Processed', value: '1,204', delta: '+31%', color: '#1D4ED8', bg: '#EFF6FF' },
    { label: 'Avg Response', value: '1.7s', delta: '-12%', color: '#059669', bg: '#ECFDF5' },
    { label: 'Hours Saved', value: '340h', delta: '+24%', color: '#D97706', bg: '#FFFBEB' },
  ];

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#0A0A14', margin: 0, letterSpacing: '-0.4px' }}>Reports & ROI</h1>
          <p style={{ fontSize: 13.5, color: '#9CA3AF', marginTop: 4 }}>Performance analytics across all agents and workflows.</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['7d', '30d', '90d'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: '6px 14px', borderRadius: 8, border: '1px solid',
              borderColor: period === p ? '#0A0A14' : '#E5E7EB',
              background: period === p ? '#0A0A14' : '#fff',
              color: period === p ? '#fff' : '#6B7280',
              fontSize: 12.5, fontWeight: 500, cursor: 'pointer', transition: 'all 0.12s',
            }}>{p}</button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {STAT_CARDS.map(card => (
          <div key={card.label} style={{ border: '1px solid #F0F0F0', borderRadius: 14, padding: '16px 18px', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>{card.label}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: card.color, background: card.bg, padding: '2px 8px', borderRadius: 20 }}>{card.delta}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#0A0A14', letterSpacing: '-0.5px' }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Bar chart */}
        <div style={{ border: '1px solid #F0F0F0', borderRadius: 14, padding: '20px', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>Queries vs Documents</span>
            <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#9CA3AF' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#6D28D9', display: 'inline-block' }}/> Queries</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#EDE9FE', display: 'inline-block' }}/> Docs</span>
            </div>
          </div>
          <MiniBarChart data={BAR_DATA}/>
        </div>

        {/* Pie chart */}
        <div style={{ border: '1px solid #F0F0F0', borderRadius: 14, padding: '20px', background: '#fff' }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Usage by type</div>
          <PieChart segments={PIE_SEGMENTS}/>
        </div>
      </div>

      {/* Line chart */}
      <div style={{ border: '1px solid #F0F0F0', borderRadius: 14, padding: '20px', background: '#fff', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>Query volume trend</span>
          <span style={{ fontSize: 12, color: '#059669', fontWeight: 500 }}>↑ 42% vs last period</span>
        </div>
        <LineChart points={LINE_POINTS}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, padding: '0 2px' }}>
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
            <span key={m} style={{ fontSize: 10, color: '#D1D5DB' }}>{m}</span>
          ))}
        </div>
      </div>

      {/* Agent performance */}
      <div style={{ border: '1px solid #F0F0F0', borderRadius: 14, padding: '20px', background: '#fff' }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Agent performance</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {AGENT_PERF.map(a => (
            <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.color, flexShrink: 0 }}/>
              <span style={{ fontSize: 13, color: '#374151', width: 100, flexShrink: 0 }}>{a.name}</span>
              <div style={{ flex: 1, height: 6, background: '#F3F4F6', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ width: `${(a.queries / 360) * 100}%`, height: '100%', background: a.color, borderRadius: 10 }}/>
              </div>
              <span style={{ fontSize: 12, color: '#9CA3AF', width: 60, textAlign: 'right' }}>{a.queries} runs</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: a.color, width: 42, textAlign: 'right' }}>{a.accuracy}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
