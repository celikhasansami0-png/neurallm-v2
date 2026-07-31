'use client';

import { useState, useEffect } from 'react';

interface Workflow {
  id: string;
  name: string;
  description?: string;
  trigger: string;
  action: string;
  status: 'active' | 'paused' | 'running';
  last_run?: string;
  run_count?: number;
  created_at: string;
}

type TabType = 'workflow' | 'settings' | 'runs';
type NodeStatus = 'configured' | 'unconfigured' | 'running' | 'completed';

interface WFNode {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  status: NodeStatus;
  badge?: string;
  children?: WFNode[];
  branches?: { label: string; nodes: WFNode[] }[];
}

const BLOCK_CATEGORIES = [
  {
    name: 'Rules', badge: 'New',
    items: [
      { icon: 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M19.07 4.93l-2.83 2.83M7.76 16.24l-2.83 2.83', label: 'True / false branch' },
      { icon: 'M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3M16 3h3a2 2 0 0 0 2 2v14a2 2 0 0 0-2 2h-3M12 3v18', label: 'Multi-split branch' },
      { icon: 'M12 22a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 6v6l4 2', label: 'Delay' },
      { icon: 'M18 6 6 18M6 6l12 12', label: 'Exit' },
    ],
  },
  {
    name: 'Agents', badge: 'New',
    items: [
      { icon: 'M22 12h-4l-3 9L9 3l-3 9H2', label: 'Analyst' },
      { icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 1-3-3.87M16 3.13a4 4 0 0 1 0 7.75', label: 'Headhunter' },
      { icon: 'M3 5h12M3 8h9M3 11h6', label: 'Researcher' },
      { icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', label: 'Strategist' },
    ],
  },
  {
    name: 'Actions', badge: undefined,
    items: [
      { icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', label: 'Send to Slack' },
      { icon: '=M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6', label: 'Send Email' },
      { icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM16 13H8M16 17H8', label: 'Write to Notion' },
      { icon: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3', label: 'Update HubSpot' },
      { icon: 'M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z', label: 'Run AI Prompt' },
      { icon: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z', label: 'Save Result' },
      { icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9', label: 'Send Notification' },
    ],
  },
];

const INIT_FLOW: WFNode[] = [
  {
    id: 'trigger', icon: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    title: 'Run this workflow every week on Friday',
    subtitle: 'Start immediately after activation',
    status: 'configured',
  },
  {
    id: 'branch1', icon: 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4',
    title: 'Have relevant documents?',
    subtitle: 'Filter split criteria',
    status: 'configured',
  },
  {
    id: 'agent1', icon: 'M22 12h-4l-3 9L9 3l-3 9H2',
    title: 'Analyst',
    subtitle: 'Summarize new documents',
    status: 'configured',
  },
  {
    id: 'action1', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    title: 'Send to Slack',
    subtitle: 'Add configuration',
    status: 'unconfigured',
  },
];

function NodeCard({ node, onAdd }: { node: WFNode; onAdd: () => void }) {
  const isUnconfigured = node.status === 'unconfigured';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Connector line from above */}
      <div style={{ width: 1, height: 24, background: '#E5E7EB' }}/>
      
      {/* Node */}
      <div style={{
        width: 420,
        border: isUnconfigured ? '1.5px dashed #E5E7EB' : '1px solid #E9EAEC',
        borderRadius: 12,
        background: '#fff',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'}
      >
        <div style={{ width: 38, height: 38, borderRadius: 10, background: isUnconfigured ? '#F9FAFB' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={isUnconfigured ? '#CBD5E1' : '#374151'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d={node.icon}/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 500, color: isUnconfigured ? '#9CA3AF' : '#111827' }}>{node.title}</div>
          <div style={{ fontSize: 12, color: isUnconfigured ? '#EF4444' : '#9CA3AF', marginTop: 2 }}>{node.subtitle}</div>
        </div>
        {node.status === 'configured' && (
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', flexShrink: 0 }}/>
        )}
      </div>

      {/* Add step */}
      <div style={{ width: 1, height: 16, background: '#E5E7EB' }}/>
      <button onClick={onAdd} style={{
        width: 24, height: 24, borderRadius: '50%', border: '1.5px solid #D1D5DB',
        background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#9CA3AF', transition: 'all 0.15s',
      }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#6B7280'; el.style.color = '#374151'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#D1D5DB'; el.style.color = '#9CA3AF'; }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="5" y1="1" x2="5" y2="9"/><line x1="1" y1="5" x2="9" y2="5"/>
        </svg>
      </button>
    </div>
  );
}

export default function WorkflowsPage() {
  const [tab, setTab] = useState<TabType>('workflow');
  const [nodes, setNodes] = useState<WFNode[]>(INIT_FLOW);
  const [live, setLive] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [view, setView] = useState<'outline' | 'detail'>('outline');

  // Real workflow DB state
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [creating, setCreating] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [newWf, setNewWf] = useState({ name: '', description: '', trigger: 'manual', action: '' });

  useEffect(() => {
    fetch('/api/workflows')
      .then(r => r.ok ? r.json() : [])
      .then(data => Array.isArray(data) ? setWorkflows(data) : setWorkflows([]))
      .catch(() => {});
  }, []);

  const createWorkflow = async () => {
    if (!newWf.name.trim() || !newWf.action.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWf),
      });
      const wf = await res.json();
      if (wf.id) {
        setWorkflows(prev => [wf, ...prev]);
        setNewWf({ name: '', description: '', trigger: 'manual', action: '' });
      }
    } finally { setCreating(false); }
  };

  const runWorkflow = async (wf: Workflow) => {
    setRunningId(wf.id);
    setLastResult(null);
    try {
      const res = await fetch(`/api/workflows/${wf.id}/run`, { method: 'POST' });
      const data = await res.json();
      setLastResult(data.result || 'Workflow completed.');
      setWorkflows(prev => prev.map(w => w.id === wf.id
        ? { ...w, status: 'active', last_run: new Date().toISOString(), run_count: (w.run_count || 0) + 1 }
        : w));
    } catch { setLastResult('Run failed.'); }
    finally { setRunningId(null); }
  };

  const addNode = (afterId: string) => {
    const newNode: WFNode = {
      id: `n${Date.now()}`,
      icon: 'M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z',
      title: 'New step',
      subtitle: 'Add configuration',
      status: 'unconfigured',
    };
    setNodes(prev => {
      const idx = prev.findIndex(n => n.id === afterId);
      const next = [...prev];
      next.splice(idx + 1, 0, newNode);
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', marginLeft: -40, marginRight: -40, marginTop: -32, overflow: 'hidden', background: '#fff' }}>

      {/* Top bar */}
      <div style={{ height: 52, borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 13, color: '#9CA3AF' }}>Workflow</span>
        <span style={{ color: '#D1D5DB' }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>New workflow</span>
        <div style={{ flex: 1 }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => setLive(p => !p)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
            border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff',
            cursor: 'pointer', fontSize: 12.5, color: live ? '#10B981' : '#6B7280',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: live ? '#10B981' : '#D1D5DB' }}/>
            {live ? 'Live' : 'Inactive'}
          </button>
          <button style={{ padding: '5px 14px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#0A0A14', color: '#fff', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}>
            Save
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #F0F0F0', display: 'flex', padding: '0 20px', flexShrink: 0 }}>
        {(['workflow', 'settings', 'runs'] as TabType[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: tab === t ? 500 : 400,
            color: tab === t ? '#111827' : '#9CA3AF',
            borderBottom: tab === t ? '2px solid #111827' : '2px solid transparent',
            marginBottom: -1, textTransform: 'capitalize',
          }}>
            {t === 'runs' ? 'Enrolment' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'workflow' && (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Canvas */}
          <div style={{ flex: 1, overflowY: 'auto', background: '#FAFAFA', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 20px 80px' }}>
            {/* Start here pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 20, padding: '6px 14px', fontSize: 12.5, fontWeight: 500, color: '#6B7280', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polygon points="2,2 10,6 2,10"/></svg>
              Start here
            </div>

            {nodes.map((node) => (
              <NodeCard key={node.id} node={node} onAdd={() => addNode(node.id)} />
            ))}

            {/* Then do this label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '6px 14px', background: '#F3F4F6', borderRadius: 20, fontSize: 12, color: '#6B7280' }}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 3l3 3-3 3M7 9h2"/></svg>
              Then do this
            </div>
          </div>

          {/* Right panel — Build */}
          <div style={{ width: 268, background: '#fff', borderLeft: '1px solid #F0F0F0', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ padding: '16px 16px 12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14.5, color: '#111827' }}>Build</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Drag block into the workflow</div>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', paddingTop: 2 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="7" y1="2" x2="7" y2="12"/><line x1="2" y1="7" x2="12" y2="7"/></svg>
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 16px' }}>
              {BLOCK_CATEGORIES.map(cat => (
                <div key={cat.name} style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 6px 8px' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{cat.name}</span>
                    {cat.badge && (
                      <span style={{ fontSize: 10, fontWeight: 700, background: '#111827', color: '#fff', padding: '1px 6px', borderRadius: 10 }}>{cat.badge}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {cat.items.map((item, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 10px', borderRadius: 8,
                        border: '1px solid #F3F4F6', background: '#fff',
                        cursor: 'grab', transition: 'border-color 0.12s, box-shadow 0.12s',
                      }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#D1D5DB'; el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#F3F4F6'; el.style.boxShadow = 'none'; }}
                      >
                        <div style={{ width: 30, height: 30, borderRadius: 7, background: '#F9FAFB', border: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d={item.icon}/>
                          </svg>
                        </div>
                        <span style={{ fontSize: 12.5, color: '#374151', fontWeight: 400 }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: 32, maxWidth: 640 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 20 }}>My Workflows</div>

          {/* Create form */}
          <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: 20, marginBottom: 24, background: '#FAFAFA' }}>
            <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 14, color: '#111827' }}>+ New Workflow</div>
            {[
              { key: 'name', label: 'Name', placeholder: 'e.g. Weekly Research Report' },
              { key: 'description', label: 'Description', placeholder: 'What does this workflow do?' },
              { key: 'action', label: 'Action / Prompt', placeholder: 'e.g. Summarise top 5 market trends from knowledge base' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>{f.label}</label>
                <input
                  value={newWf[f.key as keyof typeof newWf]}
                  onChange={e => setNewWf(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none', color: '#111827', background: '#fff', boxSizing: 'border-box' }}
                />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Trigger</label>
              <select value={newWf.trigger} onChange={e => setNewWf(prev => ({ ...prev, trigger: e.target.value }))}
                style={{ padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#111827', background: '#fff', outline: 'none', width: '100%' }}>
                <option value="manual">Manual</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="document_upload">On document upload</option>
              </select>
            </div>
            <button onClick={createWorkflow} disabled={creating || !newWf.name.trim() || !newWf.action.trim()} style={{
              padding: '9px 20px', borderRadius: 8, border: 'none',
              background: creating || !newWf.name.trim() || !newWf.action.trim() ? '#E5E7EB' : '#111827',
              color: creating || !newWf.name.trim() || !newWf.action.trim() ? '#9CA3AF' : '#fff',
              fontSize: 13, fontWeight: 500, cursor: creating ? 'default' : 'pointer',
            }}>{creating ? 'Creating…' : 'Create Workflow'}</button>
          </div>

          {/* Workflow list */}
          {workflows.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>No workflows yet. Create one above.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {workflows.map(wf => (
                <div key={wf.id} style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 18px', background: '#fff', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: '#111827', marginBottom: 2 }}>{wf.name}</div>
                    {wf.description && <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>{wf.description}</div>}
                    <div style={{ fontSize: 11.5, color: '#6B7280' }}>
                      Trigger: <b>{wf.trigger}</b>
                      {wf.run_count ? ` · ${wf.run_count} runs` : ''}
                      {wf.last_run ? ` · Last: ${new Date(wf.last_run).toLocaleDateString()}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20,
                      background: wf.status === 'active' ? '#ECFDF5' : wf.status === 'running' ? '#FEF3C7' : '#F3F4F6',
                      color: wf.status === 'active' ? '#059669' : wf.status === 'running' ? '#D97706' : '#6B7280',
                    }}>{wf.status}</span>
                    <button onClick={() => runWorkflow(wf)} disabled={runningId === wf.id} style={{
                      padding: '7px 14px', borderRadius: 8, border: 'none',
                      background: runningId === wf.id ? '#E5E7EB' : '#6D28D9',
                      color: runningId === wf.id ? '#9CA3AF' : '#fff',
                      fontSize: 12, fontWeight: 500, cursor: runningId === wf.id ? 'default' : 'pointer',
                    }}>{runningId === wf.id ? 'Running…' : '▶ Run'}</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Last result */}
          {lastResult && (
            <div style={{ marginTop: 20, border: '1px solid #E5E7EB', borderRadius: 12, padding: 16, background: '#F9FAFB' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Last Run Result</div>
              <div style={{ fontSize: 13, color: '#111827', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{lastResult}</div>
            </div>
          )}
        </div>
      )}

      {tab === 'runs' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Run History</div>
          {workflows.filter(w => w.last_run).length === 0 ? (
            <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 12 }}>No runs yet. Go to Settings to create and run a workflow.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              {workflows.filter(w => w.last_run).sort((a, b) => new Date(b.last_run!).getTime() - new Date(a.last_run!).getTime()).map(wf => (
                <div key={wf.id} style={{ border: '1px solid #F0F0F0', borderRadius: 10, padding: '12px 16px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13.5 }}>{wf.name}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>{wf.run_count} run{wf.run_count !== 1 ? 's' : ''}</div>
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>{wf.last_run ? new Date(wf.last_run).toLocaleString() : '—'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom bar */}
      <div style={{ height: 44, borderTop: '1px solid #F0F0F0', background: '#fff', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {(['outline', 'detail'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: view === v ? '#F3F4F6' : 'transparent',
              fontSize: 12.5, fontWeight: view === v ? 500 : 400,
              color: view === v ? '#111827' : '#9CA3AF',
            }}>{v.charAt(0).toUpperCase() + v.slice(1)}</button>
          ))}
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => setZoom(p => Math.max(50, p - 10))} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 5, width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
            <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="1" y1="5" x2="9" y2="5"/></svg>
          </button>
          <span style={{ fontSize: 12, color: '#6B7280', minWidth: 38, textAlign: 'center' }}>{zoom}%</span>
          <button onClick={() => setZoom(p => Math.min(200, p + 10))} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 5, width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
            <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="1" x2="5" y2="9"/><line x1="1" y1="5" x2="9" y2="5"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
