/**
 * Roulette Constants
 */

import { RouletteColor } from '../types';

// Number colors
export const RED_NUMBERS: number[] = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
];

export const BLACK_NUMBERS: number[] = [
  2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35
];

// European wheel order (clockwise from 0)
export const WHEEL_ORDER: number[] = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

/**
 * Get color for a number
 */
export function getNumberColor(num: number): RouletteColor {
  if (num === 0) return 'green';
  if (RED_NUMBERS.includes(num)) return 'red';
  return 'black';
}

/**
 * Get hex color for display
 */
export function getColorHex(color: RouletteColor): number {
  switch (color) {
    case 'red': return 0xB00000;   // Deep Casino Red
    case 'black': return 0x000000; // Pure Black
    case 'green': return 0x008000; // Deep Green
  }
}

/**
 * Column definitions
 */
export const COLUMNS: Record<1 | 2 | 3, number[]> = {
  1: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
  2: [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
  3: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
};

/**
 * Dozen definitions
 */
export const DOZENS: Record<1 | 2 | 3, number[]> = {
  1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  2: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
  3: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
};

// Low/High
export const LOW_NUMBERS: number[] = Array.from({ length: 18 }, (_, i) => i + 1);
export const HIGH_NUMBERS: number[] = Array.from({ length: 18 }, (_, i) => i + 19);

// Odd/Even
export const ODD_NUMBERS: number[] = Array.from({ length: 36 }, (_, i) => i + 1).filter(n => n % 2 === 1);
export const EVEN_NUMBERS: number[] = Array.from({ length: 36 }, (_, i) => i + 1).filter(n => n % 2 === 0);

// Chip values
export const CHIP_VALUES = [1, 5, 10, 25, 100] as const;
export type ChipValue = typeof CHIP_VALUES[number];

// Betting limits (must match backend)
export const MIN_BET = 1;
export const MAX_BET = 500;
