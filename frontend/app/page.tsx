'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Sparkles,
  UploadCloud,
  FileSpreadsheet,
  ShieldCheck,
  TrendingUp,
  MessageSquareCode,
  ArrowRight,
  Database,
  Layers,
  ChevronRight,
  CheckCircle2,
  PieChart,
  Cpu,
  FileText
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useDataset } from '@/context/DatasetContext';

export default function LandingPage() {
  const { setUploadModalOpen, loadDemoDataset } = useDataset();
  const router = useRouter();

  const handleDemoClick = async () => {
    try {
      await loadDemoDataset();
      router.push('/dashboard');
    } catch (e) {
      console.error(e);
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-600/15 dark:bg-blue-500/10 blur-[130px] rounded-full pointer-events-none" />
          <div className="absolute top-1/3 left-1/3 w-[400px] h-[250px] bg-cyan-500/15 dark:bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/40 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 mb-6 shadow-xs backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              <span>Next-Generation Natural Language Data Analytics</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6">
              InsightIQ
              <span className="block mt-2 text-3xl sm:text-5xl lg:text-6xl gradient-text">
                Turn Data Into Decisions.
              </span>
            </h1>

            {/* Description */}
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed mb-10">
              Upload your dataset, explore powerful analytics, and ask questions in natural language to uncover meaningful insights.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={() => setUploadModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition transform hover:-translate-y-0.5"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Upload Dataset</span>
              </button>

              <button
                onClick={handleDemoClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs transition transform hover:-translate-y-0.5"
              >
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span>Try Demo Dataset</span>
              </button>
            </div>

            {/* Analytics Visual Preview Mockup Card */}
            <div className="relative mx-auto max-w-5xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-4 sm:p-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-slate-400">InsightIQ Analytics Engine • Global Retail Sales Demo</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    94.8% Data Quality
                  </span>
                </div>
              </div>

              {/* Mini KPI Preview Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 text-left">
                  <span className="text-[11px] font-medium text-slate-400">Total Records</span>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">1,205</div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400">10 Dimensions</span>
                </div>
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 text-left">
                  <span className="text-[11px] font-medium text-slate-400">Total Revenue</span>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">$842,510</div>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400">+14.2% YoY</span>
                </div>
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 text-left">
                  <span className="text-[11px] font-medium text-slate-400">Top Category</span>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">Technology</div>
                  <span className="text-[10px] text-slate-400">38% Share</span>
                </div>
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 text-left">
                  <span className="text-[11px] font-medium text-slate-400">Audit Status</span>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">Auto-Cleaned</div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Zero Duplicates</span>
                </div>
              </div>

              {/* Natural Language Prompt Preview */}
              <div className="rounded-xl border border-blue-200/60 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 p-4 text-left flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shrink-0">
                    <MessageSquareCode className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Prompt Query:</span>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      “Which category generated the highest profit, and what was the seasonal peak?”
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/ask"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Explore in Ask InsightIQ <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 6 CORE FEATURES */}
        <section className="py-24 border-t border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                A Complete Enterprise Analytics Suite
              </h2>
              <p className="mt-3 text-base text-slate-500 dark:text-slate-400">
                Engineered for analysts, researchers, developers, and businesses to transform complex tabular datasets into immediate executive intelligence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="glass-panel p-6 glow-card">
                <div className="h-10 w-10 rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center mb-4">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-2">Smart Data Upload</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Seamless ingestion for CSV, Excel (XLSX, XLS), and JSON datasets with automatic schema inference, type normalization, and size validation.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="glass-panel p-6 glow-card">
                <div className="h-10 w-10 rounded-xl bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-2">Automatic Data Cleaning</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Detect and remediate missing values, duplicate rows, schema inconsistencies, and statistical outliers using IQR and Z-score methods.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="glass-panel p-6 glow-card">
                <div className="h-10 w-10 rounded-xl bg-violet-600/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 flex items-center justify-center mb-4">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-2">Intelligent Visualizations</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Rule-based chart recommendation engine that pairs temporal, categorical, and continuous dimensions into optimal responsive charts.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="glass-panel p-6 glow-card">
                <div className="h-10 w-10 rounded-xl bg-cyan-600/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400 flex items-center justify-center mb-4">
                  <MessageSquareCode className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-2">AI Data Assistant</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Ask natural language questions. InsightIQ maps user queries into controlled analytical operations executed deterministically on Pandas.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="glass-panel p-6 glow-card">
                <div className="h-10 w-10 rounded-xl bg-amber-600/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center mb-4">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-2">Insight Generation</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Automatically surface dominant categories, growth trends, statistical correlations, and anomalies strictly calculated from real numbers.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="glass-panel p-6 glow-card">
                <div className="h-10 w-10 rounded-xl bg-rose-600/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 flex items-center justify-center mb-4">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-2">Report Generation</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  One-click export of executive PDF reports complete with statistical audits, key insights, and AI summaries, plus CSV and Excel exports.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4-STEP WORKFLOW: HOW INSIGHTIQ WORKS */}
        <section className="py-24 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                Seamless Workflow
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl mt-2">
                How InsightIQ Works
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="glass-panel p-6 relative">
                <div className="text-3xl font-extrabold text-blue-600/30 dark:text-blue-400/30 mb-3 font-mono">
                  01
                </div>
                <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-1">Upload</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Drop your CSV, Excel, or JSON dataset. InsightIQ handles the parsing securely in seconds.
                </p>
              </div>

              {/* Step 2 */}
              <div className="glass-panel p-6 relative">
                <div className="text-3xl font-extrabold text-cyan-600/30 dark:text-cyan-400/30 mb-3 font-mono">
                  02
                </div>
                <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-1">Analyze</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  The engine automatically profiles column types, checks data quality, and calculates statistical metrics.
                </p>
              </div>

              {/* Step 3 */}
              <div className="glass-panel p-6 relative">
                <div className="text-3xl font-extrabold text-violet-600/30 dark:text-violet-400/30 mb-3 font-mono">
                  03
                </div>
                <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-1">Ask</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ask natural questions like &quot;What is the average revenue?&quot; or &quot;Show sales by region&quot;.
                </p>
              </div>

              {/* Step 4 */}
              <div className="glass-panel p-6 relative">
                <div className="text-3xl font-extrabold text-emerald-600/30 dark:text-emerald-400/30 mb-3 font-mono">
                  04
                </div>
                <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-1">Discover</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Get interactive charts, KPI metrics, spreadsheet previews, and exportable executive reports.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="py-20 border-t border-slate-200 dark:border-slate-800 bg-gradient-to-b from-transparent to-blue-50/40 dark:to-blue-950/20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
              Ready to Turn Your Data Into Decisions?
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm max-w-xl mx-auto mb-8">
              Start exploring your data today without writing a single line of SQL or Python.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition"
              >
                <span>Launch Analytics Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-10 px-4 md:px-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <BarChart3 className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-sm">InsightIQ</span>
            <span className="text-slate-400">| Turn Data Into Decisions.</span>
          </div>
          <p>© {new Date().getFullYear()} InsightIQ Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
