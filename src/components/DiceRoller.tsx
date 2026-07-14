/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dices, RefreshCw } from 'lucide-react';
import { generateRandomNumber, getFormattedTime } from '../utils';
import { HistoryItem } from '../types';

interface DiceRollerProps {
  useSecure: boolean;
  onAddHistory: (item: HistoryItem) => void;
}

const DIE_TYPES = [
  { label: 'd4', value: 4, shape: 'Polygon (Triangle)' },
  { label: 'd6', value: 6, shape: 'Square (Cube)' },
  { label: 'd8', value: 8, shape: 'Diamond (Octahedron)' },
  { label: 'd10', value: 10, shape: 'Kite (Decahedron)' },
  { label: 'd12', value: 12, shape: 'Pentagon (Dodecahedron)' },
  { label: 'd20', value: 20, shape: 'Triangle (Icosahedron)' },
  { label: 'd100', value: 100, shape: 'Circle (Percentile)' },
];

export default function DiceRoller({ useSecure, onAddHistory }: DiceRollerProps) {
  const [dieType, setDieType] = useState<number>(6);
  const [count, setCount] = useState<number>(2);
  const [modifier, setModifier] = useState<number>(0);
  const [rolls, setRolls] = useState<number[]>([]);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [rollingDice, setRollingDice] = useState<number[]>([]);

  const handleRoll = () => {
    setIsRolling(true);
    let duration = 600; // ms
    let intervalTime = 50; // ms
    let elapsed = 0;

    const timer = setInterval(() => {
      // Simulate random dice results during roll
      const tempRolls = Array.from({ length: count }, () => 
        generateRandomNumber(1, dieType, 0, false)
      );
      setRollingDice(tempRolls);
      elapsed += intervalTime;

      if (elapsed >= duration) {
        clearInterval(timer);
        const finalRolls = Array.from({ length: count }, () => 
          generateRandomNumber(1, dieType, 0, useSecure)
        );
        setRolls(finalRolls);
        setIsRolling(false);

        // Add to history
        const sum = finalRolls.reduce((acc, r) => acc + r, 0);
        const total = sum + modifier;
        const id = Math.random().toString(36).substr(2, 9);
        const paramStr = `${count}d${dieType} ${modifier >= 0 ? '+' : ''}${modifier}`;
        const rollsStr = `[${finalRolls.join(', ')}]${modifier !== 0 ? ` + modifier (${modifier})` : ''}`;
        
        const newHistory: HistoryItem = {
          id,
          timestamp: getFormattedTime(),
          type: 'dice',
          title: `Roll ${count}d${dieType}`,
          parameters: paramStr,
          result: `Total: ${total} (${rollsStr})`,
        };
        onAddHistory(newHistory);
      }
    }, intervalTime);
  };

  const currentSum = rolls.reduce((acc, r) => acc + r, 0);
  const totalValue = currentSum + modifier;

  return (
    <div className="space-y-6" id="dice-roller-container">
      {/* Visual Dice Tray */}
      <div 
        className="relative flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 min-h-[220px] transition-all overflow-hidden"
        id="dice-result-screen"
      >
        <div className="absolute top-3 left-3 text-xs font-mono text-gray-400 uppercase tracking-widest">
          Dice Tray
        </div>

        <AnimatePresence mode="wait">
          {isRolling ? (
            <motion.div 
              key="rolling"
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.8 }}
              className="flex flex-wrap justify-center gap-4"
              id="dice-rolling-display"
            >
              {rollingDice.map((val, idx) => (
                <motion.div
                  key={idx}
                  animate={{ rotate: [0, 90, 180, 270, 360], scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.2, repeat: Infinity, ease: "linear" }}
                  className="w-14 h-14 flex items-center justify-center bg-white dark:bg-zinc-800 border-2 border-gray-300 dark:border-zinc-700 rounded-xl shadow-xs text-xl font-bold font-mono text-gray-400"
                >
                  {val}
                </motion.div>
              ))}
            </motion.div>
          ) : rolls.length > 0 ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center w-full space-y-5"
              id="dice-result-display"
            >
              {/* Individual Dice */}
              <div className="flex flex-wrap justify-center gap-4 py-2" id="individual-dice-grid">
                {rolls.map((val, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: idx * 0.05 }}
                    className="relative w-14 h-14 flex items-center justify-center bg-white dark:bg-zinc-800 border-2 border-gray-950 dark:border-white rounded-xl shadow-xs text-xl font-black font-mono text-gray-950 dark:text-white"
                  >
                    {val}
                    <span className="absolute bottom-1 right-1.5 text-[8px] font-mono font-normal text-gray-400 dark:text-zinc-500">
                      #{idx + 1}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Formula and Grand Total */}
              <div className="flex flex-col items-center border-t border-gray-200/50 dark:border-zinc-800 w-full pt-4 max-w-sm text-center" id="dice-total-box">
                <span className="text-xs font-mono text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                  Formula: {currentSum} {modifier >= 0 ? `+ ${modifier}` : `- ${Math.abs(modifier)}`}
                </span>
                <span className="text-4xl md:text-5xl font-black font-mono tracking-tight text-gray-950 dark:text-white">
                  Total: {totalValue}
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-400 dark:text-zinc-500 max-w-xs"
              id="dice-placeholder"
            >
              <Dices className="mx-auto mb-2 text-gray-300 dark:text-zinc-700 animate-bounce" size={36} />
              <p className="text-sm font-medium">Roll the dice to see results</p>
              <p className="text-xs mt-1 text-gray-400">Select dice configuration below</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Die Type Selectors */}
      <div className="space-y-2" id="die-selector-group">
        <label className="text-xs font-semibold text-gray-600 dark:text-zinc-400">
          Select Die Shape
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2" id="die-buttons-grid">
          {DIE_TYPES.map((die) => (
            <button
              key={die.value}
              onClick={() => setDieType(die.value)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer shadow-2xs ${
                dieType === die.value
                  ? 'bg-gray-950 dark:bg-white text-white dark:text-gray-950 border-gray-950 dark:border-white ring-2 ring-gray-950/25 dark:ring-white/25'
                  : 'bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700/80 border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-zinc-200'
              }`}
              id={`die-btn-${die.label}`}
              title={die.shape}
            >
              <span className="text-sm font-black font-mono">{die.label.toUpperCase()}</span>
              <span className="text-[9px] opacity-70 font-mono mt-0.5">{die.value} sides</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Adjustments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="dice-quantities-row">
        <div className="flex flex-col space-y-1.5">
          <label htmlFor="dice-count" className="text-xs font-semibold text-gray-600 dark:text-zinc-400">
            Number of Dice (1-10)
          </label>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setCount(Math.max(1, count - 1))}
              className="w-10 h-10 flex items-center justify-center bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl font-bold cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300"
              id="dice-count-dec"
            >
              -
            </button>
            <input
              id="dice-count"
              type="number"
              min={1}
              max={10}
              value={count}
              onChange={(e) => setCount(Math.min(10, Math.max(1, Number(e.target.value))))}
              className="w-full h-10 text-center bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-hidden font-mono text-gray-900 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setCount(Math.min(10, count + 1))}
              className="w-10 h-10 flex items-center justify-center bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl font-bold cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300"
              id="dice-count-inc"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex flex-col space-y-1.5">
          <label htmlFor="dice-modifier" className="text-xs font-semibold text-gray-600 dark:text-zinc-400">
            Roll Modifier (+/-)
          </label>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setModifier(modifier - 1)}
              className="w-10 h-10 flex items-center justify-center bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl font-bold cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300"
              id="dice-mod-dec"
            >
              -
            </button>
            <input
              id="dice-modifier"
              type="number"
              value={modifier}
              onChange={(e) => setModifier(Number(e.target.value))}
              className="w-full h-10 text-center bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-hidden font-mono text-gray-900 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setModifier(modifier + 1)}
              className="w-10 h-10 flex items-center justify-center bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl font-bold cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300"
              id="dice-mod-inc"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Roll Action Button */}
      <button
        onClick={handleRoll}
        disabled={isRolling}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gray-950 dark:bg-white text-white dark:text-gray-950 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-xl font-semibold text-sm transition-all shadow-xs cursor-pointer active:scale-[0.98] disabled:opacity-50"
        id="btn-roll-dice"
      >
        <RefreshCw size={16} className={isRolling ? "animate-spin" : ""} />
        {isRolling ? "Rolling..." : `Roll ${count}d${dieType} ${modifier >= 0 ? '+' : ''}${modifier}`}
      </button>
    </div>
  );
}
