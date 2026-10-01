'use client';

import React, { useState, useEffect } from 'react';
import {
  Table2,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Eye,
  SlidersHorizontal,
  Loader2
} from 'lucide-react';
import { useDataset } from '@/context/DatasetContext';
import { api } from '@/services/api';
import { PreviewData } from '@/types';

export default function DataPreviewPage() {
  const { currentDataset } = useDataset();
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentDataset?.id) {
      loadData(page, pageSize, search, sortBy, sortOrder);
    }
  }, [currentDataset?.id, page, pageSize, sortBy, sortOrder]);

  const loadData = async (p: number, ps: number, q: string, sort: string, order: 'asc' | 'desc') => {
    if (!currentDataset) return;
    setLoading(true);
    try {
      const data = await api.getPreview(currentDataset.id, p, ps, q, sort, order);
      setPreview(data);
      if (visibleColumns.length === 0 && data.columns) {
        setVisibleColumns(data.columns);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData(1, pageSize, search, sortBy, sortOrder);
  };

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('asc');
    }
  };

  const toggleColumnVisibility = (col: string) => {
    if (visibleColumns.includes(col)) {
      if (visibleColumns.length > 1) {
        setVisibleColumns(visibleColumns.filter((c) => c !== col));
      }
    } else {
      setVisibleColumns([...visibleColumns, col]);
    }
  };

  if (!currentDataset) {
    return (
      <div className="glass-panel p-8 text-center text-xs text-slate-500">
        Please select or upload a dataset to preview records.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Table2 className="h-5 w-5 text-blue-500" />
            <span>Data Preview & Spreadsheet</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Backend pagination • Displaying records from {currentDataset.name}
          </p>
        </div>

        {/* Search & Column Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search in table..."
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 pl-8 pr-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-44 sm:w-56"
            />
          </form>

          {/* Column Visibility Menu */}
          <div className="relative">
            <button
              onClick={() => setColumnMenuOpen(!columnMenuOpen)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <Eye className="h-3.5 w-3.5 text-slate-500" />
              <span>Columns ({visibleColumns.length})</span>
            </button>

            {columnMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-50 max-h-64 overflow-y-auto">
                <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Toggle Columns
                </div>
                {preview?.columns.map((c) => (
                  <label
                    key={c}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns.includes(c)}
                      onChange={() => toggleColumnVisibility(c)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="truncate">{c}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spreadsheet Table Panel */}
      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="flex h-72 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[620px]">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-slate-400 font-mono text-[10px] text-center border-r border-slate-200 dark:border-slate-700">
                    #
                  </th>
                  {preview?.columns
                    .filter((c) => visibleColumns.includes(c))
                    .map((col) => (
                      <th
                        key={col}
                        onClick={() => handleSort(col)}
                        className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-200 cursor-pointer select-none hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition border-r border-slate-200 dark:border-slate-700 whitespace-nowrap"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span>{col}</span>
                          <ArrowUpDown className="h-3 w-3 text-slate-400" />
                        </div>
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {preview?.rows.map((row, idx) => {
                  const rowNumber = (page - 1) * pageSize + idx + 1;
                  return (
                    <tr
                      key={idx}
                      className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition group"
                    >
                      <td className="py-2 px-3 text-center font-mono text-[10px] text-slate-400 border-r border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
                        {rowNumber}
                      </td>
                      {preview?.columns
                        .filter((c) => visibleColumns.includes(c))
                        .map((col) => {
                          const val = row[col];
                          const isNull = val === null || val === undefined;
                          return (
                            <td
                              key={col}
                              className={`py-2 px-3 border-r border-slate-100 dark:border-slate-800/80 max-w-xs truncate whitespace-nowrap font-mono text-[11px] ${
                                isNull
                                  ? 'text-rose-400 italic bg-rose-50/30 dark:bg-rose-950/10'
                                  : 'text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {isNull ? 'null' : String(val)}
                            </td>
                          );
                        })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-500">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {((page - 1) * pageSize + 1).toLocaleString()}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {Math.min(page * pageSize, preview?.total_rows || 0).toLocaleString()}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {preview?.total_rows.toLocaleString() || 0}
            </span>{' '}
            records
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-2 py-1 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-slate-200 dark:border-slate-800 p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2 font-medium text-slate-700 dark:text-slate-300">
                {page} / {preview?.total_pages || 1}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(preview?.total_pages || 1, p + 1))}
                disabled={page >= (preview?.total_pages || 1)}
                className="rounded-lg border border-slate-200 dark:border-slate-800 p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
