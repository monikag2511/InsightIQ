'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  FileText,
  CheckCircle2,
  Loader2,
  Sparkles,
  Layers,
  ShieldCheck,
  TrendingUp,
  FileCode
} from 'lucide-react';
import { useDataset } from '@/context/DatasetContext';
import { api } from '@/services/api';
import { ReportItem } from '@/types';

export default function ReportsPage() {
  const { currentDataset } = useDataset();
  const [generating, setGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<ReportItem | null>(null);
  const [reportTitle, setReportTitle] = useState('Ask Your Data Executive Analytics Report');

  const handleGeneratePDF = async () => {
    if (!currentDataset) return;
    setGenerating(true);
    try {
      const rep = await api.generateReport(currentDataset.id, reportTitle);
      setGeneratedReport(rep);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  if (!currentDataset) {
    return (
      <div className="glass-panel p-8 text-center text-xs text-slate-500">
        Please select or upload a dataset to generate reports and exports.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-blue-500" />
          <span>Executive Reports & Dataset Export</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Generate publication-ready PDF reports and download cleaned datasets in CSV or Excel
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: PDF Report Generator Card */}
        <div className="lg:col-span-2 glass-panel p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                Executive PDF Report Builder
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">ReportLab Engine</span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            The Ask Your Data Report Engine compiles an exhaustive executive brief containing 8 essential sections:
          </p>

          {/* Report Contents List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>1. Dataset Overview & Dimensions</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>2. Data Quality Rating & Audit</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>3. Numerical Descriptive Stats</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>4. Categorical Breakdown</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>5. Pearson Correlations</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>6. Key Actionable Insights</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>7. Outliers & Anomaly Bounds</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>8. Automated Strategic AI Summary</span>
            </div>
          </div>

          {/* Form */}
          <div className="pt-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Report Title
            </label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleGeneratePDF}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Compiling PDF Report...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Executive Report
                </>
              )}
            </button>

            {generatedReport && (
              <a
                href={api.getReportDownloadUrl(currentDataset.id, generatedReport.id)}
                download
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-500/25 hover:bg-emerald-700 transition"
              >
                <Download className="h-4 w-4" />
                <span>Download Generated PDF</span>
              </a>
            )}
          </div>
        </div>

        {/* Right 1 Col: Raw Dataset Export Options */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <Download className="h-4 w-4 text-emerald-500" />
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
              Dataset Exports
            </h3>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Export the current active version of this dataset (including all cleaning imputations and schema normalization).
          </p>

          <div className="space-y-3 pt-2">
            {/* CSV Download */}
            <a
              href={api.getExportUrl(currentDataset.id, 'csv')}
              download
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                  <FileCode className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">Download as CSV</div>
                  <div className="text-[10px] text-slate-400">Universal comma-separated format</div>
                </div>
              </div>
              <Download className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition" />
            </a>

            {/* Excel Download */}
            <a
              href={api.getExportUrl(currentDataset.id, 'excel')}
              download
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">Download as Excel</div>
                  <div className="text-[10px] text-slate-400">Microsoft Excel Workbook (.xlsx)</div>
                </div>
              </div>
              <Download className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 transition" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
