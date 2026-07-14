/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Coins, TrendingUp } from 'lucide-react';
import { generateRandomNumber, getFormattedTime } from '../utils';
import { HistoryItem, CoinStats } from '../types';

interface CoinFlipperProps {
  useSecure: boolean;
  onAddHistory: (item: HistoryItem) => void;
}

export default function CoinFlipper({ useSecure, onAddHistory }: CoinFlipperProps) {
  const [side, setSide] = useState<'heads' | 'tails' | null>(null);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [stats, setStats] = useState<CoinStats>({ heads: 0, tails: 0, total: 0 });

  const handleFlip = () => {
    setIsFlipping(true);
    
    // Simulate rotating and then settle
    setTimeout(() => {
      const randVal = generateRandomNumber(1, 2, 0, useSecure);
      const landedSide = randVal === 1 ? 'heads' : 'tails';
      
      setSide(landedSide);
      setIsFlipping(false);

      // Update statistics
      setStats((prev) => {
        const nextHeads = landedSide === 'heads' ? prev.heads + 1 : prev.heads;
        const nextTails = landedSide === 'tails' ? prev.tails + 1 : prev.tails;
        return {
          heads: nextHeads,
          tails: nextTails,
          total: prev.total + 1,
        };
      });

      // Add to history
      const id = Math.random().toString(36).substr(2, 9);
      const newHistory: HistoryItem = {
        id,
        timestamp: getFormattedTime(),
        type: 'coin',
        title: 'Coin Flip',
        parameters: useSecure ? 'Secure mode' : 'Standard mode',
        result: landedSide.toUpperCase(),
      };
      onAddHistory(newHistory);
    }, 600);
  };

  const clearStats = () => {
    setStats({ heads: 0, tails: 0, total: 0 });
  };

  const headsPercent = stats.total > 0 ? Math.round((stats.heads / stats.total) * 100) : 0;
  const tailsPercent = stats.total > 0 ? Math.round((stats.tails / stats.total) * 100) : 0;

  return (
    <div className="space-y-6" id="coin-flipper-container">
      {/* Coin Visual Tray */}
      <div 
        className="relative flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 min-h-[220px] transition-all overflow-hidden"
        id="coin-result-screen"
      >
        <div className="absolute top-3 left-3 text-xs font-mono text-gray-400 uppercase tracking-widest">
          Coin Flip Arena
        </div>

        <AnimatePresence mode="wait">
          <div className="relative flex items-center justify-center h-40 w-40" id="coin-wrapper">
            <motion.div
              key={side || 'empty'}
              animate={
                isFlipping
                  ? {
                      rotateY: [0, 180, 360, 540, 720, 900, 1080],
                      scale: [1, 1.2, 1.3, 1.2, 1.1, 1.2, 1],
                      y: [0, -60, -80, -60, -30, -10, 0],
                    }
                  : { rotateY: 0, scale: 1, y: 0 }
              }
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className={`w-32 h-32 rounded-full flex flex-col items-center justify-center cursor-pointer relative shadow-lg select-none border-4 ${
                isFlipping 
                  ? 'bg-amber-100 border-amber-300 dark:bg-zinc-700 dark:border-zinc-500'
                  : side === 'heads'
                  ? 'bg-linear-to-b from-amber-300 to-amber-500 border-amber-200 text-amber-950 shadow-amber-500/20'
                  : side === 'tails'
                  ? 'bg-linear-to-b from-slate-300 to-slate-500 border-slate-200 text-slate-950 shadow-slate-500/20'
                  : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-400'
              }`}
              onClick={!isFlipping ? handleFlip : undefined}
              id="coin-body"
            >
              {!isFlipping && side === 'heads' && (
                <div className="flex flex-col items-center" id="coin-heads-face">
                  <Coins size={36} className="text-amber-900/80 mb-1" />
                  <span className="text-sm font-black font-mono tracking-widest uppercase">Heads</span>
                  <span className="text-[9px] text-amber-900/60 font-medium font-sans">Gold Standard</span>
                </div>
              )}

              {!isFlipping && side === 'tails' && (
                <div className="flex flex-col items-center" id="coin-tails-face">
                  <Coins size={36} className="text-slate-900/80 mb-1" />
                  <span className="text-sm font-black font-mono tracking-widest uppercase">Tails</span>
                  <span className="text-[9px] text-slate-900/60 font-medium font-sans">Silver Standard</span>
                </div>
              )}

              {isFlipping && (
                <div className="flex flex-col items-center" id="coin-flipping-face">
                  <RefreshCw size={32} className="animate-spin text-amber-800 dark:text-zinc-300 mb-1" />
                  <span className="text-xs font-bold font-mono tracking-wide">Flipping...</span>
                </div>
              )}

              {!isFlipping && side === null && (
                <div className="flex flex-col items-center" id="coin-empty-face">
                  <Coins size={36} className="text-gray-300 dark:text-zinc-700 mb-1 animate-bounce" />
                  <span className="text-xs font-semibold text-gray-400 dark:text-zinc-500">Tap to Flip</span>
                </div>
              )}
            </motion.div>
          </div>
        </AnimatePresence>
      </div>

      {/* Statistics dashboard */}
      <div className="border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/40 rounded-xl p-4 space-y-3" id="coin-stats-panel">
        <div className="flex items-center justify-between" id="coin-stats-header">
          <div className="flex items-center gap-1 text-xs font-semibold text-gray-700 dark:text-zinc-300">
            <TrendingUp size={14} />
            <span>Session Flip Stats</span>
          </div>
          {stats.total > 0 && (
            <button
              onClick={clearStats}
              className="text-[10px] font-bold text-red-500 hover:text-red-600 font-mono tracking-wider uppercase cursor-pointer"
              id="btn-clear-coin-stats"
            >
              Reset Session
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2.5 text-center" id="coin-stats-grid">
          <div className="bg-white dark:bg-zinc-800 border border-gray-200/55 dark:border-zinc-700 rounded-lg p-2 shadow-2xs">
            <div className="text-[10px] text-gray-400 font-semibold uppercase font-sans">Total Flips</div>
            <div className="text-lg font-black font-mono text-gray-950 dark:text-white">{stats.total}</div>
          </div>
          <div className="bg-white dark:bg-zinc-800 border border-gray-200/55 dark:border-zinc-700 rounded-lg p-2 shadow-2xs">
            <div className="text-[10px] text-amber-600 font-semibold uppercase font-sans">Heads</div>
            <div className="text-lg font-black font-mono text-amber-600 dark:text-amber-400">{stats.heads} <span className="text-[10px] font-normal text-gray-400">({headsPercent}%)</span></div>
          </div>
          <div className="bg-white dark:bg-zinc-800 border border-gray-200/55 dark:border-zinc-700 rounded-lg p-2 shadow-2xs">
            <div className="text-[10px] text-slate-600 font-semibold uppercase font-sans">Tails</div>
            <div className="text-lg font-black font-mono text-slate-600 dark:text-slate-400">{stats.tails} <span className="text-[10px] font-normal text-gray-400">({tailsPercent}%)</span></div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleFlip}
        disabled={isFlipping}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gray-950 dark:bg-white text-white dark:text-gray-950 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-xl font-semibold text-sm transition-all shadow-xs cursor-pointer active:scale-[0.98] disabled:opacity-50"
        id="btn-flip-coin-action"
      >
        <RefreshCw size={16} className={isFlipping ? "animate-spin" : ""} />
        {isFlipping ? "Flipping..." : "Flip Coin"}
      </button>
    </div>
  );
}
