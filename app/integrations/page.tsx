'use client';

import { useEffect, useState } from 'react';

const INTEGRATIONS = [
  {
    id: 'google_drive',
    name: 'Google Drive',
    description: 'Sync Google Docs, Sheets, and Slides to your knowledge base',
    category: 'Storage',
    connectUrl: '/api/integrations/google-drive/connect',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M7 2l-6 10h4l6-10H7z" fill="#4285F4"/>
        <path d="M13 2H7l6 10 3-5-3-5z" fill="#0F9D58"/>
        <path d="M1 12l3 5h12l-3-5H1z" fill="#FBBC04"/>
      </svg>
    ),
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Import pages and databases from your Notion workspace',
    category: 'Docs',
    connectUrl: '/api/integrations/notion/connect',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect width="20" height="20" rx="3" fill="#000"/>
        <path d="M5 4h7l3 3v9H5V4z" fill="white"/>
        <path d="M12 4v3h3" fill="none" stroke="#000" strokeWidth="1"/>
        <line x1="7" y1="9" x2="13" y2="9" stroke="#ccc" strokeWidth="1"/>
        <line x1="7" y1="12" x2="11" y2="12" stroke="#ccc" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Index README files, wikis, and code documentation',
    category: 'Dev',
    connectUrl: '/api/integrations/github/connect',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.09.682-.218.682-.484 0-.236-.009-.864-.013-1.695-2.782.602-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 10 4.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .269.18.579.688.481C17.137 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" fill="#111"/>
      </svg>
    ),
  },
  {
    id: 'onedrive',
    name: 'Microsoft OneDrive',
    description: 'Sync Word, Excel, and PowerPoint files from OneDrive',
    category: 'Storage',
    connectUrl: '/api/integrations/onedrive/connect',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M11.5 7.5A4.5 4.5 0 0 0 3.2 9.2 3 3 0 0 0 4 15h12a3 3 0 0 0 .6-5.9 4 4 0 0 0-5.1-1.6z" fill="#0078D4"/>
        <path d="M7.8 9.5A3 3 0 0 0 2 12a3 3 0 0 0 3 3h3" fill="#1490DF" opacity=".8"/>
      </svg>
    ),
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Import documents and files directly from Dropbox folders',
    category: 'Storage',
    connectUrl: '/api/integrations/dropbox/connect',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 3.5L5 6.5l5 3 5-3-5-3zM5 9.5l-5 3 5 3 5-3-5-3zM10 12.5l5 3 5-3-5-3-5 3zM10 15.5l-5-3v1.5l5 3 5-3V12.5l-5 3z" fill="#0061FF"/>
      </svg>
    ),
  },
  {
    id: 'confluence',
    name: 'Confluence',
    description: 'Index team wikis, project docs, and knowledge articles',
    category: 'Docs',
    connectUrl: '/api/integrations/confluence/connect',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M2 14.5c-.3.5-.1 1.1.4 1.3l3.5 1.7c.5.2 1.1 0 1.3-.5l.8-1.5c2-3.5 4.5-3.5 6.5-1.8l.7.6c.4.3 1 .3 1.3-.1l2.5-3.1c.3-.4.2-1-.2-1.3-3.5-2.8-7.5-3-11-1L2 14.5z" fill="#0052CC"/>
        <path d="M18 5.5c.3-.5.1-1.1-.4-1.3L14.1 2.5c-.5-.2-1.1 0-1.3.5l-.8 1.5C10 7.9 7.5 7.9 5.5 6.2l-.7-.6C4.4 5.3 3.8 5.3 3.5 5.7L1 8.8c-.3.4-.2 1 .2 1.3 3.5 2.8 7.5 3 11 1L18 5.5z" fill="#2684FF"/>
      </svg>
    ),
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Sync project tickets, specs, and issue descriptions',
    category: 'Dev',
    connectUrl: '/api/integrations/jira/connect',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 1L1 10l4 4 5-5 5 5 4-4L10 1z" fill="#2684FF"/>
        <path d="M10 11l-4 4 4 4 4-4-4-4z" fill="#0052CC"/>
      </svg>
    ),
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Pull CRM notes, deals, and client documents into AI context',
    category: 'CRM',
    connectUrl: '/api/integrations/hubspot/connect',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="14" cy="6" r="2.5" fill="#FF7A59"/>
        <circle cx="6" cy="10" r="2.5" fill="#FF7A59"/>
        <circle cx="14" cy="14" r="2.5" fill="#FF7A59"/>
        <line x1="8.5" y1="9" x2="11.5" y2="7" stroke="#FF7A59" strokeWidth="1.5"/>
        <line x1="8.5" y1="11" x2="11.5" y2="13" stroke="#FF7A59" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Index account notes, opportunity docs, and contact records',
    category: 'CRM',
    connectUrl: '/api/integrations/salesforce/connect',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M8.5 4a3.5 3.5 0 0 1 6.5 1.8A3 3 0 0 1 17 11.5a3 3 0 0 1-3 .5H6a3.5 3.5 0 0 1-.5-7 3.5 3.5 0 0 1 3-1z" fill="#00A1E0"/>
      </svg>
    ),
  },
  {
    id: 'airtable',
    name: 'Airtable',
    description: 'Import bases, tables, and records as structured knowledge',
    category: 'Data',
    connectUrl: '/api/integrations/airtable/connect',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="7" height="7" rx="1.5" fill="#FCB400"/>
        <rect x="11" y="2" width="7" height="7" rx="1.5" fill="#18BFFF"/>
        <rect x="2" y="11" width="7" height="7" rx="1.5" fill="#F82B60"/>
        <rect x="11" y="11" width="7" height="7" rx="1.5" fill="#6C63FF"/>
      </svg>
    ),
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Index public channels, pinned messages, and shared files',
    category: 'Comms',
    connectUrl: '/api/integrations/slack/connect',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M7.5 2a1.5 1.5 0 0 0-1.5 1.5v5a1.5 1.5 0 0 0 3 0v-5A1.5 1.5 0 0 0 7.5 2z" fill="#E01E5A"/>
        <path d="M2 7.5A1.5 1.5 0 0 1 3.5 6H5v3H3.5A1.5 1.5 0 0 1 2 7.5z" fill="#E01E5A"/>
        <path d="M12.5 2a1.5 1.5 0 0 1 1.5 1.5V5h-3V3.5A1.5 1.5 0 0 1 12.5 2z" fill="#36C5F0"/>
        <path d="M18 7.5a1.5 1.5 0 0 0-1.5-1.5H11v3h5.5A1.5 1.5 0 0 0 18 7.5z" fill="#36C5F0"/>
        <path d="M12.5 18a1.5 1.5 0 0 0 1.5-1.5v-5a1.5 1.5 0 0 0-3 0v5a1.5 1.5 0 0 0 1.5 1.5z" fill="#2EB67D"/>
        <path d="M18 12.5a1.5 1.5 0 0 1-1.5 1.5H15v-3h1.5a1.5 1.5 0 0 1 1.5 1.5z" fill="#2EB67D"/>
        <path d="M7.5 18a1.5 1.5 0 0 1-1.5-1.5V15h3v1.5a1.5 1.5 0 0 1-1.5 1.5z" fill="#ECB22E"/>
        <path d="M2 12.5a1.5 1.5 0 0 0 1.5 1.5H9v-3H3.5A1.5 1.5 0 0 0 2 12.5z" fill="#ECB22E"/>
      </svg>
    ),
  },
  {
    id: 'sharepoint',
    name: 'SharePoint',
    description: 'Sync SharePoint sites, document libraries, and lists',
    category: 'Docs',
    connectUrl: '/api/integrations/sharepoint/connect',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="8" cy="8" r="5" fill="#038387"/>
        <circle cx="14" cy="12" r="5" fill="#0078D4" opacity="0.9"/>
        <circle cx="8" cy="8" r="3" fill="#008272"/>
      </svg>
    ),
  },
  {
    id: 'box',
    name: 'Box',
    description: 'Access documents from Box folders and shared workspaces',
    category: 'Storage',
    connectUrl: '/api/integrations/box/connect',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="6" width="16" height="11" rx="2" fill="#0075C9"/>
        <path d="M8 6V4a2 2 0 0 1 4 0v2" stroke="#0075C9" strokeWidth="2" fill="none"/>
        <circle cx="10" cy="12" r="2" fill="white"/>
      </svg>
    ),
  },
  {
    id: 'figma',
    name: 'Figma',
    description: 'Index design specs, component docs, and project notes',
    category: 'Dev',
    connectUrl: '/api/integrations/figma/connect',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M7 10a3 3 0 0 1 3-3h3a3 3 0 0 1 0 6H7V10z" fill="#A259FF"/>
        <path d="M7 4h3a3 3 0 0 1 0 6H7V4z" fill="#F24E1E"/>
        <path d="M13 4h0a3 3 0 0 1 0 6h0V4z" fill="#FF7262"/>
        <path d="M7 10v3a3 3 0 0 0 6 0v-3H7z" fill="#0ACF83"/>
        <path d="M7 4H4a3 3 0 0 0 0 6h3V4z" fill="#1ABCFE"/>
      </svg>
    ),
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Automate document ingestion from 5,000+ apps via Zaps',
    category: 'Automation',
    connectUrl: '/api/integrations/zapier/connect',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L12 8H18L13 12L15 18L10 14L5 18L7 12L2 8H8L10 2Z" fill="#FF4A00"/>
      </svg>
    ),
  },
];

const CATEGORIES = ['All', 'Storage', 'Docs', 'Dev', 'CRM', 'Data', 'Comms', 'Automation'];

export default function IntegrationsPage() {
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetch('/api/integrations')
      .then(r => r.json())
      .then(data => {
        const map: Record<string, boolean> = {};
        (data || []).forEach((i: { type: string }) => { map[i.type] = true; });
        setConnected(map);
      })
      .finally(() => setLoading(false));

    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) {
      window.history.replaceState({}, '', '/integrations');
      setConnected(prev => ({ ...prev, [params.get('success')!]: true }));
    }
  }, []);

  const filtered = activeCategory === 'All'
    ? INTEGRATIONS
    : INTEGRATIONS.filter(i => i.category === activeCategory);

  const connectedCount = Object.keys(connected).length;

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0A0A0A', letterSpacing: '-0.5px' }}>Integrations</h1>
          <p style={{ fontSize: 13, color: '#777777', marginTop: 5 }}>
            Connect your tools. Everything gets indexed into your AI knowledge base automatically.
          </p>
        </div>
        {connectedCount > 0 && (
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0A0A0A', background: '#F0F0F0', border: '1px solid #E0E0E0', padding: '6px 14px', borderRadius: 8 }}>
            {connectedCount} connected
          </div>
        )}
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '5px 13px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              border: '1px solid',
              cursor: 'pointer',
              background: activeCategory === cat ? '#000000' : 'transparent',
              color: activeCategory === cat ? '#FFFFFF' : '#555555',
              borderColor: activeCategory === cat ? '#000000' : '#E0E0E0',
              transition: 'all 0.1s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {filtered.map((integration) => {
          const isConnected = connected[integration.id];
          return (
            <div key={integration.id} style={{
              border: '1px solid',
              borderColor: isConnected ? '#BBBBBB' : '#E8E8E8',
              borderRadius: 12,
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              background: isConnected ? '#FAFAFA' : '#FFFFFF',
              position: 'relative',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 8,
                background: '#FFFFFF',
                border: '1px solid #E8E8E8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}>
                {integration.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0A0A0A' }}>{integration.name}</span>
                  <span style={{ fontSize: 10, fontWeight: 500, color: '#AAAAAA', background: '#F4F4F4', padding: '2px 6px', borderRadius: 4, border: '1px solid #EBEBEB' }}>{integration.category}</span>
                </div>
                <div style={{ fontSize: 11.5, color: '#777777', lineHeight: 1.4 }}>{integration.description}</div>
              </div>

              {loading ? (
                <div style={{ width: 70, height: 28, background: '#F4F4F4', borderRadius: 6, flexShrink: 0 }} />
              ) : isConnected ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#006622', fontWeight: 600, background: '#F0FAF3', border: '1px solid #C3E6CB', padding: '4px 10px', borderRadius: 6, flexShrink: 0 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22C55E' }} />
                  Connected
                </div>
              ) : (
                <a
                  href={integration.connectUrl}
                  style={{
                    padding: '6px 14px',
                    background: '#000000',
                    color: '#FFFFFF',
                    borderRadius: 6,
                    fontSize: 11.5,
                    fontWeight: 600,
                    textDecoration: 'none',
                    flexShrink: 0,
                  }}
                >
                  Connect
                </a>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 20, padding: '14px 18px', background: '#F8F8F8', borderRadius: 8, border: '1px solid #EEEEEE', display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="7" y1="5" x2="7" y2="7.5"/><circle cx="7" cy="9.5" r=".5" fill="#999"/></svg>
        <p style={{ fontSize: 12, color: '#888888', margin: 0 }}>
          Connected tools are re-indexed every 24 hours. Manual sync available from each integration.
        </p>
      </div>
    </div>
  );
}
