/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Copy, Check, Clock, ListFilter, Hash, Dices, Coins, Clipboard } from 'lucide-react';
import { HistoryItem, GeneratorType } from '../types';

interface HistoryPanelProps {
  history: HistoryItem[];
  onClearHistory: () => void;
}

export default function HistoryPanel({ history, onClearHistory }: HistoryPanelProps) {
  const [filter, setFilter] = useState<GeneratorType | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyResult = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getIcon = (type: GeneratorType) => {
    switch (type) {
      case 'single':
        return <Hash size={14} className="text-blue-500" />;
      case 'batch':
        return <Hash size={14} className="text-violet-500" />;
      case 'dice':
        return <Dices size={14} className="text-amber-500" />;
      case 'coin':
        return <Coins size={14} className="text-amber-600" />;
      case 'list':
        return <Clipboard size={14} className="text-teal-500" />;
    }
  };

  const filteredHistory = history.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  return (
    <div className="flex flex-col h-full space-y-4" id="history-panel-container">
      {/* Header */}
      <div className="flex items-center justify-between" id="history-header">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Clock size={16} className="text-gray-400" />
          <span>Generation Log</span>
        </h3>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-500 hover:text-red-600 font-semibold bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 border border-red-200/50 dark:border-red-900/40 rounded-lg cursor-pointer transition-colors"
            id="btn-clear-history"
          >
            <Trash2 size={12} />
            <span>Clear Log</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 items-center bg-gray-100/70 dark:bg-zinc-800/60 border border-gray-200/50 dark:border-zinc-700/60 p-1 rounded-xl" id="history-filters">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
            filter === 'all'
              ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-xs'
              : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
          }`}
          id="filter-all"
        >
          All ({history.length})
        </button>
        <button
          onClick={() => setFilter('single')}
          className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
            filter === 'single'
              ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-xs'
              : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
          }`}
          id="filter-single"
        >
          Single
        </button>
        <button
          onClick={() => setFilter('batch')}
          className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
            filter === 'batch'
              ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-xs'
              : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
          }`}
          id="filter-batch"
        >
          Batch
        </button>
        <button
          onClick={() => setFilter('dice')}
          className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
            filter === 'dice'
              ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-xs'
              : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
          }`}
          id="filter-dice"
        >
          Dice
        </button>
        <button
          onClick={() => setFilter('coin')}
          className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
            filter === 'coin'
              ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-xs'
              : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
          }`}
          id="filter-coin"
        >
          Coin
        </button>
        <button
          onClick={() => setFilter('list')}
          className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
            filter === 'list'
              ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-xs'
              : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
          }`}
          id="filter-list"
        >
          Draw
        </button>
      </div>

      {/* History log scroll container */}
      <div 
        className="flex-1 min-h-[250px] max-h-[500px] md:max-h-none overflow-y-auto pr-1 space-y-2.5 scrollbar-thin"
        id="history-scroll-list"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15, delay: Math.min(idx * 0.03, 0.3) }}
                className="bg-white dark:bg-zinc-800/80 border border-gray-150 dark:border-zinc-700/60 p-3.5 rounded-xl flex items-start justify-between gap-3 shadow-2xs hover:border-gray-200 dark:hover:border-zinc-700 transition-colors"
                id={`history-item-${item.id}`}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold font-sans tracking-wide uppercase text-gray-400">
                    {getIcon(item.type)}
                    <span>{item.title}</span>
                    <span>•</span>
                    <span className="font-mono">{item.timestamp}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-zinc-400 font-medium font-sans">
                    {item.parameters}
                  </div>
                  <div className="text-sm font-black font-mono text-gray-900 dark:text-white break-all pt-1">
                    {item.result}
                  </div>
                </div>

                <button
                  onClick={() => copyResult(item.result, item.id)}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer transition-colors shadow-2xs"
                  id={`btn-copy-${item.id}`}
                  title="Copy result"
                >
                  {copiedId === item.id ? (
                    <Check size={14} className="text-emerald-600" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full min-h-[220px] flex flex-col items-center justify-center text-center text-gray-400 dark:text-zinc-500 p-6 border border-dashed border-gray-200 dark:border-zinc-800 rounded-xl"
              id="history-empty-state"
            >
              <ListFilter size={28} className="text-gray-300 dark:text-zinc-700 mb-2" />
              <p className="text-xs font-semibold">No records found</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Roll, flip, or generate values to log history</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
