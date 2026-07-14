/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Download, RefreshCw, FileText, Check } from 'lucide-react';
import { generateRandomBatch, getFormattedTime } from '../utils';
import { HistoryItem } from '../types';

interface BatchGeneratorProps {
  useSecure: boolean;
  onAddHistory: (item: HistoryItem) => void;
}

export default function BatchGenerator({ useSecure, onAddHistory }: BatchGeneratorProps) {
  const [min, setMin] = useState<number>(1);
  const [max, setMax] = useState<number>(100);
  const [count, setCount] = useState<number>(10);
  const [decimals, setDecimals] = useState<number>(0);
  const [allowDuplicates, setAllowDuplicates] = useState<boolean>(true);
  const [sorted, setSorted] = useState<'none' | 'asc' | 'desc'>('none');
  const [results, setResults] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerate = () => {
    if (min >= max) {
      alert("Minimum value must be strictly less than maximum value.");
      return;
    }
    if (count <= 0) {
      alert("Count must be greater than zero.");
      return;
    }
    if (!allowDuplicates && decimals === 0 && (max - min + 1) < count) {
      alert(`Cannot generate ${count} unique integers between ${min} and ${max}. Increase range or allow duplicates.`);
      return;
    }

    setIsGenerating(true);
    setCopied(false);

    // Minor delay for nice UX feel
    setTimeout(() => {
      let batch = generateRandomBatch(min, max, count, allowDuplicates, decimals, useSecure);

      if (sorted === 'asc') {
        batch = [...batch].sort((a, b) => a - b);
      } else if (sorted === 'desc') {
        batch = [...batch].sort((a, b) => b - a);
      }

      setResults(batch);
      setIsGenerating(false);

      // Add to history
      const id = Math.random().toString(36).substr(2, 9);
      const paramStr = `Count: ${count}, Range: [${min}, ${max}], Decimals: ${decimals}, Duplicates: ${allowDuplicates ? 'Yes' : 'No'}${useSecure ? ' (Secure)' : ''}`;
      const preview = batch.length > 5 
        ? `${batch.slice(0, 5).join(', ')}... (+${batch.length - 5} more)`
        : batch.join(', ');
        
      const newHistory: HistoryItem = {
        id,
        timestamp: getFormattedTime(),
        type: 'batch',
        title: `Batch of ${batch.length}`,
        parameters: paramStr,
        result: preview,
      };
      onAddHistory(newHistory);
    }, 400);
  };

  const copyToClipboard = () => {
    if (results.length === 0) return;
    navigator.clipboard.writeText(results.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsTXT = () => {
    if (results.length === 0) return;
    const content = results.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `random_numbers_${getFormattedTime().replace(/:/g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" id="batch-generator-container">
      {/* Configuration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" id="batch-config-grid">
        <div className="flex flex-col space-y-1.5">
          <label htmlFor="batch-min" className="text-xs font-semibold text-gray-600 dark:text-zinc-400">
            Min Value
          </label>
          <input
            id="batch-min"
            type="number"
            value={min}
            onChange={(e) => setMin(Number(e.target.value))}
            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-shadow text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <label htmlFor="batch-max" className="text-xs font-semibold text-gray-600 dark:text-zinc-400">
            Max Value
          </label>
          <input
            id="batch-max"
            type="number"
            value={max}
            onChange={(e) => setMax(Number(e.target.value))}
            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-shadow text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <label htmlFor="batch-count" className="text-xs font-semibold text-gray-600 dark:text-zinc-400">
            Count (Quantity)
          </label>
          <input
            id="batch-count"
            type="number"
            min={1}
            max={5000}
            value={count}
            onChange={(e) => setCount(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-shadow text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <label htmlFor="batch-decimals" className="text-xs font-semibold text-gray-600 dark:text-zinc-400">
            Decimals
          </label>
          <select
            id="batch-decimals"
            value={decimals}
            onChange={(e) => setDecimals(Number(e.target.value))}
            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-shadow text-gray-900 dark:text-white"
          >
            <option value={0}>0 (Integers)</option>
            <option value={1}>1 decimal (0.0)</option>
            <option value={2}>2 decimals (0.00)</option>
            <option value={3}>3 decimals (0.000)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="batch-options-row">
        {/* Toggle Option */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-900/50 rounded-xl border border-gray-100 dark:border-zinc-800" id="batch-duplicate-card">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-800 dark:text-zinc-200">Allow Duplicates</span>
            <span className="text-[10px] text-gray-500">Same numbers can be generated multiple times</span>
          </div>
          <button
            onClick={() => setAllowDuplicates(!allowDuplicates)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              allowDuplicates ? 'bg-gray-900 dark:bg-white' : 'bg-gray-200 dark:bg-zinc-700'
            }`}
            id="toggle-batch-duplicates"
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-zinc-950 shadow-sm ring-0 transition duration-200 ease-in-out ${
                allowDuplicates ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Sorting option */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-900/50 rounded-xl border border-gray-100 dark:border-zinc-800" id="batch-sort-card">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-800 dark:text-zinc-200">Sort Order</span>
            <span className="text-[10px] text-gray-500">Sort the batch after generating</span>
          </div>
          <div className="flex bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-0.5 shadow-xs" id="sorting-button-group">
            <button
              onClick={() => setSorted('none')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                sorted === 'none' 
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-950' 
                  : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              id="sort-btn-none"
            >
              None
            </button>
            <button
              onClick={() => setSorted('asc')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                sorted === 'asc' 
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-950' 
                  : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              id="sort-btn-asc"
            >
              Asc
            </button>
            <button
              onClick={() => setSorted('desc')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                sorted === 'desc' 
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-950' 
                  : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              id="sort-btn-desc"
            >
              Desc
            </button>
          </div>
        </div>
      </div>

      {/* Main Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gray-950 dark:bg-white text-white dark:text-gray-950 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-xl font-semibold text-sm transition-all shadow-xs cursor-pointer active:scale-[0.98] disabled:opacity-50"
        id="btn-generate-batch"
      >
        <RefreshCw size={16} className={isGenerating ? "animate-spin" : ""} />
        {isGenerating ? "Generating Batch..." : `Generate ${count} Numbers`}
      </button>

      {/* Result Display Container */}
      {results.length > 0 && (
        <div className="border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/40 rounded-xl p-5 space-y-4" id="batch-results-panel">
          <div className="flex items-center justify-between" id="batch-results-header">
            <div className="text-xs font-mono text-gray-400 uppercase tracking-widest">
              Generated Batch ({results.length} items)
            </div>
            
            <div className="flex gap-2" id="batch-action-buttons">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 rounded-lg font-medium shadow-xs transition-colors cursor-pointer"
                id="btn-batch-copy"
                title="Copy all numbers"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
              <button
                onClick={downloadAsTXT}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 rounded-lg font-medium shadow-xs transition-colors cursor-pointer"
                id="btn-batch-download"
                title="Download as TXT file"
              >
                <Download size={14} />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Render standard scrollable grid tags */}
          <div 
            className="max-h-[220px] overflow-y-auto overflow-x-hidden p-3 bg-white dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800 rounded-xl scrollbar-thin flex flex-wrap gap-2"
            id="batch-tags-grid"
          >
            {results.map((num, idx) => (
              <motion.span
                key={`${num}-${idx}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.15, delay: Math.min(idx * 0.005, 0.4) }}
                className="px-2.5 py-1 text-xs font-semibold font-mono bg-gray-50 dark:bg-zinc-800/80 text-gray-800 dark:text-zinc-200 border border-gray-200/50 dark:border-zinc-700/60 rounded-md shadow-2xs hover:bg-gray-100 hover:border-gray-300 transition-all"
              >
                {num.toFixed(decimals)}
              </motion.span>
            ))}
          </div>
          
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500" id="batch-stats-indicator">
            <FileText size={12} />
            <span>Format: Comma-separated tags. Click copy or download to use in your other programs.</span>
          </div>
        </div>
      )}
    </div>
  );
}
