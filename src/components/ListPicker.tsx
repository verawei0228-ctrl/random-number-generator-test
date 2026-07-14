/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Clipboard, ArrowUpDown, Trash2, ListFilter } from 'lucide-react';
import { generateRandomNumber, getFormattedTime } from '../utils';
import { HistoryItem } from '../types';

interface ListPickerProps {
  useSecure: boolean;
  onAddHistory: (item: HistoryItem) => void;
}

const DEFAULT_ITEMS = "Alice\nBob\nCharlie\nDiana\nEthan\nFiona\nGeorge";

export default function ListPicker({ useSecure, onAddHistory }: ListPickerProps) {
  const [rawText, setRawText] = useState<string>(DEFAULT_ITEMS);
  const [drawCount, setDrawCount] = useState<number>(1);
  const [allowDuplicates, setAllowDuplicates] = useState<boolean>(false);
  const [winners, setWinners] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [rollingValue, setRollingValue] = useState<string>('');

  // Extract non-empty lines
  const getItems = (): string[] => {
    return rawText
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  const handleDraw = () => {
    const items = getItems();
    if (items.length === 0) {
      alert("Please enter at least one item/name to draw from.");
      return;
    }
    if (drawCount <= 0) {
      alert("Count to draw must be greater than zero.");
      return;
    }
    if (!allowDuplicates && items.length < drawCount) {
      alert(`Cannot draw ${drawCount} unique items because you only entered ${items.length} items. Increase inputs or allow duplicates.`);
      return;
    }

    setIsDrawing(true);
    let duration = 700; // ms
    let intervalTime = 50; // ms
    let elapsed = 0;

    const timer = setInterval(() => {
      // Pick a random line to display as rolling feedback
      const randIdx = generateRandomNumber(0, items.length - 1, 0, false);
      setRollingValue(items[randIdx]);
      elapsed += intervalTime;

      if (elapsed >= duration) {
        clearInterval(timer);
        const selectedWinners: string[] = [];

        if (allowDuplicates) {
          for (let i = 0; i < drawCount; i++) {
            const randIdx = generateRandomNumber(0, items.length - 1, 0, useSecure);
            selectedWinners.push(items[randIdx]);
          }
        } else {
          // Draw unique items by shuffling or selecting and removing
          const pool = [...items];
          for (let i = 0; i < drawCount; i++) {
            const randIdx = generateRandomNumber(0, pool.length - 1, 0, useSecure);
            selectedWinners.push(pool[randIdx]);
            pool.splice(randIdx, 1);
          }
        }

        setWinners(selectedWinners);
        setIsDrawing(false);

        // Add to history
        const id = Math.random().toString(36).substr(2, 9);
        const paramStr = `Draw: ${drawCount} from ${items.length} items, Duplicates: ${allowDuplicates ? 'Yes' : 'No'}`;
        const resultText = selectedWinners.join(', ');
        
        const newHistory: HistoryItem = {
          id,
          timestamp: getFormattedTime(),
          type: 'list',
          title: `Drew ${drawCount} item(s)`,
          parameters: paramStr,
          result: resultText,
        };
        onAddHistory(newHistory);
      }
    }, intervalTime);
  };

  const handleShuffle = () => {
    const items = getItems();
    if (items.length <= 1) return;
    
    // Fisher-Yates Shuffle
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = generateRandomNumber(0, i, 0, useSecure);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setRawText(shuffled.join('\n'));
  };

  const clearAll = () => {
    setRawText('');
    setWinners([]);
  };

  const itemsCount = getItems().length;

  return (
    <div className="space-y-6" id="list-picker-container">
      {/* Selection screen display */}
      <div 
        className="relative flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 min-h-[200px] transition-all overflow-hidden"
        id="list-result-screen"
      >
        <div className="absolute top-3 left-3 text-xs font-mono text-gray-400 uppercase tracking-widest">
          Draw Outcome
        </div>

        <AnimatePresence mode="wait">
          {isDrawing ? (
            <motion.div
              key="rolling"
              initial={{ scale: 0.9, opacity: 0.5 }}
              animate={{ scale: 1.05, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0.5 }}
              className="text-2xl md:text-3xl font-bold font-mono tracking-tight text-gray-600 dark:text-zinc-400 text-center truncate max-w-full px-4"
              id="list-rolling-display"
            >
              🎲 {rollingValue}
            </motion.div>
          ) : winners.length > 0 ? (
            <motion.div
              key="winners"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center w-full space-y-4"
              id="list-winners-display"
            >
              <div className="text-center">
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-100 dark:border-emerald-900/40">
                  🎉 Winner selected
                </span>
              </div>
              <div className="flex flex-wrap justify-center gap-3 w-full py-2" id="list-winners-list">
                {winners.map((winner, idx) => (
                  <motion.div
                    key={`${winner}-${idx}`}
                    initial={{ scale: 0, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: idx * 0.05 }}
                    className="px-5 py-2.5 bg-white dark:bg-zinc-800 border-2 border-gray-950 dark:border-white rounded-xl shadow-xs text-base font-bold text-gray-950 dark:text-white"
                  >
                    {winner}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-400 dark:text-zinc-500 max-w-xs"
              id="list-placeholder"
            >
              <Sparkles className="mx-auto mb-2 text-gray-300 dark:text-zinc-700" size={32} />
              <p className="text-sm font-medium">Draw random items from your list</p>
              <p className="text-xs mt-1 text-gray-400">Add names in the input box below</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Inputs Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="list-picker-layout">
        {/* Text Area for Names */}
        <div className="md:col-span-2 flex flex-col space-y-1.5" id="list-items-textbox">
          <div className="flex items-center justify-between">
            <label htmlFor="list-textarea" className="text-xs font-semibold text-gray-600 dark:text-zinc-400 flex items-center gap-1">
              <ListFilter size={14} />
              <span>Items / Names List (one per line)</span>
            </label>
            <span className="text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">
              {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <textarea
            id="list-textarea"
            rows={5}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Type items here, one per line..."
            className="w-full p-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-shadow text-gray-900 dark:text-white font-mono"
          />
          <div className="flex gap-2 justify-end" id="list-text-actions">
            <button
              onClick={handleShuffle}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-gray-600 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white font-medium bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg border border-gray-200 dark:border-zinc-700 cursor-pointer"
              id="btn-shuffle-list"
              title="Shuffle item lines randomly"
            >
              <ArrowUpDown size={12} />
              <span>Shuffle Lines</span>
            </button>
            <button
              onClick={clearAll}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-red-500 hover:text-red-600 font-medium bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 rounded-lg border border-red-200/50 dark:border-red-900/40 cursor-pointer"
              id="btn-clear-list"
            >
              <Trash2 size={12} />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Draw Controls */}
        <div className="flex flex-col justify-between space-y-4" id="list-picker-draw-controls">
          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="draw-count" className="text-xs font-semibold text-gray-600 dark:text-zinc-400">
                Number of Items to Draw
              </label>
              <input
                id="draw-count"
                type="number"
                min={1}
                value={drawCount}
                onChange={(e) => setDrawCount(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-shadow text-gray-900 dark:text-white font-mono"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-900/50 rounded-xl border border-gray-100 dark:border-zinc-800">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-800 dark:text-zinc-200">Allow Duplicates</span>
                <span className="text-[9px] text-gray-400">Can pick same item twice</span>
              </div>
              <button
                onClick={() => setAllowDuplicates(!allowDuplicates)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  allowDuplicates ? 'bg-gray-900 dark:bg-white' : 'bg-gray-200 dark:bg-zinc-700'
                }`}
                id="toggle-list-duplicates"
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-zinc-950 shadow-sm ring-0 transition duration-200 ease-in-out ${
                    allowDuplicates ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <button
            onClick={handleDraw}
            disabled={isDrawing}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gray-950 dark:bg-white text-white dark:text-gray-950 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-xl font-semibold text-sm transition-all shadow-xs cursor-pointer active:scale-[0.98] disabled:opacity-50"
            id="btn-list-draw-action"
          >
            <Clipboard size={16} />
            {isDrawing ? "Drawing..." : `Draw ${drawCount} item(s)`}
          </button>
        </div>
      </div>
    </div>
  );
}
