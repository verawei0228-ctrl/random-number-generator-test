/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Shield, ShieldCheck, Sparkles } from 'lucide-react';
import { generateRandomNumber, getFormattedTime } from '../utils';
import { HistoryItem } from '../types';

interface SingleGeneratorProps {
  useSecure: boolean;
  setUseSecure: (val: boolean) => void;
  onAddHistory: (item: HistoryItem) => void;
}

export default function SingleGenerator({
  useSecure,
  setUseSecure,
  onAddHistory,
}: SingleGeneratorProps) {
  const [min, setMin] = useState<number>(1);
  const [max, setMax] = useState<number>(100);
  const [decimals, setDecimals] = useState<number>(0);
  const [result, setResult] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [rollingValue, setRollingValue] = useState<number>(0);

  // Quick preset sets
  const applyPreset = (presetMin: number, presetMax: number, presetDecimals: number = 0) => {
    setMin(presetMin);
    setMax(presetMax);
    setDecimals(presetDecimals);
  };

  const handleGenerate = () => {
    if (min >= max) {
      alert("Minimum value must be strictly less than maximum value.");
      return;
    }

    setIsRolling(true);
    let duration = 600; // ms
    let intervalTime = 40; // ms
    let elapsed = 0;

    const timer = setInterval(() => {
      // Show pseudo-random items while rolling
      const temp = generateRandomNumber(min, max, decimals, false);
      setRollingValue(temp);
      elapsed += intervalTime;

      if (elapsed >= duration) {
        clearInterval(timer);
        const finalVal = generateRandomNumber(min, max, decimals, useSecure);
        setResult(finalVal);
        setIsRolling(false);

        // Add to history
        const id = Math.random().toString(36).substr(2, 9);
        const paramStr = `Min: ${min}, Max: ${max}, Decimals: ${decimals}${useSecure ? ' (Secure)' : ''}`;
        const newHistory: HistoryItem = {
          id,
          timestamp: getFormattedTime(),
          type: 'single',
          title: 'Single Number',
          parameters: paramStr,
          result: finalVal.toString(),
        };
        onAddHistory(newHistory);
      }
    }, intervalTime);
  };

  return (
    <div className="space-y-6" id="single-generator-container">
      {/* Visual Result Display */}
      <div 
        className="relative flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-8 min-h-[220px] transition-all overflow-hidden"
        id="single-result-screen"
      >
        <div className="absolute top-3 left-3 text-xs font-mono text-gray-400 uppercase tracking-widest">
          Result Screen
        </div>
        
        {useSecure && (
          <div className="absolute top-3 right-3 flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full text-[10px] font-mono border border-emerald-100 dark:border-emerald-900/40">
            <ShieldCheck size={12} />
            <span>Secure Mode</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {isRolling ? (
            <motion.div
              key="rolling"
              initial={{ opacity: 0.8, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1.05 }}
              exit={{ opacity: 0.8, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="text-6xl md:text-7xl font-bold font-mono tracking-tight text-gray-700 dark:text-zinc-300"
              id="rolling-number-display"
            >
              {rollingValue.toFixed(decimals)}
            </motion.div>
          ) : result !== null ? (
            <motion.div
              key="result"
              initial={{ y: 20, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex flex-col items-center"
              id="final-number-display"
            >
              <span className="text-6xl md:text-7xl font-black font-mono tracking-tight text-gray-950 dark:text-white">
                {result.toFixed(decimals)}
              </span>
              <span className="mt-2 text-xs font-mono text-gray-400">
                Generated at {getFormattedTime()}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-400 dark:text-zinc-500 max-w-xs"
              id="placeholder-display"
            >
              <Sparkles className="mx-auto mb-2 text-gray-300 dark:text-zinc-700" size={32} />
              <p className="text-sm font-medium">Click Generate to spin a random number</p>
              <p className="text-xs mt-1 text-gray-400">Configure parameters below first</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preset Quick Actions */}
      <div className="flex flex-wrap gap-2 items-center justify-center" id="quick-presets-section">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider mr-1">Presets:</span>
        <button
          onClick={() => applyPreset(1, 10)}
          className="px-3 py-1 text-xs font-medium bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-700 dark:text-zinc-300 shadow-xs transition-colors cursor-pointer"
          id="preset-1-10"
        >
          1 – 10
        </button>
        <button
          onClick={() => applyPreset(1, 100)}
          className="px-3 py-1 text-xs font-medium bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-700 dark:text-zinc-300 shadow-xs transition-colors cursor-pointer"
          id="preset-1-100"
        >
          1 – 100
        </button>
        <button
          onClick={() => applyPreset(1, 1000)}
          className="px-3 py-1 text-xs font-medium bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-700 dark:text-zinc-300 shadow-xs transition-colors cursor-pointer"
          id="preset-1-1000"
        >
          1 – 1,000
        </button>
        <button
          onClick={() => applyPreset(0, 1, 2)}
          className="px-3 py-1 text-xs font-medium bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-700 dark:text-zinc-300 shadow-xs transition-colors cursor-pointer"
          id="preset-decimals"
        >
          0.00 – 1.00
        </button>
      </div>

      {/* Configuration Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="single-config-inputs">
        <div className="flex flex-col space-y-1.5">
          <label htmlFor="input-min" className="text-xs font-semibold text-gray-600 dark:text-zinc-400">
            Minimum (Min)
          </label>
          <input
            id="input-min"
            type="number"
            value={min}
            onChange={(e) => setMin(Number(e.target.value))}
            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-shadow text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <label htmlFor="input-max" className="text-xs font-semibold text-gray-600 dark:text-zinc-400">
            Maximum (Max)
          </label>
          <input
            id="input-max"
            type="number"
            value={max}
            onChange={(e) => setMax(Number(e.target.value))}
            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-shadow text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <label htmlFor="input-decimals" className="text-xs font-semibold text-gray-600 dark:text-zinc-400">
            Decimal Places
          </label>
          <select
            id="input-decimals"
            value={decimals}
            onChange={(e) => setDecimals(Number(e.target.value))}
            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-shadow text-gray-900 dark:text-white"
          >
            <option value={0}>0 (Integers)</option>
            <option value={1}>1 decimal (0.0)</option>
            <option value={2}>2 decimals (0.00)</option>
            <option value={3}>3 decimals (0.000)</option>
            <option value={4}>4 decimals (0.0000)</option>
            <option value={5}>5 decimals (0.00000)</option>
            <option value={6}>6 decimals (0.000000)</option>
          </select>
        </div>
      </div>

      {/* Advanced Toggles */}
      <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-zinc-900/50 rounded-xl border border-gray-100 dark:border-zinc-800" id="single-security-panel">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400">
            {useSecure ? <ShieldCheck className="text-emerald-600 dark:text-emerald-400 animate-pulse" size={18} /> : <Shield size={18} />}
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-800 dark:text-zinc-200">
              Cryptographic Security
            </div>
            <div className="text-[10px] text-gray-500 dark:text-zinc-400">
              Uses high-entropy API for cryptographic strength random values
            </div>
          </div>
        </div>
        <button
          onClick={() => setUseSecure(!useSecure)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
            useSecure ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-zinc-700'
          }`}
          id="toggle-crypto-security"
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              useSecure ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Action Button */}
      <button
        onClick={handleGenerate}
        disabled={isRolling}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gray-950 dark:bg-white text-white dark:text-gray-950 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-xl font-semibold text-sm transition-all shadow-xs cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        id="btn-generate-single"
      >
        <RefreshCw size={16} className={isRolling ? "animate-spin" : ""} />
        {isRolling ? "Rolling..." : "Generate Random Number"}
      </button>
    </div>
  );
}
