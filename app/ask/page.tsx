'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface Source { documentName: string; pageNumber: number; documentId: string; }
interface Message { role: 'user' | 'assistant'; content: string; sources?: Source[]; id?: string; }

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 5, padding: '3px 8px', fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
      {copied ? (
        <><svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1.5,5.5 4,8 9.5,2"/></svg>Copied</>
      ) : (
        <><svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><path d="M1 7.5V1.5a1 1 0 0 1 1-1H8"/></svg>Copy</>
      )}
    </button>
  );
}

function SourceTag({ source }: { source: Source }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: 'var(--accent-light)', color: 'var(--accent)',
      fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4, cursor: 'default',
    }} title={`${source.documentName} — page ${source.pageNumber}`}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M6 1H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4L6 1z"/><path d="M6 1v3h3"/>
      </svg>
      {source.documentName.slice(0, 22)}{source.documentName.length > 22 ? '…' : ''} · p{source.pageNumber}
    </span>
  );
}

function AskContent() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Record<number, 'up' | 'down'>>({});
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
    const userMsg: Message = { role: 'user', content: q };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await fetch('/api/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: q }) });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer || 'No relevant information found.', sources: data.sources || [] }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error processing your question. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const allSources = messages.filter(m => m.role === 'assistant').flatMap(m => m.sources || [])
    .filter((s, i, arr) => arr.findIndex(x => x.documentId === s.documentId) === i);

  return (
    <div style={{ maxWidth: 1100, display: 'grid', gridTemplateColumns: '1fr 260px', gap: 24, height: 'calc(100vh - 120px)' }}>
      {/* Main chat */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px' }}>Ask Anything</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Ask questions across all indexed documents</p>
        </div>

        {/* Messages area */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20, paddingRight: 4, marginBottom: 16 }}>
          {messages.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 16, paddingTop: 60 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="10"/>
                  <path d="M8 8a3 3 0 0 1 6 1c0 2-3 3-3 3"/>
                  <circle cx="11" cy="16" r=".8" fill="var(--accent)" stroke="none"/>
                </svg>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 500, fontSize: 15 }}>Ask your knowledge base</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>Questions are answered using your indexed documents</div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {['What are the key findings in our Q4 report?', 'Summarize the project methodology', 'What risks were identified?'].map(s => (
                  <button key={s} onClick={() => setInput(s)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px', fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {msg.role === 'user' ? (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ maxWidth: '75%', background: 'var(--accent)', color: '#fff', borderRadius: '12px 12px 2px 12px', padding: '10px 14px', fontSize: 14, lineHeight: 1.5 }}>
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ background: 'var(--surface)', borderRadius: '2px 12px 12px 12px', padding: '14px 16px', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                    {msg.content}
                  </div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {msg.sources.map((src, j) => <SourceTag key={j} source={src} />)}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <CopyButton text={msg.content} />
                    <button onClick={() => setFeedback(f => ({ ...f, [i]: 'up' }))}
                      style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 5, padding: '3px 8px', fontSize: 11, color: feedback[i] === 'up' ? '#22C55E' : 'var(--text-muted)', cursor: 'pointer' }}>
                      <svg width="11" height="11" viewBox="0 0 11 11" fill={feedback[i] === 'up' ? '#22C55E' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M1 5h2l2-4 2 4h3v5H5L3 7H1V5z"/>
                      </svg>
                    </button>
                    <button onClick={() => setFeedback(f => ({ ...f, [i]: 'down' }))}
                      style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 5, padding: '3px 8px', fontSize: 11, color: feedback[i] === 'down' ? '#EF4444' : 'var(--text-muted)', cursor: 'pointer' }}>
                      <svg width="11" height="11" viewBox="0 0 11 11" fill={feedback[i] === 'down' ? '#EF4444' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M10 6H8L6 10 4 6H1V1h6l2 3h1v2z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '12px 0' }}>
              <div style={{ display: 'flex', gap: 3 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)', animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite` }} />
                ))}
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Searching documents...</span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', background: 'var(--bg)', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask a question about your documents..."
            rows={3}
            style={{ flex: 1, border: 'none', outline: 'none', resize: 'none', fontSize: 14, color: 'var(--text-primary)', background: 'transparent', lineHeight: 1.5 }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          />
          <button onClick={send} disabled={loading || !input.trim()}
            style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--accent)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: loading || !input.trim() ? 0.4 : 1, cursor: loading || !input.trim() ? 'default' : 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="12" x2="7" y2="2"/><polyline points="3,6 7,2 11,6"/>
            </svg>
          </button>
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>Press Enter to send, Shift+Enter for new line</div>
      </div>

      {/* Sources sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', position: 'sticky', top: 20 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 500, fontSize: 13 }}>Referenced Documents</div>
          </div>
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {allSources.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '12px 0' }}>No sources cited yet</div>
            ) : (
              allSources.map((src, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 4, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M6.5 1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V4L6.5 1z"/><path d="M6.5 1v3H9.5"/>
                    </svg>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{src.documentName}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>
    </div>
  );
}

export default function AskPage() {
  return <Suspense fallback={<div>Loading...</div>}><AskContent /></Suspense>;
}
