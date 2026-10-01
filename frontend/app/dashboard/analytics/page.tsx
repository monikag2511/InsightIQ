'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Hash,
  Layers,
  Grid,
  Loader2,
  HelpCircle,
  Activity
} from 'lucide-react';
import { useDataset } from '@/context/DatasetContext';
import { api } from '@/services/api';
import { StatisticsData } from '@/types';

export default function AnalyticsPage() {
  const { currentDataset } = useDataset();
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCatCol, setSelectedCatCol] = useState<string>('');

  useEffect(() => {
    if (currentDataset?.id) {
      loadStats(currentDataset.id);
    }
  }, [currentDataset?.id]);

  const loadStats = async (id: number) => {
    setLoading(true);
    try {
      const data = await api.getStatistics(id);
      setStats(data);
      const catKeys = Object.keys(data.categorical || {});
      if (catKeys.length > 0) {
        setSelectedCatCol(catKeys[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!currentDataset) {
    return (
      <div className="glass-panel p-8 text-center text-xs text-slate-500">
        Please select or upload a dataset to compute statistical analytics.
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-xs font-medium text-slate-500">Computing exploratory data analytics & correlation matrices...</p>
      </div>
    );
  }

  const numericalCols = Object.keys(stats.numerical || {});
  const categoricalCols = Object.keys(stats.categorical || {});
  const corrCols = Object.keys(stats.correlation_matrix || {});

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          <span>Exploratory Data Analysis (EDA)</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Descriptive statistics, dispersion metrics, frequency distributions, and Pearson correlation coefficients
        </p>
      </div>

      {/* SECTION 1: Numerical Descriptive Statistics Table */}
      <div className="glass-panel p-5">
        <div className="flex items-center gap-2 mb-1">
          <Hash className="h-4 w-4 text-blue-500" />
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
            Numerical Metrics & Dispersion
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Mean, median, mode, spread, variance, standard deviation, and quartiles (Q25, Q50, Q75, IQR)
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium whitespace-nowrap">
                <th className="py-2.5 px-3">Column</th>
                <th className="py-2.5 px-3 text-right">Mean</th>
                <th className="py-2.5 px-3 text-right">Median (Q50)</th>
                <th className="py-2.5 px-3 text-right">Mode</th>
                <th className="py-2.5 px-3 text-right">Min</th>
                <th className="py-2.5 px-3 text-right">Max</th>
                <th className="py-2.5 px-3 text-right">Range</th>
                <th className="py-2.5 px-3 text-right">Std Dev</th>
                <th className="py-2.5 px-3 text-right">Variance</th>
                <th className="py-2.5 px-3 text-right">Q25</th>
                <th className="py-2.5 px-3 text-right">Q75</th>
                <th className="py-2.5 px-3 text-right">IQR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {numericalCols.map((col) => {
                const s = stats.numerical[col];
                return (
                  <tr key={col} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 whitespace-nowrap font-mono text-[11px]">
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-900 dark:text-white">{col}</td>
                    <td className="py-2.5 px-3 text-right text-blue-600 dark:text-blue-400 font-semibold">{s.mean?.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">{s.median?.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500">{s.mode !== null && s.mode !== undefined ? s.mode.toLocaleString() : '—'}</td>
                    <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">{s.min?.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">{s.max?.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500">{s.range?.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">{s.std?.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500">{s.variance?.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500">{s.q25?.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500">{s.q75?.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-violet-600 dark:text-violet-400 font-semibold">{s.iqr?.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: Categorical Statistics & Frequency Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-5 lg:col-span-1">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="h-4 w-4 text-amber-500" />
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
              Categorical Features
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Select a feature to inspect frequency distribution
          </p>

          <div className="space-y-1.5">
            {categoricalCols.map((col) => {
              const c = stats.categorical[col];
              const isSelected = selectedCatCol === col;
              return (
                <button
                  key={col}
                  onClick={() => setSelectedCatCol(col)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs text-left transition ${
                    isSelected
                      ? 'bg-blue-50 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-medium'
                      : 'border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="truncate">
                    <span className="font-semibold">{col}</span>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {c.unique_count} unique • Top: {c.most_frequent}
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">{c.frequency}x</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Categorical Frequency Breakdown */}
        <div className="glass-panel p-5 lg:col-span-2">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">
            Distribution: <span className="text-blue-600 dark:text-blue-400">{selectedCatCol}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Frequency count and proportional percentage of top observations
          </p>

          {selectedCatCol && stats.categorical[selectedCatCol] ? (
            <div className="space-y-3">
              {stats.categorical[selectedCatCol].distribution.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{item.category}</span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {item.count.toLocaleString()} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-500"
                      style={{ width: `${Math.max(2, item.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 text-xs text-slate-400">Select a categorical column</div>
          )}
        </div>
      </div>

      {/* SECTION 3: Correlation Matrix */}
      {corrCols.length >= 2 && (
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-4 w-4 text-cyan-500" />
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
              Pearson Correlation Matrix
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Linear correlation coefficients between numerical metrics (-1.0 to +1.0)
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="py-2 px-3 text-left font-sans text-slate-400">Feature</th>
                  {corrCols.map((c) => (
                    <th key={c} className="py-2 px-3 text-slate-700 dark:text-slate-300 font-sans">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {corrCols.map((rowCol) => (
                  <tr key={rowCol}>
                    <td className="py-2 px-3 text-left font-sans font-medium text-slate-900 dark:text-white">
                      {rowCol}
                    </td>
                    {corrCols.map((colCol) => {
                      const val = stats.correlation_matrix[rowCol]?.[colCol];
                      if (val === null || val === undefined) {
                        return <td key={colCol} className="py-2 px-3 text-slate-400">—</td>;
                      }

                      const intensity = Math.abs(val);
                      const bg =
                        val === 1
                          ? 'rgba(59, 130, 246, 0.2)'
                          : val > 0
                          ? `rgba(37, 99, 235, ${Math.max(0.1, intensity * 0.4)})`
                          : `rgba(239, 68, 68, ${Math.max(0.1, intensity * 0.4)})`;

                      return (
                        <td
                          key={colCol}
                          style={{ backgroundColor: bg }}
                          className={`py-2 px-3 font-semibold ${
                            val === 1
                              ? 'text-slate-400'
                              : val > 0.4
                              ? 'text-blue-600 dark:text-blue-400'
                              : val < -0.4
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
