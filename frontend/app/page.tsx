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
  FileText,
  Terminal,
  Server,
  Zap,
  Bot
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
              <span>AI-Powered Personal Data Analysis Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6">
              Ask Your Data
              <span className="block mt-2 text-3xl sm:text-5xl lg:text-6xl gradient-text">
                Upload your data. Ask questions. Discover insights.
              </span>
            </h1>

            {/* Description */}
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed mb-10">
              Transform your raw CSV, Excel, and JSON files into automated statistical profiling, interactive visualizations, and natural-language answers backed by real Pandas computation.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={() => setUploadModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition transform hover:-translate-y-0.5 cursor-pointer"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Upload Dataset</span>
              </button>

              <button
                onClick={handleDemoClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs transition transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span>Try Demo Dataset</span>
              </button>
            </div>

            {/* Analytics Visual Preview Mockup Card */}
            <div className="relative mx-auto max-w-5xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-4 sm:p-6 shadow-2xl backdrop-blur-md text-left">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-slate-400">Ask Your Data • Retail Sales Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    94.8% Data Quality Score
                  </span>
                </div>
              </div>

              {/* Mini KPI Preview Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3">
                  <span className="text-[11px] font-medium text-slate-400">Total Records</span>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">1,200</div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400">10 Dimensions</span>
                </div>
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3">
                  <span className="text-[11px] font-medium text-slate-400">Total Revenue</span>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">$842,510</div>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400">+14.2% YoY</span>
                </div>
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3">
                  <span className="text-[11px] font-medium text-slate-400">Top Category</span>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">Technology</div>
                  <span className="text-[10px] text-slate-400">38% Share</span>
                </div>
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3">
                  <span className="text-[11px] font-medium text-slate-400">Data Audit</span>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">Cleaned</div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400">0 Duplicates</span>
                </div>
              </div>

              {/* Natural Language Prompt Preview */}
              <div className="rounded-xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-semibold text-blue-900 dark:text-blue-300">
                    &quot;Which category has the highest sales?&quot;
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Calculated via Pandas <code className="px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 font-mono text-[11px]">groupby(&apos;Category&apos;)[&apos;Sales&apos;].sum()</code>: <strong className="text-slate-900 dark:text-white">Technology</strong> recorded the highest revenue with <strong className="text-slate-900 dark:text-white">$320,158.80</strong> (38.0% of total revenue).
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                  <Link href="/ask" className="inline-flex items-center gap-1 hover:underline">
                    Try the interactive AI Chat <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <span className="text-slate-400 font-mono text-[10px]">Zero Numerical Hallucinations</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6 FEATURE CARDS SECTION */}
        <section className="py-24 border-t border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                Platform Capabilities
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl mt-2">
                Everything You Need To Understand Your Data
              </h2>
              <p className="mt-3 text-base text-slate-500 dark:text-slate-400">
                A modern SaaS analytics experience crafted for instant data intelligence without writing SQL or Python.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1: Upload & Analyze */}
              <div className="glass-panel p-6 glow-card">
                <div className="h-10 w-10 rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center mb-4">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-2">Upload & Analyze</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Drag-and-drop CSV, Excel (XLSX, XLS), and JSON datasets with automatic schema inference, data validation, and instant profiling.
                </p>
              </div>

              {/* Feature 2: AI Data Chat */}
              <div className="glass-panel p-6 glow-card">
                <div className="h-10 w-10 rounded-xl bg-cyan-600/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400 flex items-center justify-center mb-4">
                  <MessageSquareCode className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-2">AI Data Chat</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Ask natural-language questions. The system computes exact answers using Pandas on your dataset, explaining results in plain English with tables and charts.
                </p>
              </div>

              {/* Feature 3: Automatic Insights */}
              <div className="glass-panel p-6 glow-card">
                <div className="h-10 w-10 rounded-xl bg-amber-600/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center mb-4">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-2">Automatic Insights</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Instantly compute highest/lowest drivers, growth patterns, category dominance, Pearson correlations, and statistical anomalies based on real data.
                </p>
              </div>

              {/* Feature 4: Interactive Dashboards */}
              <div className="glass-panel p-6 glow-card">
                <div className="h-10 w-10 rounded-xl bg-violet-600/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 flex items-center justify-center mb-4">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-2">Interactive Dashboards</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Auto-selects optimal visualizations (bar, line, scatter, box plot, donut, histogram, heatmap) with downloadable PNG exports and tooltips.
                </p>
              </div>

              {/* Feature 5: Data Cleaning */}
              <div className="glass-panel p-6 glow-card">
                <div className="h-10 w-10 rounded-xl bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-2">Data Cleaning</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Audit and clean missing values (mean, median, mode), remove duplicates, and detect statistical outliers with IQR and Z-score methods.
                </p>
              </div>

              {/* Feature 6: Export Reports */}
              <div className="glass-panel p-6 glow-card">
                <div className="h-10 w-10 rounded-xl bg-rose-600/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 flex items-center justify-center mb-4">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-2">Export Reports</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Generate publication-ready executive PDF reports with statistical audits and download cleaned datasets in CSV and Excel formats.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS: Upload -> Analyze -> Ask -> Discover */}
        <section className="py-24 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                Simple 4-Step Process
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl mt-2">
                How It Works
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Upload → Analyze → Ask → Discover
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1: Upload */}
              <div className="glass-panel p-6 relative">
                <div className="text-3xl font-extrabold text-blue-600/30 dark:text-blue-400/30 mb-3 font-mono">
                  01
                </div>
                <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-1">Upload</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Drop your CSV, Excel, or JSON dataset. Automatic validation checks size, encoding, and schema.
                </p>
              </div>

              {/* Step 2: Analyze */}
              <div className="glass-panel p-6 relative">
                <div className="text-3xl font-extrabold text-cyan-600/30 dark:text-cyan-400/30 mb-3 font-mono">
                  02
                </div>
                <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-1">Analyze</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  The engine profiles types, detects missing values and duplicate rows, computes statistics, and scores data quality.
                </p>
              </div>

              {/* Step 3: Ask */}
              <div className="glass-panel p-6 relative">
                <div className="text-3xl font-extrabold text-violet-600/30 dark:text-violet-400/30 mb-3 font-mono">
                  03
                </div>
                <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-1">Ask</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Type questions in natural language. Safe Pandas operations execute deterministically to compute exact figures.
                </p>
              </div>

              {/* Step 4: Discover */}
              <div className="glass-panel p-6 relative">
                <div className="text-3xl font-extrabold text-emerald-600/30 dark:text-emerald-400/30 mb-3 font-mono">
                  04
                </div>
                <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-1">Discover</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Review generated charts, key insights, tabular answers, and export full executive PDF reports with one click.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TECHNOLOGY SECTION */}
        <section className="py-20 border-t border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                Modern Full-Stack Stack
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl mt-2">
                Built With Production-Grade Technologies
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Engineered for speed, mathematical rigor, and reliability.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Python */}
              <div className="glass-panel p-4 text-center rounded-xl">
                <div className="font-bold text-sm text-slate-900 dark:text-white">Python</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Core Engine</p>
              </div>

              {/* Pandas */}
              <div className="glass-panel p-4 text-center rounded-xl">
                <div className="font-bold text-sm text-slate-900 dark:text-white">Pandas</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Data Manipulation</p>
              </div>

              {/* FastAPI */}
              <div className="glass-panel p-4 text-center rounded-xl">
                <div className="font-bold text-sm text-slate-900 dark:text-white">FastAPI</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">High-Speed REST API</p>
              </div>

              {/* Next.js */}
              <div className="glass-panel p-4 text-center rounded-xl">
                <div className="font-bold text-sm text-slate-900 dark:text-white">Next.js</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">React & TypeScript</p>
              </div>

              {/* PostgreSQL */}
              <div className="glass-panel p-4 text-center rounded-xl">
                <div className="font-bold text-sm text-slate-900 dark:text-white">PostgreSQL</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Relational Database</p>
              </div>

              {/* AI */}
              <div className="glass-panel p-4 text-center rounded-xl">
                <div className="font-bold text-sm text-slate-900 dark:text-white">AI</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Natural Language LLM</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="py-20 border-t border-slate-200 dark:border-slate-800 bg-gradient-to-b from-transparent to-blue-50/40 dark:to-blue-950/20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
              Ready to Ask Your Data?
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm max-w-xl mx-auto mb-8">
              Upload your CSV, Excel, or JSON dataset or explore the built-in demo in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition"
              >
                <span>Launch Analytics Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/ask"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3.5 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <MessageSquareCode className="h-4 w-4 text-blue-500" />
                <span>Open Ask Your Data Chat</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* POLISHED FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-10 px-4 md:px-8 text-xs text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <BarChart3 className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-sm">Ask Your Data</span>
            <span className="text-slate-400">| AI-Powered Personal Data Analysis</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-blue-500 transition">Dashboard</Link>
            <Link href="/ask" className="hover:text-blue-500 transition">Ask Your Data</Link>
            <Link href="/dashboard/reports" className="hover:text-blue-500 transition">Reports</Link>
            <Link href="/dashboard/quality" className="hover:text-blue-500 transition">Data Quality</Link>
          </div>
          <p>© {new Date().getFullYear()} Ask Your Data. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
