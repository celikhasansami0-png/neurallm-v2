'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';

const navItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="1" width="5.5" height="5.5" rx="1.5"/><rect x="8.5" y="1" width="5.5" height="5.5" rx="1.5"/><rect x="1" y="8.5" width="5.5" height="5.5" rx="1.5"/><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.5"/></svg>,
  },
  {
    href: '/ask',
    label: 'Ask AI',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="7.5" r="6"/><path d="M5.5 5.8a2 2 0 0 1 3.9.7c0 1.3-2 2-2 2"/><circle cx="7.5" cy="10.5" r=".5" fill="currentColor" stroke="none"/></svg>,
  },
  {
    href: '/documents',
    label: 'Documents',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 1.5H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V6L8.5 1.5z"/><path d="M8.5 1.5V6H13"/><line x1="4.5" y1="8.5" x2="10.5" y2="8.5"/><line x1="4.5" y1="11" x2="8" y2="11"/></svg>,
  },
  {
    href: '/agents',
    label: 'Agents',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="5" r="3"/><path d="M1 14c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6"/><circle cx="5.5" cy="5" r=".4" fill="currentColor" stroke="none"/><circle cx="9.5" cy="5" r=".4" fill="currentColor" stroke="none"/></svg>,
  },
  {
    href: '/workflows',
    label: 'Workflows',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="2.5" cy="4" r="1.5"/><circle cx="12.5" cy="4" r="1.5"/><circle cx="7.5" cy="12" r="1.5"/><line x1="4" y1="4" x2="11" y2="4"/><path d="M2.5 5.5v2.5a2 2 0 0 0 2 2H7.5"/><path d="M12.5 5.5v2.5a2 2 0 0 1-2 2H7.5"/></svg>,
  },
  {
    href: '/copilot',
    label: 'Copilot',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 2h11a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5.5l-3.5 2V3a1 1 0 0 1 1-1z"/><line x1="5" y1="6.5" x2="5" y2="6.51" strokeWidth="2"/><line x1="7.5" y1="6.5" x2="7.5" y2="6.51" strokeWidth="2"/><line x1="10" y1="6.5" x2="10" y2="6.51" strokeWidth="2"/></svg>,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <aside style={{
      width: 220,
      minWidth: 220,
      height: '100vh',
      borderRight: '1px solid var(--border)',
      background: 'rgba(10, 12, 15, 0.95)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 40,
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 18px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--blue) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 12px var(--accent-glow)',
          flexShrink: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="7" cy="4" r="2.5"/>
            <path d="M1 13c0-3 2.5-5 6-5s6 2 6 5"/>
            <path d="M5 4h4M7 2v4"/>
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>NeuraLLM</div>
          <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--accent)', letterSpacing: '1px', marginTop: -1 }}>AI OS</div>
        </div>
        <span style={{
          marginLeft: 'auto',
          fontSize: 9, fontWeight: 700,
          color: 'var(--accent)',
          background: 'var(--accent-light)',
          border: '1px solid rgba(0,212,168,0.2)',
          padding: '2px 6px', borderRadius: 4,
          letterSpacing: '0.5px',
        }}>v2</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {navItems.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: active ? 500 : 400,
              color: active ? 'var(--text-primary)' : 'var(--text-muted)',
              background: active ? 'var(--surface2)' : 'transparent',
              border: active ? '1px solid var(--border-bright)' : '1px solid transparent',
              transition: 'all 0.15s',
              position: 'relative',
            }}>
              {active && (
                <div style={{
                  position: 'absolute', left: 0, top: '20%', bottom: '20%',
                  width: 2, borderRadius: 2,
                  background: 'var(--accent)',
                  boxShadow: '0 0 6px var(--accent)',
                }} />
              )}
              <span style={{ color: active ? 'var(--accent)' : 'var(--text-muted)', display: 'flex', flexShrink: 0 }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--glass)',
      }}>
        <UserButton appearance={{
          variables: { colorPrimary: '#00D4A8' },
          elements: { avatarBox: { width: 28, height: 28 } }
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.firstName || user?.emailAddresses?.[0]?.emailAddress || 'My Workspace'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--accent)', marginTop: 1 }}>Consulting Edition</div>
        </div>
      </div>
    </aside>
  );
}
