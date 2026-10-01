'use client';

import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useDataset } from '@/context/DatasetContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentDataset, datasets, loading, loadDemoDataset } = useDataset();

  // If no dataset exists after loading, auto-load demo dataset so the user immediately gets a live experience
  useEffect(() => {
    if (!loading && datasets.length === 0 && !currentDataset) {
      loadDemoDataset().catch(console.error);
    }
  }, [loading, datasets.length, currentDataset, loadDemoDataset]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
