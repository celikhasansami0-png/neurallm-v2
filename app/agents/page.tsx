'use client';

import { useEffect, useState } from 'react';

const AGENTS = [
  { id: 'summarizer', name: 'Summarizer', desc: 'Generate a concise 1-page summary of any document', icon: 'M3 5h12M3 8h9M3 11h6', inputLabel: 'Document ID or paste text', inputType: 'textarea' },
  { id: 'comparator', name: 'Comparator', desc: 'Side-by-side comparison of two documents with key differences', icon: 'M4 3h6M12 3h6M4 8h6M12 8h6M4 13h6M12 13h6', inputLabel: 'Two document IDs (comma-separated)', inputType: 'text' },
  { id: 'meeting-notes', name: 'Meeting Notes', desc: 'Extract action items, owners, and deadlines from transcripts', icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2', inputLabel: 'Paste meeting transcript', inputType: 'textarea' },
  { id: 'client-brief', name: 'Client Brief', desc: 'Generate a professional client briefing from project documents', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', inputLabel: 'Document IDs (comma-separated)', inputType: 'text' },
  { id: 'expert-finder', name: 'Expert Finder', desc: 'Find team members with expertise on any topic from your docs', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 1-3-3.87M16 3.13a4 4 0 0 1 0 7.75', inputLabel: 'Topic or skill area', inputType: 'text' },
  { id: 'gap-analysis', name: 'Gap Analysis', desc: 'Identify knowledge gaps and uncovered topics across all documents', icon: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0M12 9v4M12 17h.01', inputLabel: 'Topic area to analyze (optional)', inputType: 'text' },
  { id: 'trend-report', name: 'Trend Report', desc: 'Analyze query history to surface most asked topics and trends', icon: 'M22 12h-4l-3 9L9 3l-3 9H2', inputLabel: 'Time period (e.g. last 30 days)', inputType: 'text' },
  { id: 'weekly-digest', name: 'Weekly Digest', desc: 'Auto-generate a summary of all activity and new documents this week', icon: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', inputLabel: 'Week start date (optional)', inputType: 'text' },
];

interface AgentModal {
  agent: typeof AGENTS[0];
  input: string;
  result: string | null;
  loading: boolean;
}

export default function AgentsPage() {
  const [modal, setModal] = useState<AgentModal | null>(null);

  const runAgent = async () => {
    if (!modal) return;
    setModal(prev => prev ? { ...prev, loading: true, result: null } : null);
    try {
      const res = await fetch(`/api/agents/${modal.agent.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: modal.input }),
      });
      const data = await res.json();
      setModal(prev => prev ? { ...prev, loading: false, result: data.result || data.output || JSON.stringify(data, null, 2) } : null);
    } catch {
      setModal(prev => prev ? { ...prev, loading: false, result: 'Error running agent. Please try again.' } : null);
    }
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px' }}>Agents</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>AI-powered agents for specialized knowledge tasks</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {AGENTS.map(agent => (
          <div key={agent.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '20px', background: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={agent.icon}/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{agent.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3, lineHeight: 1.5 }}>{agent.desc}</div>
              </div>
            </div>
            <button
              onClick={() => setModal({ agent, input: '', result: null, loading: false })}
              style={{ padding: '8px 16px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: 'pointer', alignSelf: 'flex-start' }}
            >
              Run Agent
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14, width: 560, maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{modal.agent.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{modal.agent.desc}</div>
              </div>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="2" y1="2" x2="12" y2="12"/><line x1="12" y1="2" x2="2" y2="12"/></svg>
              </button>
            </div>
            <div style={{ padding: '20px 24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{modal.agent.inputLabel}</label>
                {modal.agent.inputType === 'textarea' ? (
                  <textarea
                    value={modal.input}
                    onChange={e => setModal(prev => prev ? { ...prev, input: e.target.value } : null)}
                    rows={6}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, background: 'var(--surface)', outline: 'none', resize: 'vertical', color: 'var(--text-primary)', lineHeight: 1.5 }}
                    placeholder="Enter input..."
                  />
                ) : (
                  <input
                    value={modal.input}
                    onChange={e => setModal(prev => prev ? { ...prev, input: e.target.value } : null)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, background: 'var(--surface)', outline: 'none', color: 'var(--text-primary)' }}
                    placeholder="Enter input..."
                  />
                )}
              </div>

              {modal.result && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Result</div>
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--text-primary)', maxHeight: 300, overflowY: 'auto' }}>
                    {modal.result}
                  </div>
                </div>
              )}

              {modal.loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: 13 }}>
                  <div style={{ width: 16, height: 16, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Running agent...
                </div>
              )}
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(null)} style={{ padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 7, background: 'var(--bg)', fontSize: 13, cursor: 'pointer' }}>Close</button>
              <button onClick={runAgent} disabled={modal.loading || !modal.input.trim()}
                style={{ padding: '8px 20px', border: 'none', borderRadius: 7, background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: modal.loading || !modal.input.trim() ? 0.5 : 1 }}>
                {modal.loading ? 'Running...' : 'Run'}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
