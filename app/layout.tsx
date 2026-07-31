import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import CopilotPanel from '@/components/CopilotPanel';
import ErrorBoundary from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'NeuraLLM',
  description: 'The AI operating system built for consulting firms.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <body style={{ background: 'var(--bg)', display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <div style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Topbar />
            <ErrorBoundary>
              <main style={{ flex: 1, padding: '32px 40px', background: 'var(--bg)' }}>
                {children}
              </main>
            </ErrorBoundary>
          </div>
          <CopilotPanel />
        </body>
      </html>
    </ClerkProvider>
  );
}
