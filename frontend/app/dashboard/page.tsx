'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Database,
  Layers,
  AlertTriangle,
  Copy,
  ShieldCheck,
  TrendingUp,
  MessageSquareCode,
  ArrowRight,
  FileSpreadsheet,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Calendar,
  Hash,
  Type,
  ToggleLeft
} from 'lucide-react';
import { useDataset } from '@/context/DatasetContext';
import { api } from '@/services/api';
import { DatasetProfile, ColumnProfile } from '@/types';

export default function DashboardOverviewPage() {
  const { currentDataset, loading: contextLoading, setUploadModalOpen } = useDataset();
  const [profile, setProfile] = useState<DatasetProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentDataset?.id) {
      loadProfile(currentDataset.id);
    }
  }, [currentDataset?.id]);

  const loadProfile = async (id: number) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.getProfile(id);
      setProfile(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch dataset profile.');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'numerical':
        return <Hash className="h-3.5 w-3.5 text-blue-500" />;
      case 'datetime':
        return <Calendar className="h-3.5 w-3.5 text-purple-500" />;
      case 'boolean':
        return <ToggleLeft className="h-3.5 w-3.5 text-emerald-500" />;
      case 'categorical':
        return <Layers className="h-3.5 w-3.5 text-amber-500" />;
      default:
        return <Type className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  if (contextLoading || loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-xs font-medium text-slate-500">Profiling dataset schema and calculating quality metrics...</p>
      </div>
    );
  }

  if (!currentDataset) {
    return (
      <div className="glass-panel p-12 text-center max-w-xl mx-auto my-12">
        <Database className="h-12 w-12 text-blue-500 mx-auto mb-4 opacity-80" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Dataset Active</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-6">
          Upload your tabular data (CSV, Excel, JSON) or try the retail demo dataset to unlock automated analytics.
        </p>
        <button
          onClick={() => setUploadModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 transition"
        >
          Upload New Dataset
        </button>
      </div>
    );
  }

  const qualityScore = profile?.quality_score ?? 100;
  const qualityColor =
    qualityScore >= 90
      ? 'text-emerald-600 dark:text-emerald-400'
      : qualityScore >= 75
      ? 'text-blue-600 dark:text-blue-400'
      : qualityScore >= 50
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-rose-600 dark:text-rose-400';

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <span>{currentDataset.name}</span>
            <span className="rounded-md bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 text-xs font-mono font-medium text-blue-700 dark:text-blue-300">
              .{currentDataset.file_type}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Profiling completed • Ground truth analytics computed across all records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/quality"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Audit Quality</span>
          </Link>
          <Link
            href="/dashboard/ask"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
          >
            <MessageSquareCode className="h-3.5 w-3.5" />
            <span>Ask Your Data</span>
          </Link>
        </div>
      </div>

      {/* KPI METRIC CARDS (REAL DATA ONLY) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Rows */}
        <div className="glass-panel p-4 glow-card">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Rows</span>
            <Database className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {profile?.row_count ? profile.row_count.toLocaleString() : currentDataset.row_count.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Observed instances</div>
        </div>

        {/* Columns */}
        <div className="glass-panel p-4 glow-card">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Columns</span>
            <Layers className="h-4 w-4 text-cyan-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {profile?.column_count || currentDataset.column_count}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Features / fields</div>
        </div>

        {/* Missing Values */}
        <div className="glass-panel p-4 glow-card">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Missing Values</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {profile ? profile.missing_values.toLocaleString() : '0'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {profile?.missing_pct}% total missingness
          </div>
        </div>

        {/* Duplicate Rows */}
        <div className="glass-panel p-4 glow-card">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Duplicate Rows</span>
            <Copy className="h-4 w-4 text-violet-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {profile ? profile.duplicate_rows.toLocaleString() : '0'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {profile?.duplicate_pct}% duplication rate
          </div>
        </div>

        {/* Data Quality Score */}
        <div className="glass-panel p-4 glow-card col-span-2 sm:col-span-1 border-blue-500/20">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Data Quality</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className={`mt-2 text-2xl font-bold ${qualityColor}`}>
            {qualityScore}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Calculated composite score</div>
        </div>
      </div>

      {/* COLUMN PROFILING TABLE */}
      <div className="glass-panel p-5 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Dataset Profile & Type Inference
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Automated classification into numerical, categorical, datetime, boolean, and text types
            </p>
          </div>
          <Link
            href="/dashboard/preview"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View Full Spreadsheet</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                <th className="py-2.5 px-3">Column</th>
                <th className="py-2.5 px-3">Detected Type</th>
                <th className="py-2.5 px-3">Missing Cells</th>
                <th className="py-2.5 px-3">Unique Values</th>
                <th className="py-2.5 px-3">Example Values</th>
                <th className="py-2.5 px-3 text-right">Summary Stat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {profile?.columns.map((col: ColumnProfile) => (
                <tr key={col.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                  <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    {getTypeIcon(col.general_type)}
                    <span>{col.name}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 capitalize">
                      {col.general_type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    {col.missing_count > 0 ? (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        {col.missing_count} ({col.missing_pct}%)
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400">0 (0%)</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-300">
                    {col.unique_count.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 truncate max-w-xs">
                    {col.example_values.slice(0, 3).join(', ') || '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                    {col.mean !== null && col.mean !== undefined
                      ? `avg: ${col.mean.toLocaleString()}`
                      : col.general_type === 'datetime'
                      ? 'time-series'
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
