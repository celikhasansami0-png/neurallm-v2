'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const breadcrumbs: Record<string, string> = {
  '/': 'Dashboard',
  '/ask': 'Assistant',
  '/documents': 'Knowledge Base',
  '/agents': 'Agents',
  '/workflows': 'Workflows',
  '/copilot': 'ROI',
};

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState('');

  const label = breadcrumbs[pathname] ?? 'NeuraLLM';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/ask?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  return (
    <header
      style={{
        height: 56,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: 16,
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: '0 0 auto' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>NeuraLLM</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
          <path d="M4.5 2.5l3 3.5-3 3.5"/>
        </svg>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Search */}
      <form onSubmit={handleSearch} style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="5.5" cy="5.5" r="4"/>
            <line x1="9" y1="9" x2="12" y2="12"/>
          </svg>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search knowledge base..."
          style={{
            width: 260,
            height: 34,
            paddingLeft: 30,
            paddingRight: 12,
            border: '1px solid var(--border)',
            borderRadius: 6,
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            fontSize: 13,
            outline: 'none',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
        />
        <kbd style={{
          position: 'absolute',
          right: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 10,
          color: 'var(--text-muted)',
          border: '1px solid var(--border)',
          borderRadius: 3,
          padding: '0 4px',
          background: 'var(--bg)',
        }}>
          /
        </kbd>
      </form>

      {/* Status dot */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }} />
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Live</span>
      </div>
    </header>
  );
}
