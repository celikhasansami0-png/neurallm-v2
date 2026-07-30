'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

const QUICK_ACTIONS = [
  { label: 'Ask AI', href: '/ask', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', desc: 'Chat with assistant' },
  { label: 'Agents', href: '/agents', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', desc: 'Run AI agents' },
  { label: 'Workflows', href: '/workflows', icon: 'M22 12h-4l-3 9L9 3l-3 9H2', desc: 'Automate tasks' },
  { label: 'Knowledge Base', href: '/documents', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', desc: 'Your documents' },
  { label: 'Integrations', href: '/integrations', icon: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71', desc: 'Connect tools' },
];

const RECENT_THREADS = [
  {
    id: 1, tag: 'Research', tagColor: '#6D28D9', tagBg: '#F5F3FF',
    title: 'Q3 Market Analysis — SaaS Sector',
    preview: 'Analyst identified 3 high-growth segments. Revenue projections updated based on latest funding data.',
    time: '2h ago', agent: 'Analyst',
  },
  {
    id: 2, tag: 'Report', tagColor: '#0369A1', tagBg: '#EFF6FF',
    title: 'Competitor Landscape — FinTech 2025',
    preview: 'Researcher compiled 18 competitor profiles with positioning maps and pricing breakdowns.',
    time: '5h ago', agent: 'Researcher',
  },
  {
    id: 3, tag: 'Workflow', tagColor: '#065F46', tagBg: '#ECFDF5',
    title: 'Weekly Digest — Client Updates',
    preview: 'Coordinator summarized 42 client touchpoints. 3 flagged for follow-up.',
    time: 'Yesterday', agent: 'Coordinator',
  },
  {
    id: 4, tag: 'Strategy', tagColor: '#92400E', tagBg: '#FEF3C7',
    title: 'GTM Strategy — Enterprise Tier',
    preview: 'Strategist outlined 5-phase go-to-market roadmap with KPI benchmarks.',
    time: '2 days ago', agent: 'Strategist',
  },
];

const TRENDING = [
  'AI in Financial Services',
  'SaaS Pricing Models 2025',
  'Enterprise Sales Automation',
  'LLM Accuracy Benchmarks',
  'B2B Pipeline Optimization',
];

const STATS = [
  { label: 'Queries this week', value: '147' },
  { label: 'Agents active', value: '8' },
  { label: 'Avg. response time', value: '1.8s' },
  { label: 'Documents indexed', value: '2,341' },
];

export default function Dashboard() {
  const { user } = useUser();
  const [input, setInput] = useState('');
  const [hour, setHour] = useState(new Date().getHours());

  useEffect(() => { setHour(new Date().getHours()); }, []);

  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.firstName || 'there';

  return (
    <div style={{ display: 'flex', gap: 32, maxWidth: 1200, margin: '0 auto' }}>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Greeting */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: '#0A0A14', margin: 0, letterSpacing: '-0.5px' }}>
            {greeting}, {firstName}.
          </h1>
          <p style={{ fontSize: 14, color: '#9CA3AF', marginTop: 6 }}>
            Here's what's happening across your workspace.
          </p>
        </div>

        {/* Quick action input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px',
          border: '1px solid #E5E7EB', borderRadius: 12,
          background: '#fff', marginBottom: 28,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask anything or start a new thread…"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#374151', background: 'transparent' }}
          />
          {input && (
            <Link href={`/ask?q=${encodeURIComponent(input)}`} style={{ background: '#0A0A14', color: '#fff', padding: '5px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 500, textDecoration: 'none' }}>
              Send →
            </Link>
          )}
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
          {QUICK_ACTIONS.map(a => (
            <Link key={a.label} href={a.href} style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '9px 14px', borderRadius: 10,
              border: '1px solid #F0F0F0', background: '#fff',
              textDecoration: 'none', color: '#374151', fontSize: 13, fontWeight: 500,
              transition: 'border-color 0.12s, box-shadow 0.12s',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#D1D5DB'; el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#F0F0F0'; el.style.boxShadow = 'none'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={a.icon}/>
              </svg>
              {a.label}
            </Link>
          ))}
        </div>

        {/* Threads */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Recent threads</span>
            <Link href="/ask" style={{ fontSize: 12.5, color: '#9CA3AF', textDecoration: 'none' }}>View all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {RECENT_THREADS.map(thread => (
              <div key={thread.id} style={{
                padding: '14px 16px', border: '1px solid #F0F0F0', borderRadius: 12,
                background: '#fff', cursor: 'pointer', transition: 'border-color 0.12s, box-shadow 0.12s',
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#D1D5DB'; el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#F0F0F0'; el.style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: thread.tagColor, background: thread.tagBg, padding: '2px 8px', borderRadius: 20 }}>
                        {thread.tag}
                      </span>
                      <span style={{ fontSize: 11, color: '#D1D5DB' }}>·</span>
                      <span style={{ fontSize: 11, color: '#9CA3AF' }}>{thread.agent}</span>
                      <span style={{ fontSize: 11, color: '#D1D5DB' }}>·</span>
                      <span style={{ fontSize: 11, color: '#9CA3AF' }}>{thread.time}</span>
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: '#111827', marginBottom: 4 }}>{thread.title}</div>
                    <div style={{ fontSize: 12.5, color: '#6B7280', lineHeight: 1.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{thread.preview}</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}>
                    <polyline points="9,18 15,12 9,6"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <div style={{ width: 268, flexShrink: 0 }}>

        {/* Stats */}
        <div style={{ border: '1px solid #F0F0F0', borderRadius: 14, padding: '16px', background: '#fff', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 14 }}>This week</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {STATS.map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#0A0A14', letterSpacing: '-0.5px' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2, lineHeight: 1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending */}
        <div style={{ border: '1px solid #F0F0F0', borderRadius: 14, padding: '16px', background: '#fff', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 12 }}>What's trending</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {TRENDING.map((t, i) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < TRENDING.length - 1 ? '1px solid #F9FAFB' : 'none', cursor: 'pointer' }}>
                <span style={{ fontSize: 11, color: '#D1D5DB', fontWeight: 600, minWidth: 16, textAlign: 'right' }}>{i + 1}</span>
                <span style={{ fontSize: 12.5, color: '#374151' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA card */}
        <div style={{ borderRadius: 14, padding: '18px 16px', background: '#0A0A14' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 6 }}>Upgrade to Pro</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, marginBottom: 14 }}>
            Unlock unlimited agents, advanced analytics, and priority support.
          </div>
          <button style={{ width: '100%', padding: '8px 0', background: '#fff', color: '#0A0A14', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 12.5, cursor: 'pointer' }}>
            Learn more
          </button>
        </div>
      </div>
    </div>
  );
}
