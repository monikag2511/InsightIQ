import type { Metadata } from 'next';
import './globals.css';
import { DatasetProvider } from '@/context/DatasetContext';
import UploadModal from '@/components/UploadModal';

export const metadata: Metadata = {
  title: 'Ask Your Data | AI-Powered Personal Data Analysis Platform',
  description: 'Upload your data. Ask questions. Discover insights. Automated profiling, cleaning, EDA, visualizations, and natural-language dataset intelligence.',
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
