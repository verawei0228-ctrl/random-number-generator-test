/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Generates a random number in the range [min, max]
 * @param min Minimum value
 * @param max Maximum value
 * @param decimalPlaces Number of decimal places (0 for integers)
 * @param useSecure Use window.crypto for random generation
 */
export function generateRandomNumber(
  min: number,
  max: number,
  decimalPlaces: number = 0,
  useSecure: boolean = false
): number {
  let rand = 0;
  if (useSecure && typeof window !== 'undefined' && window.crypto) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    rand = array[0] / (0xffffffff + 1);
  } else {
    rand = Math.random();
  }

  const factor = Math.pow(10, decimalPlaces);
  const val = rand * (max - min) + min;
  return Math.round(val * factor) / factor;
}

/**
 * Generates an array of random numbers in the range [min, max]
 * @param min Minimum value
 * @param max Maximum value
 * @param count Quantity of numbers to generate
 * @param allowDuplicates Whether duplicate numbers are allowed
 * @param decimalPlaces Decimal places
 * @param useSecure Cryptographic random
 */
export function generateRandomBatch(
  min: number,
  max: number,
  count: number,
  allowDuplicates: boolean,
  decimalPlaces: number = 0,
  useSecure: boolean = false
): number[] {
  const results: number[] = [];
  const rangeSize = max - min + 1;
  
  // If no duplicates allowed and range is smaller than count, we clamp count or allow duplicates
  const actualCount = (!allowDuplicates && decimalPlaces === 0) 
    ? Math.min(count, Math.floor(rangeSize)) 
    : count;

  if (!allowDuplicates && decimalPlaces === 0) {
    const pool = new Set<number>();
    let attempts = 0;
    const maxAttempts = actualCount * 10;
    
    while (pool.size < actualCount && attempts < maxAttempts) {
      const num = generateRandomNumber(min, max, 0, useSecure);
      pool.add(num);
      attempts++;
    }

    // Fallback if pool is still too small (e.g., due to random collisions)
    if (pool.size < actualCount) {
      for (let i = Math.floor(min); i <= Math.floor(max) && pool.size < actualCount; i++) {
        pool.add(i);
      }
    }
    return Array.from(pool);
  }

  for (let i = 0; i < actualCount; i++) {
    results.push(generateRandomNumber(min, max, decimalPlaces, useSecure));
  }
  return results;
}

/**
 * Format timestamp nicely
 */
export function getFormattedTime(): string {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
