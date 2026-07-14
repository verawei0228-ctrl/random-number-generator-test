/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Hash, 
  Dices, 
  Coins, 
  Clipboard, 
  ListFilter, 
  Sun, 
  Moon, 
  Laptop,
  ShieldAlert,
  Github
} from 'lucide-react';
import { HistoryItem, GeneratorType } from './types';
import SingleGenerator from './components/SingleGenerator';
import BatchGenerator from './components/BatchGenerator';
import DiceRoller from './components/DiceRoller';
import CoinFlipper from './components/CoinFlipper';
import ListPicker from './components/ListPicker';
import HistoryPanel from './components/HistoryPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState<GeneratorType>('single');
  const [useSecure, setUseSecure] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('rng_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('rng_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('rng_theme', theme);
  }, [theme]);

  // Persist History
  useEffect(() => {
    localStorage.setItem('rng_history', JSON.stringify(history));
  }, [history]);

  const addHistoryItem = (item: HistoryItem) => {
    setHistory((prev) => [item, ...prev]);
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your full history log?")) {
      setHistory([]);
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 font-sans transition-colors duration-200 py-6 px-4 sm:px-6 md:px-8" id="app-root">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation & Header Header */}
        <header className="flex items-center justify-between border-b border-gray-200/65 dark:border-zinc-800 pb-5" id="app-header">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-xl shadow-xs flex items-center justify-center">
              <Dices size={24} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-2xl font-sans">
                QuantuRNG
              </h1>
              <p className="text-xs text-gray-400 font-medium">
                Cryptographically secure high-precision generation engine
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2" id="header-action-panel">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-zinc-800 transition-all cursor-pointer shadow-2xs"
              id="theme-toggle"
              title={theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </header>

        {/* Informational Alert if Secure Random fails/unavailable */}
        {useSecure && typeof window !== 'undefined' && !window.crypto && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-300 rounded-xl text-xs flex items-center gap-2" id="crypto-warning">
            <ShieldAlert size={16} className="shrink-0" />
            <span>Web Cryptography API is unsupported in this browser environment. Standard Math.random will be used as a fallback.</span>
          </div>
        )}

        {/* Dashboard Bento Grid Layout */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-grid">
          
          {/* Left Column: Selector + Active Module (Occupies 2 cols on wide) */}
          <section className="lg:col-span-2 space-y-6 flex flex-col h-full" id="generators-column">
            {/* Main Segmented Control Tabs */}
            <div 
              className="grid grid-cols-5 p-1 bg-gray-150/80 dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800/80 rounded-2xl shadow-2xs"
              id="segmented-tab-selector"
            >
              <button
                onClick={() => setActiveTab('single')}
                className={`py-2.5 px-1 sm:px-3 rounded-xl text-[10px] sm:text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'single'
                    ? 'bg-white dark:bg-zinc-800 text-gray-950 dark:text-white shadow-xs'
                    : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                id="tab-single"
              >
                <Hash size={15} />
                <span className="hidden sm:inline">Single Number</span>
                <span className="sm:hidden">Single</span>
              </button>

              <button
                onClick={() => setActiveTab('batch')}
                className={`py-2.5 px-1 sm:px-3 rounded-xl text-[10px] sm:text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'batch'
                    ? 'bg-white dark:bg-zinc-800 text-gray-950 dark:text-white shadow-xs'
                    : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                id="tab-batch"
              >
                <ListFilter size={15} />
                <span className="hidden sm:inline">Batch Generation</span>
                <span className="sm:hidden">Batch</span>
              </button>

              <button
                onClick={() => setActiveTab('dice')}
                className={`py-2.5 px-1 sm:px-3 rounded-xl text-[10px] sm:text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'dice'
                    ? 'bg-white dark:bg-zinc-800 text-gray-950 dark:text-white shadow-xs'
                    : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                id="tab-dice"
              >
                <Dices size={15} />
                <span className="hidden sm:inline">Dice Roller</span>
                <span className="sm:hidden">Dice</span>
              </button>

              <button
                onClick={() => setActiveTab('coin')}
                className={`py-2.5 px-1 sm:px-3 rounded-xl text-[10px] sm:text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'coin'
                    ? 'bg-white dark:bg-zinc-800 text-gray-950 dark:text-white shadow-xs'
                    : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                id="tab-coin"
              >
                <Coins size={15} />
                <span className="hidden sm:inline">Coin Flipper</span>
                <span className="sm:hidden">Coin</span>
              </button>

              <button
                onClick={() => setActiveTab('list')}
                className={`py-2.5 px-1 sm:px-3 rounded-xl text-[10px] sm:text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'list'
                    ? 'bg-white dark:bg-zinc-800 text-gray-950 dark:text-white shadow-xs'
                    : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                id="tab-list"
              >
                <Clipboard size={15} />
                <span className="hidden sm:inline">List Picker</span>
                <span className="sm:hidden">Draw</span>
              </button>
            </div>

            {/* Active Generator Container Card */}
            <div 
              className="flex-1 bg-white dark:bg-zinc-900 border border-gray-200/70 dark:border-zinc-800/70 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col justify-between"
              id="active-generator-card"
            >
              {activeTab === 'single' && (
                <SingleGenerator 
                  useSecure={useSecure} 
                  setUseSecure={setUseSecure} 
                  onAddHistory={addHistoryItem} 
                />
              )}
              {activeTab === 'batch' && (
                <BatchGenerator 
                  useSecure={useSecure} 
                  onAddHistory={addHistoryItem} 
                />
              )}
              {activeTab === 'dice' && (
                <DiceRoller 
                  useSecure={useSecure} 
                  onAddHistory={addHistoryItem} 
                />
              )}
              {activeTab === 'coin' && (
                <CoinFlipper 
                  useSecure={useSecure} 
                  onAddHistory={addHistoryItem} 
                />
              )}
              {activeTab === 'list' && (
                <ListPicker 
                  useSecure={useSecure} 
                  onAddHistory={addHistoryItem} 
                />
              )}
            </div>
          </section>

          {/* Right Column: History / Action Logs (Occupies 1 col) */}
          <section className="bg-white dark:bg-zinc-900 border border-gray-200/70 dark:border-zinc-800/70 rounded-2xl p-5 shadow-xs flex flex-col h-full" id="history-column">
            <HistoryPanel history={history} onClearHistory={clearHistory} />
          </section>

        </main>

        {/* Footer */}
        <footer className="text-center py-6 text-xs text-gray-400 font-mono border-t border-gray-150 dark:border-zinc-800 space-y-1.5" id="app-footer">
          <div>QuantuRNG • High-Precision Computational Generator</div>
          <div className="text-[10px] opacity-75">Designed utilizing modern vector rendering frameworks & native security modules.</div>
        </footer>

      </div>
    </div>
  );
}
