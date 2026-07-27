'use client';

import { useEffect, useState } from 'react';

interface Workflow {
  id: string; name: string; trigger: string; action: string; status: string; last_run: string | null;
}

const TRIGGERS = ['New document uploaded', 'Every Monday 9am', 'Every day 8am', 'Manual only'];
const ACTIONS = ['Summarize new document', 'Generate weekly digest', 'Run gap analysis', 'Send trend report', 'Create client brief'];

function StatusBadge({ status }: { status: string }) {
  const c = status === 'active' ? { color: '#22C55E', bg: '#F0FDF4' } : status === 'running' ? { color: '#F59E0B', bg: '#FFFBEB' } : { color: '#ABABAB', bg: '#F5F5F5' };
  return <span style={{ fontSize: 11, fontWeight: 500, color: c.color, background: c.bg, padding: '2px 8px', borderRadius: 4 }}>{status}</span>;
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', trigger: TRIGGERS[0], action: ACTIONS[0] });
  const [running, setRunning] = useState<string | null>(null);

  const load = () => {
    fetch('/api/workflows').then(r => r.json()).then(data => {
      setWorkflows(Array.isArray(data) ? data : []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name.trim()) return;
    await fetch('/api/workflows', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setCreating(false);
    setForm({ name: '', trigger: TRIGGERS[0], action: ACTIONS[0] });
    load();
  };

  const run = async (id: string) => {
    setRunning(id);
    await fetch(`/api/workflows/${id}/run`, { method: 'POST' });
    setRunning(null);
    load();
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px' }}>Workflows</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Automate document processing and reporting</p>
        </div>
        <button onClick={() => setCreating(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="6" y1="1" x2="6" y2="11"/><line x1="1" y1="6" x2="11" y2="6"/></svg>
          New Workflow
        </button>
      </div>

      <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 500, fontSize: 13 }}>Active Workflows</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{workflows.length} workflow{workflows.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Loading...</div>
        ) : workflows.length === 0 ? (
          <div style={{ padding: '48px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No workflows yet.</div>
            <button onClick={() => setCreating(true)} style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, cursor: 'pointer', color: 'var(--text-primary)' }}>Create your first workflow</button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                {['Name', 'Trigger', 'Action', 'Last Run', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {workflows.map((wf, i) => (
                <tr key={wf.id} style={{ borderBottom: i < workflows.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '13px 20px', fontWeight: 500, fontSize: 13 }}>{wf.name}</td>
                  <td style={{ padding: '13px 20px', fontSize: 12, color: 'var(--text-secondary)' }}>
                    <span style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 7px' }}>{wf.trigger}</span>
                  </td>
                  <td style={{ padding: '13px 20px', fontSize: 12, color: 'var(--text-secondary)' }}>{wf.action}</td>
                  <td style={{ padding: '13px 20px', fontSize: 12, color: 'var(--text-muted)' }}>{wf.last_run ? new Date(wf.last_run).toLocaleString() : 'Never'}</td>
                  <td style={{ padding: '13px 20px' }}><StatusBadge status={wf.status} /></td>
                  <td style={{ padding: '13px 20px' }}>
                    <button onClick={() => run(wf.id)} disabled={running === wf.id}
                      style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 12px', fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, opacity: running === wf.id ? 0.5 : 1 }}>
                      {running === wf.id ? (
                        <div style={{ width: 11, height: 11, border: '1.5px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      ) : (
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3,1 10,5.5 3,10" fill="currentColor"/></svg>
                      )}
                      Run
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create modal */}
      {creating && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14, width: 480, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Create Workflow</div>
              <button onClick={() => setCreating(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="2" y1="2" x2="12" y2="12"/><line x1="12" y1="2" x2="2" y2="12"/></svg>
              </button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Workflow Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Weekly Summary Digest"
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, outline: 'none', background: 'var(--surface)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Trigger</label>
                <select value={form.trigger} onChange={e => setForm(f => ({ ...f, trigger: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, outline: 'none', background: 'var(--surface)', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  {TRIGGERS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Action</label>
                <select value={form.action} onChange={e => setForm(f => ({ ...f, action: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, outline: 'none', background: 'var(--surface)', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  {ACTIONS.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div style={{ padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong>When:</strong> {form.trigger}<br/>
                <strong>Do:</strong> {form.action}
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setCreating(false)} style={{ padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 7, background: 'var(--bg)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={create} disabled={!form.name.trim()} style={{ padding: '8px 20px', border: 'none', borderRadius: 7, background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: !form.name.trim() ? 0.5 : 1 }}>Create</button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
