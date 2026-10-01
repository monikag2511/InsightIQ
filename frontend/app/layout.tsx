import type { Metadata } from 'next';
import './globals.css';
import { DatasetProvider } from '@/context/DatasetContext';
import UploadModal from '@/components/UploadModal';

export const metadata: Metadata = {
  title: 'InsightIQ | AI-Powered Natural Language Data Analytics & Insight Platform',
  description: 'Turn Data Into Decisions. Upload your dataset, explore powerful analytics, and ask questions in natural language to uncover meaningful insights.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
        <DatasetProvider>
          {children}
          <UploadModal />
        </DatasetProvider>
      </body>
    </html>
  );
}
