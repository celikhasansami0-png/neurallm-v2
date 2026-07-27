import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import CopilotPanel from '@/components/CopilotPanel';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'NeuraLLM v2 — Corporate Knowledge Management',
  description: 'AI-powered knowledge management for consulting firms',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body style={{ background: 'var(--bg)', display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <div style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Topbar />
          <main style={{ flex: 1, padding: '32px 32px', background: 'var(--bg)' }}>
            {children}
          </main>
        </div>
        <CopilotPanel />
      </body>
    </html>
  );
}
