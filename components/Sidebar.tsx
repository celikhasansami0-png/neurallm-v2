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
    label: 'Assistant',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 10.5a1 1 0 0 1-1 1H4.5L2 14V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v7.5z"/></svg>,
  },
  {
    href: '/agents',
    label: 'Agents',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="5" r="3"/><path d="M1.5 15c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6"/></svg>,
  },
  {
    href: '/workflows',
    label: 'Workflows',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="3" cy="4.5" r="1.5"/><circle cx="13" cy="4.5" r="1.5"/><circle cx="8" cy="12.5" r="1.5"/><line x1="4.5" y1="4.5" x2="11.5" y2="4.5"/><path d="M3 6v3a2 2 0 0 0 2 2H8"/><path d="M13 6v3a2 2 0 0 1-2 2H8"/></svg>,
  },
  {
    href: '/documents',
    label: 'Knowledge Base',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1.5H3.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V6L9 1.5z"/><path d="M9 1.5V6H13.5"/><line x1="5" y1="9" x2="11" y2="9"/><line x1="5" y1="11.5" x2="8.5" y2="11.5"/></svg>,
  },
  {
    href: '/integrations',
    label: 'Integrations',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="3.5" cy="8" r="2"/><circle cx="12.5" cy="3.5" r="2"/><circle cx="12.5" cy="12.5" r="2"/><line x1="5.5" y1="8" x2="10.5" y2="4.5"/><line x1="5.5" y1="8" x2="10.5" y2="11.5"/></svg>,
  },
  {
    href: '/copilot',
    label: 'ROI',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1,12 5,7 8,9 12,4 15,6"/><line x1="1" y1="15" x2="15" y2="15"/></svg>,
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
      background: '#FFFFFF',
      borderRight: '1px solid rgba(0,0,0,0.08)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 40,
    }}>
      {/* Logo */}
      <div style={{
        padding: '18px 16px 14px',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        {process.env.NEXT_PUBLIC_LOGO_URL ? (
          <img src={process.env.NEXT_PUBLIC_LOGO_URL} alt="Logo" style={{ width: 28, height: 28, objectFit: 'contain' }} />
        ) : (
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: '#0A0A14',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7.5" cy="5" r="2.5"/>
              <path d="M2 14c0-3.5 2.5-6 5.5-6s5.5 2.5 5.5 6"/>
            </svg>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {navItems.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '7px 10px',
              borderRadius: 6,
              fontSize: 13.5,
              fontWeight: active ? 500 : 400,
              color: active ? '#0A0A14' : '#666666',
              background: active ? '#F0F0F0' : 'transparent',
              transition: 'all 0.12s',
            }}>
              <span style={{ color: active ? '#0A0A14' : '#999999', display: 'flex', flexShrink: 0 }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div style={{ padding: '0 8px 6px' }}>
        <Link href="/settings" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: '7px 10px',
          borderRadius: 6,
          fontSize: 13.5,
          fontWeight: 400,
          color: '#666666',
          background: 'transparent',
          transition: 'all 0.12s',
        }}>
          <span style={{ color: '#999999', display: 'flex', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="8" r="2.5"/>
              <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"/>
            </svg>
          </span>
          Settings
        </Link>
      </div>

      {/* User footer */}
      <div style={{
        padding: '10px 14px',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        display: 'flex', alignItems: 'center', gap: 9,
      }}>
        <UserButton appearance={{
          elements: { avatarBox: { width: 28, height: 28 } }
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#0A0A14', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.firstName || user?.emailAddresses?.[0]?.emailAddress || 'My Workspace'}
          </div>
          <div style={{ fontSize: 11, color: '#999999', marginTop: 1 }}>Settings</div>
        </div>
      </div>
    </aside>
  );
}
