'use client';

import React, { useRef } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Download, Info } from 'lucide-react';

interface UniversalChartProps {
  id?: string;
  title: string;
  chartType: string; // 'line', 'bar', 'scatter', 'donut', 'histogram', 'heatmap'
  data: any[];
  xAxisKey?: string;
  yAxisKey?: string | string[];
  description?: string;
  height?: number;
}

const COLORS = ['#2563eb', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

export default function UniversalChart({
  title,
  chartType,
  data,
  xAxisKey = 'name',
  yAxisKey = 'value',
  description,
  height = 300,
}: UniversalChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  // Normalize keys
  const xKey = xAxisKey || 'category' || 'period' || 'name';
  const yKeys = Array.isArray(yAxisKey) ? yAxisKey : [yAxisKey];

  const handleExportPNG = () => {
    if (!chartRef.current || typeof window === 'undefined') return;

    try {
      const svgElement = chartRef.current.querySelector('svg');
      if (!svgElement) {
        window.print();
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const bbox = svgElement.getBoundingClientRect();
      canvas.width = (bbox.width || 600) * 2;
      canvas.height = (bbox.height || 350) * 2;

      img.onload = () => {
        if (!ctx) return;
        ctx.scale(2, 2);
        ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `${title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')}_chart.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch {
      window.print();
    }
  };

  return (
    <div
      ref={chartRef}
      className="glass-panel p-5 relative flex flex-col justify-between overflow-hidden group transition-all hover:shadow-lg"
    >
      {/* Chart Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h4 className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">{title}</h4>
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{description}</p>
          )}
        </div>
        <button
          onClick={handleExportPNG}
          title="Print / Save Chart"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition opacity-80 group-hover:opacity-100"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>

      {/* Chart Body */}
      <div style={{ width: '100%', height }} className="py-2">
        {chartType === 'line' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
              <XAxis dataKey={xKey} stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
              {yKeys.map((k, i) => (
                <Line
                  key={k}
                  type="monotone"
                  dataKey={k}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: COLORS[i % COLORS.length] }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}

        {(chartType === 'bar' || chartType === 'histogram') && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
              <XAxis dataKey={xKey} stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
              {yKeys.map((k, i) => (
                <Bar key={k} dataKey={k} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartType === 'donut' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}

        {chartType === 'scatter' && (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
              <XAxis type="number" dataKey="x" name={xKey} stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis type="number" dataKey="y" name={yKeys[0] || 'y'} stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
              <Scatter name={title} data={data} fill="#2563eb" />
            </ScatterChart>
          </ResponsiveContainer>
        )}

        {chartType === 'heatmap' && (
          <div className="flex flex-col items-center justify-center h-full overflow-x-auto">
            <div className="grid grid-cols-4 gap-2 w-full max-w-sm">
              {data.slice(0, 16).map((item, idx) => {
                const intensity = Math.abs(item.value);
                const bg =
                  item.value > 0
                    ? `rgba(37, 99, 235, ${Math.max(0.15, intensity)})`
                    : `rgba(239, 68, 68, ${Math.max(0.15, intensity)})`;
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center rounded-lg p-2 text-center text-xs border border-slate-200 dark:border-slate-800"
                    style={{ backgroundColor: bg }}
                    title={`${item.y} vs ${item.x}: ${item.value}`}
                  >
                    <span className="font-mono text-[10px] font-bold text-slate-900 dark:text-white">
                      {item.value}
                    </span>
                    <span className="text-[9px] text-slate-700 dark:text-slate-300 truncate w-full">
                      {item.x.substring(0, 6)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
