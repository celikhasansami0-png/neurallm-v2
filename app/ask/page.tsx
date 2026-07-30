'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface Source { documentName: string; pageNumber: number; documentId: string; }
interface Message { role: 'user' | 'assistant'; content: string; sources?: Source[]; }

function AskContent() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) { setInput(q); setTimeout(() => textareaRef.current?.focus(), 100); }
  }, [searchParams]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

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
        content: data.answer || 'No relevant information found.',
        sources: data.sources || [],
      }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error processing your question. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 64px)',
      maxWidth: 780,
      margin: '0 auto',
      width: '100%',
    }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 0 24px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 24, paddingTop: 80 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'linear-gradient(135deg, #6D28D9 0%, #1D4ED8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 600, fontSize: 18, letterSpacing: '-0.4px' }}>Ask your knowledge base</div>
              <div style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 6 }}>Questions are answered using your indexed documents</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 520 }}>
              {['What are the key findings in our Q4 report?', 'Summarize the project methodology', 'What risks were identified?'].map(s => (
                <button key={s} onClick={() => setInput(s)} style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 8, padding: '8px 14px',
                  fontSize: 12.5, color: 'var(--text-secondary)',
                  cursor: 'pointer', transition: 'border-color 0.15s',
                }}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {msg.role === 'user' ? (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px 16px 4px 16px',
                  padding: '10px 16px',
                  fontSize: 14, lineHeight: 1.55,
                  maxWidth: '72%',
                  color: 'var(--text-primary)',
                }}>
                  {msg.content}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: 'linear-gradient(135deg, #6D28D9 0%, #1D4ED8 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2,
                }}>
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="7" cy="4.5" r="2.5"/><path d="M1 13c0-3.5 2.5-6 6-6s6 2.5 6 6"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {msg.sources.map((src, j) => (
                        <span key={j} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          background: 'var(--accent-light)', color: 'var(--accent)',
                          fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 5,
                        }}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            <path d="M6 1H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4L6 1z"/><path d="M6 1v3h3"/>
                          </svg>
                          {src.documentName.slice(0, 24)}{src.documentName.length > 24 ? '…' : ''} · p{src.pageNumber}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 0' }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: 'linear-gradient(135deg, #6D28D9 0%, #1D4ED8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="7" cy="4.5" r="2.5"/><path d="M1 13c0-3.5 2.5-6 6-6s6 2.5 6 6"/>
              </svg>
            </div>
            <div style={{ paddingTop: 6, color: 'var(--text-muted)', fontSize: 14 }}>Thinking</div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input area */}
      <div style={{ paddingBottom: 24 }}>
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: 14,
          background: '#fff',
          boxShadow: '0 1px 12px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask anything..."
            rows={3}
            style={{
              width: '100%', border: 'none', outline: 'none',
              resize: 'none', fontSize: 14.5, color: 'var(--text-primary)',
              background: 'transparent', lineHeight: 1.55,
              padding: '16px 18px 10px',
            }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '8px 12px 12px', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 'auto' }}>Enter to send · Shift+Enter for new line</span>
            <button onClick={send} disabled={loading || !input.trim()}
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: loading || !input.trim() ? 'var(--surface2)' : 'linear-gradient(135deg, #6D28D9 0%, #1D4ED8 100%)',
                border: 'none', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: loading || !input.trim() ? 'default' : 'pointer',
                transition: 'all 0.15s',
              }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={loading || !input.trim() ? 'var(--text-muted)' : '#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="12" x2="7" y2="2"/><polyline points="3,6 7,2 11,6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>
    </div>
  );
}

export default function AskPage() {
  return <Suspense fallback={<div style={{ padding: 40, color: 'var(--text-muted)' }}>Loading...</div>}><AskContent /></Suspense>;
}
