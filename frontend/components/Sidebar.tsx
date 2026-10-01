'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Table2,
  ShieldCheck,
  TrendingUp,
  BarChart2,
  MessageSquareCode,
  Sparkles,
  FileSpreadsheet,
  Settings,
  ChevronRight,
  Database
} from 'lucide-react';
import { useDataset } from '@/context/DatasetContext';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Data Preview', href: '/dashboard/preview', icon: Table2 },
  { name: 'Data Quality', href: '/dashboard/quality', icon: ShieldCheck, badge: 'Audit' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp },
  { name: 'Visualizations', href: '/dashboard/visualizations', icon: BarChart2 },
  { name: 'Ask Your Data', href: '/dashboard/ask', icon: MessageSquareCode, highlight: true },
  { name: 'Insights', href: '/dashboard/insights', icon: Sparkles },
  { name: 'Reports', href: '/dashboard/reports', icon: FileSpreadsheet },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { currentDataset, mobileMenuOpen, setMobileMenuOpen } = useDataset();

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-4">
      {/* Top Section */}
      <div className="space-y-6">
        {/* Active Dataset mini card */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 p-3">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
            <Database className="h-3.5 w-3.5 text-blue-500" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Active Dataset</span>
          </div>
          <div className="mt-1.5 font-medium text-slate-900 dark:text-white text-xs truncate">
            {currentDataset ? currentDataset.name : 'No dataset selected'}
          </div>
          {currentDataset && (
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>{currentDataset.row_count.toLocaleString()} rows</span>
              <span className="rounded-sm bg-blue-100 dark:bg-blue-900/30 px-1 text-blue-700 dark:text-blue-300 font-mono text-[10px]">
                {currentDataset.file_type.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : item.highlight
                    ? 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : item.highlight ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge && !isActive && (
                  <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                    {item.badge}
                  </span>
                )}
                {item.highlight && !isActive && (
                  <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                    AI
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-3 text-white dark:from-slate-800 dark:to-slate-900 border border-slate-700/50">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Ask Your Data Engine</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-300 leading-relaxed">
            Deterministic Pandas calculations paired with intent reasoning.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md hidden md:flex md:flex-col min-h-[calc(100vh-4rem)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-slate-900 shadow-2xl z-50 h-full border-r border-slate-200 dark:border-slate-800">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
