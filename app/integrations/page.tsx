'use client';

import { useEffect, useState } from 'react';

const INTEGRATIONS = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Index channel messages and files into your knowledge base',
    connectUrl: '/api/integrations/slack/connect',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M7.5 2.5a2 2 0 1 0 0 4h2V2.5H7.5z" fill="#E01E5A"/>
        <path d="M10.5 2.5v4h2a2 2 0 1 0 0-4h-2z" fill="#36C5F0"/>
        <path d="M17.5 7.5a2 2 0 1 0-4 0v2h4V7.5z" fill="#2EB67D"/>
        <path d="M17.5 10.5h-4v2a2 2 0 1 0 4 0v-2z" fill="#ECB22E"/>
        <path d="M2.5 12.5a2 2 0 1 0 0-4H.5v4h2z" fill="#2EB67D"/>
        <path d="M2.5 12.5H.5v2a2 2 0 1 0 4 0v-2h-2z" fill="#E01E5A"/>
        <path d="M9.5 17.5a2 2 0 1 0 4 0v-2h-4v2z" fill="#36C5F0"/>
        <path d="M9.5 17.5v-2h-2a2 2 0 1 0 0 4v-2z" fill="#ECB22E"/>
      </svg>
    ),
  },
  {
    id: 'google_drive',
    name: 'Google Drive',
    description: 'Sync Google Docs and files to your knowledge base',
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
    connectUrl: '/api/integrations/github/connect',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.09.682-.218.682-.484 0-.236-.009-.864-.013-1.695-2.782.602-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 10 4.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .269.18.579.688.481C17.137 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" fill="#111"/>
      </svg>
    ),
  },
];

export default function IntegrationsPage() {
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/integrations')
      .then(r => r.json())
      .then(data => {
        const map: Record<string, boolean> = {};
        (data || []).forEach((i: any) => { map[i.type] = true; });
        setConnected(map);
      })
      .finally(() => setLoading(false));

    // Check URL for success/error
    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) {
      window.history.replaceState({}, '', '/integrations');
      setConnected(prev => ({ ...prev, [params.get('success')!]: true }));
    }
  }, []);

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Integrations</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          Connect your tools. Everything gets indexed into your knowledge base automatically.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {INTEGRATIONS.map((integration) => {
          const isConnected = connected[integration.id];
          return (
            <div key={integration.id} style={{
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              background: isConnected ? 'var(--surface)' : 'var(--bg)',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 8,
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {integration.icon}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{integration.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{integration.description}</div>
              </div>

              {loading ? (
                <div style={{ width: 80, height: 32, background: 'var(--surface)', borderRadius: 6 }} />
              ) : isConnected ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#22C55E', fontWeight: 500 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
                  Connected
                </div>
              ) : (
                <a
                  href={integration.connectUrl}
                  style={{
                    padding: '7px 16px',
                    background: 'var(--accent)',
                    color: '#fff',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  Connect
                </a>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 24, padding: '16px 20px', background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
          Connected tools are re-indexed every 24 hours. You can also trigger a manual sync from each integration.
        </p>
      </div>
    </div>
  );
}
