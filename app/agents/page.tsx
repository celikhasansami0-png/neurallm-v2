'use client';
import { useState } from 'react';

const AGENTS = [
  {
    id: 'summarizer', name: 'Analyst', role: 'Document Intelligence',
    desc: 'Generates a concise executive summary from any document or knowledge base section.',
    icon: 'M3 5h12M3 8h9M3 11h6', color: '#0A0A14', inputLabel: 'Paste text or document ID', inputType: 'textarea',
  },
  {
    id: 'comparator', name: 'Reviewer', role: 'Comparative Analysis',
    desc: 'Side-by-side comparison of two documents, surfaces key differences and conflicts.',
    icon: 'M4 3h6M12 3h6M4 8h6M12 8h6M4 13h6M12 13h6', color: '#0A0A14', inputLabel: 'Two document IDs (comma-separated)', inputType: 'text',
  },
  {
    id: 'meeting-notes', name: 'Coordinator', role: 'Meeting Intelligence',
    desc: 'Extracts action items, owners, and deadlines from meeting transcripts.',
    icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2', color: '#0A0A14', inputLabel: 'Paste meeting transcript', inputType: 'textarea',
  },
  {
    id: 'client-brief', name: 'Strategist', role: 'Client Relations',
    desc: 'Generates a polished client briefing document from your project knowledge base.',
    icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6', color: '#0A0A14', inputLabel: 'Document IDs (comma-separated)', inputType: 'text',
  },
  {
    id: 'expert-finder', name: 'Headhunter', role: 'Talent Matching',
    desc: 'Identifies team members with relevant expertise based on your internal documents.',
    icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 1-3-3.87M16 3.13a4 4 0 0 1 0 7.75', color: '#0A0A14', inputLabel: 'Topic or skill area', inputType: 'text',
  },
  {
    id: 'gap-analysis', name: 'Auditor', role: 'Risk & Compliance',
    desc: 'Finds knowledge gaps and uncovered areas across your entire document library.',
    icon: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0-3.42 0zM12 9v4M12 17h.01', color: '#0A0A14', inputLabel: 'Topic area to audit (optional)', inputType: 'text',
  },
  {
    id: 'trend-report', name: 'Researcher', role: 'Market Intelligence',
    desc: 'Analyzes query patterns and surfaces trending topics and insights from your data.',
    icon: 'M22 12h-4l-3 9L9 3l-3 9H2', color: '#0A0A14', inputLabel: 'Time period (e.g. last 30 days)', inputType: 'text',
  },
  {
    id: 'weekly-digest', name: 'Reporter', role: 'Weekly Briefing',
    desc: 'Auto-generates a professional digest of all activity and new documents this week.',
    icon: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', color: '#0A0A14', inputLabel: 'Week start date (optional)', inputType: 'text',
  },
];

interface ModalState { agent: typeof AGENTS[0]; input: string; result: string | null; loading: boolean; }

export default function AgentsPage() {
  const [modal, setModal] = useState<ModalState | null>(null);

  const runAgent = async () => {
    if (!modal) return;
    setModal(p => p ? { ...p, loading: true, result: null } : null);
    try {
      const res = await fetch(`/api/agents/${modal.agent.id}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: modal.input }),
      });
      const data = await res.json();
      setModal(p => p ? { ...p, loading: false, result: data.result || data.output || JSON.stringify(data, null, 2) } : null);
    } catch {
      setModal(p => p ? { ...p, loading: false, result: 'Error running agent. Please try again.' } : null);
    }
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px' }}>Agents</h1>
        <p style={{ fontSize: 13.5, color: '#888', marginTop: 5 }}>Specialized AI personas — each trained for a distinct role</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
        {AGENTS.map(agent => (
          <div key={agent.id}
            onClick={() => setModal({ agent, input: '', result: null, loading: false })}
            style={{
              border: '1px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: '22px 20px 18px',
              background: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 14,
              transition: 'box-shadow 0.15s, transform 0.15s',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)'; el.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = 'none'; el.style.transform = 'none'; }}
          >
            {/* Icon */}
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#0A0A14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={agent.icon}/>
              </svg>
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14.5, color: '#0A0A14' }}>{agent.name}</div>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: '#bbb', letterSpacing: '0.5px', marginTop: 3, textTransform: 'uppercase' }}>{agent.role}</div>
              <div style={{ fontSize: 12.5, color: '#666', marginTop: 8, lineHeight: 1.6 }}>{agent.desc}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#bbb' }}>Click to run →</span>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#0A0A14" strokeWidth="1.8" strokeLinecap="round"><polygon points="2,2 10,6 2,10"/></svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(6px)' }}>
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 18, width: 540, maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.12)' }}>
            <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#0A0A14', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={modal.agent.icon}/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{modal.agent.name}</div>
                <div style={{ fontSize: 11, color: '#bbb', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{modal.agent.role}</div>
              </div>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: '#bbb', cursor: 'pointer' }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="2" y1="2" x2="16" y2="16"/><line x1="16" y1="2" x2="2" y2="16"/></svg>
              </button>
            </div>

            <div style={{ padding: '20px 24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#555', display: 'block', marginBottom: 6 }}>{modal.agent.inputLabel}</label>
                {modal.agent.inputType === 'textarea'
                  ? <textarea value={modal.input} onChange={e => setModal(p => p ? { ...p, input: e.target.value } : null)} rows={5} placeholder="Enter input..." style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, fontSize: 13, background: '#FAFAFA', outline: 'none', resize: 'vertical', color: '#0A0A14', lineHeight: 1.55 }}/>
                  : <input value={modal.input} onChange={e => setModal(p => p ? { ...p, input: e.target.value } : null)} placeholder="Enter input..." style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, fontSize: 13, background: '#FAFAFA', outline: 'none', color: '#0A0A14' }}/>
                }
              </div>
              {modal.loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#bbb', fontSize: 13 }}>
                  <div style={{ width: 16, height: 16, border: '2px solid #E5E5E5', borderTopColor: '#0A0A14', borderRadius: '50%', animation: 'spin .8s linear infinite' }}/>
                  {modal.agent.name} is working...
                </div>
              )}
              {modal.result && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6 }}>Result</div>
                  <div style={{ background: '#FAFAFA', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, padding: '14px 16px', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: '#0A0A14', maxHeight: 280, overflowY: 'auto' }}>{modal.result}</div>
                </div>
              )}
            </div>

            <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(0,0,0,0.07)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(null)} style={{ padding: '8px 18px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, background: '#fff', fontSize: 13, cursor: 'pointer', color: '#555' }}>Cancel</button>
              <button onClick={runAgent} disabled={modal.loading || !modal.input.trim()} style={{ padding: '8px 22px', border: 'none', borderRadius: 8, background: '#0A0A14', color: '#fff', fontSize: 13, fontWeight: 500, cursor: modal.loading || !modal.input.trim() ? 'default' : 'pointer', opacity: modal.loading || !modal.input.trim() ? 0.4 : 1 }}>
                {modal.loading ? 'Running…' : 'Run Agent'}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
