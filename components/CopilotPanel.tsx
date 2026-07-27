'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

export default function CopilotPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [docCount, setDocCount] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/documents').then(r => r.json()).then(data => {
      setDocCount(Array.isArray(data) ? data.length : 0);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setLoading(true);
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer || 'No answer found.',
        sources: data.sources?.map((s: any) => s.documentName) || [],
      }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error processing your question.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--blue) 100%)',
          border: 'none',
          boxShadow: '0 0 20px var(--accent-glow)',
          display: open ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 100,
          color: '#fff',
        }}
        title="Open Copilot"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 2h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H6l-4 3V3a1 1 0 0 1 1-1z"/>
          <circle cx="6" cy="8" r=".8" fill="currentColor" stroke="none"/>
          <circle cx="9" cy="8" r=".8" fill="currentColor" stroke="none"/>
          <circle cx="12" cy="8" r=".8" fill="currentColor" stroke="none"/>
        </svg>
      </button>

      {/* Slide-over panel */}
      {open && (
        <div
          style={{
            position: 'fixed',
            right: 0,
            top: 0,
            bottom: 0,
            width: 380,
            background: 'rgba(10, 12, 15, 0.95)',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100,
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'var(--accent-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)',
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 2h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H5l-3 2V3a1 1 0 0 1 1-1z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Copilot</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Based on {docCount} document{docCount !== 1 ? 's' : ''}</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                padding: 4,
                borderRadius: 4,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="2" y1="2" x2="12" y2="12"/>
                <line x1="12" y1="2" x2="2" y2="12"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', paddingTop: 40 }}>
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Ask anything about your documents</div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 4 }}>
                <div style={{
                  maxWidth: '85%',
                  padding: '9px 13px',
                  borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  background: m.role === 'user' ? 'linear-gradient(135deg, var(--accent) 0%, var(--blue) 100%)' : 'var(--surface2)',
                  border: m.role === 'assistant' ? '1px solid var(--border)' : 'none',
                  color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
                  fontSize: 13,
                  lineHeight: 1.5,
                }}>
                  {m.content}
                </div>
                {m.sources && m.sources.length > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--accent)', paddingLeft: 2 }}>
                    {m.sources.slice(0, 2).join(', ')}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 4, paddingLeft: 2 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'var(--text-muted)',
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                rows={2}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  resize: 'none',
                  fontSize: 13,
                  color: 'var(--text-primary)',
                  background: 'var(--surface)',
                  outline: 'none',
                  lineHeight: 1.5,
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 7,
                  background: 'var(--accent)',
                  border: 'none',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: loading || !input.trim() ? 0.4 : 1,
                  flexShrink: 0,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="6.5" y1="11" x2="6.5" y2="2"/>
                  <polyline points="2.5,6 6.5,2 10.5,6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}
