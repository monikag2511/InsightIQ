'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Layers,
  Activity,
  CheckCircle2,
  Loader2,
  FileText,
  Lightbulb,
  ShieldAlert,
  Copy
} from 'lucide-react';
import { useDataset } from '@/context/DatasetContext';
import { api } from '@/services/api';
import { InsightsData, InsightItem } from '@/types';

export default function InsightsPage() {
  const { currentDataset } = useDataset();
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (currentDataset?.id) {
      loadInsights(currentDataset.id);
    }
  }, [currentDataset?.id]);

  const loadInsights = async (id: number) => {
    setLoading(true);
    try {
      const res = await api.getInsights(id);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'success':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300';
      case 'warning':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300';
      case 'alert':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300';
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'category':
        return <Layers className="h-4 w-4 text-blue-500" />;
      case 'trend':
        return <TrendingUp className="h-4 w-4 text-purple-500" />;
      case 'correlation':
        return <Activity className="h-4 w-4 text-cyan-500" />;
      case 'outlier':
        return <ShieldAlert className="h-4 w-4 text-rose-500" />;
      default:
        return <Lightbulb className="h-4 w-4 text-amber-500" />;
    }
  };

  if (!currentDataset) {
    return (
      <div className="glass-panel p-8 text-center text-xs text-slate-500">
        Please select or upload a dataset to generate automatic insights.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-xs font-medium text-slate-500">Evaluating trends, correlations, leadership, and anomalies...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <span>Automatic Actionable Insights</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Strictly derived from real calculated statistical facts • Zero fabricated assertions
          </p>
        </div>

        <button
          onClick={() => setSummaryOpen(!summaryOpen)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition"
        >
          <FileText className="h-3.5 w-3.5" />
          <span>{summaryOpen ? 'Hide AI Summary' : 'Generate AI Summary'}</span>
        </button>
      </div>

      {/* AI Executive Summary Card (Mandated 6-section structure) */}
      {summaryOpen && data?.ai_summary && (
        <div className="glass-panel p-6 border-blue-500/30 bg-blue-50/20 dark:bg-blue-950/20 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span>InsightIQ Strategic Executive Summary</span>
            </div>
            <button
              onClick={() => {
                if (data?.ai_summary) {
                  navigator.clipboard.writeText(data.ai_summary);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.ai_summary.split('### ').slice(1).map((section, idx) => {
              const [title, ...contentLines] = section.split('\n');
              const body = contentLines.join('\n').trim();
              return (
                <div key={idx} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4">
                  <h4 className="font-semibold text-xs text-blue-600 dark:text-blue-400 mb-1">{title}</h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{body}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Key Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.insights.map((item: InsightItem) => (
          <div key={item.id} className="glass-panel p-5 glow-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                  {getCategoryIcon(item.category)}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {item.category}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.metric_highlight && (
                  <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {item.metric_highlight}
                  </span>
                )}
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${getSeverityBadge(item.severity)}`}>
                  {item.severity}
                </span>
              </div>
            </div>

            <h3 className="font-semibold text-sm text-slate-900 dark:text-white leading-snug">
              {item.title}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
