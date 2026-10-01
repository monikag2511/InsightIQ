'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  PieChart,
  TrendingUp,
  Download,
  Loader2,
  Sparkles,
  Info
} from 'lucide-react';
import { useDataset } from '@/context/DatasetContext';
import { api } from '@/services/api';
import UniversalChart from '@/components/Charts/UniversalChart';
import { ChartConfig } from '@/types';

export default function VisualizationsPage() {
  const { currentDataset } = useDataset();
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentDataset?.id) {
      loadCharts(currentDataset.id);
    }
  }, [currentDataset?.id]);

  const loadCharts = async (id: number) => {
    setLoading(true);
    try {
      const data = await api.getVisualizations(id);
      setCharts(data.charts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!currentDataset) {
    return (
      <div className="glass-panel p-8 text-center text-xs text-slate-500">
        Please select or upload a dataset to render automated visualizations.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-xs font-medium text-slate-500">Selecting and rendering optimal intelligent visualizations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-blue-500" />
            <span>Intelligent Visualization Engine</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Auto-selected charts dynamically matched to temporal, categorical, and continuous data features
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 px-3.5 py-1.5 text-xs text-blue-700 dark:text-blue-300">
          <Sparkles className="h-3.5 w-3.5 text-blue-500" />
          <span>{charts.length} automated chart models generated</span>
        </div>
      </div>

      {/* Grid of Interactive Charts */}
      {charts.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {charts.map((c) => (
            <UniversalChart
              key={c.id}
              id={c.id}
              title={c.title}
              chartType={c.chart_type}
              data={c.data}
              xAxisKey={c.x_axis}
              yAxisKey={c.y_axis}
              description={c.description}
              height={320}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 text-center text-xs text-slate-500">
          No automated chart candidates could be selected for this dataset structure.
        </div>
      )}
    </div>
  );
}
