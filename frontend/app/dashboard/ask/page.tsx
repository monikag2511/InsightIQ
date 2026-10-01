'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Clock
} from 'lucide-react';
import { useDataset } from '@/context/DatasetContext';
import { api } from '@/services/api';
import { AskResponse, ConversationHistory } from '@/types';
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

export default function AskYourDataPage() {
  const { currentDataset } = useDataset();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<ConversationHistory[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | undefined>(undefined);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentDataset?.id) {
      loadHistory(currentDataset.id);
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
        // Load latest conversation messages
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
    if (!question || !currentDataset) return;

    setInputText('');

    // Add user message optimistically
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res: AskResponse = await api.askQuestion(currentDataset.id, question, activeConvId);
      setActiveConvId(res.conversation_id);

      const asstMsg: ChatMessage = {
        id: res.message_id || `asst-${Date.now()}`,
        role: 'assistant',
        content: res.answer,
        response_type: res.response_type,
        payload: {
          kpi: res.kpi,
          table: res.table,
          chart: res.chart,
          executed_intent: res.executed_intent,
        },
        mode: res.mode,
      };

      setMessages((prev) => [...prev, asstMsg]);
      // Refresh history list sidebar
      api.getConversations(currentDataset.id).then(setConversations).catch(() => {});
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${err.message || 'Failed to process inquiry.'}`,
        response_type: 'text',
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setActiveConvId(undefined);
    setMessages([]);
  };

  const handleClearHistory = async () => {
    if (!currentDataset) return;
    try {
      await api.clearConversations(currentDataset.id);
      setConversations([]);
      setMessages([]);
      setActiveConvId(undefined);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectConv = (conv: ConversationHistory) => {
    setActiveConvId(conv.id);
    const parsedMsgs: ChatMessage[] = conv.messages.map((m: any) => {
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
  };

  if (!currentDataset) {
    return (
      <div className="glass-panel p-8 text-center text-xs text-slate-500">
        Please select or upload a dataset to start asking questions.
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8.5rem)] min-h-[600px]">
      {/* LEFT: Recent Questions & Conversations History */}
      <div className="w-full lg:w-64 shrink-0 flex flex-col glass-panel p-4 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <Clock className="h-4 w-4 text-blue-500" />
            <span>Recent Questions</span>
          </div>
          <button
            onClick={handleNewChat}
            title="Start new conversation"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <PlusCircle className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 py-3">
          {conversations.length > 0 ? (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelectConv(c)}
                className={`w-full text-left p-2.5 rounded-xl text-xs transition ${
                  activeConvId === c.id
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-medium'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="truncate font-medium">{c.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {c.messages.length} message(s)
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-[11px] text-slate-400">
              No previous questions saved yet.
            </div>
          )}
        </div>

        {conversations.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* RIGHT: Main Conversational Area */}
      <div className="flex-1 flex flex-col glass-panel overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span>Ask Your Data</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ask questions. Get answers from your data.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 px-2.5 py-1 text-[11px] font-medium text-blue-700 dark:text-blue-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Controlled Pandas Engine
            </span>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-lg mx-auto">
              <div className="h-12 w-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-3">
                <MessageSquareCode className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                What would you like to uncover?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
                Calculates exact ground truth numbers from your dataset using safe, deterministic analysis.
              </p>

              {/* Suggested Questions Chips */}
              <div className="w-full text-left">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  Suggested Questions
                </span>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(q)}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-800/50 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 text-left transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'glass-panel border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-tl-none'
                  }`}
                >
                  {/* Mode / Fallback Indicator */}
                  {msg.role === 'assistant' && msg.mode && (
                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
                      <Sparkles className="h-3 w-3 text-cyan-500" />
                      <span>
                        {msg.mode === 'ai_llm'
                          ? 'AI Mode active'
                          : 'Ask Your Data built-in analysis engine'}
                      </span>
                    </div>
                  )}

                  {/* Text Content */}
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Dynamic KPI Card Render */}
                  {msg.payload?.kpi && (
                    <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/30 p-3 text-left">
                      <span className="text-[10px] uppercase font-semibold text-blue-700 dark:text-blue-300">
                        {msg.payload.kpi.label}
                      </span>
                      <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                        {msg.payload.kpi.value}
                      </div>
                      {msg.payload.kpi.subtitle && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {msg.payload.kpi.subtitle}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dynamic Chart Render */}
                  {msg.payload?.chart && (
                    <div className="pt-2">
                      <UniversalChart
                        title={msg.payload.chart.title}
                        chartType={msg.payload.chart.chart_type}
                        data={msg.payload.chart.data}
                        xAxisKey={msg.payload.chart.x_key}
                        yAxisKey={msg.payload.chart.y_keys}
                        height={240}
                      />
                    </div>
                  )}

                  {/* Dynamic Table Render */}
                  {msg.payload?.table && (
                    <div className="pt-2 overflow-x-auto max-h-56">
                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400">
                            {msg.payload.table.columns.map((col: string) => (
                              <th key={col} className="py-1 px-2 font-medium">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {msg.payload.table.rows.map((row: any, rIdx: number) => (
                            <tr key={rIdx}>
                              {msg.payload.table.columns.map((col: string) => (
                                <td key={col} className="py-1.5 px-2 font-mono">
                                  {String(row[col] ?? '—')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 text-xs font-bold">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))
          )}

          {loading && (
            <div className="flex gap-3 items-center">
              <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs">
                <Bot className="h-4 w-4" />
              </div>
              <div className="glass-panel p-3.5 rounded-2xl rounded-tl-none flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span>Interpreting intent & computing ground truth via Pandas...</span>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything about your data…"
              className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-40 transition"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
