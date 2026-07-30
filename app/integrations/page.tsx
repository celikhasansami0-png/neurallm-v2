'use client';

import { useState } from 'react';

type Category = 'all' | 'crm' | 'communication' | 'project' | 'documents' | 'email' | 'analytics' | 'other';

interface Integration {
  id: string;
  name: string;
  desc: string;
  cat: Category;
  connected: boolean;
  icon: string;
  color: string;
}

const INTEGRATIONS: Integration[] = [
  // Already connected / existing
  { id: 'slack',         name: 'Slack',          desc: 'Team messaging and notifications',         cat: 'communication', connected: true,  icon: '#', color: '#611f69' },
  { id: 'notion',        name: 'Notion',          desc: 'Documents, wikis and databases',           cat: 'documents',     connected: true,  icon: 'N', color: '#000' },
  { id: 'github',        name: 'GitHub',          desc: 'Code repositories and version control',    cat: 'other',         connected: true,  icon: 'G', color: '#24292e' },
  { id: 'google-drive',  name: 'Google Drive',   desc: 'Cloud file storage and sharing',           cat: 'documents',     connected: true,  icon: '▲', color: '#4285F4' },
  { id: 'airtable',      name: 'Airtable',        desc: 'Database-spreadsheet hybrid platform',     cat: 'project',       connected: false, icon: 'A', color: '#FCB400' },
  { id: 'asana',         name: 'Asana',           desc: 'Project and task management',              cat: 'project',       connected: false, icon: 'As', color: '#F06A6A' },
  { id: 'clickup',       name: 'ClickUp',         desc: 'All-in-one productivity platform',         cat: 'project',       connected: false, icon: 'C', color: '#7B68EE' },
  { id: 'linear',        name: 'Linear',          desc: 'Issue tracking for engineering teams',     cat: 'project',       connected: false, icon: 'L', color: '#5E6AD2' },
  { id: 'zendesk',       name: 'Zendesk',         desc: 'Customer support ticketing',               cat: 'other',         connected: false, icon: 'Z', color: '#03363D' },
  { id: 'intercom',      name: 'Intercom',        desc: 'Customer messaging platform',              cat: 'communication', connected: false, icon: 'I', color: '#1F8DED' },
  { id: 'monday',        name: 'Monday.com',      desc: 'Work management platform',                 cat: 'project',       connected: false, icon: 'M', color: '#FF3D57' },
  { id: 'trello',        name: 'Trello',          desc: 'Kanban boards and cards',                  cat: 'project',       connected: false, icon: 'T', color: '#0079BF' },
  { id: 'webflow',       name: 'Webflow',         desc: 'Visual web design and CMS',               cat: 'other',         connected: false, icon: 'W', color: '#4353FF' },
  { id: 'typeform',      name: 'Typeform',        desc: 'Forms and surveys with AI logic',          cat: 'other',         connected: false, icon: 'Tf', color: '#262627' },
  { id: 'stripe',        name: 'Stripe',          desc: 'Payment processing and billing',           cat: 'other',         connected: false, icon: 'S', color: '#635BFF' },
  // New additions
  { id: 'hubspot',       name: 'HubSpot',         desc: 'CRM, marketing and sales hub',             cat: 'crm',           connected: false, icon: 'Hs', color: '#FF7A59' },
  { id: 'pipedrive',     name: 'Pipedrive',       desc: 'Sales pipeline and CRM',                   cat: 'crm',           connected: false, icon: 'P', color: '#1A1A1A' },
  { id: 'jira',          name: 'Jira',            desc: 'Agile project and issue tracking',          cat: 'project',       connected: false, icon: 'J', color: '#0052CC' },
  { id: 'confluence',    name: 'Confluence',      desc: 'Team wiki and documentation',              cat: 'documents',     connected: false, icon: 'Cf', color: '#0052CC' },
  { id: 'mailchimp',     name: 'Mailchimp',       desc: 'Email marketing and automation',           cat: 'email',         connected: false, icon: 'Mc', color: '#FFE01B' },
  { id: 'sendgrid',      name: 'SendGrid',        desc: 'Transactional and marketing email',        cat: 'email',         connected: false, icon: 'Sg', color: '#1A82E2' },
  { id: 'brevo',         name: 'Brevo',           desc: 'Email and SMS marketing platform',         cat: 'email',         connected: false, icon: 'Br', color: '#0B996E' },
  { id: 'calendly',      name: 'Calendly',        desc: 'Scheduling and meeting automation',        cat: 'other',         connected: false, icon: 'Ca', color: '#006BFF' },
  { id: 'dropbox',       name: 'Dropbox',         desc: 'Cloud storage and file sharing',           cat: 'documents',     connected: false, icon: 'D', color: '#0061FF' },
  { id: 'todoist',       name: 'Todoist',         desc: 'Task manager and to-do lists',             cat: 'project',       connected: false, icon: 'To', color: '#DB4035' },
  { id: 'figma',         name: 'Figma',           desc: 'Collaborative design and prototyping',     cat: 'other',         connected: false, icon: 'F', color: '#F24E1E' },
  { id: 'google-analytics', name: 'Google Analytics', desc: 'Web analytics and user insights',     cat: 'analytics',     connected: false, icon: 'GA', color: '#E37400' },
  { id: 'mixpanel',      name: 'Mixpanel',        desc: 'Product analytics and user behavior',      cat: 'analytics',     connected: false, icon: 'Mx', color: '#7856FF' },
];

const CATS: { key: Category; label: string }[] = [
  { key: 'all',           label: 'All' },
  { key: 'crm',          label: 'CRM' },
  { key: 'communication', label: 'Communication' },
  { key: 'project',       label: 'Project Mgmt' },
  { key: 'documents',     label: 'Documents' },
  { key: 'email',         label: 'Email' },
  { key: 'analytics',     label: 'Analytics' },
  { key: 'other',         label: 'Other' },
];

export default function IntegrationsPage() {
  const [cat, setCat] = useState<Category>('all');
  const [search, setSearch] = useState('');
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<Set<string>>(
    new Set(INTEGRATIONS.filter(i => i.connected).map(i => i.id))
  );

  const filtered = INTEGRATIONS.filter(i =>
    (cat === 'all' || i.cat === cat) &&
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleConnect = (id: string) => {
    setConnecting(id);
    setTimeout(() => {
      setConnected(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
      });
      setConnecting(null);
    }, 900);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#0A0A14', margin: 0, letterSpacing: '-0.4px' }}>Integrations</h1>
        <p style={{ fontSize: 13.5, color: '#9CA3AF', marginTop: 6 }}>
          Connect your tools to automate workflows and enhance your workspace.
          <span style={{ marginLeft: 8, background: '#F3F4F6', padding: '2px 10px', borderRadius: 20, fontSize: 12, color: '#374151', fontWeight: 500 }}>
            {connected.size} connected
          </span>
        </p>
      </div>

      {/* Search + filter bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200, maxWidth: 320, border: '1px solid #E5E7EB', borderRadius: 10, padding: '8px 12px', background: '#fff' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search integrations…" style={{ border: 'none', outline: 'none', fontSize: 13.5, color: '#374151', background: 'transparent', width: '100%' }}/>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATS.map(c => (
            <button key={c.key} onClick={() => setCat(c.key)} style={{
              padding: '6px 14px', borderRadius: 20, border: '1px solid',
              borderColor: cat === c.key ? '#0A0A14' : '#E5E7EB',
              background: cat === c.key ? '#0A0A14' : '#fff',
              color: cat === c.key ? '#fff' : '#6B7280',
              fontSize: 12.5, fontWeight: cat === c.key ? 500 : 400,
              cursor: 'pointer', transition: 'all 0.12s',
            }}>{c.label}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 12 }}>
        {filtered.map(intg => {
          const isConn = connected.has(intg.id);
          const isLoading = connecting === intg.id;
          return (
            <div key={intg.id} style={{
              border: `1px solid ${isConn ? '#D1FAE5' : '#F0F0F0'}`,
              borderRadius: 14, padding: '16px',
              background: isConn ? '#FAFFFE' : '#fff',
              display: 'flex', alignItems: 'flex-start', gap: 12,
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = 'none'; }}
            >
              {/* Icon */}
              <div style={{ width: 40, height: 40, borderRadius: 10, background: intg.color + '15', border: `1px solid ${intg.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: intg.color }}>{intg.icon}</span>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 500, color: '#111827' }}>{intg.name}</span>
                  {isConn && (
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', flexShrink: 0 }}/>
                  )}
                </div>
                <p style={{ fontSize: 12, color: '#9CA3AF', margin: '3px 0 10px', lineHeight: 1.4 }}>{intg.desc}</p>
                <button onClick={() => handleConnect(intg.id)} style={{
                  padding: '5px 14px', borderRadius: 7, border: '1px solid',
                  borderColor: isConn ? '#D1D5DB' : '#E5E7EB',
                  background: isConn ? '#fff' : '#0A0A14',
                  color: isConn ? '#6B7280' : '#fff',
                  fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  opacity: isLoading ? 0.6 : 1, transition: 'all 0.12s',
                }}>
                  {isLoading ? '…' : isConn ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF', fontSize: 13.5 }}>
          No integrations found for "{search}"
        </div>
      )}
    </div>
  );
}
