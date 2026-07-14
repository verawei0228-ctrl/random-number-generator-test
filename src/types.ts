/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GeneratorType = 'single' | 'batch' | 'dice' | 'coin' | 'list';

export interface HistoryItem {
  id: string;
  timestamp: string;
  type: GeneratorType;
  title: string;
  parameters: string;
  result: string;
}

export interface SingleConfig {
  min: number;
  max: number;
  decimalPlaces: number;
}

export interface BatchConfig {
  min: number;
  max: number;
  count: number;
  allowDuplicates: boolean;
  sorted: 'none' | 'asc' | 'desc';
}

export interface DiceConfig {
  dieType: 4 | 6 | 8 | 10 | 12 | 20 | 100;
  count: number;
  modifier: number;
}

export interface ListConfig {
  itemsRaw: string;
  drawCount: number;
  allowDuplicates: boolean;
}

export interface CoinStats {
  heads: number;
  tails: number;
  total: number;
}
