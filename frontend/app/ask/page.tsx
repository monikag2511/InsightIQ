'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  MessageSquareCode,
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  PlusCircle,
  Table as TableIcon,
  TrendingUp,
  Loader2,
  HelpCircle,
  CheckCircle2,
  Info,
  Clock,
  Database,
  ArrowLeft,
  ChevronRight,
  UploadCloud,
  FileSpreadsheet,
  BarChart3,
  Calendar,
  Layers,
  ShieldCheck,
  Hash
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useDataset } from '@/context/DatasetContext';
import { api } from '@/services/api';
import { ConversationHistory } from '@/types';
import UniversalChart from '@/components/Charts/UniversalChart';

const SUGGESTED_QUESTIONS = [
  'What is the average revenue?',
  'Which category has the highest sales?',
  'Show the top 10 customers.',
  'Which month had the highest sales?',
  'What are the strongest correlations?',
  'Are there any unusual values?',
  'Summarize this dataset.',
  'Show customers with revenue greater than 50000.',
  'Which region performs best?',
  'What percentage of sales comes from the top 10 products?'
];

interface ChatMessage {
  id: string | number;
  role: 'user' | 'assistant';
  content: string;
  response_type?: string;
  payload?: any;
  mode?: string;
  created_at?: string;
}

export default function AskYourDataDedicatedPage() {
  const { currentDataset, datasets, selectDataset, setUploadModalOpen } = useDataset();
  const [profile, setProfile] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<ConversationHistory[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | undefined>(undefined);
  const [aiStatus, setAiStatus] = useState<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getAiStatus().then(setAiStatus).catch(() => {});
  }, []);

  useEffect(() => {
    if (currentDataset?.id) {
      loadHistory(currentDataset.id);
      api.getProfile(currentDataset.id).then(setProfile).catch(() => {});
    }
  }, [currentDataset?.id]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadHistory = async (datasetId: number) => {
    try {
      const hist = await api.getConversations(datasetId);
      setConversations(hist);
      if (hist.length > 0) {
        const latest = hist[0];
        setActiveConvId(latest.id);
        const parsedMsgs: ChatMessage[] = latest.messages.map((m: any) => {
          let payload = null;
          if (m.payload_json) {
            try { payload = JSON.parse(m.payload_json); } catch {}
          }
          return {
            id: m.id,
            role: m.role,
            content: m.content,
            response_type: m.response_type,
            payload,
            mode: payload?.mode,
            created_at: m.created_at,
          };
        });
        setMessages(parsedMsgs);
      } else {
        setMessages([]);
        setActiveConvId(undefined);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const question = (textToSend || inputText).trim();
    if (!question || !currentDataset || loading) return;

    setInputText('');

    const tempUserMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: question,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await api.askQuestion(currentDataset.id, question, activeConvId);

      const asstMsg: ChatMessage = {
        id: res.message_id || Date.now() + 1,
        role: 'assistant',
        content: res.answer,
        response_type: res.response_type,
        payload: {
          kpi: res.kpi,
          table: res.table,
          chart: res.chart,
          executed_intent: res.executed_intent,
          provider: res.provider,
          model: res.model,
          ai_error: res.ai_error,
          disclaimer: res.disclaimer
        },
        mode: res.mode,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, asstMsg]);
      if (res.conversation_id && res.conversation_id !== activeConvId) {
        setActiveConvId(res.conversation_id);
      }
      loadHistory(currentDataset.id);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: Date.now() + 2,
        role: 'assistant',
        content: `Error computing answer: ${err.message || 'Dataset query failed.'}`,
        response_type: 'text'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!currentDataset) return;
    if (confirm('Clear all conversation history for this dataset?')) {
      try {
        await api.clearConversations(currentDataset.id);
        setMessages([]);
        setConversations([]);
        setActiveConvId(undefined);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleNewAnalysis = () => {
    setActiveConvId(undefined);
    setMessages([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col">
        {/* Top Breadcrumb & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquareCode className="h-4 w-4 text-blue-500" />
              <span>Ask Your Data</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNewAnalysis}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <PlusCircle className="h-3.5 w-3.5 text-blue-500" />
              <span>New Analysis</span>
            </button>
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear Chat</span>
              </button>
            )}
          </div>
        </div>

        {/* 2-COLUMN LAYOUT: Left = Dataset Info, Right = AI Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch">
          {/* LEFT SIDE: Dataset Information (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Active Dataset Summary Card */}
            <div className="glass-panel p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-500" />
                  <h2 className="font-semibold text-sm text-slate-900 dark:text-white">Dataset Profile</h2>
                </div>
                <span className="rounded-md bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 text-[10px] font-mono text-blue-700 dark:text-blue-300 uppercase">
                  {currentDataset?.file_type || 'CSV'}
                </span>
              </div>

              {currentDataset ? (
                <>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                      {currentDataset.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{currentDataset.file_name}</p>
                  </div>

                  {/* KPI Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-2.5">
                      <div className="text-[10px] text-slate-400 font-medium">Total Rows</div>
                      <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {currentDataset.row_count?.toLocaleString() || 0}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-2.5">
                      <div className="text-[10px] text-slate-400 font-medium">Dimensions</div>
                      <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {currentDataset.column_count || 0} Cols
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-2.5">
                      <div className="text-[10px] text-slate-400 font-medium">Quality Score</div>
                      <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {profile?.quality_score ?? 94}%
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-2.5">
                      <div className="text-[10px] text-slate-400 font-medium">Missing Cells</div>
                      <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {profile?.missing_values ?? 0}
                      </div>
                    </div>
                  </div>

                  {/* Column Types Breakdown */}
                  {profile && (
                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Column Breakdown
                      </div>
                      <div className="flex flex-wrap gap-1.5 text-[11px]">
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60">
                          <Hash className="h-3 w-3" /> {profile.numerical_columns?.length || 0} Numerical
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-900/60">
                          <Layers className="h-3 w-3" /> {profile.categorical_columns?.length || 0} Categorical
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">
                          <Calendar className="h-3 w-3" /> {profile.date_columns?.length || 0} Date
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Column Tags Preview */}
                  {profile?.columns && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Available Columns
                      </div>
                      <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto">
                        {Object.keys(profile.columns).map((col) => (
                          <span
                            key={col}
                            onClick={() => handleSendMessage(`Analyze ${col}`)}
                            className="inline-block rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-300 transition"
                            title="Click to query this column"
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6">
                  <Database className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 mb-3">No dataset currently active</p>
                  <button
                    onClick={() => setUploadModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
                  >
                    <UploadCloud className="h-3.5 w-3.5" />
                    <span>Upload Dataset</span>
                  </button>
                </div>
              )}
            </div>

            {/* Conversation History Card */}
            <div className="glass-panel p-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Recent Conversations</span>
                </div>
                <span className="text-[10px] text-slate-400">{conversations.length} sessions</span>
              </div>

              <div className="space-y-1 overflow-y-auto max-h-48 flex-1">
                {conversations.length > 0 ? (
                  conversations.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setActiveConvId(c.id);
                        const parsed: ChatMessage[] = c.messages.map((m: any) => {
                          let payload = null;
                          if (m.payload_json) {
                            try { payload = JSON.parse(m.payload_json); } catch {}
                          }
                          return {
                            id: m.id,
                            role: m.role,
                            content: m.content,
                            response_type: m.response_type,
                            payload,
                            created_at: m.created_at,
                          };
                        });
                        setMessages(parsed);
                      }}
                      className={`w-full text-left rounded-lg p-2 text-xs transition flex items-center justify-between ${
                        activeConvId === c.id
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-medium'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate max-w-[190px]">{c.title}</span>
                      <span className="text-[10px] text-slate-400">{c.messages.length} msgs</span>
                    </button>
                  ))
                ) : (
                  <div className="text-[11px] text-slate-400 py-3 text-center">
                    No previous chats for this dataset.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Dedicated AI Chat Interface (8 Cols) */}
          <div className="lg:col-span-8 glass-panel p-4 md:p-6 flex flex-col justify-between h-[calc(100vh-10rem)] min-h-[580px]">
            {/* Top Bar with AI engine status */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Analytical Chat & AI Synthesizer
                </span>
              </div>
              <div>
                {aiStatus?.is_valid && aiStatus?.provider === 'groq' ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 px-3 py-1 text-[11px] font-medium text-cyan-700 dark:text-cyan-300">
                    <Sparkles className="h-3 w-3 text-cyan-500 animate-pulse" />
                    <span>Groq AI Active ({aiStatus.model || 'openai/gpt-oss-120b'})</span>
                  </span>
                ) : aiStatus?.configured && !aiStatus?.is_valid ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-3 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-300" title={aiStatus?.status}>
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span>Groq Key Error (Fallback Mode)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 px-2.5 py-1 text-[11px] font-medium text-blue-700 dark:text-blue-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Controlled Pandas Engine
                  </span>
                )}
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <div className="max-w-md">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                      Ask anything about your data
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Questions are executed deterministically using Pandas on your dataset. Select an example prompt below or type your own question.
                    </p>
                  </div>

                  {/* Suggested Question Pills */}
                  <div className="w-full max-w-xl text-left">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Suggested Questions
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {SUGGESTED_QUESTIONS.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(q)}
                          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-2.5 text-xs text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 text-left transition flex items-center justify-between group shadow-2xs"
                        >
                          <span className="truncate pr-1">{q}</span>
                          <Send className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-3 text-xs ${
                      m.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {m.role === 'assistant' && (
                      <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl p-4 shadow-xs ${
                        m.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-xs'
                          : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-bl-xs'
                      }`}
                    >
                      {/* Mode / Fallback Indicator */}
                      {m.role === 'assistant' && (
                        <div className="flex items-center justify-between text-[10px] pb-1.5 mb-2.5 border-b border-slate-100 dark:border-slate-800">
                          {m.mode?.startsWith('ai_') ? (
                            <span className="text-cyan-600 dark:text-cyan-400 font-semibold flex items-center gap-1.5">
                              <Sparkles className="h-3 w-3 text-cyan-500" />
                              <span>AI Explanation ({m.payload?.provider ? m.payload.provider.toUpperCase() : 'GROQ'} • {m.payload?.model || 'openai/gpt-oss-120b'})</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              <span>Ask Your Data built-in analysis engine</span>
                            </span>
                          )}
                          {m.payload?.ai_error && (
                            <span className="text-[9px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/60" title={m.payload.ai_error}>
                              ⚠️ AI Fallback
                            </span>
                          )}
                        </div>
                      )}

                      {/* Main Text Content */}
                      <div className="text-xs leading-relaxed whitespace-pre-wrap font-normal">
                        {m.content}
                      </div>

                      {/* KPI Card if computed */}
                      {m.payload?.kpi && (
                        <div className="mt-3 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/70 dark:bg-blue-950/30 p-3">
                          <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                            {m.payload.kpi.label}
                          </span>
                          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                            {m.payload.kpi.value}
                          </div>
                          {m.payload.kpi.subtitle && (
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              {m.payload.kpi.subtitle}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Table if computed */}
                      {m.payload?.table && m.payload.table.rows && m.payload.table.rows.length > 0 && (
                        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 max-h-56">
                          <table className="w-full text-[11px] text-left">
                            <thead className="bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 sticky top-0">
                              <tr>
                                {m.payload.table.columns.map((col: string) => (
                                  <th key={col} className="p-2 border-b border-slate-200 dark:border-slate-700">
                                    {col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {m.payload.table.rows.map((row: any, rIdx: number) => (
                                <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                  {m.payload.table.columns.map((col: string) => (
                                    <td key={col} className="p-2 font-mono text-[10px] text-slate-600 dark:text-slate-300">
                                      {String(row[col] ?? '—')}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Chart if computed */}
                      {m.payload?.chart && m.payload.chart.data && (
                        <div className="mt-4 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                          <UniversalChart
                            title={m.payload.chart.title || 'Analysis Visualization'}
                            chartType={m.payload.chart.chart_type || 'bar'}
                            data={m.payload.chart.data}
                            xAxisKey={m.payload.chart.x_key || 'name'}
                            yAxisKey={m.payload.chart.y_keys || 'value'}
                            height={260}
                          />
                        </div>
                      )}

                      {/* Meta Footer */}
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                        <span>
                          {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                        {m.role === 'assistant' && (
                          <span className="font-mono text-[9px] text-emerald-600 dark:text-emerald-400">
                            Source: Dataset Ground Truth
                          </span>
                        )}
                      </div>
                    </div>

                    {m.role === 'user' && (
                      <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))
              )}

              {loading && (
                <div className="flex gap-3 text-xs justify-start items-center">
                  <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 flex items-center gap-2 text-slate-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                    <span>Executing computation on dataset...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar with Suggested Questions Pills on top when active */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              {messages.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                  <span className="text-[10px] text-slate-400 shrink-0 font-medium">Quick:</span>
                  {SUGGESTED_QUESTIONS.slice(0, 5).map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className="rounded-full border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition shrink-0 whitespace-nowrap"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask anything about your data…"
                  disabled={!currentDataset || loading}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition shadow-2xs"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!currentDataset || !inputText.trim() || loading}
                  className="rounded-xl bg-blue-600 p-3 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0 cursor-pointer"
                  aria-label="Send query"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                <span>Press Enter to send. Shift + Enter for new line.</span>
                <span className="font-mono">Controlled Pandas Calculation Engine</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
