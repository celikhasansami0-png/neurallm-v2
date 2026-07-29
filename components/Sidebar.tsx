'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';

const navItems = [
  {
    href: '/',
    label: 'Overview',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>,
  },
  {
    href: '/ask',
    label: 'Ask AI',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 10.5a1 1 0 0 1-1 1H4.5L2 14V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v7.5z"/><path d="M5.5 7h5M5.5 9.5h3"/></svg>,
  },
  {
    href: '/agents',
    label: 'AI Agents',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="5" r="3"/><path d="M1.5 15c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6"/></svg>,
  },
  {
    href: '/documents',
    label: 'Documents',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1.5H3.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V6L9 1.5z"/><path d="M9 1.5V6H13.5"/><line x1="5" y1="9" x2="11" y2="9"/><line x1="5" y1="11.5" x2="8.5" y2="11.5"/></svg>,
  },
  {
    href: '/workflows',
    label: 'Workflows',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="3" cy="4.5" r="1.5"/><circle cx="13" cy="4.5" r="1.5"/><circle cx="8" cy="12.5" r="1.5"/><line x1="4.5" y1="4.5" x2="11.5" y2="4.5"/><path d="M3 6v3a2 2 0 0 0 2 2H8"/><path d="M13 6v3a2 2 0 0 1-2 2H8"/></svg>,
  },
  {
    href: '/copilot',
    label: 'Copilot',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5L8 2z"/></svg>,
  },
  {
    href: '/integrations',
    label: 'Integrations',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="3.5" cy="8" r="2"/><circle cx="12.5" cy="3.5" r="2"/><circle cx="12.5" cy="12.5" r="2"/><line x1="5.5" y1="8" x2="10.5" y2="4.5"/><line x1="5.5" y1="8" x2="10.5" y2="11.5"/></svg>,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <aside style={{
      width: 230,
      minWidth: 230,
      height: '100vh',
      background: '#000000',
      borderRight: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 40,
    }}>
      {/* Logo */}
      <div style={{
        padding: '22px 20px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: '#FFFFFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#000000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="5" r="2.5"/>
            <path d="M2 14c0-3.5 2.5-6 6-6s6 2.5 6 6"/>
            <path d="M6 5h4M8 3v4"/>
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#FFFFFF', letterSpacing: '-0.3px' }}>NeuraLLM</div>
          <div style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', marginTop: -1 }}>AI OS</div>
        </div>
        <span style={{
          marginLeft: 'auto',
          fontSize: 10, fontWeight: 700,
          color: '#000000',
          background: '#FFFFFF',
          padding: '3px 7px', borderRadius: 4,
          letterSpacing: '0.3px',
        }}>v2</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              borderRadius: 8,
              fontSize: 13.5,
              fontWeight: active ? 600 : 400,
              color: active ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
              background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
              border: active ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
              transition: 'all 0.15s',
            }}>
              <span style={{ color: active ? '#FFFFFF' : 'rgba(255,255,255,0.4)', display: 'flex', flexShrink: 0 }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{
        padding: '14px 16px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <UserButton appearance={{
          variables: { colorPrimary: '#FFFFFF' },
          elements: { avatarBox: { width: 30, height: 30 } }
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 500, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.firstName || user?.emailAddresses?.[0]?.emailAddress || 'My Workspace'}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>Consulting Edition</div>
        </div>
      </div>
    </aside>
  );
}
