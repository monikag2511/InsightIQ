'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Copy,
  Wand2,
  CheckCircle2,
  Trash2,
  Download,
  Loader2,
  Layers,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { useDataset } from '@/context/DatasetContext';
import { api } from '@/services/api';
import { DatasetProfile, CleaningResponse } from '@/types';

export default function DataQualityPage() {
  const { currentDataset, refreshDatasets } = useDataset();
  const [profile, setProfile] = useState<DatasetProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [cleanSummary, setCleanSummary] = useState<CleaningResponse | null>(null);
  const [activeStrategy, setActiveStrategy] = useState<Record<string, string>>({});

  useEffect(() => {
    if (currentDataset?.id) {
      loadProfile(currentDataset.id);
    }
  }, [currentDataset?.id]);

  const loadProfile = async (id: number) => {
    setLoading(true);
    try {
      const data = await api.getProfile(id);
      setProfile(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoClean = async () => {
    if (!currentDataset) return;
    setCleaning(true);
    try {
      const res = await api.cleanDataset(currentDataset.id, [], true);
      setCleanSummary(res);
      await loadProfile(currentDataset.id);
      await refreshDatasets();
    } catch (e) {
      console.error(e);
    } finally {
      setCleaning(false);
    }
  };

  const handleRemoveDuplicates = async () => {
    if (!currentDataset) return;
    setCleaning(true);
    try {
      const res = await api.cleanDataset(currentDataset.id, [{ operation: 'remove_duplicates' }]);
      setCleanSummary(res);
      await loadProfile(currentDataset.id);
      await refreshDatasets();
    } catch (e) {
      console.error(e);
    } finally {
      setCleaning(false);
    }
  };

  const handleCleanColumn = async (column: string, strategy: string) => {
    if (!currentDataset) return;
    setCleaning(true);
    try {
      const op = strategy === 'drop'
        ? { operation: 'drop_missing_rows', column }
        : { operation: 'fill_missing', column, strategy };
      const res = await api.cleanDataset(currentDataset.id, [op]);
      setCleanSummary(res);
      await loadProfile(currentDataset.id);
      await refreshDatasets();
    } catch (e) {
      console.error(e);
    } finally {
      setCleaning(false);
    }
  };

  if (!currentDataset) {
    return (
      <div className="glass-panel p-8 text-center text-xs text-slate-500">
        Please select or upload a dataset to run data quality audits.
      </div>
    );
  }

  const score = profile?.quality_score ?? 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <span>Data Quality & Cleaning Pipeline</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit nulls, duplicate rows, and statistical anomalies with automated remediation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={api.getExportUrl(currentDataset.id, 'csv')}
            download
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <Download className="h-3.5 w-3.5 text-blue-500" />
            <span>Download Clean Dataset</span>
          </a>

          <button
            onClick={handleAutoClean}
            disabled={cleaning}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition"
          >
            {cleaning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
            <span>Run Auto-Clean Pipeline</span>
          </button>
        </div>
      </div>

      {/* Cleaning Result Toast / Notification Summary */}
      {cleanSummary && (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-950/30 p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-emerald-500 p-1.5 text-white shrink-0 mt-0.5">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-emerald-900 dark:text-emerald-300">
                  Data Cleaning Executed Successfully
                </h4>
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  Quality Score: {cleanSummary.quality_score_before}% → {cleanSummary.quality_score_after}%
                </span>
              </div>
              <ul className="mt-2 space-y-1 text-xs text-emerald-800 dark:text-emerald-300/90 list-disc list-inside">
                {cleanSummary.changes_applied.map((change, i) => (
                  <li key={i}>{change}</li>
                ))}
              </ul>
              <div className="mt-3 flex items-center gap-4 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <span>Rows: {cleanSummary.rows_before} → {cleanSummary.rows_after}</span>
                <span>Columns: {cleanSummary.columns_before} → {cleanSummary.columns_after}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Audit KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Score Card */}
        <div className="glass-panel p-5 glow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Quality Score</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{score}%</span>
            <span className="text-xs text-slate-400 font-medium">calculated rating</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Penalized for null cells (-40% max), duplicates (-30% max), and distribution anomalies.
          </p>
        </div>

        {/* Missing Values Card */}
        <div className="glass-panel p-5 glow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Missing Values</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {profile?.missing_values.toLocaleString() || '0'}
            </span>
            <span className="text-xs text-slate-400 font-medium">({profile?.missing_pct}% total cells)</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {profile?.missing_breakdown.length || 0} column(s) affected with unpopulated values.
          </p>
        </div>

        {/* Duplicate Rows Card */}
        <div className="glass-panel p-5 glow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Duplicate Rows</span>
            <Copy className="h-4 w-4 text-violet-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {profile?.duplicate_rows.toLocaleString() || '0'}
            </span>
            <span className="text-xs text-slate-400 font-medium">({profile?.duplicate_pct}% rows)</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">Redundant copies</span>
            {(profile?.duplicate_rows || 0) > 0 && (
              <button
                onClick={handleRemoveDuplicates}
                disabled={cleaning}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
              >
                Remove Duplicates
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 1: Missing Values Remediation Table */}
      <div className="glass-panel p-5">
        <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">
          Missing Values Breakdown & Remediation
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Choose a tailored imputation strategy for each individual column
        </p>

        {profile?.missing_breakdown && profile.missing_breakdown.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                  <th className="py-2.5 px-3">Column</th>
                  <th className="py-2.5 px-3">Missing Count</th>
                  <th className="py-2.5 px-3">Percentage</th>
                  <th className="py-2.5 px-3">Imputation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {profile.missing_breakdown.map((item) => (
                  <tr key={item.column} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">{item.column}</td>
                    <td className="py-2.5 px-3 font-mono text-amber-600 dark:text-amber-400 font-semibold">
                      {item.missing_count.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{item.missing_pct}%</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => handleCleanColumn(item.column, 'mean')}
                          disabled={cleaning}
                          className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                          Fill Mean
                        </button>
                        <button
                          onClick={() => handleCleanColumn(item.column, 'median')}
                          disabled={cleaning}
                          className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                          Fill Median
                        </button>
                        <button
                          onClick={() => handleCleanColumn(item.column, 'mode')}
                          disabled={cleaning}
                          className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                          Fill Mode
                        </button>
                        <button
                          onClick={() => handleCleanColumn(item.column, 'drop')}
                          disabled={cleaning}
                          className="rounded-md border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 px-2 py-1 text-[11px] font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-100"
                        >
                          Drop Rows
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20 p-6 text-center">
            <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              Zero Missing Values Found
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Every row and feature is fully populated.</p>
          </div>
        )}
      </div>

      {/* SECTION 2: Outlier Detection Table (IQR) */}
      <div className="glass-panel p-5">
        <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">
          Outlier & Extreme Value Detection (IQR Method)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Identifies data points falling outside Q1 - 1.5×IQR or Q3 + 1.5×IQR thresholds
        </p>

        {profile?.outliers_breakdown && profile.outliers_breakdown.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                  <th className="py-2.5 px-3">Column</th>
                  <th className="py-2.5 px-3">Outlier Count</th>
                  <th className="py-2.5 px-3">Percentage</th>
                  <th className="py-2.5 px-3">Lower Bound</th>
                  <th className="py-2.5 px-3">Upper Bound</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {profile.outliers_breakdown.map((item) => (
                  <tr key={item.column} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">{item.column}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-violet-600 dark:text-violet-400">
                      {item.outlier_count.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{item.outlier_pct}%</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">{item.lower_bound}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">{item.upper_bound}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={async () => {
                          if (!currentDataset) return;
                          setCleaning(true);
                          try {
                            const res = await api.cleanDataset(currentDataset.id, [
                              { operation: 'remove_outliers', column: item.column }
                            ]);
                            setCleanSummary(res);
                            await loadProfile(currentDataset.id);
                            await refreshDatasets();
                          } catch (e) {
                            console.error(e);
                          } finally {
                            setCleaning(false);
                          }
                        }}
                        disabled={cleaning}
                        className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        Trim Outliers
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-6 text-center text-xs text-slate-500">
            No extreme statistical outliers detected across numerical columns.
          </div>
        )}
      </div>
    </div>
  );
}
