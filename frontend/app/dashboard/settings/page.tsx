'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Database,
  Cpu,
  ShieldAlert,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Sun,
  Moon,
  Sparkles,
  Info
} from 'lucide-react';
import { useDataset } from '@/context/DatasetContext';
import { api } from '@/services/api';

export default function SettingsPage() {
  const { currentDataset, datasets, refreshDatasets, selectDataset, theme, toggleTheme, user } = useDataset();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleDeleteCurrentDataset = async () => {
    if (!currentDataset) return;
    if (!confirm(`Are you sure you want to permanently delete '${currentDataset.name}'?`)) return;

    setDeleting(true);
    try {
      await api.deleteDataset(currentDataset.id);
      const remaining = await refreshDatasets();
      if (remaining.length > 0) {
        selectDataset(remaining[0].id);
      }
      setStatusMsg('Dataset deleted successfully.');
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (e: any) {
      alert(e.message || 'Failed to delete dataset');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-500" />
          <span>Platform Settings & Environment</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage system preferences, AI orchestration modes, and dataset records
        </p>
      </div>

      {statusMsg && (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3.5 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* SECTION 1: Architecture & Engine Status */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Cpu className="h-4 w-4 text-blue-500" />
          <span>Analytics Core & Architecture</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <span className="text-slate-400 font-medium">Analytical Execution Engine</span>
            <div className="font-semibold text-slate-900 dark:text-white mt-1">
              Pandas 2.2+ & NumPy Vectorized Compute
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Deterministic arithmetic with zero numerical fabrication.</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <span className="text-slate-400 font-medium">Natural Language Gateway</span>
            <div className="font-semibold text-slate-900 dark:text-white mt-1">
              Groq API (Llama 3.3 70B) & Controlled Engine
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">High-speed Groq LPU inference with 100% offline deterministic fallback.</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <span className="text-slate-400 font-medium">Persistence Layer</span>
            <div className="font-semibold text-slate-900 dark:text-white mt-1">
              SQLAlchemy ORM (PostgreSQL & SQLite Dual Engine)
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Automated migration and profile caching.</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <span className="text-slate-400 font-medium">Reporting Subsystem</span>
            <div className="font-semibold text-slate-900 dark:text-white mt-1">
              ReportLab Document Canvas 4.1+
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Direct vector PDF compilation and styling.</p>
          </div>
        </div>
      </div>

      {/* SECTION 2: Appearance & Theme */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
          Appearance & Interface
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white">Color Theme</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Currently active: <span className="capitalize font-medium">{theme} mode</span>
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            <span>Toggle to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
          </button>
        </div>
      </div>

      {/* SECTION 3: Dataset Management & Danger Zone */}
      {currentDataset && (
        <div className="glass-panel p-6 border-rose-200 dark:border-rose-950 space-y-4">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-sm">
            <ShieldAlert className="h-4 w-4" />
            <span>Dataset Management & Danger Zone</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                Delete &apos;{currentDataset.name}&apos;
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Permanently removes this dataset, all stored conversational history, and generated reports.
              </p>
            </div>

            <button
              onClick={handleDeleteCurrentDataset}
              disabled={deleting}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-rose-500/20 hover:bg-rose-700 disabled:opacity-50 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{deleting ? 'Deleting...' : 'Delete Dataset'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
