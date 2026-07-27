import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 32,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="5" r="3"/>
              <path d="M1 15c0-4 3-7 7-7s7 3 7 7"/>
              <path d="M6 5h4M8 3v4"/>
            </svg>
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>NeuraLLM</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-light)', padding: '2px 6px', borderRadius: 4 }}>v2</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Start your 14-day free trial</p>
      </div>
      <SignUp
        appearance={{
          variables: {
            colorPrimary: '#7C3AED',
            colorBackground: '#FFFFFF',
            colorInputBackground: '#F9F9F9',
            colorInputText: '#111111',
            borderRadius: '8px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
          elements: {
            card: { boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E5E5E5' },
            headerTitle: { fontWeight: '600' },
          }
        }}
      />
    </div>
  );
}
