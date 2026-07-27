'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="1" width="5" height="5" rx="1"/>
        <rect x="8" y="1" width="5" height="5" rx="1"/>
        <rect x="1" y="8" width="5" height="5" rx="1"/>
        <rect x="8" y="8" width="5" height="5" rx="1"/>
      </svg>
    ),
  },
  {
    href: '/ask',
    label: 'Ask Anything',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7" cy="7" r="6"/>
        <path d="M5.2 5.2a1.8 1.8 0 0 1 3.5.6c0 1.2-1.8 1.8-1.8 1.8"/>
        <circle cx="7" cy="10" r=".5" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    href: '/documents',
    label: 'Documents',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 1H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5L8 1z"/>
        <path d="M8 1v4h4"/>
        <line x1="4" y1="8" x2="10" y2="8"/>
        <line x1="4" y1="10.5" x2="8" y2="10.5"/>
      </svg>
    ),
  },
  {
    href: '/agents',
    label: 'Agents',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7" cy="5" r="3"/>
        <path d="M1 13c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
        <line x1="7" y1="8" x2="7" y2="10"/>
        <circle cx="5" cy="5" r=".4" fill="currentColor" stroke="none"/>
        <circle cx="9" cy="5" r=".4" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    href: '/workflows',
    label: 'Workflows',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="2.5" cy="4" r="1.5"/>
        <circle cx="11.5" cy="4" r="1.5"/>
        <circle cx="7" cy="11" r="1.5"/>
        <line x1="4" y1="4" x2="10" y2="4"/>
        <path d="M2.5 5.5v2.5a2 2 0 0 0 2 2H7"/>
        <path d="M11.5 5.5v2.5a2 2 0 0 1-2 2H7"/>
      </svg>
    ),
  },
  {
    href: '/copilot',
    label: 'Copilot',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 2h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H5l-3 2V3a1 1 0 0 1 1-1z"/>
        <line x1="4.5" y1="6" x2="4.5" y2="6.01" strokeWidth="2"/>
        <line x1="7" y1="6" x2="7" y2="6.01" strokeWidth="2"/>
        <line x1="9.5" y1="6" x2="9.5" y2="6.01" strokeWidth="2"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 220,
        minWidth: 220,
        height: '100vh',
        borderRight: '1px solid var(--border)',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <img
          src="/assets/logo.png"
          alt="NeuraLLM"
          style={{ width: 24, height: 24 }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
          NeuraLLM
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 10,
            fontWeight: 600,
            color: 'var(--accent)',
            background: 'var(--accent-light)',
            padding: '1px 6px',
            borderRadius: 4,
            letterSpacing: '0.3px',
          }}
        >
          v2
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '7px 10px',
                borderRadius: 6,
                fontSize: 13.5,
                fontWeight: active ? 500 : 400,
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: active ? 'var(--surface)' : 'transparent',
                transition: 'all 0.1s',
              }}
            >
              <span style={{ color: active ? 'var(--accent)' : 'var(--text-muted)', display: 'flex' }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Single Workspace</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Consulting Edition</div>
      </div>
    </aside>
  );
}
