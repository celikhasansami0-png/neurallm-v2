'use client';

export default function CopilotPage() {
  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px' }}>Copilot</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Your AI assistant is available on every page</p>
      </div>
      <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '40px 32px', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Copilot is always available</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 400, margin: '0 auto' }}>
          Click the purple chat button in the bottom-right corner of any page to open Copilot. It answers questions using all your indexed documents.
        </div>
      </div>
    </div>
  );
}
